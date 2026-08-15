'use client';

import { useState, useRef } from 'react';
import { Search, UserPlus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetCustomersQuery, useCreateCustomerMutation } from '@/store/api/customers-api-slice';
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
  const [searchValue, setSearchValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation();
  const inputRef = useRef<HTMLInputElement>(null);

  const displayValue = selectedCustomer?.name || searchValue;

  const { data: customersResponse } = useGetCustomersQuery(
    { search: searchValue || undefined },
    { skip: searchValue.length < 2 || !!selectedCustomer }
  );
  const customers = customersResponse?.data ?? [];

  const handleSelect = (customer: Customer) => {
    onSelectCustomer(customer);
    setSearchValue('');
    setIsOpen(false);
    setShowNewForm(false);
  };

  const handleClear = () => {
    onClearCustomer();
    setSearchValue('');
    setShowNewForm(false);
  };

  const formatPhoneInput = (raw: string): string => {
    if (!raw.startsWith('+')) return raw;
    const digits = raw.replace(/[^0-9]/g, '');
    if (digits.length <= 3) return `+${digits}`;
    if (digits.length <= 6) return `+${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `+${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 11)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (selectedCustomer) {
      onClearCustomer();
    }
    const formatted = raw.startsWith('+') ? formatPhoneInput(raw) : raw;
    setSearchValue(formatted);
    setIsOpen(formatted.length >= 2);
    setShowNewForm(false);
  };

  const handleCreateCustomer = async () => {
    if (!newName.trim()) return;
    try {
      const customer = await createCustomer({
        name: newName.trim(),
        phone: newPhone.trim() || undefined,
      }).unwrap();
      onSelectCustomer(customer);
      setSearchValue('');
      setNewName('');
      setNewPhone('');
      setShowNewForm(false);
      setIsOpen(false);
    } catch {
      // error handled by RTK
    }
  };

  const showAddNew = searchValue.length >= 2 && !selectedCustomer;

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleChange}
          onFocus={() => searchValue.length >= 2 && !selectedCustomer && setIsOpen(true)}
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

      {isOpen && !selectedCustomer && (
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

            {showAddNew && !showNewForm && (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setNewName(searchValue);
                  setShowNewForm(true);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-accent/50 flex items-center gap-2 text-primary"
              >
                <UserPlus className="h-4 w-4" />
                <span>Add &quot;{searchValue}&quot; as new customer</span>
              </button>
            )}

            {showNewForm && (
              <div className="px-4 py-3 border-t border-border space-y-2">
                <p className="text-xs font-medium text-muted-foreground">New Customer</p>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Customer name"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="Phone (optional)"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setShowNewForm(false);
                    }}
                    className="flex-1 h-8 rounded-md border border-border text-xs text-muted-foreground hover:bg-accent"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleCreateCustomer();
                    }}
                    disabled={!newName.trim() || isCreating}
                    className="flex-1 h-8 rounded-md bg-primary text-primary-foreground text-xs hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    {isCreating && <Loader2 className="h-3 w-3 animate-spin" />}
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
