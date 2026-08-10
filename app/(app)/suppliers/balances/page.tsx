'use client';

import Link from 'next/link';
import { useGetAllSupplierBalancesQuery } from '@/store/api/supplier-payments-api-slice';
import { SuppliersBalanceTable } from '@/components/supplier-payments/SuppliersBalanceTable';
import { Card, CardContent } from '@/components/ui/Card';

export default function SupplierBalancesPage() {
  const { data: balances, isLoading } = useGetAllSupplierBalancesQuery();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Supplier Balances</h1>
        <p className="text-sm text-muted-foreground">Suppliers with outstanding balances</p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <SuppliersBalanceTable data={balances || []} />
      )}

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
