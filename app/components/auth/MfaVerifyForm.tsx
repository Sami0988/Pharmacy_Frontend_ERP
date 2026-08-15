'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { useVerifyMfaMutation } from '@/store/api/auth-api-slice';
import { useAuth } from '@/lib/auth/use-auth';
import { OtpInput } from '@/components/auth/OtpInput';

const mfaSchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Code must contain only numbers'),
});

type MfaFormData = z.infer<typeof mfaSchema>;

export function MfaVerifyForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [verifyMfa, { isLoading, error }] = useVerifyMfaMutation();
  const [code, setCode] = useState('');

  const {
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<MfaFormData>({
    resolver: zodResolver(mfaSchema),
    defaultValues: { code: '' },
  });

  const handleCodeChange = useCallback(
    (value: string) => {
      setCode(value);
      setValue('code', value, { shouldValidate: value.length === 6 });
    },
    [setValue]
  );

  const onSubmit = async () => {
    if (code.length !== 6) return;
    try {
      const result = await verifyMfa({ code }).unwrap();
      login(result);
      toast.success('MFA verified successfully');
      router.push('/dashboard');
    } catch (err: unknown) {
      const apiError = err as { status?: number; data?: { message?: string } };
      if (apiError.status && apiError.status >= 500) {
        toast.error('An unexpected error occurred. Please try again.');
        return;
      }
      toast.error(apiError.data?.message || 'MFA verification failed');
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Two-Factor Authentication</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <OtpInput
          value={code}
          onChange={handleCodeChange}
          error={errors.code?.message}
          disabled={isLoading}
        />

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl">
            <p className="text-sm text-destructive text-center">
              Invalid code. Please try again.
            </p>
          </div>
        )}

        <Button type="submit" isLoading={isLoading} className="w-full h-11 rounded-xl text-base">
          Verify Code
        </Button>
      </form>
    </div>
  );
}
