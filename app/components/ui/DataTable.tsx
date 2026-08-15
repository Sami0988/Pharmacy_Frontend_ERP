'use client';

import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { PaginationControls, type PaginationMeta } from './PaginationControls';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  hideBelow?: 'sm' | 'md' | 'lg';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  isFetching?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  keyExtractor: (item: T) => string;
  pagination?: PaginationMeta & {
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
  };
}

function TableSkeleton({ columnCount }: { columnCount: number }) {
  return (
    <tbody className="divide-y divide-border">
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: columnCount }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 bg-muted rounded-lg animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

const hideBelowMap = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
};

export function DataTable<T>({
  columns,
  data,
  isLoading,
  isFetching,
  emptyMessage = 'No data available',
  onRowClick,
  keyExtractor,
  pagination,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted/30">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider',
                  col.hideBelow && hideBelowMap[col.hideBelow],
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        {isLoading ? (
          <TableSkeleton columnCount={columns.length} />
        ) : data.length === 0 ? (
          <tbody>
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-sm text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody className={cn('divide-y divide-border bg-card', isFetching && 'opacity-60 pointer-events-none')}>
            {data.map((item, index) => (
              <motion.tr
                key={keyExtractor(item)}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02, duration: 0.2 }}
                className={cn(
                  'hover:bg-muted/50 transition-colors duration-150',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-3 text-sm text-foreground',
                      col.hideBelow && hideBelowMap[col.hideBelow],
                      col.className
                    )}
                  >
                    {col.render
                      ? col.render(item)
                      : String((item as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        )}
      </table>
      {pagination && (
        <div className="border-t border-border">
          <PaginationControls
            meta={pagination}
            onPageChange={pagination.onPageChange}
            onLimitChange={pagination.onLimitChange}
          />
        </div>
      )}
    </div>
  );
}
