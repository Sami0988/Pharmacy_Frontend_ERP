'use client';

import { DataTable, Column } from '@/components/ui/DataTable';
import type { Transfer } from '@/types/api';
import type { PaginationMeta } from '@/components/ui/PaginationControls';

interface TransfersTableProps {
  data: Transfer[];
  isLoading?: boolean;
  isFetching?: boolean;
  pagination?: PaginationMeta & {
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
  };
}

const columns: Column<Transfer>[] = [
  { key: 'itemName', header: 'Item' },
  { key: 'batchNo', header: 'Batch No' },
  {
    key: 'quantity',
    header: 'Quantity',
    render: (t) => <span className="font-medium">{t.quantity}</span>,
  },
  {
    key: 'fromLocationName',
    header: 'From → To',
    render: (t) => (
      <span className="font-medium">
        {t.fromLocationName} → {t.toLocationName}
      </span>
    ),
  },
  { key: 'transferredByName', header: 'Transferred By' },
  {
    key: 'transferDate',
    header: 'Date',
    render: (t) => new Date(t.transferDate).toLocaleDateString(),
  },
];

export function TransfersTable({ data, isLoading, isFetching, pagination }: TransfersTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      isFetching={isFetching}
      pagination={pagination}
      emptyMessage="No transfers recorded"
      keyExtractor={(t) => t.id}
    />
  );
}
