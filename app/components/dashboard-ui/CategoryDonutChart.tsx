'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#6366f1', '#0ea5e9', '#22c55e', '#f59e0b', '#f97316', '#ec4899'];

interface CategoryDonutChartItem {
  category: string;
  count: number;
}

interface CategoryDonutChartProps {
  data: CategoryDonutChartItem[];
  isLoading?: boolean;
}

export function CategoryDonutChart({ data, isLoading }: CategoryDonutChartProps) {
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="rounded-3xl shadow-soft">
      <CardHeader className="border-b border-border">
        <CardTitle>Inventory Distribution</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div className="min-h-[320px]">
          {isLoading ? (
            <div className="flex h-full items-center justify-center rounded-3xl bg-muted p-8">Loading chart…</div>
          ) : data.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-3xl bg-muted p-8 text-sm text-muted-foreground">
              No category data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Tooltip
                  formatter={(value) => [`${Number(value ?? 0).toLocaleString()}`, 'Units']}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid rgba(148,163,184,0.2)',
                    boxShadow: '0 10px 30px rgba(15,23,42,0.08)',
                    fontSize: 13,
                  }}
                />
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="category"
                  innerRadius="62%"
                  outerRadius="84%"
                  paddingAngle={2}
                >
                  {data.map((item, index) => (
                    <Cell key={item.category} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="space-y-3 rounded-3xl border border-border bg-card p-4">
          {data.map((item, index) => {
            const percent = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
            return (
              <div key={item.category} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.category}</p>
                    <p className="text-xs text-muted-foreground">{percent}% of stock</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-foreground">{item.count.toLocaleString()}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
