'use client';

import { useState } from 'react';
import { ExternalLink, FileText, AlertTriangle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StockSplitBadges } from './StockSplitBadges';
import { SalesHistoryTable } from './SalesHistoryTable';
import { TransferHistoryTable } from './TransferHistoryTable';
import { RecallImpactView } from './RecallImpactView';
import { useTranslations } from '@/lib/i18n';
import type { TraceResult } from '@/types/api';

function ExpiryBadge({ expiryDate }: { expiryDate: string }) {
  const { t } = useTranslations();
  const now = new Date();
  const exp = new Date(expiryDate);
  const daysUntil = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntil <= 0) {
    return <Badge variant="danger" className="text-sm">{t('traceability.expiredAgo', { days: Math.abs(daysUntil) })}</Badge>;
  }
  if (daysUntil <= 30) {
    return <Badge variant="danger" className="text-sm flex items-center gap-1"><Clock className="h-3 w-3" />{t('traceability.expiresIn', { days: daysUntil })}</Badge>;
  }
  if (daysUntil <= 60) {
    return <Badge variant="secondary" className="text-sm flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200"><Clock className="h-3 w-3" />{t('traceability.expiresIn', { days: daysUntil })}</Badge>;
  }
  return <Badge variant="secondary" className="text-sm">{expiryDate}</Badge>;
}

interface TraceResultCardProps {
  result: TraceResult;
}

export function TraceResultCard({ result }: TraceResultCardProps) {
  const { t } = useTranslations();
  const [showRecall, setShowRecall] = useState(false);

  return (
    <div className="space-y-6">
      {/* Top section: Item + Batch + Expiry */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">{result.itemName}</h2>
              {result.itemGenericName && (
                <p className="text-sm text-muted-foreground">{result.itemGenericName}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                {t('traceability.batch')}: <span className="font-mono font-medium">{result.batchNumber}</span>
              </p>
            </div>
            <ExpiryBadge expiryDate={result.expiryDate} />
          </div>
        </CardContent>
      </Card>

      {/* Source section: Supplier + GRN + Invoice */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t('traceability.source')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground">{t('traceability.supplier')}</p>
              <p className="text-sm font-medium text-foreground">{result.supplierName}</p>
              {result.supplierPhone && (
                <p className="text-xs text-muted-foreground">{result.supplierPhone}</p>
              )}
              {result.supplierLicenseNumber && (
                <p className="text-xs text-muted-foreground">{t('traceability.license')}: {result.supplierLicenseNumber}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('traceability.grnNumber')}</p>
              <p className="text-sm font-medium text-foreground font-mono">{result.grnNumber}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('traceability.received')}: {new Date(result.receiptDate).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Invoice document button — visually prominent */}
          {result.documentUnavailable ? (
            <div className="flex items-center gap-2 rounded-lg bg-background border border-border px-4 py-3">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t('traceability.invoiceUnavailable')}</p>
            </div>
          ) : result.invoiceDocumentUrl ? (
            <a
              href={result.invoiceDocumentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-3 text-sm font-semibold shadow-sm transition-colors"
            >
              <FileText className="h-4 w-4" />
              {t('traceability.viewInvoice')}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}

          {/* Payment status */}
          <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">{t('traceability.totalCost')}</p>
              <p className="text-sm font-medium text-foreground">{(result.totalCost ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'ETB' })}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('traceability.paid')}</p>
              <p className="text-sm font-medium text-green-700">{(result.paidAmount ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'ETB' })}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('traceability.outstanding')}</p>
              <p className={`text-sm font-medium ${(result.outstanding ?? 0) > 0 ? 'text-red-600' : 'text-foreground'}`}>
                {(result.outstanding ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'ETB' })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock split */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t('traceability.currentStock')}</h3>
          <StockSplitBadges
            storeQuantity={result.storeQuantity}
            dispatcherQuantity={result.dispatcherQuantity}
            totalSold={result.totalSold}
          />
        </CardContent>
      </Card>

      {/* Sales history */}
      {result.salesHistory.length > 0 && (
        <SalesHistoryTable sales={result.salesHistory} />
      )}

      {/* Transfer history */}
      {result.transferHistory.length > 0 && (
        <TransferHistoryTable transfers={result.transferHistory} />
      )}

      {/* Recall impact */}
      <div className="flex justify-end">
        <Button variant="secondary" onClick={() => setShowRecall(!showRecall)}>
          {showRecall ? t('traceability.hideRecallImpact') : t('traceability.viewRecallImpact')}
        </Button>
      </div>
      {showRecall && (
        <RecallImpactView batchId={result.batchId} batchNumber={result.batchNumber} />
      )}
    </div>
  );
}
