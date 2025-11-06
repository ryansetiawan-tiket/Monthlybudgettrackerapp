/**
 * Dialog Registration Hook
 * Automatically registers/unregisters dialogs to the stack based on open state
 */

import { useEffect, useRef, useCallback } from 'react';
import { useDialogStack } from '../contexts/DialogStackContext';
import { triggerHaptic, isCapacitor } from '../utils/capacitor-helpers';

/**
 * Hook to register dialog to stack for back button handling
 * Automatically registers/unregisters based on open state
 * 
 * @param isOpen - Current open state
 * @param onOpenChange - Callback to change open state
 * @param priority - Dialog priority (higher = closes first)
 * @param dialogId - Unique dialog ID (optional, auto-generated if not provided)
 * @returns The dialog's unique ID
 * 
 * @example
 * ```tsx
 * function MyDialog({ isOpen, onOpenChange }) {
 *   useDialogRegistration(isOpen, onOpenChange, DialogPriority.MEDIUM, 'my-dialog');
 *   return <Dialog open={isOpen} onOpenChange={onOpenChange}>...</Dialog>
 * }
 * ```
 */
export function useDialogRegistration(
  isOpen: boolean,
  onOpenChange: (open: boolean) => void,
  priority: number = 5,
  dialogId?: string
): string {
  const { registerDialog, unregisterDialog } = useDialogStack();
  const idRef = useRef(dialogId || `dialog-${Math.random().toString(36).substr(2, 9)}`);
  const id = idRef.current;
  
  // Track if component is mounted
  const isMountedRef = useRef(true);
  
  // Store onOpenChange in ref to avoid dependency issues
  const onOpenChangeRef = useRef(onOpenChange);
  
  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      console.log(`[DialogRegistration] Registering dialog: ${id} (priority: ${priority})`);
      
      registerDialog({
        id,
        priority,
        onClose: () => {
          // Only call if component is still mounted
          if (!isMountedRef.current) {
            console.log(`[DialogRegistration] Dialog ${id} already unmounted, skipping close`);
            return;
          }
          
          console.log(`[DialogRegistration] Closing dialog via back button: ${id}`);
          
          try {
            onOpenChangeRef.current(false);
          } catch (error) {
            console.warn(`[DialogRegistration] Error closing dialog ${id}:`, error);
          }
          
          // Haptic feedback on close (only on native)
          if (isCapacitor()) {
            triggerHaptic('light').catch(err => console.warn('[DialogRegistration] Haptic failed:', err));
          }
        }
      });

      // Haptic feedback on open (only on native)
      if (isCapacitor()) {
        triggerHaptic('light').catch(err => console.warn('[DialogRegistration] Haptic failed:', err));
      }

      return () => {
        console.log(`[DialogRegistration] Unregistering dialog: ${id}`);
        unregisterDialog(id);
      };
    }
  }, [isOpen, id, priority, registerDialog, unregisterDialog]);

  return id;
}
