'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useDeleteBatchItemMutation } from '@/store/api/goods-receipts-api-slice';
import { useAuth } from '@/lib/auth/use-auth';
import { useTranslations } from '@/lib/i18n';
import type { GoodsReceiptDetail as GoodsReceiptDetailType, Batch, GoodsReceiptPaymentMethod } from '@/types/api';

interface GoodsReceiptDetailProps {
  receipt: GoodsReceiptDetailType;
  showEdit?: boolean;
}

function isNearExpiry(expiryDate: string): boolean {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(now.getDate() + 30);
  return expiry <= thirtyDaysFromNow;
}

function isExpired(expiryDate: string): boolean {
  return new Date(expiryDate) < new Date();
}

const PAYMENT_METHOD_LABELS: Record<GoodsReceiptPaymentMethod, string> = {
  cash: 'Cash',
  credit: 'Credit',
  mobile_bank: 'Mobile Bank',
};

export function GoodsReceiptDetail({ receipt, showEdit = true }: GoodsReceiptDetailProps) {
  const { t } = useTranslations();
  const { isAdmin, isStoreKeeper } = useAuth();
  const canDeleteBatch = isAdmin || isStoreKeeper;
  const [deleteBatchItem, { isLoading: isDeleting }] = useDeleteBatchItemMutation();
  const [batchToDelete, setBatchToDelete] = useState<Batch | null>(null);

  const handleDeleteBatch = async () => {
    if (!batchToDelete) return;
    try {
      await deleteBatchItem({ grnId: receipt.id, batchId: batchToDelete.id }).unwrap();
      toast.success(t('goodsReceipts.removeItemSuccess'));
      setBatchToDelete(null);
    } catch (err: unknown) {
      const apiError = err as { status?: number; data?: { message?: string } };
      if (apiError.data?.message) {
        toast.error(apiError.data.message);
      } else {
        toast.error(t('goodsReceipts.removeItemFailed'));
      }
    }
  };

  const batchColumns: Column<Batch>[] = [
    { key: 'itemName', header: 'Item' },
    { key: 'batchNo', header: 'Batch No' },
    {
      key: 'expiryDate',
      header: 'Expiry Date',
      render: (b) => {
        const expired = isExpired(b.expiryDate);
        const nearExpiry = isNearExpiry(b.expiryDate);
        return (
          <div className="flex items-center gap-2">
            <span>{new Date(b.expiryDate).toLocaleDateString()}</span>
            {expired && <Badge variant="danger">Expired</Badge>}
            {!expired && nearExpiry && <Badge variant="danger">Near Expiry</Badge>}
          </div>
        );
      },
    },
    {
      key: 'quantityReceived',
      header: 'Quantity',
      render: (b) => {
        if (b.packSize && b.numberOfPacks) {
          return (
            <div>
              <span className="font-medium">{b.quantityReceived} units</span>
              <span className="text-muted-foreground text-xs block">
                ({b.numberOfPacks} packs × {b.packSize})
              </span>
            </div>
          );
        }
        if (b.packSize && b.packSize > 0) {
          return (
            <div>
              <span className="font-medium">{b.quantityReceived} units</span>
              <span className="text-muted-foreground text-xs block">
                ({Math.ceil(b.quantityReceived / b.packSize)} packs of {b.packSize})
              </span>
            </div>
          );
        }
        return <span className="font-medium">{b.quantityReceived}</span>;
      },
    },
    {
      key: 'unitCost',
      header: 'Unit Cost',
      render: (b) =>
        b.unitCost.toLocaleString('en-US', {
          style: 'currency',
          currency: 'ETB',
        }),
    },
    ...(canDeleteBatch
      ? [
          {
            key: 'actions' as const,
            header: '',
            render: (b: Batch) => (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setBatchToDelete(b);
                }}
                className="text-muted-foreground hover:text-destructive"
                title={t('goodsReceipts.removeItem')}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{receipt.grnNumber}</h1>
          <p className="text-sm text-muted-foreground">
            Receipt Date: {new Date(receipt.receiptDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          {showEdit && (
            <Link href={`/goods-receipts/${receipt.id}/edit`}>
              <Button variant="secondary">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
          )}
          {receipt.invoiceDocumentUrl && (
            <a href={receipt.invoiceDocumentUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Invoice
              </Button>
            </a>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-foreground">Receipt Info</h2>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <dt className="text-sm text-muted-foreground">Supplier</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">{receipt.supplierName}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Branch</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">{receipt.branchName}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Total Cost</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {Number(receipt.totalCost).toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'ETB',
                })}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Items</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">{receipt.items?.length ?? 0}</dd>
            </div>
            {receipt.supplierPhone && (
              <div>
                <dt className="text-sm text-muted-foreground">Supplier Phone</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">{receipt.supplierPhone}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm text-muted-foreground">Payment Method</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {PAYMENT_METHOD_LABELS[receipt.paymentMethod] ?? receipt.paymentMethod}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {receipt.items?.some((b) => isExpired(b.expiryDate) || isNearExpiry(b.expiryDate)) && (
        <div className="rounded-md bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800 font-medium">
            Warning: This receipt contains batches that are expired or near expiry.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-foreground">Line Items</h2>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={batchColumns}
            data={receipt.items ?? []}
            emptyMessage="No items in this receipt"
            keyExtractor={(b) => b.id}
          />
        </CardContent>
      </Card>

      <div>
        <Link
          href="/goods-receipts"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = '/goods-receipts';
          }}
          className="text-primary hover:text-primary/80 text-sm font-medium"
        >
          &larr; Back to Goods Receipts
        </Link>
      </div>

      <ConfirmDialog
        open={!!batchToDelete}
        title={t('goodsReceipts.removeItem')}
        description={t('goodsReceipts.removeItemConfirm', {
          itemName: batchToDelete?.itemName ?? '',
          batchNo: batchToDelete?.batchNo ?? '',
        })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        onConfirm={handleDeleteBatch}
        onCancel={() => setBatchToDelete(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}
