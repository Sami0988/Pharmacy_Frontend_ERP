import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/store/base-query';
import type {
  GoodsReceipt,
  GoodsReceiptDetail,
  PaginatedResponse,
} from '@/types/api';

export const goodsReceiptsApi = createApi({
  reducerPath: 'goodsReceiptsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['GoodsReceipt', 'Batch'],
  endpoints: (builder) => ({
    getGoodsReceipts: builder.query<PaginatedResponse<GoodsReceipt>, { search?: string; supplier?: string; branchId?: string; page?: number; limit?: number }>({
      query: (params) => ({
        url: '/goods-receipts',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((g) => ({ type: 'GoodsReceipt' as const, id: g.id })),
              { type: 'GoodsReceipt', id: 'LIST' },
            ]
          : [{ type: 'GoodsReceipt', id: 'LIST' }],
    }),

    getGoodsReceipt: builder.query<GoodsReceiptDetail, string>({
      query: (id) => `/goods-receipts/${id}`,
      providesTags: (result, error, id) => [{ type: 'GoodsReceipt', id }],
    }),

    createGoodsReceipt: builder.mutation<GoodsReceipt, FormData>({
      query: (formData) => ({
        url: '/goods-receipts',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [
        { type: 'GoodsReceipt', id: 'LIST' },
        { type: 'Batch', id: 'LIST' },
      ],
    }),

    updateGoodsReceipt: builder.mutation<GoodsReceiptDetail, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/goods-receipts/${id}`,
        method: 'PATCH',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'GoodsReceipt', id },
        { type: 'GoodsReceipt', id: 'LIST' },
        { type: 'Batch', id: 'LIST' },
      ],
    }),

    deleteGoodsReceipt: builder.mutation<void, string>({
      query: (id) => ({
        url: `/goods-receipts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'GoodsReceipt', id: 'LIST' },
        { type: 'Batch', id: 'LIST' },
      ],
    }),

    deleteBatchItem: builder.mutation<
      { movement: unknown; batch: unknown; previousTotalCost: number; newTotalCost: number },
      { grnId: string; batchId: string }
    >({
      query: ({ grnId, batchId }) => ({
        url: `/goods-receipts/${grnId}/items/${batchId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { grnId }) => [
        { type: 'GoodsReceipt', id: grnId },
        { type: 'GoodsReceipt', id: 'LIST' },
        { type: 'Batch', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetGoodsReceiptsQuery,
  useGetGoodsReceiptQuery,
  useCreateGoodsReceiptMutation,
  useUpdateGoodsReceiptMutation,
  useDeleteGoodsReceiptMutation,
  useDeleteBatchItemMutation,
} = goodsReceiptsApi;
