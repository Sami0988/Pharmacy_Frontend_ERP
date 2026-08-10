'use client';

import { useAuth } from '@/lib/auth/use-auth';
import { useTranslations } from '@/lib/i18n';
import {
  useGetSummaryQuery,
  useGetReorderSuggestionsQuery,
  useGetInventoryCountsQuery,
  useGetCategoryBreakdownQuery,
  useGetRevenueTrendQuery,
  useGetSparklinesQuery,
} from '@/store/api/dashboard-api-slice';
import { useGetNotificationSummaryQuery } from '@/store/api/notifications-api-slice';
import { useGetSalesQuery } from '@/store/api/sales-api-slice';
import { StatCardWithSparkline } from '@/components/dashboard-ui/StatCardWithSparkline';
import { GreetingBanner } from '@/components/dashboard-ui/GreetingBanner';
import { MetricTabChart } from '@/components/dashboard-ui/MetricTabChart';
import { CategoryDonutChart } from '@/components/dashboard-ui/CategoryDonutChart';
import { ActionIconGroup } from '@/components/dashboard-ui/ActionIconGroup';
import { Package, AlertTriangle, Clock, Users, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { DataTable, Column } from '@/components/ui/DataTable';
import { motion } from 'motion/react';
import type { Sale } from '@/types/api';

const saleColumns: Column<Sale>[] = [
  {
    key: 'saleNumber',
    header: 'Sale #',
    render: (sale) => (
      <span className="text-sm font-medium text-foreground">
        #{sale.saleNumber || sale.id.slice(-6).toUpperCase()}
      </span>
    ),
  },
  {
    key: 'customerName',
    header: 'Customer',
    render: (sale) => (
      <span className="text-sm text-muted-foreground">
        {sale.customerName || 'Walk-in'}
      </span>
    ),
  },
  {
    key: 'totalAmount',
    header: 'Total',
    render: (sale) => (
      <span className="text-sm font-medium text-foreground">
        {sale.totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'ETB' })}
      </span>
    ),
  },
  {
    key: 'paymentMethod',
    header: 'Payment',
    render: (sale) => (
      <span className="text-sm text-muted-foreground capitalize">
        {sale.paymentMethod}
      </span>
    ),
  },
  {
    key: 'actions',
    header: '',
    render: (sale) => (
      <ActionIconGroup
        actions={[
          { icon: 'view', href: `/sales/${sale.id}`, label: 'View' },
          { icon: 'print', label: 'Print', onClick: () => window.print() },
        ]}
      />
    ),
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useTranslations();

  const { data: summary, isLoading: summaryLoading } = useGetSummaryQuery();
  const { data: reorderSuggestions, isLoading: reorderLoading } = useGetReorderSuggestionsQuery({});
  const { data: inventoryCounts, isLoading: inventoryLoading } = useGetInventoryCountsQuery();
  const { data: categoryBreakdown, isLoading: categoryLoading } = useGetCategoryBreakdownQuery();
  const { data: revenueTrend, isLoading: revenueLoading } = useGetRevenueTrendQuery({ months: 6 });
  const { data: sparklineSeries, isLoading: sparklineLoading } = useGetSparklinesQuery({ days: 14 });
  const { data: notifSummary } = useGetNotificationSummaryQuery();
  const { data: salesResponse, isLoading: salesLoading } = useGetSalesQuery({});
  const sales = salesResponse?.data ?? [];

  const inventory = inventoryCounts ?? { totalProducts: 0, lowStockCount: 0, outOfStockCount: 0, totalStock: 0 };
  const categories = categoryBreakdown ?? [];
  const trends = revenueTrend ?? [];
  const sparklines = sparklineSeries ?? [];

  const todaySales = summary?.todaySales ?? { totalAmount: 0, transactionCount: 0 };
  const todayProfit = summary?.todayProfit ?? { estimatedProfit: 0, margin: 0 };
  const latestSales = (sales || [])
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const auditEntriesLast14Days = sparklines.reduce((sum, point) => sum + point.auditEntries, 0);

  const greetingTime = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.goodMorning');
    if (hour < 18) return t('dashboard.goodAfternoon');
    return t('dashboard.goodEvening');
  })();

  return (
    <div className="space-y-6">
       <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
        <GreetingBanner
          title={`${greetingTime}, ${user?.name ?? t('dashboard.admin')} 👋`}
          statusText="All systems operational"
          description="Monitor inventory levels, track medicine sales, manage prescriptions, and ensure smooth pharmacy operations from one centralized dashboard."
          transactionCount={todaySales.transactionCount}
          compliance={summary?.compliance ?? '98%'}
          primaryActionHref="/reports"
          primaryActionLabel="Generate Report"
          secondaryActionHref="/items/new"
          secondaryActionLabel="Add Medicine"
        />
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCardWithSparkline
          title={t('dashboard.todaysSales')}
          value={todaySales.totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'ETB' })}
          icon={DollarSign}
          sparklineData={sparklines.map((point) => ({ date: point.date, value: point.sales }))}
          sparklineLabel={t('dashboard.sales')}
          subtitle={`${todaySales.transactionCount} ${t('dashboard.transactions')}`}
          isLoading={summaryLoading || sparklineLoading}
          index={0}
        />
        <StatCardWithSparkline
          title={t('dashboard.estimatedProfit')}
          value={todayProfit.estimatedProfit.toLocaleString('en-US', { style: 'currency', currency: 'ETB' })}
          icon={DollarSign}
          sparklineData={sparklines.map((point) => ({ date: point.date, value: point.profit }))}
          sparklineLabel={t('dashboard.profit')}
          subtitle={t('dashboard.estimatedProfit')}
          isLoading={summaryLoading || sparklineLoading}
          index={1}
        />
        <StatCardWithSparkline
          title={t('dashboard.medicinesInStock')}
          value={inventory.totalProducts}
          icon={Package}
          sparklineData={sparklines.map((point) => ({ date: point.date, value: point.stockOnHand }))}
          sparklineLabel={t('dashboard.stockOnHand')}
          subtitle={t('inventory.currentStock')}
          isLoading={inventoryLoading || sparklineLoading}
          index={2}
        />
        <StatCardWithSparkline
          title={t('dashboard.lowStockAlerts')}
          value={reorderSuggestions?.length ?? 0}
          icon={AlertTriangle}
          sparklineData={sparklines.map((point) => ({ date: point.date, value: point.lowStockAlerts }))}
          sparklineLabel={t('dashboard.lowStock')}
          subtitle={t('dashboard.lowStockAlerts')}
          isLoading={reorderLoading || sparklineLoading}
          index={3}
        />
        <StatCardWithSparkline
          title={t('dashboard.expiringSoon')}
          value={(notifSummary?.nearExpiry ?? 0) + (notifSummary?.expired ?? 0)}
          icon={Clock}
          sparklineData={sparklines.map((point) => ({ date: point.date, value: point.expiringSoonAlerts }))}
          sparklineLabel={t('dashboard.expiringSoon')}
          subtitle={t('dashboard.expiringSoon')}
          isLoading={sparklineLoading}
          index={4}
        />
        <StatCardWithSparkline
          title={t('dashboard.auditEntries')}
          value={auditEntriesLast14Days}
          icon={Users}
          sparklineData={sparklines.map((point) => ({ date: point.date, value: point.auditEntries }))}
          sparklineLabel={t('dashboard.auditEntries')}
          subtitle={t('dashboard.auditEntriesLast14Days')}
          isLoading={sparklineLoading}
          index={5}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <MetricTabChart data={trends} isLoading={revenueLoading} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          <CategoryDonutChart data={categories} isLoading={categoryLoading} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <Card className="rounded-3xl">
          <CardHeader className="border-b border-border">
            <h3 className="text-base font-semibold text-foreground">{t('dashboard.latestSales')}</h3>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={saleColumns}
              data={latestSales}
              isLoading={salesLoading}
              keyExtractor={(s) => s.id}
              emptyMessage={t('dashboard.noLatestSales')}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
