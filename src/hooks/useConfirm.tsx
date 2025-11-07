import { useState, useCallback } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<ConfirmOptions>({
    title: '',
  });
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    setConfig(options);
    setIsOpen(true);
    
    return new Promise<boolean>((resolve) => {
      setResolvePromise(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    setIsLoading(true);
    if (resolvePromise) {
      resolvePromise(true);
    }
    setIsLoading(false);
    setIsOpen(false);
  }, [resolvePromise]);

  const handleCancel = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(false);
    }
    setIsOpen(false);
  }, [resolvePromise]);

  const ConfirmDialogComponent = useCallback(() => (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleCancel();
      }}
      title={config.title}
      description={config.description}
      confirmText={config.confirmText}
      cancelText={config.cancelText}
      variant={config.variant}
      onConfirm={handleConfirm}
      isLoading={isLoading}
    />
  ), [isOpen, config, handleConfirm, handleCancel, isLoading]);

  return {
    confirm,
    ConfirmDialog: ConfirmDialogComponent,
  };
}
