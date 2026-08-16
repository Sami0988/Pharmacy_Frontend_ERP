'use client';

import Link from 'next/link';
import { CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable, Column } from '@/components/ui/DataTable';
import { useMarkReadMutation, useMarkAllReadMutation } from '@/store/api/notifications-api-slice';
import { useTranslations } from '@/lib/i18n';
import type { Notification } from '@/types/api';
import type { PaginationMeta } from '@/components/ui/PaginationControls';

function thresholdBadgeColor(thresholdDays?: Notification['thresholdDays']): string {
  switch (thresholdDays) {
    case 270: return 'bg-blue-100 text-blue-800';
    case 180: return 'bg-yellow-100 text-yellow-800';
    case 90: return 'bg-orange-100 text-orange-800';
    case 60: return 'bg-orange-100 text-orange-800';
    case 30: return 'bg-red-100 text-red-800';
    default: return 'bg-amber-100 text-amber-800';
  }
}

function linkTarget(n: Notification): string {
  if (n.batchId && (n.type === 'near_expiry' || n.type === 'expired')) {
    return `/traceability/${n.batchId}`;
  }
  if (n.itemId) return `/inventory`;
  return '#';
}

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
  const { t } = useTranslations();

  const data = (notifications || []).map((n) => ({
    ...n,
    onMarkRead: (id: string) => markRead(id),
  }));

  function thresholdLabel(thresholdDays?: Notification['thresholdDays']): string {
    switch (thresholdDays) {
      case 30: return t('notifications.threshold30');
      case 60: return t('notifications.threshold60');
      case 90: return t('notifications.threshold90');
      case 180: return t('notifications.threshold180');
      case 270: return t('notifications.threshold270');
      default: return t('notifications.nearExpiry');
    }
  }

  function typeBadge(n: Notification) {
    switch (n.type) {
      case 'zero_stock':
        return <Badge variant="danger">{t('notifications.zeroStock')}</Badge>;
      case 'low_stock':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800">{t('notifications.lowStock')}</Badge>;
      case 'near_expiry':
        return (
          <Badge variant="secondary" className={thresholdBadgeColor(n.thresholdDays)}>
            {thresholdLabel(n.thresholdDays)}
          </Badge>
        );
      case 'expired':
        return <Badge variant="danger">{t('notifications.expired')}</Badge>;
      case 'payment_due':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">{t('notifications.paymentDue')}</Badge>;
      case 'payment_overdue':
        return <Badge variant="danger">{t('notifications.paymentOverdue')}</Badge>;
      default:
        return <Badge variant="secondary">{n.type}</Badge>;
    }
  }

  const columns: Column<Notification & { onMarkRead: (id: string) => void }>[] = [
    {
      key: 'type',
      header: t('notifications.type'),
      render: (n) => typeBadge(n),
    },
    {
      key: 'message',
      header: t('notifications.message'),
      render: (n) => (
        <Link href={linkTarget(n)} className="text-sm text-foreground hover:text-primary line-clamp-2">
          {n.message?.replaceAll('Dispatcher', 'Dispenser')}
        </Link>
      ),
    },
    {
      key: 'createdAt',
      header: t('notifications.time'),
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
            {t('notifications.markRead')}
          </button>
        ) : (
          <span className="text-xs text-muted-foreground">{t('notifications.read')}</span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {data.length === 1
            ? t('notifications.notificationCount', { count: data.length })
            : t('notifications.notificationCount', { count: data.length })}
        </p>
        <Button variant="ghost" size="sm" onClick={() => markAllRead()}>
          <CheckCheck className="h-4 w-4 mr-1" />
          {t('notifications.markAllRead')}
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={data}
        keyExtractor={(n) => n.id}
        emptyMessage={t('notifications.noNotificationsMatch')}
        isLoading={isLoading}
        isFetching={isFetching}
        pagination={pagination}
      />
    </div>
  );
}
