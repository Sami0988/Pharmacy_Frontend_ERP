'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { useGetSuppliersQuery, useCreateSupplierMutation } from '@/store/api/suppliers-api-slice';
import { useCreateGoodsReceiptMutation } from '@/store/api/goods-receipts-api-slice';
import { BatchLineItemRow } from './BatchLineItemRow';
import { InvoiceUploadField } from './InvoiceUploadField';
import { SearchableSelect } from '../ui/SearchableSelect';
import { Switch } from '@/components/ui/Switch';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/Select';

const batchItemSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  batchNo: z.string().min(1, 'Batch number is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  quantityReceived: z.number().int().positive('Must be a positive integer'),
  unitCost: z.number().positive('Must be a positive number'),
  markupPercentage: z.number().optional(),
  sellingPrice: z.number().optional(),
});

const paymentDueDateTypeEnum = z.enum([
  'one_month',
  'two_months',
  'six_months',
  'one_year',
  'other',
]);

const grnSchema = z
  .object({
    supplierId: z.string().min(1, 'Supplier is required'),
    receiptDate: z.string().min(1, 'Receipt date is required'),
    items: z.array(batchItemSchema).min(1, 'At least one item is required'),
    taxPaid: z.boolean().default(false),
    paymentDueDateType: paymentDueDateTypeEnum.default('one_month'),
    paymentDueDate: z.string().optional(),
  })
  .refine(
    (data) => data.paymentDueDateType !== 'other' || !!data.paymentDueDate,
    { path: ['paymentDueDate'], message: 'Custom payment due date is required' }
  );

type GrnFormData = z.infer<typeof grnSchema>;

const PAYMENT_DUE_DATE_OPTIONS: { value: z.infer<typeof paymentDueDateTypeEnum>; label: string }[] =
  [
    { value: 'one_month', label: 'One month' },
    { value: 'two_months', label: 'Two months' },
    { value: 'six_months', label: 'Six months' },
    { value: 'one_year', label: 'One year' },
    { value: 'other', label: 'Other' },
  ];

export function GoodsReceiptForm() {
  const router = useRouter();
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [invoiceError, setInvoiceError] = useState<string | undefined>(undefined);

  const [supplierSearch, setSupplierSearch] = useState('');
  const [newSupplierOpen, setNewSupplierOpen] = useState(false);
  const suppliers = useGetSuppliersQuery({ search: supplierSearch, page: 1, limit: 50 }).data?.data ?? [];
  const [createGoodsReceipt, { isLoading }] = useCreateGoodsReceiptMutation();
  const [createSupplier, { isLoading: isCreatingSupplier }] = useCreateSupplierMutation();

  const {
    register: registerSupplier,
    handleSubmit: handleSubmitSupplier,
    formState: { errors: supplierErrors },
    reset: resetSupplier,
    setError: setSupplierError,
  } = useForm<{ name: string; phone?: string; address?: string; licenseNo?: string }>({
    resolver: zodResolver(z.object({
      name: z.string().min(1, 'Supplier name is required'),
      phone: z.string().optional(),
      address: z.string().optional(),
      licenseNo: z.string().optional(),
    })),
    defaultValues: { name: '', phone: '', address: '', licenseNo: '' },
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    setError,
    setValue,
  } = useForm<GrnFormData>({
    resolver: zodResolver(grnSchema),
    defaultValues: {
      supplierId: '',
      receiptDate: new Date().toISOString().split('T')[0],
      taxPaid: false,
      paymentDueDateType: 'one_month',
      paymentDueDate: undefined,
      items: [
        { itemId: '', batchNo: '', expiryDate: '', quantityReceived: 1, unitCost: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedItems = watch('items');

  const lineTotal = (qty: number, cost: number) => (qty || 0) * (cost || 0);

  const grandTotal = watchedItems.reduce(
    (sum, item) => sum + lineTotal(item.quantityReceived, item.unitCost),
    0
  );

  const handleCreateSupplier = async (data: { name: string; phone?: string; address?: string; licenseNo?: string }) => {
    try {
      const newSupplier = await createSupplier(data).unwrap();
      setNewSupplierOpen(false);
      resetSupplier();
      setSupplierSearch('');
      setValue('supplierId', newSupplier.id, { shouldValidate: true });
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      if (apiError.data?.message) {
        setSupplierError('name', { type: 'server', message: apiError.data.message });
      }
    }
  };

  const onSubmit = async (data: GrnFormData) => {
    setInvoiceError(undefined);

    // Validate selling price for each item
    let hasSellingPriceError = false;
    data.items.forEach((item, index) => {
      const hasMarkup = item.markupPercentage !== undefined && item.markupPercentage !== null;
      const hasCustomPrice = item.sellingPrice !== undefined && item.sellingPrice !== null;
      if (!hasMarkup && !hasCustomPrice) {
        setError(`items.${index}.sellingPrice`, {
          type: 'manual',
          message: 'Select a markup percentage or enter a custom selling price',
        });
        hasSellingPriceError = true;
      }
    });
    if (hasSellingPriceError) return;

    const formData = new FormData();
    formData.append('supplierId', data.supplierId);
    formData.append('receiptDate', data.receiptDate);
    formData.append('items', JSON.stringify(data.items));
    formData.append('taxPaid', String(data.taxPaid ?? false));
    formData.append('paymentDueDateType', data.paymentDueDateType);
    if (data.paymentDueDate) {
      formData.append('paymentDueDate', data.paymentDueDate);
    }
    if (invoiceFile) {
      formData.append('invoiceDocument', invoiceFile);
    }

    try {
      const result = await createGoodsReceipt(formData).unwrap();
      toast.success('Goods receipt created successfully');
      router.push(`/goods-receipts/${result.id}`);
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string; errors?: Record<string, string[]> } };
      if (apiError.data?.errors) {
        Object.entries(apiError.data.errors).forEach(([field, messages]) => {
            setError(field as 'supplierId' | 'receiptDate' | 'items' | `items.${number}` | `items.${number}.itemId` | `items.${number}.batchNo` | `items.${number}.expiryDate` | `items.${number}.quantityReceived` | `items.${number}.unitCost` | `items.${number}.markupPercentage` | `items.${number}.sellingPrice`, {
            type: 'server',
            message: messages[0],
          });
        });
      } else if (apiError.data?.message) {
        setError('root', {
          type: 'server',
          message: apiError.data.message,
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {errors.root && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {errors.root.message}
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-foreground">
            Receipt Details
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-3 space-y-2">
              <FormField
                label="Supplier"
                required
                error={errors.supplierId?.message}
              >
                <Controller
                  name="supplierId"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      onSearchChange={setSupplierSearch}
                      options={suppliers.map((s) => ({
                        value: s.id,
                        label: s.name,
                      }))}
                      placeholder="Select supplier"
                      footer={
                        <button
                          type="button"
                          onClick={() => setNewSupplierOpen(true)}
                          className="w-full text-left text-sm text-primary hover:underline font-medium"
                        >
                          + Create new supplier
                        </button>
                      }
                    />
                  )}
                />
              </FormField>
            </div>

            <FormField
              label="Receipt Date"
              required
              error={errors.receiptDate?.message}
            >
              <Input type="date" {...register("receiptDate")} />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-foreground">
            Payment Terms
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Tax Paid" error={errors.taxPaid?.message}>
            <Controller
              name="taxPaid"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                  label="Tax has been paid for this receipt"
                />
              )}
            />
          </FormField>

          <FormField
            label="Payment Due Date"
            required
            error={errors.paymentDueDateType?.message}
            description="How long after the receipt date is payment due?"
          >
            <Controller
              name="paymentDueDateType"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val);
                    if (val !== 'other') {
                      setValue('paymentDueDate', undefined, {
                        shouldValidate: true,
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a payment term" />
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
            <FormField
              label="Custom Due Date"
              required
              error={errors.paymentDueDate?.message}
            >
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
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Line Items
            </h2>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                append({
                  itemId: "",
                  batchNo: "",
                  expiryDate: "",
                  quantityReceived: 1,
                  unitCost: 0,
                })
              }
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {errors.items?.message && (
            <p className="text-sm text-red-600">{errors.items.message}</p>
          )}

          {fields.map((field, index) => (
            <BatchLineItemRow
              key={field.id}
              index={index}
              control={control}
              remove={remove}
              register={register}
              watch={watch}
              setValue={setValue}
              canRemove={fields.length > 1}
              errors={errors.items?.[index]}
            />
          ))}

          <div className="flex justify-end pt-2">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-xl font-bold text-foreground">
                {grandTotal.toLocaleString("en-US", {
                  style: "currency",
                  currency: "ETB",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-foreground">
            Invoice Document
          </h2>
        </CardHeader>
        <CardContent>
          <InvoiceUploadField
            onChange={(file) => {
              setInvoiceFile(file);
              if (file) setInvoiceError(undefined);
            }}
            value={invoiceFile}
            error={invoiceError}
          />
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" isLoading={isLoading}>
          Create Goods Receipt
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/goods-receipts")}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>

      <Dialog open={newSupplierOpen} onOpenChange={setNewSupplierOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Supplier</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitSupplier(handleCreateSupplier)} className="space-y-4">
            <FormField label="Supplier Name" required error={supplierErrors.name?.message}>
              <Input {...registerSupplier('name')} placeholder="e.g. HealthPlus Distributors" />
            </FormField>
            <FormField label="Phone" error={supplierErrors.phone?.message}>
              <Input {...registerSupplier('phone')} placeholder="e.g. +1-555-0103" />
            </FormField>
            <FormField label="Address" error={supplierErrors.address?.message}>
              <Input {...registerSupplier('address')} placeholder="e.g. 123 Medical Ave" />
            </FormField>
            <FormField label="License Number" error={supplierErrors.licenseNo?.message}>
              <Input {...registerSupplier('licenseNo')} placeholder="e.g. LIC-2026-001" />
            </FormField>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setNewSupplierOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isCreatingSupplier}>
                Create Supplier
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </form>
  );
}
