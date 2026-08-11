'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { useGetItemsQuery } from '@/store/api/items-api-slice';
import { useGetStockByLocationQuery } from '@/store/api/transfers-api-slice';
import { useTranslations } from '@/lib/i18n';
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

export default function InventoryPage() {
  const router = useRouter();
  const { t } = useTranslations();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const { data: itemsResponse, isLoading, isFetching } = useGetItemsQuery({ search: search || undefined, category: category || undefined, unit: unit || undefined, page, limit });
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
        const status = quantity === 0 ? t('inventory.outOfStock') : quantity < item.reorderLevel ? t('inventory.lowStock') : t('inventory.inStock');
        return { ...item, quantity, status, sellingPrice: stock?.sellingPrice };
      }) as InventoryRow[],
    [items, stockMap, t],
  );

  const columns: Column<InventoryRow>[] = useMemo(
    () => [
      {
        key: 'name',
        header: t('inventory.itemName'),
        render: (item) => (
          <div>
            <p className="text-sm font-medium text-foreground">{item.name}</p>
            {item.genericName && <p className="text-xs text-muted-foreground">{item.genericName}</p>}
          </div>
        ),
      },
      { key: 'category', header: t('inventory.category'), render: (item) => <span className="text-sm text-muted-foreground">{item.category || '-'}</span> },
      { key: 'strength', header: t('inventory.strength'), render: (item) => <span className="text-sm text-muted-foreground">{item.strength || '-'}</span> },
      { key: 'unit', header: t('inventory.unit'), render: (item) => <span className="text-sm text-muted-foreground">{item.unit}</span> },
      { key: 'sellingPrice', header: t('inventory.price'), render: (item) => <span className="text-sm text-muted-foreground">{formatPrice(String(item.sellingPrice ?? ''))}</span> },
      { key: 'reorderLevel', header: t('inventory.reorderLevel'), render: (item) => <span className="text-sm text-muted-foreground">{item.reorderLevel}</span> },
      {
        key: 'quantity',
        header: t('common.quantity'),
        render: (item) => <span className="text-sm font-medium text-foreground">{item.quantity ?? 0}</span>,
      },
      {
        key: 'status',
        header: t('common.status'),
        render: (item) => <span className="text-sm text-muted-foreground">{item.status}</span>,
      },
    ],
    [t],
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
          <h1 className="text-2xl font-bold text-foreground">{t('inventory.title')}</h1>
        </div>
        <Link href="/items/new">
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            {t('inventory.addItem')}
          </Button>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <input
          type="text"
          placeholder={t('inventory.searchItems')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full max-w-md rounded-md border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="h-10 rounded-md border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">{t('inventory.allCategories')}</option>
          <option value="Analgesic">Analgesic</option>
          <option value="Antibiotic">Antibiotic</option>
          <option value="Antidiabetic">Antidiabetic</option>
          <option value="Antihypertensive">Antihypertensive</option>
          <option value="Gastrointestinal">Gastrointestinal</option>
          <option value="Anti-inflammatory">Anti-inflammatory</option>
          <option value="Antihistamine">Antihistamine</option>
          <option value="Antimalarial">Antimalarial</option>
          <option value="Bronchodilator">Bronchodilator</option>
          <option value="Corticosteroid">Corticosteroid</option>
          <option value="Anxiolytic">Anxiolytic</option>
          <option value="Electrolyte">Electrolyte</option>
          <option value="Supplement">Supplement</option>
        </select>
        <select
          value={unit}
          onChange={(e) => { setUnit(e.target.value); setPage(1); }}
          className="h-10 rounded-md border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">{t('inventory.allUnits')}</option>
          <option value="tablet">Tablet</option>
          <option value="capsule">Capsule</option>
          <option value="inhaler">Inhaler</option>
          <option value="sachet">Sachet</option>
          <option value="syrup">Syrup</option>
          <option value="injection">Injection</option>
          <option value="cream">Cream</option>
          <option value="drops">Drops</option>
        </select>
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
          emptyMessage={t('inventory.noItems')}
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
