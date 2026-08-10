'use client';

import { BrandPanel } from '@/components/auth/BrandPanel';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Brand panel — desktop: left side, mobile: top strip */}
      <div className="lg:hidden flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
        <span className="text-lg font-bold text-white">PharmERP</span>
      </div>
      <div className="lg:w-[55%] lg:min-h-screen">
        <div className="hidden lg:block lg:min-h-screen">
          <BrandPanel />
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center bg-background p-6 lg:p-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
