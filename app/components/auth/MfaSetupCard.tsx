'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import {
  useSetupMfaQuery,
  useEnableMfaMutation,
  useDisableMfaMutation,
  useRegenerateBackupCodesMutation,
} from '@/store/api/auth-api-slice';
import { useAuth } from '@/lib/auth/use-auth';
import { useTranslations } from '@/lib/i18n';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Copy, Check, Shield, ShieldOff } from 'lucide-react';

const enableMfaSchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Code must contain only numbers'),
});

const disableMfaSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  code: z.string().min(1, 'Code is required'),
});

type EnableMfaFormData = z.infer<typeof enableMfaSchema>;
type DisableMfaFormData = z.infer<typeof disableMfaSchema>;

export function MfaSetupCard() {
  const { user, refetch } = useAuth();
  const { t } = useTranslations();
  const [showSetup, setShowSetup] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<() => void>(() => {});

  const { data: mfaSetup, isLoading: isSetupLoading } = useSetupMfaQuery(undefined, {
    skip: !showSetup,
  });

  const [enableMfa, { isLoading: isEnabling }] = useEnableMfaMutation();
  const [disableMfa, { isLoading: isDisabling }] = useDisableMfaMutation();
  const [regenerateBackupCodes, { isLoading: isRegenerating }] =
    useRegenerateBackupCodesMutation();

  const {
    register: registerEnable,
    handleSubmit: handleSubmitEnable,
    formState: { errors: enableErrors },
  } = useForm<EnableMfaFormData>({
    resolver: zodResolver(enableMfaSchema),
  });

  const {
    register: registerDisable,
    handleSubmit: handleSubmitDisable,
    formState: { errors: disableErrors },
  } = useForm<DisableMfaFormData>({
    resolver: zodResolver(disableMfaSchema),
  });

  const onEnable = async (data: EnableMfaFormData) => {
    try {
      const result = await enableMfa({ code: data.code }).unwrap();
      setBackupCodes(result.backupCodes);
      setShowSetup(false);
      refetch();
    } catch {
      toast.error(t('settings.mfa.invalidCode'));
    }
  };

  const onDisable = async (data: DisableMfaFormData) => {
    try {
      await disableMfa({ password: data.password, code: data.code }).unwrap();
      setShowDisable(false);
      refetch();
    } catch {
      toast.error(t('settings.mfa.invalidCredentials'));
    }
  };

  const handleRegenerateBackupCodes = async () => {
    const doRegenerate = async () => {
      try {
        const result = await regenerateBackupCodes().unwrap();
        setBackupCodes(result.backupCodes);
      } catch {
        toast.error(t('settings.mfa.regenerateFailed'));
      }
    };
    setPendingAction(() => doRegenerate);
    setConfirmOpen(true);
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (backupCodes.length > 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold">{t('settings.mfa.backupCodesTitle')}</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium">
              {t('settings.mfa.backupCodesWarning')}
            </p>
          </div>

          <div className="bg-background p-4 rounded-lg font-mono text-sm">
            {backupCodes.map((code, i) => (
              <div key={i} className="py-1">{code}</div>
            ))}
          </div>

          <Button variant="secondary" onClick={copyBackupCodes}>
            {copied ? (
              <><Check className="h-4 w-4 mr-2" /> {t('settings.mfa.copied')}</>
            ) : (
              <><Copy className="h-4 w-4 mr-2" /> {t('settings.mfa.copyToClipboard')}</>
            )}
          </Button>

          <Button onClick={() => setBackupCodes([])} className="w-full">
            {t('settings.mfa.savedBackupCodes')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showSetup && mfaSetup) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">{t('settings.mfa.setupTitle')}</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('settings.mfa.setupDescription')}
          </p>

          <div className="flex justify-center">
           <Image
               src={mfaSetup.qrCodeUrl}
               alt="MFA QR Code"
               className="w-48 h-48"
               width={192}
               height={192}
             />
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">{t('settings.mfa.manualEntryKey')}</p>
            <code className="text-sm bg-secondary px-2 py-1 rounded">
              {mfaSetup.manualEntryKey}
            </code>
          </div>

          <form onSubmit={handleSubmitEnable(onEnable)} className="space-y-4">
            <Input
              label={t('settings.mfa.enterCode')}
              type="text"
              placeholder="000000"
              maxLength={6}
              error={enableErrors.code?.message}
              {...registerEnable('code')}
            />

            <div className="flex gap-2">
              <Button type="submit" isLoading={isEnabling} className="flex-1">
                {t('settings.mfa.verifyAndEnable')}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowSetup(false)}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (showDisable) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldOff className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold">{t('settings.mfa.disableTitle')}</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('settings.mfa.disableDescription')}
          </p>

          <form onSubmit={handleSubmitDisable(onDisable)} className="space-y-4">
            <Input
              label={t('settings.mfa.password')}
              type="password"
              placeholder={t('settings.mfa.enterPassword')}
              error={disableErrors.password?.message}
              {...registerDisable('password')}
            />

            <Input
              label={t('settings.mfa.authCode')}
              type="text"
              placeholder="000000"
              maxLength={6}
              error={disableErrors.code?.message}
              {...registerDisable('code')}
            />

            <div className="flex gap-2">
              <Button
                type="submit"
                variant="danger"
                isLoading={isDisabling}
                className="flex-1"
              >
                {t('settings.mfa.disableMfa')}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowDisable(false)}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">{t('settings.mfa.title')}</h2>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {user?.mfaEnabled ? (
          <>
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-800">{t('settings.mfa.enabled')}</span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="danger"
                onClick={() => setShowDisable(true)}
              >
                {t('settings.mfa.disableMfa')}
              </Button>
              <Button
                variant="secondary"
                onClick={handleRegenerateBackupCodes}
                isLoading={isRegenerating}
              >
                {t('settings.mfa.regenerateBackupCodes')}
              </Button>
            </div>
          </>
        ) : (
          <>
          <p className="text-sm text-muted-foreground">
              {t('settings.mfa.description')}
            </p>
            <Button
              onClick={() => setShowSetup(true)}
              isLoading={isSetupLoading}
            >
              {t('settings.mfa.enableMfa')}
            </Button>
          </>
        )}
      </CardContent>
    </Card>

    <ConfirmDialog
      open={confirmOpen}
      onConfirm={() => { pendingAction(); setConfirmOpen(false); }}
      onCancel={() => setConfirmOpen(false)}
      title={t('settings.mfa.regenerateTitle')}
      description={t('settings.mfa.regenerateDescription')}
      variant="danger"
    />
    </>
  );
}
