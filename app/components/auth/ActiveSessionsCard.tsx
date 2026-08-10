'use client';

import { useState } from 'react';
import { Monitor, Smartphone, Tablet, Laptop, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useGetSessionsQuery, useRevokeSessionMutation } from '@/store/api/auth-api-slice';
import { formatUserAgent, parseUserAgent } from '@/lib/user-agent';
import { toast } from 'sonner';

function getDeviceIcon(ua: string) {
  const { device } = parseUserAgent(ua);
  switch (device) {
    case 'mobile':
      return <Smartphone className="h-4 w-4" />;
    case 'tablet':
      return <Tablet className="h-4 w-4" />;
    case 'desktop':
      return <Monitor className="h-4 w-4" />;
    default:
      return <Laptop className="h-4 w-4" />;
  }
}

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
  const { data, isLoading } = useGetSessionsQuery();
  const [revokeSession, { isLoading: isRevoking }] = useRevokeSessionMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const sessions = data?.sessions ?? [];
  const otherSessions = sessions.filter((s) => !s.isCurrent);

  const handleRevokeClick = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setConfirmOpen(true);
  };

  const handleRevokeConfirm = async () => {
    if (!selectedSessionId) return;
    try {
      await revokeSession(selectedSessionId).unwrap();
      toast.success('Session revoked successfully');
    } catch {
      toast.error('Failed to revoke session');
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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Active Sessions</h2>
            </div>
            {otherSessions.length > 0 && (
              <Button variant="danger" size="sm" onClick={handleRevokeAll}>
                Revoke All Others
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
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No active sessions</p>
          ) : (
            <div className="divide-y">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-muted">
                      {getDeviceIcon(session.userAgent)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {formatUserAgent(session.userAgent)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        IP: {session.ipAddress} · Last active: {new Date(session.lastActiveAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {session.isCurrent ? (
                      <Badge variant="success">Current</Badge>
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
              ))}
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
        title="Revoke Session"
        description="This device will be logged out immediately. Are you sure?"
        confirmLabel="Revoke"
        variant="danger"
        isLoading={isRevoking}
      />
    </>
  );
}
