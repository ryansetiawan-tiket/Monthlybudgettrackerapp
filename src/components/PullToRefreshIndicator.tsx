import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, ChevronDown, ArrowDown } from 'lucide-react';
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
  const scale = Math.min(0.7 + (pullDistance / 120) * 0.3, 1);

  // Rotation angle for the icon
  const rotation = shouldTriggerRefresh ? 180 : progress * 1.8;

  return (
    <AnimatePresence>
      {/* Backdrop gradient overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: (isRefreshing ? 0.6 : opacity * 0.4),
        }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed top-0 left-0 right-0 z-[60] h-48 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, hsl(var(--primary) / 0.08), transparent)',
        }}
      />

      {/* Main indicator */}
      <motion.div
        initial={{ opacity: 0, y: -60, scale: 0.8 }}
        animate={{ 
          opacity: isRefreshing ? 1 : opacity,
          y: isRefreshing ? 0 : -60 + pullDistance * 0.6,
          scale: isRefreshing ? 1 : scale,
        }}
        exit={{ opacity: 0, y: -60, scale: 0.8 }}
        transition={{ 
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
        className="fixed top-0 left-0 right-0 z-[60] flex flex-col items-center pointer-events-none"
        style={{
          paddingTop: '120px', // Account for sticky header (44px status bar + 76px content)
        }}
      >
        {/* Icon container with enhanced styling */}
        <motion.div 
          className="relative"
          animate={{
            scale: shouldTriggerRefresh && !isRefreshing ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: 0.3,
            repeat: shouldTriggerRefresh && !isRefreshing ? Infinity : 0,
            repeatType: "reverse",
          }}
        >
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full blur-xl"
            style={{
              background: 'hsl(var(--primary) / 0.3)',
            }}
            animate={{
              opacity: shouldTriggerRefresh ? [0.3, 0.6, 0.3] : 0,
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Main circle */}
          <div className="relative bg-background/95 backdrop-blur-md rounded-full p-4 shadow-2xl border-2 border-primary/20">
            {isRefreshing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                <RefreshCw className="size-7 text-primary" />
              </motion.div>
            ) : (
              <motion.div
                animate={{ rotate: rotation }}
                transition={{ type: 'spring', stiffness: 120, damping: 15 }}
              >
                {shouldTriggerRefresh ? (
                  <RefreshCw className="size-7 text-primary" />
                ) : (
                  <ArrowDown 
                    className="size-7 text-primary/60" 
                    style={{ opacity }}
                  />
                )}
              </motion.div>
            )}
          </div>

          {/* Progress ring */}
          {!isRefreshing && (
            <svg
              className="absolute top-0 left-0"
              width="64"
              height="64"
              style={{ opacity }}
            >
              <circle
                cx="32"
                cy="32"
                r="29"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-primary/10"
              />
              <motion.circle
                cx="32"
                cy="32"
                r="29"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-primary"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 29}
                strokeDashoffset={2 * Math.PI * 29 * (1 - progress / 100)}
                initial={{ strokeDashoffset: 2 * Math.PI * 29 }}
                animate={{ 
                  strokeDashoffset: 2 * Math.PI * 29 * (1 - progress / 100),
                }}
                style={{ 
                  transform: 'rotate(-90deg)',
                  transformOrigin: '50% 50%',
                }}
              />
            </svg>
          )}
        </motion.div>

        {/* Text hint with improved styling */}
        <AnimatePresence>
          {(isPulling || isRefreshing) && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: isRefreshing ? 1 : opacity * 0.9, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="mt-4 px-4 py-2 rounded-full bg-background/90 backdrop-blur-sm border border-border/50 shadow-lg"
            >
              <p className="text-sm font-medium text-foreground">
                {isRefreshing ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block size-1.5 rounded-full bg-primary animate-pulse" />
                    Memperbarui...
                  </span>
                ) : shouldTriggerRefresh ? (
                  '✨ Lepas untuk refresh'
                ) : (
                  '⬇️ Tarik ke bawah'
                )}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wave effect at the bottom */}
        {isPulling && !isRefreshing && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ 
              opacity: opacity * 0.15, 
              scaleY: Math.min(pullDistance / 80, 1),
            }}
            exit={{ opacity: 0, scaleY: 0 }}
            className="absolute top-[130px] left-0 right-0 h-32 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at top, hsl(var(--primary) / 0.15), transparent 70%)',
              transformOrigin: 'top',
            }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}