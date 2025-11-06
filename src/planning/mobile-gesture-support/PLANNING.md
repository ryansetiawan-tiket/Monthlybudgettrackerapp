# Mobile Gesture Support - Detailed Planning

**Tanggal:** 6 November 2025  
**Version:** 1.0  
**Status:** 📋 Planning Phase

## 📋 Table of Contents

1. [Overview](#overview)
2. [Current State Analysis](#current-state-analysis)
3. [Requirements](#requirements)
4. [Architecture Design](#architecture-design)
5. [Implementation Details](#implementation-details)
6. [Testing Strategy](#testing-strategy)
7. [Risk Assessment](#risk-assessment)

---

## Overview

### Problem Statement

Budget Tracker app akan di-build sebagai Android native app menggunakan Capacitor. Saat ini aplikasi tidak memiliki:

1. ❌ Hardware back button handling
2. ❌ Swipe gestures untuk close dialogs
3. ❌ Native mobile UX patterns
4. ❌ Touch optimization untuk mobile
5. ❌ Haptic feedback

### Solution

Implementasi comprehensive mobile gesture system yang mencakup:

1. ✅ **Hardware Back Button Support**
   - Smart dialog/sheet closing
   - Priority-based stack management
   - App exit confirmation

2. ✅ **Swipe Gestures**
   - Swipe-to-dismiss dialogs
   - Native-feeling animations
   - Gesture conflict resolution

3. ✅ **Native Integration**
   - Capacitor App plugin
   - Haptic feedback
   - Status bar handling

4. ✅ **UX Polish**
   - Touch target optimization
   - Smooth animations
   - Loading states

---

## Current State Analysis

### Existing Dialog Components

| Component | File | Type | Priority |
|-----------|------|------|----------|
| AddExpenseDialog | `/components/AddExpenseDialog.tsx` | Dialog | High |
| AddAdditionalIncomeDialog | `/components/AddAdditionalIncomeDialog.tsx` | Dialog | High |
| WishlistDialog | `/components/WishlistDialog.tsx` | Dialog | Medium |
| TransferDialog | `/components/TransferDialog.tsx` | Dialog | Medium |
| ManagePocketsDialog | `/components/ManagePocketsDialog.tsx` | Dialog | Medium |

### Current Dialog Implementation

**Existing Pattern:**
```tsx
// Current implementation
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    {/* Content */}
  </DialogContent>
</Dialog>
```

**Issues:**
- ❌ No back button handling
- ❌ No swipe gestures
- ❌ No gesture priority management
- ❌ No native integration

### ShadCN Dialog Component

**File:** `/components/ui/dialog.tsx`

Current implementation menggunakan Radix UI Dialog primitive. Kita perlu extend dengan:
- Swipe gesture support
- Back button integration
- Mobile-optimized animations

---

## Requirements

### Functional Requirements

#### FR-1: Hardware Back Button
```
GIVEN user is on Android device
WHEN user presses hardware back button
THEN:
  - IF dialog is open → close dialog
  - IF multiple dialogs open → close topmost dialog
  - IF no dialogs → show exit confirmation
  - IF exit confirmation shown AND back pressed again → exit app
```

#### FR-2: Swipe to Dismiss
```
GIVEN user has dialog open
WHEN user swipes down from dialog header
THEN:
  - Dialog animates down
  - Backdrop fades out
  - Dialog closes
  - onOpenChange callback triggered
```

#### FR-3: Dialog Stack Priority
```
GIVEN multiple dialogs can be open
WHEN back button pressed
THEN close dialogs in LIFO order (Last In, First Out)

Priority Order:
1. Nested dialogs (e.g., expense grouping)
2. Main dialogs (expense, income, wishlist)
3. Sheets/Drawers
4. App exit
```

#### FR-4: Gesture Conflict Resolution
```
GIVEN dialog with scrollable content
WHEN user scrolls vertically
THEN do NOT trigger swipe-to-dismiss

WHEN user swipes down from header (non-scrollable area)
THEN trigger swipe-to-dismiss
```

#### FR-5: Haptic Feedback
```
WHEN dialog opens → Light haptic
WHEN dialog closes → Light haptic
WHEN button pressed → Selection haptic
WHEN error occurs → Error haptic (heavy)
```

### Non-Functional Requirements

#### NFR-1: Performance
- Back button response < 100ms
- Swipe animation 60fps
- No jank or stutter
- Bundle size increase < 10KB

#### NFR-2: Compatibility
- Android 10+ support
- Works on all screen sizes
- Graceful degradation on web
- No breaking changes

#### NFR-3: Accessibility
- Touch targets min 48x48px
- Keyboard navigation preserved
- Screen reader compatible
- Focus management

#### NFR-4: Reliability
- Zero crashes
- Error handling
- Fallback behaviors
- Edge case handling

---

## Architecture Design

### System Architecture

```
┌─────────────────────────────────────────────────┐
│                  App.tsx                        │
│  ┌───────────────────────────────────────────┐  │
│  │     DialogStackProvider (Context)         │  │
│  │  - Track all open dialogs                │  │
│  │  - Priority management                   │  │
│  │  - Back button routing                   │  │
│  └───────────────────────────────────────────┘  │
│                      │                          │
│  ┌───────────────────┼───────────────────────┐  │
│  │                   ▼                       │  │
│  │    useMobileBackButton Hook              │  │
│  │  - Listen to Capacitor backButton event  │  │
│  │  - Query dialog stack                    │  │
│  │  - Close appropriate dialog              │  │
│  └───────────────────────────────────────────┘  │
│                      │                          │
│  ┌───────────────────┼───────────────────────┐  │
│  │                   ▼                       │  │
│  │         Dialog Components                │  │
│  │  ┌─────────────────────────────────────┐ │  │
│  │  │  AddExpenseDialog                   │ │  │
│  │  │  - Register to dialog stack         │ │  │
│  │  │  - Handle swipe gestures            │ │  │
│  │  │  - Haptic feedback                  │ │  │
│  │  └─────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────┐ │  │
│  │  │  WishlistDialog                     │ │  │
│  │  │  [Same pattern]                     │ │  │
│  │  └─────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────┐ │  │
│  │  │  [Other Dialogs...]                 │ │  │
│  │  └─────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────┘  │
│                      │                          │
│  ┌───────────────────┼───────────────────────┐  │
│  │                   ▼                       │  │
│  │      Enhanced Dialog Component           │  │
│  │  (/components/ui/dialog.tsx)             │  │
│  │  - Swipe gesture detection               │  │
│  │  - Animation handling                    │  │
│  │  - Mobile-optimized styling              │  │
│  └───────────────────────────────────────────┘  │
│                      │                          │
│  ┌───────────────────┼───────────────────────┐  │
│  │                   ▼                       │  │
│  │      Capacitor Native Layer              │  │
│  │  - @capacitor/app (back button)          │  │
│  │  - @capacitor/haptics (vibration)        │  │
│  │  - @capacitor/status-bar                 │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Data Flow

#### Dialog Opening Flow
```
1. User clicks "Add Expense"
2. setIsOpen(true) called
3. Dialog registers to DialogStack context
4. Dialog opens with animation
5. Haptic feedback triggered (light)
6. Back button listener active
```

#### Back Button Flow
```
1. User presses hardware back button
2. Capacitor App plugin fires backButton event
3. useMobileBackButton hook receives event
4. Hook queries DialogStack for active dialogs
5. If dialogs exist:
   a. Get topmost dialog ID
   b. Call that dialog's close handler
   c. Trigger haptic feedback
   d. Prevent default (don't exit app)
6. If no dialogs:
   a. Show exit confirmation toast
   b. Start 2-second timer
   c. If back pressed again → exit app
```

#### Swipe to Dismiss Flow
```
1. User touches dialog header
2. TouchStart event captured
3. Track finger position
4. On TouchMove:
   a. Calculate deltaY
   b. If deltaY > threshold AND direction = down
   c. Apply transform: translateY(deltaY)
   d. Update backdrop opacity
5. On TouchEnd:
   a. Check velocity and distance
   b. If > dismissThreshold:
      - Animate to bottom
      - Call onOpenChange(false)
      - Haptic feedback
   c. Else:
      - Animate back to original position
```

---

## Implementation Details

### Phase 1: Core Infrastructure

#### 1.1 DialogStack Context

**File:** `/contexts/DialogStackContext.tsx`

```tsx
import { createContext, useContext, useState, useCallback } from 'react';

interface DialogInfo {
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

export function DialogStackProvider({ children }) {
  const [dialogs, setDialogs] = useState<DialogInfo[]>([]);

  const registerDialog = useCallback((dialog: DialogInfo) => {
    setDialogs(prev => [...prev, dialog]);
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
  if (!context) throw new Error('useDialogStack must be used within DialogStackProvider');
  return context;
}
```

**Priority Levels:**
```tsx
export const DialogPriority = {
  LOW: 1,        // Sheets, drawers
  MEDIUM: 5,     // Main dialogs
  HIGH: 10,      // Nested dialogs, confirmations
  CRITICAL: 20   // Error dialogs, alerts
};
```

#### 1.2 Mobile Back Button Hook

**File:** `/hooks/useMobileBackButton.ts`

```tsx
import { useEffect, useRef } from 'react';
import { App } from '@capacitor/app';
import { useDialogStack } from '../contexts/DialogStackContext';
import { triggerHaptic } from '../utils/capacitor-helpers';

export function useMobileBackButton() {
  const { closeTopDialog } = useDialogStack();
  const lastBackPress = useRef(0);

  useEffect(() => {
    // Only setup on Capacitor (native)
    if (!window.Capacitor) return;

    const backButtonHandler = App.addListener('backButton', async ({ canGoBack }) => {
      // Try to close dialog first
      const dialogClosed = closeTopDialog();
      
      if (dialogClosed) {
        await triggerHaptic('light');
        return;
      }

      // No dialogs open - handle app exit
      const now = Date.now();
      const timeSinceLastBack = now - lastBackPress.current;

      if (timeSinceLastBack < 2000) {
        // Double back press - exit app
        App.exitApp();
      } else {
        // First back press - show toast
        lastBackPress.current = now;
        // Show toast: "Press back again to exit"
        const { toast } = await import('sonner@2.0.3');
        toast.info('Tekan sekali lagi untuk keluar');
        await triggerHaptic('light');
      }
    });

    return () => {
      backButtonHandler.remove();
    };
  }, [closeTopDialog]);
}
```

#### 1.3 Capacitor Helpers

**File:** `/utils/capacitor-helpers.ts`

```tsx
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export async function triggerHaptic(
  style: 'light' | 'medium' | 'heavy' = 'light'
) {
  if (!window.Capacitor) return;

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

export function isCapacitor(): boolean {
  return !!window.Capacitor;
}

export function isPlatform(platform: 'ios' | 'android'): boolean {
  if (!window.Capacitor) return false;
  return window.Capacitor.getPlatform() === platform;
}
```

### Phase 2: Dialog Integration

#### 2.1 useDialogRegistration Hook

**File:** `/hooks/useDialogRegistration.ts`

```tsx
import { useEffect } from 'react';
import { useDialogStack } from '../contexts/DialogStackContext';
import { triggerHaptic } from '../utils/capacitor-helpers';

export function useDialogRegistration(
  isOpen: boolean,
  onOpenChange: (open: boolean) => void,
  priority: number = 5,
  dialogId?: string
) {
  const { registerDialog, unregisterDialog } = useDialogStack();
  const id = dialogId || `dialog-${Math.random()}`;

  useEffect(() => {
    if (isOpen) {
      registerDialog({
        id,
        priority,
        onClose: () => {
          onOpenChange(false);
          triggerHaptic('light');
        }
      });

      triggerHaptic('light'); // Haptic on open

      return () => {
        unregisterDialog(id);
      };
    }
  }, [isOpen, id, priority, onOpenChange, registerDialog, unregisterDialog]);

  return id;
}
```

#### 2.2 Dialog Component Updates

**Example: AddExpenseDialog.tsx**

```tsx
// Add at top
import { useDialogRegistration } from '../hooks/useDialogRegistration';
import { DialogPriority } from '../constants';

// Inside component
export function AddExpenseDialog({ isOpen, onOpenChange, ... }) {
  // Register dialog to stack
  useDialogRegistration(
    isOpen, 
    onOpenChange, 
    DialogPriority.MEDIUM,
    'add-expense-dialog'
  );

  // Rest of component...
}
```

### Phase 3: Swipe Gestures

#### 3.1 useSwipeGesture Hook

**File:** `/hooks/useSwipeGesture.ts`

```tsx
import { useRef, useCallback } from 'react';

interface SwipeConfig {
  onSwipeDown?: () => void;
  threshold?: number; // pixels
  velocityThreshold?: number; // pixels/ms
}

export function useSwipeGesture(config: SwipeConfig) {
  const {
    onSwipeDown,
    threshold = 100,
    velocityThreshold = 0.5
  } = config;

  const touchStart = useRef<{ y: number; time: number } | null>(null);
  const currentTranslate = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = {
      y: e.touches[0].clientY,
      time: Date.now()
    };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent, element: HTMLElement) => {
    if (!touchStart.current) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStart.current.y;

    // Only allow downward swipes
    if (deltaY > 0) {
      currentTranslate.current = deltaY;
      
      // Apply transform
      element.style.transform = `translateY(${deltaY}px)`;
      
      // Fade backdrop
      const opacity = Math.max(0, 1 - (deltaY / 300));
      const backdrop = element.closest('[role="dialog"]')?.previousSibling as HTMLElement;
      if (backdrop) {
        backdrop.style.opacity = opacity.toString();
      }
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent, element: HTMLElement) => {
    if (!touchStart.current) return;

    const deltaY = currentTranslate.current;
    const deltaTime = Date.now() - touchStart.current.time;
    const velocity = deltaY / deltaTime;

    const shouldDismiss = deltaY > threshold || velocity > velocityThreshold;

    if (shouldDismiss && onSwipeDown) {
      // Animate to bottom
      element.style.transition = 'transform 0.3s ease-out';
      element.style.transform = 'translateY(100%)';
      
      setTimeout(() => {
        onSwipeDown();
      }, 300);
    } else {
      // Animate back to original position
      element.style.transition = 'transform 0.3s ease-out';
      element.style.transform = 'translateY(0)';
      
      const backdrop = element.closest('[role="dialog"]')?.previousSibling as HTMLElement;
      if (backdrop) {
        backdrop.style.transition = 'opacity 0.3s ease-out';
        backdrop.style.opacity = '1';
      }
    }

    // Reset
    touchStart.current = null;
    currentTranslate.current = 0;
    
    // Remove transition after animation
    setTimeout(() => {
      element.style.transition = '';
    }, 300);
  }, [threshold, velocityThreshold, onSwipeDown]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
}
```

#### 3.2 Enhanced Dialog Component

**File:** `/components/ui/dialog.tsx`

Add swipe support to DialogContent:

```tsx
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    enableSwipe?: boolean;
  }
>(({ className, children, enableSwipe = true, ...props }, ref) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { onOpenChange } = props as any;

  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipeGesture({
    onSwipeDown: () => {
      onOpenChange?.(false);
      triggerHaptic('light');
    },
    threshold: 100,
    velocityThreshold: 0.5
  });

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={mergeRefs([ref, contentRef])}
        className={cn(
          "...",
          // Add touch-action for better gesture handling
          "touch-pan-y",
          className
        )}
        onTouchStart={enableSwipe ? handleTouchStart : undefined}
        onTouchMove={enableSwipe ? (e) => {
          if (contentRef.current) {
            handleTouchMove(e, contentRef.current);
          }
        } : undefined}
        onTouchEnd={enableSwipe ? (e) => {
          if (contentRef.current) {
            handleTouchEnd(e, contentRef.current);
          }
        } : undefined}
        {...props}
      >
        {/* Swipe indicator for mobile */}
        {enableSwipe && (
          <div className="md:hidden w-12 h-1 bg-muted rounded-full mx-auto mb-4" />
        )}
        {children}
        <DialogPrimitive.Close className="..." />
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
```

### Phase 4: App Integration

#### 4.1 Update App.tsx

```tsx
import { DialogStackProvider } from './contexts/DialogStackContext';
import { useMobileBackButton } from './hooks/useMobileBackButton';

function App() {
  // Setup back button handler
  useMobileBackButton();

  return (
    <DialogStackProvider>
      {/* Rest of app */}
    </DialogStackProvider>
  );
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// hooks/useMobileBackButton.test.ts
describe('useMobileBackButton', () => {
  it('should close dialog on back button press', () => {});
  it('should show exit toast on back press with no dialogs', () => {});
  it('should exit app on double back press', () => {});
});

// hooks/useSwipeGesture.test.ts
describe('useSwipeGesture', () => {
  it('should detect swipe down gesture', () => {});
  it('should not trigger on swipe up', () => {});
  it('should trigger on fast swipe (velocity)', () => {});
});
```

### Integration Tests

```typescript
// Dialog integration
describe('Dialog with mobile gestures', () => {
  it('should close on back button', () => {});
  it('should close on swipe down', () => {});
  it('should register to dialog stack', () => {});
  it('should unregister on close', () => {});
});
```

### Manual Testing Checklist

See: `/planning/mobile-gesture-support/TESTING_CHECKLIST.md`

---

## Risk Assessment

### High Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| Gesture conflicts with scroll | High | Detect scroll vs swipe intent |
| Performance on low-end devices | High | Use GPU-accelerated transforms |
| Breaking existing functionality | High | Thorough testing, gradual rollout |

### Medium Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| Capacitor build issues | Medium | Test early, have fallbacks |
| Dialog stack race conditions | Medium | Use functional state updates |
| Animation jank | Medium | Profile and optimize |

### Low Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| Bundle size increase | Low | Tree-shaking, code splitting |
| Type errors | Low | Strict TypeScript |

---

## Success Criteria

### Must Have ✅
- [ ] Back button closes dialogs
- [ ] Swipe down closes dialogs
- [ ] No gesture conflicts
- [ ] Works on real Android device
- [ ] No performance regression

### Should Have 🎯
- [ ] Haptic feedback
- [ ] Smooth animations (60fps)
- [ ] Exit confirmation
- [ ] Dialog priority handling

### Nice to Have ✨
- [ ] Status bar color sync
- [ ] Edge swipe gestures
- [ ] Keyboard management
- [ ] Pull to refresh (future)

---

**Next:** Read [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) untuk step-by-step implementation.
