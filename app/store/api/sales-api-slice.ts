import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/store/base-query';
import type {
  Sale,
  SaleDetail,
  CreateSaleDto,
  SaleReturn,
  CreateSaleReturnDto,
  PaginatedResponse,
} from '@/types/api';

export const salesApi = createApi({
  reducerPath: 'salesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Sale', 'StockByLocation', 'Customer'],
  endpoints: (builder) => ({
    getSales: builder.query<PaginatedResponse<Sale>, { customerId?: string; startDate?: string; endDate?: string; page?: number; limit?: number }>({
      query: (params) => ({
        url: '/sales',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((s) => ({ type: 'Sale' as const, id: s.id })),
              { type: 'Sale', id: 'LIST' },
            ]
          : [{ type: 'Sale', id: 'LIST' }],
    }),

    getSale: builder.query<SaleDetail, string>({
      query: (id) => `/sales/${id}`,
      providesTags: (result, error, id) => [{ type: 'Sale', id }],
    }),

    createSale: builder.mutation<SaleDetail, CreateSaleDto>({
      query: (body) => ({
        url: '/sales',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Sale', id: 'LIST' },
        { type: 'StockByLocation', id: 'LIST' },
        { type: 'Customer', id: 'LIST' },
      ],
    }),

    createSaleReturn: builder.mutation<
      SaleReturn,
      { saleId: string; body: CreateSaleReturnDto }
    >({
      query: ({ saleId, body }) => ({
        url: `/sales/${saleId}/returns`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { saleId }) => [
        { type: 'Sale', id: saleId },
        { type: 'StockByLocation', id: 'LIST' },
      ],
    }),

    deleteSale: builder.mutation<void, string>({
      query: (id) => ({
        url: `/sales/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Sale', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetSalesQuery,
  useGetSaleQuery,
  useCreateSaleMutation,
  useCreateSaleReturnMutation,
  useDeleteSaleMutation,
} = salesApi;
