'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { CustomerSearchInput } from '@/components/customers/CustomerSearchInput';
import { useCreateSaleMutation } from '@/store/api/sales-api-slice';
import type { PosCartItem } from './PosCart';
import type { Customer } from '@/types/api';

interface CheckoutFormProps {
  items: PosCartItem[];
  total: number;
  onClearCart: () => void;
  onLineError: (itemId: string, message: string) => void;
}

export function CheckoutForm({ items, total, onClearCart, onLineError }: CheckoutFormProps) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mobile_money' | 'card' | 'credit'>('cash');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [createSale, { isLoading }] = useCreateSaleMutation();

  const isCreditSale = paymentMethod === 'credit';

  const handleSubmit = async () => {
    if (isCreditSale && !selectedCustomer) {
      return;
    }

    const unfilledBatch = items.find((item) => !item.batchId);
    if (unfilledBatch) {
      onLineError(unfilledBatch.itemId, 'Batch not resolved. Please wait for batch info to load.');
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
        })),
      }).unwrap();

      onClearCart();
      toast.success('Sale completed successfully');
      router.push(`/sales/${result.id}`);
    } catch (err: unknown) {
      const apiError = err as {
        data?: { message?: string; failedItemId?: string; errors?: Record<string, string[]>; details?: string };
      };
      if (apiError.data?.failedItemId) {
        onLineError(apiError.data.failedItemId, apiError.data.message || 'Stock changed. Please remove and re-add this item.');
      } else if (apiError.data?.errors) {
        const msgs = Object.entries(apiError.data.errors).map(([k, v]) => `${k}: ${v.join(', ')}`);
        toast.error(msgs.join(' | '));
      } else if (apiError.data?.details) {
        toast.error(apiError.data.details);
      } else if (apiError.data?.message) {
        toast.error(apiError.data.message);
      } else {
        toast.error('Sale failed. Please try again.');
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-foreground">Checkout</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField label="Payment Method" required>
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
            <option value="cash">Cash</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="card">Card</option>
            <option value="credit">Credit</option>
          </select>
        </FormField>

        {isCreditSale && (
          <FormField
            label="Customer"
            required
            error={!selectedCustomer ? 'Customer is required for credit sales' : undefined}
          >
            <CustomerSearchInput
              onSelectCustomer={setSelectedCustomer}
              selectedCustomer={selectedCustomer}
              onClearCustomer={() => setSelectedCustomer(null)}
            />
          </FormField>
        )}

        <div className="rounded-md bg-background p-4">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
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
          Complete Sale
        </Button>
      </CardContent>
    </Card>
  );
}
