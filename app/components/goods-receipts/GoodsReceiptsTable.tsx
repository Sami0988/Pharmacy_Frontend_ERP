'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import type { GoodsReceipt } from '@/types/api';
import { useTranslations } from '@/lib/i18n';
import type { PaginationMeta } from '@/components/ui/PaginationControls';

interface GoodsReceiptsTableProps {
  data: GoodsReceipt[];
  isLoading?: boolean;
  isFetching?: boolean;
  pagination?: PaginationMeta & {
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
  };
}

export function GoodsReceiptsTable({
  data,
  isLoading,
  isFetching,
  pagination,
}: GoodsReceiptsTableProps) {
  const router = useRouter();
  const { t } = useTranslations();

  const dataWithStatus = data.map((receipt) => {
    const amountPaid = Number(receipt.amountPaid);
    const totalCost = Number(receipt.totalCost);
    let paymentStatus: 'paid' | 'partial' | 'unpaid' = 'unpaid';
    if (amountPaid === 0) {
      paymentStatus = 'unpaid';
    } else if (amountPaid >= totalCost) {
      paymentStatus = 'paid';
    } else {
      paymentStatus = 'partial';
    }
    return { ...receipt, paymentStatus };
  });

  const columns: Column<GoodsReceipt & { paymentStatus?: 'paid' | 'partial' | 'unpaid' }>[] = [
    { key: 'grnNumber', header: t('goodsReceipts.grnNumber') },
    { key: 'supplierName', header: t('goodsReceipts.supplier'), hideBelow: 'md' },
    {
      key: 'receiptDate',
      header: t('goodsReceipts.receiptDate'),
      render: (g) => new Date(g.receiptDate).toLocaleDateString(),
      hideBelow: 'lg',
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
      key: 'amountPaid',
      header: t('goodsReceipts.amountPaid'),
      render: (g) =>
        g.amountPaid.toLocaleString('en-US', {
          style: 'currency',
          currency: 'ETB',
        }),
      hideBelow: 'md',
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
