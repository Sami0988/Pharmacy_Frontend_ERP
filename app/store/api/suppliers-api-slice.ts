import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/store/base-query';
import type {
  Supplier,
  CreateSupplierDto,
  UpdateSupplierDto,
  PaginatedResponse,
} from '@/types/api';

export const suppliersApi = createApi({
  reducerPath: 'suppliersApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Supplier'],
  endpoints: (builder) => ({
    getSuppliers: builder.query<PaginatedResponse<Supplier>, { search?: string; page?: number; limit?: number }>({
      query: (params) => ({
        url: '/suppliers',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((s) => ({ type: 'Supplier' as const, id: s.id })),
              { type: 'Supplier', id: 'LIST' },
            ]
          : [{ type: 'Supplier', id: 'LIST' }],
    }),

    getSupplier: builder.query<Supplier, string>({
      query: (id) => `/suppliers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Supplier', id }],
    }),

    createSupplier: builder.mutation<Supplier, CreateSupplierDto>({
      query: (body) => ({
        url: '/suppliers',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Supplier', id: 'LIST' }],
    }),

    updateSupplier: builder.mutation<Supplier, { id: string; body: UpdateSupplierDto }>({
      query: ({ id, body }) => ({
        url: `/suppliers/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Supplier', id },
        { type: 'Supplier', id: 'LIST' },
      ],
    }),

    deleteSupplier: builder.mutation<void, string>({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Supplier', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetSuppliersQuery,
  useGetSupplierQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} = suppliersApi;
