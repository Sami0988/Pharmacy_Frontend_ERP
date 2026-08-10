'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface FileUploadInputProps {
  accept?: string;
  maxSizeMb?: number;
  onChange: (file: File | null) => void;
  value?: File | null;
  error?: string;
  required?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUploadInput({
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSizeMb = 10,
  onChange,
  value,
  error,
  required,
}: FileUploadInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSizeMb * 1024 * 1024) {
      return `File size must be less than ${maxSizeMb}MB`;
    }
    const acceptedTypes = accept.split(',').map((t) => t.trim().toLowerCase());
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    const match = acceptedTypes.some((t) => t === ext || file.type.startsWith(t.replace('.', '')));
    if (!match) {
      return `File type not accepted. Allowed: ${accept}`;
    }
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setValidationError(null);

    if (!file) {
      setPreview(null);
      onChange(null);
      return;
    }

    const err = validateFile(file);
    if (err) {
      setValidationError(err);
      setPreview(null);
      onChange(null);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    onChange(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setValidationError(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const displayError = validationError || error;

  return (
    <div className="space-y-1">
      {value ? (
        <div className="flex items-center gap-3 rounded-md border border-border p-3">
          {preview ? (
            <Image
              src={preview}
              alt="Preview"
              className="h-12 w-12 rounded object-cover"
              width={48}
              height={48}
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded bg-secondary">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{value.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(value.size)}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed p-6',
            'border-input bg-background text-muted-foreground hover:border-primary hover:bg-accent transition-colors',
            displayError && 'border-destructive bg-destructive/10'
          )}
        >
          <Upload className="h-5 w-5" />
          <span className="text-sm">
            Click to upload {accept.replace(/\./g, '').toUpperCase().replace(/,/g, ', ')}
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        required={required}
      />

      {displayError && <p className="text-sm text-destructive">{displayError}</p>}
    </div>
  );
}
