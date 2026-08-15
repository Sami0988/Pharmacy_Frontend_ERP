'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useDeleteSaleMutation } from '@/store/api/sales-api-slice';
import type { Sale } from '@/types/api';
import { useTranslations } from '@/lib/i18n';
import type { PaginationMeta } from '@/components/ui/PaginationControls';

interface SalesTableProps {
  data: Sale[];
  isLoading?: boolean;
  isFetching?: boolean;
  pagination?: PaginationMeta & {
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
  };
}

export function SalesTable({ data, isLoading, isFetching, pagination }: SalesTableProps) {
  const router = useRouter();
  const { t } = useTranslations();
  const [deleteSale, { isLoading: isDeleting }] = useDeleteSaleMutation();
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);

  const handleDelete = async () => {
    if (!saleToDelete) return;
    try {
      await deleteSale(saleToDelete.id).unwrap();
      toast.success('Sale deleted successfully');
      setSaleToDelete(null);
    } catch (err: unknown) {
      const apiError = err as { status?: number; data?: { message?: string } };
      if (apiError.status && apiError.status < 500) {
        toast.error(apiError.data?.message || 'Failed to delete sale');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
  };

  const columns: Column<Sale>[] = [
    {
      key: 'saleNumber',
      header: t('sales.saleNumber'),
      render: (s) => (
        <Link
          href={`/sales/${s.id}`}
          className="text-primary hover:text-primary/80 font-medium"
          onClick={(e) => e.stopPropagation()}
        >
          {s.saleNumber || s.id.slice(0, 8).toUpperCase()}
        </Link>
      ),
    },
    {
      key: 'createdAt',
      header: t('sales.date'),
      render: (s) => new Date(s.saleDate || s.createdAt).toLocaleDateString(),
      hideBelow: 'md',
    },
    {
      key: 'customerName',
      header: t('sales.customer'),
      render: (s) => s.customerName || <span className="text-muted-foreground">{t('sales.walkIn')}</span>,
    },
    {
      key: 'totalAmount',
      header: t('sales.total'),
      render: (s) => (
        <span className="font-medium">
          {Number(s.totalAmount).toLocaleString('en-US', { style: 'currency', currency: 'ETB' })}
        </span>
      ),
    },
    {
      key: 'paymentMethod',
      header: t('sales.payment'),
      render: (s) => (
        <Badge variant="secondary">
          {s.paymentMethod === 'mobile_money'
            ? t('sales.mobileMoney')
            : s.paymentMethod.charAt(0).toUpperCase() + s.paymentMethod.slice(1)}
        </Badge>
      ),
    },
    { key: 'soldByName', header: t('sales.soldBy'), hideBelow: 'lg' },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (s) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setSaleToDelete(s)}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            {t('common.delete')}
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        isFetching={isFetching}
        pagination={pagination}
        emptyMessage={t('sales.noSales')}
        keyExtractor={(s) => s.id}
        onRowClick={(s) => router.push(`/sales/${s.id}`)}
      />
      <ConfirmDialog
        open={!!saleToDelete}
        title="Delete Sale"
        description={`Are you sure you want to delete sale "${saleToDelete?.saleNumber || saleToDelete?.id.slice(0, 8).toUpperCase()}"? This will reverse stock movements and credit balances. This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setSaleToDelete(null)}
        isLoading={isDeleting}
      />
    </>
  );
}
