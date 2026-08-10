'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { DataTable, Column } from '@/components/ui/DataTable';
import { PackageX } from 'lucide-react';
import type { DeadStockItem } from '@/types/api';

const columns: Column<DeadStockItem>[] = [
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
  { key: 'currentStock', header: 'Stock', render: (item) => <span className="text-sm font-medium text-foreground">{item.currentStock}</span> },
  {
    key: 'totalValue',
    header: 'Value',
    render: (item) => (
      <span className="text-sm font-medium text-red-600 dark:text-red-400">
        {item.totalValue.toLocaleString('en-US', { style: 'currency', currency: 'ETB' })}
      </span>
    ),
  },
  {
    key: 'daysSinceLastSale',
    header: 'Days Since Sale',
    render: (item) => (
      <span className="text-sm text-muted-foreground">
        {item.daysSinceLastSale !== null ? `${item.daysSinceLastSale}d` : 'Never sold'}
      </span>
    ),
  },
  {
    key: 'lastSoldDate',
    header: 'Last Sold',
    render: (item) => (
      <span className="text-xs text-muted-foreground">
        {item.lastSoldDate ? new Date(item.lastSoldDate).toLocaleDateString() : '-'}
      </span>
    ),
  },
];

interface DeadStockTableProps {
  items: DeadStockItem[];
  isLoading?: boolean;
}

export function DeadStockTable({ items, isLoading }: DeadStockTableProps) {
  if (isLoading) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-28" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-muted">
              <PackageX className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Dead Stock</h3>
          </div>
          {totalValue > 0 && (
            <span className="text-xs font-medium text-red-600 dark:text-red-400">
              {totalValue.toLocaleString('en-US', { style: 'currency', currency: 'ETB' })} tied up
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={items}
          keyExtractor={(item) => item.itemId}
          emptyMessage="No dead stock items"
        />
      </CardContent>
    </Card>
  );
}
