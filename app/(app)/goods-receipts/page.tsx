'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { useGetGoodsReceiptsQuery } from '@/store/api/goods-receipts-api-slice';
import { useGetAllSupplierBalancesQuery } from '@/store/api/supplier-payments-api-slice';
import { useTranslations } from '@/lib/i18n';
import { motion } from 'motion/react';
import { GoodsReceiptsTable } from '@/components/goods-receipts/GoodsReceiptsTable';

export default function GoodsReceiptsPage() {
  const { t } = useTranslations();
  const [supplierFilter, setSupplierFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const handleSearch = useCallback((value: string) => {
    setSupplierFilter(value);
  }, []);

  const { data: response, isLoading, isFetching } = useGetGoodsReceiptsQuery({
    supplierId: supplierFilter || undefined,
    page,
    limit,
  });

  const { data: supplierBalances } = useGetAllSupplierBalancesQuery();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('goodsReceipts.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('goodsReceipts.description')}</p>
        </div>
        <Link href="/goods-receipts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('goodsReceipts.newGrn')}
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
          placeholder={t('goodsReceipts.filterBySupplier')}
          className="max-w-md"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <GoodsReceiptsTable
          data={response?.data ?? []}
          isLoading={isLoading}
          isFetching={isFetching}
          supplierBalances={supplierBalances}
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
