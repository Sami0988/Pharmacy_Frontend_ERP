'use client';

import { useState } from 'react';
import { Monitor, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useGetSessionsQuery, useRevokeSessionMutation } from '@/store/api/auth-api-slice';
import { useTranslations } from '@/lib/i18n';
import { toast } from 'sonner';

function SessionSkeleton() {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  );
}

export function ActiveSessionsCard() {
  const { t } = useTranslations();
  const { data: sessions, isLoading } = useGetSessionsQuery();
  const [revokeSession, { isLoading: isRevoking }] = useRevokeSessionMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const sessionList = sessions ?? [];
  const now = new Date();
  const currentSession = sessionList.find((s) => new Date(s.expiresAt) > now);
  const otherSessions = sessionList.filter((s) => s.id !== currentSession?.id);

  const handleRevokeClick = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setConfirmOpen(true);
  };

  const handleRevokeConfirm = async () => {
    if (!selectedSessionId) return;
    try {
      await revokeSession(selectedSessionId).unwrap();
      toast.success(t('settings.revokeSessionSuccess'));
    } catch {
      toast.error(t('settings.revokeSessionFailed'));
    } finally {
      setConfirmOpen(false);
      setSelectedSessionId(null);
    }
  };

  const handleRevokeAll = () => {
    if (otherSessions.length > 0) {
      setSelectedSessionId(otherSessions[0].id);
      setConfirmOpen(true);
    }
  };

  function formatSessionDate(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays}d ago`;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">{t('settings.activeSessions')}</h2>
            </div>
            {otherSessions.length > 0 && (
              <Button variant="danger" size="sm" onClick={handleRevokeAll}>
                {t('settings.revokeAllOthers')}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="divide-y">
              <SessionSkeleton />
              <SessionSkeleton />
            </div>
          ) : sessionList.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">{t('settings.noSessions')}</p>
          ) : (
            <div className="divide-y">
              {sessionList.map((session) => {
                const isCurrent = currentSession?.id === session.id;
                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-muted">
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Session {session.id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t('settings.created')}: {new Date(session.createdAt).toLocaleString()} · {t('settings.expires')}: {new Date(session.expiresAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCurrent ? (
                        <Badge variant="success">{t('settings.currentSession')}</Badge>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeClick(session.id)}
                          disabled={isRevoking}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onConfirm={handleRevokeConfirm}
        onCancel={() => {
          setConfirmOpen(false);
          setSelectedSessionId(null);
        }}
        title={t('settings.revokeSession')}
        description={t('settings.revokeSessionConfirm')}
        confirmLabel={t('settings.revoke')}
        variant="danger"
        isLoading={isRevoking}
      />
    </>
  );
}
