'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { useCreatePaymentMutation } from '@/store/api/supplier-payments-api-slice';

const paymentSchema = z.object({
  amountPaid: z.number().min(0.01, 'Amount must be greater than 0'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  method: z.enum(['cash', 'bank_transfer', 'mobile_money', 'other']),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface RecordPaymentFormProps {
  open: boolean;
  onClose: () => void;
  grnId: string;
  supplierId: string;
  outstandingBalance: number;
  grnNumber?: string;
}

export function RecordPaymentForm({
  open,
  onClose,
  grnId,
  supplierId,
  outstandingBalance: initialOutstanding,
  grnNumber,
}: RecordPaymentFormProps) {
  const [outstanding, setOutstanding] = useState(initialOutstanding);
  const [createPayment, { isLoading }] = useCreatePaymentMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
    watch,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amountPaid: undefined,
      paymentDate: new Date().toISOString().split('T')[0],
      method: 'cash',
      notes: '',
    },
  });

  useEffect(() => {
    setOutstanding(initialOutstanding);
  }, [initialOutstanding]);

  useEffect(() => {
    if (open) {
      reset({
        amountPaid: undefined,
        paymentDate: new Date().toISOString().split('T')[0],
        method: 'cash',
        notes: '',
      });
    }
  }, [open, reset]);

  const onSubmit = async (data: PaymentFormData) => {
    if (data.amountPaid > outstanding) {
      setError('amountPaid', {
        type: 'validate',
        message: `Amount cannot exceed outstanding balance of ${outstanding.toLocaleString('en-US', { style: 'currency', currency: 'ETB' })}`,
      });
      return;
    }

    try {
      await createPayment({
        supplierId,
        grnId,
        amountPaid: data.amountPaid,
        paymentDate: data.paymentDate,
        method: data.method,
        notes: data.notes || undefined,
      }).unwrap();
      toast.success('Payment recorded successfully');
      onClose();
    } catch (err: unknown) {
      const apiError = err as {
        status?: number;
        data?: { message?: string; outstanding?: number };
      };
      if (apiError.status && apiError.status >= 500) {
        toast.error('An unexpected error occurred. Please try again.');
        return;
      }
      if (apiError.data?.message) {
        toast.error(apiError.data.message);
      }
      if (apiError.data?.outstanding !== undefined) {
        setOutstanding(apiError.data.outstanding);
        setError('amountPaid', {
          type: 'server',
          message: `${apiError.data.message || 'Payment failed'}. New outstanding: ${apiError.data.outstanding.toLocaleString('en-US', { style: 'currency', currency: 'ETB' })}`,
        });
      } else if (apiError.data?.message) {
        setError('root', {
          type: 'server',
          message: apiError.data.message,
        });
      }
    }
  };

  // eslint-disable-next-line react-hooks/incompatible-library
  const amountValue = watch('amountPaid');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-foreground">Record Payment</h3>
        {grnNumber && (
          <p className="text-sm text-muted-foreground mt-1">GRN: {grnNumber}</p>
        )}

        <div className="mt-4 rounded-md bg-background p-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Outstanding Balance</span>
            <span className="font-semibold text-foreground">
              {outstanding.toLocaleString('en-US', {
                style: 'currency',
                currency: 'ETB',
              })}
            </span>
          </div>
          {amountValue > 0 && amountValue <= outstanding && (
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Remaining After Payment</span>
              <span className="font-medium text-green-700">
                {(outstanding - amountValue).toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'ETB',
                })}
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          {errors.root && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {errors.root.message}
            </div>
          )}

          <FormField label="Amount" required error={errors.amountPaid?.message}>
            <Input
              {...register('amountPaid', { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0.01"
              max={outstanding}
              placeholder="0.00"
            />
          </FormField>

          <FormField label="Payment Date" required error={errors.paymentDate?.message}>
            <Input {...register('paymentDate')} type="date" />
          </FormField>

          <FormField label="Method" required error={errors.method?.message}>
            <select
              {...register('method')}
              className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 ring-ring focus:border-transparent"
            >
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="other">Other</option>
            </select>
          </FormField>

          <FormField label="Notes" error={errors.notes?.message}>
            <Input {...register('notes')} placeholder="Optional notes" />
          </FormField>

          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={isLoading}>
              Record Payment
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
