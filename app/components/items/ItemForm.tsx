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

const itemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  genericName: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().min(1, 'Unit is required'),
  reorderLevel: z.coerce.number({ invalid_type_error: 'Reorder level must be a number' })
    .int('Reorder level must be a whole number')
    .nonnegative('Must be non-negative'),
  isControlledSubstance: z.boolean(),
});

type ItemFormData = z.infer<typeof itemSchema>;

interface ItemFormProps {
  itemId?: string;
}

export function ItemForm({ itemId }: ItemFormProps) {
  const router = useRouter();
  const isEditing = !!itemId;

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
      reorderLevel: 0,
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
        toast.success('Item updated successfully');
      } else {
        await createItem(data).unwrap();
        toast.success('Item created successfully');
      }
      router.push('/items');
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string; errors?: Record<string, string[]> } };
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
          {isEditing ? 'Edit Item' : 'New Item'}
        </h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
          {errors.root && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {errors.root.message}
            </div>
          )}

          <FormField label="Name" required error={errors.name?.message}>
            <Input {...register('name')} placeholder="Item name" />
          </FormField>

          <FormField label="Generic Name" error={errors.genericName?.message}>
            <Input {...register('genericName')} placeholder="Generic name" />
          </FormField>

          <FormField label="Category" error={errors.category?.message}>
            <Input {...register('category')} placeholder="Category" />
          </FormField>

          <FormField label="Unit" required error={errors.unit?.message}>
            <Input {...register('unit')} placeholder="e.g. tablets, ml, pcs" />
          </FormField>

          <FormField label="Reorder Level" error={errors.reorderLevel?.message}>
            <Input
              type="number"
              {...register('reorderLevel', { valueAsNumber: true })}
              min={0}
            />
          </FormField>

          <FormField label="Controlled Substance" error={errors.isControlledSubstance?.message}>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('isControlledSubstance')}
                className="h-4 w-4 rounded border-input"
              />
              <span className="text-sm text-muted-foreground">This is a controlled substance</span>
            </label>
          </FormField>

          <div className="flex gap-3 pt-4">
            <Button type="submit" isLoading={isLoading}>
              {isEditing ? 'Update Item' : 'Create Item'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/items')}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
