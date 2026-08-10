import { loadAuth } from '@/lib/auth/auth-storage';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface DownloadPdfOptions {
  url: string;
  body: Record<string, unknown>;
  filename: string;
}

async function downloadPdf({ url, body, filename }: DownloadPdfOptions): Promise<boolean> {
  const auth = loadAuth();
  const token = auth?.accessToken;

  const response = await fetch(`${BASE_URL}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`PDF generation failed: ${response.statusText}`);
  }

  const blob = await response.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);

  return true;
}

export async function downloadReceiptPdf(receiptData: {
  storeName: string;
  saleDate: string;
  receiptNumber: string;
  cashierName: string;
  paymentMethod: string;
  items: Array<{
    itemName: string;
    batchNo: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  totalAmount: number;
  customerName?: string;
}) {
  return downloadPdf({
    url: '/pdf/receipt',
    body: receiptData,
    filename: `receipt-${receiptData.receiptNumber}.pdf`,
  });
}

export async function downloadTablePdf(tableData: {
  title: string;
  headers: string[];
  rows: string[][];
}) {
  return downloadPdf({
    url: '/pdf/table',
    body: tableData,
    filename: `${tableData.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`,
  });
}
