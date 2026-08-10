'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import type { Sale } from '@/types/api';
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

const columns: Column<Sale>[] = [
  {
    key: 'saleNumber',
    header: 'Sale #',
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
    header: 'Date',
    render: (s) => new Date(s.saleDate || s.createdAt).toLocaleDateString(),
  },
  {
    key: 'customerName',
    header: 'Customer',
    render: (s) => s.customerName || <span className="text-muted-foreground">Walk-in</span>,
  },
  {
    key: 'totalAmount',
    header: 'Total',
    render: (s) => (
      <span className="font-medium">
        {Number(s.totalAmount).toLocaleString('en-US', { style: 'currency', currency: 'ETB' })}
      </span>
    ),
  },
  {
    key: 'paymentMethod',
    header: 'Payment',
    render: (s) => (
      <Badge variant="secondary">
        {s.paymentMethod === 'mobile_money'
          ? 'Mobile Money'
          : s.paymentMethod.charAt(0).toUpperCase() + s.paymentMethod.slice(1)}
      </Badge>
    ),
  },
  { key: 'soldByName', header: 'Sold By' },
];

export function SalesTable({ data, isLoading, isFetching, pagination }: SalesTableProps) {
  const router = useRouter();

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      isFetching={isFetching}
      pagination={pagination}
      emptyMessage="No sales found"
      keyExtractor={(s) => s.id}
      onRowClick={(s) => router.push(`/sales/${s.id}`)}
    />
  );
}
