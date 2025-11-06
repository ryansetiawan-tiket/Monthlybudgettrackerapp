import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface DialogInfo {
  id: string;
  priority: number;
  onClose: () => void;
}

interface DialogStackContextType {
  dialogs: DialogInfo[];
  registerDialog: (dialog: DialogInfo) => void;
  unregisterDialog: (id: string) => void;
  getTopDialog: () => DialogInfo | null;
  closeTopDialog: () => boolean;
}

const DialogStackContext = createContext<DialogStackContextType | null>(null);

export function DialogStackProvider({ children }: { children: ReactNode }) {
  const [dialogs, setDialogs] = useState<DialogInfo[]>([]);

  const registerDialog = useCallback((dialog: DialogInfo) => {
    setDialogs(prev => {
      // Prevent duplicates
      const exists = prev.find(d => d.id === dialog.id);
      if (exists) {
        console.warn(`[DialogStack] Dialog already registered: ${dialog.id}`);
        return prev;
      }
      console.log(`[DialogStack] Registering dialog: ${dialog.id} (priority: ${dialog.priority})`);
      return [...prev, dialog];
    });
  }, []);

  const unregisterDialog = useCallback((id: string) => {
    setDialogs(prev => {
      const exists = prev.find(d => d.id === id);
      if (exists) {
        console.log(`[DialogStack] Unregistering dialog: ${id}`);
      }
      return prev.filter(d => d.id !== id);
    });
  }, []);

  const getTopDialog = useCallback(() => {
    if (dialogs.length === 0) return null;
    
    // Sort by priority (higher = more important, closes first)
    const sorted = [...dialogs].sort((a, b) => b.priority - a.priority);
    
    console.log(`[DialogStack] Top dialog: ${sorted[0].id} (priority: ${sorted[0].priority})`);
    return sorted[0];
  }, [dialogs]);

  const closeTopDialog = useCallback(() => {
    const top = getTopDialog();
    if (top) {
      console.log(`[DialogStack] Closing top dialog: ${top.id}`);
      top.onClose();
      return true;
    }
    console.log(`[DialogStack] No dialogs to close`);
    return false;
  }, [getTopDialog]);

  return (
    <DialogStackContext.Provider value={{
      dialogs,
      registerDialog,
      unregisterDialog,
      getTopDialog,
      closeTopDialog
    }}>
      {children}
    </DialogStackContext.Provider>
  );
}

export function useDialogStack() {
  const context = useContext(DialogStackContext);
  if (!context) {
    throw new Error('useDialogStack must be used within DialogStackProvider');
  }
  return context;
}
