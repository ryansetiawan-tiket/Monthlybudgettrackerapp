import { useEffect } from 'react';

/**
 * Hook to prevent mobile pull-to-refresh when drawer/bottomsheet is open
 * 
 * @param isOpen - Whether the drawer is currently open
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
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('drawer-open');
    } else {
      document.body.classList.remove('drawer-open');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('drawer-open');
    };
  }, [isOpen]);
};
