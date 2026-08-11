'use client';

import { useRef } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/lib/i18n';

interface BatchSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
}

export function BatchSearchBar({ value, onChange, onSearch }: BatchSearchBarProps) {
  const { t } = useTranslations();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onSearch();
          }
        }}
        placeholder={t('traceability.searchPlaceholder')}
        className={cn(
          'flex h-14 w-full rounded-lg border border-input bg-card pl-12 pr-4 py-3 text-lg',
          'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50'
        )}
        autoFocus
      />
    </div>
  );
}
