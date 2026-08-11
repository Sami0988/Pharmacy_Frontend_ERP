'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { useGetSalesQuery } from '@/store/api/sales-api-slice';
import { useTranslations } from '@/lib/i18n';
import { motion } from 'motion/react';
import { SalesTable } from '@/components/sales/SalesTable';

export default function SalesPage() {
  const { t } = useTranslations();
  const [customerFilter, setCustomerFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const handleSearch = useCallback((value: string) => {
    setCustomerFilter(value);
  }, []);

  const { data: response, isLoading, isFetching } = useGetSalesQuery({
    customerId: customerFilter || undefined,
    page,
    limit,
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('sales.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('sales.description')}</p>
        </div>
        <Link href="/sales/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('sales.newSale')}
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
          placeholder={t('sales.filterByCustomer')}
          className="max-w-md"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <SalesTable
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
