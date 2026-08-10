'use client';

import { useState } from 'react';
import { History, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { useGetLoginHistoryQuery } from '@/store/api/auth-api-slice';
import { formatUserAgent } from '@/lib/user-agent';
import type { LoginHistoryEntry } from '@/types/api';

export function LoginHistoryCard() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const offset = (page - 1) * limit;

  const { data, isLoading, isFetching } = useGetLoginHistoryQuery({ limit, offset });

  const columns: Column<LoginHistoryEntry>[] = [
    {
      key: 'success',
      header: 'Status',
      render: (item) => (
        item.success ? (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Success
          </Badge>
        ) : (
          <Badge variant="danger" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        )
      ),
    },
    {
      key: 'userAgent',
      header: 'Device',
      render: (item) => (
        <span className="text-sm">{formatUserAgent(item.userAgent)}</span>
      ),
    },
    {
      key: 'ipAddress',
      header: 'IP Address',
      render: (item) => (
        <span className="font-mono text-sm">{item.ipAddress}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date & Time',
      render: (item) => (
        <span className="text-sm">{new Date(item.createdAt).toLocaleString()}</span>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Login History</h2>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          isFetching={isFetching}
          keyExtractor={(item) => item.id}
          emptyMessage="No login history available"
          pagination={data?.meta ? {
            ...data.meta,
            onPageChange: setPage,
            onLimitChange: (newLimit) => {
              setLimit(newLimit);
              setPage(1);
            },
          } : undefined}
        />
      </CardContent>
    </Card>
  );
}
