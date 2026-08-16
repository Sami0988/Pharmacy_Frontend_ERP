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
import { useTranslations } from '@/lib/i18n';

const paymentMethodEnum = z.enum(['cash', 'credit', 'mobile_bank']);

const paymentDueDateTypeEnum = z.enum([
  'one_month',
  'two_months',
  'six_months',
  'one_year',
  'other',
]);

export function GoodsReceiptForm() {
  const router = useRouter();
  const { t } = useTranslations();
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [invoiceError, setInvoiceError] = useState<string | undefined>(undefined);

  const [supplierSearch, setSupplierSearch] = useState('');
  const [newSupplierOpen, setNewSupplierOpen] = useState(false);
  const suppliers = useGetSuppliersQuery({ search: supplierSearch, page: 1, limit: 50 }).data?.data ?? [];
  const [createGoodsReceipt, { isLoading }] = useCreateGoodsReceiptMutation();
  const [createSupplier, { isLoading: isCreatingSupplier }] = useCreateSupplierMutation();

  const batchItemSchema = z.object({
    itemId: z.string().min(1, t('goodsReceipts.itemRequired')),
    batchNo: z.string().min(1, t('goodsReceipts.batchNumberRequired')),
    expiryDate: z.string().min(1, t('goodsReceipts.expiryDateRequired')),
    quantityReceived: z.number().int().positive(t('goodsReceipts.positiveInteger')),
    unitCost: z.number().positive(t('goodsReceipts.positiveNumber')),
    markupPercentage: z.number().optional(),
    sellingPrice: z.number().optional(),
  });

  const grnSchema = z
    .object({
      supplierId: z.string().min(1, t('goodsReceipts.supplierRequired')),
      receiptDate: z.string().min(1, t('goodsReceipts.receiptDateRequired')),
      items: z.array(batchItemSchema).min(1, t('goodsReceipts.atLeastOneItem')),
      taxPaid: z.boolean().default(false),
      paymentMethod: paymentMethodEnum.default('cash'),
      paymentDueDateType: paymentDueDateTypeEnum.default('one_month'),
      paymentDueDate: z.string().optional(),
    })
    .refine(
      (data) => data.paymentDueDateType !== 'other' || !!data.paymentDueDate,
      { path: ['paymentDueDate'], message: t('goodsReceipts.customPaymentDueDateRequired') }
    );

  type GrnFormData = z.infer<typeof grnSchema>;

  const PAYMENT_DUE_DATE_OPTIONS: { value: z.infer<typeof paymentDueDateTypeEnum>; label: string }[] =
    [
      { value: 'one_month', label: t('goodsReceipts.oneMonth') },
      { value: 'two_months', label: t('goodsReceipts.twoMonths') },
      { value: 'six_months', label: t('goodsReceipts.sixMonths') },
      { value: 'one_year', label: t('goodsReceipts.oneYear') },
      { value: 'other', label: t('goodsReceipts.other') },
    ];

  const PAYMENT_METHOD_OPTIONS: { value: z.infer<typeof paymentMethodEnum>; label: string }[] = [
    { value: 'cash', label: t('goodsReceipts.cash') },
    { value: 'credit', label: t('goodsReceipts.credit') },
    { value: 'mobile_bank', label: t('goodsReceipts.mobileBank') },
  ];

  const supplierSchema = z.object({
    name: z.string().min(1, t('goodsReceipts.supplierNameRequired')),
    phone: z.string().optional(),
    address: z.string().optional(),
    licenseNo: z.string().optional(),
  });

  const {
    register: registerSupplier,
    handleSubmit: handleSubmitSupplier,
    formState: { errors: supplierErrors },
    reset: resetSupplier,
    setError: setSupplierError,
  } = useForm<{ name: string; phone?: string; address?: string; licenseNo?: string }>({
    resolver: zodResolver(supplierSchema),
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(grnSchema) as any,
    defaultValues: {
      supplierId: '',
      receiptDate: new Date().toISOString().split('T')[0],
      taxPaid: false,
      paymentMethod: 'cash',
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
          message: t('goodsReceipts.selectMarkupOrEnterPrice'),
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
    formData.append('paymentMethod', data.paymentMethod ?? 'cash');
    formData.append('paymentDueDateType', data.paymentDueDateType);
    if (data.paymentDueDate) {
      formData.append('paymentDueDate', data.paymentDueDate);
    }
    if (invoiceFile) {
      formData.append('invoiceDocument', invoiceFile);
    }

    try {
      const result = await createGoodsReceipt(formData).unwrap();
      toast.success(t('goodsReceipts.createdSuccess'));
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
            {t('goodsReceipts.receiptDetails')}
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-3 space-y-2">
              <FormField
                label={t('goodsReceipts.supplier')}
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
                      placeholder={t('goodsReceipts.selectSupplier')}
                      footer={
                        <button
                          type="button"
                          onClick={() => setNewSupplierOpen(true)}
                          className="w-full text-left text-sm text-primary hover:underline font-medium"
                        >
                          {t('goodsReceipts.createNewSupplier')}
                        </button>
                      }
                    />
                  )}
                />
              </FormField>
            </div>

            <FormField
              label={t('goodsReceipts.receiptDate')}
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
            {t('goodsReceipts.paymentTerms')}
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label={t('goodsReceipts.taxPaid')} error={errors.taxPaid?.message}>
            <Controller
              name="taxPaid"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                  label={t('goodsReceipts.taxPaidDescription')}
                />
              )}
            />
          </FormField>

          <FormField
            label={t('goodsReceipts.paymentMethod')}
            required
            error={errors.paymentMethod?.message}
          >
            <Controller
              name="paymentMethod"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('goodsReceipts.selectPaymentMethod')} />
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

          <FormField
            label={t('goodsReceipts.paymentDueDate')}
            required
            error={errors.paymentDueDateType?.message}
            description={t('goodsReceipts.paymentDueDateDescription')}
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
                    <SelectValue placeholder={t('goodsReceipts.selectPaymentTerm')} />
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
              label={t('goodsReceipts.customDueDate')}
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
              {t('goodsReceipts.lineItems')}
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
              {t('goodsReceipts.addItem')}
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
              <p className="text-sm text-muted-foreground">{t('common.total')}</p>
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
            {t('goodsReceipts.invoiceDocument')}
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
          {t('goodsReceipts.createGoodsReceipt')}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/goods-receipts")}
          disabled={isLoading}
        >
          {t('common.cancel')}
        </Button>
      </div>

      <Dialog open={newSupplierOpen} onOpenChange={setNewSupplierOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('goodsReceipts.createNewSupplierTitle')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitSupplier(handleCreateSupplier)} className="space-y-4">
            <FormField label={t('goodsReceipts.supplierName')} required error={supplierErrors.name?.message}>
              <Input {...registerSupplier('name')} placeholder="e.g. HealthPlus Distributors" />
            </FormField>
            <FormField label={t('goodsReceipts.phone')} error={supplierErrors.phone?.message}>
              <Input {...registerSupplier('phone')} placeholder="e.g. +1-555-0103" />
            </FormField>
            <FormField label={t('goodsReceipts.address')} error={supplierErrors.address?.message}>
              <Input {...registerSupplier('address')} placeholder="e.g. 123 Medical Ave" />
            </FormField>
            <FormField label={t('goodsReceipts.licenseNumber')} error={supplierErrors.licenseNo?.message}>
              <Input {...registerSupplier('licenseNo')} placeholder="e.g. LIC-2026-001" />
            </FormField>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setNewSupplierOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" isLoading={isCreatingSupplier}>
                {t('goodsReceipts.createSupplier')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </form>
  );
}
