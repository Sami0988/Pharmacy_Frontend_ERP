'use client';

import { BrandPanel } from '@/components/auth/BrandPanel';
import { LocaleSwitcher } from '@/components/theme/LocaleSwitcher';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col lg:flex-row bg-background overflow-hidden">
      {/* Brand panel — desktop: left side, mobile: top strip */}
      <div className="lg:hidden flex items-center justify-between gap-2 bg-gradient-to-r from-slate-800 to-emerald-900 px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-emerald-400/20 p-1.5">
            <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
          </div>
          <span className="text-lg font-bold text-white">PharmERP</span>
        </div>
        <LocaleSwitcher />
      </div>
      <div className="lg:w-[55%] lg:h-screen lg:overflow-hidden">
        <div className="hidden lg:block lg:h-full">
          <BrandPanel />
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col h-screen lg:h-screen relative">
        {/* Locale switcher */}
        <div className="absolute top-5 right-5 z-10">
          <LocaleSwitcher />
        </div>

        {/* Form content - perfectly centered */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-12">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
