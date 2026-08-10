'use client';

import { FileUploadInput } from '@/components/ui/FileUploadInput';
import { FormField } from '@/components/ui/FormField';

interface InvoiceUploadFieldProps {
  onChange: (file: File | null) => void;
  value?: File | null;
  error?: string;
}

export function InvoiceUploadField({ onChange, value, error }: InvoiceUploadFieldProps) {
  return (
    <FormField label="Invoice Document" required error={error}>
      <p className="text-xs text-muted-foreground mb-2">
        Upload the supplier&apos;s invoice (PDF, JPG, PNG — max 10MB)
      </p>
      <FileUploadInput
        accept=".pdf,.jpg,.jpeg,.png"
        maxSizeMb={10}
        onChange={onChange}
        value={value}
        error={error}
        required
      />
    </FormField>
  );
}
