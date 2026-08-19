'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useChangePasswordMutation } from '@/store/api/auth-api-slice';
import { useTranslations } from '@/lib/i18n';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function ChangePasswordCard() {
  const { t } = useTranslations();
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, t('settings.changePassword.currentPasswordRequired')),
    newPassword: z
      .string()
      .min(8, t('settings.changePassword.passwordMinLength'))
      .regex(/[A-Z]/, t('settings.changePassword.passwordUppercase'))
      .regex(/[a-z]/, t('settings.changePassword.passwordLowercase'))
      .regex(/[0-9]/, t('settings.changePassword.passwordNumber')),
    confirmPassword: z.string().min(1, t('settings.changePassword.confirmPasswordRequired')),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: t('settings.changePassword.passwordMismatch'),
    path: ['confirmPassword'],
  });

  type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }).unwrap();
      toast.success(t('settings.changePassword.success'));
      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      toast.error(apiError.data?.message || t('settings.changePassword.failed'));
    }
  };

  const passwordRules = [
    { label: t('settings.changePassword.ruleMinLength'), test: (pw: string) => pw.length >= 8 },
    { label: t('settings.changePassword.ruleUppercase'), test: (pw: string) => /[A-Z]/.test(pw) },
    { label: t('settings.changePassword.ruleLowercase'), test: (pw: string) => /[a-z]/.test(pw) },
    { label: t('settings.changePassword.ruleNumber'), test: (pw: string) => /[0-9]/.test(pw) },
  ];

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">{t('settings.changePassword.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('settings.changePassword.description')}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              {t('settings.changePassword.currentPassword')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type={showCurrent ? 'text' : 'password'}
                className={cn(
                  'flex h-10 w-full rounded-xl border border-input bg-card text-foreground py-2 pl-10 pr-10 text-sm',
                  'placeholder:text-muted-foreground/60',
                  'focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500',
                  'transition-all duration-200',
                  errors.currentPassword && 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                )}
                placeholder={t('settings.changePassword.currentPasswordPlaceholder')}
                {...register('currentPassword')}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors rounded-lg p-0.5 hover:bg-muted"
                tabIndex={-1}
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-xs text-red-500">{errors.currentPassword.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              {t('settings.changePassword.newPassword')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type={showNew ? 'text' : 'password'}
                className={cn(
                  'flex h-10 w-full rounded-xl border border-input bg-card text-foreground py-2 pl-10 pr-10 text-sm',
                  'placeholder:text-muted-foreground/60',
                  'focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500',
                  'transition-all duration-200',
                  errors.newPassword && 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                )}
                placeholder={t('settings.changePassword.newPasswordPlaceholder')}
                {...register('newPassword')}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors rounded-lg p-0.5 hover:bg-muted"
                tabIndex={-1}
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-red-500">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              {t('settings.changePassword.confirmPassword')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type={showConfirm ? 'text' : 'password'}
                className={cn(
                  'flex h-10 w-full rounded-xl border border-input bg-card text-foreground py-2 pl-10 pr-10 text-sm',
                  'placeholder:text-muted-foreground/60',
                  'focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500',
                  'transition-all duration-200',
                  errors.confirmPassword && 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                )}
                placeholder={t('settings.changePassword.confirmPasswordPlaceholder')}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors rounded-lg p-0.5 hover:bg-muted"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="rounded-lg bg-muted/50 p-3 space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">{t('settings.changePassword.requirements')}</p>
            {passwordRules.map((rule, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle
                  className={cn(
                    'h-3.5 w-3.5',
                    'text-muted-foreground/40'
                  )}
                />
                <span className="text-xs text-muted-foreground">{rule.label}</span>
              </div>
            ))}
          </div>

          {success && (
            <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-3">
              <p className="text-sm text-green-600 dark:text-green-400">{t('settings.changePassword.success')}</p>
            </div>
          )}

          <Button type="submit" isLoading={isLoading}>
            <Lock className="h-4 w-4 mr-2" />
            {t('settings.changePassword.submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
