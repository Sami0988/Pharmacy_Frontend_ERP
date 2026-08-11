'use client';

import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useTranslations } from '@/lib/i18n';
import type { RevenueTrendPoint } from '@/types/api';

interface MetricTabChartProps {
  data: RevenueTrendPoint[];
  isLoading?: boolean;
}

const TAB_CONFIG = [
  {
    value: 'revenue',
    labelKey: 'dashboard.revenue',
    color: '#2563eb',
    format: (value: number | undefined) => `${(value ?? 0).toLocaleString()}`,
  },
  {
    value: 'profit',
    labelKey: 'dashboard.profit',
    color: '#16a34a',
    format: (value: number | undefined) => `${(value ?? 0).toLocaleString()}`,
  },
  {
    value: 'expenses',
    labelKey: 'dashboard.expenses',
    color: '#f59e0b',
    format: (value: number | undefined) => `${(value ?? 0).toLocaleString()}`,
  },
  {
    value: 'creditSales',
    labelKey: 'dashboard.creditSales',
    color: '#9333ea',
    format: (value: number | undefined) => `${(value ?? 0).toLocaleString()}`,
  },
];

export function MetricTabChart({ data }: MetricTabChartProps) {
  const { t } = useTranslations();
  const [activeTab, setActiveTab] = useState(TAB_CONFIG[0].value);

  const tabs = useMemo(
    () => TAB_CONFIG.map((tab) => ({ ...tab, label: t(tab.labelKey) })),
    [t],
  );

  const selectedTab = useMemo(
    () => tabs.find((tab) => tab.value === activeTab) ?? tabs[0],
    [activeTab, tabs],
  );

  const chartData = useMemo(
    () =>
      data.map((point) => ({
        month: point.month,
        value: point[selectedTab.value as keyof RevenueTrendPoint] as number,
      })),
    [data, selectedTab.value],
  );

  const latestValue = data.length > 0 ? chartData[chartData.length - 1]?.value ?? 0 : 0;

  return (
    <Card className="rounded-3xl shadow-soft">
      <CardHeader className="space-y-4 border-b border-border pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="text-lg">{t('dashboard.monthlyRevenuePerformance')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('dashboard.metricTabDescription')}</p>
          </div>
          <div className="flex flex-nowrap items-center gap-3 overflow-x-auto py-1">
            {tabs.map((tab) => (
              <Button
                key={tab.value}
                variant={activeTab === tab.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab(tab.value)}
                className="flex-shrink-0"
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="rounded-3xl bg-muted p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t('dashboard.current')} {selectedTab.label}</p>
              <p className="mt-1 text-3xl font-semibold text-foreground">{selectedTab.format(latestValue)}</p>
            </div>
            <div className="rounded-2xl bg-white/90 px-4 py-3 text-sm font-semibold text-foreground shadow-sm dark:bg-slate-950/65">
              {selectedTab.label}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.12} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => (value >= 1000 ? `${Math.round(value / 1000)}k` : `${value}`)} />
              <Tooltip
                formatter={(value) => [selectedTab.format(Number(value ?? 0)), selectedTab.label]}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid rgba(148,163,184,0.2)',
                  boxShadow: '0 10px 30px rgba(15,23,42,0.08)',
                  fontSize: 13,
                }}
              />
              <Line type="monotone" dataKey="value" stroke={selectedTab.color} strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
