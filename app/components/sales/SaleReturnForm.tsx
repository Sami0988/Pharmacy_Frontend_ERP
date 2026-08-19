'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { useCreateSaleReturnMutation } from '@/store/api/sales-api-slice';
import type { SaleItem } from '@/types/api';
import { toast } from 'sonner';

const returnSchema = z.object({
  quantity: z.number().int().positive('Must be a positive integer'),
  reason: z.string().min(1, 'Reason is required'),
});

type ReturnFormData = z.infer<typeof returnSchema>;

interface SaleReturnFormProps {
  saleId: string;
  saleItem: SaleItem;
  onClose: () => void;
}

export function SaleReturnForm({ saleId, saleItem, onClose }: SaleReturnFormProps) {
  const [createReturn, { isLoading }] = useCreateSaleReturnMutation();
  const maxReturnable = saleItem.quantity - saleItem.returnedQuantity;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ReturnFormData>({
    resolver: zodResolver(returnSchema.refine((data) => data.quantity <= maxReturnable, {
      message: `Cannot return more than ${maxReturnable} units`,
      path: ['quantity'],
    })),
    defaultValues: {
      quantity: 1,
      reason: '',
    },
  });

  const onSubmit = async (data: ReturnFormData) => {
    try {
      await createReturn({
        saleId,
        body: {
          saleItemId: saleItem.id,
          quantity: data.quantity,
          reason: data.reason,
        },
      }).unwrap();
      toast.success('Return processed successfully');
      onClose();
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      if (apiError.data?.message) {
        setError('root', {
          type: 'server',
          message: apiError.data.message,
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Process Return</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 rounded-md bg-background p-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">{saleItem.itemName}</span> · Batch: {saleItem.batchNo}
          </p>
          <p className="text-sm text-muted-foreground">
            Originally sold: {saleItem.quantity} · Already returned: {saleItem.returnedQuantity} ·{' '}
            <span className="font-medium text-green-600">Returnable: {maxReturnable}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          {errors.root && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {errors.root.message}
            </div>
          )}

          <FormField label="Quantity to Return" required error={errors.quantity?.message}>
            <Input
              type="number"
              {...register('quantity', { valueAsNumber: true })}
              min={1}
              max={maxReturnable}
            />
          </FormField>

          <FormField label="Reason" required error={errors.reason?.message}>
            <Input {...register('reason')} placeholder="Reason for return" />
          </FormField>

          <div className="flex gap-3">
            <Button type="submit" isLoading={isLoading} variant="danger">
              Process Return
            </Button>
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
