'use client';

import { ScanBarcode } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTranslations } from '@/lib/i18n';

interface QrScannerButtonProps {
  onClick: () => void;
}

export function QrScannerButton({ onClick }: QrScannerButtonProps) {
  const { t } = useTranslations();

  return (
    <Button
      type="button"
      variant="secondary"
      size="lg"
      onClick={onClick}
      className="flex items-center gap-2"
    >
      <ScanBarcode className="h-5 w-5" />
      {t('traceability.scanQr')}
    </Button>
  );
}
