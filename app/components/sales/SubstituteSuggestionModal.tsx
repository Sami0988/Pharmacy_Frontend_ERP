'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useGetSubstitutesQuery } from '@/store/api/items-api-slice';
import { useGetStockByLocationQuery } from '@/store/api/transfers-api-slice';
import type { Item } from '@/types/api';

interface SubstituteSuggestionModalProps {
  open: boolean;
  item: Item | null;
  onClose: () => void;
  onSelectSubstitute: (item: Item, sellingPrice: number) => void;
}

export function SubstituteSuggestionModal({
  open,
  item,
  onClose,
  onSelectSubstitute,
}: SubstituteSuggestionModalProps) {
  const { data: substitutes, isLoading } = useGetSubstitutesQuery(item?.id || '', {
    skip: !item,
  });

  const { data: stockData } = useGetStockByLocationQuery({});

  const stockMap = new Map(
    (stockData?.data || []).map((s) => [s.itemId, s.dispatcherQuantity])
  );

  const sellingPriceMap = new Map(
    (stockData?.data || []).map((s) => [s.itemId, s.sellingPrice ?? 0])
  );

  if (!open || !item) return null;

  const substitutesWithStock = (substitutes || []).map((s) => ({
    ...s,
    dispatcherQuantity: stockMap.get(s.id) || 0,
    sellingPrice: sellingPriceMap.get(s.id) || 0,
  }));

  const hasSubstitutes = substitutesWithStock.length > 0;
  const substitutesInStock = substitutesWithStock.filter((s) => s.dispatcherQuantity > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Out of Stock</h3>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-md bg-amber-50 p-3 mb-4">
          <p className="text-sm text-amber-800">
            <span className="font-medium">{item.name}</span> has zero Dispatcher stock.
          </p>
        </div>

        {isLoading ? (
          <div className="py-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : !hasSubstitutes ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              No substitutes available for this item. A transfer from Store is needed.
            </p>
            <Link href={`/transfers/new?itemId=${item.id}`}>
              <Button onClick={onClose}>Transfer from Store</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {substitutesInStock.length > 0
                ? 'These substitutes are available at Dispatcher:'
                : 'Substitutes found, but none have Dispatcher stock:'}
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {substitutesWithStock.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent"
                >
                  <div>
                    <p className="font-medium text-foreground">{sub.name}</p>
                    {sub.genericName && (
                      <p className="text-xs text-muted-foreground">{sub.genericName}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Dispatcher stock: {sub.dispatcherQuantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {sub.dispatcherQuantity === 0 ? (
                      <Badge variant="secondary">No Stock</Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => {
                          onSelectSubstitute(sub, sub.sellingPrice);
                          onClose();
                        }}
                      >
                        Add to Cart
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
