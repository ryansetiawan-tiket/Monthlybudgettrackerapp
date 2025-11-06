# Mobile Gesture Support - Implementation Guide

**Tanggal:** 6 November 2025  
**Estimasi Total:** 2-3 jam  
**Difficulty:** Medium-High

## 📋 Prerequisites

### 1. Install Capacitor Dependencies

```bash
npm install @capacitor/core @capacitor/app @capacitor/haptics
npm install --save-dev @capacitor/cli
```

### 2. Verify TypeScript Types

```bash
# Create types if needed
npm install --save-dev @types/node
```

### 3. Backup Current State

```bash
# Create git branch
git checkout -b feature/mobile-gesture-support

# Or create backup
cp -r . ../budget-tracker-backup
```

---

## 🚀 Phase 1: Core Infrastructure (40 min)

### Step 1.1: Create DialogStack Context (15 min)

**File:** `/contexts/DialogStackContext.tsx`

```tsx
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface DialogInfo {
  id: string;
  priority: number;
  onClose: () => void;
}

interface DialogStackContextType {
  dialogs: DialogInfo[];
  registerDialog: (dialog: DialogInfo) => void;
  unregisterDialog: (id: string) => void;
  getTopDialog: () => DialogInfo | null;
  closeTopDialog: () => boolean;
}

const DialogStackContext = createContext<DialogStackContextType | null>(null);

export function DialogStackProvider({ children }: { children: ReactNode }) {
  const [dialogs, setDialogs] = useState<DialogInfo[]>([]);

  const registerDialog = useCallback((dialog: DialogInfo) => {
    setDialogs(prev => {
      // Prevent duplicates
      const exists = prev.find(d => d.id === dialog.id);
      if (exists) return prev;
      return [...prev, dialog];
    });
  }, []);

  const unregisterDialog = useCallback((id: string) => {
    setDialogs(prev => prev.filter(d => d.id !== id));
  }, []);

  const getTopDialog = useCallback(() => {
    if (dialogs.length === 0) return null;
    // Sort by priority (higher = more important)
    const sorted = [...dialogs].sort((a, b) => b.priority - a.priority);
    return sorted[0];
  }, [dialogs]);

  const closeTopDialog = useCallback(() => {
    const top = getTopDialog();
    if (top) {
      top.onClose();
      return true;
    }
    return false;
  }, [getTopDialog]);

  return (
    <DialogStackContext.Provider value={{
      dialogs,
      registerDialog,
      unregisterDialog,
      getTopDialog,
      closeTopDialog
    }}>
      {children}
    </DialogStackContext.Provider>
  );
}

export function useDialogStack() {
  const context = useContext(DialogStackContext);
  if (!context) {
    throw new Error('useDialogStack must be used within DialogStackProvider');
  }
  return context;
}
```

**Verification:**
```tsx
// No errors when importing
import { DialogStackProvider, useDialogStack } from './contexts/DialogStackContext';
```

### Step 1.2: Add Dialog Priority Constants (5 min)

**File:** `/constants/index.ts`

Add to existing file:

```tsx
// Dialog Priority Levels
export const DialogPriority = {
  LOW: 1,        // Sheets, drawers
  MEDIUM: 5,     // Main dialogs (expense, income, wishlist)
  HIGH: 10,      // Nested dialogs (grouping, confirmation)
  CRITICAL: 20   // Error dialogs, alerts
} as const;
```

**Verification:**
```tsx
import { DialogPriority } from './constants';
console.log(DialogPriority.MEDIUM); // Should output: 5
```

### Step 1.3: Create Capacitor Helpers (10 min)

**File:** `/utils/capacitor-helpers.ts`

```tsx
import { Haptics, ImpactStyle } from '@capacitor/haptics';

/**
 * Trigger haptic feedback (vibration)
 * Only works on native (Capacitor)
 */
export async function triggerHaptic(
  style: 'light' | 'medium' | 'heavy' = 'light'
): Promise<void> {
  if (!isCapacitor()) return;

  try {
    const styleMap = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy
    };

    await Haptics.impact({ style: styleMap[style] });
  } catch (error) {
    console.warn('Haptics not available:', error);
  }
}

/**
 * Check if running in Capacitor (native)
 */
export function isCapacitor(): boolean {
  return typeof window !== 'undefined' && !!window.Capacitor;
}

/**
 * Check current platform
 */
export function isPlatform(platform: 'ios' | 'android' | 'web'): boolean {
  if (!isCapacitor()) return platform === 'web';
  return window.Capacitor.getPlatform() === platform;
}

/**
 * Get safe area insets for notch/status bar
 */
export function getSafeAreaInsets() {
  if (!isCapacitor()) {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }

  // Use CSS env() variables
  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0')
  };
}
```

**Verification:**
```tsx
import { isCapacitor, triggerHaptic } from './utils/capacitor-helpers';
console.log('Is Capacitor:', isCapacitor()); // false in browser, true in native
```

### Step 1.4: Create Mobile Back Button Hook (10 min)

**File:** `/hooks/useMobileBackButton.ts`

```tsx
import { useEffect, useRef } from 'react';
import { App } from '@capacitor/app';
import { useDialogStack } from '../contexts/DialogStackContext';
import { triggerHaptic, isCapacitor } from '../utils/capacitor-helpers';

/**
 * Hook to handle Android hardware back button
 * - Closes dialogs in priority order
 * - Shows exit confirmation if no dialogs
 * - Exits app on double back press
 */
export function useMobileBackButton() {
  const { closeTopDialog } = useDialogStack();
  const lastBackPress = useRef(0);

  useEffect(() => {
    // Only setup on Capacitor (native)
    if (!isCapacitor()) {
      console.log('[BackButton] Not in Capacitor, skipping setup');
      return;
    }

    console.log('[BackButton] Setting up hardware back button handler');

    const backButtonHandler = App.addListener('backButton', async (event) => {
      console.log('[BackButton] Back button pressed', event);

      // Try to close dialog first
      const dialogClosed = closeTopDialog();
      
      if (dialogClosed) {
        console.log('[BackButton] Dialog closed');
        await triggerHaptic('light');
        return;
      }

      // No dialogs open - handle app exit
      const now = Date.now();
      const timeSinceLastBack = now - lastBackPress.current;

      if (timeSinceLastBack < 2000) {
        // Double back press within 2 seconds - exit app
        console.log('[BackButton] Exiting app');
        App.exitApp();
      } else {
        // First back press - show toast
        console.log('[BackButton] Showing exit confirmation');
        lastBackPress.current = now;
        
        // Show toast: "Press back again to exit"
        const { toast } = await import('sonner@2.0.3');
        toast.info('Tekan sekali lagi untuk keluar', {
          duration: 2000
        });
        await triggerHaptic('light');
      }
    });

    return () => {
      console.log('[BackButton] Cleaning up back button handler');
      backButtonHandler.remove();
    };
  }, [closeTopDialog]);
}
```

**Verification:**
```tsx
// In any component
import { useMobileBackButton } from './hooks/useMobileBackButton';

function MyComponent() {
  useMobileBackButton(); // Setup
  return <div>Test</div>;
}
```

### Step 1.5: Update App.tsx (5 min)

**File:** `/App.tsx`

Add near top of file:

```tsx
import { DialogStackProvider } from './contexts/DialogStackContext';
import { useMobileBackButton } from './hooks/useMobileBackButton';
```

Wrap return JSX:

```tsx
function App() {
  // ... existing hooks ...

  // Setup mobile back button
  useMobileBackButton();

  return (
    <DialogStackProvider>
      {/* Existing JSX */}
      <AnimatePresence mode="wait">
        {/* ... rest of app ... */}
      </AnimatePresence>
    </DialogStackProvider>
  );
}
```

**Verification:**
- [ ] App compiles without errors
- [ ] App runs in browser
- [ ] No console errors
- [ ] Log shows: `[BackButton] Not in Capacitor, skipping setup`

---

## 🎯 Phase 2: Dialog Registration (50 min)

### Step 2.1: Create Dialog Registration Hook (15 min)

**File:** `/hooks/useDialogRegistration.ts`

```tsx
import { useEffect, useRef } from 'react';
import { useDialogStack } from '../contexts/DialogStackContext';
import { triggerHaptic, isCapacitor } from '../utils/capacitor-helpers';

/**
 * Hook to register dialog to stack for back button handling
 * Automatically registers/unregisters based on open state
 * 
 * @param isOpen - Current open state
 * @param onOpenChange - Callback to change open state
 * @param priority - Dialog priority (higher = closes first)
 * @param dialogId - Unique dialog ID (optional, auto-generated if not provided)
 */
export function useDialogRegistration(
  isOpen: boolean,
  onOpenChange: (open: boolean) => void,
  priority: number = 5,
  dialogId?: string
) {
  const { registerDialog, unregisterDialog } = useDialogStack();
  const idRef = useRef(dialogId || `dialog-${Math.random().toString(36).substr(2, 9)}`);
  const id = idRef.current;

  useEffect(() => {
    if (isOpen) {
      console.log(`[DialogRegistration] Registering dialog: ${id} (priority: ${priority})`);
      
      registerDialog({
        id,
        priority,
        onClose: () => {
          console.log(`[DialogRegistration] Closing dialog via back button: ${id}`);
          onOpenChange(false);
          triggerHaptic('light');
        }
      });

      // Haptic feedback on open
      if (isCapacitor()) {
        triggerHaptic('light');
      }

      return () => {
        console.log(`[DialogRegistration] Unregistering dialog: ${id}`);
        unregisterDialog(id);
      };
    }
  }, [isOpen, id, priority, onOpenChange, registerDialog, unregisterDialog]);

  return id;
}
```

**Verification:**
```tsx
// In any component
import { useDialogRegistration } from './hooks/useDialogRegistration';

function TestDialog({ isOpen, onOpenChange }) {
  useDialogRegistration(isOpen, onOpenChange, 5, 'test-dialog');
  return null;
}
```

### Step 2.2: Update AddExpenseDialog (10 min)

**File:** `/components/AddExpenseDialog.tsx`

Add import:

```tsx
import { useDialogRegistration } from '../hooks/useDialogRegistration';
import { DialogPriority } from '../constants';
```

Inside component (after existing hooks):

```tsx
export function AddExpenseDialog({
  isOpen,
  onOpenChange,
  // ... other props
}: AddExpenseDialogProps) {
  // ... existing hooks ...

  // Register to dialog stack for back button
  useDialogRegistration(
    isOpen,
    onOpenChange,
    DialogPriority.MEDIUM,
    'add-expense-dialog'
  );

  // ... rest of component ...
}
```

**Verification:**
- [ ] Dialog compiles
- [ ] Dialog opens/closes normally
- [ ] Console shows registration logs
- [ ] Back button closes dialog (in native)

### Step 2.3: Update AddAdditionalIncomeDialog (5 min)

**File:** `/components/AddAdditionalIncomeDialog.tsx`

Same pattern as AddExpenseDialog:

```tsx
import { useDialogRegistration } from '../hooks/useDialogRegistration';
import { DialogPriority } from '../constants';

// Inside component
useDialogRegistration(
  isOpen,
  onOpenChange,
  DialogPriority.MEDIUM,
  'add-income-dialog'
);
```

### Step 2.4: Update WishlistDialog (5 min)

**File:** `/components/WishlistDialog.tsx`

```tsx
import { useDialogRegistration } from '../hooks/useDialogRegistration';
import { DialogPriority } from '../constants';

// Inside component
useDialogRegistration(
  isOpen,
  onOpenChange,
  DialogPriority.MEDIUM,
  'wishlist-dialog'
);
```

### Step 2.5: Update TransferDialog (5 min)

**File:** `/components/TransferDialog.tsx`

```tsx
import { useDialogRegistration } from '../hooks/useDialogRegistration';
import { DialogPriority } from '../constants';

// Inside component
useDialogRegistration(
  isOpen,
  onOpenChange,
  DialogPriority.MEDIUM,
  'transfer-dialog'
);
```

### Step 2.6: Update ManagePocketsDialog (5 min)

**File:** `/components/ManagePocketsDialog.tsx`

```tsx
import { useDialogRegistration } from '../hooks/useDialogRegistration';
import { DialogPriority } from '../constants';

// Inside component
useDialogRegistration(
  isOpen,
  onOpenChange,
  DialogPriority.MEDIUM,
  'manage-pockets-dialog'
);
```

### Step 2.7: Test Back Button (5 min)

**Manual Testing:**
1. Open any dialog
2. Check console for registration log
3. Press back (or Escape key in browser)
4. Dialog should close
5. Check console for close log

**Expected Console Output:**
```
[BackButton] Not in Capacitor, skipping setup
[DialogRegistration] Registering dialog: add-expense-dialog (priority: 5)
[DialogRegistration] Closing dialog via back button: add-expense-dialog
[DialogRegistration] Unregistering dialog: add-expense-dialog
```

---

## 👆 Phase 3: Swipe Gestures (40 min)

### Step 3.1: Create Swipe Gesture Hook (20 min)

**File:** `/hooks/useSwipeGesture.ts`

```tsx
import { useRef, useCallback } from 'react';

interface SwipeConfig {
  onSwipeDown?: () => void;
  onSwipeUp?: () => void;
  threshold?: number; // pixels to trigger dismiss
  velocityThreshold?: number; // pixels/ms for fast swipe
  enabled?: boolean;
}

interface TouchInfo {
  startY: number;
  startTime: number;
  startX: number;
}

export function useSwipeGesture(config: SwipeConfig) {
  const {
    onSwipeDown,
    onSwipeUp,
    threshold = 100,
    velocityThreshold = 0.5,
    enabled = true
  } = config;

  const touchStart = useRef<TouchInfo | null>(null);
  const currentTranslate = useRef(0);
  const elementRef = useRef<HTMLElement | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enabled) return;

    const touch = e.touches[0];
    touchStart.current = {
      startY: touch.clientY,
      startX: touch.clientX,
      startTime: Date.now()
    };

    elementRef.current = e.currentTarget as HTMLElement;
  }, [enabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!enabled || !touchStart.current || !elementRef.current) return;

    const touch = e.touches[0];
    const deltaY = touch.clientY - touchStart.current.startY;
    const deltaX = touch.clientX - touchStart.current.startX;

    // Check if movement is more vertical than horizontal
    const isVertical = Math.abs(deltaY) > Math.abs(deltaX);
    if (!isVertical) return;

    // Only allow downward swipes for dismiss (or upward if configured)
    const isDownward = deltaY > 0;
    const isUpward = deltaY < 0;

    if ((isDownward && onSwipeDown) || (isUpward && onSwipeUp)) {
      currentTranslate.current = deltaY;
      
      // Apply transform
      const element = elementRef.current;
      element.style.transform = `translateY(${deltaY}px)`;
      
      // Fade backdrop proportionally
      const opacity = Math.max(0, 1 - (Math.abs(deltaY) / 300));
      const dialogElement = element.closest('[role="dialog"]');
      const backdrop = dialogElement?.previousElementSibling as HTMLElement;
      if (backdrop && backdrop.hasAttribute('data-radix-dialog-overlay')) {
        backdrop.style.opacity = opacity.toString();
      }

      // Prevent scrolling when swiping
      e.preventDefault();
    }
  }, [enabled, onSwipeDown, onSwipeUp]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!enabled || !touchStart.current || !elementRef.current) return;

    const deltaY = currentTranslate.current;
    const deltaTime = Date.now() - touchStart.current.startTime;
    const velocity = Math.abs(deltaY) / deltaTime;

    const element = elementRef.current;
    
    // Determine if should dismiss
    const isDownward = deltaY > 0;
    const isUpward = deltaY < 0;
    const shouldDismissDown = isDownward && (Math.abs(deltaY) > threshold || velocity > velocityThreshold) && onSwipeDown;
    const shouldDismissUp = isUpward && (Math.abs(deltaY) > threshold || velocity > velocityThreshold) && onSwipeUp;

    if (shouldDismissDown || shouldDismissUp) {
      // Animate to dismiss
      element.style.transition = 'transform 0.3s ease-out';
      element.style.transform = shouldDismissDown ? 'translateY(100%)' : 'translateY(-100%)';
      
      // Fade out backdrop
      const dialogElement = element.closest('[role="dialog"]');
      const backdrop = dialogElement?.previousElementSibling as HTMLElement;
      if (backdrop && backdrop.hasAttribute('data-radix-dialog-overlay')) {
        backdrop.style.transition = 'opacity 0.3s ease-out';
        backdrop.style.opacity = '0';
      }

      // Call callback after animation
      setTimeout(() => {
        if (shouldDismissDown && onSwipeDown) onSwipeDown();
        if (shouldDismissUp && onSwipeUp) onSwipeUp();
      }, 300);
    } else {
      // Animate back to original position
      element.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
      element.style.transform = 'translateY(0)';
      
      // Restore backdrop
      const dialogElement = element.closest('[role="dialog"]');
      const backdrop = dialogElement?.previousElementSibling as HTMLElement;
      if (backdrop && backdrop.hasAttribute('data-radix-dialog-overlay')) {
        backdrop.style.transition = 'opacity 0.3s ease-out';
        backdrop.style.opacity = '1';
      }
    }

    // Reset state
    touchStart.current = null;
    currentTranslate.current = 0;
    
    // Remove transition after animation completes
    setTimeout(() => {
      if (element) {
        element.style.transition = '';
      }
    }, 300);
  }, [enabled, threshold, velocityThreshold, onSwipeDown, onSwipeUp]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
}
```

**Verification:**
```tsx
// Test in any component
const { handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipeGesture({
  onSwipeDown: () => console.log('Swiped down!'),
  threshold: 100
});
```

### Step 3.2: Update Dialog UI Component (20 min)

**File:** `/components/ui/dialog.tsx`

Find `DialogContent` component and update:

```tsx
import { useSwipeGesture } from '../../hooks/useSwipeGesture';
import { triggerHaptic } from '../../utils/capacitor-helpers';

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    enableSwipe?: boolean;
  }
>(({ className, children, enableSwipe = true, ...props }, ref) => {
  const { onOpenChange } = props as any;

  // Setup swipe gesture
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipeGesture({
    onSwipeDown: () => {
      onOpenChange?.(false);
      triggerHaptic('light');
    },
    threshold: 80,
    velocityThreshold: 0.3,
    enabled: enableSwipe
  });

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          // Add touch handling
          "touch-pan-y", // Allow vertical panning
          className
        )}
        onTouchStart={enableSwipe ? handleTouchStart : undefined}
        onTouchMove={enableSwipe ? handleTouchMove : undefined}
        onTouchEnd={enableSwipe ? handleTouchEnd : undefined}
        {...props}
      >
        {/* Swipe indicator for mobile */}
        {enableSwipe && (
          <div 
            className="md:hidden w-12 h-1 bg-muted rounded-full mx-auto mb-2 flex-shrink-0"
            aria-hidden="true"
          />
        )}
        
        {children}
        
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
```

**Verification:**
- [ ] Dialog shows swipe indicator on mobile
- [ ] Swipe down partially moves dialog
- [ ] Swipe down > 80px closes dialog
- [ ] Fast swipe closes dialog
- [ ] Swipe up does nothing
- [ ] Animation smooth

---

## ✨ Phase 4: Polish & Testing (30 min)

### Step 4.1: Add Haptic to All Interactions (10 min)

Update these files to add haptic on important actions:

**In each dialog when saving:**

```tsx
// Example: AddExpenseDialog.tsx
const handleSubmit = async () => {
  // ... existing logic ...
  
  await triggerHaptic('medium'); // Success haptic
  onOpenChange(false);
};

// On error
const handleError = () => {
  triggerHaptic('heavy'); // Error haptic
};
```

### Step 4.2: Optimize Touch Targets (10 min)

Ensure all interactive elements have minimum 48x48px touch target:

**File:** `/styles/globals.css`

Add:

```css
/* Mobile touch optimization */
@media (max-width: 768px) {
  button,
  [role="button"],
  a {
    min-height: 44px;
    min-width: 44px;
  }

  /* Dialog close button */
  [data-radix-dialog-close] {
    padding: 12px;
  }
}
```

### Step 4.3: Test All Gestures (10 min)

**Testing Checklist:**

Desktop (Browser):
- [ ] Dialogs open/close normally
- [ ] Escape key closes dialogs
- [ ] Click outside closes dialogs
- [ ] No console errors

Mobile (Responsive):
- [ ] Swipe indicator visible
- [ ] Swipe down closes dialog
- [ ] Smooth animations
- [ ] No scroll conflicts
- [ ] Touch targets adequate

Native (Capacitor):
- [ ] Back button closes dialogs
- [ ] Multiple dialogs - correct priority
- [ ] Exit confirmation works
- [ ] Double back exits app
- [ ] Haptic feedback works
- [ ] Swipe + back button both work

---

## 📝 Phase 5: Documentation (20 min)

### Step 5.1: Create Changelog (10 min)

**File:** `/docs/changelog/MOBILE_GESTURE_SUPPORT.md`

Document all changes, features, and testing results.

### Step 5.2: Update Main README (5 min)

Add section about mobile gestures in `/README.md`:

```markdown
## Mobile Gestures (Android)

Budget Tracker supports native Android gestures when built with Capacitor:

- **Hardware Back Button**: Closes dialogs in priority order
- **Swipe to Dismiss**: Swipe down on dialogs to close
- **Haptic Feedback**: Vibration on interactions
- **Exit Confirmation**: Double back to exit app

See `/docs/changelog/MOBILE_GESTURE_SUPPORT.md` for details.
```

### Step 5.3: Update Component Documentation (5 min)

Update `/docs/tracking-app-wiki/03-component-documentation.md` with new hooks and context.

---

## 🎯 Verification Checklist

### Code Quality
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] All imports resolve
- [ ] No console errors (except expected logs)

### Functionality
- [ ] All dialogs open/close normally
- [ ] Back button closes dialogs (native)
- [ ] Swipe down closes dialogs (mobile)
- [ ] Exit confirmation works
- [ ] No gesture conflicts
- [ ] Priority handling correct

### Performance
- [ ] No visible lag
- [ ] Smooth animations (60fps)
- [ ] No memory leaks
- [ ] Fast response time

### UX
- [ ] Haptic feedback works
- [ ] Visual feedback clear
- [ ] Touch targets adequate
- [ ] Native-feeling experience

---

## 🐛 Troubleshooting

### Issue: Back button doesn't work in browser

**Solution:** This is expected. Back button only works in Capacitor (native). Use Escape key for testing in browser.

### Issue: Swipe conflicts with scroll

**Solution:** The hook detects vertical vs horizontal movement. Ensure `touch-pan-y` class is applied to dialog content.

### Issue: Dialog doesn't close on swipe

**Solution:** 
1. Check console for errors
2. Verify `onOpenChange` prop is passed
3. Check swipe threshold (default 80px)
4. Try fast swipe (velocity detection)

### Issue: Haptic doesn't work

**Solution:**
1. Check if running in Capacitor: `console.log(window.Capacitor)`
2. Verify Haptics plugin installed
3. Check Android permissions
4. Try on real device (may not work in emulator)

### Issue: Multiple dialogs close together

**Solution:**
1. Verify each dialog has unique ID
2. Check priority levels are different
3. Check console for registration logs
4. Ensure `unregisterDialog` is called on unmount

---

## 📚 Next Steps

After implementation:

1. **Build Capacitor App:**
   ```bash
   npm run build
   npx cap add android
   npx cap sync
   npx cap open android
   ```

2. **Test on Real Device:**
   - Connect Android device
   - Enable USB debugging
   - Run from Android Studio

3. **Optimize Performance:**
   - Profile with React DevTools
   - Check animation performance
   - Monitor bundle size

4. **Future Enhancements:**
   - Edge swipe navigation
   - Pull to refresh
   - Long press gestures
   - Keyboard shortcuts

---

**Status:** Ready for implementation ✅  
**Estimated Time:** 2-3 hours  
**Difficulty:** Medium-High  
**Risk:** Low (non-breaking changes)
