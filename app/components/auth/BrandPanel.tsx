'use client';

import { useTranslations } from '@/lib/i18n';
import { Pill, Activity, CreditCard, ShieldCheck } from 'lucide-react';

const features = [
  { icon: Pill, labelKey: 'auth.brand.features.batchTraceability' },
  { icon: Activity, labelKey: 'auth.brand.features.realTimeStock' },
  { icon: CreditCard, labelKey: 'auth.brand.features.supplierPayments' },
  { icon: ShieldCheck, labelKey: 'auth.brand.features.secureAccess' },
];

export function BrandPanel() {
  const { t } = useTranslations();

  return (
    <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-blue-500 to-indigo-600 p-12 overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-[-80px] right-[-80px] h-[300px] w-[300px] rounded-full bg-white/5" />
      <div className="absolute bottom-[-60px] left-[-60px] h-[200px] w-[200px] rounded-full bg-white/5" />

      {/* Top: Logo + tagline */}
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="rounded-lg bg-white/20 p-2">
            <Pill className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">PharmERP</span>
        </div>
      </div>

      {/* Center: Illustration + main tagline */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/illustrations/pharmacy.svg"
          alt="Pharmacy illustration"
          className="w-64 h-64 mb-8 drop-shadow-lg"
        />
        <h1 className="text-3xl font-bold text-white leading-tight mb-3">
          {t('auth.brand.tagline')}
        </h1>
        <p className="text-blue-100 text-lg max-w-sm">
          {t('auth.brand.description')}
        </p>
      </div>

      {/* Bottom: Feature callouts */}
      <div className="relative z-10 grid grid-cols-2 gap-3">
        {features.map((f) => (
          <div
            key={f.labelKey}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2"
          >
            <f.icon className="h-4 w-4 text-blue-100" />
            <span className="text-xs font-medium text-blue-50">{t(f.labelKey)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
