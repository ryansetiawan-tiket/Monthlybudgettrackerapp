import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { Plus, Minus, ArrowLeftRight, ChevronRight } from 'lucide-react';
import { cn } from './ui/utils';

interface FloatingActionButtonProps {
  onAddExpense: () => void;
  onAddIncome: () => void;
  onTransfer: () => void;
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
function useScrollDetection(fabRef: React.RefObject<HTMLDivElement>) {
  const [isScrolling, setIsScrolling] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      // INSTANT hide saat scroll - no delay!
      setIsScrolling(true);
      
      // Clear previous timeout
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      
      // Set idle timeout - DELAY kemunculan FAB (500ms mobile, 1200ms desktop)
      // TAPI: Hanya set timeout jika jari sudah lepas (not touching)
      const isMobile = window.innerWidth < 768;
      const idleDelay = isMobile ? 500 : 1200;
      
      idleTimeoutRef.current = setTimeout(() => {
        // Hanya show FAB jika jari sudah lepas
        if (!isTouching) {
          setIsScrolling(false);
        }
      }, idleDelay);
    };
    
    const handleTouchStart = (e: TouchEvent) => {
      // ✅ FIX: Ignore touches on FAB to prevent false scroll detection
      if (fabRef.current && fabRef.current.contains(e.target as Node)) {
        return;
      }
      setIsTouching(true);
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      // ✅ FIX: Ignore touches on FAB to prevent false scroll detection
      if (fabRef.current && fabRef.current.contains(e.target as Node)) {
        return;
      }
      setIsTouching(false);
      
      // Trigger recheck scroll state after touch end
      // Jika sedang scrolling, trigger timeout untuk show FAB
      if (isScrolling) {
        if (idleTimeoutRef.current) {
          clearTimeout(idleTimeoutRef.current);
        }
        
        const isMobile = window.innerWidth < 768;
        const idleDelay = isMobile ? 500 : 1200;
        
        idleTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
        }, idleDelay);
      }
    };
    
    // Direct scroll handler - no debounce for instant hiding!
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, [isTouching, isScrolling, fabRef]);
  
  return isScrolling || isTouching;
}

export function FloatingActionButton({
  onAddExpense,
  onAddIncome,
  onTransfer,
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
  const [snapBackX, setSnapBackX] = useState(0);
  const fabRef = useRef<HTMLDivElement>(null); // ✅ FIX: Move ref declaration before usage
  const isScrolling = useScrollDetection(fabRef);
  
  // Save FAB side preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('fab-side', fabSide);
  }, [fabSide]);

  // ✅ FIX #2: Click outside detection - close FAB when user clicks outside
  useEffect(() => {
    if (!isExpanded) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    // Use capture phase to ensure we catch the event before it bubbles
    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('touchstart', handleClickOutside, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
    };
  }, [isExpanded]);

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
  const toggleManualHide = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    // ✅ FIX: Prevent event propagation to avoid conflicts
    e?.preventDefault();
    e?.stopPropagation();
    
    setIsManuallyHidden(prev => !prev);
    if (isExpanded) {
      setIsExpanded(false);
    }
  }, [isExpanded]);

  // Handle drag start
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  // Handle drag - no auto-switching, just follow drag
  const handleDrag = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // No auto-switching during drag - just let it move
  }, []);

  // Handle drag end - smart snap: 10-50% snap back, >50% switch side
  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const windowWidth = window.innerWidth;
    const dragDistanceX = Math.abs(info.offset.x);
    const dragPercentage = (dragDistanceX / windowWidth) * 100;
    
    // Determine if should switch side based on drag distance and direction
    let shouldSwitch = false;
    
    if (fabSide === 'right' && info.offset.x < 0) {
      // Dragging from right to left
      shouldSwitch = dragPercentage > 50;
    } else if (fabSide === 'left' && info.offset.x > 0) {
      // Dragging from left to right
      shouldSwitch = dragPercentage > 50;
    }
    
    // Switch side if threshold met
    if (shouldSwitch) {
      setFabSide(fabSide === 'right' ? 'left' : 'right');
      setSnapBackX(0);
    } else {
      // Snap back to original position with current drag offset negated
      setSnapBackX(-info.offset.x);
    }
    
    // Calculate new vertical position
    const newY = dragPosition.y + info.offset.y;
    
    // Constrain vertical position: allow drag up (-400px) and down (+80px)
    // +80px adalah batas agar FAB tidak hilang ke bawah layar
    const constrainedY = Math.max(Math.min(newY, 80), -400);
    
    // Update position
    setDragPosition({ x: 0, y: constrainedY });
    
    // Reset dragging flag and snap-back after animation
    setTimeout(() => {
      setIsDragging(false);
      setSnapBackX(0);
    }, 300);
  }, [dragPosition, fabSide]);

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
      id: 'transfer',
      label: 'Transfer Antar Kantong',
      icon: ArrowLeftRight,
      color: 'text-blue-500', // Transfer biru
      bg: 'bg-gray-900',
      position: fabSide === 'right'
        ? { x: -90, y: 0 }   // JAM 9 (left)
        : { x: 90, y: 0 },   // JAM 3 (right)
      onClick: onTransfer
    }
  ], [fabSide, onAddIncome, onAddExpense, onTransfer]);

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
        "bottom-26",
        "md:hidden", // Hide on desktop - mobile only!
        className
      )}
      drag
      dragConstraints={{ top: -400, bottom: 80, left: -100, right: 100 }}
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
          : snapBackX,
          
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
        x: { 
          duration: shouldHide ? 0.15 : 0.3, // Faster hiding, slower snap-back
          ease: shouldHide ? 'easeIn' : [0.4, 0, 0.2, 1]
        },
        y: { duration: 0.2, ease: 'easeOut' },
        opacity: { 
          duration: shouldHide ? 0.1 : 0.2 // Faster fade on hide
        }
      }}
      style={{ touchAction: 'none' }}
      ref={fabRef}
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
          onPointerDown={(e) => {
            // ✅ FIX: Stop propagation to prevent drag on parent
            e.stopPropagation();
          }}
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
            // ✅ REMOVED touchAction: 'none' - let parent handle it
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