# FAB System - Rollback & Troubleshooting Guide

## 🚨 Emergency Rollback Procedures

### Level 1: Quick Disable (Non-Destructive)

**Time Required**: 30 seconds  
**Risk Level**: 🟢 Low

```typescript
// In /App.tsx, comment out the FAB component

// BEFORE
<FloatingActionButton
  onAddExpense={handleFABAddExpense}
  onAddIncome={handleFABAddIncome}
  onToggleSummary={handleFABToggleSummary}
/>

// AFTER
{/* TEMPORARILY DISABLED - FAB causing issues
<FloatingActionButton
  onAddExpense={handleFABAddExpense}
  onAddIncome={handleFABAddIncome}
  onToggleSummary={handleFABToggleSummary}
/>
*/}
```

**Result**: FAB hidden, no functionality lost (actions still accessible elsewhere)

---

### Level 2: Full Component Removal

**Time Required**: 2 minutes  
**Risk Level**: 🟡 Medium

#### Step 1: Remove from App.tsx
```typescript
// Remove import
- import { FloatingActionButton } from './components/FloatingActionButton'

// Remove callback handlers
- const handleFABAddExpense = useCallback(() => {
-   setIsAddExpenseOpen(true)
- }, [])
- 
- const handleFABAddIncome = useCallback(() => {
-   setIsAddIncomeOpen(true)
- }, [])
- 
- const handleFABToggleSummary = useCallback(() => {
-   setShowSummary(prev => !prev)
- }, [])

// Remove JSX
- <FloatingActionButton
-   onAddExpense={handleFABAddExpense}
-   onAddIncome={handleFABAddIncome}
-   onToggleSummary={handleFABToggleSummary}
- />
```

#### Step 2: Delete Component File
```bash
rm /components/FloatingActionButton.tsx
```

#### Step 3: Clear Browser Cache
```bash
# Chrome DevTools: Right-click Refresh → Empty Cache and Hard Reload
# Or manually clear cache in browser settings
```

---

### Level 3: Git Revert (Complete Rollback)

**Time Required**: 5 minutes  
**Risk Level**: 🔴 High (reverts all changes)

```bash
# Find the commit before FAB implementation
git log --oneline

# Revert to specific commit
git revert <commit-hash>

# Or reset to previous state (DESTRUCTIVE)
git reset --hard <commit-hash>

# Force push if already deployed
git push origin main --force
```

---

## 🛠️ Troubleshooting Guide

### Issue Category 1: Visual Issues

#### Problem 1.1: FAB Not Visible

**Symptoms**:
- FAB doesn't appear on page load
- Console has no errors

**Possible Causes**:
1. Z-index conflict
2. Component not imported
3. CSS display:none somewhere
4. Parent container overflow:hidden

**Solutions**:

```typescript
// Solution 1: Check z-index
// In FloatingActionButton.tsx
<div className="fixed z-50"> {/* Temporarily increase to 50 */}

// Solution 2: Verify import in App.tsx
import { FloatingActionButton } from './components/FloatingActionButton'

// Solution 3: Add !important (temporary debug)
<div className="!block !opacity-100">

// Solution 4: Check parent overflow
// In App.tsx or layout wrapper
<div className="overflow-visible"> {/* Instead of overflow-hidden */}
```

**Debug Steps**:
```typescript
// Add console.log to verify render
export function FloatingActionButton() {
  console.log('FAB Component Rendered')  // Should appear in console
  
  useEffect(() => {
    console.log('FAB Mounted')  // Should appear on mount
  }, [])
  
  // ...
}
```

---

#### Problem 1.2: FAB Positioned Incorrectly

**Symptoms**:
- FAB appears in wrong location
- FAB overlaps content
- Spacing incorrect

**Solutions**:

```typescript
// Check positioning classes
<div className={cn(
  "fixed z-40",
  "bottom-6 right-6",        // Mobile
  "md:bottom-8 md:right-8"   // Desktop
)}>

// Verify no conflicting styles
// Remove any position:absolute from parent
// Remove any transform from parent (breaks fixed positioning)

// Add visual debugging
<div className="fixed bottom-0 right-0 w-4 h-4 bg-red-500">
  {/* Debug marker at bottom-right corner */}
</div>
```

---

#### Problem 1.3: Action Buttons Not Aligned

**Symptoms**:
- Buttons misaligned vertically
- Gaps uneven
- Buttons overlap

**Solutions**:

```typescript
// Ensure flex-col is applied
<div className="flex flex-col gap-3">  {/* gap-3 = 12px */}
  {/* Action buttons */}
</div>

// Check if AnimatePresence is wrapping correctly
<AnimatePresence>
  {isExpanded && (
    <motion.div className="flex flex-col gap-3">
      {/* Actions */}
    </motion.div>
  )}
</AnimatePresence>

// Verify button widths are consistent
<button className="w-12 h-12">  {/* Should be same for all */}
```

---

### Issue Category 2: Animation Issues

#### Problem 2.1: Animations Janky or Laggy

**Symptoms**:
- Stuttering during expand/collapse
- Low FPS
- Delayed response

**Solutions**:

```typescript
// Solution 1: Add will-change
<motion.div
  style={{ willChange: 'transform, opacity' }}
  // ...
>

// Solution 2: Use GPU-accelerated properties only
// ✅ Use: transform, opacity
// ❌ Avoid: width, height, margin, padding

// Solution 3: Reduce spring stiffness
transition: {
  type: 'spring',
  stiffness: 200,  // Reduced from 300
  damping: 25      // Increased from 20
}

// Solution 4: Check for heavy renders
const Component = React.memo(FloatingActionButton)
```

**Debug Steps**:
```typescript
// Chrome DevTools → Performance Tab
// 1. Click Record
// 2. Trigger animation
// 3. Stop recording
// 4. Look for long tasks (>16ms for 60fps)
```

---

#### Problem 2.2: Stagger Animation Not Working

**Symptoms**:
- All action buttons appear simultaneously
- No sequential delay

**Solutions**:

```typescript
// Verify custom prop is passed
<motion.button
  custom={i}  // IMPORTANT: Must pass index
  variants={actionButtonVariants}
  initial="hidden"
  animate="visible"
>

// Check variant definition
const actionButtonVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (i: number) => ({  // MUST be a function
    scale: 1,
    opacity: 1,
    transition: {
      delay: i * 0.1  // Stagger delay
    }
  })
}

// Ensure index is correct
{actions.map((action, i) => (
  <motion.button
    key={action.id}
    custom={i}  // Pass index: 0, 1, 2
    // ...
  />
))}
```

---

#### Problem 2.3: Auto-Hide Not Triggering

**Symptoms**:
- FAB doesn't hide when scrolling
- FAB stays visible always

**Solutions**:

```typescript
// Solution 1: Check scroll listener is attached
useEffect(() => {
  const handleScroll = () => {
    console.log('Scroll event fired', window.scrollY)
  }
  
  window.addEventListener('scroll', handleScroll, { passive: true })
  
  return () => {
    window.removeEventListener('scroll', handleScroll)
    console.log('Scroll listener removed')
  }
}, [])

// Solution 2: Verify debounce is working
const debouncedScroll = debounce(handleScroll, 16)
console.log('Debounced function created:', typeof debouncedScroll)

// Solution 3: Check shouldHide logic
const shouldHide = useMemo(() => {
  console.log('Computing shouldHide:', {
    isManuallyHidden,
    isScrolling,
    scrollDirection
  })
  // ...
}, [isManuallyHidden, isScrolling, scrollDirection])

// Solution 4: Verify animation variant
<motion.div
  animate={shouldHide ? 'hidden' : 'visible'}  // Check this value
  variants={scrollVariants}
  onAnimationComplete={() => console.log('Animation complete')}
>
```

---

### Issue Category 3: Performance Issues

#### Problem 3.1: Excessive Re-renders

**Symptoms**:
- Console logs spamming
- UI feels sluggish
- React DevTools shows many renders

**Solutions**:

```typescript
// Solution 1: Memoize computed values
const shouldHide = useMemo(() => {
  // ... computation
}, [isManuallyHidden, isScrolling, scrollDirection])

// Solution 2: useCallback for handlers
const handleExpand = useCallback(() => {
  setIsExpanded(prev => !prev)
}, [])

const handleAction = useCallback((action: () => void) => {
  action()
  setIsExpanded(false)
}, [])

// Solution 3: Memo action buttons array
const actions = useMemo(() => [
  { id: 'expense', onClick: onAddExpense, icon: Receipt },
  // ...
], [onAddExpense, onAddIncome, onToggleSummary])

// Solution 4: React.memo component
export const FloatingActionButton = React.memo(
  function FloatingActionButton(props) {
    // ...
  }
)
```

**Debug Steps**:
```bash
# Install React DevTools Profiler
# Chrome Extension: React Developer Tools

# Steps:
1. Open DevTools → Profiler tab
2. Click Record
3. Interact with FAB
4. Stop recording
5. Analyze flame graph (look for unnecessary renders)
```

---

#### Problem 3.2: Memory Leak

**Symptoms**:
- Memory usage increases over time
- Browser tab crashes after extended use
- Console warnings about memory

**Solutions**:

```typescript
// Solution 1: Cleanup event listeners
useEffect(() => {
  const handleScroll = () => { /* ... */ }
  const debouncedScroll = debounce(handleScroll, 16)
  
  window.addEventListener('scroll', debouncedScroll, { passive: true })
  
  return () => {
    window.removeEventListener('scroll', debouncedScroll)  // ✅ Cleanup
  }
}, [])

// Solution 2: Clear timeouts
useEffect(() => {
  let timeoutId: NodeJS.Timeout
  
  const handleScroll = () => {
    clearTimeout(timeoutId)  // ✅ Clear previous timeout
    timeoutId = setTimeout(() => { /* ... */ }, 2000)
  }
  
  return () => {
    clearTimeout(timeoutId)  // ✅ Cleanup on unmount
  }
}, [])

// Solution 3: Abort controllers for async operations
useEffect(() => {
  const abortController = new AbortController()
  
  // Async operation
  fetch('/api/data', { signal: abortController.signal })
  
  return () => {
    abortController.abort()  // ✅ Cancel pending requests
  }
}, [])
```

**Debug Steps**:
```bash
# Chrome DevTools → Memory Tab
1. Take heap snapshot (initial)
2. Interact with FAB for 2 minutes
3. Take another heap snapshot
4. Compare snapshots
5. Look for detached DOM nodes or growing arrays
```

---

### Issue Category 4: Integration Issues

#### Problem 4.1: Actions Not Triggering Dialogs

**Symptoms**:
- Click action button, nothing happens
- No console errors
- Dialog doesn't open

**Solutions**:

```typescript
// Solution 1: Verify callbacks are passed correctly
// In App.tsx
const handleFABAddExpense = useCallback(() => {
  console.log('FAB Add Expense clicked')  // Debug log
  setIsAddExpenseOpen(true)
}, [])

<FloatingActionButton
  onAddExpense={handleFABAddExpense}  // ✅ Callback passed
  // ...
/>

// Solution 2: Check if callback is defined
// In FloatingActionButton.tsx
const handleAction = (callback: () => void) => {
  if (typeof callback !== 'function') {
    console.error('Invalid callback:', callback)
    return
  }
  
  callback()
  setIsExpanded(false)
}

// Solution 3: Verify state setters work
// Test directly in console:
setIsAddExpenseOpen(true)  // Should open dialog

// Solution 4: Check dialog component mounting
{isAddExpenseOpen && (
  <AddExpenseDialog
    isOpen={isAddExpenseOpen}  // ✅ Controlled
    onClose={() => setIsAddExpenseOpen(false)}
  />
)}
```

---

#### Problem 4.2: Z-Index Conflicts

**Symptoms**:
- FAB appears above dialogs
- Dialogs hidden behind FAB
- Content overlapping incorrectly

**Solutions**:

```typescript
// Verify z-index hierarchy
FAB:         z-40
Dialogs:     z-50 (higher)
Popovers:    z-30
Header:      z-20

// If FAB is above dialog, reduce FAB z-index
<div className="fixed z-40">  {/* Not z-50 */}

// If dialog is below FAB, increase dialog z-index
// In dialog component
<div className="fixed inset-0 z-50">

// Check for z-index inheritance issues
// Remove any z-index from parent containers
```

---

#### Problem 4.3: Mobile Back Button Conflict

**Symptoms**:
- Back button doesn't work when FAB is expanded
- Back button closes wrong component

**Solutions**:

```typescript
// Solution 1: Integrate with existing useMobileBackButton hook
import { useMobileBackButton } from '../hooks/useMobileBackButton'

export function FloatingActionButton() {
  const [isExpanded, setIsExpanded] = useState(false)
  
  useMobileBackButton(
    isExpanded,                    // isOpen condition
    () => setIsExpanded(false),    // onClose callback
    'fab'                          // unique key
  )
  
  // ...
}

// Solution 2: Ensure correct priority order
// In useMobileBackButton.ts
const handlers = [
  { isOpen: isDialogOpen, onClose: closeDialog, priority: 1 },
  { isOpen: isFABExpanded, onClose: collapseFAB, priority: 2 },
]
```

---

### Issue Category 5: Mobile/Capacitor Issues

#### Problem 5.1: Touch Events Not Working

**Symptoms**:
- Buttons don't respond to touch on mobile
- Need to tap multiple times
- Touch area too small

**Solutions**:

```typescript
// Solution 1: Increase touch target size
<button className="w-12 h-12 p-3">  {/* Larger touch area */}

// Solution 2: Add touch-action CSS
<button
  className="touch-manipulation"
  style={{ touchAction: 'manipulation' }}
>

// Solution 3: Remove hover states on mobile
<button className="hover:scale-105 active:scale-95 md:hover:scale-105">
  {/* Only hover on desktop */}
</button>

// Solution 4: Add onTouchStart fallback
<button
  onClick={handleClick}
  onTouchStart={handleClick}  // Fallback for some devices
>
```

---

#### Problem 5.2: FAB Hidden by Keyboard (Mobile)

**Symptoms**:
- FAB disappears when keyboard opens
- FAB positioned incorrectly with keyboard

**Solutions**:

```typescript
// Solution 1: Detect keyboard visibility
import { Keyboard } from '@capacitor/keyboard'

useEffect(() => {
  const handleKeyboardShow = () => {
    setIsKeyboardVisible(true)
  }
  
  const handleKeyboardHide = () => {
    setIsKeyboardVisible(false)
  }
  
  Keyboard.addListener('keyboardWillShow', handleKeyboardShow)
  Keyboard.addListener('keyboardWillHide', handleKeyboardHide)
  
  return () => {
    Keyboard.removeAllListeners()
  }
}, [])

// Solution 2: Auto-hide FAB when keyboard opens
{!isKeyboardVisible && (
  <FloatingActionButton {...props} />
)}

// Solution 3: Adjust position dynamically
<div
  className={cn(
    "fixed z-40",
    isKeyboardVisible 
      ? "bottom-[320px]"  // Above keyboard
      : "bottom-6"        // Normal position
  )}
>
```

---

#### Problem 5.3: Scroll Behavior Different on iOS

**Symptoms**:
- Auto-hide doesn't work on iOS Safari
- Scroll events not firing

**Solutions**:

```typescript
// Solution 1: Use window scroll instead of document
window.addEventListener('scroll', handleScroll)
// Instead of:
document.addEventListener('scroll', handleScroll)

// Solution 2: Add -webkit-overflow-scrolling
<div className="overflow-auto" style={{
  WebkitOverflowScrolling: 'touch'
}}>

// Solution 3: Detect iOS and adjust behavior
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

const scrollConfig = {
  iosDelay: isIOS ? 3000 : 2000  // Longer delay on iOS
}
```

---

## 🔍 Debug Mode

### Enable Verbose Logging

```typescript
// In FloatingActionButton.tsx
const DEBUG = true  // Set to true for debugging

export function FloatingActionButton(props) {
  if (DEBUG) {
    console.log('FAB Props:', props)
  }
  
  const [isExpanded, setIsExpanded] = useState(false)
  
  useEffect(() => {
    if (DEBUG) {
      console.log('FAB State:', {
        isExpanded,
        isManuallyHidden,
        isScrolling,
        scrollDirection
      })
    }
  }, [isExpanded, isManuallyHidden, isScrolling, scrollDirection])
  
  const handleScroll = useCallback(() => {
    if (DEBUG) {
      console.log('Scroll:', {
        scrollY: window.scrollY,
        direction: scrollDirection
      })
    }
    // ...
  }, [scrollDirection])
  
  // ...
}
```

### Visual Debug Overlay

```typescript
// Add debug overlay to see state
{DEBUG && (
  <div className="fixed top-20 right-4 bg-black/80 text-white p-4 rounded-lg z-50">
    <div>Expanded: {isExpanded ? 'Yes' : 'No'}</div>
    <div>Hidden: {isManuallyHidden ? 'Yes' : 'No'}</div>
    <div>Scrolling: {isScrolling ? 'Yes' : 'No'}</div>
    <div>Direction: {scrollDirection}</div>
    <div>ScrollY: {window.scrollY}</div>
  </div>
)}
```

---

## 📊 Performance Monitoring

### Add Performance Markers

```typescript
const handleExpand = useCallback(() => {
  performance.mark('fab-expand-start')
  
  setIsExpanded(prev => !prev)
  
  requestAnimationFrame(() => {
    performance.mark('fab-expand-end')
    performance.measure('fab-expand', 'fab-expand-start', 'fab-expand-end')
    
    const measure = performance.getEntriesByName('fab-expand')[0]
    console.log('Expand duration:', measure.duration, 'ms')
  })
}, [])
```

---

## 📞 When to Seek Help

### Escalation Criteria

1. **Critical**: FAB crashes app or causes data loss
   - **Action**: Immediate rollback (Level 2 or 3)
   
2. **High**: FAB breaks existing functionality
   - **Action**: Rollback and debug in development
   
3. **Medium**: FAB has visual glitches
   - **Action**: Disable temporarily, fix in next release
   
4. **Low**: Minor animation issues
   - **Action**: Log issue, fix when convenient

---

## 🧪 Test Fixes

### Quick Test Checklist After Fix

- [ ] Run `npm run build` successfully
- [ ] Clear browser cache
- [ ] Test on mobile device (not just emulator)
- [ ] Verify all 3 actions work
- [ ] Check performance (60fps)
- [ ] Test with dialogs open
- [ ] Verify no console errors
- [ ] Test keyboard navigation

---

**Last Updated**: November 6, 2025  
**Maintainer**: Development Team  
**Emergency Contact**: [Your contact info]
