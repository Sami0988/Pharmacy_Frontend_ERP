'use client';

import Link from 'next/link';
import { AlertTriangle, Package } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import type { ReorderSuggestion } from '@/types/api';

const columns: Column<ReorderSuggestion>[] = [
  {
    key: 'itemName',
    header: 'Item',
    render: (item) => (
      <div>
        <p className="text-sm font-medium text-foreground">{item.itemName}</p>
          {item.genericName && <p className="text-xs text-muted-foreground">{item.genericName}</p>}
      </div>
    ),
  },
  {
    key: 'currentStock',
    header: 'Stock',
    render: (item) => (
      <span className={`text-sm font-medium ${item.currentStock === 0 ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
        {item.currentStock}
      </span>
    ),
  },
  { key: 'reorderLevel', header: 'Reorder Lvl', render: (item) => <span className="text-sm text-muted-foreground">{item.reorderLevel}</span> },
  { key: 'suggestedQuantity', header: 'Suggested Qty', render: (item) => <span className="text-sm font-medium text-primary">{item.suggestedQuantity}</span> },
  { key: 'lastSupplierName', header: 'Supplier', render: (item) => <span className="text-sm text-muted-foreground">{item.lastSupplierName || '-'}</span> },
];

interface ReorderSuggestionsTableProps {
  suggestions: ReorderSuggestion[];
  isLoading?: boolean;
}

export function ReorderSuggestionsTable({ suggestions, isLoading }: ReorderSuggestionsTableProps) {
  if (isLoading) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-40" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Reorder Suggestions</h3>
          </div>
          <Link href="/goods-receipts/new">
            <Button variant="ghost" size="sm">
              <Package className="h-4 w-4 mr-1" />
              Create GRN
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={suggestions}
          keyExtractor={(item) => item.itemId}
          emptyMessage="All items are adequately stocked"
        />
      </CardContent>
    </Card>
  );
}
