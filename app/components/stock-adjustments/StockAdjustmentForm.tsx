'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle, Warehouse, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FormField } from '@/components/ui/FormField';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import {
  useSearchBatchesQuery,
  useLazySearchBatchesQuery,
  useLazyGetBatchByIdQuery,
  useGetLocationsQuery,
  useCreateStockAdjustmentMutation,
} from '@/store/api/stock-adjustments-api-slice';
import type { BatchWithStock } from '@/store/api/stock-adjustments-api-slice';
import { useGetItemsQuery } from '@/store/api/items-api-slice';
import type { BatchSearchResult } from '@/types/api';
import { useTranslations } from '@/lib/i18n';

export function StockAdjustmentForm() {
  const router = useRouter();
  const { t } = useTranslations();

  const [batchSearch, setBatchSearch] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<BatchSearchResult | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [batchDetails, setBatchDetails] = useState<BatchWithStock | null>(null);

  const [searchBatches, { isLoading: isSearchingBatches }] = useLazySearchBatchesQuery();
  const [getBatchById] = useLazyGetBatchByIdQuery();
  const [createStockAdjustment, { isLoading: isCreating }] = useCreateStockAdjustmentMutation();

  const { data: initialBatchesData } = useSearchBatchesQuery({ page: 1, limit: 50 });
  const [batchResults, setBatchResults] = useState<BatchSearchResult[]>([]);
  const [adjustmentResult, setAdjustmentResult] = useState<{
    previousQty: number;
    newQty: number;
    delta: number;
  } | null>(null);

  useEffect(() => {
    if (initialBatchesData?.data) {
      setBatchResults(initialBatchesData.data);
    }
  }, [initialBatchesData]);

  const { data: itemsData } = useGetItemsQuery({ page: 1, limit: 100 });
  const itemMap = useMemo(() => {
    const map = new Map<string, string>();
    itemsData?.data?.forEach((item) => map.set(item.id, item.name));
    return map;
  }, [itemsData]);

  const { data: locationsData } = useGetLocationsQuery();
  const locationNameMap = useMemo(() => {
    const map = new Map<string, string>();
    if (locationsData) {
      locationsData.forEach((loc) => map.set(loc.id, loc.name));
    }
    return map;
  }, [locationsData]);

  const locationOptions = useMemo(() => {
    if (!batchDetails?.quantitiesByLocation) return [];
    return batchDetails.quantitiesByLocation.map((ql, index) => ({
      id: ql.locationId,
      name: locationNameMap.get(ql.locationId) ?? (index === 0 ? 'Store' : 'Dispatcher'),
      quantity: Number(ql.quantity),
    }));
  }, [batchDetails, locationNameMap]);

  const currentQuantity = useMemo(() => {
    if (!batchDetails || !selectedLocationId) return null;
    const found = batchDetails.quantitiesByLocation?.find((ql) => ql.locationId === selectedLocationId);
    return found ? Number(found.quantity) : null;
  }, [batchDetails, selectedLocationId]);

  const adjustmentSchema = z.object({
    batchId: z.string().min(1, t('stockAdjustments.batchRequired')),
    locationId: z.string().min(1, t('stockAdjustments.locationRequired')),
    newQuantity: z.number().int().min(0, t('stockAdjustments.nonNegativeInteger')),
    reason: z.string().min(3, t('stockAdjustments.reasonMinLength')),
  });

  type AdjustmentFormData = z.infer<typeof adjustmentSchema>;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<AdjustmentFormData>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      batchId: '',
      locationId: '',
      newQuantity: 0,
      reason: '',
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedNewQuantity = watch('newQuantity');

  const fetchBatchDetails = async (batchId: string) => {
    try {
      const details = await getBatchById(batchId).unwrap();
      setBatchDetails(details);
    } catch {
      setBatchDetails(null);
    }
  };

  const handleBatchSearch = async (search: string) => {
    setBatchSearch(search);
    if (!search || search.length < 2) {
      setBatchResults(initialBatchesData?.data ?? []);
      return;
    }
    try {
      const result = await searchBatches({ search, page: 1, limit: 20 }).unwrap();
      setBatchResults(result.data ?? []);
    } catch {
      setBatchResults([]);
    }
  };

  const handleSelectBatch = async (batchId: string) => {
    const batch = batchResults.find((b) => b.id === batchId);
    setSelectedBatch(batch ?? null);
    setValue('batchId', batchId, { shouldValidate: true });
    setBatchDetails(null);
    setSelectedLocationId('');
    setValue('locationId', '', { shouldValidate: true });

    if (batchId) {
      await fetchBatchDetails(batchId);
    }
  };

  const handleSelectLocation = (locationId: string) => {
    setSelectedLocationId(locationId);
    setValue('locationId', locationId, { shouldValidate: true });
  };

  const delta = useMemo(() => {
    if (currentQuantity === null || watchedNewQuantity === undefined) return null;
    return watchedNewQuantity - currentQuantity;
  }, [currentQuantity, watchedNewQuantity]);

  const onSubmit = async (data: AdjustmentFormData) => {
    try {
      const result = await createStockAdjustment({
        batchId: data.batchId,
        locationId: data.locationId,
        newQuantity: data.newQuantity,
        reason: data.reason,
      }).unwrap();

      setAdjustmentResult({
        previousQty: result.previousQty,
        newQty: result.newQty,
        delta: result.delta,
      });

      toast.success(t('stockAdjustments.createdSuccess'));
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string; errors?: Record<string, string[]> } };
      if (apiError.data?.message) {
        toast.error(apiError.data.message);
      } else {
        toast.error(t('stockAdjustments.createFailed'));
      }
    }
  };

  if (adjustmentResult) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">{t('stockAdjustments.adjustmentSuccessful')}</h3>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                {t('stockAdjustments.previousQuantity')}: <span className="font-medium text-foreground">{adjustmentResult.previousQty}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                {t('stockAdjustments.newQuantity')}: <span className="font-medium text-foreground">{adjustmentResult.newQty}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                {t('stockAdjustments.change')}: <span className={`font-medium ${adjustmentResult.delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {adjustmentResult.delta >= 0 ? '+' : ''}{adjustmentResult.delta}
                </span>
              </p>
            </div>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="secondary" onClick={() => window.location.href = '/stock'}>
                {t('stockAdjustments.backToStock')}
              </Button>
              <Button onClick={() => {
                setAdjustmentResult(null);
                setSelectedBatch(null);
                setSelectedLocationId('');
                setBatchDetails(null);
                setBatchResults([]);
                setBatchSearch('');
              }}>
                {t('stockAdjustments.newAdjustment')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-foreground">{t('stockAdjustments.adjustmentDetails')}</h2>
          <p className="text-sm text-muted-foreground">{t('stockAdjustments.adjustmentDescription')}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label={t('stockAdjustments.batch')} required error={errors.batchId?.message}>
            <SearchableSelect
              value={selectedBatch?.id ?? ''}
              onChange={handleSelectBatch}
              onSearchChange={handleBatchSearch}
              options={batchResults.map((b) => ({
                value: b.id,
                label: `${b.batchNo} — ${itemMap.get(b.itemId) ?? 'Unknown item'} (exp: ${new Date(b.expiryDate).toLocaleDateString()})`,
              }))}
              placeholder={t('stockAdjustments.searchBatch')}
              emptyMessage={isSearchingBatches ? t('stockAdjustments.searching') : t('stockAdjustments.noBatchesFound')}
            />
          </FormField>

          {selectedBatch && locationOptions.length > 0 && (
            <FormField label={t('stockAdjustments.location')} required error={errors.locationId?.message}>
              <div className="grid grid-cols-2 gap-3">
                {locationOptions.map((loc) => {
                  const isSelected = selectedLocationId === loc.id;
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => handleSelectLocation(loc.id)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border p-4 text-left transition-colors',
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      )}
                    >
                      <div className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full',
                        isSelected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                      )}>
                        {loc.name.toLowerCase().includes('store') ? (
                          <Warehouse className="h-5 w-5" />
                        ) : (
                          <Truck className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-sm font-medium',
                          isSelected ? 'text-primary' : 'text-foreground'
                        )}>
                          {loc.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {loc.quantity} {t('stockAdjustments.inStock')}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </FormField>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-foreground">{t('stockAdjustments.adjustmentInput')}</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentQuantity !== null && (
            <div className="rounded-md bg-background p-4">
              <p className="text-sm text-muted-foreground">
                {t('stockAdjustments.currentStock')}: <span className="font-medium text-foreground">{currentQuantity}</span>
              </p>
            </div>
          )}

          <FormField label={t('stockAdjustments.newQuantityLabel')} required error={errors.newQuantity?.message}>
            <Input
              type="number"
              {...register('newQuantity', { valueAsNumber: true })}
              min={0}
              placeholder="0"
            />
          </FormField>

          {currentQuantity !== null && delta !== null && (
            <div className={`rounded-md p-3 ${delta >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className={`text-sm font-medium ${delta >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {t('stockAdjustments.adjustmentPreview')}: {currentQuantity} → {watchedNewQuantity ?? 0} (
                <span className={delta >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {delta >= 0 ? '+' : ''}{delta}
                </span>)
              </p>
            </div>
          )}

          <FormField label={t('stockAdjustments.reason')} required error={errors.reason?.message}>
            <Textarea
              {...register('reason')}
              placeholder={t('stockAdjustments.reasonPlaceholder')}
              rows={3}
            />
          </FormField>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" isLoading={isCreating} disabled={!selectedBatch || !selectedLocationId}>
          {t('stockAdjustments.submitAdjustment')}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.location.href = '/stock'}
          disabled={isCreating}
        >
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  );
}
