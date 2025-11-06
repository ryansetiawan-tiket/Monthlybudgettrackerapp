/**
 * Capacitor Helper Utilities
 * Provides utilities for Capacitor native features with graceful degradation
 */

import { Haptics, ImpactStyle } from '@capacitor/haptics';

/**
 * Trigger haptic feedback (vibration)
 * Only works on native (Capacitor)
 * 
 * @param style - Haptic intensity: 'light', 'medium', or 'heavy'
 */
export async function triggerHaptic(
  style: 'light' | 'medium' | 'heavy' = 'light'
): Promise<void> {
  if (!isCapacitor()) {
    console.log(`[Haptics] Not in Capacitor, skipping haptic: ${style}`);
    return;
  }

  try {
    const styleMap = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy
    };

    await Haptics.impact({ style: styleMap[style] });
    console.log(`[Haptics] Triggered: ${style}`);
  } catch (error) {
    console.warn('[Haptics] Not available:', error);
  }
}

/**
 * Check if running in Capacitor (native)
 * 
 * @returns true if Capacitor is available
 */
export function isCapacitor(): boolean {
  return typeof window !== 'undefined' && !!window.Capacitor;
}

/**
 * Check current platform
 * 
 * @param platform - Platform to check: 'ios', 'android', or 'web'
 * @returns true if running on specified platform
 */
export function isPlatform(platform: 'ios' | 'android' | 'web'): boolean {
  if (!isCapacitor()) return platform === 'web';
  
  const currentPlatform = window.Capacitor.getPlatform();
  return currentPlatform === platform;
}

/**
 * Get safe area insets for notch/status bar
 * Useful for padding adjustments on devices with notches
 * 
 * @returns Safe area insets in pixels
 */
export function getSafeAreaInsets() {
  if (typeof window === 'undefined' || !isCapacitor()) {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }

  // Use CSS env() variables
  const style = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0')
  };
}

/**
 * Log platform information (for debugging)
 */
export function logPlatformInfo(): void {
  console.log('[Platform] Is Capacitor:', isCapacitor());
  
  if (isCapacitor()) {
    console.log('[Platform] Platform:', window.Capacitor.getPlatform());
    console.log('[Platform] Native:', window.Capacitor.isNativePlatform());
    console.log('[Platform] Safe Area Insets:', getSafeAreaInsets());
  } else {
    console.log('[Platform] Running in browser');
  }
}
