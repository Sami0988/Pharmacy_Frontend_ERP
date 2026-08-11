'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n';
import { Globe, Check } from 'lucide-react';

const locales = [
  { code: 'en' as const, label: 'English', short: 'EN' },
  { code: 'am' as const, label: 'አማርኛ', short: 'አማ' },
  { code: 'om' as const, label: 'Afaan Oromoo', short: 'OM' },
];

export function LocaleSwitcher() {
  const { locale, setLocale } = useTranslations();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = locales.find((l) => l.code === locale) || locales[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
        title="Switch language"
      >
        <Globe size={16} />
        <span className="hidden sm:inline">{current.short}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-border bg-popover text-popover-foreground shadow-md z-50 py-1">
          {locales.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                setLocale(l.code);
                setOpen(false);
              }}
              className="flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-secondary transition-colors"
            >
              <span>{l.label}</span>
              {locale === l.code && <Check size={14} className="text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
