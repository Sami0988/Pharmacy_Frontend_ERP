interface ReceiptItem {
  itemName: string;
  batchNo: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface ReceiptData {
  storeName: string;
  saleDate: string;
  receiptNumber: string;
  cashierName: string;
  paymentMethod: string;
  items: ReceiptItem[];
  totalAmount: number;
  customerName?: string;
}

function formatPaymentMethod(method: string): string {
  const map: Record<string, string> = {
    cash: 'CASH',
    mobile_money: 'MOBILE',
    card: 'CARD',
    credit: 'CREDIT',
  };
  return map[method] || method.toUpperCase();
}

function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildReceiptHtml(data: ReceiptData): string {
  const items = data.items
    .map(
      (item) => `
    <tr>
      <td>${escapeHtml(item.itemName)}</td>
      <td class="right">${item.quantity}x${Number(item.unitPrice).toFixed(2)}</td>
      <td class="right">${Number(item.lineTotal).toFixed(2)}</td>
    </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
<style>
  @page {
    size: 80mm auto;
    margin: 2mm;
  }
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    font-family: 'Courier New', Courier, monospace;
    font-size: 11px;
    width: 76mm;
    padding: 0;
    background: #fff;
    color: #000;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .header {
    text-align: center;
    border-bottom: 1px dashed #000;
    padding-bottom: 5px;
    margin-bottom: 5px;
  }
  .store-name {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 2px;
  }
  .receipt-info {
    font-size: 10px;
    margin-top: 5px;
  }
  .divider {
    border-top: 1px dashed #000;
    margin: 5px 0;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 5px 0;
  }
  td {
    padding: 2px 0;
    vertical-align: top;
    word-wrap: break-word;
    max-width: 40mm;
  }
  .right {
    text-align: right;
  }
  .item-name {
    max-width: 35mm;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .total-row {
    font-weight: bold;
    font-size: 14px;
    border-top: 1px dashed #000;
    padding-top: 3px;
  }
  .footer {
    text-align: center;
    font-size: 10px;
    margin-top: 5px;
    border-top: 1px dashed #000;
    padding-top: 5px;
  }
  .bold {
    font-weight: bold;
  }
  @media print {
    body {
      width: 80mm;
      margin: 0;
      padding: 5mm;
    }
  }
</style>
</head>
<body>
  <div class="header">
    <div class="store-name">${escapeHtml(data.storeName)}</div>
    <div class="receipt-info">
      Receipt: ${escapeHtml(data.receiptNumber)}<br>
      Date: ${data.saleDate}<br>
      Cashier: ${escapeHtml(data.cashierName)}
    </div>
    ${data.customerName ? `<div class="receipt-info">Customer: ${escapeHtml(data.customerName)}</div>` : ''}
  </div>

  <div class="divider"></div>

  <table>
    <thead>
      <tr>
        <th style="text-align:left">Item</th>
        <th class="right">Qty</th>
        <th class="right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${items}
    </tbody>
  </table>

  <div class="divider"></div>

  <div class="total-row">
    <table>
      <tr>
        <td>TOTAL</td>
        <td class="right">${Number(data.totalAmount).toFixed(2)} ETB</td>
      </tr>
      <tr>
        <td>PAYMENT</td>
        <td class="right">${formatPaymentMethod(data.paymentMethod)}</td>
      </tr>
    </table>
  </div>

  <div class="divider"></div>

  <div class="footer">
    Thank you for your purchase!<br>
    Get well soon
  </div>
</body>
</html>`;
}

export function printReceipt(data: ReceiptData): void {
  const html = buildReceiptHtml(data);

  // Create a hidden iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  // Use blob URL for reliable content loading
  const blob = new Blob([html], { type: 'text/html' });
  const blobUrl = URL.createObjectURL(blob);

  iframe.onload = () => {
    try {
      const win = iframe.contentWindow;
      if (win) {
        // Wait for styles to apply before printing
        setTimeout(() => {
          win.focus();
          win.print();
          // Cleanup after print
          setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
            document.body.removeChild(iframe);
          }, 500);
        }, 200);
      }
    } catch (err) {
      console.error('Print error:', err);
      URL.revokeObjectURL(blobUrl);
      document.body.removeChild(iframe);
    }
  };

  iframe.src = blobUrl;
}
