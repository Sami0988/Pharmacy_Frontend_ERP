'use client';

import { SearchInput } from '@/components/ui/SearchInput';
import { useTranslations } from '@/lib/i18n';

interface ItemSearchBarProps {
  onSearch: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onUnitChange: (value: string) => void;
  category: string;
  unit: string;
}

const CATEGORIES = [
  'Analgesic',
  'Antibiotic',
  'Antidiabetic',
  'Antihypertensive',
  'Gastrointestinal',
  'Anti-inflammatory',
  'Antihistamine',
  'Antimalarial',
  'Bronchodilator',
  'Corticosteroid',
  'Anxiolytic',
  'Electrolyte',
  'Supplement',
];

const UNITS = [
  'tablet',
  'capsule',
  'inhaler',
  'sachet',
  'syrup',
  'injection',
  'cream',
  'drops',
];

export function ItemSearchBar({ onSearch, onCategoryChange, onUnitChange, category, unit }: ItemSearchBarProps) {
  const { t } = useTranslations();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <SearchInput onSearch={onSearch} placeholder={t('inventory.searchItems')} className="flex-1" />
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="h-10 rounded-md border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
      >
        <option value="">{t('items.allCategories')}</option>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
      <select
        value={unit}
        onChange={(e) => onUnitChange(e.target.value)}
        className="h-10 rounded-md border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
      >
        <option value="">{t('items.allUnits')}</option>
        {UNITS.map((u) => (
          <option key={u} value={u}>
            {u.charAt(0).toUpperCase() + u.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}
