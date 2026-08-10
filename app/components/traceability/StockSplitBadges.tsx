'use client';

import { Store, Truck, ShoppingCart } from 'lucide-react';

interface StockSplitBadgesProps {
  storeQuantity: number;
  dispatcherQuantity: number;
  totalSold: number;
}

export function StockSplitBadges({ storeQuantity, dispatcherQuantity, totalSold }: StockSplitBadgesProps) {
  const total = storeQuantity + dispatcherQuantity + totalSold;

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="flex flex-col items-center rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 px-4 py-3">
        <Store className="h-5 w-5 text-blue-600 mb-1" />
        <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">{storeQuantity}</span>
        <span className="text-xs font-medium text-blue-600 dark:text-blue-300">Store</span>
      </div>
      <div className="flex flex-col items-center rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 px-4 py-3">
        <Truck className="h-5 w-5 text-amber-600 mb-1" />
        <span className="text-2xl font-bold text-amber-900 dark:text-amber-100">{dispatcherQuantity}</span>
        <span className="text-xs font-medium text-amber-600 dark:text-amber-300">Dispatcher</span>
      </div>
      <div className="flex flex-col items-center rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800 px-4 py-3">
        <ShoppingCart className="h-5 w-5 text-green-600 mb-1" />
        <span className="text-2xl font-bold text-green-900 dark:text-green-100">{totalSold}</span>
        <span className="text-xs font-medium text-green-600 dark:text-green-300">Sold</span>
      </div>
      {total > 0 && (
        <div className="col-span-3 text-center text-xs text-muted-foreground mt-1">
          Total received: {total} units
        </div>
      )}
    </div>
  );
}
