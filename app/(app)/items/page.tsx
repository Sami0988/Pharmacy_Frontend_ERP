'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useGetItemsQuery } from '@/store/api/items-api-slice';
import { ItemsTable } from '@/components/items/ItemsTable';
import { ItemSearchBar } from '@/components/items/ItemSearchBar';
import { useTranslations } from '@/lib/i18n';
import { motion } from 'motion/react';

export default function ItemsPage() {
  const { t } = useTranslations();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleCategoryChange = useCallback((value: string) => {
    setCategory(value);
  }, []);

  const handleUnitChange = useCallback((value: string) => {
    setUnit(value);
  }, []);

  const { data: response, isLoading, isFetching } = useGetItemsQuery({
    search: search || undefined,
    category: category || undefined,
    unit: unit || undefined,
    page,
    limit,
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('items.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('items.description')}</p>
        </div>
        <Link href="/items/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('items.newItem')}
          </Button>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <ItemSearchBar
          onSearch={handleSearch}
          onCategoryChange={handleCategoryChange}
          onUnitChange={handleUnitChange}
          category={category}
          unit={unit}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <ItemsTable
          data={response?.data ?? []}
          isLoading={isLoading}
          isFetching={isFetching}
          pagination={response ? {
            ...response.meta,
            onPageChange: setPage,
            onLimitChange: (newLimit: number) => { setLimit(newLimit); setPage(1); },
          } : undefined}
        />
      </motion.div>
    </div>
  );
}
