'use client';

import { useState, useCallback, useRef } from 'react';
import { FileSearch } from 'lucide-react';
import { BatchSearchBar } from '@/components/traceability/BatchSearchBar';
import { TraceResultCard } from '@/components/traceability/TraceResultCard';
import { motion } from 'motion/react';
import { useLazyTraceByBatchNoQuery } from '@/store/api/traceability-api-slice';
import { useTranslations } from '@/lib/i18n';

export default function TraceabilityPage() {
  const { t } = useTranslations();
  const [searchValue, setSearchValue] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const [trigger, { data, isLoading, error }] = useLazyTraceByBatchNoQuery();

  const doSearch = useCallback((value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    // Reject obviously invalid search values (JSON, URLs, etc.)
    if (trimmed.startsWith('[') || trimmed.startsWith('{') || trimmed.length > 100) return;
    setHasSearched(true);
    trigger(trimmed);
  }, [trigger]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = value.trim();
    if (trimmed.length >= 3) {
      debounceRef.current = setTimeout(() => doSearch(trimmed), 400);
    }
  };

  const handleSearch = () => doSearch(searchValue);

  const results = data || [];
  const singleResult = results.length === 1 ? results[0] : null;
  const multipleResults = results.length > 1 ? results : null;
  const noResults = hasSearched && !isLoading && !error && results.length === 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 mb-3">
          <FileSearch className="h-6 w-6 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">{t('traceability.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('traceability.subtitle')}</p>
      </motion.div>

      {/* Search bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="max-w-2xl mx-auto"
      >
        <BatchSearchBar value={searchValue} onChange={handleSearchChange} onSearch={handleSearch} />
      </motion.div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-8 text-muted-foreground">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mb-2" />
          <p className="text-sm">{t('traceability.searching')}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-8">
          <p className="text-sm text-red-600">
            {'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data
              ? (error.data as { message: string }).message
              : t('traceability.error')}
          </p>
        </div>
      )}

      {/* No results */}
      {noResults && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            {t('traceability.noResults')} &ldquo;{searchValue.trim().toLowerCase().slice(0, 50)}{searchValue.trim().length > 50 ? '...' : ''}&rdquo;
          </p>
        </div>
      )}

      {/* Single result */}
      {singleResult && <TraceResultCard result={singleResult} />}

      {/* Multiple results — disambiguation */}
      {multipleResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <p className="text-sm text-muted-foreground text-center">
            {t('traceability.foundBatches', { count: multipleResults.length })} &ldquo;{searchValue.trim()}&rdquo;
          </p>
          <div className="grid gap-3 max-w-lg mx-auto">
            {multipleResults.map((result) => (
              <a
                key={result.batchId}
                href={`/traceability/${result.batchId}`}
                className="block rounded-lg border border-border bg-card px-4 py-3 hover:border-primary hover:shadow-sm transition-colors"
              >
                <p className="text-sm font-medium text-foreground">{result.itemName}</p>
                <p className="text-xs text-muted-foreground">
                  {t('traceability.batch')}: {result.batchNumber} · {t('traceability.received')}: {new Date(result.receiptDate).toLocaleDateString()}
                </p>
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
