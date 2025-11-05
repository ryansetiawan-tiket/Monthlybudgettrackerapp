# FAB + Drawer Implementation for Pockets Summary

## 📋 Overview

Mengubah mekanisme toggle show/hide **Ringkasan Kantong** dari icon button Wallet di card "Sisa Budget" menjadi **Floating Action Button (FAB)** dengan **Drawer component** untuk UX yang lebih delightful dan space-efficient.

## 🎯 Goals

1. **Minimize layout distraction**: FAB floating tidak makan space di layout
2. **Quick access**: Always accessible tanpa scroll, posisi fixed bottom-right
3. **Delightful UX**: Smooth slide-up animation dengan backdrop overlay
4. **Mobile-friendly**: Thumb zone optimal, native app feeling
5. **Easy rollback**: Dokumentasi lengkap untuk kembalikan ke sistem lama

## 🔄 Current vs New Behavior

### Current Behavior
- Toggle button (Wallet icon) di card "Sisa Budget"
- Click → show/hide `PocketsSummary` component inline
- Butuh scroll untuk access button jika sudah scroll down
- Icon button kurang prominent

### New Behavior
- FAB (Wallet icon) floating di pojok kanan bawah
- Click → drawer slide up from bottom dengan `PocketsSummary` content
- Always accessible (fixed position), tidak terpengaruh scroll
- Click backdrop/press Esc → drawer slide down (close)
- Visual lebih delightful dengan animation

## 📁 Files Affected

### Modified Files
1. **`/App.tsx`**
   - Remove: `showPockets` state
   - Remove: `handleTogglePockets` function
   - Remove: `showPockets` & `onTogglePockets` props ke BudgetOverview
   - Add: `showPocketsDrawer` state
   - Add: `handleTogglePocketsDrawer` function

2. **`/components/BudgetOverview.tsx`**
   - Remove: Wallet toggle button dari CardHeader
   - Remove: `showPockets` & `onTogglePockets` props
   - Remove: Tooltip wrapper untuk button

3. **`/components/PocketsSummary.tsx`**
   - No changes needed (pure display component, akan dipakai di drawer)

### New Files
4. **`/components/PocketsDrawer.tsx`** (NEW)
   - Drawer wrapper untuk PocketsSummary
   - Handle open/close state
   - Smooth animation

5. **`/components/PocketsFAB.tsx`** (NEW)
   - Floating Action Button component
   - Fixed positioning bottom-right
   - Wallet icon with subtle animation on hover/click

## 🎨 UI/UX Design

### FAB Design
```
Position: fixed bottom-6 right-6 (desktop), bottom-4 right-4 (mobile)
Size: 56x56px (desktop), 48x48px (mobile)
Background: Primary color with shadow
Icon: Wallet (from lucide-react)
Hover: Scale 1.1 + shadow increase
Active: Scale 0.95
Z-index: 50 (above content, below drawer backdrop)
```

### Drawer Design
```
Direction: Bottom to top slide
Height: Auto (max 80vh untuk prevent overflow)
Backdrop: Semi-transparent dark overlay (backdrop-blur-sm)
Close triggers: 
  - Click backdrop
  - Press Esc key
  - Click close button di header drawer
Animation: Smooth slide-up (200ms ease-out)
Z-index: 100 (backdrop), 101 (drawer content)
```

### Drawer Content Structure
```
┌─────────────────────────────────────┐
│ [X] Ringkasan Kantong         Close │  ← Header
├─────────────────────────────────────┤
│                                     │
│   <PocketsSummary />                │  ← Existing component
│                                     │
│   (All pockets, balances, etc)      │
│                                     │
└─────────────────────────────────────┘
```

## 🔧 Implementation Strategy

### Phase 1: Create New Components
1. Create `PocketsFAB.tsx` with floating button
2. Create `PocketsDrawer.tsx` using ShadCN Drawer component
3. Test components in isolation

### Phase 2: Integrate to App
1. Add state management to App.tsx
2. Remove old toggle button from BudgetOverview
3. Add FAB to App.tsx layout
4. Connect PocketsSummary to Drawer

### Phase 3: Polish & Test
1. Fine-tune animations
2. Test mobile responsiveness
3. Test keyboard navigation (Esc to close)
4. Test accessibility (focus trap, ARIA labels)

## 📦 Dependencies

- **ShadCN Drawer**: Already available at `/components/ui/drawer.tsx`
- **Lucide Icons**: Already installed (Wallet icon)
- **Tailwind CSS**: For styling & animations

## 🔙 Rollback Strategy

### Quick Rollback (if needed immediately)
File sudah di-backup di `/planning/fab-drawer-pockets/rollback/`

**Steps:**
1. Restore `/App.tsx` dari backup
2. Restore `/components/BudgetOverview.tsx` dari backup
3. Delete `/components/PocketsFAB.tsx`
4. Delete `/components/PocketsDrawer.tsx`
5. App kembali ke behavior lama

### Rollback Files Location
```
/planning/fab-drawer-pockets/rollback/
  ├── App.tsx.backup
  └── BudgetOverview.tsx.backup
```

## ✅ Testing Checklist

### Desktop Testing
- [ ] FAB visible di pojok kanan bawah
- [ ] Click FAB → drawer slide up smoothly
- [ ] PocketsSummary content displayed correctly in drawer
- [ ] Click backdrop → drawer close
- [ ] Press Esc → drawer close
- [ ] FAB position tidak overlap dengan content penting
- [ ] Smooth animation (no jank)

### Mobile Testing
- [ ] FAB size appropriate (tidak terlalu besar/kecil)
- [ ] FAB position thumb-friendly
- [ ] Drawer height tidak melebihi viewport (scrollable if needed)
- [ ] Tap backdrop → drawer close
- [ ] Swipe down → drawer close (jika supported by ShadCN Drawer)
- [ ] No horizontal scroll introduced

### Functionality Testing
- [ ] Settings gear button di "Kantong Sehari-hari" still works
- [ ] Manage Pockets button still works from drawer
- [ ] All pocket data displayed correctly
- [ ] Transfer button works from drawer
- [ ] Loading states handled properly

### Accessibility Testing
- [ ] FAB has proper ARIA label
- [ ] Drawer has focus trap when open
- [ ] Keyboard navigation works (Tab, Shift+Tab, Esc)
- [ ] Screen reader announces drawer open/close
- [ ] Color contrast meets WCAG standards

## 📝 Implementation Notes

### Important Considerations
1. **Z-index management**: Pastikan FAB tidak overlap dengan dialogs lain
2. **Scroll lock**: Saat drawer open, prevent body scroll
3. **Animation performance**: Use `transform` instead of `top/bottom` for smoother animation
4. **State persistence**: Drawer state tidak perlu persist (always closed on mount)
5. **Multiple dialogs**: Handle case jika user buka settings/transfer dari drawer

### Edge Cases to Handle
- User scroll down → FAB tetap visible (fixed position)
- User buka drawer → buka settings → close settings → drawer tetap open
- Small viewport → drawer tidak overflow screen
- Slow connection → loading state saat fetch pocket data

## 🚀 Next Steps

1. Read this planning doc
2. Create backup files in rollback folder
3. Implement PocketsFAB component
4. Implement PocketsDrawer component
5. Update App.tsx & BudgetOverview.tsx
6. Test all scenarios
7. Update documentation

## 📚 Related Documentation

- Original toggle feature: `/TOGGLE_POCKETS_FEATURE.md`
- Quick reference: `/TOGGLE_POCKETS_QUICK_REF.md`
- ShadCN Drawer docs: https://ui.shadcn.com/docs/components/drawer

---

**Status**: 📝 Planning Phase  
**Created**: 2025-01-05  
**Last Updated**: 2025-01-05
