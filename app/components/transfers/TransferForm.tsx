'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useGetItemsQuery } from '@/store/api/items-api-slice';
import { useGetStockByLocationQuery, useCreateTransferMutation } from '@/store/api/transfers-api-slice';
import { FefoSuggestionList } from './FefoSuggestionList';
import { useTranslations } from '@/lib/i18n';

export function TransferForm() {
  const router = useRouter();
  const { t } = useTranslations();
  const searchParams = useSearchParams();
  const preselectedItemId = searchParams.get('itemId') || '';

  const transferSchema = z.object({
    itemId: z.string().min(1, t('transfers.itemRequired')),
    quantity: z.number().int().positive(t('transfers.quantityPositiveInteger')),
  });

  type TransferFormData = z.infer<typeof transferSchema>;

  const [selectedItemId, setSelectedItemId] = useState(preselectedItemId);
  const [itemSearch, setItemSearch] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);

  const [createTransfer, { isLoading: isCreating }] = useCreateTransferMutation();

  const items = useGetItemsQuery({ search: itemSearch || undefined, page: 1, limit: 50 }).data?.data ?? [];

  const { data: stockData } = useGetStockByLocationQuery(
    { search: selectedItemId ? items?.find((i) => i.id === selectedItemId)?.name : undefined },
    { skip: !selectedItemId }
  );

  const selectedItemStock = useMemo(
    () => stockData?.data?.find((s) => s.itemId === selectedItemId),
    [stockData, selectedItemId]
  );

  useEffect(() => {
    if (preselectedItemId) {
      setSelectedItemId(preselectedItemId);
    }
  }, [preselectedItemId]);

  useEffect(() => {
    setSelectedBatchId(null);
  }, [selectedItemId]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      itemId: preselectedItemId,
      quantity: 0,
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedQuantity = watch('quantity');

  useEffect(() => {
    if (watchedQuantity !== quantity) {
      setQuantity(watchedQuantity || 0);
    }
  }, [watchedQuantity, quantity]);

  useEffect(() => {
    if (selectedItemId) {
      setValue('itemId', selectedItemId);
    }
  }, [selectedItemId, setValue]);

  const onSubmit = async (data: TransferFormData) => {
    if (!selectedBatchId) {
      setTransferError(t('transfers.selectBatchFirst'));
      return;
    }

    setTransferError(null);

    try {
      await createTransfer({
        batchId: selectedBatchId,
        quantity: data.quantity,
      }).unwrap();

      setTransferSuccess(true);
      toast.success(t('transfers.createdSuccess'));
      setTimeout(() => {
        router.push('/transfers');
      }, 1500);
    } catch (err: unknown) {
      const apiError = err as { status?: number; data?: { message?: string } };
      if (apiError.status && apiError.status >= 500) {
        toast.error('An unexpected error occurred. Please try again.');
        setTransferError('An unexpected error occurred. Please try again.');
        return;
      }
      if (apiError.data?.message) {
        toast.error(apiError.data.message);
        setTransferError(apiError.data.message);
        setSelectedBatchId(null);
      } else {
        setTransferError(t('transfers.transferFailed'));
      }
    }
  };

  if (transferSuccess) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <ArrowRight className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">{t('transfers.transferSuccessful')}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('transfers.stockMoved')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {transferError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {transferError}
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-foreground">{t('transfers.transferDetails')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('transfers.transferDescription')}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label={t('transfers.item')} required error={errors.itemId?.message}>
              <SearchableSelect
                value={selectedItemId}
                onChange={(val) => {
                  setSelectedItemId(val);
                  setValue('itemId', val);
                }}
                onSearchChange={setItemSearch}
                options={items.map((item) => ({
                  value: item.id,
                  label: `${item.name}${item.strength ? ` - ${item.strength}` : ''}`,
                }))}
                placeholder={t('transfers.selectItem')}
                emptyMessage={t('transfers.noItemsFound')}
              />
            </FormField>

            <FormField label={t('transfers.quantityToTransfer')} required error={errors.quantity?.message}>
              <Input
                type="number"
                {...register('quantity', { valueAsNumber: true })}
                min={1}
                max={selectedItemStock?.storeQuantity || 0}
                placeholder="0"
              />
            </FormField>
          </div>

          {selectedItemStock && (
            <div className="rounded-md bg-background p-3">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">{t('transfers.fromStore')}:</span> {selectedItemStock.storeQuantity} ·{' '}
                <span className="font-medium">{t('transfers.toDispatcher')}:</span> {selectedItemStock.dispatcherQuantity}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">{t('transfers.fromStore')}</span>
            <ArrowRight className="h-4 w-4" />
            <span className="font-medium">{t('transfers.toDispatcher')}</span>
          </div>
        </CardContent>
      </Card>

      {selectedItemId && quantity > 0 && (
        <FefoSuggestionList
          itemId={selectedItemId}
          quantityNeeded={quantity}
          selectedBatchId={selectedBatchId}
          onSelectBatch={(batchId) => {
            setSelectedBatchId(batchId);
          }}
        />
      )}

      <div className="flex gap-3">
        <Button
          type="submit"
          isLoading={isCreating}
          disabled={!selectedBatchId || quantity <= 0}
        >
          {t('transfers.confirmTransfer')}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/transfers')}
          disabled={isCreating}
        >
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  );
}
