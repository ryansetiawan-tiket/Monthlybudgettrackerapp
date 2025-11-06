/**
 * Mobile Back Button Hook
 * Handles Android hardware back button for dialog management
 */

import { useEffect, useRef } from 'react';
import { App } from '@capacitor/app';
import { useDialogStack } from '../contexts/DialogStackContext';
import { triggerHaptic, isCapacitor } from '../utils/capacitor-helpers';
import { toast } from 'sonner';

/**
 * Helper function to close top drawer
 */
async function closeTopDrawer() {
  const drawers = Array.from(document.querySelectorAll('[role="dialog"][data-state="open"]'));
  
  if (drawers.length > 0) {
    // Find drawer contents and their z-indices
    const drawerContents = drawers.map(drawer => {
      const content = drawer.querySelector('[data-slot="drawer-content"]');
      const zIndex = content ? parseInt(window.getComputedStyle(content).zIndex) || 0 : 0;
      return { drawer, zIndex };
    });
    
    // Sort by z-index, highest first
    drawerContents.sort((a, b) => b.zIndex - a.zIndex);
    
    // Close the top-most drawer
    const escapeEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      which: 27,
      bubbles: true,
      cancelable: true
    });
    drawerContents[0].drawer.dispatchEvent(escapeEvent);
    console.log('[BackButton] Drawer closed (z-index:', drawerContents[0].zIndex, ')');
    await triggerHaptic('light').catch(() => {});
    return true;
  }
  return false;
}

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

    // Setup back button listener
    const setupListener = async () => {
      try {
        const handle = await App.addListener('backButton', async () => {
          console.log('[BackButton] Back button pressed');

          // Try to close drawers first
          const drawerCloseResult = await closeTopDrawer();
          if (drawerCloseResult) {
            return; // Successfully closed a drawer
          }

          // Try to close dialogs next
          if (closeTopDialog()) {
            console.log('[BackButton] Dialog closed');
            await triggerHaptic('light').catch(() => {});
            return;
          }

          // If no drawers or dialogs, handle app exit
          const now = Date.now();
          if (now - lastBackPress.current < 2000) {
            console.log('[BackButton] Exiting app (double back press)');
            App.exitApp();
          } else {
            console.log('[BackButton] Showing exit confirmation');
            lastBackPress.current = now;
            toast.info('Tekan sekali lagi untuk keluar', {
              duration: 2000
            });
            await triggerHaptic('light').catch(() => {});
          }
        });

        // Save listener reference
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

    setupListener().catch(error => {
      console.error('[BackButton] Error setting up listener:', error);
    });

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
