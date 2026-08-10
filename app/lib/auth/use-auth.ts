'use client';

import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import type { AppDispatch } from '@/store/store';
import type { User } from '@/types/api';
import { setCredentials, logout, selectCurrentUser, selectCurrentToken } from '@/store/slices/auth-slice';
import { authApi } from '@/store/api/auth-api-slice';
import { persistAuth, clearAuth } from '@/lib/auth/auth-storage';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectCurrentToken);

  const login = useCallback(
    (credentials: { accessToken: string; refreshToken: string; user: User }) => {
      dispatch(setCredentials(credentials));
      persistAuth(credentials.accessToken, credentials.user);
    },
    [dispatch]
  );

  const logoutUser = useCallback(() => {
    dispatch(logout());
    clearAuth();
    router.push('/login');
  }, [dispatch, router]);

  const refetch = useCallback(() => {
    dispatch(authApi.util.invalidateTags(['User']));
  }, [dispatch]);

  const isAuthenticated = !!token;
  const isAdmin = user?.role === 'admin';
  const isStoreKeeper = user?.role === 'store_keeper';
  const isCashier = user?.role === 'cashier';

  return {
    user,
    token,
    login,
    logout: logoutUser,
    refetch,
    isAuthenticated,
    isAdmin,
    isStoreKeeper,
    isCashier,
  };
}
