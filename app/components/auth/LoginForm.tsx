'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useLoginMutation } from '@/store/api/auth-api-slice';
import { useAuth } from '@/lib/auth/use-auth';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/lib/i18n';
import { motion } from 'motion/react';

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useTranslations();
  const [loginMutation, { isLoading, error }] = useLoginMutation();

  const loginSchema = z.object({
    email: z.string().email(t('auth.login.emailInvalid')),
    password: z.string().min(1, t('auth.login.passwordRequired')),
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await loginMutation(data).unwrap();
      if (result.requiresMfa) {
        router.push('/mfa-verify');
      } else {
        login(result);
        router.push('/dashboard');
      }
    } catch {
      console.error('Login failed');
    }
  };

  return (
    <div className="w-full">
      {/* Mobile logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:hidden mb-6"
      >
        <div className="flex items-center justify-center gap-2">
          <div className="rounded-lg bg-emerald-600 p-2">
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
          </div>
          <span className="text-xl font-bold text-foreground">PharmERP</span>
        </div>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('auth.login.title')}</h1>
        <p className="mt-2 text-muted-foreground text-sm">
          {t('auth.login.subtitle')}
        </p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl"
            >
              <div className="flex-shrink-0 rounded-full bg-red-100 dark:bg-red-500/20 p-1.5">
                <svg className="h-4 w-4 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                {t('auth.login.invalidCredentials')}
              </p>
            </motion.div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-foreground">{t('auth.login.emailLabel')}</label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="email"
                placeholder={t('auth.login.emailPlaceholder')}
                className={cn(
                  'flex h-11 w-full rounded-xl border border-input bg-card text-foreground pl-11 pr-4 py-2 text-sm',
                  'placeholder:text-muted-foreground/60',
                  'focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500',
                  'transition-all duration-200',
                  errors.email && 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                )}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500"
              >
                {errors.email.message}
              </motion.p>
            )}
          </div>

          {/* Password */}
          <PasswordInput
            label={t('auth.login.passwordLabel')}
            placeholder={t('auth.login.passwordPlaceholder')}
            error={errors.password?.message}
            {...register('password')}
          />

          {/* Forgot password */}
          <div className="flex justify-end -mt-1">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
            >
              {t('auth.login.forgotPassword')}
            </Link>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full h-11 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200"
          >
            {t('auth.login.submitButton')}
            {!isLoading && <ArrowRight className="h-4 w-4 ml-1" />}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
