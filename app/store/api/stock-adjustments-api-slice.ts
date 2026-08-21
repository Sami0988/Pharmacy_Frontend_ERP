import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/store/base-query';
import type {
  StockAdjustmentResponse,
  CreateStockAdjustmentDto,
  BatchSearchResult,
  PaginatedResponse,
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
  quantitiesByLocation: { locationId: string; locationName?: string; quantity: string; packSize?: number; numberOfPacks?: number }[];
}

export interface UpdateBatchDto {
  numberOfPacks?: number;
  packSize?: number;
  unitCost?: number;
  sellingPrice?: number;
  packPrice?: number;
  locationId?: string;
  reason?: string;
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

    updateBatch: builder.mutation<{ message: string }, { id: string; body: UpdateBatchDto }>({
      query: ({ id, body }) => ({
        url: `/batches/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [
        { type: 'Batch', id: 'LIST' },
        { type: 'StockByLocation', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useSearchBatchesQuery,
  useLazySearchBatchesQuery,
  useGetBatchByIdQuery,
  useLazyGetBatchByIdQuery,
  useCreateStockAdjustmentMutation,
  useUpdateBatchMutation,
} = stockAdjustmentsApi;
