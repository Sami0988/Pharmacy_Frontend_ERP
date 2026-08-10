'use client';

import { useEffect } from 'react';
import { AlertTriangle, User, Phone, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useLazyGetRecallImpactQuery } from '@/store/api/traceability-api-slice';
import type { RecallRecipient } from '@/types/api';

function RecipientRow({ recipient }: { recipient: RecallRecipient }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b last:border-0 gap-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground shrink-0" />
          <p className="text-sm font-medium text-foreground truncate">
            {recipient.customerName || 'Walk-in customer'}
          </p>
        </div>
        {recipient.customerPhone && (
          <div className="flex items-center gap-2 mt-1 ml-6">
            <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground">{recipient.customerPhone}</p>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4 ml-6 sm:ml-0">
        <div className="text-right">
          <p className="text-xs text-muted-foreground">{recipient.saleNumber}</p>
          <p className="text-xs text-muted-foreground">{new Date(recipient.saleDate).toLocaleDateString()}</p>
        </div>
        <Badge variant="secondary" className="shrink-0">
          <ShoppingCart className="h-3 w-3 mr-1" />
          {recipient.quantityReceived}
        </Badge>
      </div>
    </div>
  );
}

interface RecallImpactViewProps {
  batchId: string;
  batchNumber: string;
}

export function RecallImpactView({ batchId, batchNumber }: RecallImpactViewProps) {
  const [trigger, { data, isLoading, error }] = useLazyGetRecallImpactQuery();

  useEffect(() => {
    trigger(batchId);
  }, [batchId, trigger]);

  if (isLoading) {
    return (
      <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/20">
        <CardContent className="p-6 text-center text-sm text-amber-700 dark:text-amber-300">Loading recall impact...</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20">
        <CardContent className="p-6 text-center text-sm text-red-700 dark:text-red-300">Failed to load recall impact data.</CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const stock = data.currentStock ?? { store: 0, dispatcher: 0 };
  const recipients = data.salesRecipients ?? [];
  const totalInBuilding = stock.store + stock.dispatcher;
  const totalDistributed = recipients.reduce((sum, r) => sum + r.quantityReceived, 0);

  return (
    <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-900/20 print:border-0 print:bg-white">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <h3 className="text-base font-bold text-amber-900 dark:text-amber-100">Recall Impact Assessment</h3>
        </div>
        <p className="text-xs text-amber-700 dark:text-amber-300">
          Batch <span className="font-mono font-semibold">{batchNumber}</span> — if recalled today
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-card border border-amber-200 dark:border-amber-800 px-4 py-3 text-center">
            <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{totalInBuilding}</p>
            <p className="text-xs font-medium text-amber-600 dark:text-amber-300">Still in building</p>
            <p className="text-xs text-amber-500 dark:text-amber-400">Store: {stock.store} · Dispatcher: {stock.dispatcher}</p>
          </div>
          <div className="rounded-lg bg-card border border-amber-200 dark:border-amber-800 px-4 py-3 text-center">
            <p className="text-2xl font-bold text-red-700 dark:text-red-400">{totalDistributed}</p>
            <p className="text-xs font-medium text-amber-600 dark:text-amber-300">Distributed to customers</p>
            <p className="text-xs text-amber-500 dark:text-amber-400">{recipients.length} recipient(s)</p>
          </div>
        </div>

        {/* Recipient list */}
        {recipients.length > 0 ? (
          <div>
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 uppercase tracking-wide mb-2">Recipients to contact</p>
            <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-card divide-y">
              {recipients.map((recipient, idx) => (
                <RecipientRow key={idx} recipient={recipient} />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-amber-700 dark:text-amber-300 text-center py-2">No units have been sold to customers yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

