# Calendar View Mobile Polish v2 - Planning Document

**Date**: November 9, 2025  
**Status**: 🚧 In Progress  
**Version**: v2.1.0 (Final Polish)

---

## 🎯 Issues to Fix

### **Issue 1: Icon Alignment (Insight Bars)**
**Problem**: Icon 💰 (pemasukan) terlihat lebih ke kanan daripada 💸 (boros)  
**Screenshot**: User menunjukkan misalignment  
**Root Cause**: Icon emoji mungkin memiliki padding atau margin tidak konsisten  

### **Issue 2: Unwanted Scroll**
**Problem**: User bisa scroll atas/bawah padahal ini fullscreen page  
**Expected**: No scroll, content should fit in viewport  

### **Issue 3: Calendar Start Day**
**Problem**: Kalender mulai dari Minggu (Sunday)  
**Expected**: Kalender mulai dari Senin (Monday) - standar Indonesia  

---

## 📋 Task Breakdown

### **TASK 1: Fix Icon Alignment**

**Current Code**:
```tsx
// Spending bar
<span className="text-lg shrink-0">💸</span>

// Income bar
<span className="text-lg shrink-0">💰</span>
```

**Analysis**:
- Both use same classes: `text-lg shrink-0`
- Issue likely: Different emoji widths or browser rendering
- Some emojis have invisible padding/margins

**Solution Options**:

**Option A: Force same width**
```tsx
<span className="text-lg shrink-0 w-6 inline-flex items-center justify-center">
  💸
</span>
```

**Option B: Use flexbox alignment**
```tsx
<div className="flex items-center gap-2">
  <span className="text-lg shrink-0 flex items-center justify-center min-w-[24px]">
    💸
  </span>
  <span>...</span>
</div>
```

**Recommended**: Option A (simpler, more predictable)

---

### **TASK 2: Remove Unwanted Scroll**

**Investigation Areas**:

1. **Mobile Calendar Container**:
```tsx
<motion.div className="fixed inset-0 z-50 bg-background overflow-y-auto">
  {/* This has overflow-y-auto! */}
</motion.div>
```

**Problem**: `overflow-y-auto` allows scroll

2. **Calendar Grid Padding**:
- Excessive padding might cause content overflow
- Check: `p-4`, `py-6`, etc.

3. **Insight Bars Height**:
- After word wrap, might be too tall
- Combined with calendar = exceeds viewport

**Solution**:
```tsx
// Change overflow-y-auto to overflow-hidden
<motion.div className="fixed inset-0 z-50 bg-background overflow-hidden flex flex-col">
  
  {/* Header - fixed height */}
  <div className="flex-shrink-0 sticky top-0 z-10 bg-background border-b px-4 py-3">
    ...
  </div>
  
  {/* Content - scrollable area */}
  <div className="flex-1 overflow-y-auto">
    {/* Calendar + Insight Bars */}
  </div>
</motion.div>
```

**Key Changes**:
- Outer container: `overflow-hidden` (no scroll)
- Inner content: `overflow-y-auto` (only if needed)
- Use flexbox to control layout

---

### **TASK 3: Calendar Start from Monday**

**Current Implementation**:

```tsx
const DAYS_OF_WEEK = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
// Min = Minggu (Sunday) first

const startPadding = firstDay.getDay(); // 0-6 (Sun-Sat)
```

**Problem**:
- `getDay()` returns 0 for Sunday, 6 for Saturday
- Calendar renders Sunday as first column

**Solution**:

**Step 1: Reorder DAYS_OF_WEEK**
```tsx
// Before
const DAYS_OF_WEEK = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

// After (Monday first)
const DAYS_OF_WEEK = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
```

**Step 2: Adjust startPadding calculation**
```tsx
// Before
const startPadding = firstDay.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

// After (Monday = 0)
const dayOfWeek = firstDay.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
const startPadding = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
// Monday=0, Tuesday=1, ..., Saturday=5, Sunday=6
```

**Step 3: Adjust isWeekend calculation**
```tsx
// Weekend = Saturday (5) and Sunday (6) in new system
const isWeekend = (date: Date) => {
  const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
};
```

**Visual Before/After**:

**Before (Sunday first)**:
```
| Min | Sen | Sel | Rab | Kam | Jum | Sab |
|  1  |  2  |  3  |  4  |  5  |  6  |  7  |
```

**After (Monday first)**:
```
| Sen | Sel | Rab | Kam | Jum | Sab | Min |
|  1  |  2  |  3  |  4  |  5  |  6  |  7  |
```

---

## 🔧 Implementation Plan

### Phase 1: Icon Alignment Fix
1. Locate insight bar rendering (Lines 280-330)
2. Add `w-6 inline-flex items-center justify-center` to emoji spans
3. Test alignment on both bars

### Phase 2: Remove Scroll Fix
1. Locate mobile calendar container (Line 458)
2. Change `overflow-y-auto` to `overflow-hidden`
3. Add flex layout structure
4. Test scroll behavior

### Phase 3: Monday Start Fix
1. Reorder DAYS_OF_WEEK array
2. Adjust startPadding calculation
3. Update weekend detection if needed
4. Test calendar rendering

### Phase 4: Testing
1. Visual test: Icons aligned
2. Functional test: No unwanted scroll
3. Layout test: Monday appears first
4. Edge case test: Month starting on Sunday

---

## 📐 Code Changes Preview

### Change 1: Icon Alignment (Lines 291, 317)
```tsx
// Before
<span className="text-lg shrink-0">💸</span>

// After
<span className="text-lg shrink-0 w-6 inline-flex items-center justify-center">💸</span>
```

### Change 2: Scroll Fix (Lines 458-476)
```tsx
// Before
<motion.div className="fixed inset-0 z-50 bg-background overflow-y-auto">
  <div className="sticky top-0 ...">Header</div>
  <div className="p-4">{renderCalendarGrid()}</div>
</motion.div>

// After
<motion.div className="fixed inset-0 z-50 bg-background overflow-hidden flex flex-col">
  <div className="flex-shrink-0 sticky top-0 ...">Header</div>
  <div className="flex-1 overflow-y-auto p-4">{renderCalendarGrid()}</div>
</motion.div>
```

### Change 3: Monday Start (Lines 39, 95-97)
```tsx
// Before
const DAYS_OF_WEEK = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const startPadding = firstDay.getDay();

// After
const DAYS_OF_WEEK = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const dayOfWeek = firstDay.getDay();
const startPadding = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
```

---

## ✅ Success Criteria

### Icon Alignment:
- [ ] Both icons (💸 and 💰) perfectly aligned vertically
- [ ] No visual offset left/right
- [ ] Consistent spacing from text

### Scroll Behavior:
- [ ] No scroll on main calendar page (mobile)
- [ ] Content fits in viewport
- [ ] Drawer still scrollable (independent)

### Calendar Start Day:
- [ ] Monday (Sen) appears as first column
- [ ] Sunday (Min) appears as last column
- [ ] Padding days calculated correctly
- [ ] Weekend tint works (Sat + Sun)

---

## 🧪 Testing Checklist

### Visual Tests:
- [ ] Icons aligned horizontally
- [ ] Calendar grid starts with Monday
- [ ] Weekend columns (Sat, Sun) have tint
- [ ] No scroll bar on main page

### Layout Tests:
- [ ] Month starting on Monday (no padding)
- [ ] Month starting on Sunday (6 days padding)
- [ ] Month starting on Wednesday (2 days padding)
- [ ] Transition between months

### Functional Tests:
- [ ] Click date still works
- [ ] Insight bars still clickable
- [ ] Drawer opens correctly
- [ ] Today indicator still works

---

## 🎯 Expected Outcome

**Before**:
- ❌ Icons misaligned (💰 shifted right)
- ❌ Unwanted scroll on fullscreen page
- ❌ Calendar starts Sunday (not Indonesian standard)

**After**:
- ✅ Icons perfectly aligned
- ✅ No scroll, content fits viewport
- ✅ Calendar starts Monday (Indonesian standard)

**User Experience**: Polished, professional, follows local conventions! 🇮🇩

---

**Ready to implement!** 🚀
