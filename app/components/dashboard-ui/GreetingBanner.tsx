'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/lib/i18n';

interface GreetingBannerProps {
  title: string;
  statusText: string;
  description: string;
  transactionCount: number;
  compliance: string | number;
  primaryActionHref: string;
  primaryActionLabel: string;
  secondaryActionHref: string;
  secondaryActionLabel: string;
  className?: string;
}

export function GreetingBanner({
  title,
  statusText,
  description,
  transactionCount,
  compliance,
  primaryActionHref,
  primaryActionLabel,
  secondaryActionHref,
  secondaryActionLabel,
  className,
}: GreetingBannerProps) {
  const { t } = useTranslations();
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-cyan-700 via-teal-600 to-slate-900 p-6 text-white shadow-soft',
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_40%)]" />
      <div className="relative grid gap-6 lg:grid-cols-[1.8fr_auto] lg:items-center">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/90 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-sm" />
            {statusText}
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl leading-tight">{title}</h1>
            <p className="max-w-2xl text-sm text-white/80 sm:text-base">{description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex flex-wrap items-center gap-3">
              <Link href={primaryActionHref} className="inline-flex">
                <Button variant="secondary" size="default">{primaryActionLabel}</Button>
              </Link>
              <Link href={secondaryActionHref} className="inline-flex">
                <Button variant="ghost" size="default">{secondaryActionLabel}</Button>
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-white/90">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 shadow-sm">{transactionCount.toLocaleString()} {t('dashboard.transactionsToday')}</div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 shadow-sm">{t('dashboard.compliance')}: {compliance}</div>
            </div>
          </div>
        </div>
        <div className="hidden lg:flex items-center justify-center">
          <div className="aspect-[3/2] w-full max-w-[220px] rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-xl backdrop-blur">
            <div className="flex h-full items-center justify-center text-white/50">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/10 text-5xl">💊</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
