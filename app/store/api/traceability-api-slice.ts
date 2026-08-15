import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/store/base-query';
import type { TraceResult, RecallImpact } from '@/types/api';

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapTraceResult(raw: any): TraceResult {
  const stockArr: { locationName: string; quantity: string | number }[] = raw.currentStock ?? [];
  const storeStock = stockArr.find((s) => s.locationName === 'Store');
  const dispatcherStock = stockArr.find((s) => s.locationName === 'Dispatcher');

  const source = raw.source ?? {};
  const supplier = source.supplier ?? {};
  const payment = raw.paymentStatus ?? {};
  const docUrl = source.invoiceDocumentSignedUrl ?? null;

  return {
    batchId: raw.batchId,
    batchNumber: raw.batchNo,
    itemName: raw.item?.name ?? '',
    itemGenericName: raw.item?.genericName ?? undefined,
    expiryDate: raw.expiryDate,
    supplierName: supplier.name ?? '',
    supplierPhone: supplier.phone ?? undefined,
    supplierLicenseNumber: supplier.licenseNo ?? undefined,
    grnNumber: source.grnNumber ?? '',
    receiptDate: source.receiptDate ?? '',
    invoiceDocumentUrl: docUrl ?? undefined,
    documentUnavailable: !docUrl,
    unitCost: Number(source.unitCost ?? 0),
    quantityReceived: Number(source.quantityReceived ?? 0),
    taxPaid: Boolean(source.taxPaid),
    paymentDueDate: source.paymentDueDate ?? undefined,
    paymentDueDateType: source.paymentDueDateType ?? undefined,
    totalCost: payment.totalCost ?? 0,
    paidAmount: payment.totalPaid ?? 0,
    outstanding: payment.outstanding ?? 0,
    storeQuantity: storeStock ? Number(storeStock.quantity) : 0,
    dispatcherQuantity: dispatcherStock ? Number(dispatcherStock.quantity) : 0,
    totalSold: raw.totalSold ?? 0,
    salesHistory: (raw.salesHistory ?? []).map((s: any) => ({
      saleId: s.saleId,
      saleNumber: s.saleNumber ?? '',
      saleDate: s.saleDate,
      quantity: s.quantitySold,
      customerName: s.customerName ?? null,
      soldByName: s.soldByUserName ?? '',
    })),
    transferHistory: (raw.transferHistory ?? []).map((t: any) => ({
      transferId: t.transferId,
      transferDate: t.transferDate,
      quantity: t.quantity,
      fromLocation: t.fromLocation,
      toLocation: t.toLocation,
      transferredByName: t.transferredByUserName ?? '',
    })),
  };
}

export const traceabilityApi = createApi({
  reducerPath: 'traceabilityApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: [],
  endpoints: (builder) => ({
    traceByBatchNo: builder.query<TraceResult[], string>({
      query: (batchNo) => `/batches/trace/${encodeURIComponent(batchNo)}`,
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response.map(mapTraceResult);
        return [];
      },
    }),
    traceByBatchId: builder.query<TraceResult, string>({
      query: (batchId) => `/batches/trace-by-id/${batchId}`,
      transformResponse: (response: any) => mapTraceResult(response),
    }),
    getRecallImpact: builder.query<RecallImpact, string>({
      query: (batchId) => `/batches/${batchId}/recall-impact`,
      transformResponse: (response: any) => {
        const rawStock = response?.currentStock ?? [];
        let storeQty = 0;
        let dispatcherQty = 0;

        if (Array.isArray(rawStock)) {
          const storeItem = rawStock.find((s: any) => s.locationName === 'Store');
          const dispatcherItem = rawStock.find((s: any) => s.locationName === 'Dispatcher');
          storeQty = storeItem ? Number(storeItem.quantity) : 0;
          dispatcherQty = dispatcherItem ? Number(dispatcherItem.quantity) : 0;
        } else if (typeof rawStock === 'object') {
          storeQty = Number(rawStock.store ?? 0);
          dispatcherQty = Number(rawStock.dispatcher ?? 0);
        }

        const rawRecipients = response?.salesRecipients ?? response?.recipients ?? response?.contacts ?? [];

        return {
          batchId: response?.batchId ?? '',
          batchNumber: response?.batchNumber ?? response?.batchNo ?? '',
          itemName: response?.itemName ?? response?.item?.name ?? '',
          expiryDate: response?.expiryDate ?? '',
          currentStock: { store: storeQty, dispatcher: dispatcherQty },
          salesRecipients: Array.isArray(rawRecipients)
            ? rawRecipients.map((r: any) => ({
                customerName: r.customerName ?? null,
                customerPhone: r.customerPhone ?? undefined,
                saleNumber: r.saleNumber ?? r.saleId ?? '',
                saleDate: r.saleDate ?? '',
                quantityReceived: Number(r.quantityReceived ?? r.quantity ?? 0),
              }))
            : [],
        };
      },
    }),
  }),
});

export const {
  useLazyTraceByBatchNoQuery,
  useLazyTraceByBatchIdQuery,
  useLazyGetRecallImpactQuery,
} = traceabilityApi;
