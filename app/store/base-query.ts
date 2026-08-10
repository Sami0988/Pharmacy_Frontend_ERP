import {
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { logout, setCredentials } from './slices/auth-slice';
import { RootState } from './store';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;

      try {
        const refreshResult = await baseQuery(
          '/auth/refresh',
          api,
          extraOptions
        );

        if (refreshResult.data) {
          const { accessToken } = refreshResult.data as { accessToken: string };
          const currentUser = (api.getState() as RootState).auth.user;
          api.dispatch(setCredentials({ user: currentUser!, accessToken, refreshToken: '' }));
          processQueue(null, accessToken);
          result = await baseQuery(args, api, extraOptions);
        } else {
          processQueue(new Error('Refresh failed'));
          api.dispatch(logout());
        }
      } catch {
        api.dispatch(logout());
      } finally {
        isRefreshing = false;
      }
    } else {
      result = await new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => baseQuery(args, api, extraOptions));
    }
  }

  return result;
};
