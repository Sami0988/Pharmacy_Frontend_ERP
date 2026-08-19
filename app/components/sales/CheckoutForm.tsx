'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { CustomerSearchInput } from '@/components/customers/CustomerSearchInput';
import { NewCustomerModal } from '@/components/customers/NewCustomerModal';
import { useCreateSaleMutation } from '@/store/api/sales-api-slice';
import type { PosCartItem } from './PosCart';
import type { Customer } from '@/types/api';
import { useTranslations } from '@/lib/i18n';

interface CheckoutFormProps {
  items: PosCartItem[];
  total: number;
  onClearCart: () => void;
  onLineError: (itemId: string, message: string) => void;
}

export function CheckoutForm({ items, total, onClearCart, onLineError }: CheckoutFormProps) {
  const { t } = useTranslations();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mobile_money' | 'card' | 'credit'>('cash');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [createSale, { isLoading }] = useCreateSaleMutation();

  const isCreditSale = paymentMethod === 'credit';

  const handleSubmit = async () => {
    if (isCreditSale && !selectedCustomer) {
      return;
    }

    const unfilledBatch = items.find((item) => !item.batchId);
    if (unfilledBatch) {
      onLineError(unfilledBatch.itemId, t('sales.batchNotResolved'));
      return;
    }

    try {
      const result = await createSale({
        customerId: selectedCustomer?.id,
        paymentMethod,
        items: items.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
          batchId: item.batchId,
          saleUnit: item.saleUnit,
        })),
      }).unwrap();

      onClearCart();
      toast.success(t('sales.saleCreatedSuccess'));
      router.push(`/sales/${result.id}`);
    } catch (err: unknown) {
      const apiError = err as {
        status?: number;
        data?: { message?: string; failedItemId?: string; errors?: Record<string, string[]>; details?: string };
      };
      if (apiError.status && apiError.status >= 500) {
        toast.error('An unexpected error occurred. Please try again.');
        return;
      }
      if (apiError.data?.failedItemId) {
        onLineError(apiError.data.failedItemId, apiError.data.message || t('sales.stockChanged'));
      } else if (apiError.data?.errors) {
        const msgs = Object.entries(apiError.data.errors).map(([k, v]) => `${k}: ${v.join(', ')}`);
        toast.error(msgs.join(' | '));
      } else if (apiError.data?.details) {
        toast.error(apiError.data.details);
      } else if (apiError.data?.message) {
        toast.error(apiError.data.message);
      } else {
        toast.error(t('sales.saleFailed'));
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-foreground">{t('sales.checkout')}</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField label={t('sales.paymentMethod')} required>
          <select
            value={paymentMethod}
            onChange={(e) => {
              setPaymentMethod(e.target.value as typeof paymentMethod);
              if (e.target.value !== 'credit') {
                setSelectedCustomer(null);
              }
            }}
            className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            <option value="cash">{t('sales.cash')}</option>
            <option value="mobile_money">{t('sales.mobileMoney')}</option>
            <option value="card">{t('sales.card')}</option>
            <option value="credit">{t('sales.credit')}</option>
          </select>
        </FormField>

        {isCreditSale && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-foreground">
                {t('sales.customer')} <span className="text-destructive">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowNewCustomerModal(true)}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80"
              >
                <Plus className="h-3.5 w-3.5" />
                New
              </button>
            </div>
            {(!selectedCustomer) && (
              <p className="text-xs text-destructive mb-1.5">{t('sales.customerRequired')}</p>
            )}
            <CustomerSearchInput
              onSelectCustomer={setSelectedCustomer}
              selectedCustomer={selectedCustomer}
              onClearCustomer={() => setSelectedCustomer(null)}
            />
          </div>
        )}

        <div className="rounded-md bg-background p-4">
          <div className="flex justify-between text-lg font-bold">
            <span>{t('sales.total')}</span>
            <span>
              {total.toLocaleString('en-US', { style: 'currency', currency: 'ETB' })}
            </span>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={items.length === 0 || (isCreditSale && !selectedCustomer)}
          className="w-full"
          size="lg"
        >
          {t('sales.completeSale')}
        </Button>
      </CardContent>

      <NewCustomerModal
        open={showNewCustomerModal}
        onClose={() => setShowNewCustomerModal(false)}
        onCreated={(customer) => setSelectedCustomer(customer)}
      />
    </Card>
  );
}
