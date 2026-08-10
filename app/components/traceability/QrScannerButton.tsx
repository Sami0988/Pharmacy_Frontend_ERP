'use client';

import { ScanBarcode } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface QrScannerButtonProps {
  onClick: () => void;
}

export function QrScannerButton({ onClick }: QrScannerButtonProps) {
  return (
    <Button
      type="button"
      variant="secondary"
      size="lg"
      onClick={onClick}
      className="flex items-center gap-2"
    >
      <ScanBarcode className="h-5 w-5" />
      Scan QR
    </Button>
  );
}
