'use client';

import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface SparklinePoint {
  date: string;
  value: number;
}

interface StatCardWithSparklineProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  sparklineData: SparklinePoint[];
  sparklineLabel: string;
  subtitle?: string;
  isLoading?: boolean;
  className?: string;
  index?: number;
}

export function StatCardWithSparkline({
  title,
  value,
  icon: Icon,
  sparklineData,
  sparklineLabel,
  subtitle,
  isLoading,
  className,
  index = 0,
}: StatCardWithSparklineProps) {
  if (isLoading) {
    return (
      <div className={cn('rounded-2xl border border-border bg-card p-6 shadow-soft', className)}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-10 w-32 rounded bg-muted" />
          <div className="h-20 rounded bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-3xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5',
        className,
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 h-20 min-h-[80px]">
        {sparklineData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData} margin={{ left: 0, right: 0, top: 4, bottom: 4 }}>
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip
                cursor={false}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid rgba(148,163,184,0.2)',
                  background: 'var(--card)',
                  boxShadow: '0 10px 30px rgba(15,23,42,0.08)',
                  fontSize: 13,
                }}
                formatter={(value) => [`${Number(value ?? 0).toLocaleString()}`, sparklineLabel]}
              />
              <Line type="monotone" dataKey="value" stroke="#0891b2" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-2xl bg-muted/60 text-xs text-muted-foreground">
            No trend data
          </div>
        )}
      </div>
    </div>
  );
}
