'use client';

import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  name: string;
  count: number;
  icon: LucideIcon;
  color: string;
  isLoading?: boolean;
  className?: string;
}

const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
   cyan: { bg: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-100 dark:border-cyan-800/30', text: 'text-cyan-700 dark:text-cyan-300', iconBg: 'bg-cyan-100 dark:bg-cyan-800/40' },
  green: { bg: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/30', text: 'text-green-700 dark:text-green-300', iconBg: 'bg-green-100 dark:bg-green-800/40' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800/30', text: 'text-purple-700 dark:text-purple-300', iconBg: 'bg-purple-100 dark:bg-purple-800/40' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/30', text: 'text-amber-700 dark:text-amber-300', iconBg: 'bg-amber-100 dark:bg-amber-800/40' },
  red: { bg: 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/30', text: 'text-red-700 dark:text-red-300', iconBg: 'bg-red-100 dark:bg-red-800/40' },
  cyan: { bg: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-100 dark:border-cyan-800/30', text: 'text-cyan-700 dark:text-cyan-300', iconBg: 'bg-cyan-100 dark:bg-cyan-800/40' },
  pink: { bg: 'bg-pink-50 dark:bg-pink-900/20 border-pink-100 dark:border-pink-800/30', text: 'text-pink-700 dark:text-pink-300', iconBg: 'bg-pink-100 dark:bg-pink-800/40' },
  gray: { bg: 'bg-background border-border', text: 'text-secondary-foreground', iconBg: 'bg-secondary' },
};

export function CategoryCard({ name, count, icon: Icon, color, isLoading, className }: CategoryCardProps) {
  const styles = colorMap[color] || colorMap.blue;

  if (isLoading) {
    return (
      <div className={cn('rounded-2xl p-5 shadow-sm border bg-card', className)}>
        <div className="animate-pulse space-y-2">
          <div className="h-10 w-10 rounded-full bg-secondary" />
          <div className="h-4 rounded w-20 bg-secondary" />
          <div className="h-6 rounded w-12 bg-secondary" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-2xl p-5 shadow-sm border transition-all hover:shadow-md cursor-default',
        styles.bg,
        className
      )}
    >
      <div className={cn('rounded-full p-2.5 w-10 h-10 flex items-center justify-center mb-3', styles.iconBg)}>
        <Icon className={cn('h-5 w-5', styles.text)} />
      </div>
      <p className="text-sm font-medium text-muted-foreground">{name}</p>
      <p className={cn('text-2xl font-bold mt-1', styles.text)}>{count}</p>
    </div>
  );
}
