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
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useGetSupplierQuery,
} from '@/store/api/suppliers-api-slice';
import { useTranslations } from '@/lib/i18n';

interface SupplierFormProps {
  supplierId?: string;
}

export function SupplierForm({ supplierId }: SupplierFormProps) {
  const router = useRouter();
  const { t } = useTranslations();
  const isEditing = !!supplierId;

  const supplierSchema = z.object({
    name: z.string().min(1, t('suppliers.nameRequired')),
    phone: z.string().optional(),
    address: z.string().optional(),
    licenseNo: z.string().optional(),
  });

  type SupplierFormData = z.infer<typeof supplierSchema>;

  const { data: supplier, isLoading: isLoadingSupplier } = useGetSupplierQuery(supplierId!, {
    skip: !isEditing,
  });

  const [createSupplier, { isLoading: isCreating }] = useCreateSupplierMutation();
  const [updateSupplier, { isLoading: isUpdating }] = useUpdateSupplierMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      licenseNo: '',
    },
  });

  useEffect(() => {
    if (supplier) {
      reset({
        name: supplier.name,
        phone: supplier.phone || '',
        address: supplier.address || '',
        licenseNo: supplier.licenseNo || '',
      });
    }
  }, [supplier, reset]);

  const onSubmit = async (data: SupplierFormData) => {
    try {
      if (isEditing) {
        await updateSupplier({ id: supplierId!, body: data }).unwrap();
        toast.success(t('suppliers.updatedSuccess'));
      } else {
        await createSupplier(data).unwrap();
        toast.success(t('suppliers.createdSuccess'));
      }
      router.push('/suppliers');
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
          setError(field as keyof SupplierFormData, {
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

  if (isEditing && isLoadingSupplier) {
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
          {isEditing ? t('suppliers.editSupplier') : t('suppliers.newSupplier')}
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
            <Input {...register('name')} placeholder={t('suppliers.supplierNamePlaceholder')} />
          </FormField>

          <FormField label={t('common.phone')} error={errors.phone?.message}>
            <Input {...register('phone')} placeholder={t('suppliers.phonePlaceholder')} />
          </FormField>

          <FormField label={t('common.address')} error={errors.address?.message}>
            <Input {...register('address')} placeholder={t('suppliers.addressPlaceholder')} />
          </FormField>

          <FormField label={t('suppliers.licenseNumber')} error={errors.licenseNo?.message}>
            <Input {...register('licenseNo')} placeholder={t('suppliers.licensePlaceholder')} />
          </FormField>

          <div className="flex gap-3 pt-4">
            <Button type="submit" isLoading={isLoading}>
              {isEditing ? t('suppliers.updateSupplier') : t('suppliers.createSupplier')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/suppliers')}
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
