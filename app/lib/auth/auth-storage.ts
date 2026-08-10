import type { User } from '@/types/api';

const AUTH_STORAGE_KEY = 'pharma_auth';

interface StoredAuth {
  accessToken: string;
  user: User;
}

export function persistAuth(accessToken: string, user: User): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ accessToken, user }));
  } catch {
    // localStorage unavailable
  }
}

export function loadAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // localStorage unavailable
  }
}
