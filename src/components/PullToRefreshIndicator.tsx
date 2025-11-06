import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PullToRefreshIndicatorProps {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  progress: number;
  shouldTriggerRefresh: boolean;
}

export function PullToRefreshIndicator({
  isPulling,
  isRefreshing,
  pullDistance,
  progress,
  shouldTriggerRefresh,
}: PullToRefreshIndicatorProps) {
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    if (isPulling || isRefreshing) {
      setShowIndicator(true);
    } else {
      // Delay hiding to allow exit animation
      const timer = setTimeout(() => setShowIndicator(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isPulling, isRefreshing]);

  if (!showIndicator) return null;

  // Calculate opacity based on pull distance
  const opacity = Math.min(pullDistance / 40, 1);

  // Rotation angle for the icon
  const rotation = shouldTriggerRefresh ? 180 : progress * 1.8;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ 
          opacity: isRefreshing ? 1 : opacity,
          y: isRefreshing ? 0 : -50 + pullDistance * 0.5,
        }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ 
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
        style={{
          paddingTop: '80px', // Account for sticky header
        }}
      >
        <div className="bg-background/80 backdrop-blur-sm rounded-full p-3 shadow-lg border border-border">
          {isRefreshing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <RefreshCw className="size-6 text-primary" />
            </motion.div>
          ) : (
            <motion.div
              animate={{ rotate: rotation }}
              transition={{ type: 'spring', stiffness: 100 }}
            >
              {shouldTriggerRefresh ? (
                <RefreshCw className="size-6 text-primary" />
              ) : (
                <ChevronDown 
                  className="size-6 text-muted-foreground" 
                  style={{ opacity }}
                />
              )}
            </motion.div>
          )}
        </div>

        {/* Progress ring */}
        {!isRefreshing && (
          <svg
            className="absolute top-[80px] left-1/2 -translate-x-1/2"
            width="52"
            height="52"
            style={{ opacity }}
          >
            <circle
              cx="26"
              cy="26"
              r="23"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted-foreground/20"
            />
            <motion.circle
              cx="26"
              cy="26"
              r="23"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 23}
              strokeDashoffset={2 * Math.PI * 23 * (1 - progress / 100)}
              initial={{ strokeDashoffset: 2 * Math.PI * 23 }}
              animate={{ 
                strokeDashoffset: 2 * Math.PI * 23 * (1 - progress / 100),
              }}
              style={{ 
                transform: 'rotate(-90deg)',
                transformOrigin: '50% 50%',
              }}
            />
          </svg>
        )}

        {/* Text hint */}
        <AnimatePresence>
          {isPulling && !isRefreshing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: opacity * 0.8, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-[140px] text-sm text-muted-foreground"
            >
              {shouldTriggerRefresh ? 'Lepas untuk refresh' : 'Tarik untuk refresh'}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
