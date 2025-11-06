# FAB V2 Quick Visual Reference 🎨

**Use this for quick testing and verification**

---

## 🎯 The 3 States

### State 1: Default/Show (Collapsed)
```
        [>]  ← Chevron (24px, top-left)
       /
      /
    [+]  ← Main FAB (56-64px, white)
    
Position: bottom-right (24-32px spacing)
Chevron: -30px left, -30px up from FAB center
Icon: Plus (black)
Chevron Icon: ChevronRight (white)
```

### State 2: Open/Show (Expanded)
```
        [Receipt]  ← Expense button
            ↑
          70px
            |
  [Dollar]─[X]  ← Main FAB (plus rotated 45°)
     ↑      ↓
    70px   70px
            |
          [Eye]  ← Summary button
            
        [>]  ← Chevron (at top, same pos as Receipt)

All buttons: 56-64px circles
Spacing: 70px from FAB center
Animation: Fade in from center (150ms)
No stagger - all appear together!
```

### State 3: Default/Hide (Manual)
```
                              [<]  ← Chevron (top-right)
                             /
                            /
                          [+]  ← FAB (slid right, 50% opacity)
                          
Position: Slid right to show only 8px
Opacity: 0.5
Chevron: +30px right, -30px up from FAB center  
Chevron Icon: ChevronLeft (pointing back)
```

---

## 🎨 Button Specs

### Main FAB
- Size: 56px (mobile) / 64px (desktop)
- Color: White background
- Icon: Plus (black), rotates 45° when expanded
- Shadow: xl
- Position: Fixed bottom-right

### Action Buttons (3x)
| Button | Position | Icon | Color |
|--------|----------|------|-------|
| Expense | Top (0, -70) | Receipt | White |
| Income | Left (-70, 0) | DollarSign | Green-400 |
| Summary | Bottom (0, 70) | Eye | Blue-400 |

All action buttons:
- Size: 56px (mobile) / 64px (desktop)
- Background: Gray-900 (dark)
- Shadow: lg

### Chevron Button
- Size: **24px × 24px** (fixed)
- Background: Gray-700
- Icon: ChevronRight or ChevronLeft (white)
- Icon size: 14px (3.5 Tailwind)
- Shadow: md

---

## 🎬 Animations

### Expand (Click Main FAB)
```
1. Plus icon rotates 45° → X
2. All 3 buttons fade in simultaneously
   - From: scale(0) opacity(0)
   - To: scale(1) opacity(1)
   - Duration: 150ms
3. Chevron moves to top center
```

### Collapse (Click Action Button)
```
1. Execute callback
2. All buttons fade out
   - From: scale(1) opacity(1)
   - To: scale(0) opacity(0)
   - Duration: 150ms
3. Plus icon rotates back to +
4. Chevron returns to top-left
```

### Manual Hide (Click Chevron)
```
Show → Hide:
  - FAB slides right (100% - 8px)
  - Opacity: 1 → 0.5
  - Chevron moves top-left → top-right
  - Icon: ChevronRight → ChevronLeft
  - Duration: 200ms

Hide → Show:
  - FAB slides back to origin
  - Opacity: 0.5 → 1
  - Chevron moves top-right → top-left
  - Icon: ChevronLeft → ChevronRight
  - Duration: 200ms
```

### Auto-Hide (Scroll)
```
Scrolling detected:
  - FAB slides right 90%
  - Opacity: 1 → 0.7
  - Duration: 200ms
  - Chevron stays top-left

Idle 0.5-0.8s:
  - FAB returns to origin
  - Opacity: 0.7 → 1
  - Duration: 200ms
```

### Drag (Press & Drag FAB)
```
1. Press and hold main FAB
2. Drag vertically (up/down)
3. Visual feedback: position updates
4. Release: position saved
5. Range: -500px to 0px from original
```

---

## 🧪 Testing Quick Checklist

### Visual
- [ ] Main FAB is white circle with black + icon
- [ ] Chevron is 24px gray circle (not square!)
- [ ] Action buttons are dark (gray-900)
- [ ] Colors: Receipt=white, Dollar=green, Eye=blue
- [ ] Shadows visible on all buttons

### Layout
- [ ] Chevron starts top-left of FAB
- [ ] Expanded buttons at: top, left, bottom
- [ ] 70px spacing from FAB center
- [ ] No overlapping buttons
- [ ] Positions match diagram

### Animations
- [ ] Fade in is smooth (150ms)
- [ ] All 3 buttons appear **together** (no stagger!)
- [ ] Fade out is smooth
- [ ] Plus rotates to X (45°)
- [ ] No spring/bounce effects

### Interactions
- [ ] Click FAB → expand works
- [ ] Click action → callback + close
- [ ] Click chevron → hide/show works
- [ ] Drag up/down → position changes
- [ ] Scroll → auto-hide works

### Chevron Position
- [ ] Default: Top-left with ChevronRight
- [ ] Expanded: Top center with ChevronRight
- [ ] Manual hide: Top-right with ChevronLeft
- [ ] Smooth transition between positions

### Drag Feature
- [ ] Can drag FAB up (negative y)
- [ ] Cannot drag left/right (y-axis only)
- [ ] Position persists after release
- [ ] Works on mobile touch
- [ ] Works on desktop mouse

---

## 📐 Measurement Guide

Use browser DevTools to verify:

```css
/* Main FAB */
width: 56px (md: 64px)
height: 56px (md: 64px)
background: #ffffff
border-radius: 50%

/* Action Buttons */
width: 56px (md: 64px)  
height: 56px (md: 64px)
background: #111827 (gray-900)
border-radius: 50%

/* Chevron */
width: 24px
height: 24px
background: #374151 (gray-700)
border-radius: 50%

/* Icon sizes */
Plus: 32px (w-8)
Action icons: 24px (w-6)
Chevron icon: 14px (w-3.5)
```

---

## 🎯 Position Calculations

### Chevron Position (from FAB center)
```javascript
// Default/Show
x: -30px, y: -30px

// Expanded (same as Receipt button)
x: 0px, y: -70px

// Manual Hide
x: +30px, y: -30px
```

### Action Buttons (from FAB center)
```javascript
// Receipt (Expense)
x: 0px, y: -70px    // Top

// DollarSign (Income)  
x: -70px, y: 0px    // Left

// Eye (Summary)
x: 0px, y: +70px    // Bottom
```

### CSS Transform
```css
/* Positioning trick */
position: absolute;
left: 50%;
top: 50%;
transform: translate(
  calc(-50% + ${x}px),
  calc(-50% + ${y}px)
);
```

---

## 🔍 Debug Checklist

### Issue: Buttons overlap
→ Check: `position: absolute` and transform calc
→ Verify: 70px spacing is correct

### Issue: Chevron not moving
→ Check: `animate` prop on chevron button
→ Verify: `chevronPosition` calculation

### Issue: Animations too slow/fast
→ Check: `transition: { duration: 0.15 }` (150ms)
→ Verify: No spring physics left in code

### Issue: Drag not working
→ Check: `drag="y"` prop
→ Verify: `dragConstraints` set
→ Check: `touchAction: 'none'` in style

### Issue: Auto-hide not triggering
→ Check: `useScrollDetection()` hook
→ Verify: debounce working (16ms)
→ Check: timeout delays (500ms/800ms)

---

## 📱 Mobile Testing

### Touch Targets
- All buttons should be min 48×48px
- Main FAB: 56px ✅
- Action buttons: 56px ✅
- Chevron: 24px ⚠️ (small but okay for secondary action)

### Gestures
- Tap FAB → expand
- Tap action → execute
- Tap chevron → hide/show
- Press & drag FAB → reposition
- Scroll → auto-hide

### Performance
- 60fps animations
- No lag on drag
- Smooth scroll detection

---

## 💡 Quick Fixes

### Chevron too small?
```typescript
// Increase from 24px to 32px
className="w-8 h-8"  // was w-6 h-6
```

### Buttons too close?
```typescript
// Increase spacing from 70px to 80px
position: { x: 0, y: -80 }  // was -70
```

### Animations too fast?
```typescript
// Increase from 150ms to 250ms
transition={{ duration: 0.25 }}  // was 0.15
```

### Want stagger back?
```typescript
// Add delay based on index
transition={{ 
  duration: 0.15,
  delay: index * 0.05  // 50ms stagger
}}
```

---

## ✅ Success Criteria

FAB V2 is working correctly when:

1. ✅ Chevron is visible 24px circle
2. ✅ Buttons appear in circular layout
3. ✅ No spring animations (simple fade)
4. ✅ All buttons appear together (no delay)
5. ✅ Chevron changes position based on state
6. ✅ FAB can be dragged vertically
7. ✅ Auto-hide works on scroll
8. ✅ Manual hide works with chevron
9. ✅ Smooth 150ms animations
10. ✅ Works on mobile & desktop

---

**Ready to test! 🚀**
