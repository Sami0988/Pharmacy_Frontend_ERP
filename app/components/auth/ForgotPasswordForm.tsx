'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { useForgotPasswordMutation } from '@/store/api/auth-api-slice';
import Link from 'next/link';
import { useState } from 'react';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [forgotPassword, { isLoading, error }] = useForgotPasswordMutation();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPassword(data).unwrap();
      toast.success('Reset link sent — check your email');
      setSent(true);
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      toast.error(apiError.data?.message || 'Failed to send reset email');
    }
  };

  if (sent) {
    return (
      <div className="space-y-8 text-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Check Your Email</h1>
        </div>
        <div>
          <p className="text-muted-foreground mb-4">
            If an account exists with that email, we&apos;ve sent a password reset link.
          </p>
          <Link href="/login" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            Return to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Forgot Password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-secondary-foreground">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              placeholder="you@example.com"
              className={cn(
                'flex h-11 w-full rounded-xl border border-input bg-background text-foreground pl-10 pr-3 py-2 text-sm',
                'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                errors.email && 'border-destructive focus:ring-destructive'
              )}
              {...register('email')}
            />
          </div>
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl">
            <p className="text-sm text-destructive">
              Failed to send reset email. Please try again.
            </p>
          </div>
        )}

        <Button type="submit" isLoading={isLoading} className="w-full h-11 rounded-xl text-base">
          Send Reset Link
        </Button>

        <div className="text-center">
          <Link href="/login" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            Back to login
          </Link>
        </div>
      </form>
    </div>
  );
}
