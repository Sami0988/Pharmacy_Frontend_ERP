'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { DataTable, Column } from '@/components/ui/DataTable';
import { useTranslations } from '@/lib/i18n';
import type { TraceTransferEntry } from '@/types/api';

interface TransferHistoryTableProps {
  transfers: TraceTransferEntry[];
}

export function TransferHistoryTable({ transfers }: TransferHistoryTableProps) {
  const { t } = useTranslations();

  const displayLocation = (name: string) => name === 'Dispatcher' ? 'Dispenser' : name;

  const columns: Column<TraceTransferEntry>[] = useMemo(() => [
    {
      key: 'transferDate',
      header: t('traceability.date'),
      render: (entry) => new Date(entry.transferDate).toLocaleDateString(),
    },
    { key: 'quantity', header: t('traceability.qty') },
    {
      key: 'fromLocation',
      header: t('traceability.from'),
      render: (entry) => <span className="font-medium">{displayLocation(entry.fromLocation)}</span>,
    },
    {
      key: 'toLocation',
      header: t('traceability.to'),
      render: (entry) => <span className="font-medium">{displayLocation(entry.toLocation)}</span>,
    },
    { key: 'transferredByName', header: t('traceability.by') },
  ], [t]);

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-foreground">{t('traceability.transferHistory')}</h3>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={transfers}
          keyExtractor={(entry) => entry.transferId}
          emptyMessage={t('traceability.noTransfers')}
        />
      </CardContent>
    </Card>
  );
}
