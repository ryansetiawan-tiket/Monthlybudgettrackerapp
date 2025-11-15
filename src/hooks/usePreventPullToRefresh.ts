import { useEffect, useRef } from 'react';

/**
 * 🔒 Hook untuk mencegah pull-to-refresh saat drawer/modal terbuka
 * 
 * Solusi: Event-based prevention (bukan CSS-only)
 * Kenapa: Browser's pull-to-refresh "mencuri" gestur sebelum CSS bisa lock
 * 
 * @param isOpen - Whether the drawer/modal is currently open
 * 
 * @example
 * ```tsx
 * const [isDrawerOpen, setIsDrawerOpen] = useState(false);
 * usePreventPullToRefresh(isDrawerOpen);
 * 
 * <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
 *   <DrawerContent>...</DrawerContent>
 * </Drawer>
 * ```
 */
export const usePreventPullToRefresh = (isOpen: boolean) => {
  const startYRef = useRef<number>(0);
  const isTouchingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Catat posisi awal sentuhan
      isTouchingRef.current = true;
      startYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isTouchingRef.current) return;

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startYRef.current;

      // ✅ CRITICAL: Hanya block jika:
      // 1. User swipe DOWN (deltaY > 0)
      // 2. Halaman di paling TOP (scrollY === 0)
      // Ini adalah gestur pull-to-refresh classic
      if (deltaY > 0 && window.scrollY === 0) {
        // 🛑 Blokir pull-to-refresh!
        e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      // Reset state
      isTouchingRef.current = false;
      startYRef.current = 0;
    };

    // 📌 CRITICAL: passive: false untuk allow preventDefault()
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchEnd);

    // Cleanup
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
      
      // Reset state on unmount
      isTouchingRef.current = false;
      startYRef.current = 0;
    };
  }, [isOpen]);
};