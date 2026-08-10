'use client';

import { useState, useMemo } from 'react';
import { AlertTriangle, Clock, CheckCircle, Filter, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { useGetExpiringBatchesQuery } from '@/store/api/reports-api-slice';
import { downloadTablePdf } from '@/lib/pdf';
import { motion } from 'motion/react';
import type { ExpiryReportBatch } from '@/types/api';

type ExpiryStatus = 'expired' | 'near_expiry' | 'ok';

interface ExpiryRow extends ExpiryReportBatch {
  daysUntilExpiry: number;
  status: ExpiryStatus;
}

const tabs = [
  { key: 'all', label: 'All', icon: Filter },
  { key: 'expired', label: 'Expired', icon: AlertTriangle },
  { key: 'near_expiry', label: 'Near Expiry', icon: Clock },
  { key: 'ok', label: 'OK', icon: CheckCircle },
];

function getDaysUntilExpiry(expiryDate: string): number {
  const expiry = new Date(expiryDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getStatus(daysUntilExpiry: number): ExpiryStatus {
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 30) return 'near_expiry';
  return 'ok';
}

function getStatusBadge(status: ExpiryStatus) {
  switch (status) {
    case 'expired':
      return <Badge variant="danger">Expired</Badge>;
    case 'near_expiry':
      return <Badge variant="outline" className="border-yellow-300 text-yellow-700 dark:text-yellow-400">Near Expiry</Badge>;
    case 'ok':
      return <Badge variant="secondary">OK</Badge>;
  }
}

const formatETB = (value: number) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'ETB' });

const columns: Column<ExpiryRow>[] = [
  { key: 'itemName', header: 'Item' },
  {
    key: 'batchNo',
    header: 'Batch No',
    render: (row) => <span className="font-mono text-sm">{row.batchNo}</span>,
  },
  {
    key: 'locationName',
    header: 'Location',
    render: (row) => <span className="text-muted-foreground">{row.locationName}</span>,
  },
  {
    key: 'expiryDate',
    header: 'Expiry Date',
    render: (row) => (
      <span className={
        row.status === 'expired' ? 'text-destructive font-medium'
          : row.status === 'near_expiry' ? 'text-yellow-600 font-medium'
            : ''
      }>
        {new Date(row.expiryDate).toLocaleDateString()}
      </span>
    ),
  },
  {
    key: 'daysUntilExpiry',
    header: 'Days Left',
    render: (row) => {
      const color = row.daysUntilExpiry < 0 ? 'text-destructive' : row.daysUntilExpiry <= 30 ? 'text-yellow-600' : 'text-muted-foreground';
      return (
        <span className={`font-medium ${color}`}>
          {row.daysUntilExpiry < 0 ? `${Math.abs(row.daysUntilExpiry)}d overdue` : `${row.daysUntilExpiry}d`}
        </span>
      );
    },
  },
  {
    key: 'quantity',
    header: 'Qty',
    render: (row) => <span className="font-medium">{row.quantity}</span>,
  },
  {
    key: 'unitCost',
    header: 'Unit Cost',
    render: (row) => <span className="text-muted-foreground">{formatETB(row.unitCost)}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => getStatusBadge(row.status),
  },
];

export function ExpiryReport() {
  const [activeTab, setActiveTab] = useState('all');
  const [withinDays, setWithinDays] = useState(90);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isExporting, setIsExporting] = useState(false);

  const { data: response, isLoading, isFetching } = useGetExpiringBatchesQuery({
    withinDays,
    page,
    limit,
  });

  const expiryRows = useMemo(() => {
    if (!response?.data) return [];
    return response.data.map((batch) => {
      const daysUntilExpiry = getDaysUntilExpiry(batch.expiryDate);
      const status = getStatus(daysUntilExpiry);
      return { ...batch, daysUntilExpiry, status };
    }).sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }, [response]);

  const filteredRows = useMemo(() => {
    if (activeTab === 'all') return expiryRows;
    return expiryRows.filter((r) => r.status === activeTab);
  }, [expiryRows, activeTab]);

  const stats = useMemo(() => {
    const allRows = expiryRows;
    return {
      total: allRows.length,
      expired: allRows.filter((r) => r.status === 'expired').length,
      nearExpiry: allRows.filter((r) => r.status === 'near_expiry').length,
      valueAtRisk: allRows
        .filter((r) => r.status !== 'ok')
        .reduce((sum, r) => sum + r.unitCost * r.quantity, 0),
    };
  }, [expiryRows]);

  const handleExportPdf = async () => {
    if (!filteredRows.length) {
      toast.error('No data to export');
      return;
    }

    setIsExporting(true);
    try {
      await downloadTablePdf({
        title: 'Expiry Report',
        headers: ['Item', 'Batch No', 'Location', 'Expiry Date', 'Days Left', 'Qty', 'Unit Cost', 'Status'],
        rows: filteredRows.map((row) => [
          row.itemName,
          row.batchNo,
          row.locationName,
          new Date(row.expiryDate).toLocaleDateString(),
          row.daysUntilExpiry < 0
            ? `${Math.abs(row.daysUntilExpiry)}d overdue`
            : `${row.daysUntilExpiry}d`,
          row.quantity.toString(),
          row.unitCost.toFixed(2),
          row.status,
        ]),
      });
      toast.success('Expiry report exported as PDF');
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
            <p className="text-sm text-muted-foreground">Total Batches</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Expired</p>
            <p className="text-2xl font-bold text-destructive">{stats.expired}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Near Expiry</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.nearExpiry}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Value at Risk</p>
            <p className="text-2xl font-bold text-destructive">{formatETB(stats.valueAtRisk)}</p>
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
            {tabs.map((tab) => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setActiveTab(tab.key)}
              >
                <tab.icon className="h-4 w-4 mr-1" />
                {tab.label}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Window:</span>
              {[30, 60, 90].map((days) => (
                <Button
                  key={days}
                  variant={withinDays === days ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => { setWithinDays(days); setPage(1); }}
                >
                  {days}d
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
        </div>

        <Card>
          <CardContent>
            <DataTable
              columns={columns}
              data={filteredRows}
              isLoading={isLoading}
              isFetching={isFetching}
              emptyMessage="No expiry data found"
              keyExtractor={(row) => row.batchId}
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
