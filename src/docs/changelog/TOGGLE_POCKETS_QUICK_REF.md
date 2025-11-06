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
const [showPockets, setShowPockets] = useState(() => {
  const saved = localStorage.getItem('showPockets');
  return saved !== null ? JSON.parse(saved) : true;
});

const handleTogglePockets = () => {
  setShowPockets(prev => {
    const newValue = !prev;
    localStorage.setItem('showPockets', JSON.stringify(newValue));
    return newValue;
  });
};
```

### 2. Button (BudgetOverview.tsx)
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

### 3. Conditional Render (App.tsx)
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

### Tooltip Text
- **Shown**: "Sembunyikan Ringkasan Kantong"
- **Hidden**: "Tampilkan Ringkasan Kantong"

## 📦 localStorage

### Key/Values
```typescript
'showPockets'
'true'   // Shown (default)
'false'  // Hidden
```

## 📂 Files Changed

### `/components/BudgetOverview.tsx`
- ✅ Added Wallet button with tooltip

### `/App.tsx`
- ✅ Added state with localStorage
- ✅ Added toggle handler
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

---

**Last Updated:** November 5, 2025  
**Status:** ✅ Complete
