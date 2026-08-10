'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DataTable, Column } from '@/components/ui/DataTable';
import type { Supplier } from '@/types/api';
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

const columns: Column<Supplier>[] = [
  { key: 'name', header: 'Name' },
  { key: 'phone', header: 'Phone', render: (s) => s.phone || '-' },
  { key: 'licenseNo', header: 'License No', render: (s) => s.licenseNo || '-' },
  { key: 'address', header: 'Address', render: (s) => s.address || '-' },
  {
    key: 'actions',
    header: 'Actions',
    render: (s) => (
      <Link
        href={`/suppliers/${s.id}/edit`}
        className="text-blue-600 hover:text-blue-800 font-medium"
        onClick={(e) => e.stopPropagation()}
      >
        Edit
      </Link>
    ),
  },
];

export function SuppliersTable({ data, isLoading, isFetching, pagination }: SuppliersTableProps) {
  const router = useRouter();

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      isFetching={isFetching}
      pagination={pagination}
      emptyMessage="No suppliers found"
      keyExtractor={(s) => s.id}
      onRowClick={(s) => router.push(`/suppliers/${s.id}/edit`)}
    />
  );
}
