/**
 * Mobile Back Button Hook
 * Handles Android hardware back button for dialog management
 */

import { useEffect, useRef } from 'react';
import { App } from '@capacitor/app';
import { useDialogStack } from '../contexts/DialogStackContext';
import { triggerHaptic, isCapacitor } from '../utils/capacitor-helpers';

/**
 * Hook to handle Android hardware back button
 * 
 * Behavior:
 * - If dialogs are open: Closes topmost dialog by priority
 * - If no dialogs: Shows exit confirmation toast
 * - If back pressed twice within 2 seconds: Exits app
 * 
 * Usage:
 * Call this hook once in App.tsx (top level)
 */
export function useMobileBackButton() {
  const { closeTopDialog } = useDialogStack();
  const lastBackPress = useRef(0);
  const listenerHandleRef = useRef<any>(null);

  useEffect(() => {
    // Only setup on Capacitor (native)
    if (!isCapacitor()) {
      console.log('[BackButton] Not in Capacitor, skipping setup');
      return;
    }

    console.log('[BackButton] Setting up hardware back button handler');

    let isMounted = true;

    // Setup listener (async)
    const setupListener = async () => {
      try {
        const handle = await App.addListener('backButton', async (event) => {
          console.log('[BackButton] Back button pressed', event);

          // Try to close dialog first
          let dialogClosed = false;
          try {
            dialogClosed = closeTopDialog();
          } catch (error) {
            console.warn('[BackButton] Error closing dialog:', error);
            dialogClosed = false;
          }
          
          if (dialogClosed) {
            console.log('[BackButton] Dialog closed');
            await triggerHaptic('light').catch(() => {});
            return;
          }

          // No dialogs open - handle app exit
          const now = Date.now();
          const timeSinceLastBack = now - lastBackPress.current;

          if (timeSinceLastBack < 2000) {
            // Double back press within 2 seconds - exit app
            console.log('[BackButton] Exiting app (double back press)');
            App.exitApp();
          } else {
            // First back press - show toast
            console.log('[BackButton] Showing exit confirmation');
            lastBackPress.current = now;
            
            // Show toast: "Press back again to exit"
            const { toast } = await import('sonner@2.0.3');
            toast.info('Tekan sekali lagi untuk keluar', {
              duration: 2000
            });
            await triggerHaptic('light').catch(() => {});
          }
        });
        
        // Only store if still mounted
        if (isMounted) {
          listenerHandleRef.current = handle;
          console.log('[BackButton] Listener setup complete');
        } else {
          // Component unmounted during setup, clean up immediately
          console.log('[BackButton] Component unmounted during setup, cleaning up');
          if (handle && typeof handle.remove === 'function') {
            await handle.remove().catch(() => {});
          }
        }
      } catch (error) {
        console.error('[BackButton] Error setting up listener:', error);
      }
    };

    setupListener();

    return () => {
      console.log('[BackButton] Cleaning up back button handler');
      isMounted = false;
      
      const handle = listenerHandleRef.current;
      if (handle && typeof handle.remove === 'function') {
        // Call remove (which returns a Promise) but don't await in cleanup
        handle.remove().catch((error: any) => {
          console.warn('[BackButton] Error removing listener:', error);
        });
      }
      listenerHandleRef.current = null;
    };
  }, [closeTopDialog]);
}
