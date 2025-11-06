import { useState, useEffect, useRef, useCallback } from 'react';
import { useIsMobile } from '../components/ui/use-mobile';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number; // Distance to trigger refresh (pixels)
  maxPullDistance?: number; // Maximum pull distance
  resistance?: number; // Pull resistance (0-1, lower = more resistance)
  enabled?: boolean;
}

interface PullToRefreshState {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  shouldTriggerRefresh: boolean;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  maxPullDistance = 120,
  resistance = 0.5,
  enabled = true,
}: PullToRefreshOptions) {
  const isMobile = useIsMobile();
  const [state, setState] = useState<PullToRefreshState>({
    isPulling: false,
    isRefreshing: false,
    pullDistance: 0,
    shouldTriggerRefresh: false,
  });

  const touchStartY = useRef<number>(0);
  const scrollY = useRef<number>(0);
  const isAtTop = useRef<boolean>(false);

  // Haptic feedback (if available on mobile)
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (window.navigator && 'vibrate' in window.navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
      };
      window.navigator.vibrate(patterns[type]);
    }
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled || !isMobile || state.isRefreshing) return;

    // Check if user is at the top of the page
    scrollY.current = window.scrollY || document.documentElement.scrollTop;
    isAtTop.current = scrollY.current === 0;

    if (isAtTop.current) {
      touchStartY.current = e.touches[0].clientY;
    }
  }, [enabled, isMobile, state.isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || !isMobile || state.isRefreshing || !isAtTop.current) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;

    // Only pull down (positive deltaY) and only when at top
    if (deltaY > 0 && window.scrollY === 0) {
      // Prevent default scroll behavior when pulling
      if (deltaY > 10) {
        e.preventDefault();
      }

      // Apply resistance to make it feel natural
      const resistedDistance = Math.min(
        deltaY * resistance,
        maxPullDistance
      );

      setState(prev => ({
        ...prev,
        isPulling: true,
        pullDistance: resistedDistance,
        shouldTriggerRefresh: resistedDistance >= threshold,
      }));

      // Light haptic when reaching threshold
      if (resistedDistance >= threshold && !state.shouldTriggerRefresh) {
        triggerHaptic('medium');
      }
    }
  }, [enabled, isMobile, state.isRefreshing, state.shouldTriggerRefresh, resistance, maxPullDistance, threshold, triggerHaptic]);

  const handleTouchEnd = useCallback(async () => {
    if (!enabled || !isMobile || state.isRefreshing) return;

    if (state.shouldTriggerRefresh) {
      // Trigger refresh
      setState(prev => ({
        ...prev,
        isRefreshing: true,
        isPulling: false,
      }));

      triggerHaptic('heavy');

      try {
        await onRefresh();
      } catch (error) {
        console.error('Pull to refresh error:', error);
      } finally {
        // Keep indicator visible for minimum duration for UX
        setTimeout(() => {
          setState({
            isPulling: false,
            isRefreshing: false,
            pullDistance: 0,
            shouldTriggerRefresh: false,
          });
        }, 500);
      }
    } else {
      // Reset state
      setState({
        isPulling: false,
        isRefreshing: false,
        pullDistance: 0,
        shouldTriggerRefresh: false,
      });
    }

    touchStartY.current = 0;
    isAtTop.current = false;
  }, [enabled, isMobile, state.isRefreshing, state.shouldTriggerRefresh, onRefresh, triggerHaptic]);

  useEffect(() => {
    if (!enabled || !isMobile) return;

    // Use passive: false to allow preventDefault
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, isMobile, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    ...state,
    // Progress percentage for animation (0-100)
    progress: Math.min((state.pullDistance / threshold) * 100, 100),
  };
}
