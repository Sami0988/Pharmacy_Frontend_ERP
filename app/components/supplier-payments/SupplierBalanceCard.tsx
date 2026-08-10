'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import type { SupplierBalance } from '@/types/api';

interface SupplierBalanceCardProps {
  balance: SupplierBalance;
}

export function SupplierBalanceCard({ balance }: SupplierBalanceCardProps) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-foreground">Balance Summary</h2>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center">
            <dt className="text-sm text-muted-foreground">Total Owed</dt>
            <dd className="mt-1 text-2xl font-bold text-foreground">
              {balance.totalOwed.toLocaleString('en-US', {
                style: 'currency',
                currency: 'ETB',
              })}
            </dd>
          </div>
          <div className="text-center">
            <dt className="text-sm text-muted-foreground">Total Paid</dt>
            <dd className="mt-1 text-2xl font-bold text-green-600">
              {balance.totalPaid.toLocaleString('en-US', {
                style: 'currency',
                currency: 'ETB',
              })}
            </dd>
          </div>
          <div className="text-center">
            <dt className="text-sm text-muted-foreground">Outstanding</dt>
            <dd className="mt-1 text-2xl font-bold text-red-600">
              {balance.outstanding.toLocaleString('en-US', {
                style: 'currency',
                currency: 'ETB',
              })}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
