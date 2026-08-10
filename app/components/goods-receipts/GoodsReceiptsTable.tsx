'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import type { GoodsReceipt, SupplierBalanceSummary } from '@/types/api';
import type { PaginationMeta } from '@/components/ui/PaginationControls';

interface GoodsReceiptsTableProps {
  data: GoodsReceipt[];
  isLoading?: boolean;
  isFetching?: boolean;
  supplierBalances?: SupplierBalanceSummary[];
  pagination?: PaginationMeta & {
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
  };
}

const columns: Column<GoodsReceipt & { paymentStatus?: 'paid' | 'partial' | 'unpaid' }>[] = [
  { key: 'grnNumber', header: 'GRN Number' },
  { key: 'supplierName', header: 'Supplier' },
  {
    key: 'receiptDate',
    header: 'Receipt Date',
    render: (g) => new Date(g.receiptDate).toLocaleDateString(),
  },
  {
    key: 'totalCost',
    header: 'Total Cost',
    render: (g) =>
      g.totalCost.toLocaleString('en-US', {
        style: 'currency',
        currency: 'ETB',
      }),
  },
  {
    key: 'paymentStatus',
    header: 'Payment Status',
    render: (g) => {
      if (!g.paymentStatus) return <Badge variant="secondary">Unknown</Badge>;
      if (g.paymentStatus === 'paid')
        return <Badge variant="success">Paid</Badge>;
      if (g.paymentStatus === 'partial')
        return <Badge variant="secondary">Partial</Badge>;
      return <Badge variant="danger">Unpaid</Badge>;
    },
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (g) => (
      <Link
        href={`/goods-receipts/${g.id}`}
        className="text-primary hover:text-primary/80 font-medium"
        onClick={(e) => e.stopPropagation()}
      >
        View
      </Link>
    ),
  },
];

export function GoodsReceiptsTable({
  data,
  isLoading,
  isFetching,
  supplierBalances = [],
  pagination,
}: GoodsReceiptsTableProps) {
  const router = useRouter();

  const balanceMap = new Map(
    supplierBalances.map((b) => [b.supplierId, b])
  );

  const dataWithStatus = data.map((receipt) => {
    const supplierBalance = balanceMap.get(receipt.supplierId);
    let paymentStatus: 'paid' | 'partial' | 'unpaid' = 'unpaid';
    if (supplierBalance) {
      if (supplierBalance.outstanding === 0) {
        paymentStatus = 'paid';
      } else if (supplierBalance.outstanding < supplierBalance.totalOwed) {
        paymentStatus = 'partial';
      }
    }
    return { ...receipt, paymentStatus };
  });

  return (
    <DataTable
      columns={columns}
      data={dataWithStatus}
      isLoading={isLoading}
      isFetching={isFetching}
      pagination={pagination}
      emptyMessage="No goods receipts found"
      keyExtractor={(g) => g.id}
      onRowClick={(g) => router.push(`/goods-receipts/${g.id}`)}
    />
  );
}
