'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable, Column } from '@/components/ui/DataTable';
import { SaleReturnForm } from './SaleReturnForm';
import { downloadReceiptPdf } from '@/lib/pdf';
import { printReceipt } from '@/lib/print-receipt';
import type { SaleDetail as SaleDetailType, SaleItem } from '@/types/api';

interface SaleDetailProps {
  sale: SaleDetailType;
}

const columns: Column<SaleItem & { returnable?: number }>[] = [
  { key: 'itemName', header: 'Item' },
  { key: 'batchNumber', header: 'Batch' },
  { key: 'quantity', header: 'Qty' },
  {
    key: 'unitPrice',
    header: 'Unit Price',
    render: (i) =>
      (i.unitPrice ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'ETB' }),
  },
  {
    key: 'subtotal',
    header: 'Subtotal',
    render: (i) =>
      (i.subtotal ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'ETB' }),
  },
  {
    key: 'returnable',
    header: 'Returnable',
    render: (i) => {
      const returnable = i.quantity - i.returnedQuantity;
      return returnable > 0 ? (
        <span className="text-green-600">{returnable}</span>
      ) : (
        <span className="text-muted-foreground">0</span>
      );
    },
  },
];

export function SaleDetail({ sale }: SaleDetailProps) {
  const [returningItemId, setReturningItemId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadReceipt = async () => {
    setIsDownloading(true);
    try {
      await downloadReceiptPdf({
        storeName: 'Hawi Pharmacy',
        saleDate: new Date(sale.saleDate).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        receiptNumber: sale.saleNumber,
        cashierName: sale.soldByName,
        paymentMethod: sale.paymentMethod,
        items: sale.items.map((item) => ({
          itemName: item.itemName,
          batchNo: item.batchNumber,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          lineTotal: Number(item.subtotal),
        })),
        totalAmount: Number(sale.totalAmount),
        customerName: sale.customerName ?? undefined,
      });
      toast.success('Receipt downloaded successfully');
    } catch {
      toast.error('Failed to download receipt');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrintReceipt = () => {
    const saleDate = new Date(sale.saleDate || sale.createdAt);
    const validDate = isNaN(saleDate.getTime()) ? new Date() : saleDate;
    printReceipt({
      storeName: 'Hawi Pharmacy',
      saleDate: validDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      receiptNumber: sale.saleNumber || sale.id.slice(0, 8).toUpperCase(),
      cashierName: sale.soldByName,
      paymentMethod: sale.paymentMethod,
      items: sale.items.map((item) => {
        const unitPrice = Number(item.unitPrice) || 0;
        const quantity = Number(item.quantity) || 0;
        const lineTotal = Number(item.subtotal) || (unitPrice * quantity);
        return {
          itemName: item.itemName,
          batchNo: item.batchNumber,
          quantity,
          unitPrice,
          lineTotal,
        };
      }),
      totalAmount: Number(sale.totalAmount) || 0,
      customerName: sale.customerName ?? undefined,
    });
  };

  const dataWithReturnable = sale.items.map((item) => ({
    ...item,
    returnable: item.quantity - item.returnedQuantity,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{sale.saleNumber}</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(sale.saleDate || sale.createdAt).toLocaleString()} · Sold by {sale.soldByName}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handlePrintReceipt}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Receipt
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadReceipt}
            disabled={isDownloading}
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? 'Downloading...' : 'Download PDF'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-xl font-bold text-foreground">
              {(sale.totalAmount ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'ETB' })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Payment</p>
            <Badge variant="secondary">
              {sale.paymentMethod === 'mobile_money'
                ? 'Mobile Money'
                : sale.paymentMethod.charAt(0).toUpperCase() + sale.paymentMethod.slice(1)}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Customer</p>
            <p className="text-sm font-medium text-foreground">
              {sale.customerName || 'Walk-in'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Items</p>
            <p className="text-xl font-bold text-foreground">{sale.items.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Line Items</h2>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={dataWithReturnable}
            keyExtractor={(i) => i.id}
            emptyMessage="No items"
          />
        </CardContent>
      </Card>

      {returningItemId && (
        <SaleReturnForm
          saleId={sale.id}
          saleItem={sale.items.find((i) => i.id === returningItemId)!}
          onClose={() => setReturningItemId(null)}
        />
      )}

      <div>
        <Link
          href="/sales"
          className="text-primary hover:text-primary/80 text-sm font-medium"
        >
          &larr; Back to Sales
        </Link>
      </div>
    </div>
  );
}
