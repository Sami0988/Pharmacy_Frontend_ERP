'use client';

import { useMemo, useEffect } from 'react';
import { X, RefreshCw, Package, Pill } from 'lucide-react';
import { useGetItemBatchesQuery } from '@/store/api/reports-api-slice';
import type { PosCartItem } from './PosCart';
import { useTranslations } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface PosCartLineProps {
  item: PosCartItem;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  onBatchSelected: (itemId: string, batchId: string, batchNo: string) => void;
  onChangeBatch: (itemId: string) => void;
  onToggleSaleUnit: (itemId: string) => void;
}

export function PosCartLine({
  item,
  onUpdateQuantity,
  onRemove,
  onBatchSelected,
  onChangeBatch,
  onToggleSaleUnit,
}: PosCartLineProps) {
  const { t } = useTranslations();
  const { data: batches, refetch } = useGetItemBatchesQuery(
    { itemId: item.itemId },
    { skip: item.quantity <= 0 }
  );

  const batchInfo = useMemo(() => {
    if (!batches || batches.length === 0) return null;
    const sorted = [...batches].sort(
      (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
    );
    const selected = sorted.find((s) => s.batchId === item.batchId) || sorted[0];
    return {
      batchId: selected.batchId,
      batchNo: selected.batchNo,
      expiryDate: selected.expiryDate,
    };
  }, [batches, item.batchId]);

  useEffect(() => {
    if (batchInfo && batchInfo.batchId !== item.batchId) {
      onBatchSelected(item.itemId, batchInfo.batchId, batchInfo.batchNo);
    }
  }, [batchInfo, item.itemId, item.batchId, onBatchSelected]);

  return (
    <div className="py-3 border-b border-border last:border-0">
      {/* Mobile: stacked layout */}
      <div className="flex items-start justify-between gap-2 sm:items-center sm:gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{item.itemName}</p>
          {batchInfo ? (
            <p className="text-xs text-muted-foreground">
              {t('sales.batch')}: {batchInfo.batchNo} · Exp: {new Date(batchInfo.expiryDate).toLocaleDateString()}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">{t('sales.loadingBatch')}</p>
          )}
          {item.packSize != null && item.packSize > 1 && (
            <p className="text-xs text-muted-foreground">
              {item.saleUnit === 'pack' 
                ? `${item.quantity} pack × ${item.packPrice?.toLocaleString('en-US', { style: 'currency', currency: 'ETB' })} = ${item.subtotal.toLocaleString('en-US', { style: 'currency', currency: 'ETB' })}`
                : `${item.quantity} unit × ${item.unitPrice.toLocaleString('en-US', { style: 'currency', currency: 'ETB' })} = ${item.subtotal.toLocaleString('en-US', { style: 'currency', currency: 'ETB' })}`
              }
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <p className="text-right text-sm font-medium text-foreground">
            {item.subtotal.toLocaleString('en-US', { style: 'currency', currency: 'ETB' })}
          </p>
          <button
            type="button"
            onClick={() => onRemove(item.itemId)}
            className="p-1 text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Row 2: quantity + actions */}
      <div className="flex items-center justify-between mt-2 sm:mt-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.itemId, Math.max(1, item.quantity - 1))}
            className="h-7 w-7 rounded border border-border flex items-center justify-center text-muted-foreground hover:bg-accent"
          >
            −
          </button>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (val > 0) onUpdateQuantity(item.itemId, val);
            }}
            className="h-7 w-14 text-center text-sm border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring"
            min={1}
          />
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.itemId, item.quantity + 1)}
            className="h-7 w-7 rounded border border-border flex items-center justify-center text-muted-foreground hover:bg-accent"
          >
            +
          </button>
        </div>

        <div className="flex items-center gap-1">
          {item.packSize != null && item.packSize > 1 && (
            <button
              type="button"
              onClick={() => onToggleSaleUnit(item.itemId)}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors',
                item.saleUnit === 'pack'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              )}
              title={item.saleUnit === 'pack' ? 'Selling by pack' : 'Selling by unit'}
            >
              {item.saleUnit === 'pack' ? <Package className="h-3 w-3" /> : <Pill className="h-3 w-3" />}
              {item.saleUnit === 'pack' ? 'Pack' : 'Unit'}
            </button>
          )}
          <button
            type="button"
            onClick={() => refetch()}
            className="p-1 text-muted-foreground hover:text-muted-foreground"
            title={t('sales.refreshBatch')}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onChangeBatch(item.itemId)}
            className="text-xs text-primary hover:text-primary/80"
          >
            {t('sales.change')}
          </button>
        </div>
      </div>
    </div>
  );
}
