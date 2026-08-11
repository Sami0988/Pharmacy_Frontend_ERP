'use client';

import { FileUploadInput } from '@/components/ui/FileUploadInput';
import { FormField } from '@/components/ui/FormField';
import { useTranslations } from '@/lib/i18n';

interface InvoiceUploadFieldProps {
  onChange: (file: File | null) => void;
  value?: File | null;
  error?: string;
}

export function InvoiceUploadField({ onChange, value, error }: InvoiceUploadFieldProps) {
  const { t } = useTranslations();

  return (
    <FormField label={t('goodsReceipts.invoiceDocument')} required error={error}>
      <p className="text-xs text-muted-foreground mb-2">
        {t('goodsReceipts.invoiceDescription')}
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
