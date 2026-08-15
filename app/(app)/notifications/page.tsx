'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { motion } from 'motion/react';
import { useGetNotificationsQuery } from '@/store/api/notifications-api-slice';
import { NotificationsTable } from '@/components/notifications/NotificationsTable';
import { useTranslations } from '@/lib/i18n';

export default function NotificationsPage() {
  const { t } = useTranslations();
  const [activeTab, setActiveTab] = useState('all');
  const [filterRead, setFilterRead] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const tabs = [
    { key: 'all', label: t('notifications.all') },
    { key: 'zero_stock', label: t('notifications.zeroStock') },
    { key: 'low_stock', label: t('notifications.lowStock') },
    { key: 'near_expiry', label: t('notifications.nearExpiry') },
    { key: 'expired', label: t('notifications.expired') },
    { key: 'payment_due', label: t('notifications.paymentDue') },
    { key: 'payment_overdue', label: t('notifications.paymentOverdue') },
  ];

  const params: { type?: string; isRead?: boolean; page: number; limit: number } = { page, limit };
  if (activeTab && activeTab !== 'all') params.type = activeTab;
  if (filterRead !== undefined) params.isRead = filterRead;

  const { data: response, isLoading, isFetching } = useGetNotificationsQuery(params);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3"
      >
        <Bell className="h-6 w-6 text-foreground" />
        <h1 className="text-2xl font-bold text-foreground">{t('notifications.title')}</h1>
      </motion.div>

      {/* Tabs + read filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex gap-1 bg-secondary rounded-lg p-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-secondary-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <select
          value={filterRead === undefined ? '' : String(filterRead)}
          onChange={(e) => {
            const v = e.target.value;
            setFilterRead(v === '' ? undefined : v === 'true');
          }}
          className="h-9 rounded-md border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">{t('notifications.allReadStates')}</option>
          <option value="false">{t('notifications.unreadOnly')}</option>
          <option value="true">{t('notifications.readOnly')}</option>
        </select>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <NotificationsTable
          data={response?.data ?? []}
          isLoading={isLoading}
          isFetching={isFetching}
          pagination={response ? {
            ...response.meta,
            onPageChange: setPage,
            onLimitChange: (newLimit: number) => { setLimit(newLimit); setPage(1); },
          } : undefined}
        />
      </motion.div>
    </div>
  );
}
