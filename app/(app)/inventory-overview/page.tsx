'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from '@/lib/i18n';
import { useGetItemsQuery } from '@/store/api/items-api-slice';
import { useGetInventoryCountsQuery, useGetCategoryBreakdownQuery } from '@/store/api/dashboard-api-slice';
import { useGetStockByLocationQuery } from '@/store/api/transfers-api-slice';
import { StatCard } from '@/components/dashboard-ui/StatCard';
import { CategoryCard } from '@/components/dashboard-ui/CategoryCard';
import { StatusPill } from '@/components/dashboard-ui/StatusPill';
import { SearchInput } from '@/components/ui/SearchInput';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { DataTable, Column } from '@/components/ui/DataTable';
import {
  Package,
  AlertTriangle,
  XCircle,
  Pill,
  Syringe,
  Heart,
  Brain,
  Eye,
  Bone,
  Stethoscope,
  Shield,
  Microscope,
} from 'lucide-react';
import { motion } from 'motion/react';
import type { Item } from '@/types/api';

const categoryIconMap: Record<string, typeof Pill> = {
  Antibiotics: Pill,
  'Pain Relievers': Heart,
  'Vitamins & Supplements': Shield,
  'Cardiovascular': Heart,
  'Respiratory': Stethoscope,
  'Gastrointestinal': Syringe,
  'Dermatology': Microscope,
  'Ophthalmology': Eye,
  'Neurology': Brain,
  'Orthopedics': Bone,
};

const categoryColorMap: Record<string, string> = {
   Antibiotics: 'cyan',
   'Pain Relievers': 'red',
   'Vitamins & Supplements': 'green',
   Cardiovascular: 'purple',
   Respiratory: 'cyan',
   Gastrointestinal: 'amber',
   Dermatology: 'pink',
   Ophthalmology: 'cyan',
   Neurology: 'purple',
   Orthopedics: 'gray',
};

export default function InventoryOverviewPage() {
  const { t } = useTranslations();
  const [search, setSearch] = useState('');

  const { data: inventoryCounts, isLoading: countsLoading } = useGetInventoryCountsQuery();
  const { data: categories, isLoading: categoriesLoading } = useGetCategoryBreakdownQuery();
  const { data: itemsResponse, isLoading: itemsLoading } = useGetItemsQuery({});
  const items = useMemo(() => itemsResponse?.data ?? [], [itemsResponse]);
  const { data: stockData } = useGetStockByLocationQuery({});

  const filteredItems = useMemo(() => {
    if (!items) return [];
    const q = search.toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.genericName && item.genericName.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q))
    );
  }, [items, search]);

  const stockMap = useMemo(() => {
    const map: Record<string, { store: number; dispatcher: number }> = {};
    if (stockData) {
      stockData.data.forEach((s: { itemId: string; storeQuantity: number; dispatcherQuantity: number }) => {
        map[s.itemId] = {
          store: (map[s.itemId]?.store || 0) + s.storeQuantity,
          dispatcher: (map[s.itemId]?.dispatcher || 0) + s.dispatcherQuantity,
        };
      });
    }
    return map;
  }, [stockData]);

  const getItemStatus = (item: Item): 'in_stock' | 'low_stock' | 'out_of_stock' => {
    const stock = stockMap[item.id];
    const total = (stock?.store || 0) + (stock?.dispatcher || 0);
    if (total === 0) return 'out_of_stock';
    if (total < (item.reorderLevel || 10)) return 'low_stock';
    return 'in_stock';
  };

  const columns: Column<Item>[] = [
    {
      key: 'name',
      header: t('inventory.itemName'),
      render: (item) => (
        <div>
          <p className="text-sm font-medium text-foreground">{item.name}</p>
          {item.genericName && (
            <p className="text-xs text-muted-foreground">{item.genericName}</p>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      header: t('inventory.category'),
      render: (item) => (
        <span className="text-sm text-muted-foreground">{item.category || '-'}</span>
      ),
    },
    {
      key: 'quantity',
      header: t('inventoryOverview.quantity'),
      render: (item) => {
        const stock = stockMap[item.id];
        const total = (stock?.store || 0) + (stock?.dispatcher || 0);
        return <span className="text-sm font-medium text-foreground">{total}</span>;
      },
    },
    {
      key: 'status',
      header: t('inventoryOverview.status'),
      render: (item) => <StatusPill status={getItemStatus(item)} />,
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-foreground">{t('inventoryOverview.title')}</h1>
      </motion.div>

      {/* Top stats row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <StatCard
          title={t('inventoryOverview.totalProducts')}
          value={inventoryCounts?.totalProducts ?? (items?.length ?? 0)}
          icon={Package}
          variant="hero"
          isLoading={countsLoading}
        />
        <StatCard
          title={t('inventoryOverview.lowStock')}
          value={inventoryCounts?.lowStockCount ?? 0}
          icon={AlertTriangle}
          isLoading={countsLoading}
        />
        <StatCard
          title={t('inventoryOverview.outOfStock')}
          value={inventoryCounts?.outOfStockCount ?? 0}
          icon={XCircle}
          isLoading={countsLoading}
        />
      </motion.div>

      {/* Category tiles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-base font-semibold text-foreground mb-3">{t('inventoryOverview.categoryBreakdown')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {(categories || []).map((cat) => {
            const Icon = categoryIconMap[cat.category] || Package;
            const color = categoryColorMap[cat.category] || 'cyan';
            return (
              <CategoryCard
                key={cat.category}
                name={cat.category}
                count={cat.count}
                icon={Icon}
                color={color}
                isLoading={categoriesLoading}
              />
            );
          })}
          {(!categories || categories.length === 0) && !categoriesLoading && (
            <div className="col-span-full text-center py-8 text-muted-foreground text-sm">
              {t('common.noData')}
            </div>
          )}
        </div>
      </motion.div>

      {/* Product list table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">{t('inventoryOverview.productList')}</h3>
              <div className="w-64">
                <SearchInput
                  onSearch={setSearch}
                  placeholder={t('common.search')}
                  className=""
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={filteredItems}
              isLoading={itemsLoading}
              keyExtractor={(item) => item.id}
              emptyMessage={t('inventoryOverview.noProducts')}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
