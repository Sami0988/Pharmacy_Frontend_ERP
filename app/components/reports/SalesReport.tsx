'use client';

import { useState } from 'react';
import { DollarSign, TrendingUp, ShoppingCart, Receipt, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { useGetSalesReportQuery } from '@/store/api/reports-api-slice';
import { downloadTablePdf } from '@/lib/pdf';
import { motion } from 'motion/react';
import type { SalesReportLine } from '@/types/api';

type DateRange = 'today' | '7d' | '30d' | 'all';

function getDateRange(range: DateRange): { startDate?: string; endDate?: string } {
  if (range === 'all') return {};
  const now = new Date();
  const endDate = now.toISOString().split('T')[0];
  let startDate: string;
  if (range === 'today') {
    startDate = endDate;
  } else if (range === '7d') {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    startDate = d.toISOString().split('T')[0];
  } else {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    startDate = d.toISOString().split('T')[0];
  }
  return { startDate, endDate };
}

const formatETB = (value: number) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'ETB' });

const columns: Column<SalesReportLine>[] = [
  {
    key: 'saleDate',
    header: 'Date',
    render: (row) => (
      <span className="text-muted-foreground">
        {new Date(row.saleDate).toLocaleDateString()}
      </span>
    ),
  },
  { key: 'itemName', header: 'Item' },
  {
    key: 'batchNo',
    header: 'Batch',
    render: (row) => <span className="font-mono text-sm">{row.batchNo}</span>,
  },
  {
    key: 'quantity',
    header: 'Qty',
    render: (row) => <span className="font-medium">{row.quantity}</span>,
  },
  {
    key: 'unitPrice',
    header: 'Unit Price',
    render: (row) => <span className="text-muted-foreground">{formatETB(row.unitPrice)}</span>,
  },
  {
    key: 'lineTotal',
    header: 'Total',
    render: (row) => <span className="font-medium">{formatETB(row.lineTotal)}</span>,
  },
  {
    key: 'paymentMethod',
    header: 'Payment',
    render: (row) => (
      <span className="text-xs text-muted-foreground">{row.paymentMethod}</span>
    ),
  },
  {
    key: 'soldByName',
    header: 'Sold By',
    render: (row) => <span className="text-muted-foreground">{row.soldByName}</span>,
  },
];

export function SalesReport() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isExporting, setIsExporting] = useState(false);

  const { startDate, endDate } = getDateRange(dateRange);

  const { data: response, isLoading, isFetching } = useGetSalesReportQuery({
    startDate,
    endDate,
    page,
    limit,
  });

  const summary = response?.summary;

  const handleExportPdf = async () => {
    if (!response?.data?.length) {
      toast.error('No data to export');
      return;
    }

    setIsExporting(true);
    try {
      await downloadTablePdf({
        title: 'Sales Report',
        headers: ['Date', 'Item', 'Batch', 'Qty', 'Unit Price', 'Total', 'Payment', 'Sold By'],
        rows: response.data.map((row) => [
          new Date(row.saleDate).toLocaleDateString(),
          row.itemName,
          row.batchNo,
          row.quantity.toString(),
          row.unitPrice.toFixed(2),
          row.lineTotal.toFixed(2),
          row.paymentMethod,
          row.soldByName,
        ]),
      });
      toast.success('Report exported as PDF');
    } catch {
      toast.error('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Revenue</p>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {summary ? formatETB(summary.totalRevenue) : '-'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Profit</p>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {summary ? formatETB(summary.totalProfit) : '-'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Items Sold</p>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {summary?.totalItems ?? '-'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Transactions</p>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {summary?.transactionCount ?? '-'}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            {(['today', '7d', '30d', 'all'] as DateRange[]).map((range) => (
              <Button
                key={range}
                variant={dateRange === range ? 'default' : 'secondary'}
                size="sm"
                onClick={() => { setDateRange(range); setPage(1); }}
              >
                {range === 'today' ? 'Today' : range === 'all' ? 'All' : range}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPdf}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-1" />
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </Button>
        </div>

        <Card>
          <CardContent>
            <DataTable
              columns={columns}
              data={response?.data ?? []}
              isLoading={isLoading}
              isFetching={isFetching}
              emptyMessage="No sales data found"
              keyExtractor={(row) => `${row.saleId}-${row.itemName}-${row.batchNo}`}
              pagination={response ? {
                ...response.meta,
                onPageChange: setPage,
                onLimitChange: (newLimit) => { setLimit(newLimit); setPage(1); },
              } : undefined}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
