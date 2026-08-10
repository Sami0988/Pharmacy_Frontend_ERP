'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, Truck, Users, User, ArrowRight } from 'lucide-react';
import { useLazyUniversalSearchQuery } from '@/store/api/search-api-slice';
import type { SearchResult } from '@/store/api/search-api-slice';

const typeIcons: Record<SearchResult['type'], React.ReactNode> = {
  item: <Package className="h-4 w-4 text-blue-500" />,
  batch: <Truck className="h-4 w-4 text-amber-500" />,
  supplier: <Users className="h-4 w-4 text-green-500" />,
  customer: <User className="h-4 w-4 text-purple-500" />,
};

const typeLabels: Record<SearchResult['type'], string> = {
  item: 'Item',
  batch: 'Batch',
  supplier: 'Supplier',
  customer: 'Customer',
};

function resultRoute(r: SearchResult): string {
  switch (r.type) {
    case 'item': return `/inventory`;
    case 'batch': return `/traceability/${r.id}`;
    case 'supplier': return `/suppliers/${r.id}`;
    case 'customer': return `/customers/${r.id}`;
  }
}

interface CommandBarProps {
  open: boolean;
  onClose: () => void;
}

export function CommandBar({ open, onClose }: CommandBarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [trigger, { data: results }] = useLazyUniversalSearchQuery();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const items = results || [];
  const grouped = items.reduce<Record<string, SearchResult[]>>((acc, item) => {
    (acc[item.type] ||= []).push(item);
    return acc;
  }, {});

  const flatItems = Object.values(grouped).flat();

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSearch = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) return;
    debounceRef.current = setTimeout(() => trigger(q.trim()), 300);
  }, [trigger]);

  // Focus input when opening
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, flatItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && flatItems[selectedIndex]) {
        e.preventDefault();
        router.push(resultRoute(flatItems[selectedIndex]));
        onClose();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, flatItems, selectedIndex, router, onClose]);

  // Global Cmd/Ctrl+K listener
  useEffect(() => {
    function handleGlobal(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('commandbar:toggle'));
      }
    }
    window.addEventListener('keydown', handleGlobal);
    return () => window.removeEventListener('keydown', handleGlobal);
  }, []);

  if (!open) return null;

  let idx = -1;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-card rounded-xl shadow-2xl border border-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 border-b border-border">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); handleSearch(e.target.value); }}
            placeholder="Search items, batches, suppliers, customers..."
            className="flex-1 h-12 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {query.trim().length >= 2 && items.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No results found</p>
          )}

          {Object.entries(grouped).map(([type, groupItems]) => (
            <div key={type}>
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-background">
                {typeLabels[type as SearchResult['type']]}
              </div>
              {groupItems.map((item) => {
                idx++;
                const isSelected = idx === selectedIndex;
                const currentIdx = idx;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      isSelected
                        ? 'bg-accent'
                        : 'hover:bg-accent'
                    }`}
                    onMouseEnter={() => setSelectedIndex(currentIdx)}
                    onClick={() => {
                      router.push(resultRoute(item));
                      onClose();
                    }}
                  >
                    {typeIcons[item.type]}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      {item.subtitle && (
                        <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                      )}
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-xs text-muted-foreground">
          <span><kbd className="font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono">↵</kbd> select</span>
          <span><kbd className="font-mono">esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
