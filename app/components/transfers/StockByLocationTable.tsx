'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import type { StockByLocationRow } from '@/types/api';
import { useTranslations } from '@/lib/i18n';
import type { PaginationMeta } from '@/components/ui/PaginationControls';

interface StockByLocationTableProps {
  data: StockByLocationRow[];
  isLoading?: boolean;
  isFetching?: boolean;
  pagination?: PaginationMeta & {
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
  };
}

export function StockByLocationTable({ data, isLoading, isFetching, pagination }: StockByLocationTableProps) {
  const router = useRouter();
  const { t } = useTranslations();

  const dataWithFlag = data.map((row) => ({
    ...row,
    needsTransfer: row.storeQuantity > 0 && row.dispatcherQuantity === 0,
  }));

  const columns: Column<StockByLocationRow & { needsTransfer?: boolean }>[] = [
    { key: 'itemName', header: t('stock.itemName') },
    {
      key: 'storeQuantity',
      header: t('stock.store'),
      render: (row) => (
        <div>
          <span className="font-medium">{row.storeQuantity}</span>
          {row.storePacks != null && row.storePacks > 0 && row.packSize != null && row.packSize > 1 && (
            <span className="text-muted-foreground text-xs block">
              ({row.storePacks} packs × {row.packSize})
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'dispatcherQuantity',
      header: t('stock.dispatcher'),
      render: (row) => (
        <div>
          <span className="font-medium">{row.dispatcherQuantity}</span>
          {row.dispatcherPacks != null && row.dispatcherPacks > 0 && row.packSize != null && row.packSize > 1 && (
            <span className="text-muted-foreground text-xs block">
              ({row.dispatcherPacks} packs × {row.packSize})
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'totalQuantity',
      header: t('stock.total'),
      render: (row) => (
        <div>
          <span className="font-semibold">{row.totalQuantity}</span>
          {row.totalPacks != null && row.totalPacks > 0 && row.packSize != null && row.packSize > 1 && (
            <span className="text-muted-foreground text-xs block">
              ({row.totalPacks} packs × {row.packSize})
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'needsTransfer',
      header: t('stock.status'),
      render: (row) => {
        if (row.storeQuantity > 0 && row.dispatcherQuantity === 0) {
          return <Badge variant="danger">{t('stock.needsTransfer')}</Badge>;
        }
        if (row.dispatcherQuantity === 0 && row.storeQuantity === 0) {
          return <Badge variant="secondary">{t('stock.outOfStock')}</Badge>;
        }
        return <Badge variant="success">{t('stock.ok')}</Badge>;
      },
    },
    {
      key: 'actions',
      header: t('stock.actions'),
      render: (row) => {
        if (row.storeQuantity > 0 && row.dispatcherQuantity === 0) {
          return (
            <Link
              href={`/transfers/new?itemId=${row.itemId}`}
              className="text-blue-600 hover:text-blue-800 font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              {t('stock.transfer')}
            </Link>
          );
        }
        return null;
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={dataWithFlag}
      isLoading={isLoading}
      isFetching={isFetching}
      pagination={pagination}
      emptyMessage={t('stock.noStock')}
      keyExtractor={(row) => row.itemId}
      onRowClick={(row) => {
        if (row.storeQuantity > 0 && row.dispatcherQuantity === 0) {
          router.push(`/transfers/new?itemId=${row.itemId}`);
        }
      }}
    />
  );
}
