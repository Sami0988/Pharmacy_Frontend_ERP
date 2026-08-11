'use client';

import { SearchInput } from '@/components/ui/SearchInput';
import { useTranslations } from '@/lib/i18n';

interface SupplierSearchBarProps {
  onSearch: (value: string) => void;
}

export function SupplierSearchBar({ onSearch }: SupplierSearchBarProps) {
  const { t } = useTranslations();

  return (
    <SearchInput onSearch={onSearch} placeholder={t('suppliers.searchSuppliers')} className="max-w-md" />
  );
}
