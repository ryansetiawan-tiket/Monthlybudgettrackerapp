# Toggle Pockets - Quick Reference

## 🎯 Quick Overview

**Feature:** Toggle visibility section Ringkasan Kantong dengan button Wallet  
**Location:** Sisa Budget section (next to Settings button)  
**Storage:** localStorage (persistent)  
**Files Modified:** 2 files

## 📝 Summary

| Aspect | Detail |
|--------|--------|
| Button Icon | 💰 Wallet |
| Position | Next to ⚙️ Settings button |
| Default State | Shown (true) |
| Storage Key | `showPockets` |
| Animation | Fade + slide (0.25s delay) |

## 🔧 Implementation

### 1. State (App.tsx)
```tsx
// Initialize with localStorage
const [showPockets, setShowPockets] = useState(() => {
  const saved = localStorage.getItem('showPockets');
  return saved !== null ? JSON.parse(saved) : true;
});

// Toggle handler
const handleTogglePockets = () => {
  setShowPockets(prev => {
    const newValue = !prev;
    localStorage.setItem('showPockets', JSON.stringify(newValue));
    return newValue;
  });
};
```

### 2. Props (BudgetOverview.tsx)
```tsx
interface BudgetOverviewProps {
  // ... existing props
  showPockets?: boolean;
  onTogglePockets?: () => void;
}
```

### 3. Button (BudgetOverview.tsx)
```tsx
<Button 
  variant="ghost" 
  size="icon"
  className={`size-7 hover:bg-background/50 ${showPockets ? 'bg-background/30' : ''}`}
  onClick={onTogglePockets}
>
  <Wallet className="size-4" />
</Button>
```

### 4. Conditional Render (App.tsx)
```tsx
{showPockets && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ delay: 0.25 }}
  >
    <PocketsSummary {...props} />
  </motion.div>
)}
```

## 🎨 Visual States

### Button Appearance
```css
/* Default (hidden) */
bg: transparent
hover: bg-background/50

/* Active (shown) */
bg: bg-background/30
hover: bg-background/50
```

### Tooltip Text
- **Shown**: "Sembunyikan Ringkasan Kantong"
- **Hidden**: "Tampilkan Ringkasan Kantong"

## 📦 localStorage

### Key
```
'showPockets'
```

### Values
```typescript
'true'   // Shown (default)
'false'  // Hidden
```

### Read
```tsx
const saved = localStorage.getItem('showPockets');
const value = saved !== null ? JSON.parse(saved) : true;
```

### Write
```tsx
localStorage.setItem('showPockets', JSON.stringify(newValue));
```

## 🎬 Animation

### Show
```tsx
initial: { opacity: 0, y: 20 }
animate: { opacity: 1, y: 0 }
transition: { delay: 0.25 }
```

### Hide
```tsx
exit: { opacity: 0, y: -20 }
```

## 📂 Files Changed

### `/components/BudgetOverview.tsx`
- ✅ Added imports: `Wallet`, Tooltip components
- ✅ Added props: `showPockets`, `onTogglePockets`
- ✅ Added Wallet button with tooltip
- ✅ Added tooltip to Settings button

### `/App.tsx`
- ✅ Added state: `showPockets` with localStorage
- ✅ Added handler: `handleTogglePockets`
- ✅ Updated BudgetOverview props
- ✅ Wrapped PocketsSummary with conditional + animation

## ✅ Testing Quick Check

```bash
✓ Button appears next to Settings
✓ Click toggles visibility
✓ State persists on refresh
✓ Tooltip shows correct text
✓ Animation plays smoothly
✓ Active state visual feedback
```

## 🐛 Debug Tips

### State not persisting?
```tsx
// Check localStorage
console.log(localStorage.getItem('showPockets'));

// Check state
console.log('showPockets:', showPockets);
```

### Animation not working?
```tsx
// Ensure AnimatePresence wraps conditional
<AnimatePresence mode="wait">
  {showPockets && <motion.div>...</motion.div>}
</AnimatePresence>
```

### Button not responding?
```tsx
// Check handler is passed
<BudgetOverview 
  onTogglePockets={handleTogglePockets} // ← Must be passed
/>
```

## 💡 Quick Tips

1. **Default Value**: Always provide fallback (true)
2. **JSON Parse**: Always use JSON.parse/stringify for booleans
3. **Conditional Render**: Use `{showPockets && ...}` pattern
4. **Animation Exit**: Include exit prop for smooth hide
5. **Tooltip Delay**: 300ms for better UX

## 🚀 Common Tasks

### Change Default State
```tsx
// In App.tsx state initialization
return saved !== null ? JSON.parse(saved) : false; // ← Change to false
```

### Disable Animation
```tsx
// Remove motion wrapper, use plain div
{showPockets && (
  <div>
    <PocketsSummary {...props} />
  </div>
)}
```

### Add Keyboard Shortcut
```tsx
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'P') {
      handleTogglePockets();
    }
  };
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

### Clear localStorage
```tsx
// In browser console or code
localStorage.removeItem('showPockets');
// Will reset to default (true) on next load
```

## 📊 Button Layout

```
┌─────────────────────────────────────┐
│ Sisa Budget           [💰] [⚙️]    │
│                                     │
│ Rp 5.000.000                        │
│ ✓ Aman                              │
└─────────────────────────────────────┘
```

## 🔗 Related Features

- **Settings Button**: Opens BudgetForm dialog
- **PocketsSummary**: Section being toggled
- **LoadingSkeleton**: Always shows pockets skeleton

---

**Last Updated:** November 5, 2025  
**Status:** ✅ Complete
