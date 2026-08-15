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
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useGetCustomerQuery,
} from '@/store/api/customers-api-slice';

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  customerId?: string;
}

export function CustomerForm({ customerId }: CustomerFormProps) {
  const router = useRouter();
  const isEditing = !!customerId;

  const { data: customer, isLoading: isLoadingCustomer } = useGetCustomerQuery(customerId!, {
    skip: !isEditing,
  });

  const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation();
  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
    },
  });

  useEffect(() => {
    if (customer) {
      reset({
        name: customer.name,
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
      });
    }
  }, [customer, reset]);

  const onSubmit = async (data: CustomerFormData) => {
    try {
      if (isEditing) {
        await updateCustomer({ id: customerId!, body: data }).unwrap();
        toast.success('Customer updated successfully');
      } else {
        await createCustomer(data).unwrap();
        toast.success('Customer created successfully');
      }
      router.push('/customers');
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
          setError(field as keyof CustomerFormData, {
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

  if (isEditing && isLoadingCustomer) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-foreground">
          {isEditing ? 'Edit Customer' : 'New Customer'}
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
            <Input {...register('name')} placeholder="Customer name" />
          </FormField>

          <FormField label="Phone" error={errors.phone?.message}>
            <Input {...register('phone')} placeholder="Phone number" />
          </FormField>

          <FormField label="Email" error={errors.email?.message}>
            <Input {...register('email')} type="email" placeholder="Email address" />
          </FormField>

          <FormField label="Address" error={errors.address?.message}>
            <Input {...register('address')} placeholder="Address" />
          </FormField>

          <div className="flex gap-3 pt-4">
            <Button type="submit" isLoading={isLoading}>
              {isEditing ? 'Update Customer' : 'Create Customer'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/customers')}
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
