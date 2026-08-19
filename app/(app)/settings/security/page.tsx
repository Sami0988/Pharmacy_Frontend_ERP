'use client';

import { motion } from 'motion/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { MfaSetupCard } from '@/components/auth/MfaSetupCard';
import { ActiveSessionsCard } from '@/components/auth/ActiveSessionsCard';
import { LoginHistoryCard } from '@/components/auth/LoginHistoryCard';
import { ProfileSettingsCard } from '@/components/auth/ProfileSettingsCard';
import { ChangePasswordCard } from '@/components/auth/ChangePasswordCard';
import { useTranslations } from '@/lib/i18n';

export default function SecurityPage() {
  const { t } = useTranslations();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-foreground">{t('settings.title')}</h1>
        <p className="text-muted-foreground">{t('settings.description')}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Tabs defaultValue="security">
          <TabsList>
            <TabsTrigger value="security">{t('settings.security')}</TabsTrigger>
            <TabsTrigger value="profile">{t('settings.profile')}</TabsTrigger>
          </TabsList>

          <TabsContent value="security" className="space-y-6 mt-6">
            <ChangePasswordCard />
            <MfaSetupCard />
            <ActiveSessionsCard />
            <LoginHistoryCard />
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <ProfileSettingsCard />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
