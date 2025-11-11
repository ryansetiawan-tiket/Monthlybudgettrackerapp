import { useCallback, useRef } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export interface UseLongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  delay?: number;
  enableHaptic?: boolean; // New: enable haptic feedback on long press
}

/**
 * Custom hook for detecting long-press gestures
 * Used for showing action buttons on mobile
 * 
 * Features:
 * - Scroll detection: cancels long press when user scrolls
 * - Haptic feedback: vibrates on long press trigger (mobile only)
 * - Smart click handling: prevents click after long press
 * 
 * @param options - Configuration options
 * @returns Event handlers to spread on element
 * 
 * @example
 * ```tsx
 * const longPress = useLongPress({
 *   onLongPress: () => setShowActions(true),
 *   onClick: () => handleClick(),
 *   delay: 500,
 *   enableHaptic: true
 * });
 * 
 * <div {...longPress}>Content</div>
 * ```
 */
export function useLongPress({ 
  onLongPress, 
  onClick, 
  delay = 500,
  enableHaptic = true 
}: UseLongPressOptions) {
  const timeout = useRef<NodeJS.Timeout>();
  const prevented = useRef(false);
  const startPosition = useRef<{ x: number; y: number } | null>(null);
  const isScrolling = useRef(false);

  // Clear function (non-memoized to avoid circular dependency)
  const clear = () => {
    timeout.current && clearTimeout(timeout.current);
    startPosition.current = null;
  };

  // Trigger haptic feedback (mobile only)
  const triggerHaptic = useCallback(async () => {
    if (!enableHaptic) return;
    
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (error) {
      // Haptics not available (browser/desktop) - silently fail
    }
  }, [enableHaptic]);

  const start = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    prevented.current = false;
    isScrolling.current = false;

    // Record start position for scroll detection
    if ('touches' in e) {
      startPosition.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    } else {
      startPosition.current = {
        x: e.clientX,
        y: e.clientY,
      };
    }

    timeout.current = setTimeout(async () => {
      // Only trigger if not scrolling
      if (!isScrolling.current) {
        prevented.current = true;
        await triggerHaptic(); // Haptic feedback BEFORE callback
        onLongPress();
      }
    }, delay);
  }, [onLongPress, delay, triggerHaptic]);

  // Detect scroll/move to cancel long press
  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!startPosition.current) return;

    let currentX: number;
    let currentY: number;

    if ('touches' in e) {
      currentX = e.touches[0].clientX;
      currentY = e.touches[0].clientY;
    } else {
      currentX = e.clientX;
      currentY = e.clientY;
    }

    // Calculate movement distance
    const deltaX = Math.abs(currentX - startPosition.current.x);
    const deltaY = Math.abs(currentY - startPosition.current.y);

    // If moved more than 10px, consider it scrolling
    if (deltaX > 10 || deltaY > 10) {
      isScrolling.current = true;
      clear(); // Cancel long press
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClick = useCallback(() => {
    if (!prevented.current && onClick) {
      onClick();
    }
  }, [onClick]);

  return {
    onMouseDown: start,
    onTouchStart: start,
    onMouseMove: handleMove,
    onTouchMove: handleMove,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchEnd: clear,
    onTouchCancel: clear, // Handle touch cancel events
    onClick: handleClick,
  };
}