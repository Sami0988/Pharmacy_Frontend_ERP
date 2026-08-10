'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileSearch } from 'lucide-react';
import { BatchSearchBar } from '@/components/traceability/BatchSearchBar';
import { QrScannerButton } from '@/components/traceability/QrScannerButton';
import { QrScannerModal } from '@/components/traceability/QrScannerModal';
import { TraceResultCard } from '@/components/traceability/TraceResultCard';
import { motion } from 'motion/react';
import { useLazyTraceByBatchNoQuery } from '@/store/api/traceability-api-slice';

export default function TraceabilityPage() {
  const [searchValue, setSearchValue] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [trigger, { data, isLoading, error }] = useLazyTraceByBatchNoQuery();

  const handleSearch = () => {
    const trimmed = searchValue.trim();
    if (!trimmed) return;
    setHasSearched(true);
    trigger(trimmed);
  };

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
        <h1 className="text-2xl font-bold text-foreground">Batch Traceability</h1>
        <p className="text-sm text-muted-foreground mt-1">Search by batch number or scan a QR code</p>
      </motion.div>

      {/* Search bar + scan button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col sm:flex-row items-center gap-3 max-w-2xl mx-auto"
      >
        <div className="flex-1 w-full">
          <BatchSearchBar value={searchValue} onChange={setSearchValue} onSearch={handleSearch} />
        </div>
        <QrScannerButton onClick={() => setShowScanner(true)} />
      </motion.div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-8 text-muted-foreground">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mb-2" />
          <p className="text-sm">Searching...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-8">
          <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
        </div>
      )}

      {/* No results */}
      {noResults && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            No batch found for &ldquo;{searchValue.trim().toLowerCase()}&rdquo;
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
            Found {multipleResults.length} batches matching &ldquo;{searchValue.trim()}&rdquo;
          </p>
          <div className="grid gap-3 max-w-lg mx-auto">
            {multipleResults.map((result) => (
              <Link
                key={result.batchId}
                href={`/traceability/${result.batchId}`}
                className="block rounded-lg border border-border bg-card px-4 py-3 hover:border-primary hover:shadow-sm transition-colors"
              >
                <p className="text-sm font-medium text-foreground">{result.itemName}</p>
                <p className="text-xs text-muted-foreground">
                  Batch: {result.batchNumber} · Received: {new Date(result.receiptDate).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* QR Scanner Modal */}
      <QrScannerModal open={showScanner} onClose={() => setShowScanner(false)} />
    </div>
  );
}
