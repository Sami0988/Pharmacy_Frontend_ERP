'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { TrendingUp } from 'lucide-react';

interface ProfitEstimateCardProps {
  estimatedProfit: number;
  margin: number;
  isLoading?: boolean;
}

export function ProfitEstimateCard({ estimatedProfit, margin, isLoading }: ProfitEstimateCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-secondary rounded w-28" />
            <div className="h-8 bg-secondary rounded w-28" />
            <div className="h-3 bg-secondary rounded w-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/30">
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">Est. Profit Today</h3>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-foreground">
          {estimatedProfit.toLocaleString('en-US', { style: 'currency', currency: 'ETB' })}
        </p>
        <p className="text-sm text-muted-foreground mt-1">{margin.toFixed(1)}% margin</p>
      </CardContent>
    </Card>
  );
}
