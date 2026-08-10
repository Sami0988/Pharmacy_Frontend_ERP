'use client';

import Link from 'next/link';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import type { Payment } from '@/types/api';
import type { PaginationMeta } from '@/components/ui/PaginationControls';

interface PaymentHistoryTableProps {
  data: Payment[];
  isLoading?: boolean;
  isFetching?: boolean;
  pagination?: PaginationMeta & {
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
  };
}

const columns: Column<Payment>[] = [
  {
    key: 'paymentDate',
    header: 'Date',
    render: (p) => new Date(p.paymentDate).toLocaleDateString(),
  },
  {
    key: 'grnNumber',
    header: 'GRN',
    render: (p) => (
      <Link
        href={`/goods-receipts/${p.grnId}`}
        className="text-blue-600 hover:text-blue-800 font-medium"
        onClick={(e) => e.stopPropagation()}
      >
        {p.grnNumber}
      </Link>
    ),
  },
  {
    key: 'amount',
    header: 'Amount',
    render: (p) =>
      p.amount.toLocaleString('en-US', {
        style: 'currency',
        currency: 'ETB',
      }),
  },
  {
    key: 'method',
    header: 'Method',
    render: (p) => (
      <Badge variant="default">
        {p.method === 'bank_transfer'
          ? 'Bank Transfer'
          : p.method === 'mobile_money'
            ? 'Mobile Money'
            : p.method.charAt(0).toUpperCase() + p.method.slice(1)}
      </Badge>
    ),
  },
  {
    key: 'notes',
    header: 'Notes',
    render: (p) => (
      <span className="text-muted-foreground">{p.notes || '-'}</span>
    ),
  },
];

export function PaymentHistoryTable({ data, isLoading, isFetching, pagination }: PaymentHistoryTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      isFetching={isFetching}
      pagination={pagination}
      emptyMessage="No payments recorded yet"
      keyExtractor={(p) => p.id}
    />
  );
}
