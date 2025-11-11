import { memo, ReactNode } from 'react';
import { useLongPress } from '../hooks/useLongPress';

interface ExpenseItemWrapperProps {
  id: string;
  isMobile: boolean;
  isBulkSelectMode: boolean;
  isSelected: boolean;
  onLongPress: (id: string) => void;
  children: (longPressHandlers: ReturnType<typeof useLongPress>) => ReactNode;
}

/**
 * Wrapper component to properly handle useLongPress hook at component level
 * This prevents Rules of Hooks violations by ensuring hooks are called at top level
 */
export const ExpenseItemWrapper = memo(function ExpenseItemWrapper({
  id,
  isMobile,
  isBulkSelectMode,
  onLongPress,
  children,
}: ExpenseItemWrapperProps) {
  const longPressHandlers = useLongPress({
    onLongPress: () => {
      if (!isBulkSelectMode) {
        onLongPress(id);
      }
    },
    delay: 500,
  });

  return <>{children(isMobile && !isBulkSelectMode ? longPressHandlers : {})}</>;
});
