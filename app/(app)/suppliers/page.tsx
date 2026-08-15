'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useGetSuppliersQuery } from '@/store/api/suppliers-api-slice';
import { SuppliersTable } from '@/components/suppliers/SuppliersTable';
import { SupplierSearchBar } from '@/components/suppliers/SupplierSearchBar';
import { useTranslations } from '@/lib/i18n';
import { motion } from 'motion/react';

export default function SuppliersPage() {
  const { t } = useTranslations();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const { data: response, isLoading, isFetching } = useGetSuppliersQuery({
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
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('suppliers.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('suppliers.description')}</p>
        </div>
        <Link href="/suppliers/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('suppliers.newSupplier')}
          </Button>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <SupplierSearchBar onSearch={handleSearch} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <SuppliersTable
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
