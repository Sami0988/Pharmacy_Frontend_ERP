'use client';

import Link from 'next/link';
import { Package, AlertTriangle, Clock, ShoppingCart, Check, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useGetNotificationsQuery, useMarkReadMutation } from '@/store/api/notifications-api-slice';
import type { Notification } from '@/types/api';

function expiryIconColor(thresholdDays?: Notification['thresholdDays']): string {
  switch (thresholdDays) {
    case 270:
      return 'text-blue-500';
    case 180:
      return 'text-yellow-500';
    case 90:
      return 'text-orange-500';
    case 60:
      return 'text-orange-600';
    case 30:
      return 'text-red-500';
    default:
      return 'text-amber-500';
  }
}

function typeIcon(n: Notification) {
  switch (n.type) {
    case 'zero_stock':
      return <Package className="h-4 w-4 text-red-500" />;
    case 'low_stock':
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case 'near_expiry':
      return <Clock className={`h-4 w-4 ${expiryIconColor(n.thresholdDays)}`} />;
    case 'expired':
      return <ShoppingCart className="h-4 w-4 text-red-500" />;
  }
}

function linkTarget(n: Notification): string {
  if (n.batchId && (n.type === 'near_expiry' || n.type === 'expired')) {
    return `/traceability/${n.batchId}`;
  }
  if (n.itemId) return `/inventory`;
  return '/notifications';
}

interface NotificationDropdownProps {
  onClose: () => void;
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const notifications = useGetNotificationsQuery({}).data?.data ?? [];
  const [markRead] = useMarkReadMutation();
  const recent = (notifications || []).slice(0, 8);

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-card rounded-lg shadow-lg border border-border z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
        <Link href="/notifications" onClick={onClose} className="text-xs text-primary hover:text-primary/80">
          View all
        </Link>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No notifications</p>
        ) : (
          recent.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 ${!n.isRead ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
            >
              <div className="mt-0.5 shrink-0">{typeIcon(n)}</div>
              <div className="flex-1 min-w-0">
                <Link
                  href={linkTarget(n)}
                  onClick={onClose}
                  className="text-sm text-foreground hover:text-primary line-clamp-2"
                >
                  {n.message?.replaceAll('Dispatcher', 'Dispenser')}
                </Link>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              {!n.isRead && (
                <button
                  type="button"
                  onClick={() => markRead(n.id)}
                  className="shrink-0 p-1 rounded hover:bg-secondary"
                  title="Mark as read"
                >
                  <Check className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
      <div className="px-4 py-2 border-t border-border">
        <Link href="/notifications" onClick={onClose}>
          <Button variant="ghost" size="sm" className="w-full">View all notifications</Button>
        </Link>
      </div>
    </div>
  );
}
