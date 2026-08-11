'use client';

import { Shield, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useGetLoginHistoryQuery } from '@/store/api/auth-api-slice';
import { useTranslations } from '@/lib/i18n';

function HistorySkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-5 w-20" />
        </div>
      ))}
    </div>
  );
}

export function LoginHistoryCard() {
  const { t } = useTranslations();
  const { data, isLoading } = useGetLoginHistoryQuery({ limit: 10, offset: 0 });
  const history = data?.data ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">{t('settings.loginHistory')}</h2>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <HistorySkeleton />
        ) : history.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">{t('settings.noLoginHistory')}</p>
        ) : (
          <div className="space-y-3">
            {history.map((entry) => (
              <div key={entry.id} className="flex items-center gap-4">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted">
                  {entry.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {t('settings.ipAddress')}: {entry.ipAddress ?? 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.userAgent?.substring(0, 50) ?? 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={entry.success ? 'success' : 'danger'}>
                    {entry.success ? t('settings.successful') : t('settings.failed')}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(entry.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
