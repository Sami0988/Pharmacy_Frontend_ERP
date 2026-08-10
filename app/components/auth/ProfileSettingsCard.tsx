'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Upload, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar';
import { useAuth } from '@/lib/auth/use-auth';
import { useUpdateNameMutation, useUploadProfileImageMutation } from '@/store/api/auth-api-slice';
import { toast } from 'sonner';

const nameSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

type NameFormData = z.infer<typeof nameSchema>;

export function ProfileSettingsCard() {
  const { user, refetch } = useAuth();
  const [updateName, { isLoading: isUpdatingName }] = useUpdateNameMutation();
  const [uploadImage, { isLoading: isUploadingImage }] = useUploadProfileImageMutation();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NameFormData>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: user?.name ?? '' },
  });

  const onNameSubmit = async (data: NameFormData) => {
    try {
      await updateName({ name: data.name }).unwrap();
      refetch();
      toast.success('Name updated successfully');
    } catch {
      toast.error('Failed to update name');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, WebP, and GIF images are allowed');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) return;

    const formData = new FormData();
    formData.append('file', fileInputRef.current.files[0]);

    try {
      await uploadImage(formData).unwrap();
      refetch();
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.success('Profile image updated');
    } catch {
      toast.error('Failed to upload image');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Display Name Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Display Name</h2>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onNameSubmit)} className="space-y-4">
            <Input
              label="Display Name"
              placeholder="Enter your name"
              error={errors.name?.message}
              {...register('name')}
            />
            <Button type="submit" isLoading={isUpdatingName}>
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Profile Image Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Profile Image</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              {previewUrl ? (
                <AvatarImage src={previewUrl} alt="Preview" />
              ) : user?.profileImageUrl ? (
                <AvatarImage src={user.profileImageUrl} alt={user.name} />
              ) : (
                <AvatarFallback className="text-lg">
                  {user?.name ? getInitials(user.name) : '?'}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Accepted formats: JPEG, PNG, WebP, GIF (max 5MB)
              </p>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Image
                </Button>
                {previewUrl && (
                  <Button
                    type="button"
                    onClick={handleImageUpload}
                    isLoading={isUploadingImage}
                  >
                    Upload
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
