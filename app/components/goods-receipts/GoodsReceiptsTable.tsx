'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import type { GoodsReceipt, SupplierBalanceSummary } from '@/types/api';
import { useTranslations } from '@/lib/i18n';
import type { PaginationMeta } from '@/components/ui/PaginationControls';

interface GoodsReceiptsTableProps {
  data: GoodsReceipt[];
  isLoading?: boolean;
  isFetching?: boolean;
  supplierBalances?: SupplierBalanceSummary[];
  pagination?: PaginationMeta & {
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
  };
}

export function GoodsReceiptsTable({
  data,
  isLoading,
  isFetching,
  supplierBalances = [],
  pagination,
}: GoodsReceiptsTableProps) {
  const router = useRouter();
  const { t } = useTranslations();

  const balanceMap = new Map(
    supplierBalances.map((b) => [b.supplierId, b])
  );

  const dataWithStatus = data.map((receipt) => {
    const supplierBalance = balanceMap.get(receipt.supplierId);
    let paymentStatus: 'paid' | 'partial' | 'unpaid' = 'unpaid';
    if (supplierBalance) {
      if (supplierBalance.outstanding === 0) {
        paymentStatus = 'paid';
      } else if (supplierBalance.outstanding < supplierBalance.totalOwed) {
        paymentStatus = 'partial';
      }
    }
    return { ...receipt, paymentStatus };
  });

  const columns: Column<GoodsReceipt & { paymentStatus?: 'paid' | 'partial' | 'unpaid' }>[] = [
    { key: 'grnNumber', header: t('goodsReceipts.grnNumber') },
    { key: 'supplierName', header: t('goodsReceipts.supplier') },
    {
      key: 'receiptDate',
      header: t('goodsReceipts.receiptDate'),
      render: (g) => new Date(g.receiptDate).toLocaleDateString(),
    },
    {
      key: 'totalCost',
      header: t('goodsReceipts.totalCost'),
      render: (g) =>
        g.totalCost.toLocaleString('en-US', {
          style: 'currency',
          currency: 'ETB',
        }),
    },
    {
      key: 'paymentStatus',
      header: t('goodsReceipts.paymentStatus'),
      render: (g) => {
        if (!g.paymentStatus) return <Badge variant="secondary">{t('goodsReceipts.unknown')}</Badge>;
        if (g.paymentStatus === 'paid')
          return <Badge variant="success">{t('goodsReceipts.paid')}</Badge>;
        if (g.paymentStatus === 'partial')
          return <Badge variant="secondary">{t('goodsReceipts.partial')}</Badge>;
        return <Badge variant="danger">{t('goodsReceipts.unpaid')}</Badge>;
      },
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (g) => (
        <Link
          href={`/goods-receipts/${g.id}`}
          className="text-primary hover:text-primary/80 font-medium"
          onClick={(e) => e.stopPropagation()}
        >
          {t('goodsReceipts.view')}
        </Link>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={dataWithStatus}
      isLoading={isLoading}
      isFetching={isFetching}
      pagination={pagination}
      emptyMessage={t('goodsReceipts.noGrns')}
      keyExtractor={(g) => g.id}
      onRowClick={(g) => router.push(`/goods-receipts/${g.id}`)}
    />
  );
}
