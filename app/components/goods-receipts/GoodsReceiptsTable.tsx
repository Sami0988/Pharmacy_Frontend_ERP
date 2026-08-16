'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useDeleteGoodsReceiptMutation } from '@/store/api/goods-receipts-api-slice';
import { useAuth } from '@/lib/auth/use-auth';
import type { GoodsReceipt } from '@/types/api';
import { useTranslations } from '@/lib/i18n';
import type { PaginationMeta } from '@/components/ui/PaginationControls';

interface GoodsReceiptsTableProps {
  data: GoodsReceipt[];
  isLoading?: boolean;
  isFetching?: boolean;
  pagination?: PaginationMeta & {
    onPageChange: (page: number) => void;
    onLimitChange: (newLimit: number) => void;
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
  const { isAdmin } = useAuth();
  const [deleteGoodsReceipt, { isLoading: isDeleting }] = useDeleteGoodsReceiptMutation();
  const [grnToDelete, setGrnToDelete] = useState<GoodsReceipt | null>(null);

  const handleDelete = async () => {
    if (!grnToDelete) return;
    try {
      await deleteGoodsReceipt(grnToDelete.id).unwrap();
      toast.success(t('goodsReceipts.deletedSuccess'));
      setGrnToDelete(null);
    } catch (err: unknown) {
      const apiError = err as { status?: number; data?: { message?: string } };
      if (apiError.data?.message) {
        toast.error(apiError.data.message);
      } else {
        toast.error(t('goodsReceipts.deleteFailed'));
      }
    }
  };

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
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/goods-receipts/${g.id}`}
            className="text-primary hover:text-primary/80 font-medium"
          >
            {t('goodsReceipts.view')}
          </Link>
          {isAdmin && (
            <button
              onClick={() => setGrnToDelete(g)}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              {t('common.delete')}
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
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
      <ConfirmDialog
        open={!!grnToDelete}
        title={t('goodsReceipts.deleteGrn')}
        description={t('goodsReceipts.deleteGrnConfirm', { grnNumber: grnToDelete?.grnNumber ?? '' })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setGrnToDelete(null)}
        isLoading={isDeleting}
      />
    </>
  );
}
