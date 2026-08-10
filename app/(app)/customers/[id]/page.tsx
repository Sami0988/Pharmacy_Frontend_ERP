'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useGetCustomerQuery, useGetCustomerHistoryQuery } from '@/store/api/customers-api-slice';
import { CustomerPurchaseHistory } from '@/components/customers/CustomerPurchaseHistory';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: customer, isLoading: isLoadingCustomer } = useGetCustomerQuery(id);
  const { data: history, isLoading: isLoadingHistory } = useGetCustomerHistoryQuery(id);

  if (isLoadingCustomer) {
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

  if (!customer) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">Customer not found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{customer.name}</h1>
          <p className="text-sm text-muted-foreground">
            {customer.phone && `${customer.phone} · `}
            {customer.email || 'No email'}
          </p>
        </div>
        <Link href={`/customers/${id}/edit`}>
          <Button variant="secondary">Edit Customer</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Credit Balance</p>
            <p className="text-xl font-bold text-red-600">
              {customer.creditBalance.toLocaleString('en-US', {
                style: 'currency',
                currency: 'ETB',
              })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="text-sm font-medium text-foreground">{customer.phone || '-'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Address</p>
            <p className="text-sm font-medium text-foreground">{customer.address || '-'}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-foreground">Purchase History</h2>
        </CardHeader>
        <CardContent>
          <CustomerPurchaseHistory data={history || []} isLoading={isLoadingHistory} />
        </CardContent>
      </Card>

      <div>
        <Link
          href="/customers"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          &larr; Back to Customers
        </Link>
      </div>
    </div>
  );
}
