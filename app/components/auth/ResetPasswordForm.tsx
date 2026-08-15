'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useResetPasswordMutation } from '@/store/api/auth-api-slice';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { PasswordInput } from '@/components/auth/PasswordInput';

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [resetPassword, { isLoading, error }] = useResetPasswordMutation();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;
    try {
      await resetPassword({ token, password: data.password }).unwrap();
      toast.success('Password reset successfully');
      setSuccess(true);
    } catch (err: unknown) {
      const apiError = err as { status?: number; data?: { message?: string } };
      if (apiError.status && apiError.status >= 500) {
        toast.error('An unexpected error occurred. Please try again.');
        return;
      }
      toast.error(apiError.data?.message || 'Failed to reset password');
    }
  };

  if (!token) {
    return (
      <div className="space-y-8 text-center">
        <p className="text-destructive">Invalid or expired reset link</p>
        <Link href="/forgot-password" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
          Request a new reset link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-8 text-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Password Reset</h1>
        </div>
        <div>
          <p className="text-muted-foreground mb-4">Your password has been reset successfully.</p>
          <Link href="/login" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            Sign in with your new password
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
        <p className="mt-1 text-sm text-muted-foreground">Enter your new password</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <PasswordInput
          label="New Password"
          placeholder="Enter new password"
          error={errors.password?.message}
          {...register('password')}
        />

        <PasswordInput
          label="Confirm Password"
          placeholder="Confirm new password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl">
            <p className="text-sm text-destructive">
              Failed to reset password. The link may have expired.
            </p>
          </div>
        )}

        <Button type="submit" isLoading={isLoading} className="w-full h-11 rounded-xl text-base">
          Reset Password
        </Button>
      </form>
    </div>
  );
}
