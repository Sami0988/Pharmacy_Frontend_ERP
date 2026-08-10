'use client';

import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';

interface TrendBadgeProps {
  value: number;
  label?: string;
  className?: string;
}

export function TrendBadge({ value, label = 'vs last week', className }: TrendBadgeProps) {
  const isPositive = value > 0;
  const isNeutral = value === 0;

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.2 }}
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium rounded-full px-2.5 py-0.5',
        isNeutral
          ? 'bg-muted text-muted-foreground'
          : isPositive
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
            : 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400',
        className
      )}
    >
      {!isNeutral && (
        isPositive
          ? <TrendingUp className="h-3 w-3" />
          : <TrendingDown className="h-3 w-3" />
      )}
      {isPositive ? '+' : ''}{value}%
      <span className="text-[10px] opacity-70 ml-0.5">{label}</span>
    </motion.span>
  );
}
