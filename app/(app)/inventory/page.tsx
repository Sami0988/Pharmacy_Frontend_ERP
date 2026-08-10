'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { useGetItemsQuery } from '@/store/api/items-api-slice';
import { useGetStockByLocationQuery } from '@/store/api/transfers-api-slice';
import { motion } from 'motion/react';
import type { Item, StockByLocationRow } from '@/types/api';

type InventoryRow = Item & {
  quantity: number;
  status: string;
  sellingPrice?: number;
};

const formatPrice = (value?: string) => {
  if (!value) return '-';
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return value;
  return parsed.toFixed(2);
};

const columns: Column<InventoryRow>[] = [
  {
    key: 'name',
    header: 'Item Name',
    render: (item) => (
      <div>
        <p className="text-sm font-medium text-foreground">{item.name}</p>
        {item.genericName && <p className="text-xs text-muted-foreground">{item.genericName}</p>}
      </div>
    ),
  },
  { key: 'category', header: 'Category', render: (item) => <span className="text-sm text-muted-foreground">{item.category || '-'}</span> },
  { key: 'strength', header: 'Strength', render: (item) => <span className="text-sm text-muted-foreground">{item.strength || '-'}</span> },
  { key: 'unit', header: 'Unit', render: (item) => <span className="text-sm text-muted-foreground">{item.unit}</span> },
  { key: 'sellingPrice', header: 'Price', render: (item) => <span className="text-sm text-muted-foreground">{formatPrice(String(item.sellingPrice ?? ''))}</span> },
  { key: 'reorderLevel', header: 'Reorder Lvl', render: (item) => <span className="text-sm text-muted-foreground">{item.reorderLevel}</span> },
  {
    key: 'quantity',
    header: 'Quantity',
    render: (item) => <span className="text-sm font-medium text-foreground">{item.quantity ?? 0}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (item) => <span className="text-sm text-muted-foreground">{item.status}</span>,
  },
];

export default function InventoryPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const { data: itemsResponse, isLoading, isFetching } = useGetItemsQuery({ search: search || undefined, page, limit });
  const { data: stockData } = useGetStockByLocationQuery({ search: search || undefined });
  const items = useMemo(() => itemsResponse?.data ?? [], [itemsResponse]);

  const stockMap = useMemo(() => {
    const map: Record<string, StockByLocationRow> = {};
    stockData?.data?.forEach((row) => {
      map[row.itemId] = row;
    });
    return map;
  }, [stockData]);

  const inventoryRows = useMemo(
    () =>
      items.map((item) => {
        const stock = stockMap[item.id];
        const quantity = stock?.totalQuantity ?? 0;
        const status = quantity === 0 ? 'Out of stock' : quantity < item.reorderLevel ? 'Low stock' : 'In stock';
        return { ...item, quantity, status, sellingPrice: stock?.sellingPrice };
      }) as InventoryRow[],
    [items, stockMap],
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-foreground" />
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
        </div>
        <Link href="/items/new">
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full max-w-md rounded-md border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <DataTable
          columns={columns}
          data={inventoryRows}
          isLoading={isLoading}
          isFetching={isFetching}
          keyExtractor={(item) => item.id}
          emptyMessage="No items found"
          onRowClick={(item) => router.push(`/items/${item.id}/edit`)}
          pagination={
            itemsResponse?.meta
              ? {
                  ...itemsResponse.meta,
                  onPageChange: (p) => setPage(p),
                  onLimitChange: (l) => { setLimit(l); setPage(1); },
                }
              : undefined
          }
        />
      </motion.div>
    </div>
  );
}
