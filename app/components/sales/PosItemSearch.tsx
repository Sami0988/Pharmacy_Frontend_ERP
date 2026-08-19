'use client';

import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetItemsQuery } from '@/store/api/items-api-slice';
import { useGetStockByLocationQuery } from '@/store/api/transfers-api-slice';
import type { Item } from '@/types/api';
import { useTranslations } from '@/lib/i18n';

interface PosItemSearchProps {
  onAddItem: (item: Item, dispatcherQuantity: number, sellingPrice: number, packSize?: number, packPrice?: number) => void;
}

export function PosItemSearch({ onAddItem }: PosItemSearchProps) {
  const { t } = useTranslations();
  const inputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const items = useGetItemsQuery(
    { search: search || undefined },
    { skip: search.length < 1 }
  ).data?.data ?? [];

  const { data: stockData } = useGetStockByLocationQuery({});

  const stockMap = new Map(
    (stockData?.data || []).map((s) => [s.itemId, s.dispatcherQuantity])
  );

  const sellingPriceMap = new Map(
    (stockData?.data || []).map((s) => [s.itemId, s.sellingPrice ?? 0])
  );

  const packSizeMap = new Map(
    (stockData?.data || []).map((s) => [s.itemId, s.packSize])
  );

  const packPriceMap = new Map(
    (stockData?.data || []).map((s) => [s.itemId, s.packPrice])
  );

  const handleSelect = (item: Item) => {
    const dispatcherQty = stockMap.get(item.id) || 0;
    const sellingPrice = sellingPriceMap.get(item.id) || 0;
    const packSize = packSizeMap.get(item.id);
    const packPrice = packPriceMap.get(item.id);
    onAddItem(item, dispatcherQty, sellingPrice, packSize, packPrice);
    setSearch('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={t('sales.searchItems')}
          className={cn(
            'flex h-12 w-full rounded-md border border-input bg-card pl-10 pr-3 py-2 text-base',
            'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        />
      </div>

      {isOpen && items && items.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-card shadow-lg">
          <div className="max-h-80 overflow-y-auto">
            {items.map((item) => {
              const dispatcherQty = stockMap.get(item.id) || 0;
              const outOfStock = dispatcherQty === 0;
              const packSize = packSizeMap.get(item.id);
              const packPrice = packPriceMap.get(item.id);

              return (
                <button
                  key={item.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(item);
                  }}
                  className={cn(
                    'w-full px-4 py-3 text-left text-sm hover:bg-accent flex items-center justify-between',
                    outOfStock && 'bg-amber-50 dark:bg-amber-900/20'
                  )}
                >
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    {item.genericName && (
                      <p className="text-xs text-muted-foreground">{item.genericName}</p>
                    )}
                    {packSize && packSize > 1 && (
                      <p className="text-xs text-muted-foreground">
                        Pack: {packSize} units · {packPrice?.toLocaleString('en-US', { style: 'currency', currency: 'ETB' })}/pack
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        'text-sm font-medium',
                        outOfStock ? 'text-destructive' : 'text-foreground'
                      )}
                    >
                      Dispenser: {dispatcherQty}
                    </p>
                    {outOfStock && (
                      <p className="text-xs text-amber-600">{t('sales.outOfStock')}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
