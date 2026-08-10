'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { DollarSign, ShoppingCart } from 'lucide-react';

interface TodaySalesCardProps {
  totalAmount: number;
  transactionCount: number;
  isLoading?: boolean;
}

export function TodaySalesCard({ totalAmount, transactionCount, isLoading }: TodaySalesCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-secondary rounded w-24" />
            <div className="h-8 bg-secondary rounded w-32" />
            <div className="h-3 bg-secondary rounded w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/30">
            <DollarSign className="h-4 w-4 text-cyan-600" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">Today&apos;s Sales</h3>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-foreground">
          {totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'ETB' })}
        </p>
        <div className="flex items-center gap-1 mt-1">
          <ShoppingCart className="h-3 w-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{transactionCount} transaction{transactionCount !== 1 ? 's' : ''}</p>
        </div>
      </CardContent>
    </Card>
  );
}
