'use client';

import { SearchInput } from '@/components/ui/SearchInput';

interface SupplierSearchBarProps {
  onSearch: (value: string) => void;
}

export function SupplierSearchBar({ onSearch }: SupplierSearchBarProps) {
  return (
    <SearchInput onSearch={onSearch} placeholder="Search suppliers..." className="max-w-md" />
  );
}
