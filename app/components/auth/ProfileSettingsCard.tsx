'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, User, Save } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/lib/auth/use-auth';
import { useUpdateNameMutation, useUploadProfileImageMutation } from '@/store/api/auth-api-slice';
import { useTranslations } from '@/lib/i18n';
import { toast } from 'sonner';
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function ProfileSettingsCard() {
  const { user, refetch } = useAuth();
  const { t } = useTranslations();
  const [updateName, { isLoading: isUpdating }] = useUpdateNameMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadProfileImageMutation();
  const [displayName, setDisplayName] = useState(user?.name ?? '');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error('Please enter a display name');
      return;
    }
    try {
      await updateName({ name: displayName.trim() }).unwrap();
      await refetch();
      toast.success(t('settings.nameUpdated'));
    } catch {
      toast.error(t('settings.nameUpdateFailed'));
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error(t('settings.invalidFileType'));
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error(t('settings.fileTooLarge'));
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      await uploadImage(formData).unwrap();
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      await refetch();
      toast.success(t('settings.imageUploaded'));
    } catch {
      toast.error(t('settings.imageUploadFailed'));
    }
  };

  const imageSrc = previewUrl || user?.profileImageUrl || undefined;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">{t('settings.profile')}</h2>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={user?.name || 'Profile'}
                className="h-20 w-20 rounded-full object-cover"
                width={80}
                height={80}
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                <User className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
            <Button
              variant="secondary"
              size="sm"
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Camera className="h-4 w-4" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
          <div>
            <p className="font-medium">{user?.email}</p>
            <p className="text-sm text-muted-foreground">{user?.role}</p>
            <p className="text-xs text-muted-foreground">
              {t('settings.maxFileSize')} · {t('settings.acceptedFormats')}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label={t('settings.displayName')}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={t('settings.enterName')}
          />
          <Button
            onClick={handleSave}
            isLoading={isUpdating || isUploading}
          >
            <Save className="h-4 w-4 mr-2" />
            {t('settings.saveChanges')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
