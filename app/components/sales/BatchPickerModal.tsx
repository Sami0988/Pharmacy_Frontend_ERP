'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useGetItemBatchesQuery } from '@/store/api/reports-api-slice';
import type { FefoSuggestion } from '@/types/api';
import { useTranslations } from '@/lib/i18n';

interface BatchPickerModalProps {
  open: boolean;
  itemId: string | null;
  itemName: string | null;
  quantity: number;
  selectedBatchId: string | null;
  onClose: () => void;
  onSelectBatch: (batch: { batchId: string; batchNo: string; sellingPrice: number }) => void;
}

function getDaysUntilExpiry(expiryDate: string): number {
  const now = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getExpiryBadgeVariant(days: number): 'danger' | 'default' | 'success' {
  if (days <= 30) return 'danger';
  if (days <= 60) return 'default';
  return 'success';
}

export function BatchPickerModal({
  open,
  itemId,
  itemName,
  quantity,
  selectedBatchId,
  onClose,
  onSelectBatch,
}: BatchPickerModalProps) {
  const { t } = useTranslations();
  const [pendingBatchId, setPendingBatchId] = useState<string | null>(null);

  const { data: batches, isLoading } = useGetItemBatchesQuery(
    { itemId: itemId || '' },
    { skip: !open || !itemId }
  );

  const suggestions = useMemo(() => batches ?? [], [batches]);

  const sorted = useMemo(
    () =>
      [...suggestions].sort(
        (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
      ),
    [suggestions]
  );

  const handleSelect = () => {
    const batch = sorted.find((s) => s.batchId === pendingBatchId);
    if (batch) {
      onSelectBatch({
        batchId: batch.batchId,
        batchNo: batch.batchNo,
        sellingPrice: batch.sellingPrice,
      });
      onClose();
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setPendingBatchId(null);
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('sales.selectBatchFor').replace('{name}', itemName || '')}</DialogTitle>
          <DialogDescription>
            {t('sales.chooseBatchDescription').replace('{count}', String(quantity))}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-80 overflow-y-auto py-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : sorted.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {t('sales.noBatchesAvailable')}
            </p>
          ) : (
            sorted.map((batch) => {
              const days = getDaysUntilExpiry(batch.expiryDate);
              const isSelected = pendingBatchId === batch.batchId;

              return (
                <label
                  key={batch.batchId}
                  className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  <input
                    type="radio"
                    name="batch-picker"
                    value={batch.batchId}
                    checked={isSelected}
                    onChange={() => setPendingBatchId(batch.batchId)}
                    className="accent-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{batch.batchNo}</span>
                      <Badge variant={getExpiryBadgeVariant(days)}>
                        {days}d
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Exp: {new Date(batch.expiryDate).toLocaleDateString()} ·{' '}
                      {batch.availableQuantity} available
                    </p>
                  </div>
                  <span className="text-sm font-medium text-foreground whitespace-nowrap">
                    {batch.sellingPrice.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'ETB',
                    })}
                  </span>
                </label>
              );
            })
          )}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSelect}
            disabled={!pendingBatchId || pendingBatchId === selectedBatchId}
          >
            {t('sales.select')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
