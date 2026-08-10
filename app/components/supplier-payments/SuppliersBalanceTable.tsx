'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DataTable, Column } from '@/components/ui/DataTable';
import type { SupplierBalanceSummary } from '@/types/api';

interface SuppliersBalanceTableProps {
  data: SupplierBalanceSummary[];
  isLoading?: boolean;
}

function outstandingColor(outstanding: number, totalOwed: number): string {
  if (totalOwed === 0) return '';
  const ratio = outstanding / totalOwed;
  if (ratio >= 0.75) return 'text-red-700 font-bold';
  if (ratio >= 0.25) return 'text-amber-600 font-semibold';
  return 'text-foreground';
}

const columns: Column<SupplierBalanceSummary>[] = [
  {
    key: 'supplierName',
    header: 'Supplier',
    render: (s) => (
      <Link
        href={`/suppliers/${s.supplierId}`}
        className="text-blue-600 hover:text-blue-800 font-medium"
        onClick={(e) => e.stopPropagation()}
      >
        {s.supplierName}
      </Link>
    ),
  },
  {
    key: 'grnCount',
    header: 'GRNs',
    render: (s) => s.grnCount,
  },
  {
    key: 'totalOwed',
    header: 'Total Owed',
    render: (s) =>
      s.totalOwed.toLocaleString('en-US', {
        style: 'currency',
        currency: 'ETB',
      }),
  },
  {
    key: 'totalPaid',
    header: 'Total Paid',
    render: (s) => (
      <span className="text-green-600">
        {s.totalPaid.toLocaleString('en-US', {
          style: 'currency',
          currency: 'ETB',
        })}
      </span>
    ),
  },
  {
    key: 'outstanding',
    header: 'Outstanding',
    render: (s) => (
      <span className={outstandingColor(s.outstanding, s.totalOwed)}>
        {s.outstanding.toLocaleString('en-US', {
          style: 'currency',
          currency: 'ETB',
        })}
      </span>
    ),
  },
];

export function SuppliersBalanceTable({ data, isLoading }: SuppliersBalanceTableProps) {
  const router = useRouter();

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      emptyMessage="No suppliers with outstanding balances"
      keyExtractor={(s) => s.supplierId}
      onRowClick={(s) => router.push(`/suppliers/${s.supplierId}`)}
    />
  );
}
