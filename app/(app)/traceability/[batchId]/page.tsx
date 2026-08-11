'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useLazyTraceByBatchIdQuery } from '@/store/api/traceability-api-slice';
import { TraceResultCard } from '@/components/traceability/TraceResultCard';
import { useTranslations } from '@/lib/i18n';
import { useEffect } from 'react';

interface TraceBatchPageProps {
  params: Promise<{ batchId: string }>;
}

export default function TraceBatchPage({ params }: TraceBatchPageProps) {
  const { batchId } = use(params);
  const { t } = useTranslations();
  const [trigger, { data, isLoading, error }] = useLazyTraceByBatchIdQuery();

  useEffect(() => {
    if (batchId) trigger(batchId);
  }, [batchId, trigger]);

  return (
    <div className="space-y-6">
      <Link
        href="/traceability"
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('traceability.searchAnotherBatch')}
      </Link>

      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mb-2" />
          <p className="text-sm text-muted-foreground">{t('traceability.loadingTrace')}</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-sm text-red-600">{t('traceability.traceLoadFailed')}</p>
        </div>
      )}

      {data && <TraceResultCard result={data} />}
    </div>
  );
}
