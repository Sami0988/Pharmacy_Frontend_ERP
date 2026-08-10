import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/store/base-query';
import type {
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerPurchaseHistory,
  PaginatedResponse,
} from '@/types/api';

export const customersApi = createApi({
  reducerPath: 'customersApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Customer'],
  endpoints: (builder) => ({
    getCustomers: builder.query<PaginatedResponse<Customer>, { search?: string; page?: number; limit?: number }>({
      query: (params) => ({
        url: '/customers',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((c) => ({ type: 'Customer' as const, id: c.id })),
              { type: 'Customer', id: 'LIST' },
            ]
          : [{ type: 'Customer', id: 'LIST' }],
    }),

    getCustomer: builder.query<Customer, string>({
      query: (id) => `/customers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Customer', id }],
    }),

    createCustomer: builder.mutation<Customer, CreateCustomerDto>({
      query: (body) => ({
        url: '/customers',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Customer', id: 'LIST' }],
    }),

    updateCustomer: builder.mutation<Customer, { id: string; body: UpdateCustomerDto }>({
      query: ({ id, body }) => ({
        url: `/customers/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Customer', id },
        { type: 'Customer', id: 'LIST' },
      ],
    }),

    getCustomerHistory: builder.query<CustomerPurchaseHistory[], string>({
      query: (customerId) => `/customers/${customerId}/history`,
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useGetCustomerHistoryQuery,
} = customersApi;
