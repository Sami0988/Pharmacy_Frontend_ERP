'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetCustomersQuery } from '@/store/api/customers-api-slice';
import type { Customer } from '@/types/api';
import { useTranslations } from '@/lib/i18n';

interface CustomerSearchInputProps {
  onSelectCustomer: (customer: Customer) => void;
  selectedCustomer: Customer | null;
  onClearCustomer: () => void;
  error?: string;
  disabled?: boolean;
}

export function CustomerSearchInput({
  onSelectCustomer,
  selectedCustomer,
  onClearCustomer,
  error,
  disabled,
}: CustomerSearchInputProps) {
  const { t } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);

  const displayValue = selectedCustomer?.name || '';

  const { data: customersResponse } = useGetCustomersQuery(
    { search: displayValue || undefined },
    { skip: displayValue.length < 2 || !!selectedCustomer }
  );
  const customers = customersResponse?.data ?? [];

  const handleSelect = (customer: Customer) => {
    onSelectCustomer(customer);
    setIsOpen(false);
  };

  const handleClear = () => {
    onClearCustomer();
  };

  const handleChange = () => {
    if (selectedCustomer) {
      onClearCustomer();
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={displayValue}
          onChange={() => handleChange()}
          onFocus={() => !selectedCustomer && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={t('sales.searchCustomer')}
          disabled={disabled}
          readOnly={!!selectedCustomer}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm',
            'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus:ring-red-500'
          )}
        />
        {selectedCustomer && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground/80"
          >
            ×
          </button>
        )}
      </div>

      {isOpen && !selectedCustomer && customers && customers.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-card shadow-lg">
          <div className="max-h-60 overflow-y-auto">
            {customers.map((customer) => (
              <button
                key={customer.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(customer);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-accent/50 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-foreground">{customer.name}</p>
                  {customer.phone && (
                    <p className="text-xs text-muted-foreground">{customer.phone}</p>
                  )}
                </div>
                {customer.creditBalance > 0 && (
                  <span className="text-xs text-red-600">
                    Credit: ETB {customer.creditBalance.toFixed(2)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
