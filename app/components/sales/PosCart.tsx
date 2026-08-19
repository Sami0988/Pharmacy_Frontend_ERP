'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { PosCartLine } from './PosCartLine';
import { useTranslations } from '@/lib/i18n';

export interface PosCartItem {
  itemId: string;
  itemName: string;
  genericName?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  batchId?: string;
  batchNo?: string;
  packSize?: number;
  packPrice?: number;
  saleUnit: 'single' | 'pack';
}

interface PosCartProps {
  items: PosCartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  onBatchSelected: (itemId: string, batchId: string, batchNo: string) => void;
  onChangeBatch: (itemId: string) => void;
  onToggleSaleUnit: (itemId: string) => void;
}

export function PosCart({
  items,
  onUpdateQuantity,
  onRemove,
  onBatchSelected,
  onChangeBatch,
  onToggleSaleUnit,
}: PosCartProps) {
  const { t } = useTranslations();
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            {t('sales.cart')} ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h3>
          <p className="text-2xl font-bold text-foreground">
            {total.toLocaleString('en-US', { style: 'currency', currency: 'ETB' })}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {t('sales.emptyCart')}
          </p>
        ) : (
          <div className="divide-y divide-border">
            {items.map((item) => (
              <PosCartLine
                key={item.itemId}
                item={item}
                onUpdateQuantity={onUpdateQuantity}
                onRemove={onRemove}
                onBatchSelected={onBatchSelected}
                onChangeBatch={onChangeBatch}
                onToggleSaleUnit={onToggleSaleUnit}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
