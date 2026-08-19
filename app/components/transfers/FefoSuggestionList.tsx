'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useGetFefoSuggestionsQuery } from '@/store/api/transfers-api-slice';
import type { FefoSuggestion } from '@/types/api';
import { useTranslations } from '@/lib/i18n';

interface FefoSuggestionListProps {
  itemId: string;
  quantityNeeded: number;
  transferMode: 'packs' | 'quantity';
  selectedBatchId: string | null;
  onSelectBatch: (batchId: string, quantity: number) => void;
}

function getDaysUntilExpiry(expiryDate: string): number {
  const now = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getExpiryBadgeVariant(daysUntilExpiry: number): 'danger' | 'default' | 'success' {
  if (daysUntilExpiry <= 30) return 'danger';
  if (daysUntilExpiry <= 60) return 'default';
  return 'success';
}

interface BatchAllocation {
  batch: FefoSuggestion;
  allocatedPacks: number;
  allocatedUnits: number;
}

function calculateAllocations(
  suggestions: FefoSuggestion[],
  quantityNeeded: number,
  transferMode: 'packs' | 'quantity'
): BatchAllocation[] {
  const sorted = [...suggestions].sort(
    (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
  );

  const allocations: BatchAllocation[] = [];

  if (transferMode === 'packs') {
    let packsRemaining = quantityNeeded;
    for (const batch of sorted) {
      if (packsRemaining <= 0) break;
      const availablePacks = batch.availablePacks ?? (batch.packSize ? Math.floor(batch.availableQuantity / batch.packSize) : 0);
      const allocPacks = Math.min(availablePacks, packsRemaining);
      const packSize = batch.packSize || 1;
      allocations.push({ batch, allocatedPacks: allocPacks, allocatedUnits: allocPacks * packSize });
      packsRemaining -= allocPacks;
    }
  } else {
    let unitsRemaining = quantityNeeded;
    for (const batch of sorted) {
      if (unitsRemaining <= 0) break;
      const allocUnits = Math.min(batch.availableQuantity, unitsRemaining);
      const packSize = batch.packSize || 1;
      allocations.push({ batch, allocatedPacks: Math.ceil(allocUnits / packSize), allocatedUnits: allocUnits });
      unitsRemaining -= allocUnits;
    }
  }

  return allocations;
}

export function FefoSuggestionList({
  itemId,
  quantityNeeded,
  transferMode,
  selectedBatchId,
  onSelectBatch,
}: FefoSuggestionListProps) {
  const { t } = useTranslations();
  const { data: response, isLoading, refetch } = useGetFefoSuggestionsQuery(
    { itemId, quantityNeeded },
    { skip: !itemId || quantityNeeded <= 0 }
  );

  const batchSuggestions = useMemo(() => response?.suggestions ?? [], [response]);

  const allocations = useMemo(() => {
    if (batchSuggestions.length === 0) return [];
    return calculateAllocations(batchSuggestions, quantityNeeded, transferMode);
  }, [batchSuggestions, quantityNeeded, transferMode]);

  const totalAvailablePacks = useMemo(() => {
    return batchSuggestions.reduce((sum, s) => {
      const packs = s.availablePacks ?? (s.packSize ? Math.floor(s.availableQuantity / s.packSize) : 0);
      return sum + packs;
    }, 0);
  }, [batchSuggestions]);

  const canFulfill = useMemo(() => {
    if (transferMode === 'packs') {
      return totalAvailablePacks >= quantityNeeded;
    }
    const totalAvailableUnits = batchSuggestions.reduce((sum, s) => sum + s.availableQuantity, 0);
    return totalAvailableUnits >= quantityNeeded;
  }, [transferMode, totalAvailablePacks, quantityNeeded, batchSuggestions]);

  const recommendedBatchId = allocations.length > 0 ? allocations[0].batch.batchId : null;

  if (!itemId || quantityNeeded <= 0) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!response || batchSuggestions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            {t('transfers.noBatchesFound')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            {t('transfers.fefoSuggestionTitle')}
          </h3>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            {t('transfers.refresh')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canFulfill && (
          <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
            {t('transfers.insufficientStock').replace('{available}', String(totalAvailablePacks)).replace('{needed}', String(quantityNeeded))}
          </div>
        )}

        <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
          {t('transfers.fefoRecommendation')}
          {canFulfill && allocations.length > 1 && (
            <> {t('transfers.splitAcrossBatches').replace('{count}', String(allocations.length))}</>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-secondary-foreground">{t('transfers.availableBatchesAtStore')}</p>
          {batchSuggestions.map((batch) => {
            const daysUntilExpiry = getDaysUntilExpiry(batch.expiryDate);
            const isRecommended = batch.batchId === recommendedBatchId;
            const isSelected = batch.batchId === selectedBatchId;
            const allocation = allocations.find((a) => a.batch.batchId === batch.batchId);
            const availablePacks = batch.availablePacks ?? (batch.packSize ? Math.floor(batch.availableQuantity / batch.packSize) : 0);

            return (
              <div
                key={batch.batchId}
                className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                      : isRecommended
                        ? 'border-green-300 bg-green-50'
                        : 'border-border hover:bg-accent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {batch.batchNo}
                      </span>
                      {isRecommended && (
                        <Badge variant="success">{t('transfers.recommended')}</Badge>
                      )}
                      <Badge variant={getExpiryBadgeVariant(daysUntilExpiry)}>
                        {t('transfers.daysToExpiry').replace('{days}', String(daysUntilExpiry))}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('transfers.expiresOn')} {new Date(batch.expiryDate).toLocaleDateString()} ·{' '}
                      {batch.packSize && batch.packSize > 1 ? (
                        <>{availablePacks} packs ({batch.availableQuantity} units)</>
                      ) : (
                        <>{t('transfers.available')}: {batch.availableQuantity} units</>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {allocation && (
                    <span className="text-sm font-medium text-blue-700">
                      {transferMode === 'packs'
                        ? `${allocation.allocatedPacks} packs (${allocation.allocatedUnits} units)`
                        : `${allocation.allocatedUnits} units`}
                    </span>
                  )}
                  <Button
                    variant={isSelected ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() =>
                      onSelectBatch(
                        batch.batchId,
                        allocation?.allocatedPacks || availablePacks
                      )
                    }
                  >
                    {isSelected ? t('transfers.selected') : t('transfers.selectItem')}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
