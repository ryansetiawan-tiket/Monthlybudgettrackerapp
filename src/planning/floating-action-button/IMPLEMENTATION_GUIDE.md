# FAB System - Implementation Guide

## 📋 Pre-Implementation Checklist

- [ ] Review TECHNICAL_SPECS.md
- [ ] Review VISUAL_DESIGN.md
- [ ] Backup current App.tsx
- [ ] Ensure no existing FAB conflicts
- [ ] Verify motion/react is imported correctly
- [ ] Check z-index hierarchy in globals.css

## 🎯 Implementation Phases

### Phase 1: Core FAB Component (30 min)
**Goal**: Create basic FAB with expand/collapse functionality

#### Step 1.1: Create FloatingActionButton.tsx
```bash
# File: /components/FloatingActionButton.tsx
```

**Tasks**:
- [ ] Create component file
- [ ] Import dependencies (motion, icons, hooks)
- [ ] Define Props interface
- [ ] Setup state variables (isExpanded)
- [ ] Create main FAB button with Plus icon
- [ ] Add expand/collapse animation variants

#### Step 1.2: Implement Action Buttons
**Tasks**:
- [ ] Create action buttons array
- [ ] Implement stagger animation (0.1s delay each)
- [ ] Add AnimatePresence wrapper
- [ ] Connect action handlers (onAddExpense, onAddIncome, onToggleSummary)
- [ ] Test expand/collapse animations

#### Step 1.3: Styling & Positioning
**Tasks**:
- [ ] Add fixed positioning (bottom-right)
- [ ] Implement responsive sizing (mobile vs desktop)
- [ ] Apply colors from design system
- [ ] Add shadow and hover effects
- [ ] Test z-index hierarchy

**Validation**:
- [ ] FAB visible di kanan bawah
- [ ] Click FAB → 3 buttons muncul dengan stagger
- [ ] Click FAB lagi → buttons hilang
- [ ] Animations smooth 60fps
- [ ] No layout shift

---

### Phase 2: Auto-Hide Scroll Behavior (20 min)
**Goal**: Implement auto-hide saat scrolling dengan 10% visibility

#### Step 2.1: Create useScrollDirection Hook
```bash
# Add to /components/FloatingActionButton.tsx or separate hook file
```

**Tasks**:
- [ ] Track scroll position (lastScrollY)
- [ ] Detect scroll direction (up/down)
- [ ] Implement debounce (16ms for 60fps)
- [ ] Add idle timer (2s after last scroll)
- [ ] Use passive event listener

#### Step 2.2: Implement Hide/Show Logic
**Tasks**:
- [ ] Add isScrollHidden state
- [ ] Create shouldHide useMemo
- [ ] Add scroll animation variants (translateX)
- [ ] Test auto-hide on scroll down
- [ ] Test auto-show after 2s idle

#### Step 2.3: Fine-tune Animation
**Tasks**:
- [ ] Set translateX to 90% (menyisakan 10%)
- [ ] Adjust opacity (0.7 when hidden)
- [ ] Add spring physics for smooth motion
- [ ] Test on different scroll speeds
- [ ] Ensure no jank or stuttering

**Validation**:
- [ ] Scroll down → FAB slides right (10% visible)
- [ ] Stop scrolling → after 2s FAB returns
- [ ] Scroll up → FAB stays visible
- [ ] Animations smooth tanpa lag
- [ ] Debounce working (no excessive re-renders)

---

### Phase 3: Manual Toggle Chevron (15 min)
**Goal**: Add chevron button untuk manual show/hide

#### Step 3.1: Add Chevron Button
**Tasks**:
- [ ] Add isManuallyHidden state
- [ ] Create chevron button (24x24px)
- [ ] Position absolute at left edge of FAB
- [ ] Add ChevronLeft/ChevronRight icon swap
- [ ] Implement toggle handler

#### Step 3.2: Integrate Manual Hide Logic
**Tasks**:
- [ ] Update shouldHide to check isManuallyHidden
- [ ] Manual hide overrides auto-hide
- [ ] Add animation for fully hidden state
- [ ] Chevron remains visible when FAB hidden
- [ ] Test toggle functionality

#### Step 3.3: Polish & Refinements
**Tasks**:
- [ ] Add backdrop-blur to chevron
- [ ] Adjust chevron positioning for all states
- [ ] Test interaction with expanded state
- [ ] Ensure chevron doesn't interfere with main FAB
- [ ] Add smooth rotation animation for icon swap

**Validation**:
- [ ] Chevron visible di edge FAB
- [ ] Click chevron → FAB hides, chevron stays
- [ ] Click chevron lagi → FAB shows
- [ ] Manual hide persists during scroll
- [ ] Icon rotation smooth

---

### Phase 4: Integration with Existing Dialogs (15 min)
**Goal**: Connect FAB actions ke existing dialogs

#### Step 4.1: Review Current Dialog System
**Tasks**:
- [ ] Read App.tsx dialog state management
- [ ] Identify how AddExpenseDialog opens
- [ ] Identify how AddAdditionalIncomeDialog opens
- [ ] Check PocketsSummary toggle mechanism
- [ ] Note any existing toggle states

#### Step 4.2: Create Callback Handlers in App.tsx
**Tasks**:
- [ ] Create handleFABAddExpense callback
- [ ] Create handleFABAddIncome callback
- [ ] Create handleFABToggleSummary callback
- [ ] Pass callbacks as props to FAB component
- [ ] Test each action triggers correct dialog

#### Step 4.3: Handle Edge Cases
**Tasks**:
- [ ] Close expanded FAB when action clicked
- [ ] Close expanded FAB when clicking outside
- [ ] Handle FAB state when dialog opens
- [ ] Prevent FAB from hiding when dialog is open (optional)
- [ ] Test rapid clicking / double-click prevention

**Validation**:
- [ ] Click "Add Expense" → AddExpenseDialog opens
- [ ] Click "Add Income" → AddAdditionalIncomeDialog opens
- [ ] Click "Toggle Summary" → PocketsSummary toggles
- [ ] FAB collapses after action
- [ ] No conflicts with existing functionality

---

### Phase 5: Testing & Polish (20 min)
**Goal**: Final testing dan performance optimization

#### Step 5.1: Performance Testing
**Tasks**:
- [ ] Profile component re-renders
- [ ] Check scroll listener performance
- [ ] Verify debounce is working
- [ ] Test on low-end devices (throttled)
- [ ] Measure animation fps (should be 60fps)

#### Step 5.2: Cross-Device Testing
**Tasks**:
- [ ] Test on mobile (< 768px)
- [ ] Test on tablet (768px - 1024px)
- [ ] Test on desktop (> 1024px)
- [ ] Test touch interactions
- [ ] Test keyboard navigation

#### Step 5.3: Accessibility Audit
**Tasks**:
- [ ] Add ARIA labels to all buttons
- [ ] Test keyboard navigation (Tab, Enter, Esc)
- [ ] Verify touch targets >= 48px
- [ ] Test with screen reader (if available)
- [ ] Respect prefers-reduced-motion

#### Step 5.4: Edge Cases & Bug Fixes
**Tasks**:
- [ ] Test during rapid scrolling
- [ ] Test when FAB is expanded and user scrolls
- [ ] Test z-index with all dialogs open
- [ ] Test on iOS Safari (if accessible)
- [ ] Fix any animation glitches

#### Step 5.5: Code Cleanup
**Tasks**:
- [ ] Remove console.logs
- [ ] Add JSDoc comments
- [ ] Optimize imports
- [ ] Extract magic numbers to constants
- [ ] Add TypeScript types for all props

**Final Validation Checklist**:
- [ ] All 3 actions working correctly
- [ ] Auto-hide smooth dan responsive
- [ ] Manual toggle working perfectly
- [ ] No performance issues (60fps)
- [ ] No z-index conflicts
- [ ] Accessible dengan keyboard
- [ ] Touch targets WCAG compliant
- [ ] Works on Capacitor build

---

## 🔧 Code Snippets

### Main Component Structure
```typescript
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Receipt, DollarSign, Eye, ChevronRight, ChevronLeft } from 'lucide-react'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { cn } from '../components/ui/utils'
import { debounce } from '../utils/debounce'

interface FloatingActionButtonProps {
  onAddExpense: () => void
  onAddIncome: () => void
  onToggleSummary: () => void
}

export function FloatingActionButton({
  onAddExpense,
  onAddIncome,
  onToggleSummary
}: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isManuallyHidden, setIsManuallyHidden] = useState(false)
  
  const { isScrolling, scrollDirection } = useScrollDirection()
  
  const shouldHide = useMemo(() => {
    if (isManuallyHidden) return 'manual'
    if (isScrolling && scrollDirection === 'down') return 'auto'
    return false
  }, [isManuallyHidden, isScrolling, scrollDirection])
  
  // ... implementation
  
  return (
    <div className={cn(
      "fixed z-40 flex flex-col items-end gap-3",
      "bottom-6 right-6 md:bottom-8 md:right-8"
    )}>
      {/* Action Buttons */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div className="flex flex-col gap-3">
            {/* Render 3 action buttons with stagger */}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main FAB */}
      <motion.button
        animate={shouldHide === 'manual' ? 'manualHidden' : shouldHide === 'auto' ? 'autoHidden' : 'visible'}
        variants={scrollVariants}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Plus icon with rotation */}
      </motion.button>
      
      {/* Chevron Toggle */}
      <motion.button
        onClick={() => setIsManuallyHidden(!isManuallyHidden)}
      >
        {/* Chevron icon */}
      </motion.button>
    </div>
  )
}
```

### useScrollDirection Hook
```typescript
function useScrollDirection() {
  const [isScrolling, setIsScrolling] = useState(false)
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up')
  const [lastScrollY, setLastScrollY] = useState(0)
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      setScrollDirection(currentScrollY > lastScrollY ? 'down' : 'up')
      setIsScrolling(true)
      setLastScrollY(currentScrollY)
      
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => setIsScrolling(false), 2000)
    }
    
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

### Integration in App.tsx
```typescript
import { FloatingActionButton } from './components/FloatingActionButton'

function App() {
  // ... existing state
  
  const handleFABAddExpense = useCallback(() => {
    setIsAddExpenseOpen(true)
  }, [])
  
  const handleFABAddIncome = useCallback(() => {
    setIsAddIncomeOpen(true)
  }, [])
  
  const handleFABToggleSummary = useCallback(() => {
    // Toggle pockets summary visibility
    // Implementation depends on current UI structure
  }, [])
  
  return (
    <div>
      {/* ... existing content */}
      
      <FloatingActionButton
        onAddExpense={handleFABAddExpense}
        onAddIncome={handleFABAddIncome}
        onToggleSummary={handleFABToggleSummary}
      />
    </div>
  )
}
```

---

## 🚨 Common Pitfalls & Solutions

### Issue 1: Scroll listener causing lag
**Solution**: Use debounce with 16ms (60fps) and passive event listener

### Issue 2: FAB jank during scroll
**Solution**: Add `will-change: transform` dan gunakan GPU-accelerated properties (translateX, opacity)

### Issue 3: Z-index conflicts
**Solution**: Set FAB z-index to 40, ensure dialogs use 50+

### Issue 4: Touch targets too small
**Solution**: Minimum 48x48px, add invisible padding if needed

### Issue 5: Animation not smooth on mobile
**Solution**: Use spring physics instead of duration-based animations

### Issue 6: Memory leak from scroll listener
**Solution**: Proper cleanup in useEffect return, clear timeouts

### Issue 7: FAB interferes with content
**Solution**: Add padding-bottom to content area (80px)

---

## 📊 Testing Checklist

### Functional Testing
- [ ] Expand/collapse works
- [ ] All 3 actions trigger correctly
- [ ] Auto-hide on scroll down
- [ ] Auto-show after idle
- [ ] Manual toggle works
- [ ] Manual toggle persists

### Performance Testing
- [ ] No scroll lag
- [ ] 60fps animations
- [ ] No memory leaks
- [ ] Debounce working
- [ ] Minimal re-renders

### Visual Testing
- [ ] Correct positioning
- [ ] Proper spacing
- [ ] Colors match design system
- [ ] Shadows render correctly
- [ ] Icons aligned

### Accessibility Testing
- [ ] Keyboard navigation
- [ ] ARIA labels present
- [ ] Touch targets adequate
- [ ] Focus indicators visible
- [ ] Screen reader compatible

### Cross-Device Testing
- [ ] Mobile (320px - 767px)
- [ ] Tablet (768px - 1024px)
- [ ] Desktop (1025px+)
- [ ] Touch interactions
- [ ] Mouse interactions

### Integration Testing
- [ ] Works with AddExpenseDialog
- [ ] Works with AddAdditionalIncomeDialog
- [ ] Works with PocketsSummary
- [ ] No conflicts with mobile back button
- [ ] No conflicts with sticky header

---

## 🎓 Learning Resources

- [Motion/React Docs](https://motion.dev/docs/react-quick-start)
- [FAB Best Practices](https://material.io/components/buttons-floating-action-button)
- [WCAG Touch Target Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)

---

**Last Updated**: November 6, 2025  
**Estimated Total Time**: ~100 minutes  
**Difficulty**: Medium
