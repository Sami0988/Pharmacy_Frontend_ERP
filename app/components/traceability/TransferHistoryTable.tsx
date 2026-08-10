'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { DataTable, Column } from '@/components/ui/DataTable';
import type { TraceTransferEntry } from '@/types/api';

const columns: Column<TraceTransferEntry>[] = [
  {
    key: 'transferDate',
    header: 'Date',
    render: (entry) => new Date(entry.transferDate).toLocaleDateString(),
  },
  { key: 'quantity', header: 'Qty' },
  {
    key: 'fromLocation',
    header: 'From',
    render: (entry) => <span className="font-medium">{entry.fromLocation}</span>,
  },
  {
    key: 'toLocation',
    header: 'To',
    render: (entry) => <span className="font-medium">{entry.toLocation}</span>,
  },
  { key: 'transferredByName', header: 'By' },
];

interface TransferHistoryTableProps {
  transfers: TraceTransferEntry[];
}

export function TransferHistoryTable({ transfers }: TransferHistoryTableProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-foreground">Transfer History</h3>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={transfers}
          keyExtractor={(entry) => entry.transferId}
          emptyMessage="No transfers recorded for this batch"
        />
      </CardContent>
    </Card>
  );
}
