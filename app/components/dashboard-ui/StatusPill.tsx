'use client';

import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

type Status = 'in_stock' | 'low_stock' | 'out_of_stock' | 'pending' | 'delivered' | 'completed' | 'active';

interface StatusPillProps {
  status: Status;
  className?: string;
}

const statusStyles: Record<Status, string> = {
  in_stock: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  delivered: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  low_stock: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  out_of_stock: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400',
};

const statusLabels: Record<Status, string> = {
  in_stock: 'In Stock',
  low_stock: 'Low Stock',
  out_of_stock: 'Out of Stock',
  pending: 'Pending',
  delivered: 'Delivered',
  completed: 'Completed',
  active: 'Active',
};

export function StatusPill({ status, className }: StatusPillProps) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full',
        statusStyles[status],
        className
      )}
    >
      <span className={cn(
        'w-1.5 h-1.5 rounded-full mr-1.5',
        status === 'in_stock' || status === 'delivered' || status === 'completed' || status === 'active'
          ? 'bg-emerald-500 dark:bg-emerald-400'
          : status === 'low_stock' || status === 'pending'
            ? 'bg-amber-500 dark:bg-amber-400'
            : 'bg-red-500 dark:bg-red-400'
      )} />
      {statusLabels[status]}
    </motion.span>
  );
}
