'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Camera, AlertCircle, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTranslations } from '@/lib/i18n';

interface QrScannerModalProps {
  open: boolean;
  onClose: () => void;
}

type ScannerState = 'loading' | 'ready' | 'permission_denied' | 'error';

export function QrScannerModal({ open, onClose }: QrScannerModalProps) {
  const { t } = useTranslations();
  const router = useRouter();
  const scannerRef = useRef<HTMLDivElement>(null);
  const scannerInstanceRef = useRef<unknown>(null);
  const [state, setState] = useState<ScannerState>('loading');
  const [manualBatchNo, setManualBatchNo] = useState('');
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');

        if (cancelled || !scannerRef.current) return;

        const scanner = new Html5Qrcode('qr-scanner-region');
        scannerInstanceRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText: string) => {
            if (cancelled) return;
            const batchId = decodedText.trim();
            scanner.stop().catch(() => {});
            onClose();
            router.push(`/traceability/${batchId}`);
          },
          () => {},
        );

        if (!cancelled) setState('ready');
      } catch (err: unknown) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes('Permission') || message.includes('permission') || message.includes('NotAllowedError')) {
          setState('permission_denied');
        } else {
          setState('error');
        }
      }
    };

    startScanner();

    return () => {
      cancelled = true;
      if (scannerInstanceRef.current) {
        const s = scannerInstanceRef.current as { stop: () => Promise<void>; clear: () => void };
        s.stop().catch(() => {});
        s.clear();
        scannerInstanceRef.current = null;
      }
    };
  }, [open, onClose, router]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-lg font-semibold text-foreground">{t('traceability.scanTitle')}</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-md hover:bg-accent">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-4">
          {state === 'loading' && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Camera className="h-8 w-8 mb-3 animate-pulse" />
              <p>{t('traceability.startingCamera')}</p>
            </div>
          )}

          {state === 'permission_denied' && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">{t('traceability.cameraAccessNeeded')}</p>
              <p className="text-sm text-muted-foreground mb-4">{t('traceability.cameraAccessHint')}</p>
              <Button variant="secondary" onClick={() => setShowManual(true)}>
                <Keyboard className="h-4 w-4 mr-2" />
                {t('traceability.typeInstead')}
              </Button>
            </div>
          )}

          {state === 'error' && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-10 w-10 text-amber-500 mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">{t('traceability.cameraNotAvailable')}</p>
              <p className="text-sm text-muted-foreground mb-4">{t('traceability.cameraNotAvailableHint')}</p>
              <Button variant="secondary" onClick={() => setShowManual(true)}>
                <Keyboard className="h-4 w-4 mr-2" />
                {t('traceability.typeInstead')}
              </Button>
            </div>
          )}

          {state === 'ready' && !showManual && (
            <div className="relative">
              <div id="qr-scanner-region" ref={scannerRef} className="rounded-lg overflow-hidden" />
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-56 h-56 border-2 border-white/80 rounded-lg" />
              </div>
            </div>
          )}

          {showManual && (
            <div className="py-4">
              <label className="block text-sm font-medium text-secondary-foreground mb-2">{t('traceability.batchNumber')}</label>
              <input
                type="text"
                value={manualBatchNo}
                onChange={(e) => setManualBatchNo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && manualBatchNo.trim()) {
                    onClose();
                    router.push(`/traceability/${manualBatchNo.trim()}`);
                  }
                }}
                placeholder={t('traceability.batchNumberPlaceholder')}
                className="flex h-12 w-full rounded-md border border-input bg-card px-3 py-2 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                autoFocus
              />
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t bg-background flex justify-between">
          {!showManual && state === 'ready' && (
            <Button variant="ghost" onClick={() => setShowManual(true)}>
              <Keyboard className="h-4 w-4 mr-2" />
              {t('traceability.enterManually')}
            </Button>
          )}
          {showManual && (
            <Button variant="ghost" onClick={() => { setShowManual(false); setState('loading'); }}>
              <Camera className="h-4 w-4 mr-2" />
              {t('traceability.tryCameraAgain')}
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => {
              if (showManual && manualBatchNo.trim()) {
                onClose();
                router.push(`/traceability/${manualBatchNo.trim()}`);
              } else {
                onClose();
              }
            }}
          >
            {showManual && manualBatchNo.trim() ? t('traceability.goToBatch') : t('common.cancel')}
          </Button>
        </div>
      </div>
    </div>
  );
}
