import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/store/base-query';
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  SetupMfaResponse,
  VerifyMfaRequest,
  MfaEnableRequest,
  MfaDisableRequest,
  BackupCodesResponse,
  SessionsResponse,
  LoginHistoryResponse,
  UpdateNameRequest,
  UpdateNameResponse,
  UploadImageResponse,
  User,
} from '@/types/api';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Mfa', 'Sessions', 'LoginHistory'],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    verifyMfa: builder.mutation<LoginResponse, VerifyMfaRequest>({
      query: (data) => ({
        url: '/auth/mfa/verify',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    refreshToken: builder.mutation<RefreshTokenResponse, { refreshToken: string }>({
      query: (data) => ({
        url: '/auth/refresh',
        method: 'POST',
        body: data,
      }),
    }),

    forgotPassword: builder.mutation<void, ForgotPasswordRequest>({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),

    resetPassword: builder.mutation<void, ResetPasswordRequest>({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),

    setupMfa: builder.query<SetupMfaResponse, void>({
      query: () => ({
        url: '/auth/mfa/setup',
        method: 'GET',
      }),
      providesTags: ['Mfa'],
    }),

    enableMfa: builder.mutation<BackupCodesResponse, MfaEnableRequest>({
      query: (data) => ({
        url: '/auth/mfa/enable',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Mfa', 'User'],
    }),

    disableMfa: builder.mutation<void, MfaDisableRequest>({
      query: (data) => ({
        url: '/auth/mfa/disable',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Mfa', 'User'],
    }),

    regenerateBackupCodes: builder.mutation<BackupCodesResponse, void>({
      query: () => ({
        url: '/auth/mfa/backup-codes/regenerate',
        method: 'POST',
      }),
      invalidatesTags: ['Mfa'],
    }),

    getMe: builder.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    getSessions: builder.query<SessionsResponse, void>({
      query: () => '/auth/sessions',
      providesTags: ['Sessions'],
    }),

    revokeSession: builder.mutation<void, string>({
      query: (sessionId) => ({
        url: `/auth/sessions/${sessionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Sessions'],
    }),

    getLoginHistory: builder.query<LoginHistoryResponse, { limit?: number; offset?: number }>({
      query: ({ limit = 10, offset = 0 }) =>
        `/auth/login-history?limit=${limit}&offset=${offset}`,
      providesTags: ['LoginHistory'],
    }),

    updateName: builder.mutation<UpdateNameResponse, UpdateNameRequest>({
      query: (data) => ({
        url: '/auth/profile/name',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    uploadProfileImage: builder.mutation<UploadImageResponse, FormData>({
      query: (formData) => ({
        url: '/auth/profile/image',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useVerifyMfaMutation,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useSetupMfaQuery,
  useEnableMfaMutation,
  useDisableMfaMutation,
  useRegenerateBackupCodesMutation,
  useLogoutMutation,
  useGetSessionsQuery,
  useRevokeSessionMutation,
  useGetLoginHistoryQuery,
  useUpdateNameMutation,
  useUploadProfileImageMutation,
  useGetMeQuery,
} = authApi;
