'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useGetGoodsReceiptQuery } from '@/store/api/goods-receipts-api-slice';
import { useGetGrnPaymentsQuery } from '@/store/api/supplier-payments-api-slice';
import { GoodsReceiptDetail } from '@/components/goods-receipts/GoodsReceiptDetail';
import { PaymentHistoryTable } from '@/components/supplier-payments/PaymentHistoryTable';
import { RecordPaymentForm } from '@/components/supplier-payments/RecordPaymentForm';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Pencil } from 'lucide-react';

export default function GoodsReceiptDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);

  const { data: receipt, isLoading, error } = useGetGoodsReceiptQuery(id);
  const { data: paymentData, isLoading: isLoadingPayments } = useGetGrnPaymentsQuery(id);

  if (isLoading) {
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

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-red-600">Failed to load goods receipt.</p>
        </CardContent>
      </Card>
    );
  }

  if (!receipt) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">Goods receipt not found.</p>
        </CardContent>
      </Card>
    );
  }

  const balance = paymentData?.balance;
  const payments = paymentData?.payments || [];

  return (
    <div className="space-y-6">
      <GoodsReceiptDetail receipt={receipt} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Payment</h2>
            {balance && balance.outstanding > 0 && (
              <Button size="sm" onClick={() => setPaymentFormOpen(true)}>
                Record Payment
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {balance && (
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <dt className="text-sm text-muted-foreground">Total Cost</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">
                  {balance.totalCost.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'ETB',
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Total Paid</dt>
                <dd className="mt-1 text-sm font-medium text-green-600">
                  {balance.totalPaid.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'ETB',
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Outstanding</dt>
                <dd className="mt-1">
                  <span
                    className={
                      balance.outstanding === 0
                        ? 'text-sm font-medium text-green-600'
                        : 'text-sm font-bold text-red-600'
                    }
                  >
                    {balance.outstanding.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'ETB',
                    })}
                  </span>
                  {balance.outstanding === 0 && (
                    <Badge variant="success" className="ml-2">
                      Paid
                    </Badge>
                  )}
                  {balance.outstanding > 0 && balance.outstanding < balance.totalCost && (
                    <Badge variant="secondary" className="ml-2">
                      Partial
                    </Badge>
                  )}
                  {balance.outstanding === balance.totalCost && (
                    <Badge variant="danger" className="ml-2">
                      Unpaid
                    </Badge>
                  )}
                </dd>
              </div>
            </dl>
          )}

          <h3 className="text-sm font-semibold text-foreground">Payment History</h3>
          <PaymentHistoryTable data={payments} isLoading={isLoadingPayments} />
        </CardContent>
      </Card>

      {receipt.invoiceDocumentUrl && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-foreground">Invoice</h2>
          </CardHeader>
          <CardContent>
            <img
              src={receipt.invoiceDocumentUrl}
              alt="Invoice"
              className="max-w-full rounded-md border border-border"
            />
          </CardContent>
        </Card>
      )}

      {balance && (
        <RecordPaymentForm
          open={paymentFormOpen}
          onClose={() => setPaymentFormOpen(false)}
          grnId={id}
          supplierId={receipt.supplierId}
          outstandingBalance={balance.outstanding}
          grnNumber={receipt.grnNumber}
        />
      )}
    </div>
  );
}
