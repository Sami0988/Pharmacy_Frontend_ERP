'use client';

import { useState, useCallback } from 'react';
import { useGetStockByLocationQuery } from '@/store/api/transfers-api-slice';
import { StockByLocationTable } from '@/components/transfers/StockByLocationTable';
import { SearchInput } from '@/components/ui/SearchInput';
import { motion } from 'motion/react';

export default function StockPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const { data: response, isLoading, isFetching } = useGetStockByLocationQuery({
    search: search || undefined,
    page,
    limit,
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Stock by Location</h1>
        <p className="text-sm text-muted-foreground">
          Current stock levels at Store and Dispatcher locations
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <SearchInput
          onSearch={handleSearch}
          placeholder="Search items..."
          className="max-w-md"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <StockByLocationTable
          data={response?.data ?? []}
          isLoading={isLoading}
          isFetching={isFetching}
          pagination={response?.meta ? {
            ...response.meta,
            onPageChange: setPage,
            onLimitChange: (newLimit: number) => { setLimit(newLimit); setPage(1); },
          } : undefined}
        />
      </motion.div>
    </div>
  );
}
