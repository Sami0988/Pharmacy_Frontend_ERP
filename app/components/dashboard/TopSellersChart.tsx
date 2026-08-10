'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface TopSellersChartProps {
  data: { itemName: string; revenue: number; quantity: number }[];
  isLoading?: boolean;
}

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

export function TopSellersChart({ data, isLoading }: TopSellersChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-secondary rounded w-32" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-6 bg-secondary rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-sm font-medium text-muted-foreground">Top Sellers (30 days)</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">No sales data yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-medium text-muted-foreground">Top Sellers (30 days)</h3>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16 }}>
            <XAxis type="number" tickFormatter={(v) => `ETB ${v}`} fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="itemName"
              width={120}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: string) => (v.length > 16 ? v.slice(0, 16) + '...' : v)}
            />
            <Tooltip
              formatter={(value) => [`ETB ${Number(value).toLocaleString()}`, 'Revenue']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
            />
            <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
