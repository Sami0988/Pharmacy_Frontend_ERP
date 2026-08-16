'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/use-auth';
import { useTranslations } from '@/lib/i18n';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Package,
  Plus,
  Users,
  DollarSign,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Warehouse,
  FileSearch,
  Receipt,
  Pill,
} from 'lucide-react';

interface NavItem {
  href: string;
  key: string;
  icon: LucideIcon;
  roles: string[];
  parent?: string;
}

export const navKeys: NavItem[] = [
  { href: '/dashboard', key: 'sidebar.dashboard', icon: LayoutDashboard, roles: ['admin', 'store_keeper', 'cashier'] },
  { href: '/inventory', key: 'sidebar.inventoryManagement', icon: Package, roles: ['admin', 'store_keeper'] },
  { href: '/items', key: 'sidebar.medicineCatalog', icon: Pill, roles: ['admin', 'store_keeper'] },
  { href: '/goods-receipts', key: 'sidebar.goodsReceipts', icon: Receipt, roles: ['admin', 'store_keeper'] },
  { href: '/suppliers', key: 'sidebar.suppliers', icon: Users, roles: ['admin', 'store_keeper'] },
  { href: '/sales', key: 'sidebar.salesPos', icon: ShoppingCart, roles: ['admin', 'cashier'] },
  // { href: '/prescriptions', key: 'sidebar.prescriptions', icon: FileSearch, roles: ['admin', 'store_keeper'] },
  { href: '/stock', key: 'sidebar.stockByLocation', icon: Warehouse, roles: ['admin', 'store_keeper'] },
  { href: '/transfers', key: 'sidebar.transfers', icon: Warehouse, roles: ['admin', 'store_keeper'] },
  { href: '/expiry-management', key: 'sidebar.expiryManagement', icon: FileSearch, roles: ['admin', 'store_keeper'] },

  { href: '/reports', key: 'sidebar.reports', icon: BarChart3, roles: ['admin'] },
  // { href: '/staff', key: 'sidebar.staffManagement', icon: Users, roles: ['admin'] },
  { href: '/settings/security', key: 'sidebar.settings', icon: Settings, roles: ['admin', 'store_keeper', 'cashier'] },
  { href: '/traceability', key: 'sidebar.batchTraceability', icon: FileSearch, roles: ['admin', 'store_keeper'] },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useTranslations();

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const filteredNav = navKeys.filter((item) =>
    item.roles.includes(user?.role || '')
  );

  // ensure parent nav groups expand when their active child is selected
  useEffect(() => {
    filteredNav.forEach((item) => {
      if (item.parent && pathname.startsWith(item.parent)) {
        setExpanded((state) => ({ ...state, [item.parent as string]: true }));
      }
    });
  }, [pathname, filteredNav]);

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 64 : 256 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex flex-col h-screen bg-white/95 border-r border-slate-200 text-slate-900 shadow-sm backdrop-blur dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 shrink-0 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 p-4 border-b border-slate-200/80 bg-slate-50/95 dark:border-slate-800 dark:bg-slate-950/95 shrink-0">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="flex items-start gap-3"
            >
              <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-700 via-teal-600 to-slate-900 text-white shadow-sm">
                <Pill className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Hawi Pharmacy</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Pharmacy Management</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={onToggle}
          className="rounded-full p-1.5 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav (group parents and render children as expandable) */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-2">
        {(() => {
          const topLevel = filteredNav.filter((i) => !i.parent);
          return topLevel.map((item, index) => {
            const children = filteredNav.filter((c) => c.parent === item.href);
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <div key={item.href} className="">
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02, duration: 0.18 }}
                >
                  <div className="relative">
                    <Link
                      href={item.href}
                      className={cn(
                        'relative flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition-all duration-150 overflow-hidden',
                        isActive
                          ? 'text-white'
                          : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-600 to-slate-900 shadow-sm"
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}

                      <item.icon size={18} className={cn('relative z-10 shrink-0', isActive ? 'text-white' : 'text-current')} />

                      <AnimatePresence mode="wait">
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.15 }}
                            className="relative z-10 whitespace-nowrap overflow-hidden"
                          >
                            {t(item.key)}
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {/* expand chevron if has children */}
                      {!isCollapsed && children.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setExpanded((s) => ({ ...s, [item.href]: !s[item.href] }));
                          }}
                          aria-label={expanded[item.href] ? 'Collapse' : 'Expand'}
                          className={cn('ml-auto z-10 p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800')}
                        >
                          <ChevronDown className={cn('h-4 w-4', expanded[item.href] ? 'rotate-180 transform' : '')} />
                        </button>
                      )}
                    </Link>
                  </div>
                </motion.div>

                {/* children */}
                {children.length > 0 && expanded[item.href] && (
                  <div className="mt-1 space-y-1 pl-6">
                    {children.map((child) => {
                      const isChildActive = pathname === child.href || pathname.startsWith(child.href + '/');
                      return (
                        <motion.div key={child.href} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.12 }}>
                          <Link
                            href={child.href}
                            className={cn(
                              'flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition-colors duration-150',
                              isChildActive
                                ? 'bg-primary text-white'
                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                            )}
                          >
                            <child.icon size={16} className={cn('shrink-0', isChildActive ? 'text-white' : 'text-current')} />
                            {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">{t(child.key)}</span>}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          });
        })()}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-border shrink-0">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-150"
        >
          <LogOut size={18} className="shrink-0" />
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="whitespace-nowrap overflow-hidden"
              >
                {t('common.logout')}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
