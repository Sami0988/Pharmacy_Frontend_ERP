"use client";

import { useState } from "react";
import {
  Controller,
  UseFieldArrayRemove,
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  Control,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { useGetItemsQuery, useCreateItemMutation } from "@/store/api/items-api-slice";
import { useForm } from "react-hook-form";
import { useTranslations } from "@/lib/i18n";

interface BatchLineItemRowFormValues {
  items: Array<{
    itemId: string;
    batchNo: string;
    expiryDate: string;
    quantityReceived: number;
    unitCost: number;
    markupPercentage?: number;
    sellingPrice?: number;
  }>;
}

interface BatchLineItemRowProps {
  index: number;
  remove: UseFieldArrayRemove;
  register: UseFormRegister<BatchLineItemRowFormValues>;
  control: Control<BatchLineItemRowFormValues>;
  watch: UseFormWatch<BatchLineItemRowFormValues>;
  setValue: UseFormSetValue<BatchLineItemRowFormValues>;
  canRemove: boolean;
  errors?: {
    itemId?: { message?: string };
    batchNo?: { message?: string };
    expiryDate?: { message?: string };
    quantityReceived?: { message?: string };
    unitCost?: { message?: string };
    markupPercentage?: { message?: string };
    sellingPrice?: { message?: string };
  };
}

const MARKUP_OPTIONS = [10, 20, 30, 40, 50];

export function BatchLineItemRow({
  index,
  remove,
  register,
  control,
  watch,
  setValue,
  canRemove,
  errors,
}: BatchLineItemRowProps) {
  const { t } = useTranslations();
  const [itemSearch, setItemSearch] = useState("");
  const [newItemOpen, setNewItemOpen] = useState(false);
  const [customPriceMode, setCustomPriceMode] = useState(false);
  const items =
    useGetItemsQuery({ search: itemSearch, page: 1, limit: 50 }).data?.data ??
    [];
  const [createItem, { isLoading: isCreatingItem }] = useCreateItemMutation();

  const unitCost = watch(`items.${index}.unitCost`) || 0;
  const markupPercentage = watch(`items.${index}.markupPercentage`);
  const sellingPrice = watch(`items.${index}.sellingPrice`);

  const calculatedSellingPrice = markupPercentage
    ? unitCost * (1 + markupPercentage / 100)
    : sellingPrice || 0;

  const handleMarkupSelect = (pct: number) => {
    setCustomPriceMode(false);
    setValue(`items.${index}.markupPercentage`, pct);
    setValue(`items.${index}.sellingPrice`, undefined);
  };

  const handleCustomPriceMode = () => {
    setCustomPriceMode(true);
    setValue(`items.${index}.markupPercentage`, undefined);
  };

  const newItemSchema = z.object({
    name: z.string().min(1, t('items.nameRequired')),
    genericName: z.string().optional(),
    category: z.string().optional(),
    unit: z.string().min(1, t('items.unitRequired')),
    reorderLevel: z.number().optional(),
    isControlledSubstance: z.boolean().optional(),
  });

  const {
    register: registerItem,
    handleSubmit: handleSubmitItem,
    formState: { errors: itemErrors },
    reset: resetItem,
  } = useForm({
    resolver: zodResolver(newItemSchema),
    defaultValues: {
      name: "",
      genericName: "",
      category: "",
      unit: "",
      reorderLevel: undefined as number | undefined,
      isControlledSubstance: false,
    },
  });

  const lineItemName = `items.${index}` as const;
  const lineItemQty = `items.${index}.quantityReceived` as const;
  const lineItemCost = `items.${index}.unitCost` as const;

  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const handleCreateItem = async (data: { name: string; genericName?: string; category?: string; unit: string; reorderLevel?: number; isControlledSubstance?: boolean }) => {
    try {
      const newItem = await createItem(data).unwrap();
      setNewItemOpen(false);
      resetItem();
      setItemSearch("");
      setTimeout(() => {
        const input = document.querySelector(`[name="items.${index}.itemId"]`);
        if (input) {
          const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
          nativeSetter?.call(input, newItem.id);
          input.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }, 0);
    } catch {
      // Error handled by form
    }
  };

  return (
    <div className="rounded-md border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-secondary-foreground">
          Item {index + 1}
        </span>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => remove(index)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField
          label={t('goodsReceipts.supplier')}
          required
          error={errors?.itemId?.message}
          className="sm:col-span-2"
        >
          <Controller
            name={`${lineItemName}.itemId`}
            control={control}
            render={({ field }) => (
              <SearchableSelect
                value={field.value as string}
                onChange={field.onChange}
                onSearchChange={setItemSearch}
                options={items.map((item) => ({
                  value: item.id,
                  label: `${item.name}${item.strength ? ` - ${item.strength}` : ""}`,
                }))}
                placeholder={t('goodsReceipts.selectItem')}
                emptyMessage={t('goodsReceipts.noItemsFound')}
                footer={
                  <button
                    type="button"
                    onClick={() => setNewItemOpen(true)}
                    className="w-full text-left text-sm text-primary hover:underline font-medium"
                  >
                    {t('goodsReceipts.createNewItem')}
                  </button>
                }
              />
            )}
          />
        </FormField>

        <FormField
          label={t('goodsReceipts.batchNumber')}
          required
          error={errors?.batchNo?.message}
        >
          <Input
            {...register(`${lineItemName}.batchNo`)}
            placeholder="e.g. BN-2024-001"
          />
        </FormField>

        <FormField
          label={t('goodsReceipts.expiryDate')}
          required
          error={errors?.expiryDate?.message}
        >
          <Input
            type="date"
            {...register(`${lineItemName}.expiryDate`)}
            min={getTomorrowDate()}
          />
        </FormField>

        <FormField
          label={t('goodsReceipts.quantity')}
          required
          error={errors?.quantityReceived?.message}
        >
          <Input
            type="number"
            {...register(lineItemQty, { valueAsNumber: true })}
            min={1}
            placeholder="0"
          />
        </FormField>

        <FormField label={t('goodsReceipts.unitCost')} required error={errors?.unitCost?.message}>
          <Input
            type="number"
            {...register(lineItemCost, { valueAsNumber: true })}
            min={0}
            step="0.01"
            placeholder="0.00"
          />
        </FormField>

        {/* Selling Price Section */}
        <FormField
          label={t('goodsReceipts.sellingPrice')}
          required
          error={errors?.markupPercentage?.message || errors?.sellingPrice?.message}
          className="sm:col-span-2"
        >
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {MARKUP_OPTIONS.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handleMarkupSelect(pct)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    markupPercentage === pct && !customPriceMode
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {pct}%
                </button>
              ))}
              <button
                type="button"
                onClick={handleCustomPriceMode}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  customPriceMode
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-foreground hover:bg-muted"
                }`}
              >
                {t('goodsReceipts.custom')}
              </button>
            </div>

            {customPriceMode ? (
              <Input
                type="number"
                {...register(`items.${index}.sellingPrice`, { valueAsNumber: true })}
                min={unitCost}
                step="0.01"
                placeholder={`Min: ${unitCost.toFixed(2)}`}
              />
            ) : (
              <div className="text-sm text-muted-foreground">
                {unitCost > 0 && markupPercentage ? (
                  <span>
                    Unit Cost: <span className="font-medium text-foreground">ETB {unitCost.toFixed(2)}</span>
                    {" × "}{markupPercentage}% ={" "}
                    <span className="font-medium text-primary">ETB {calculatedSellingPrice.toFixed(2)}</span>
                  </span>
                ) : (
                  <span>{t('goodsReceipts.selectMarkupOrCustom')}</span>
                )}
              </div>
            )}
          </div>
        </FormField>
      </div>

      <Dialog open={newItemOpen} onOpenChange={setNewItemOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('items.newItem')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitItem(handleCreateItem)} className="space-y-4">
            <FormField label={t('items.newItem')} required error={itemErrors.name?.message}>
              <Input {...registerItem("name")} placeholder={t('items.itemNamePlaceholder')} />
            </FormField>
            <FormField label={t('inventory.genericName')} error={itemErrors.genericName?.message}>
              <Input {...registerItem("genericName")} placeholder={t('items.genericNamePlaceholder')} />
            </FormField>
            <FormField label={t('inventory.category')} error={itemErrors.category?.message}>
              <Input {...registerItem("category")} placeholder={t('items.categoryPlaceholder')} />
            </FormField>
            <FormField label={t('inventory.unit')} required error={itemErrors.unit?.message}>
              <Input {...registerItem("unit")} placeholder={t('items.unitPlaceholder')} />
            </FormField>
            <FormField label={t('inventory.reorderLevel')} error={itemErrors.reorderLevel?.message}>
              <Input
                type="number"
                {...registerItem("reorderLevel", { valueAsNumber: true })}
                placeholder={t('items.reorderLevelPlaceholder')}
              />
            </FormField>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setNewItemOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" isLoading={isCreatingItem}>
                {t('items.createItem')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
