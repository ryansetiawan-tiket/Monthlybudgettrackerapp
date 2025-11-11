import { useCallback, useRef } from 'react';

export interface UseLongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  delay?: number;
}

/**
 * Custom hook for detecting long-press gestures
 * Used for showing action buttons on mobile
 * 
 * @param options - Configuration options
 * @returns Event handlers to spread on element
 * 
 * @example
 * ```tsx
 * const longPress = useLongPress({
 *   onLongPress: () => setShowActions(true),
 *   onClick: () => handleClick(),
 *   delay: 500
 * });
 * 
 * <div {...longPress}>Content</div>
 * ```
 */
export function useLongPress({ onLongPress, onClick, delay = 500 }: UseLongPressOptions) {
  const timeout = useRef<NodeJS.Timeout>();
  const prevented = useRef(false);

  const start = useCallback(() => {
    prevented.current = false;
    timeout.current = setTimeout(() => {
      prevented.current = true;
      onLongPress();
    }, delay);
  }, [onLongPress, delay]);

  const clear = useCallback(() => {
    timeout.current && clearTimeout(timeout.current);
  }, []);

  const handleClick = useCallback(() => {
    if (!prevented.current && onClick) {
      onClick();
    }
  }, [onClick]);

  return {
    onMouseDown: start,
    onTouchStart: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchEnd: clear,
    onClick: handleClick,
  };
}
