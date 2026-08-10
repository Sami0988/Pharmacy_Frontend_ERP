'use client';

import { SearchInput } from '@/components/ui/SearchInput';

interface ItemSearchBarProps {
  onSearch: (value: string) => void;
  onCategoryChange: (value: string) => void;
  category: string;
}

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'capsule', label: 'Capsule' },
  { value: 'liquid', label: 'Liquid' },
  { value: 'injection', label: 'Injection' },
  { value: 'cream', label: 'Cream' },
  { value: 'drops', label: 'Drops' },
  { value: 'other', label: 'Other' },
];

export function ItemSearchBar({ onSearch, onCategoryChange, category }: ItemSearchBarProps) {
  return (
    <div className="flex gap-4">
      <SearchInput onSearch={onSearch} placeholder="Search items..." className="flex-1" />
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="h-10 rounded-md border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
      >
        {CATEGORIES.map((cat) => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>
    </div>
  );
}
