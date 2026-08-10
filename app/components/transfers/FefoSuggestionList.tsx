'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useGetFefoSuggestionsQuery } from '@/store/api/transfers-api-slice';
import type { FefoSuggestion } from '@/types/api';

interface FefoSuggestionListProps {
  itemId: string;
  quantityNeeded: number;
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
  allocatedQuantity: number;
}

function calculateAllocations(
  suggestions: FefoSuggestion[],
  quantityNeeded: number
): BatchAllocation[] {
  const sorted = [...suggestions].sort(
    (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
  );

  const allocations: BatchAllocation[] = [];
  let remaining = quantityNeeded;

  for (const batch of sorted) {
    if (remaining <= 0) break;
    const allocQty = Math.min(batch.availableQuantity, remaining);
    allocations.push({ batch, allocatedQuantity: allocQty });
    remaining -= allocQty;
  }

  return allocations;
}

export function FefoSuggestionList({
  itemId,
  quantityNeeded,
  selectedBatchId,
  onSelectBatch,
}: FefoSuggestionListProps) {
  const { data: response, isLoading, refetch } = useGetFefoSuggestionsQuery(
    { itemId, quantityNeeded },
    { skip: !itemId || quantityNeeded <= 0 }
  );

  const batchSuggestions = useMemo(() => response?.suggestions ?? [], [response]);

  const allocations = useMemo(() => {
    if (batchSuggestions.length === 0) return [];
    return calculateAllocations(batchSuggestions, quantityNeeded);
  }, [batchSuggestions, quantityNeeded]);

  const totalAvailable = useMemo(() => {
    return batchSuggestions.reduce((sum, s) => sum + s.availableQuantity, 0);
  }, [batchSuggestions]);

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
            No available batches found at Store for this item.
          </p>
        </CardContent>
      </Card>
    );
  }

  const recommendedBatchId = allocations.length > 0 ? allocations[0].batch.batchId : null;
  const canFulfill = totalAvailable >= quantityNeeded;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Store → Dispatcher — FEFO Suggestion
          </h3>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canFulfill && (
          <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
            Insufficient stock at Store. Available: {totalAvailable}, Needed: {quantityNeeded}.
          </div>
        )}

        <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
          The system recommends transferring from the soonest-expiring batches first (FEFO).
          {canFulfill && allocations.length > 1 && (
            <> This transfer will be split across {allocations.length} batch(es).</>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-secondary-foreground">Available Batches at Store:</p>
          {batchSuggestions.map((batch) => {
            const daysUntilExpiry = getDaysUntilExpiry(batch.expiryDate);
            const isRecommended = batch.batchId === recommendedBatchId;
            const isSelected = batch.batchId === selectedBatchId;
            const allocation = allocations.find((a) => a.batch.batchId === batch.batchId);

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
                        <Badge variant="success">Recommended</Badge>
                      )}
                      <Badge variant={getExpiryBadgeVariant(daysUntilExpiry)}>
                        {daysUntilExpiry}d to expiry
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Expires: {new Date(batch.expiryDate).toLocaleDateString()} ·{' '}
                      Available: {batch.availableQuantity}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {allocation && (
                    <span className="text-sm font-medium text-blue-700">
                      Transfer {allocation.allocatedQuantity}
                    </span>
                  )}
                  <Button
                    variant={isSelected ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() =>
                      onSelectBatch(
                        batch.batchId,
                        allocation?.allocatedQuantity || batch.availableQuantity
                      )
                    }
                  >
                    {isSelected ? 'Selected' : 'Select'}
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
