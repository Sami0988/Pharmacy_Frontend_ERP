'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Lock, Unlock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { useUpdateGoodsReceiptMutation } from '@/store/api/goods-receipts-api-slice';
import { InvoiceUploadField } from './InvoiceUploadField';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/Select';
import { useTranslations } from '@/lib/i18n';
import type { GoodsReceiptDetail, Batch } from '@/types/api';

const paymentDueDateTypeEnum = z.enum([
  'one_month',
  'two_months',
  'six_months',
  'one_year',
  'other',
]);

const paymentMethodEnum = z.enum(['cash', 'credit', 'mobile_bank']);

interface BatchEditData {
  batchId: string;
  batchNo: string;
  expiryDate: string;
  numberOfPacks: number;
  packSize: number;
  unitCost: number;
  sellingPrice: number;
  quantityReceived: number;
  totalSold: number;
  totalTransferred: number;
  itemName: string;
  isLocked: boolean;
  lockReason?: string;
}

interface GoodsReceiptEditFormProps {
  receipt: GoodsReceiptDetail;
}

const PAYMENT_DUE_DATE_OPTIONS: { value: z.infer<typeof paymentDueDateTypeEnum>; label: string }[] = [
  { value: 'one_month', label: 'One month' },
  { value: 'two_months', label: 'Two months' },
  { value: 'six_months', label: 'Six months' },
  { value: 'one_year', label: 'One year' },
  { value: 'other', label: 'Other' },
];

const PAYMENT_METHOD_OPTIONS: { value: z.infer<typeof paymentMethodEnum>; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'credit', label: 'Credit' },
  { value: 'mobile_bank', label: 'Mobile Bank' },
];

function getMinQuantity(totalSold: number, totalTransferred: number): number {
  return totalSold + totalTransferred;
}

export function GoodsReceiptEditForm({ receipt }: GoodsReceiptEditFormProps) {
  const router = useRouter();
  const { t } = useTranslations();
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [batchErrors, setBatchErrors] = useState<Record<string, string>>({});

  const [updateGoodsReceipt, { isLoading }] = useUpdateGoodsReceiptMutation();

  const editSchema = z.object({
    receiptDate: z.string().min(1, 'Receipt date is required'),
    taxPaid: z.boolean().default(false),
    paymentMethod: paymentMethodEnum.default('cash'),
    paymentDueDateType: paymentDueDateTypeEnum.default('one_month'),
    paymentDueDate: z.string().optional(),
  });

  type EditFormData = z.infer<typeof editSchema>;

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    setError,
    setValue,
  } = useForm<EditFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(editSchema) as any,
    defaultValues: {
      receiptDate: receipt.receiptDate.split('T')[0],
      taxPaid: receipt.taxPaid,
      paymentMethod: receipt.paymentMethod,
      paymentDueDateType: receipt.paymentDueDateType,
      paymentDueDate: receipt.paymentDueDate?.split('T')[0],
    },
  });

  const [batchEdits, setBatchEdits] = useState<BatchEditData[]>(
    receipt.items.map((batch) => ({
      batchId: batch.id,
      batchNo: batch.batchNo,
      expiryDate: batch.expiryDate.split('T')[0],
      numberOfPacks: batch.numberOfPacks || Math.ceil(batch.quantityReceived / (batch.packSize || 1)),
      packSize: batch.packSize || 1,
      unitCost: batch.unitCost,
      sellingPrice: Number(batch.sellingPrice) || 0,
      quantityReceived: batch.quantityReceived,
      totalSold: 0,
      totalTransferred: 0,
      itemName: batch.itemName,
      isLocked: false,
      lockReason: undefined,
    }))
  );

  const updateBatchEdit = (batchId: string, field: keyof BatchEditData, value: string | number) => {
    setBatchEdits((prev) =>
      prev.map((b) => {
        if (b.batchId !== batchId) return b;
        const updated = { ...b, [field]: value };
        if (field === 'packSize' || field === 'numberOfPacks') {
          updated.packSize = field === 'packSize' ? (value as number) : b.packSize;
          updated.numberOfPacks = field === 'numberOfPacks' ? (value as number) : b.numberOfPacks;
        }
        return updated;
      })
    );
  };

  const onSubmit = async (data: EditFormData) => {
    setBatchErrors({});

    const formData = new FormData();
    formData.append('receiptDate', data.receiptDate);
    formData.append('taxPaid', String(data.taxPaid ?? false));
    formData.append('paymentMethod', data.paymentMethod ?? 'cash');
    formData.append('paymentDueDateType', data.paymentDueDateType);
    if (data.paymentDueDate) {
      formData.append('paymentDueDate', data.paymentDueDate);
    }

    const itemsPayload = batchEdits.map((b) => ({
      batchId: b.batchId,
      batchNo: b.batchNo,
      expiryDate: b.expiryDate,
      numberOfPacks: b.numberOfPacks,
      packSize: b.packSize,
      unitCost: b.unitCost,
      sellingPrice: b.sellingPrice,
    }));
    formData.append('items', JSON.stringify(itemsPayload));

    if (invoiceFile) {
      formData.append('invoiceDocument', invoiceFile);
    }

    try {
      await updateGoodsReceipt({ id: receipt.id, formData }).unwrap();
      toast.success('Goods receipt updated successfully');
      router.push(`/goods-receipts/${receipt.id}`);
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string; errors?: Record<string, string[]> } };
      if (apiError.data?.message) {
        toast.error(apiError.data.message);
      }
      if (apiError.data?.errors) {
        Object.entries(apiError.data.errors).forEach(([field, messages]) => {
          if (field.startsWith('items.')) {
            const match = field.match(/items\.(\d+)\.(\w+)/);
            if (match) {
              const batchId = batchEdits[parseInt(match[1])]?.batchId;
              if (batchId) {
                setBatchErrors((prev) => ({ ...prev, [`${batchId}.${match[2]}`]: messages[0] }));
              }
            }
          } else {
            setError(field as keyof EditFormData, {
              type: 'server',
              message: messages[0],
            });
          }
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit {receipt.grnNumber}</h1>
          <p className="text-sm text-muted-foreground">
            Edit receipt details and batch information
          </p>
        </div>
        <div className="flex gap-3">
          <Button type="submit" isLoading={isLoading}>
            {t('common.save')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push(`/goods-receipts/${receipt.id}`)}
            disabled={isLoading}
          >
            {t('common.cancel')}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-foreground">Receipt Details</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Receipt Date" required error={errors.receiptDate?.message}>
              <Input type="date" {...register('receiptDate')} />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-foreground">Payment Terms</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Tax Paid" error={errors.taxPaid?.message}>
            <Controller
              name="taxPaid"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="rounded border-input"
                  />
                  <span className="text-sm text-foreground">Tax has been paid</span>
                </label>
              )}
            />
          </FormField>

          <FormField label="Payment Method" required error={errors.paymentMethod?.message}>
            <Controller
              name="paymentMethod"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHOD_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormField label="Payment Due Date" required error={errors.paymentDueDateType?.message}>
            <Controller
              name="paymentDueDateType"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val);
                    if (val !== 'other') {
                      setValue('paymentDueDate', undefined, { shouldValidate: true });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment term" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_DUE_DATE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          {watch('paymentDueDateType') === 'other' && (
            <FormField label="Custom Due Date" required error={errors.paymentDueDate?.message}>
              <Controller
                name="paymentDueDate"
                control={control}
                render={({ field }) => (
                  <Input type="date" {...field} value={field.value ?? ''} />
                )}
              />
            </FormField>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-foreground">Batch Items</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {batchEdits.map((batch) => {
              const totalUnits = batch.numberOfPacks * batch.packSize;
              const minQty = getMinQuantity(batch.totalSold, batch.totalTransferred);
              const isQtyLocked = batch.totalSold + batch.totalTransferred > 0;

            return (
              <div key={batch.batchId} className="rounded-md border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-foreground">{batch.itemName}</span>
                    <span className="text-sm text-muted-foreground ml-2">Batch: {batch.batchNo}</span>
                  </div>
                  {isQtyLocked && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="outline" className="gap-1">
                            <Lock className="h-3 w-3" />
                            Sold: {batch.totalSold}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          Cannot reduce quantity below {minQty} units ({batch.totalSold} sold + {batch.totalTransferred} transferred)
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <FormField label="Quantity Ordered" error={batchErrors[`${batch.batchId}.numberOfPacks`]}>
                    <Input
                      type="number"
                      value={batch.numberOfPacks}
                      onChange={(e) => updateBatchEdit(batch.batchId, 'numberOfPacks', parseInt(e.target.value) || 0)}
                      min={isQtyLocked ? Math.ceil(minQty / batch.packSize) : 1}
                    />
                  </FormField>

                  <FormField label="Units per Pack">
                    <Input
                      type="number"
                      value={batch.packSize}
                      onChange={(e) => updateBatchEdit(batch.batchId, 'packSize', parseInt(e.target.value) || 1)}
                      min={1}
                    />
                  </FormField>

                  <FormField label="Cost/Pack" error={batchErrors[`${batch.batchId}.unitCost`]}>
                    <Input
                      type="number"
                      value={batch.unitCost}
                      onChange={(e) => updateBatchEdit(batch.batchId, 'unitCost', parseFloat(e.target.value) || 0)}
                      min={0}
                      step="0.01"
                    />
                  </FormField>

                  <FormField label="Selling/Unit" error={batchErrors[`${batch.batchId}.sellingPrice`]}>
                    <Input
                      type="number"
                      value={batch.sellingPrice}
                      onChange={(e) => updateBatchEdit(batch.batchId, 'sellingPrice', parseFloat(e.target.value) || 0)}
                      min={0}
                      step="0.01"
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label="Expiry Date">
                    <Input
                      type="date"
                      value={batch.expiryDate}
                      onChange={(e) => updateBatchEdit(batch.batchId, 'expiryDate', e.target.value)}
                    />
                  </FormField>

                  <FormField label="Batch Number">
                    <Input
                      value={batch.batchNo}
                      onChange={(e) => updateBatchEdit(batch.batchId, 'batchNo', e.target.value)}
                    />
                  </FormField>
                </div>

                <div className="rounded-md bg-muted/50 p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Auto-calculated</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span>
                      Total Units: <span className="font-medium text-foreground">{totalUnits}</span>
                    </span>
                    <span>
                      Cost/Unit: <span className="font-medium text-foreground">ETB {Number(batch.unitCost || 0).toFixed(2)}</span>
                    </span>
                    <span>
                      Sell/Unit: <span className="font-medium text-primary">ETB {Number(batch.sellingPrice || 0).toFixed(2)}</span>
                    </span>
                  </div>
                </div>

                {isQtyLocked && (
                  <div className="flex items-center gap-2 text-xs text-amber-600">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Minimum quantity: {minQty} units ({Math.ceil(minQty / batch.packSize)} packs)</span>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-foreground">Invoice Document</h2>
        </CardHeader>
        <CardContent>
          {receipt.invoiceDocumentUrl && !invoiceFile && (
            <div className="mb-3">
              <p className="text-sm text-muted-foreground mb-2">Current invoice:</p>
              <a
                href={receipt.invoiceDocumentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 text-sm font-medium"
              >
                View current invoice
              </a>
            </div>
          )}
          <InvoiceUploadField
            onChange={(file) => setInvoiceFile(file)}
            value={invoiceFile}
          />
        </CardContent>
      </Card>
    </form>
  );
}
