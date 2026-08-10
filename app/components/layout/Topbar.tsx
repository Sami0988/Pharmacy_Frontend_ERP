'use client';

import { useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/use-auth';
import { useTranslations } from '@/lib/i18n';
import { Search } from 'lucide-react';
import { motion } from 'motion/react';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { LocaleSwitcher } from '@/components/theme/LocaleSwitcher';
import { CommandBar } from '@/components/search/CommandBar';
import { navKeys } from './Sidebar';

export function Topbar() {
  const { user } = useAuth();
  const { t } = useTranslations();
  const [commandBarOpen, setCommandBarOpen] = useState(false);

  const toggleCommandBar = useCallback(() => setCommandBarOpen((o) => !o), []);

  const pathname = usePathname() ?? '';
  const activeNav = navKeys.find((item) => pathname === item.href || pathname.startsWith(item.href + '/'));
  const pageTitle = activeNav ? t(activeNav.key) : t('common.dashboard');

  return (
    <>
      <header className="h-16 glass-strong border-b border-border flex items-center justify-between px-6 shrink-0 relative z-40">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">{pageTitle}</h2>
        </div>

        <div className="flex-1 flex items-center justify-center ml-8">
          <motion.button
            type="button"
            onClick={toggleCommandBar}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="relative w-full max-w-2xl flex items-center gap-2 pl-4 pr-4 py-2 border border-border rounded-full text-sm text-muted-foreground bg-muted/50 hover:bg-accent transition-colors duration-150 cursor-pointer"
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="mx-3 text-sm text-muted-foreground">{t('common.search')}</span>
            <kbd className="hidden sm:inline-flex ml-auto items-center gap-0.5 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              Ctrl+K
            </kbd>
          </motion.button>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />

          {/* Language selector (replaces message icon) */}
          <LocaleSwitcher />

          <ThemeToggle />

          <div className="flex items-center gap-2.5 ml-2 pl-3 border-l border-border">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium ring-2 ring-background"
            >
              {user?.name?.charAt(0) || 'U'}
            </motion.div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </header>

      <CommandBar open={commandBarOpen} onClose={() => setCommandBarOpen(false)} />
    </>
  );
}
