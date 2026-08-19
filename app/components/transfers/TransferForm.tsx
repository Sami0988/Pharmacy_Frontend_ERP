'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Package, Hash } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useGetItemsQuery } from '@/store/api/items-api-slice';
import { useGetStockByLocationQuery, useCreateTransferMutation } from '@/store/api/transfers-api-slice';
import { FefoSuggestionList } from './FefoSuggestionList';
import { useTranslations } from '@/lib/i18n';

type TransferMode = 'packs' | 'quantity';

export function TransferForm() {
  const router = useRouter();
  const { t } = useTranslations();
  const searchParams = useSearchParams();
  const preselectedItemId = searchParams.get('itemId') || '';

  const [selectedItemId, setSelectedItemId] = useState(preselectedItemId);
  const [itemSearch, setItemSearch] = useState('');
  const [transferMode, setTransferMode] = useState<TransferMode>('packs');
  const [inputValue, setInputValue] = useState<number>(0);
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

  useEffect(() => {
    setInputValue(0);
    setSelectedBatchId(null);
  }, [transferMode]);

  const quantityNeeded = useMemo(() => {
    if (transferMode === 'packs') {
      const packSize = selectedItemStock?.packSize || 1;
      return inputValue * packSize;
    }
    return inputValue;
  }, [transferMode, inputValue, selectedItemStock]);

  const maxInput = useMemo(() => {
    if (transferMode === 'packs') {
      return selectedItemStock?.storePacks || 0;
    }
    return selectedItemStock?.storeQuantity || 0;
  }, [transferMode, selectedItemStock]);

  const onSubmit = async () => {
    if (!selectedBatchId) {
      setTransferError(t('transfers.selectBatchFirst'));
      return;
    }

    if (inputValue <= 0) {
      setTransferError(t('transfers.quantityPositiveInteger'));
      return;
    }

    setTransferError(null);

    try {
      const payload = transferMode === 'packs'
        ? { batchId: selectedBatchId, numberOfPacks: inputValue }
        : { batchId: selectedBatchId, quantity: inputValue };

      await createTransfer(payload).unwrap();

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
    <div className="space-y-6">
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
          <FormField label={t('transfers.item')} required>
            <SearchableSelect
              value={selectedItemId}
              onChange={(val) => setSelectedItemId(val)}
              onSearchChange={setItemSearch}
              options={items.map((item) => ({
                value: item.id,
                label: `${item.name}${item.strength ? ` - ${item.strength}` : ''}`,
              }))}
              placeholder={t('transfers.selectItem')}
              emptyMessage={t('transfers.noItemsFound')}
            />
          </FormField>

          {selectedItemStock && (
            <div className="rounded-md bg-background p-3">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">{t('transfers.fromStore')}:</span>{' '}
                {selectedItemStock.storeQuantity} units
                {selectedItemStock.storePacks != null && selectedItemStock.storePacks > 0 && (
                  <> ({selectedItemStock.storePacks} packs)</>
                )}
                {' · '}
                <span className="font-medium">{t('transfers.toDispatcher')}:</span>{' '}
                {selectedItemStock.dispatcherQuantity} units
              </p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              {t('transfers.transferMode')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTransferMode('packs')}
                className={cn(
                  'flex items-center gap-3 rounded-lg border p-4 text-left transition-colors',
                  transferMode === 'packs'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                )}
              >
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full',
                  transferMode === 'packs' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                )}>
                  <Package className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-medium',
                    transferMode === 'packs' ? 'text-primary' : 'text-foreground'
                  )}>
                    {t('transfers.byPacks')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('transfers.byPacksDescription')}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTransferMode('quantity')}
                className={cn(
                  'flex items-center gap-3 rounded-lg border p-4 text-left transition-colors',
                  transferMode === 'quantity'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                )}
              >
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full',
                  transferMode === 'quantity' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                )}>
                  <Hash className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-medium',
                    transferMode === 'quantity' ? 'text-primary' : 'text-foreground'
                  )}>
                    {t('transfers.byQuantity')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('transfers.byQuantityDescription')}
                  </p>
                </div>
              </button>
            </div>
          </div>

          <FormField
            label={transferMode === 'packs' ? t('transfers.numberOfPacks') : t('transfers.exactQuantity')}
            required
          >
            <Input
              type="number"
              value={inputValue || ''}
              onChange={(e) => setInputValue(parseInt(e.target.value) || 0)}
              min={1}
              max={maxInput}
              placeholder="0"
            />
          </FormField>

          {inputValue > 0 && (
            <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
              {transferMode === 'packs' ? (
                <>
                  {t('transfers.willTransferPacks')
                    .replace('{packs}', String(inputValue))
                    .replace('{units}', String(quantityNeeded))}
                </>
              ) : (
                <>
                  {t('transfers.willTransferUnits').replace('{units}', String(inputValue))}
                </>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">{t('transfers.fromStore')}</span>
            <ArrowRight className="h-4 w-4" />
            <span className="font-medium">{t('transfers.toDispatcher')}</span>
          </div>
        </CardContent>
      </Card>

      {selectedItemId && quantityNeeded > 0 && (
        <FefoSuggestionList
          itemId={selectedItemId}
          quantityNeeded={transferMode === 'packs' ? inputValue : quantityNeeded}
          transferMode={transferMode}
          selectedBatchId={selectedBatchId}
          onSelectBatch={(batchId) => {
            setSelectedBatchId(batchId);
          }}
        />
      )}

      <div className="flex gap-3">
        <Button
          onClick={onSubmit}
          isLoading={isCreating}
          disabled={!selectedBatchId || inputValue <= 0}
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
    </div>
  );
}
