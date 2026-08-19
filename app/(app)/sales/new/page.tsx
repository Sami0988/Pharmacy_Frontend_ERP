'use client';

import { useState, useCallback } from 'react';
import { PosItemSearch } from '@/components/sales/PosItemSearch';
import { PosCart, PosCartItem } from '@/components/sales/PosCart';
import { CheckoutForm } from '@/components/sales/CheckoutForm';
import { SubstituteSuggestionModal } from '@/components/sales/SubstituteSuggestionModal';
import { BatchPickerModal } from '@/components/sales/BatchPickerModal';
import type { Item } from '@/types/api';
import { useTranslations } from '@/lib/i18n';

export default function NewSalePage() {
  const { t } = useTranslations();
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [substituteModalItem, setSubstituteModalItem] = useState<Item | null>(null);
  const [batchPickerItem, setBatchPickerItem] = useState<{
    itemId: string;
    itemName: string;
    quantity: number;
  } | null>(null);
  const [lineErrors, setLineErrors] = useState<Record<string, string>>({});

  const handleAddItem = useCallback(
    (item: Item, dispatcherQuantity: number, sellingPrice: number, packSize?: number, packPrice?: number) => {
      if (dispatcherQuantity === 0) {
        setSubstituteModalItem(item);
        return;
      }

      setCart((prev) => {
        const existing = prev.find((c) => c.itemId === item.id);
        if (existing) {
          return prev.map((c) =>
            c.itemId === item.id
              ? { ...c, quantity: c.quantity + 1, subtotal: (c.quantity + 1) * c.unitPrice }
              : c
          );
        }
        return [
          ...prev,
          {
            itemId: item.id,
            itemName: item.name,
            genericName: item.genericName,
            quantity: 1,
            unitPrice: sellingPrice,
            subtotal: sellingPrice,
            packSize,
            packPrice,
            sellingPrice,
            saleUnit: 'single' as const,
          },
        ];
      });
    },
    []
  );

  const handleUpdateQuantity = useCallback((itemId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((c) =>
        c.itemId === itemId ? { ...c, quantity, subtotal: quantity * c.unitPrice } : c
      )
    );
    setLineErrors((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  }, []);

  const handleRemove = useCallback((itemId: string) => {
    setCart((prev) => prev.filter((c) => c.itemId !== itemId));
    setLineErrors((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  }, []);

  const handleBatchSelected = useCallback(
    (itemId: string, batchId: string, batchNo: string) => {
      setCart((prev) =>
        prev.map((c) =>
          c.itemId === itemId
            ? {
                ...c,
                batchId,
                batchNo,
              }
            : c
        )
      );
    },
    []
  );

  const handleChangeBatch = useCallback(
    (itemId: string) => {
      const item = cart.find((c) => c.itemId === itemId);
      if (item) {
        setBatchPickerItem({ itemId: item.itemId, itemName: item.itemName, quantity: item.quantity });
      }
    },
    [cart]
  );

  const handleBatchPicked = useCallback(
    (batch: { batchId: string; batchNo: string; sellingPrice: number }) => {
      if (!batchPickerItem) return;
      setCart((prev) =>
        prev.map((c) =>
          c.itemId === batchPickerItem.itemId
            ? {
                ...c,
                batchId: batch.batchId,
                batchNo: batch.batchNo,
                unitPrice: batch.sellingPrice,
                subtotal: c.quantity * batch.sellingPrice,
              }
            : c
        )
      );
    },
    [batchPickerItem]
  );

  const handleSelectSubstitute = useCallback(
    (substitute: Item, sellingPrice: number) => {
      handleAddItem(substitute, 1, sellingPrice);
    },
    [handleAddItem]
  );

  const handleLineError = useCallback((itemId: string, message: string) => {
    setLineErrors((prev) => ({ ...prev, [itemId]: message }));
  }, []);

  const handleClearCart = useCallback(() => {
    setCart([]);
    setLineErrors({});
  }, []);

  const handleToggleSaleUnit = useCallback((itemId: string) => {
    setCart((prev) =>
      prev.map((c) => {
        if (c.itemId !== itemId) return c;
        const newSaleUnit = c.saleUnit === 'single' ? 'pack' : 'single';
        
        if (newSaleUnit === 'pack' && c.packPrice && c.packSize) {
          // Switching to pack: convert units to packs, use packPrice
          const packQuantity = Math.max(1, Math.ceil(c.quantity / c.packSize));
          return {
            ...c,
            saleUnit: 'pack',
            unitPrice: c.packPrice,
            quantity: packQuantity,
            subtotal: packQuantity * c.packPrice,
          };
        } else {
          // Switching to single: convert packs to units, use original sellingPrice
          const unitQuantity = c.quantity * (c.packSize || 1);
          const originalPrice = c.sellingPrice || c.unitPrice;
          return {
            ...c,
            saleUnit: 'single',
            unitPrice: originalPrice,
            quantity: unitQuantity,
            subtotal: unitQuantity * originalPrice,
          };
        }
      })
    );
  }, []);

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const hasRootError = !!lineErrors['root'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('sales.newSale')}</h1>
        <p className="text-sm text-muted-foreground">{t('sales.storeToCustomer')}</p>
      </div>

      {hasRootError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {lineErrors['root']}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <PosItemSearch onAddItem={handleAddItem} />

          {cart.some((item) => lineErrors[item.itemId]) && (
            <div className="space-y-1">
              {cart
                .filter((item) => lineErrors[item.itemId])
                .map((item) => (
                  <div key={item.itemId} className="rounded-md bg-red-50 p-2 text-sm text-red-600">
                    {item.itemName}: {lineErrors[item.itemId]}
                  </div>
                ))}
            </div>
          )}

          <PosCart
            items={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemove}
            onBatchSelected={handleBatchSelected}
            onChangeBatch={handleChangeBatch}
            onToggleSaleUnit={handleToggleSaleUnit}
          />
        </div>

        <div>
          <CheckoutForm
            items={cart}
            total={total}
            onClearCart={handleClearCart}
            onLineError={handleLineError}
          />
        </div>
      </div>

      <SubstituteSuggestionModal
        open={!!substituteModalItem}
        item={substituteModalItem}
        onClose={() => setSubstituteModalItem(null)}
        onSelectSubstitute={handleSelectSubstitute}
      />

      <BatchPickerModal
        open={!!batchPickerItem}
        itemId={batchPickerItem?.itemId ?? null}
        itemName={batchPickerItem?.itemName ?? null}
        quantity={batchPickerItem?.quantity ?? 0}
        selectedBatchId={
          cart.find((c) => c.itemId === batchPickerItem?.itemId)?.batchId ?? null
        }
        onClose={() => setBatchPickerItem(null)}
        onSelectBatch={handleBatchPicked}
      />
    </div>
  );
}
