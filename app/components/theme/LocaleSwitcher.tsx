'use client';

import { useTranslations } from '@/lib/i18n';
import { Globe } from 'lucide-react';

export function LocaleSwitcher() {
  const { locale, setLocale } = useTranslations();

  return (
    <button
      type="button"
      onClick={() => setLocale(locale === 'en' ? 'am' : 'en')}
      className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
      title={locale === 'en' ? 'Switch to Amharic' : 'Switch to English'}
    >
      <Globe size={16} />
      <span className="hidden sm:inline">{locale === 'en' ? 'EN' : 'አማ'}</span>
    </button>
  );
}
