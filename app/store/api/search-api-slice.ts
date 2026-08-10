import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/store/base-query';

export interface SearchResult {
  id: string;
  type: 'item' | 'batch' | 'supplier' | 'customer';
  name: string;
  subtitle?: string;
}

export const searchApi = createApi({
  reducerPath: 'searchApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: [],
  endpoints: (builder) => ({
    universalSearch: builder.query<SearchResult[], string>({
      query: (q) => ({ url: '/search', params: { q } }),
    }),
  }),
});

export const { useLazyUniversalSearchQuery } = searchApi;
