'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { DataTable, Column } from '@/components/ui/DataTable';
import { useTranslations } from '@/lib/i18n';
import type { TraceSaleEntry } from '@/types/api';

interface SalesHistoryTableProps {
  sales: TraceSaleEntry[];
}

export function SalesHistoryTable({ sales }: SalesHistoryTableProps) {
  const { t } = useTranslations();

  const columns: Column<TraceSaleEntry>[] = useMemo(() => [
    {
      key: 'saleNumber',
      header: t('traceability.saleNumber'),
      render: (entry) => (
        <Link href={`/sales/${entry.saleId}`} className="text-blue-600 hover:text-blue-800 font-medium">
          {entry.saleNumber}
        </Link>
      ),
    },
    {
      key: 'saleDate',
      header: t('traceability.date'),
      render: (entry) => new Date(entry.saleDate).toLocaleDateString(),
    },
    { key: 'quantity', header: t('traceability.qty') },
    {
      key: 'customerName',
      header: t('traceability.customer'),
      render: (entry) => entry.customerName || <span className="text-muted-foreground italic">{t('traceability.walkIn')}</span>,
    },
    { key: 'soldByName', header: t('traceability.soldBy') },
  ], [t]);

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-foreground">{t('traceability.salesHistory')}</h3>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={sales}
          keyExtractor={(entry) => entry.saleId}
          emptyMessage={t('traceability.noSales')}
        />
      </CardContent>
    </Card>
  );
}
