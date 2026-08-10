'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useGetSupplierQuery } from '@/store/api/suppliers-api-slice';
import {
  useGetSupplierBalanceQuery,
  useGetSupplierPaymentsQuery,
} from '@/store/api/supplier-payments-api-slice';
import { SupplierBalanceCard } from '@/components/supplier-payments/SupplierBalanceCard';
import { PaymentHistoryTable } from '@/components/supplier-payments/PaymentHistoryTable';
import { RecordPaymentForm } from '@/components/supplier-payments/RecordPaymentForm';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function SupplierDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [paymentFormOpen, setPaymentFormOpen] = useState(false);
  const [selectedGrn, setSelectedGrn] = useState<{
    grnId: string;
    grnNumber: string;
    outstanding: number;
  } | null>(null);

  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentLimit, setPaymentLimit] = useState(10);

  const { data: supplier, isLoading: isLoadingSupplier } = useGetSupplierQuery(id);
  const { data: balance, isLoading: isLoadingBalance } = useGetSupplierBalanceQuery(id);
  const { data: paymentsResponse, isLoading: isLoadingPayments, isFetching: isFetchingPayments } = useGetSupplierPaymentsQuery({
    supplierId: id,
    page: paymentPage,
    limit: paymentLimit,
  });

  if (isLoadingSupplier || isLoadingBalance) {
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

  if (!supplier || !balance) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">Supplier not found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{supplier.name}</h1>
          <p className="text-sm text-muted-foreground">
            {supplier.phone && `${supplier.phone} · `}
            {supplier.address || 'No address'}
          </p>
        </div>
        <Link href={`/suppliers/${id}/edit`}>
          <Button variant="secondary">Edit Supplier</Button>
        </Link>
      </div>

      <SupplierBalanceCard balance={balance} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Payment History</h2>
            {balance.outstanding > 0 && (
              <Button size="sm" onClick={() => setPaymentFormOpen(true)}>
                Record Payment
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <PaymentHistoryTable
            data={paymentsResponse?.data ?? []}
            isLoading={isLoadingPayments}
            isFetching={isFetchingPayments}
            pagination={paymentsResponse ? {
              ...paymentsResponse.meta,
              onPageChange: setPaymentPage,
              onLimitChange: (newLimit) => { setPaymentLimit(newLimit); setPaymentPage(1); },
            } : undefined}
          />
        </CardContent>
      </Card>

      <RecordPaymentForm
        open={paymentFormOpen}
        onClose={() => {
          setPaymentFormOpen(false);
          setSelectedGrn(null);
        }}
        grnId={selectedGrn?.grnId || ''}
        supplierId={id}
        outstandingBalance={selectedGrn?.outstanding || balance.outstanding}
        grnNumber={selectedGrn?.grnNumber}
      />

      <div>
        <Link
          href="/suppliers"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          &larr; Back to Suppliers
        </Link>
      </div>
    </div>
  );
}
