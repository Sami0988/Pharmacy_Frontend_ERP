import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/store/base-query';
import type {
  Payment,
  CreatePaymentDto,
  SupplierBalance,
  GrnBalance,
  SupplierBalanceSummary,
  PaginatedResponse,
} from '@/types/api';

export const supplierPaymentsApi = createApi({
  reducerPath: 'supplierPaymentsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['SupplierBalance', 'GrnBalance', 'PaymentHistory'],
  endpoints: (builder) => ({
    getSupplierBalance: builder.query<SupplierBalance, string>({
      query: (supplierId) => `/suppliers/${supplierId}/balance`,
      providesTags: (result, error, supplierId) => [
        { type: 'SupplierBalance', id: supplierId },
      ],
    }),

    getSupplierPayments: builder.query<PaginatedResponse<Payment>, { supplierId: string; page?: number; limit?: number }>({
      query: ({ supplierId, ...params }) => ({
        url: `/suppliers/${supplierId}/payments`,
        params,
      }),
      providesTags: (result, error, { supplierId }) => [
        { type: 'PaymentHistory', id: supplierId },
      ],
    }),

    getGrnPayments: builder.query<
      { payments: Payment[]; balance: GrnBalance },
      string
    >({
      query: (grnId) => `/goods-receipts/${grnId}/payments`,
      providesTags: (result, error, grnId) => [
        { type: 'GrnBalance', id: grnId },
      ],
    }),

    getAllSupplierBalances: builder.query<SupplierBalanceSummary[], void>({
      query: () => '/suppliers/balances',
      providesTags: [{ type: 'SupplierBalance', id: 'LIST' }],
    }),

    createPayment: builder.mutation<Payment, CreatePaymentDto>({
      query: (body) => ({
        url: '/supplier-payments',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { supplierId, grnId }) => [
        { type: 'SupplierBalance', id: supplierId },
        { type: 'SupplierBalance', id: 'LIST' },
        { type: 'GrnBalance', id: grnId },
        { type: 'PaymentHistory', id: supplierId },
      ],
    }),
  }),
});

export const {
  useGetSupplierBalanceQuery,
  useGetSupplierPaymentsQuery,
  useGetGrnPaymentsQuery,
  useGetAllSupplierBalancesQuery,
  useCreatePaymentMutation,
} = supplierPaymentsApi;
