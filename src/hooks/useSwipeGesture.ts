/**
 * Swipe Gesture Hook
 * Detects swipe gestures for dismissing dialogs
 */

import { useRef, useCallback } from 'react';

interface SwipeConfig {
  onSwipeDown?: () => void;
  onSwipeUp?: () => void;
  threshold?: number; // pixels to trigger dismiss
  velocityThreshold?: number; // pixels/ms for fast swipe
  enabled?: boolean;
}

interface TouchInfo {
  startY: number;
  startTime: number;
  startX: number;
}

/**
 * Hook to detect and handle swipe gestures
 * 
 * @param config - Swipe configuration
 * @returns Touch event handlers
 * 
 * @example
 * ```tsx
 * const { handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipeGesture({
 *   onSwipeDown: () => onOpenChange(false),
 *   threshold: 100,
 *   velocityThreshold: 0.3
 * });
 * 
 * <div
 *   onTouchStart={handleTouchStart}
 *   onTouchMove={handleTouchMove}
 *   onTouchEnd={handleTouchEnd}
 * >
 *   Content
 * </div>
 * ```
 */
export function useSwipeGesture(config: SwipeConfig) {
  const {
    onSwipeDown,
    onSwipeUp,
    threshold = 100,
    velocityThreshold = 0.5,
    enabled = true
  } = config;

  const touchStart = useRef<TouchInfo | null>(null);
  const currentTranslate = useRef(0);
  const elementRef = useRef<HTMLElement | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enabled) return;

    const touch = e.touches[0];
    touchStart.current = {
      startY: touch.clientY,
      startX: touch.clientX,
      startTime: Date.now()
    };

    elementRef.current = e.currentTarget as HTMLElement;
  }, [enabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!enabled || !touchStart.current || !elementRef.current) return;

    const touch = e.touches[0];
    const deltaY = touch.clientY - touchStart.current.startY;
    const deltaX = touch.clientX - touchStart.current.startX;

    // Check if movement is more vertical than horizontal
    const isVertical = Math.abs(deltaY) > Math.abs(deltaX);
    if (!isVertical) return;

    // Only allow downward swipes for dismiss (or upward if configured)
    const isDownward = deltaY > 0;
    const isUpward = deltaY < 0;

    if ((isDownward && onSwipeDown) || (isUpward && onSwipeUp)) {
      currentTranslate.current = deltaY;
      
      // Apply transform
      const element = elementRef.current;
      element.style.transform = `translateY(${deltaY}px)`;
      
      // Fade backdrop proportionally
      const opacity = Math.max(0, 1 - (Math.abs(deltaY) / 300));
      const dialogElement = element.closest('[role="dialog"]');
      const backdrop = dialogElement?.previousElementSibling as HTMLElement;
      if (backdrop) {
        const isRadixOverlay = backdrop.hasAttribute('data-radix-dialog-overlay');
        const isVaulOverlay = backdrop.hasAttribute('data-vaul-overlay') || backdrop.getAttribute('data-slot') === 'drawer-overlay';
        if (isRadixOverlay || isVaulOverlay) {
          backdrop.style.opacity = opacity.toString();
          // When fully transparent, allow pointer events to pass through so underlying UI is clickable
          // Use a small threshold to avoid flicker from fractional values
          backdrop.style.pointerEvents = opacity <= 0.01 ? 'none' : 'auto';
        }
      }

      // Prevent scrolling when swiping
      if (Math.abs(deltaY) > 10) {
        e.preventDefault();
      }
    }
  }, [enabled, onSwipeDown, onSwipeUp]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!enabled || !touchStart.current || !elementRef.current) return;

    const deltaY = currentTranslate.current;
    const deltaTime = Date.now() - touchStart.current.startTime;
    const velocity = Math.abs(deltaY) / deltaTime;

    const element = elementRef.current;
    
    // Determine if should dismiss
    const isDownward = deltaY > 0;
    const isUpward = deltaY < 0;
    const shouldDismissDown = isDownward && (Math.abs(deltaY) > threshold || velocity > velocityThreshold) && onSwipeDown;
    const shouldDismissUp = isUpward && (Math.abs(deltaY) > threshold || velocity > velocityThreshold) && onSwipeUp;

    if (shouldDismissDown || shouldDismissUp) {
      // Animate to dismiss
      element.style.transition = 'transform 0.3s ease-out';
      element.style.transform = shouldDismissDown ? 'translateY(100%)' : 'translateY(-100%)';
      
      // Fade out backdrop
      const dialogElement = element.closest('[role="dialog"]');
      const backdrop = dialogElement?.previousElementSibling as HTMLElement;
      if (backdrop) {
        const isRadixOverlay = backdrop.hasAttribute('data-radix-dialog-overlay');
        const isVaulOverlay = backdrop.hasAttribute('data-vaul-overlay') || backdrop.getAttribute('data-slot') === 'drawer-overlay';
        if (isRadixOverlay || isVaulOverlay) {
          backdrop.style.transition = 'opacity 0.3s ease-out';
          backdrop.style.opacity = '0';
          // Ensure the overlay stops intercepting pointer events after fade-out begins
          backdrop.style.pointerEvents = 'none';
        }
      }

      // Call callback after animation
      setTimeout(() => {
        if (shouldDismissDown && onSwipeDown) onSwipeDown();
        if (shouldDismissUp && onSwipeUp) onSwipeUp();
      }, 300);
    } else {
      // Animate back to original position
      element.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
      element.style.transform = 'translateY(0)';
      
      // Restore backdrop
      const dialogElement = element.closest('[role="dialog"]');
      const backdrop = dialogElement?.previousElementSibling as HTMLElement;
      if (backdrop) {
        const isRadixOverlay = backdrop.hasAttribute('data-radix-dialog-overlay');
        const isVaulOverlay = backdrop.hasAttribute('data-vaul-overlay') || backdrop.getAttribute('data-slot') === 'drawer-overlay';
        if (isRadixOverlay || isVaulOverlay) {
          backdrop.style.transition = 'opacity 0.3s ease-out';
          backdrop.style.opacity = '1';
          // Make sure it accepts pointer events again while visible
          backdrop.style.pointerEvents = 'auto';
        }
      }
    }

    // Reset state
    touchStart.current = null;
    currentTranslate.current = 0;
    
    // Remove transition after animation completes
    setTimeout(() => {
      if (element) {
        element.style.transition = '';
      }
    }, 300);
  }, [enabled, threshold, velocityThreshold, onSwipeDown, onSwipeUp]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
}
