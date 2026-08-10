'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useLoginMutation } from '@/store/api/auth-api-slice';
import { useAuth } from '@/lib/auth/use-auth';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { Mail } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [loginMutation, { isLoading, error }] = useLoginMutation();

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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sign in to your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your credentials to access the dashboard
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
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

        {/* Password */}
        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          error={errors.password?.message}
          {...register('password')}
        />

        {/* Forgot password link — right-aligned under password */}
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Forgot your password?
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl">
            <p className="text-sm text-destructive">
              Invalid email or password
            </p>
          </div>
        )}

        {/* Submit */}
        <Button type="submit" isLoading={isLoading} className="w-full h-11 rounded-xl text-base">
          Sign In
        </Button>
      </form>
    </div>
  );
}
