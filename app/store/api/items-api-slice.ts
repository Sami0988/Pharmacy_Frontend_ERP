import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/store/base-query';
import type {
  Item,
  CreateItemDto,
  UpdateItemDto,
  PaginatedResponse,
} from '@/types/api';

export const itemsApi = createApi({
  reducerPath: 'itemsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Item'],
  endpoints: (builder) => ({
    getItems: builder.query<PaginatedResponse<Item>, { search?: string; category?: string; unit?: string; page?: number; limit?: number }>({
      query: (params) => ({
        url: '/items',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((i) => ({ type: 'Item' as const, id: i.id })),
              { type: 'Item', id: 'LIST' },
            ]
          : [{ type: 'Item', id: 'LIST' }],
    }),

    getItem: builder.query<Item, string>({
      query: (id) => `/items/${id}`,
      providesTags: (result, error, id) => [{ type: 'Item', id }],
    }),

    createItem: builder.mutation<Item, CreateItemDto>({
      query: (body) => ({
        url: '/items',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Item', id: 'LIST' }],
    }),

    updateItem: builder.mutation<Item, { id: string; body: UpdateItemDto }>({
      query: ({ id, body }) => ({
        url: `/items/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Item', id },
        { type: 'Item', id: 'LIST' },
      ],
    }),

    getSubstitutes: builder.query<Item[], string>({
      query: (itemId) => `/items/${itemId}/substitutes`,
    }),

    deleteItem: builder.mutation<void, string>({
      query: (id) => ({
        url: `/items/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Item', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetItemsQuery,
  useGetItemQuery,
  useCreateItemMutation,
  useUpdateItemMutation,
  useGetSubstitutesQuery,
  useDeleteItemMutation,
} = itemsApi;
