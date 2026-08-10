import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/store/base-query';
import type {
  Transfer,
  CreateTransferDto,
  StockByLocationRow,
  FefoSuggestionResponse,
  PaginatedResponse,
} from '@/types/api';

export const transfersApi = createApi({
  reducerPath: 'transfersApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Transfer', 'StockByLocation'],
  endpoints: (builder) => ({
    getTransfers: builder.query<PaginatedResponse<Transfer>, { batchId?: string; itemId?: string; page?: number; limit?: number }>({
      query: (params) => ({
        url: '/transfers',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((t) => ({ type: 'Transfer' as const, id: t.id })),
              { type: 'Transfer', id: 'LIST' },
            ]
          : [{ type: 'Transfer', id: 'LIST' }],
    }),

    createTransfer: builder.mutation<Transfer, CreateTransferDto>({
      query: (body) => ({
        url: '/transfers',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Transfer', id: 'LIST' },
        { type: 'StockByLocation', id: 'LIST' },
      ],
    }),

    getStockByLocation: builder.query<PaginatedResponse<StockByLocationRow>, { search?: string; page?: number; limit?: number }>({
      query: (params) => ({
        url: '/reports/stock',
        params,
      }),
      providesTags: [{ type: 'StockByLocation', id: 'LIST' }],
    }),

    getFefoSuggestions: builder.query<
      FefoSuggestionResponse,
      { itemId: string; quantityNeeded: number }
    >({
      query: (params) => ({
        url: '/transfers/suggest',
        params,
      }),
      keepUnusedDataFor: 5,
    }),
  }),
});

export const {
  useGetTransfersQuery,
  useCreateTransferMutation,
  useGetStockByLocationQuery,
  useGetFefoSuggestionsQuery,
} = transfersApi;
