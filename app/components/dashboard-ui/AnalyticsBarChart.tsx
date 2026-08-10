'use client';

import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AnalyticsBarChartProps {
  data: { label: string; value: number }[];
  colors?: string[];
  formatValue?: (v: number) => string;
  isLoading?: boolean;
  className?: string;
}

const DEFAULT_COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#6366f1',
  '#14b8a6',
  '#f97316',
  '#84cc16',
  '#a855f7',
];

export function AnalyticsBarChart({
  data,
  colors = DEFAULT_COLORS,
  formatValue = (v) => `ETB ${v.toLocaleString()}`,
  isLoading,
  className,
}: AnalyticsBarChartProps) {
  if (isLoading) {
    return (
      <div className={cn('rounded-2xl p-6 bg-card border border-border shadow-sm', className)}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-secondary rounded w-32" />
          <div className="h-64 bg-secondary rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <XAxis
          dataKey="label"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#9ca3af' }}
        />
        <YAxis
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`}
          tick={{ fill: '#9ca3af' }}
        />
        <Tooltip
          formatter={(value) => [formatValue(Number(value)), '']}
          contentStyle={{
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            fontSize: '13px',
          }}
          cursor={{ fill: 'rgba(156,163,175,0.08)' }}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40}>
          {data.map((_, index) => (
            <Cell key={index} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
