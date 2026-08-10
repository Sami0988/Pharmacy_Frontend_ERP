'use client';

import Link from 'next/link';
import { CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable, Column } from '@/components/ui/DataTable';
import { useMarkReadMutation, useMarkAllReadMutation } from '@/store/api/notifications-api-slice';
import type { Notification } from '@/types/api';
import type { PaginationMeta } from '@/components/ui/PaginationControls';

function typeBadge(type: Notification['type']) {
  switch (type) {
    case 'zero_stock':
      return <Badge variant="danger">Zero Stock</Badge>;
    case 'low_stock':
      return <Badge variant="secondary" className="bg-amber-100 text-amber-800">Low Stock</Badge>;
    case 'near_expiry':
      return <Badge variant="secondary" className="bg-amber-100 text-amber-800">Near Expiry</Badge>;
    case 'expired':
      return <Badge variant="danger">Expired</Badge>;
  }
}

function linkTarget(n: Notification): string {
  if (n.batchId && (n.type === 'near_expiry' || n.type === 'expired')) {
    return `/traceability/${n.batchId}`;
  }
  if (n.itemId) return `/inventory`;
  return '#';
}

const columns: Column<Notification & { onMarkRead: (id: string) => void }>[] = [
  {
    key: 'type',
    header: 'Type',
    render: (n) => typeBadge(n.type),
  },
  {
    key: 'message',
    header: 'Message',
    render: (n) => (
      <Link href={linkTarget(n)} className="text-sm text-foreground hover:text-primary line-clamp-2">
        {n.message}
      </Link>
    ),
  },
  {
    key: 'createdAt',
    header: 'Time',
    render: (n) => <span className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</span>,
  },
  {
    key: 'id',
    header: '',
    render: (n) =>
      !n.isRead ? (
        <button
          type="button"
          onClick={() => n.onMarkRead(n.id)}
          className="text-xs text-primary hover:text-primary/80"
        >
          Mark read
        </button>
      ) : (
        <span className="text-xs text-muted-foreground">Read</span>
      ),
  },
];

interface NotificationsTableProps {
  data: Notification[];
  isLoading: boolean;
  isFetching: boolean;
  pagination?: PaginationMeta & {
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
  };
}

export function NotificationsTable({ data: notifications, isLoading, isFetching, pagination }: NotificationsTableProps) {
  const [markRead] = useMarkReadMutation();
  const [markAllRead] = useMarkAllReadMutation();

  const data = (notifications || []).map((n) => ({
    ...n,
    onMarkRead: (id: string) => markRead(id),
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {data.length} notification{data.length !== 1 ? 's' : ''}
        </p>
        <Button variant="ghost" size="sm" onClick={() => markAllRead()}>
          <CheckCheck className="h-4 w-4 mr-1" />
          Mark all read
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={data}
        keyExtractor={(n) => n.id}
        emptyMessage="No notifications match your filters"
        isLoading={isLoading}
        isFetching={isFetching}
        pagination={pagination}
      />
    </div>
  );
}
