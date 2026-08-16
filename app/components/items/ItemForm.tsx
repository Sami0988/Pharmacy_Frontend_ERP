'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import {
  useCreateItemMutation,
  useUpdateItemMutation,
  useGetItemQuery,
} from '@/store/api/items-api-slice';
import { useTranslations } from '@/lib/i18n';

interface ItemFormProps {
  itemId?: string;
}

export function ItemForm({ itemId }: ItemFormProps) {
  const router = useRouter();
  const { t } = useTranslations();
  const isEditing = !!itemId;

  const itemSchema = z.object({
    name: z.string().min(1, t('items.nameRequired')),
    genericName: z.string().optional(),
    category: z.string().optional(),
    unit: z.string().min(1, t('items.unitRequired')),
    reorderLevel: z.number({ error: t('items.reorderNumber') })
      .int(t('items.reorderWhole'))
      .nonnegative(t('items.reorderNonNegative')),
    isControlledSubstance: z.boolean(),
  });

  type ItemFormData = z.infer<typeof itemSchema>;

  const { data: item, isLoading: isLoadingItem } = useGetItemQuery(itemId!, {
    skip: !isEditing,
  });

  const [createItem, { isLoading: isCreating }] = useCreateItemMutation();
  const [updateItem, { isLoading: isUpdating }] = useUpdateItemMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: '',
      genericName: '',
      category: '',
      unit: '',
      reorderLevel: 5,
      isControlledSubstance: false,
    },
  });

  useEffect(() => {
    if (item) {
      reset({
        name: item.name,
        genericName: item.genericName || '',
        category: item.category || '',
        unit: item.unit,
        reorderLevel: item.reorderLevel,
        isControlledSubstance: item.isControlledSubstance,
      });
    }
  }, [item, reset]);

  const onSubmit = async (data: ItemFormData) => {
    try {
      if (isEditing) {
        await updateItem({ id: itemId!, body: data }).unwrap();
        toast.success(t('items.updatedSuccess'));
      } else {
        await createItem(data).unwrap();
        toast.success(t('items.createdSuccess'));
      }
      router.push('/items');
    } catch (err: unknown) {
      const apiError = err as { status?: number; data?: { message?: string; errors?: Record<string, string[]> } };
      if (apiError.status && apiError.status >= 500) {
        toast.error('An unexpected error occurred. Please try again.');
        return;
      }
      if (apiError.data?.message) {
        toast.error(apiError.data.message);
      }
      if (apiError.data?.errors) {
        Object.entries(apiError.data.errors).forEach(([field, messages]) => {
          setError(field as keyof ItemFormData, {
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

  const isLoading = isCreating || isUpdating;

  if (isEditing && isLoadingItem) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-foreground">
          {isEditing ? t('items.editItem') : t('items.newItem')}
        </h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
          {errors.root && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {errors.root.message}
            </div>
          )}

          <FormField label={t('common.name')} required error={errors.name?.message}>
            <Input {...register('name')} placeholder={t('items.itemNamePlaceholder')} />
          </FormField>

          <FormField label={t('items.brandName')} error={errors.genericName?.message}>
            <Input {...register('genericName')} placeholder={t('items.genericNamePlaceholder')} />
          </FormField>

          <FormField label={t('inventory.category')} error={errors.category?.message}>
            <Input {...register('category')} placeholder={t('items.categoryPlaceholder')} />
          </FormField>

          <FormField label={t('inventory.unit')} required error={errors.unit?.message}>
            <Input {...register('unit')} placeholder={t('items.unitPlaceholder')} />
          </FormField>

          <FormField label={t('inventory.reorderLevel')} error={errors.reorderLevel?.message}>
            <Input
              type="number"
              {...register('reorderLevel', { valueAsNumber: true })}
              min={0}
            />
          </FormField>

          <FormField label={t('items.controlledSubstance')} error={errors.isControlledSubstance?.message}>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('isControlledSubstance')}
                className="h-4 w-4 rounded border-input"
              />
              <span className="text-sm text-muted-foreground">{t('items.controlledSubstanceLabel')}</span>
            </label>
          </FormField>

          <div className="flex gap-3 pt-4">
            <Button type="submit" isLoading={isLoading}>
              {isEditing ? t('items.updateItem') : t('items.createItem')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/items')}
              disabled={isLoading}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
