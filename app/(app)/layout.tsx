'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/lib/auth/use-auth';
import { selectIsAuthChecked, setCredentials, setAuthChecked } from '@/store/slices/auth-slice';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { useGetMeQuery } from '@/store/api/auth-api-slice';
import { loadAuth } from '@/lib/auth/auth-storage';

function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const isAuthChecked = useAppSelector(selectIsAuthChecked);
  const [attemptedRestore, setAttemptedRestore] = useState(false);

  const storedAuth = loadAuth();
  const shouldFetchMe = attemptedRestore && !!storedAuth?.accessToken;
  const { data: meUser, isError: meError } = useGetMeQuery(undefined, {
    skip: !shouldFetchMe,
  });

  // Step 1: Try restoring from localStorage on mount
  useEffect(() => {
    if (attemptedRestore) return;
    const stored = loadAuth();
    if (stored?.accessToken && stored?.user) {
      dispatch(setCredentials({
        accessToken: stored.accessToken,
        refreshToken: '',
        user: stored.user,
      }));
    }
    setAttemptedRestore(true);
  }, [attemptedRestore, dispatch]);

  // Step 2: If we have a stored token, validate it via /auth/me
  useEffect(() => {
    if (!shouldFetchMe) return;
    if (meUser) {
      dispatch(setCredentials({
        accessToken: storedAuth!.accessToken,
        refreshToken: '',
        user: meUser,
      }));
      dispatch(setAuthChecked(true));
    } else if (meError) {
      // Token invalid — clear and redirect
      dispatch(setAuthChecked(true));
    }
  }, [meUser, meError, shouldFetchMe, storedAuth, dispatch]);

  // Step 3: Mark auth as checked if no stored token
  useEffect(() => {
    if (attemptedRestore && !storedAuth?.accessToken) {
      dispatch(setAuthChecked(true));
    }
  }, [attemptedRestore, storedAuth, dispatch]);

  // Step 4: Redirect to login if auth failed
  useEffect(() => {
    if (isAuthChecked && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isAuthChecked, router, pathname]);

  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
