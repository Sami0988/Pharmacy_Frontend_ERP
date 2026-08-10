import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/store/base-query';
import type {
  PaginatedResponse,
  ExpiryReportBatch,
  SalesReportLine,
  SalesReportSummary,
  DeadStockItem,
  FefoSuggestion,
} from '@/types/api';

export const reportsApi = createApi({
  reducerPath: 'reportsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: [],
  endpoints: (builder) => ({
    getExpiringBatches: builder.query<PaginatedResponse<ExpiryReportBatch>, { withinDays?: number; page?: number; limit?: number }>({
      query: (params) => ({
        url: '/reports/expiry',
        params,
      }),
    }),

    getSalesReport: builder.query<
      { data: SalesReportLine[]; meta: PaginatedResponse<SalesReportLine>['meta']; summary: SalesReportSummary },
      { startDate?: string; endDate?: string; page?: number; limit?: number }
    >({
      query: (params) => ({
        url: '/reports/sales',
        params,
      }),
    }),

    getDeadStock: builder.query<PaginatedResponse<DeadStockItem>, { daysThreshold?: number; page?: number; limit?: number }>({
      query: (params) => ({
        url: '/reports/dead-stock',
        params,
      }),
    }),

    getItemBatches: builder.query<FefoSuggestion[], { itemId: string }>({
      query: (params) => ({
        url: '/reports/stock/batches',
        params,
      }),
    }),
  }),
});

export const {
  useGetExpiringBatchesQuery,
  useGetSalesReportQuery,
  useGetDeadStockQuery,
  useGetItemBatchesQuery,
} = reportsApi;
