'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import { setAuthChecked } from '@/store/slices/auth-slice';
import { I18nProvider } from '@/lib/i18n';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  const [store] = useState(() => makeStore());

  useEffect(() => {
    store.dispatch(setAuthChecked(true));
  }, [store]);

  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <I18nProvider>
        <Provider store={store}>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </Provider>
      </I18nProvider>
    </NextThemesProvider>
  );
}
