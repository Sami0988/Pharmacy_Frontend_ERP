'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DataTable, Column } from '@/components/ui/DataTable';
import type { Customer } from '@/types/api';
import type { PaginationMeta } from '@/components/ui/PaginationControls';

interface CustomersTableProps {
  data: Customer[];
  isLoading?: boolean;
  isFetching?: boolean;
  pagination?: PaginationMeta & {
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
  };
}

const columns: Column<Customer>[] = [
  { key: 'name', header: 'Name' },
  { key: 'phone', header: 'Phone', render: (c) => c.phone || '-' },
  { key: 'email', header: 'Email', render: (c) => c.email || '-' },
  {
    key: 'creditBalance',
    header: 'Credit Balance',
    render: (c) =>
      c.creditBalance > 0 ? (
        <span className="text-red-600 font-medium">
          {c.creditBalance.toLocaleString('en-US', { style: 'currency', currency: 'ETB' })}
        </span>
      ) : (
        <span className="text-muted-foreground">ETB 0.00</span>
      ),
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (c) => (
      <Link
        href={`/customers/${c.id}`}
        className="text-primary hover:text-primary/80 font-medium"
        onClick={(e) => e.stopPropagation()}
      >
        View
      </Link>
    ),
  },
];

export function CustomersTable({ data, isLoading, isFetching, pagination }: CustomersTableProps) {
  const router = useRouter();

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      isFetching={isFetching}
      pagination={pagination}
      emptyMessage="No customers found"
      keyExtractor={(c) => c.id}
      onRowClick={(c) => router.push(`/customers/${c.id}`)}
    />
  );
}
