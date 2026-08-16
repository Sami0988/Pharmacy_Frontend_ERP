import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/store/base-query';
import type {
  StockAdjustmentResponse,
  CreateStockAdjustmentDto,
  BatchSearchResult,
  PaginatedResponse,
  Location,
} from '@/types/api';

export interface BatchWithStock {
  id: string;
  batchNo: string;
  itemId: string;
  expiryDate: string;
  unitCost: string;
  sellingPrice: string;
  quantityReceived: number;
  supplierName: string;
  quantitiesByLocation: { locationId: string; quantity: string }[];
}

export const stockAdjustmentsApi = createApi({
  reducerPath: 'stockAdjustmentsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['StockAdjustment', 'StockByLocation', 'Batch'],
  endpoints: (builder) => ({
    searchBatches: builder.query<PaginatedResponse<BatchSearchResult>, { search?: string; page?: number; limit?: number }>({
      query: (params) => ({
        url: '/batches',
        params,
      }),
    }),

    getBatchById: builder.query<BatchWithStock, string>({
      query: (id) => `/batches/${id}`,
    }),

    getLocations: builder.query<Location[], void>({
      query: () => '/locations',
    }),

    createStockAdjustment: builder.mutation<StockAdjustmentResponse, CreateStockAdjustmentDto>({
      query: (body) => ({
        url: '/stock-adjustments',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'StockByLocation', id: 'LIST' },
        { type: 'Batch', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useSearchBatchesQuery,
  useLazySearchBatchesQuery,
  useGetBatchByIdQuery,
  useLazyGetBatchByIdQuery,
  useGetLocationsQuery,
  useCreateStockAdjustmentMutation,
} = stockAdjustmentsApi;
