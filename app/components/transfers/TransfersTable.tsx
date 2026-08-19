'use client';

import { DataTable, Column } from '@/components/ui/DataTable';
import type { Transfer } from '@/types/api';
import { useTranslations } from '@/lib/i18n';
import type { PaginationMeta } from '@/components/ui/PaginationControls';

interface TransfersTableProps {
  data: Transfer[];
  isLoading?: boolean;
  isFetching?: boolean;
  pagination?: PaginationMeta & {
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
  };
}

export function TransfersTable({ data, isLoading, isFetching, pagination }: TransfersTableProps) {
  const { t } = useTranslations();

  const displayLocation = (name: string) => name === 'Dispatcher' ? 'Dispenser' : name;

  const columns: Column<Transfer>[] = [
    { key: 'itemName', header: t('transfers.item') },
    { key: 'batchNo', header: t('transfers.batchNo') },
    {
      key: 'quantity',
      header: t('transfers.quantity'),
      render: (row) => {
        if (row.packSize && row.numberOfPacks) {
          return (
            <div>
              <span className="font-medium">{row.quantity} units</span>
              <span className="text-muted-foreground text-xs block">
                ({row.numberOfPacks} packs × {row.packSize})
              </span>
            </div>
          );
        }
        return <span className="font-medium">{row.quantity}</span>;
      },
    },
    {
      key: 'fromLocationName',
      header: t('transfers.fromTo'),
      render: (row) => (
        <span className="font-medium">
          {displayLocation(row.fromLocationName)} → {displayLocation(row.toLocationName)}
        </span>
      ),
    },
    { key: 'transferredByName', header: t('transfers.transferredBy') },
    {
      key: 'transferDate',
      header: t('transfers.date'),
      render: (row) => new Date(row.transferDate).toLocaleDateString(),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      isFetching={isFetching}
      pagination={pagination}
      emptyMessage={t('transfers.noTransfers')}
      keyExtractor={(t) => t.id}
    />
  );
}
