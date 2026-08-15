'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { DataTable, Column } from '@/components/ui/DataTable';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useDeleteSupplierMutation } from '@/store/api/suppliers-api-slice';
import type { Supplier } from '@/types/api';
import { useTranslations } from '@/lib/i18n';
import type { PaginationMeta } from '@/components/ui/PaginationControls';

interface SuppliersTableProps {
  data: Supplier[];
  isLoading?: boolean;
  isFetching?: boolean;
  pagination?: PaginationMeta & {
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
  };
}

export function SuppliersTable({ data, isLoading, isFetching, pagination }: SuppliersTableProps) {
  const router = useRouter();
  const { t } = useTranslations();
  const [deleteSupplier, { isLoading: isDeleting }] = useDeleteSupplierMutation();
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  const handleDelete = async () => {
    if (!supplierToDelete) return;
    try {
      await deleteSupplier(supplierToDelete.id).unwrap();
      toast.success('Supplier deleted successfully');
      setSupplierToDelete(null);
    } catch (err: unknown) {
      const apiError = err as { status?: number; data?: { message?: string } };
      if (apiError.status && apiError.status < 500) {
        toast.error(apiError.data?.message || 'Failed to delete supplier');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
  };

  const columns: Column<Supplier>[] = [
    { key: 'name', header: t('common.name') },
    { key: 'phone', header: t('common.phone'), render: (s) => s.phone || '-', hideBelow: 'md' },
    { key: 'licenseNo', header: t('suppliers.licenseNumber'), render: (s) => s.licenseNo || '-', hideBelow: 'lg' },
    { key: 'address', header: t('suppliers.address'), render: (s) => s.address || '-', hideBelow: 'lg' },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (s) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/suppliers/${s.id}/edit`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {t('suppliers.edit')}
          </Link>
          <button
            onClick={() => setSupplierToDelete(s)}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            {t('suppliers.delete')}
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
        emptyMessage={t('suppliers.noSuppliers')}
        keyExtractor={(s) => s.id}
        onRowClick={(s) => router.push(`/suppliers/${s.id}/edit`)}
      />
      <ConfirmDialog
        open={!!supplierToDelete}
        title="Delete Supplier"
        description={`Are you sure you want to delete "${supplierToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setSupplierToDelete(null)}
        isLoading={isDeleting}
      />
    </>
  );
}
