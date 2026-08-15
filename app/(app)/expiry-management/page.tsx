'use client';

import { useState, useMemo } from 'react';
import { AlertTriangle, Clock, CheckCircle, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { useGetExpiringBatchesQuery } from '@/store/api/reports-api-slice';
import { useTranslations } from '@/lib/i18n';
import { motion } from 'motion/react';
import type { ExpiryBatch } from '@/types/api';

type ExpiryStatus = 'expired' | 'near_expiry' | 'ok';

interface ExpiryRow extends ExpiryBatch {
  daysUntilExpiry: number;
  status: ExpiryStatus;
}

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

export default function ExpiryManagementPage() {
  const { t } = useTranslations();
  const [activeTab, setActiveTab] = useState('all');
  const [withinDays, setWithinDays] = useState(270);
  const { data: response, isLoading } = useGetExpiringBatchesQuery({ withinDays });
  const batches = response?.data ?? [];

  const expiryRows = useMemo(() => {
    if (!batches.length) return [];
    return batches
      .map((batch) => {
        const daysUntilExpiry = getDaysUntilExpiry(batch.expiryDate);
        const status = getStatus(daysUntilExpiry);
        return { ...batch, daysUntilExpiry, status };
      })
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }, [batches]);

  const filteredRows = useMemo(() => {
    if (activeTab === 'all') return expiryRows;
    return expiryRows.filter((r) => r.status === activeTab);
  }, [expiryRows, activeTab]);

  const stats = useMemo(() => ({
    total: expiryRows.length,
    expired: expiryRows.filter((r) => r.status === 'expired').length,
    nearExpiry: expiryRows.filter((r) => r.status === 'near_expiry').length,
    ok: expiryRows.filter((r) => r.status === 'ok').length,
  }), [expiryRows]);

  const tabs = [
    { key: 'all', label: t('expiryManagement.all'), icon: Filter },
    { key: 'expired', label: t('expiryManagement.expired'), icon: AlertTriangle },
    { key: 'near_expiry', label: t('expiryManagement.nearExpiryDays'), icon: Clock },
    { key: 'ok', label: t('expiryManagement.ok'), icon: CheckCircle },
  ];

  function getStatusBadge(status: ExpiryStatus) {
    switch (status) {
      case 'expired':
        return <Badge variant="danger">{t('expiryManagement.expired')}</Badge>;
      case 'near_expiry':
        return <Badge variant="danger">{t('expiryManagement.nearExpiry')}</Badge>;
      case 'ok':
        return <Badge variant="secondary">{t('expiryManagement.ok')}</Badge>;
    }
  }

  const columns: Column<ExpiryRow>[] = [
    {
      key: 'itemName',
      header: t('expiryManagement.item'),
    },
    {
      key: 'batchNo',
      header: t('expiryManagement.batchNo'),
      render: (row) => <span className="font-mono text-sm">{row.batchNo}</span>,
    },
    {
      key: 'locationName',
      header: t('expiryManagement.location'),
      render: (row) => <span className="text-muted-foreground">{row.locationName === 'Dispatcher' ? 'Dispenser' : row.locationName}</span>,
    },
    {
      key: 'expiryDate',
      header: t('expiryManagement.expiryDate'),
      render: (row) => (
        <span className={row.status === 'expired' ? 'text-destructive font-medium' : row.status === 'near_expiry' ? 'text-yellow-600 font-medium' : ''}>
          {new Date(row.expiryDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'daysUntilExpiry',
      header: t('expiryManagement.daysLeft'),
      render: (row) => {
        const color = row.daysUntilExpiry < 0 ? 'text-destructive' : row.daysUntilExpiry <= 30 ? 'text-yellow-600' : 'text-muted-foreground';
        return (
          <span className={`font-medium ${color}`}>
            {row.daysUntilExpiry < 0 ? `${Math.abs(row.daysUntilExpiry)}d ${t('expiryManagement.overdue')}` : `${row.daysUntilExpiry}d`}
          </span>
        );
      },
    },
    {
      key: 'quantity',
      header: t('expiryManagement.qty'),
      render: (row) => <span className="font-medium">{row.quantity}</span>,
    },
    {
      key: 'unitCost',
      header: t('expiryManagement.unitCost'),
      render: (row) => (
        <span className="text-muted-foreground">
          {row.unitCost.toLocaleString('en-US', { style: 'currency', currency: 'ETB' })}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('expiryManagement.status'),
      render: (row) => getStatusBadge(row.status),
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('expiryManagement.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('expiryManagement.description')}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t('expiryManagement.totalBatches')}</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t('expiryManagement.expired')}</p>
            <p className="text-2xl font-bold text-destructive">{stats.expired}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t('expiryManagement.nearExpiry')}</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.nearExpiry}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t('expiryManagement.ok')}</p>
            <p className="text-2xl font-bold text-green-600">{stats.ok}</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
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
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('expiryManagement.window')}:</span>
            {[30, 60, 90, 180, 270].map((days) => (
              <Button
                key={days}
                variant={withinDays === days ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setWithinDays(days)}
              >
                {days === 180 ? '6mo' : days === 270 ? '9mo' : `${days}d`}
              </Button>
            ))}
          </div>
        </div>

        <Card>
          <CardContent>
            <DataTable
              columns={columns}
              data={filteredRows}
              isLoading={isLoading}
              emptyMessage={t('expiryManagement.noExpiryData')}
              keyExtractor={(row) => `${row.batchId}-${row.locationName}`}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
