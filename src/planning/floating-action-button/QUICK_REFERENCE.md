# FAB System - Quick Reference Guide

## 🚀 Quick Start

### Installation (Already Integrated)
```typescript
// In App.tsx
import { FloatingActionButton } from './components/FloatingActionButton'

<FloatingActionButton
  onAddExpense={() => setIsAddExpenseOpen(true)}
  onAddIncome={() => setIsAddIncomeOpen(true)}
  onToggleSummary={() => setShowSummary(prev => !prev)}
/>
```

## 📦 Component Location
```
/components/FloatingActionButton.tsx
```

## 🎯 Core Features

| Feature | Description | Default |
|---------|-------------|---------|
| **Auto-Expand** | Click main FAB to show 3 actions | Collapsed |
| **Auto-Hide** | Slides right (10% visible) when scrolling down | Enabled |
| **Idle Timer** | Returns after 2s of no scrolling | 2000ms |
| **Manual Toggle** | Chevron button to manually hide/show | Visible |
| **Stagger Animation** | Actions appear sequentially (0.1s each) | Enabled |

## 🎨 Props Cheat Sheet

```typescript
// Required Props
onAddExpense: () => void      // Callback when "Add Expense" clicked
onAddIncome: () => void       // Callback when "Add Income" clicked
onToggleSummary: () => void   // Callback when "Toggle Summary" clicked

// Optional Props
className?: string            // Additional CSS classes
disabled?: boolean           // Disable all interactions
hideOnScroll?: boolean       // Enable/disable auto-hide (default: true)
position?: 'bottom-right'    // FAB position (default: 'bottom-right')
size?: 'sm' | 'md' | 'lg'   // Size variant (default: 'md')
```

## 🔧 Common Modifications

### Change Auto-Hide Delay
```typescript
// In FloatingActionButton.tsx, line ~45
timeoutId = setTimeout(() => setIsScrolling(false), 2000) // Change 2000 to desired ms
```

### Change Visible Percentage When Hidden
```typescript
// In scrollVariants, line ~80
autoHidden: {
  x: '90%',  // Change to '95%' for 5% visible, '80%' for 20% visible
  // ...
}
```

### Disable Auto-Hide Completely
```typescript
<FloatingActionButton
  hideOnScroll={false}  // FAB stays visible always
  // ... other props
/>
```

### Change Position
```typescript
// Modify positioning classes in component
"bottom-6 right-6"  // Current: bottom-right
"bottom-6 left-6"   // Alternative: bottom-left
"top-6 right-6"     // Alternative: top-right
```

## 🎭 Animation Customization

### Adjust Spring Physics
```typescript
// In animation variants
transition: { 
  type: 'spring', 
  stiffness: 300,  // Increase for snappier (400+), decrease for softer (200-)
  damping: 30      // Increase for less bouncy (40+), decrease for more bouncy (20-)
}
```

### Change Stagger Delay
```typescript
// In actionButtonVariants
delay: i * 0.1  // Change 0.1 to 0.05 for faster, 0.15 for slower
```

## 🐛 Troubleshooting

### Issue: FAB Not Visible
**Solutions**:
- Check z-index hierarchy (FAB should be z-40)
- Verify component is imported in App.tsx
- Check if content is overlapping (add padding-bottom)

### Issue: Scroll Auto-Hide Not Working
**Solutions**:
- Verify `hideOnScroll={true}` is set
- Check if debounce is working (console.log in handleScroll)
- Ensure scroll listener is attached (check useEffect cleanup)

### Issue: Actions Not Triggering
**Solutions**:
- Verify callbacks are passed correctly
- Check if buttons are disabled
- Ensure onClick handlers are not undefined

### Issue: Animation Janky
**Solutions**:
- Check if GPU acceleration is enabled (use `will-change: transform`)
- Reduce stiffness in spring physics
- Ensure no heavy computations during animation
- Profile with React DevTools

### Issue: FAB Overlaps Other Elements
**Solutions**:
- Adjust z-index (FAB: 40, Dialogs: 50)
- Check positioning values (bottom, right)
- Add safe zones to content area

## 📱 Mobile Optimization Tips

### Improve Touch Experience
```typescript
// Add to button className
"active:scale-95"  // Visual feedback on press
"transition-transform"  // Smooth scale animation
```

### Prevent Accidental Clicks
```typescript
// Increase touch target padding
"p-3"  // Instead of p-2, gives more space
```

### Optimize for Thumb Zone
```typescript
// Position in easy-to-reach area (bottom-right or bottom-left)
position="bottom-right"  // Right-handed users
position="bottom-left"   // Left-handed users
```

## ⚡ Performance Tips

### Reduce Re-renders
```typescript
// Ensure callbacks are memoized in parent
const handleAddExpense = useCallback(() => {
  setIsAddExpenseOpen(true)
}, [])
```

### Optimize Scroll Listener
```typescript
// Already implemented with debounce
const debouncedScroll = debounce(handleScroll, 16)  // 60fps max
```

### Lazy Load If Needed
```typescript
// In App.tsx, if FAB is only needed conditionally
const FloatingActionButton = lazy(() => import('./components/FloatingActionButton'))

{showFAB && (
  <Suspense fallback={null}>
    <FloatingActionButton {...props} />
  </Suspense>
)}
```

## 🎨 Styling Customization

### Change Main FAB Color
```typescript
// Modify in FloatingActionButton.tsx
"bg-primary"  // Current
"bg-blue-600"  // Alternative: Blue
"bg-gradient-to-br from-purple-600 to-pink-600"  // Gradient
```

### Change Action Button Style
```typescript
// Current: White background with border
"bg-background border-2 border-primary/20"

// Alternative: Filled buttons
"bg-primary/10 border-0"  // Light tint

// Alternative: Glassmorphism
"bg-white/10 backdrop-blur-md border-white/20"
```

### Add Tooltip Labels (Optional)
```typescript
import { Tooltip } from './ui/tooltip'

<Tooltip content="Add Expense">
  <button {...props}>
    <Receipt />
  </button>
</Tooltip>
```

## 🔑 Keyboard Shortcuts (Optional Enhancement)

```typescript
// Add keyboard shortcuts in parent component
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'e') {
      handleAddExpense()  // Ctrl+E to add expense
    }
    if (e.ctrlKey && e.key === 'i') {
      handleAddIncome()  // Ctrl+I to add income
    }
    if (e.ctrlKey && e.key === 's') {
      handleToggleSummary()  // Ctrl+S to toggle summary
    }
  }
  
  window.addEventListener('keydown', handleKeyPress)
  return () => window.removeEventListener('keydown', handleKeyPress)
}, [])
```

## 📊 State Management

### FAB Component States
```typescript
isExpanded: boolean           // True when action buttons visible
isManuallyHidden: boolean    // True when user manually hides FAB
isScrolling: boolean         // True during scroll (resets after 2s)
scrollDirection: 'up'|'down' // Current scroll direction
lastScrollY: number          // Last scroll position for comparison
```

### Computed State
```typescript
shouldHide: 'manual' | 'auto' | false
// 'manual' - user clicked chevron to hide
// 'auto'   - auto-hidden due to scrolling
// false    - fully visible
```

## 🔄 Lifecycle

### Mount
1. Component renders with collapsed state
2. Scroll listener attached
3. FAB appears in bottom-right corner

### User Interactions
```
Click Main FAB → isExpanded = true → 3 actions appear (stagger)
Click Action → Execute callback → isExpanded = false
Click Chevron → isManuallyHidden = !isManuallyHidden
Scroll Down → isScrolling = true, scrollDirection = 'down' → FAB hides
Stop Scroll → After 2s → isScrolling = false → FAB shows
```

### Unmount
1. Cleanup scroll listener
2. Clear all timeouts
3. Remove event listeners

## 📐 Size Reference

| Element | Mobile | Desktop |
|---------|--------|---------|
| Main FAB | 56×56px | 64×64px |
| Action Button | 48×48px | 48×48px |
| Chevron | 24×24px | 24×24px |
| Gap between actions | 12px | 12px |
| Bottom spacing | 24px | 32px |
| Right spacing | 24px | 32px |

## 🎯 Z-Index Hierarchy

```
Dialogs / Modals: 50
FAB: 40
Dropdowns / Popovers: 30
Sticky Header: 20
Content: 0-10
```

## 🧩 Integration Points

### Current Integration
```typescript
// In App.tsx
<FloatingActionButton
  onAddExpense={() => setIsAddExpenseOpen(true)}
  onAddIncome={() => setIsAddIncomeOpen(true)}
  onToggleSummary={() => {/* toggle logic */}}
/>
```

### Future Enhancements
- Add haptic feedback on Capacitor (Haptics.impact())
- Persist manual hide state to localStorage
- Add sound effects (optional)
- Add badge count for pending actions
- Add long-press menu for more actions

## 🚨 Important Notes

1. **Don't modify z-index** without checking hierarchy
2. **Keep debounce at 16ms** for 60fps performance
3. **Always memoize callbacks** in parent component
4. **Test on real devices** before production
5. **Respect accessibility** - maintain touch target sizes

## 📚 Related Documentation

- **TECHNICAL_SPECS.md** - Detailed technical implementation
- **VISUAL_DESIGN.md** - Visual mockups and design specs
- **IMPLEMENTATION_GUIDE.md** - Step-by-step implementation
- **COMPONENT_API.md** - Full API reference
- **TESTING_CHECKLIST.md** - QA checklist

## 🆘 Emergency Rollback

### Quick Disable
```typescript
// In App.tsx, comment out FAB
{/* <FloatingActionButton ... /> */}
```

### Full Removal
1. Remove `import { FloatingActionButton }` from App.tsx
2. Remove `<FloatingActionButton />` JSX
3. Delete `/components/FloatingActionButton.tsx`
4. Clear browser cache

## 📞 Support

**Documentation**: `/planning/floating-action-button/`  
**Component**: `/components/FloatingActionButton.tsx`  
**Last Updated**: November 6, 2025

---

**Version**: 1.0.0  
**Status**: Production Ready  
**Maintenance**: Low (self-contained component)
