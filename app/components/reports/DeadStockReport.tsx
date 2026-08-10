'use client';

import { useState } from 'react';
import { PackageX, AlertTriangle, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { useGetDeadStockQuery } from '@/store/api/reports-api-slice';
import { downloadTablePdf } from '@/lib/pdf';
import { motion } from 'motion/react';
import type { DeadStockItem } from '@/types/api';

type Threshold = 30 | 60 | 90 | 'all';

const formatETB = (value: number) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'ETB' });

const columns: Column<DeadStockItem>[] = [
  { key: 'itemName', header: 'Item' },
  {
    key: 'totalQuantityOnHand',
    header: 'Stock',
    render: (row) => <span className="font-medium">{row.totalQuantityOnHand}</span>,
  },
  {
    key: 'tiedUpValue',
    header: 'Tied-Up Value',
    render: (row) => (
      <span className="font-medium text-red-600 dark:text-red-400">
        {formatETB(row.tiedUpValue)}
      </span>
    ),
  },
  {
    key: 'daysSinceLastSale',
    header: 'Days Since Sale',
    render: (row) => (
      <span className="text-muted-foreground">
        {row.daysSinceLastSale !== null
          ? `${row.daysSinceLastSale}d`
          : 'Never sold'}
      </span>
    ),
  },
];

export function DeadStockReport() {
  const [threshold, setThreshold] = useState<Threshold>('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isExporting, setIsExporting] = useState(false);

  const { data: response, isLoading, isFetching } = useGetDeadStockQuery({
    daysThreshold: threshold === 'all' ? undefined : threshold,
    page,
    limit,
  });

  const totalValue = response?.data?.reduce((sum, item) => sum + item.tiedUpValue, 0) ?? 0;
  const totalItems = response?.meta?.totalItems ?? 0;

  const handleExportPdf = async () => {
    if (!response?.data?.length) {
      toast.error('No data to export');
      return;
    }

    setIsExporting(true);
    try {
      await downloadTablePdf({
        title: 'Dead Stock Report',
        headers: ['Item', 'Stock', 'Tied-Up Value', 'Days Since Last Sale'],
        rows: response.data.map((row) => [
          row.itemName,
          row.totalQuantityOnHand.toString(),
          row.tiedUpValue.toFixed(2),
          row.daysSinceLastSale !== null ? `${row.daysSinceLastSale}d` : 'Never sold',
        ]),
      });
      toast.success('Dead stock report exported as PDF');
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
        className="grid grid-cols-2 gap-4"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <PackageX className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Dead Stock Items</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalItems}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Total Tied-Up Value</p>
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatETB(totalValue)}
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
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Threshold:</span>
            {([30, 60, 90, 'all'] as Threshold[]).map((t) => (
              <Button
                key={t}
                variant={threshold === t ? 'default' : 'secondary'}
                size="sm"
                onClick={() => { setThreshold(t); setPage(1); }}
              >
                {t === 'all' ? 'All' : `${t}d`}
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
              emptyMessage="No dead stock items found"
              keyExtractor={(row) => row.itemId}
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
