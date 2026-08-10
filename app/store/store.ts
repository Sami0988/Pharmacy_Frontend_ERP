import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { authApi } from './api/auth-api-slice';
import { itemsApi } from './api/items-api-slice';
import { suppliersApi } from './api/suppliers-api-slice';
import { goodsReceiptsApi } from './api/goods-receipts-api-slice';
import { supplierPaymentsApi } from './api/supplier-payments-api-slice';
import { transfersApi } from './api/transfers-api-slice';
import { customersApi } from './api/customers-api-slice';
import { salesApi } from './api/sales-api-slice';
import { traceabilityApi } from './api/traceability-api-slice';
import { notificationsApi } from './api/notifications-api-slice';
import { dashboardApi } from './api/dashboard-api-slice';
import { searchApi } from './api/search-api-slice';
import { reportsApi } from './api/reports-api-slice';
import authReducer from './slices/auth-slice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      [authApi.reducerPath]: authApi.reducer,
      [itemsApi.reducerPath]: itemsApi.reducer,
      [suppliersApi.reducerPath]: suppliersApi.reducer,
      [goodsReceiptsApi.reducerPath]: goodsReceiptsApi.reducer,
      [supplierPaymentsApi.reducerPath]: supplierPaymentsApi.reducer,
      [transfersApi.reducerPath]: transfersApi.reducer,
      [customersApi.reducerPath]: customersApi.reducer,
      [salesApi.reducerPath]: salesApi.reducer,
      [traceabilityApi.reducerPath]: traceabilityApi.reducer,
      [notificationsApi.reducerPath]: notificationsApi.reducer,
      [dashboardApi.reducerPath]: dashboardApi.reducer,
      [searchApi.reducerPath]: searchApi.reducer,
      [reportsApi.reducerPath]: reportsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .concat(authApi.middleware)
        .concat(itemsApi.middleware)
        .concat(suppliersApi.middleware)
        .concat(goodsReceiptsApi.middleware)
        .concat(supplierPaymentsApi.middleware)
        .concat(transfersApi.middleware)
        .concat(customersApi.middleware)
        .concat(salesApi.middleware)
        .concat(traceabilityApi.middleware)
        .concat(notificationsApi.middleware)
        .concat(dashboardApi.middleware)
        .concat(searchApi.middleware)
        .concat(reportsApi.middleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
