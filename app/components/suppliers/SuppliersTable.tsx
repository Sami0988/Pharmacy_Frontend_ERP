'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DataTable, Column } from '@/components/ui/DataTable';
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

  const columns: Column<Supplier>[] = [
    { key: 'name', header: t('common.name') },
    { key: 'phone', header: t('common.phone'), render: (s) => s.phone || '-' },
    { key: 'licenseNo', header: t('suppliers.licenseNumber'), render: (s) => s.licenseNo || '-' },
    { key: 'address', header: t('suppliers.address'), render: (s) => s.address || '-' },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (s) => (
        <Link
          href={`/suppliers/${s.id}/edit`}
          className="text-blue-600 hover:text-blue-800 font-medium"
          onClick={(e) => e.stopPropagation()}
        >
          {t('suppliers.edit')}
        </Link>
      ),
    },
  ];

  return (
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
  );
}
