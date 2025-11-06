# FAB System - Technical Specifications

## 🏗️ Architecture

### Component Hierarchy
```
<FloatingActionButton>
  ├── <motion.div> (main FAB container)
  │   ├── <motion.button> (main trigger button)
  │   │   └── <Plus icon> (rotates when expanded)
  │   └── <AnimatePresence>
  │       └── <motion.div> (action buttons container)
  │           ├── <ActionButton icon={Receipt} /> (Expense)
  │           ├── <ActionButton icon={DollarSign} /> (Income)
  │           └── <ActionButton icon={Eye} /> (Summary)
  └── <motion.button> (chevron toggle - manual hide)
```

## 📐 Positioning & Layout

### Desktop (>= 768px)
```css
position: fixed;
bottom: 2rem;        /* 32px */
right: 2rem;         /* 32px */
z-index: 40;         /* Below dialogs (50), above content */
```

### Mobile (< 768px)
```css
position: fixed;
bottom: 1.5rem;      /* 24px */
right: 1.5rem;       /* 24px */
z-index: 40;
```

## 🎨 Dimensions

### Main FAB Button
- **Size**: 56px × 56px (mobile), 64px × 64px (desktop)
- **Border Radius**: 9999px (full circle)
- **Touch Target**: Minimum 48x48px (WCAG compliance)
- **Background**: Primary color (`hsl(var(--primary))`)
- **Shadow**: `shadow-lg` + `shadow-primary/20`

### Action Buttons
- **Size**: 48px × 48px
- **Border Radius**: 9999px
- **Spacing**: 12px gap between buttons
- **Background**: White with border
- **Hover**: Scale 1.05 + shadow-md

### Chevron Toggle
- **Size**: 24px × 24px
- **Position**: Absolute left edge of FAB
- **Background**: Semi-transparent white
- **Icon Size**: 16px

## 🎭 Animation Specifications

### Expand/Collapse Animation (motion/react)
```typescript
const fabVariants = {
  collapsed: {
    scale: 1,
    rotate: 0
  },
  expanded: {
    scale: 1.1,
    rotate: 45  // Plus icon becomes X
  }
}

const actionButtonVariants = {
  hidden: { 
    scale: 0, 
    opacity: 0,
    y: 20
  },
  visible: (i: number) => ({
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,  // Stagger animation
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  })
}
```

### Auto-Hide Scroll Animation
```typescript
const scrollVariants = {
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 }
  },
  hidden: {
    x: "90%",  // Menyisakan 10% circle
    opacity: 0.7,
    transition: { type: "spring", stiffness: 300, damping: 30 }
  }
}
```

### Manual Toggle Animation
```typescript
const manualHideVariants = {
  visible: {
    x: 0,
    opacity: 1
  },
  hidden: {
    x: "calc(100% - 8px)",  // Hanya chevron yang terlihat
    opacity: 0.5
  }
}
```

## 🪝 React Hooks & State Management

### State Variables
```typescript
const [isExpanded, setIsExpanded] = useState(false)
const [isScrollHidden, setIsScrollHidden] = useState(false)
const [isManuallyHidden, setIsManuallyHidden] = useState(false)
const [lastScrollY, setLastScrollY] = useState(0)
```

### Custom Hook: useScrollDirection
```typescript
const useScrollDirection = () => {
  const [isScrolling, setIsScrolling] = useState(false)
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up')
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > lastScrollY) {
        setScrollDirection('down')
      } else {
        setScrollDirection('up')
      }
      
      setIsScrolling(true)
      setLastScrollY(currentScrollY)
      
      // Clear previous timeout
      clearTimeout(timeoutId)
      
      // Set new timeout for idle detection (2 seconds)
      timeoutId = setTimeout(() => {
        setIsScrolling(false)
      }, 2000)
    }
    
    // Debounced scroll listener (16ms = 60fps)
    const debouncedScroll = debounce(handleScroll, 16)
    
    window.addEventListener('scroll', debouncedScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', debouncedScroll)
      clearTimeout(timeoutId)
    }
  }, [lastScrollY])
  
  return { isScrolling, scrollDirection }
}
```

### Visibility Logic
```typescript
const shouldHide = useMemo(() => {
  if (isManuallyHidden) return true
  if (isScrolling && scrollDirection === 'down') return true
  return false
}, [isManuallyHidden, isScrolling, scrollDirection])
```

## 🎯 Action Handlers

### Action 1: Add Expense
```typescript
const handleAddExpense = useCallback(() => {
  setIsExpanded(false)
  // Trigger AddExpenseDialog open
  // Implementation depends on existing dialog system
}, [])
```

### Action 2: Add Additional Income
```typescript
const handleAddIncome = useCallback(() => {
  setIsExpanded(false)
  // Trigger AddAdditionalIncomeDialog open
}, [])
```

### Action 3: Toggle Pockets Summary
```typescript
const handleToggleSummary = useCallback(() => {
  setIsExpanded(false)
  // Toggle PocketsSummary visibility
  // May need to add state to App.tsx or use context
}, [])
```

## 🔧 Props Interface

```typescript
interface FloatingActionButtonProps {
  onAddExpense: () => void
  onAddIncome: () => void
  onToggleSummary: () => void
  className?: string
  // Optional: Allow disabling specific actions
  disableExpense?: boolean
  disableIncome?: boolean
  disableSummary?: boolean
}
```

## 📦 Dependencies

```typescript
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Receipt, DollarSign, Eye, ChevronRight, ChevronLeft } from 'lucide-react'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { debounce } from '../utils/debounce'
```

## ⚡ Performance Considerations

1. **Debounced Scroll**: Limit scroll listener to max 60fps (16ms)
2. **useMemo**: Compute shouldHide dengan memoization
3. **useCallback**: Semua event handlers wrapped
4. **Passive Listeners**: Use `{ passive: true }` untuk scroll events
5. **AnimatePresence**: Only mount action buttons when expanded
6. **Will-Change**: Add `will-change: transform` untuk smooth animations

## 🎨 Styling Classes

```typescript
const fabClasses = cn(
  "fixed z-40 flex flex-col items-end gap-3",
  "bottom-6 right-6 md:bottom-8 md:right-8"
)

const mainButtonClasses = cn(
  "w-14 h-14 md:w-16 md:h-16 rounded-full",
  "bg-primary text-primary-foreground",
  "shadow-lg shadow-primary/20",
  "flex items-center justify-center",
  "transition-colors hover:bg-primary/90",
  "active:scale-95"
)

const actionButtonClasses = cn(
  "w-12 h-12 rounded-full bg-background",
  "border-2 border-primary/20",
  "flex items-center justify-center",
  "shadow-md hover:shadow-lg",
  "transition-all hover:scale-105"
)

const chevronClasses = cn(
  "absolute -left-2 top-1/2 -translate-y-1/2",
  "w-6 h-6 rounded-full",
  "bg-white/80 backdrop-blur-sm",
  "border border-primary/20",
  "flex items-center justify-center",
  "shadow-sm"
)
```

## 🔒 Z-Index Hierarchy

```
Dialogs: 50
FAB: 40
Mobile Sticky Header: 30
Dropdown/Popover: 20
Content: 0-10
```

## 📱 Mobile Specific Considerations

1. **Touch Events**: Use `onTouchStart` fallback if needed
2. **Safe Area**: Consider iOS notch with `env(safe-area-inset-bottom)`
3. **Vibration Feedback**: Optional haptic feedback on Capacitor
4. **Back Button**: Don't interfere with existing back button handler
5. **Keyboard**: Auto-hide when keyboard opens (optional)

## 🧪 Testing Requirements

- [ ] Expand/collapse animations smooth 60fps
- [ ] Auto-hide triggers after 2s idle
- [ ] Manual toggle persists state
- [ ] All 3 actions trigger correct dialogs
- [ ] No z-index conflicts with existing UI
- [ ] Touch targets >= 48x48px
- [ ] Works on Android Capacitor build
- [ ] No memory leaks from scroll listeners
- [ ] Debounce prevents excessive re-renders

---

**Last Updated**: November 6, 2025
