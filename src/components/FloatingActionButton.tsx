import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { Plus, Minus, Wallet, ChevronRight } from 'lucide-react';
import { cn } from './ui/utils';

interface FloatingActionButtonProps {
  onAddExpense: () => void;
  onAddIncome: () => void;
  onToggleSummary: () => void;
  className?: string;
}

// Debounce utility for scroll listener
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// Custom hook for scroll detection
function useScrollDetection() {
  const [isScrolling, setIsScrolling] = useState(false);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      
      // Clear previous timeout
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      
      // Set idle timeout - DELAY kemunculan FAB (800ms mobile, 1200ms desktop)
      const isMobile = window.innerWidth < 768;
      const idleDelay = isMobile ? 800 : 1200; // Increased delay!
      
      idleTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, idleDelay);
    };
    
    // Debounced scroll handler (16ms = 60fps)
    const debouncedScroll = debounce(handleScroll, 16);
    
    window.addEventListener('scroll', debouncedScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', debouncedScroll);
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, []);
  
  return isScrolling;
}

export function FloatingActionButton({
  onAddExpense,
  onAddIncome,
  onToggleSummary,
  className
}: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isManuallyHidden, setIsManuallyHidden] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [fabSide, setFabSide] = useState<'left' | 'right'>(() => {
    // Load saved preference from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fab-side');
      return (saved === 'left' || saved === 'right') ? saved : 'right';
    }
    return 'right';
  });
  const [isDragging, setIsDragging] = useState(false);
  const isScrolling = useScrollDetection();
  
  // Save FAB side preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('fab-side', fabSide);
  }, [fabSide]);

  // Determine visibility state
  const shouldHide = useMemo(() => {
    if (isManuallyHidden) return 'manual';
    if (isScrolling) return 'auto';
    return false;
  }, [isManuallyHidden, isScrolling]);

  // Auto-collapse when hiding
  useEffect(() => {
    if (shouldHide && isExpanded) {
      setIsExpanded(false);
    }
  }, [shouldHide, isExpanded]);

  // Handle action button click
  const handleAction = useCallback((action: () => void) => {
    action();
    setIsExpanded(false);
  }, []);

  // Toggle expanded state (only if not dragging)
  const toggleExpanded = useCallback(() => {
    if (!isDragging) {
      setIsExpanded(prev => !prev);
    }
  }, [isDragging]);

  // Toggle manual hide
  const toggleManualHide = useCallback(() => {
    setIsManuallyHidden(prev => !prev);
    if (isExpanded) {
      setIsExpanded(false);
    }
  }, [isExpanded]);

  // Handle drag start
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  // Handle drag - LIVE magnetic snap while dragging
  const handleDrag = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const windowWidth = window.innerWidth;
    const fabWidth = 64;
    const margin = 24;
    
    // Calculate current FAB center X position
    let fabCenterX;
    if (fabSide === 'right') {
      fabCenterX = windowWidth - margin - fabWidth / 2 + info.offset.x;
    } else {
      fabCenterX = margin + fabWidth / 2 + info.offset.x;
    }
    
    // Magnetic snap threshold: 40% for left, 60% for right (with hysteresis)
    const leftThreshold = windowWidth * 0.4;
    const rightThreshold = windowWidth * 0.6;
    
    // Snap logic with hysteresis to prevent jittering
    if (fabSide === 'right' && fabCenterX < leftThreshold) {
      // Snap to left when dragged significantly to left
      setFabSide('left');
    } else if (fabSide === 'left' && fabCenterX > rightThreshold) {
      // Snap to right when dragged significantly to right
      setFabSide('right');
    }
  }, [fabSide]);

  // Handle drag end - save vertical position, reset horizontal
  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Calculate new vertical position
    const newY = dragPosition.y + info.offset.y;
    
    // Constrain vertical position: keep at least 100px from top, and original position at bottom
    const constrainedY = Math.max(Math.min(newY, 0), -400);
    
    // Reset X position to 0 (FAB snaps to edge)
    setDragPosition({ x: 0, y: constrainedY });
    
    // Reset dragging flag after a short delay to prevent click
    setTimeout(() => {
      setIsDragging(false);
    }, 100);
  }, [dragPosition]);

  // Action buttons configuration - CLOCK POSITIONS (Dynamic based on FAB side)
  // RIGHT side: Jam 12, 10.30, 9 (left positions)
  // LEFT side: Jam 12, 1.30, 3 (right positions - mirrored)
  const actions = useMemo(() => [
    {
      id: 'income',
      label: 'Tambah Pemasukan',
      icon: Plus,
      color: 'text-green-500', // Plus hijau
      bg: 'bg-gray-900',
      position: { x: 0, y: -90 }, // JAM 12 (same for both sides)
      onClick: onAddIncome
    },
    {
      id: 'expense',
      label: 'Tambah Pengeluaran',
      icon: Minus,
      color: 'text-red-500', // Minus merah
      bg: 'bg-gray-900',
      position: fabSide === 'right' 
        ? { x: -64, y: -64 }  // JAM 10.30 (upper-left)
        : { x: 64, y: -64 },  // JAM 1.30 (upper-right)
      onClick: onAddExpense
    },
    {
      id: 'summary',
      label: 'Toggle Ringkasan',
      icon: Wallet,
      color: 'text-blue-500', // Wallet biru
      bg: 'bg-gray-900',
      position: fabSide === 'right'
        ? { x: -90, y: 0 }   // JAM 9 (left)
        : { x: 90, y: 0 },   // JAM 3 (right)
      onClick: onToggleSummary
    }
  ], [fabSide, onAddIncome, onAddExpense, onToggleSummary]);

  // Chevron position - JAM 10.30 (right) or JAM 1.30 (left)
  // Dynamic based on FAB side
  // Distance: 32 (FAB) + 7.5 (gap) + 12 (chevron) = 51.5px
  // For 45° diagonal: 51.5 / √2 ≈ 36.4px → use 37px
  const chevronPosition = useMemo(() => {
    return fabSide === 'right'
      ? { x: -37, y: -37 }  // JAM 10.30 (upper-left)
      : { x: 37, y: -37 };   // JAM 1.30 (upper-right)
  }, [fabSide]);
  
  // Chevron rotation - Dynamic based on FAB side and hide state
  // RIGHT side: 0° (point right) when visible, 180° (point left) when manual hide
  // LEFT side: 180° (point left) when visible, 0° (point right) when manual hide
  const chevronRotation = useMemo(() => {
    if (shouldHide === 'manual') {
      return fabSide === 'right' ? 180 : 0;
    }
    return fabSide === 'right' ? 0 : 180;
  }, [fabSide, shouldHide]);

  return (
    <motion.div
      className={cn(
        "fixed z-40",
        "bottom-6",
        "md:hidden", // Hide on desktop - mobile only!
        className
      )}
      drag
      dragConstraints={{ top: -400, bottom: 0, left: -100, right: 100 }}
      dragElastic={0.1}
      dragMomentum={false}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      animate={{
        // Horizontal positioning - smooth transition between sides
        left: fabSide === 'left' ? 24 : 'auto',
        right: fabSide === 'right' ? 24 : 'auto',
        
        // Hide behavior - offset from edge position
        x: shouldHide === 'manual' 
          ? (fabSide === 'right' ? 'calc(100% - 8px)' : 'calc(-100% + 8px)')
          : shouldHide === 'auto' 
          ? (fabSide === 'right' ? '90%' : '-90%')
          : 0,
          
        opacity: shouldHide === 'manual' 
          ? 0.5 
          : shouldHide === 'auto' 
          ? 0.7 
          : 1,
          
        y: dragPosition.y
      }}
      transition={{ 
        left: { duration: 0.3, ease: 'easeOut' },
        right: { duration: 0.3, ease: 'easeOut' },
        x: { duration: 0.2, ease: 'easeOut' },
        y: { duration: 0.2, ease: 'easeOut' },
        opacity: { duration: 0.2 }
      }}
      style={{ touchAction: 'none' }}
    >
      {/* Main FAB Container - For positioning action buttons */}
      <div className="relative">
        {/* Action Buttons - Circular Layout */}
        <AnimatePresence>
          {isExpanded && actions.map((action) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.id}
                initial={{ 
                  scale: 0, 
                  opacity: 0,
                  x: action.position.x,
                  y: action.position.y
                }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  x: action.position.x,
                  y: action.position.y
                }}
                exit={{ 
                  scale: 0, 
                  opacity: 0,
                  x: action.position.x,
                  y: action.position.y
                }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                onClick={() => handleAction(action.onClick)}
                className={cn(
                  "absolute",
                  "w-14 h-14 md:w-16 md:h-16",
                  "rounded-full",
                  action.bg,
                  "shadow-lg",
                  "flex items-center justify-center",
                  "hover:scale-110 active:scale-95",
                  "transition-transform",
                  "cursor-pointer",
                  "z-10"
                )}
                style={{
                  left: '50%',
                  top: '50%',
                  translateX: '-50%',
                  translateY: '-50%'
                }}
                aria-label={action.label}
              >
                <Icon className={cn("w-6 h-6", action.color)} />
              </motion.button>
            );
          })}
        </AnimatePresence>

        {/* Main FAB Button - 64px */}
        <motion.button
          onClick={toggleExpanded}
          className={cn(
            "relative",
            "w-16 h-16", // 64px on all devices
            "rounded-full",
            "bg-white",
            "shadow-xl",
            "flex items-center justify-center",
            "hover:scale-105 active:scale-95",
            "transition-transform",
            "cursor-pointer",
            "z-20"
          )}
          whileTap={{ scale: 0.95 }}
          aria-label={isExpanded ? "Close menu" : "Open menu"}
        >
          <Plus 
            className={cn(
              "w-8 h-8 text-gray-900 transition-transform duration-200",
              isExpanded && "rotate-45"
            )} 
          />
        </motion.button>

        {/* Chevron Toggle Button - JAM 10.30, Hidden when expanded */}
        <motion.button
          onClick={toggleManualHide}
          className={cn(
            "absolute",
            "w-6 h-6", // 24×24px - Perfect square base
            "rounded-full",
            "bg-gray-700",
            "shadow-md",
            "flex items-center justify-center",
            "hover:scale-110 active:scale-95",
            "transition-transform",
            "cursor-pointer",
            "z-30"
          )}
          style={{
            aspectRatio: '1 / 1', // Force perfect circle
            minWidth: '24px',     // Prevent shrink
            minHeight: '24px',    // Prevent shrink
            pointerEvents: isExpanded ? 'none' : 'auto' // Disable clicks when hidden
          }}
          animate={{
            left: '50%',
            top: '50%',
            x: chevronPosition.x,
            y: chevronPosition.y,
            translateX: '-50%',
            translateY: '-50%',
            rotate: chevronRotation,
            opacity: isExpanded ? 0 : 1, // Hide when FAB expanded
            scale: isExpanded ? 0.5 : 1  // Shrink when hiding
          }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          aria-label={isManuallyHidden ? "Show FAB" : "Hide FAB"}
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </motion.button>
      </div>
    </motion.div>
  );
}
