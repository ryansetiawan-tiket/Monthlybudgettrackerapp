# FAB Drag & Snap - Quick Reference

**Status**: ✅ ACTIVE  
**Last Updated**: November 6, 2025

---

## 🎯 Quick Summary

FAB now supports **drag & snap to left or right side** with dynamic button positions and chevron behavior.

---

## 🎮 User Gestures

| Gesture | Action | Result |
|---------|--------|--------|
| **Tap FAB** | Toggle menu | Expand/collapse action buttons |
| **Tap Chevron** | Manual hide | Hide FAB to edge (keep chevron visible) |
| **Drag Up/Down** | Vertical reposition | Move FAB along screen edge |
| **Drag Left** | Snap to left | FAB + buttons + chevron flip to left side |
| **Drag Right** | Snap to right | FAB + buttons + chevron flip to right side |
| **Scroll Down** | Auto-hide | Temporarily slide FAB to edge (90%) |

---

## 📐 Visual States

### RIGHT Side (Default)
```
        ⭐ (Income - Jam 12)
    🔴     (Expense - Jam 10.30)
💼 ◀ [+]  (Summary - Jam 9, Chevron)
```

### LEFT Side (After Drag)
```
⭐         (Income - Jam 12)
    🔴     (Expense - Jam 1.30)
[+] ▶ 💼  (Chevron, Summary - Jam 3)
```

---

## 🔄 Chevron Behavior

| FAB Side | Visible State | Hidden State |
|----------|---------------|--------------|
| **RIGHT** | Points RIGHT → | Points LEFT ← |
| **LEFT** | Points LEFT ← | Points RIGHT → |

**Logic**: Chevron always points in the direction FAB will hide/show.

---

## 💾 State Persistence

- ✅ FAB side preference saved to `localStorage`
- ✅ Key: `fab-side`
- ✅ Values: `'left'` or `'right'`
- ✅ Restored on page reload

---

## 🧪 Quick Test

1. **Magnetic Snap Left**: Drag FAB past 40% screen width → snaps IMMEDIATELY to left (magnetic effect)
2. **Magnetic Snap Right**: Drag FAB past 60% screen width → snaps IMMEDIATELY to right (magnetic effect)
3. **Hysteresis Zone**: Drag in 40%-60% zone → no jitter, smooth behavior
4. **FAB Never Disappears**: FAB always stays on screen edge during drag
5. **Reload Page**: FAB should stay on last selected side
6. **Expand Menu**: Buttons should be in correct positions (mirrored)
7. **Hide FAB**: Should slide to correct edge based on side

---

## 🐛 Troubleshooting

### FAB doesn't snap
- ✅ Check: Drag past 40% (left) or 60% (right) threshold
- ✅ Check: `dragConstraints` set correctly

### FAB disappears during drag
- ✅ FIXED: Now uses Motion animate for left/right positioning
- ✅ Check: No Tailwind `left-6`/`right-6` in className
- ✅ Check: Motion animate has `left` and `right` properties

### Transition not smooth
- ✅ FIXED: 300ms ease-out transition on left/right
- ✅ Check: Transition config includes `left` and `right` properties

### Buttons in wrong position
- ✅ Check: `fabSide` state is updating correctly
- ✅ Check: `actions` useMemo dependency on `fabSide`

### Chevron not rotating
- ✅ Check: `chevronRotation` useMemo calculating correctly
- ✅ Check: Motion animate using `chevronRotation` state

### Preference not saving
- ✅ Check: `localStorage.setItem('fab-side', fabSide)` in useEffect
- ✅ Check: Browser allows localStorage

---

## 📝 Code Snippets

### Get Current FAB Side
```typescript
const currentSide = localStorage.getItem('fab-side'); // 'left' | 'right'
```

### Force FAB to Specific Side
```typescript
setFabSide('left');  // Will trigger localStorage save
```

### Reset to Default
```typescript
localStorage.removeItem('fab-side');
window.location.reload();  // Will default to 'right'
```

---

## 🎨 Customization

### Change Snap Threshold
```typescript
// In handleDragEnd
const snapToLeft = fabCenterX < windowWidth / 2;  // 50%
// Change to: fabCenterX < windowWidth * 0.4;      // 40%
```

### Change Animation Speed
```typescript
transition={{ duration: 0.2, ease: 'easeOut' }}
// Change to: duration: 0.3 for slower
```

### Change Drag Constraints
```typescript
dragConstraints={{ 
  left: -200, right: 200,   // Horizontal
  top: -400, bottom: 0      // Vertical
}}
```

---

## 🔗 Related Files

- **Component**: `/components/FloatingActionButton.tsx`
- **Full Docs**: `/planning/floating-action-button/DRAG_SNAP_FEATURE.md`
- **Visual Design**: `/planning/floating-action-button/VISUAL_DESIGN.md`

---

**Quick Ref v1.0** | November 6, 2025
