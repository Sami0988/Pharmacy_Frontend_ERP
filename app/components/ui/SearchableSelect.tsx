// components/ui/SearchableSelect.tsx
'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  onSearchChange?: (search: string) => void; // hook into server-side search (RTK Query)
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  emptyMessage?: string;
  footer?: React.ReactNode;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  onSearchChange,
  placeholder = 'Select...',
  disabled,
  className,
  emptyMessage = 'No results found',
  footer,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Client-side fallback filtering (in case you're not filtering server-side)
  const filtered = useMemo(() => {
    if (onSearchChange) return options; // server already filtered
    if (!query) return options;
    return options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()));
  }, [options, query, onSearchChange]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    onSearchChange?.(val);
  };

  const handleSelect = (opt: SearchableSelectOption) => {
    onChange(opt.value);
    setQuery('');
    onSearchChange?.('');
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setOpen((prev) => !prev);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <span className={cn(!selectedOption && 'text-muted-foreground')}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-input bg-card shadow-md overflow-hidden">
          <div className="flex items-center border-b border-input px-3">
            <Search className="h-4 w-4 opacity-50 mr-2 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Type to search..."
              className="flex h-9 w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">{emptyMessage}</p>
            ) : (
              filtered.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => handleSelect(opt)}
                  className={cn(
                    'flex w-full items-center justify-between px-3 py-2 text-sm text-left hover:bg-muted',
                    opt.value === value && 'bg-muted'
                  )}
                >
                  {opt.label}
                  {opt.value === value && <Check className="h-4 w-4" />}
                </button>
              ))
            )}
          </div>
          {footer && (
            <div className="border-t border-input bg-muted/50 px-3 py-2.5">
              {footer}
            </div>
          )}
        </div>
      )}
    </div>
  );
}