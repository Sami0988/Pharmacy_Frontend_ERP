'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useGetTransfersQuery } from '@/store/api/transfers-api-slice';
import { useGetItemsQuery } from '@/store/api/items-api-slice';
import { TransfersTable } from '@/components/transfers/TransfersTable';
import { useTranslations } from '@/lib/i18n';
import { motion } from 'motion/react';
import { SearchInput } from '@/components/ui/SearchInput';

export default function TransfersPage() {
  const { t } = useTranslations();
  const [itemFilter, setItemFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(itemFilter), 300);
    return () => clearTimeout(timer);
  }, [itemFilter]);

  const { data: itemResults } = useGetItemsQuery(
    { search: debouncedSearch || undefined, page: 1, limit: 1 },
    { skip: !debouncedSearch }
  );

  const matchedItemId = itemResults?.data?.[0]?.id;

  const handleSearch = useCallback((value: string) => {
    setItemFilter(value);
    setPage(1);
  }, []);

  const { data: response, isLoading, isFetching } = useGetTransfersQuery({
    itemId: matchedItemId || undefined,
    page,
    limit,
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('transfers.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('transfers.description')}</p>
        </div>
        <Link href="/transfers/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('transfers.newTransfer')}
          </Button>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <SearchInput
          onSearch={handleSearch}
          placeholder={t('transfers.filterByItem')}
          className="max-w-md"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <TransfersTable
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
