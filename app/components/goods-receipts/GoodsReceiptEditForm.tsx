'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Lock, Unlock, AlertTriangle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { useUpdateGoodsReceiptMutation, useAddGoodsReceiptItemMutation } from '@/store/api/goods-receipts-api-slice';
import { useGetItemsQuery } from '@/store/api/items-api-slice';
import { SearchableSelect } from '../ui/SearchableSelect';
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
  packPrice?: number;
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
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [itemSearch, setItemSearch] = useState('');

  const [updateGoodsReceipt, { isLoading }] = useUpdateGoodsReceiptMutation();
  const [addGoodsReceiptItem, { isLoading: isAddingItem }] = useAddGoodsReceiptItemMutation();
  const items = useGetItemsQuery({ search: itemSearch, page: 1, limit: 50 }).data?.data ?? [];

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
      packPrice: Number(batch.packPrice) || undefined,
      quantityReceived: batch.quantityReceived,
      totalSold: 0,
      totalTransferred: 0,
      itemName: batch.itemName,
      isLocked: false,
      lockReason: undefined,
    }))
  );

  const originalBatches = useState(() =>
    receipt.items.map((batch) => ({
      batchId: batch.id,
      batchNo: batch.batchNo,
      expiryDate: batch.expiryDate.split('T')[0],
      numberOfPacks: batch.numberOfPacks || Math.ceil(batch.quantityReceived / (batch.packSize || 1)),
      packSize: batch.packSize || 1,
      unitCost: batch.unitCost,
      sellingPrice: Number(batch.sellingPrice) || 0,
    }))
  )[0];

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

  const addItemSchema = z.object({
    itemId: z.string().min(1, 'Item is required'),
    batchNo: z.string().min(1, 'Batch number is required'),
    expiryDate: z.string().min(1, 'Expiry date is required'),
    numberOfPacks: z.number().int().positive('Must be a positive integer'),
    packSize: z.number().int().positive('Must be a positive integer'),
    unitCost: z.number().positive('Must be a positive number'),
    markupPercentage: z.number().optional(),
    sellingPrice: z.number().optional(),
  });

  type AddItemFormData = z.infer<typeof addItemSchema>;

  const MARKUP_OPTIONS = [10, 20, 30, 40, 50];

  const {
    register: registerAddItem,
    handleSubmit: handleSubmitAddItem,
    control: controlAddItem,
    formState: { errors: addItemErrors },
    reset: resetAddItem,
    watch: watchAddItem,
    setValue: setAddItemValue,
  } = useForm<AddItemFormData>({
    resolver: zodResolver(addItemSchema),
    defaultValues: {
      itemId: '',
      batchNo: '',
      expiryDate: '',
      numberOfPacks: 1,
      packSize: 1,
      unitCost: 0,
      markupPercentage: undefined,
      sellingPrice: undefined,
    },
  });

  const addPackCost = watchAddItem('unitCost') || 0;
  const addNumberOfPacks = watchAddItem('numberOfPacks') || 0;
  const addPackSize = watchAddItem('packSize') || 1;
  const addMarkup = watchAddItem('markupPercentage');
  const addSellingPrice = watchAddItem('sellingPrice');
  const addUnitCostFromPack = addPackSize > 0 ? addPackCost / addPackSize : 0;
  const addCalculatedSellingPrice = addMarkup
    ? addUnitCostFromPack * (1 + addMarkup / 100)
    : addSellingPrice || 0;
  const addTotalUnits = addNumberOfPacks * addPackSize;
  const addTotalCost = addNumberOfPacks * addPackCost;
  const addCalculatedPackPrice = addCalculatedSellingPrice * addPackSize;
  const [addCustomPriceMode, setAddCustomPriceMode] = useState(false);

  const handleAddMarkupSelect = (pct: number) => {
    setAddCustomPriceMode(false);
    setAddItemValue('markupPercentage', pct);
    setAddItemValue('sellingPrice', undefined);
  };

  const handleAddCustomPriceMode = () => {
    setAddCustomPriceMode(true);
    setAddItemValue('markupPercentage', undefined);
  };

  const handleAddItem = async (data: AddItemFormData) => {
    const effectiveSellingPrice = data.sellingPrice || (data.markupPercentage ? addCalculatedSellingPrice : 0);
    try {
      await addGoodsReceiptItem({
        grnId: receipt.id,
        body: {
          itemId: data.itemId,
          batchNo: data.batchNo,
          expiryDate: data.expiryDate,
          numberOfPacks: data.numberOfPacks,
          packSize: data.packSize,
          unitCost: data.unitCost,
          sellingPrice: effectiveSellingPrice,
        },
      }).unwrap();
      toast.success('Item added successfully');
      router.push(`/goods-receipts/${receipt.id}`);
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string; errors?: Record<string, string[]> } };
      if (apiError.data?.message) {
        toast.error(apiError.data.message);
      }
    }
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

    const itemsPayload = batchEdits
      .filter((b) => {
        const orig = originalBatches.find((o) => o.batchId === b.batchId);
        if (!orig) return true;
        return (
          orig.batchNo !== b.batchNo ||
          orig.expiryDate !== b.expiryDate ||
          orig.numberOfPacks !== b.numberOfPacks ||
          orig.packSize !== b.packSize ||
          orig.unitCost !== b.unitCost ||
          orig.sellingPrice !== b.sellingPrice
        );
      })
      .map((b) => ({
        batchId: b.batchId,
        batchNo: b.batchNo,
        expiryDate: b.expiryDate,
        numberOfPacks: b.numberOfPacks,
        packSize: b.packSize,
        unitCost: b.unitCost,
        sellingPrice: b.sellingPrice,
        packPrice: b.packPrice || (b.packSize > 1 ? b.sellingPrice * b.packSize : undefined),
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
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Batch Items</h2>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setAddItemOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>
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

                  {batch.packSize > 1 && (
                    <FormField label="Pack Price" error={batchErrors[`${batch.batchId}.packPrice`]}>
                      <Input
                        type="number"
                        value={batch.packPrice || ''}
                        onChange={(e) => updateBatchEdit(batch.batchId, 'packPrice', parseFloat(e.target.value) || 0)}
                        min={0}
                        step="0.01"
                        placeholder={`Auto: ${(batch.sellingPrice * batch.packSize).toFixed(2)}`}
                      />
                    </FormField>
                  )}
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

      <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitAddItem(handleAddItem)} className="space-y-4">
            <FormField label="Item" required error={addItemErrors.itemId?.message}>
              <Controller
                name="itemId"
                control={controlAddItem}
                render={({ field }) => (
                  <SearchableSelect
                    value={field.value}
                    onChange={field.onChange}
                    onSearchChange={setItemSearch}
                    options={items.map((item) => ({
                      value: item.id,
                      label: `${item.name}${item.strength ? ` - ${item.strength}` : ''}`,
                    }))}
                    placeholder="Select item"
                    emptyMessage="No items found"
                  />
                )}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Batch Number" required error={addItemErrors.batchNo?.message}>
                <Input {...registerAddItem('batchNo')} placeholder="e.g. BATCH-001" />
              </FormField>

              <FormField label="Expiry Date" required error={addItemErrors.expiryDate?.message}>
                <Input type="date" {...registerAddItem('expiryDate')} />
              </FormField>

              <FormField label="Number of Packs" required error={addItemErrors.numberOfPacks?.message}>
                <Input type="number" {...registerAddItem('numberOfPacks', { valueAsNumber: true })} min={1} />
              </FormField>

              <FormField label="Pack Size" required error={addItemErrors.packSize?.message}>
                <Input type="number" {...registerAddItem('packSize', { valueAsNumber: true })} min={1} />
              </FormField>

              <FormField label="Cost/Pack" required error={addItemErrors.unitCost?.message}>
                <Input type="number" {...registerAddItem('unitCost', { valueAsNumber: true })} min={0} step="0.01" />
              </FormField>
            </div>

            <FormField label="Selling Price" required error={addItemErrors.markupPercentage?.message || addItemErrors.sellingPrice?.message}>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {MARKUP_OPTIONS.map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handleAddMarkupSelect(pct)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                        addMarkup === pct && !addCustomPriceMode
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-border text-foreground hover:bg-muted'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddCustomPriceMode}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      addCustomPriceMode
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border text-foreground hover:bg-muted'
                    }`}
                  >
                    Custom
                  </button>
                </div>

                {addCustomPriceMode ? (
                  <Input
                    type="number"
                    {...registerAddItem('sellingPrice', { valueAsNumber: true })}
                    min={addUnitCostFromPack}
                    step="0.01"
                    placeholder={`Min: ${addUnitCostFromPack.toFixed(2)}`}
                  />
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {addPackCost > 0 && addMarkup ? (
                      <span>
                        Cost/Pack: <span className="font-medium text-foreground">ETB {addPackCost.toFixed(2)}</span>
                        {' × '}{addMarkup}% ={' '}
                        <span className="font-medium text-primary">ETB {addCalculatedSellingPrice.toFixed(2)}</span>
                      </span>
                    ) : (
                      <span>Select markup or enter custom price</span>
                    )}
                  </div>
                )}
              </div>
            </FormField>

            <div className="rounded-md bg-muted/50 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Auto-calculated</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span>
                  Total Units: <span className="font-medium text-foreground">{addTotalUnits}</span>
                </span>
                <span>
                  Total Cost: <span className="font-medium text-foreground">ETB {addTotalCost.toFixed(2)}</span>
                </span>
                <span>
                  Cost/Pack: <span className="font-medium text-foreground">ETB {addPackCost.toFixed(2)}</span>
                </span>
                {addCalculatedSellingPrice > 0 && (
                  <span>
                    Selling/Unit: <span className="font-medium text-primary">ETB {addCalculatedSellingPrice.toFixed(2)}</span>
                  </span>
                )}
                {addCalculatedSellingPrice > 0 && addPackSize > 1 && (
                  <span>
                    Selling/Pack: <span className="font-medium text-primary">ETB {addCalculatedPackPrice.toFixed(2)}</span>
                  </span>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setAddItemOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isAddingItem}>
                Add Item
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </form>
  );
}
