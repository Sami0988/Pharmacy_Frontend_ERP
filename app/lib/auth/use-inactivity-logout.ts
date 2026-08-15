'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth/use-auth';

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function useInactivityLogout() {
  const { logout, isAuthenticated } = useAuth();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (isAuthenticated) {
      timeoutRef.current = setTimeout(() => {
        logout();
      }, INACTIVITY_TIMEOUT_MS);
    }
  }, [isAuthenticated, logout]);

  useEffect(() => {
    if (!isAuthenticated) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => document.addEventListener(event, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach((event) => document.removeEventListener(event, resetTimer));
    };
  }, [isAuthenticated, resetTimer]);
}
