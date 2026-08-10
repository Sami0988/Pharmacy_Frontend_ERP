'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { DataTable, Column } from '@/components/ui/DataTable';
import type { TraceSaleEntry } from '@/types/api';

const columns: Column<TraceSaleEntry>[] = [
  {
    key: 'saleNumber',
    header: 'Sale #',
    render: (entry) => (
      <Link href={`/sales/${entry.saleId}`} className="text-blue-600 hover:text-blue-800 font-medium">
        {entry.saleNumber}
      </Link>
    ),
  },
  {
    key: 'saleDate',
    header: 'Date',
    render: (entry) => new Date(entry.saleDate).toLocaleDateString(),
  },
  { key: 'quantity', header: 'Qty' },
  {
    key: 'customerName',
    header: 'Customer',
    render: (entry) => entry.customerName || <span className="text-muted-foreground italic">Walk-in</span>,
  },
  { key: 'soldByName', header: 'Sold by' },
];

interface SalesHistoryTableProps {
  sales: TraceSaleEntry[];
}

export function SalesHistoryTable({ sales }: SalesHistoryTableProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-foreground">Sales History</h3>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={sales}
          keyExtractor={(entry) => entry.saleId}
          emptyMessage="No sales recorded for this batch"
        />
      </CardContent>
    </Card>
  );
}
