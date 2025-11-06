# Toggle Pockets Visibility Feature

## Overview

Fitur untuk show/hide section Ringkasan Kantong (PocketsSummary) dengan state persistent menggunakan localStorage. User dapat toggle visibility dengan icon button Wallet yang ditambahkan di section "Sisa Budget".

**Date:** November 5, 2025  
**Status:** ✅ Complete

## ✨ Features

### 1. **Wallet Toggle Button**
- Icon button Wallet ditambahkan di sebelah icon button Settings (Gear)
- Posisi: Section "Sisa Budget" di BudgetOverview
- Visual feedback:
  - Active state: Button dengan `bg-background/30` ketika pockets ditampilkan
  - Hover state: `hover:bg-background/50`
  - Tooltip menjelaskan fungsi button

### 2. **Persistent State**
- State show/hide disimpan di localStorage
- Key: `showPockets`
- Default value: `true` (tampilkan pockets)
- State bertahan setelah refresh/reload page

### 3. **Smooth Animation**
- PocketsSummary section menggunakan motion animation
- Fade in/out dengan slide animation
- Transition delay: 0.25s
- Exit animation: opacity 0, y: -20

## 🎨 UI/UX Design

### Button Layout
```
┌────────────────────────────────────────┐
│ Sisa Budget            [💰] [⚙️]      │
├────────────────────────────────────────┤
│ Rp 5.000.000                           │
│ ✓ Aman                                 │
└────────────────────────────────────────┘
```

### Tooltip Text
- **When shown**: "Sembunyikan Ringkasan Kantong"
- **When hidden**: "Tampilkan Ringkasan Kantong"

## 🔧 Implementation

### State Management
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

### Conditional Rendering
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

## 📂 Files Modified

### `/components/BudgetOverview.tsx`
- ✅ Added imports: `Wallet`, Tooltip components
- ✅ Added props: `showPockets`, `onTogglePockets`
- ✅ Added Wallet button with tooltip

### `/App.tsx`
- ✅ Added state: `showPockets` with localStorage
- ✅ Added handler: `handleTogglePockets`
- ✅ Updated BudgetOverview props
- ✅ Wrapped PocketsSummary with conditional + animation

## ✅ Testing

- [x] Button appears next to Settings
- [x] Click toggles visibility
- [x] State persists on refresh
- [x] Tooltip shows correct text
- [x] Animation plays smoothly
- [x] Active state visual feedback

---

**Status**: ✅ COMPLETE  
**Date**: November 5, 2025
