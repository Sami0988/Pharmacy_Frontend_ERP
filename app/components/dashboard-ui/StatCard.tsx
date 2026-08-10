'use client';

import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { TrendBadge } from './TrendBadge';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  variant?: 'hero' | 'plain';
  subtitle?: string;
  isLoading?: boolean;
  className?: string;
  index?: number;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  variant = 'plain',
  subtitle,
  isLoading,
  className,
  index = 0,
}: StatCardProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          'rounded-2xl p-6',
          variant === 'hero'
            ? 'bg-gradient-to-br from-primary to-primary/80'
            : 'bg-card border border-border',
          className
        )}
      >
        <div className="animate-pulse space-y-3">
          <div className={cn('h-10 w-10 rounded-full', variant === 'hero' ? 'bg-white/20' : 'bg-muted')} />
          <div className={cn('h-4 rounded w-24', variant === 'hero' ? 'bg-white/20' : 'bg-muted')} />
          <div className={cn('h-8 rounded w-32', variant === 'hero' ? 'bg-white/20' : 'bg-muted')} />
        </div>
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        className={cn(
          'rounded-2xl p-6 bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground shadow-soft relative overflow-hidden',
          className
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.12),transparent_60%)]" />
        <div className="relative flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-primary-foreground/70">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {subtitle && <p className="text-sm text-primary-foreground/70">{subtitle}</p>}
          </div>
          <motion.div
            whileHover={{ rotate: 8, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="rounded-xl bg-white/15 p-2.5 backdrop-blur-sm"
          >
            <Icon className="h-5 w-5" />
          </motion.div>
        </div>
        {trend !== undefined && (
          <div className="mt-3">
            <span className="inline-flex items-center gap-1 text-xs font-medium rounded-full px-2.5 py-0.5 bg-white/15 backdrop-blur-sm">
              {trend > 0 ? '+' : ''}{trend}%
              <span className="text-[10px] opacity-70 ml-0.5">{trendLabel || 'vs last week'}</span>
            </span>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn(
        'rounded-2xl p-6 bg-card border border-border shadow-soft relative overflow-hidden group',
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <motion.div
          whileHover={{ rotate: 8, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="rounded-xl bg-primary/10 p-2.5"
        >
          <Icon className="h-5 w-5 text-primary" />
        </motion.div>
      </div>
      {trend !== undefined && (
        <div className="mt-3">
          <TrendBadge value={trend} label={trendLabel} />
        </div>
      )}
    </motion.div>
  );
}
