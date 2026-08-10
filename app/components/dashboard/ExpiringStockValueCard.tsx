'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

interface ExpiringStockValueCardProps {
  within30Days: number;
  within60Days: number;
  within90Days: number;
  isLoading?: boolean;
}

export function ExpiringStockValueCard({ within30Days, within60Days, within90Days, isLoading }: ExpiringStockValueCardProps) {
  if (isLoading) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-32" />
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10">
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">Expiring Stock Value</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5">
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400" />
            <span className="text-sm font-medium text-red-800 dark:text-red-300">Within 30 days</span>
          </div>
          <span className="text-sm font-bold text-red-700 dark:text-red-400">
            {within30Days.toLocaleString('en-US', { style: 'currency', currency: 'ETB' })}
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-center justify-between rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-4 py-3"
        >
          <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Within 60 days</span>
          <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
            {within60Days.toLocaleString('en-US', { style: 'currency', currency: 'ETB' })}
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between rounded-xl bg-muted/50 border border-border px-4 py-3"
        >
          <span className="text-sm font-medium text-muted-foreground">Within 90 days</span>
          <span className="text-sm font-bold text-foreground">
            {within90Days.toLocaleString('en-US', { style: 'currency', currency: 'ETB' })}
          </span>
        </motion.div>
      </CardContent>
    </Card>
  );
}
