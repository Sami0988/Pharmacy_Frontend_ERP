import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/store/base-query';
import type { Notification, NotificationSummary, PaginatedResponse } from '@/types/api';

export const notificationsApi = createApi({
  reducerPath: 'notificationsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Notification', 'NotificationSummary'],
  endpoints: (builder) => ({
    getNotifications: builder.query<PaginatedResponse<Notification>, { type?: string; isRead?: boolean; page?: number; limit?: number }>({
      query: (params) => ({ url: '/notifications', params }),
      providesTags: (result) =>
        result
          ? [...result.data.map((n) => ({ type: 'Notification' as const, id: n.id })), { type: 'Notification', id: 'LIST' }]
          : [{ type: 'Notification', id: 'LIST' }],
    }),
    getUnreadCount: builder.query<{ count: number }, void>({
      query: () => '/notifications/unread-count',
      transformResponse: (response: { unreadCount?: number; count?: number }) => ({
        count: response?.unreadCount ?? response?.count ?? 0,
      }),
      providesTags: [{ type: 'NotificationSummary', id: 'COUNT' }],
    }),
    getNotificationSummary: builder.query<NotificationSummary, void>({
      query: () => '/notifications/summary',
      providesTags: [{ type: 'NotificationSummary', id: 'SUMMARY' }],
    }),
    markRead: builder.mutation<void, string>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'PATCH' }),
      invalidatesTags: [
        { type: 'Notification', id: 'LIST' },
        { type: 'NotificationSummary', id: 'COUNT' },
        { type: 'NotificationSummary', id: 'SUMMARY' },
      ],
    }),
    markAllRead: builder.mutation<void, void>({
      query: () => ({ url: '/notifications/mark-all-read', method: 'PATCH' }),
      invalidatesTags: [
        { type: 'Notification', id: 'LIST' },
        { type: 'NotificationSummary', id: 'COUNT' },
        { type: 'NotificationSummary', id: 'SUMMARY' },
      ],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useGetNotificationSummaryQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
} = notificationsApi;
