import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/store/base-query';
import type { DashboardSummary, ReorderSuggestion, DeadStockItem } from '@/types/api';

export interface InventoryCounts {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalStock: number;
}
 
export interface CategoryBreakdown {
  category: string;
  count: number;
}
 
export interface SalesTrendPoint {
  month: string;
  totalAmount: number;
}
 
export interface RevenueTrendPoint {
  month: string;
  revenue: number;
  profit: number;
  expenses: number;
  creditSales: number;
}
 
export interface SparklinePoint {
  date: string;
  sales: number;
  profit: number;
  creditSales: number;
  stockOnHand: number;
  lowStockAlerts: number;
  expiringSoonAlerts: number;
  auditEntries: number;
}
 
export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: [],
  endpoints: (builder) => ({
    getSummary: builder.query<DashboardSummary, void>({
      query: () => '/dashboard/summary',
    }),
    getReorderSuggestions: builder.query<ReorderSuggestion[], { leadTimeDays?: number }>({
      query: (params) => ({ url: '/dashboard/reorder-suggestions', params }),
    }),
    getDeadStock: builder.query<DeadStockItem[], { daysThreshold?: number }>({
      query: (params) => ({ url: '/dashboard/dead-stock', params }),
    }),
    getInventoryCounts: builder.query<InventoryCounts, void>({
      query: () => '/dashboard/inventory-counts',
    }),
    getCategoryBreakdown: builder.query<CategoryBreakdown[], void>({
      query: () => '/dashboard/category-breakdown',
    }),
    getRevenueTrend: builder.query<RevenueTrendPoint[], { months?: number }>({
      query: (params) => ({ url: '/dashboard/revenue-trend', params }),
    }),
    getSparklines: builder.query<SparklinePoint[], { days?: number }>({
      query: (params) => ({ url: '/dashboard/sparklines', params }),
    }),
    getSalesTrend: builder.query<SalesTrendPoint[], { months?: number }>({
      query: (params) => ({ url: '/dashboard/sales-trend', params }),
    }),
  }),
});

export const {
  useGetSummaryQuery,
  useGetReorderSuggestionsQuery,
  useGetDeadStockQuery,
  useGetInventoryCountsQuery,
  useGetCategoryBreakdownQuery,
  useGetRevenueTrendQuery,
  useGetSparklinesQuery,
  useGetSalesTrendQuery,
} = dashboardApi;
