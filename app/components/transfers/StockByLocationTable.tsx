'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import type { StockByLocationRow } from '@/types/api';
import type { PaginationMeta } from '@/components/ui/PaginationControls';

interface StockByLocationTableProps {
  data: StockByLocationRow[];
  isLoading?: boolean;
  isFetching?: boolean;
  pagination?: PaginationMeta & {
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
  };
}

const columns: Column<StockByLocationRow & { needsTransfer?: boolean }>[] = [
  { key: 'itemName', header: 'Item Name' },
  {
    key: 'storeQuantity',
    header: 'Store',
    render: (row) => (
      <span className="font-medium">{row.storeQuantity}</span>
    ),
  },
  {
    key: 'dispatcherQuantity',
    header: 'Dispatcher',
    render: (row) => (
      <span className="font-medium">{row.dispatcherQuantity}</span>
    ),
  },
  {
    key: 'totalQuantity',
    header: 'Total',
    render: (row) => (
      <span className="font-semibold">{row.totalQuantity}</span>
    ),
  },
  {
    key: 'needsTransfer',
    header: 'Status',
    render: (row) => {
      if (row.storeQuantity > 0 && row.dispatcherQuantity === 0) {
        return <Badge variant="danger">Needs Transfer</Badge>;
      }
      if (row.dispatcherQuantity === 0 && row.storeQuantity === 0) {
        return <Badge variant="secondary">Out of Stock</Badge>;
      }
      return <Badge variant="success">OK</Badge>;
    },
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (row) => {
      if (row.storeQuantity > 0 && row.dispatcherQuantity === 0) {
        return (
          <Link
            href={`/transfers/new?itemId=${row.itemId}`}
            className="text-blue-600 hover:text-blue-800 font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            Transfer
          </Link>
        );
      }
      return null;
    },
  },
];

export function StockByLocationTable({ data, isLoading, isFetching, pagination }: StockByLocationTableProps) {
  const router = useRouter();

  const dataWithFlag = data.map((row) => ({
    ...row,
    needsTransfer: row.storeQuantity > 0 && row.dispatcherQuantity === 0,
  }));

  return (
    <DataTable
      columns={columns}
      data={dataWithFlag}
      isLoading={isLoading}
      isFetching={isFetching}
      pagination={pagination}
      emptyMessage="No stock data available"
      keyExtractor={(row) => row.itemId}
      onRowClick={(row) => {
        if (row.storeQuantity > 0 && row.dispatcherQuantity === 0) {
          router.push(`/transfers/new?itemId=${row.itemId}`);
        }
      }}
    />
  );
}
