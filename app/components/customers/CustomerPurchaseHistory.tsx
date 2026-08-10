'use client';

import Link from 'next/link';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import type { CustomerPurchaseHistory as PurchaseHistory } from '@/types/api';

interface CustomerPurchaseHistoryProps {
  data: PurchaseHistory[];
  isLoading?: boolean;
}

const columns: Column<PurchaseHistory>[] = [
  {
    key: 'saleNumber',
    header: 'Sale #',
    render: (h) => (
      <Link
        href={`/sales/${h.saleId}`}
        className="text-primary hover:text-primary/80 font-medium"
        onClick={(e) => e.stopPropagation()}
      >
        {h.saleNumber}
      </Link>
    ),
  },
  {
    key: 'saleDate',
    header: 'Date',
    render: (h) => new Date(h.saleDate).toLocaleDateString(),
  },
  {
    key: 'totalAmount',
    header: 'Total',
    render: (h) =>
      h.totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'ETB' }),
  },
  {
    key: 'paymentMethod',
    header: 'Payment',
    render: (h) => (
      <Badge variant="secondary">
        {h.paymentMethod === 'mobile_money'
          ? 'Mobile Money'
          : h.paymentMethod.charAt(0).toUpperCase() + h.paymentMethod.slice(1)}
      </Badge>
    ),
  },
  {
    key: 'items',
    header: 'Items',
    render: (h) => h.items.length,
  },
];

export function CustomerPurchaseHistory({ data, isLoading }: CustomerPurchaseHistoryProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      emptyMessage="No purchase history"
      keyExtractor={(h) => h.saleId}
    />
  );
}
