# 📱 Simulation Sandbox - Mobile Polish V2

**Created:** 2025-11-09  
**Target:** Mobile-only visual & usability improvements  
**Status:** Planning Complete ✅

---

## 🎯 Objective

Improve mobile UX for Simulation Sandbox with 3 targeted fixes:
1. **[CRITICAL]** Fix truncated transaction amounts
2. **[Polish]** Increase header metrics font sizes
3. **[Polish]** Ensure tap-friendly touch targets

**⚠️ CRITICAL CONSTRAINTS:**
- ✅ **Desktop:** NO changes allowed
- ✅ **Sticky header:** Functionality must remain untouched
- ✅ **Scope:** ONLY visual & usability improvements

---

## 📊 Current State Analysis

### File: `/components/SimulationSandbox.tsx`

#### 1. Transaction Row Layout (Lines 680-714)
**Current Structure:**
```tsx
<div className="flex items-center gap-3 p-3 pl-12 ...">
  <Checkbox />
  <div className="flex-1 min-w-0">
    <div className="font-medium truncate ...">...</div>
    <div className="text-sm text-muted-foreground">...</div>
  </div>
  <div className="font-semibold whitespace-nowrap ...">
    {formatCurrency(transaction.amount)}  // ❌ TRUNCATED!
  </div>
</div>
```

**Problem:** 
- Amount column has no explicit width constraint
- `flex-1 min-w-0` on description causes amount to be squeezed
- Large amounts (e.g., "Rp 1.234.567") get cut off

#### 2. Header Metrics Cards (Lines 509-536)
**Current Structure:**
```tsx
<Card className="bg-green-50 border-green-200">
  <CardContent className="p-3">
    <div className="text-xs text-muted-foreground mb-1">Pemasukan</div>
    <div className="text-base font-semibold text-green-600">  // ❌ TOO SMALL
      {formatCurrency(netIncomeAfterDeduction)}
    </div>
  </CardContent>
</Card>
```

**Problem:**
- `text-base` (16px) is too small for quick glancing
- Metrics are the PRIMARY information but don't stand out enough
- Label `text-xs` (12px) is okay

#### 3. Touch Targets (Lines 562-638, 724-761)
**Critical Elements:**

A. **Category Filter Button** (Line 565-577)
```tsx
<Button variant="outline" className="w-full justify-between">
  <span className="flex items-center gap-2">
    <Filter className="size-4" />
    {selectedCategories.size === 0 ? 'Filter Kategori' : ...}
  </span>
  <ChevronDown className="size-4 opacity-50" />
</Button>
```
- Current: Likely has default button padding (p-2 or p-3)
- Needs verification: Should be at least 44px height

B. **Footer Buttons** (Lines 728-760)
```tsx
<Button variant="outline" className="flex-1">💾 Simpan</Button>
<Button variant="outline" className="flex-1">📂 Muat</Button>
<Button variant="outline" className="flex-1">Reset</Button>
<Button variant="default" className="flex-1">Tutup</Button>
```
- Current: Default button sizing
- Needs verification: Should be comfortable for thumb tapping

---

## 🔧 Implementation Plan

### Fix 1: Transaction Amount Truncation [CRITICAL]

**Target:** Line 703-713  
**Solution:** Reserve fixed width for amount column

```tsx
// BEFORE:
<div className="font-semibold whitespace-nowrap ...">
  {formatCurrency(transaction.amount)}
</div>

// AFTER (mobile only):
<div className={`
  font-semibold whitespace-nowrap
  ${transaction.type === 'expense' ? ... : ...}
  md:w-auto w-[100px] text-right shrink-0  // ✅ Fixed width for mobile
`}>
  {formatCurrency(transaction.amount)}
</div>
```

**Key Changes:**
- `w-[100px]` on mobile → ensures space for "Rp 999.999"
- `md:w-auto` on desktop → keeps current responsive behavior
- `text-right` → aligns numbers to the right edge
- `shrink-0` → prevents flex shrinking

**Testing:**
- [ ] Rp 100
- [ ] Rp 1.234
- [ ] Rp 999.999
- [ ] Rp 1.234.567

---

### Fix 2: Header Metrics Font Size [POLISH]

**Target:** Lines 513, 522, 531  
**Solution:** Increase from `text-base` to `text-lg`

```tsx
// BEFORE:
<div className="text-base font-semibold text-green-600">
  {formatCurrency(netIncomeAfterDeduction)}
</div>

// AFTER (mobile only):
<div className="text-lg md:text-base font-semibold text-green-600">
  {formatCurrency(netIncomeAfterDeduction)}
</div>
```

**Key Changes:**
- `text-lg` (18px) on mobile → 12.5% larger, more impactful
- `md:text-base` (16px) on desktop → preserves current design
- **Note:** Header is already sticky (Lines 641-650), no changes needed

**Visual Impact:**
```
Current:  16px │ Rp 1.234.567
Improved: 18px │ Rp 1.234.567  ✨ More prominent
```

---

### Fix 3: Tap-Friendly Touch Targets [POLISH]

**Targets:**
1. Category Filter Button (Line 565)
2. Footer Buttons (Lines 728-760)

#### 3A. Category Filter Button
```tsx
// BEFORE:
<Button variant="outline" className="w-full justify-between">

// AFTER (mobile only):
<Button 
  variant="outline" 
  className="w-full justify-between h-11 md:h-auto"
>
```

**Rationale:**
- `h-11` (44px) → meets iOS/Android minimum tap target
- `md:h-auto` → preserves desktop appearance

#### 3B. Footer Buttons
```tsx
// BEFORE:
<Button variant="outline" className="flex-1">

// AFTER (mobile only):
<Button 
  variant="outline" 
  className="flex-1 h-11 md:h-auto"
>
```

**Rationale:**
- Consistent 44px height across all footer actions
- Easy thumb reach in bottom area

---

## 📋 Implementation Checklist

### Pre-Implementation
- [x] Read current `SimulationSandbox.tsx` code
- [x] Identify exact line numbers for changes
- [x] Document current behavior
- [x] Plan mobile-only CSS classes

### Implementation Steps
- [ ] **Fix 1:** Add fixed width to transaction amount column (Line 703)
- [ ] **Fix 2:** Increase header metrics font size (Lines 513, 522, 531)
- [ ] **Fix 3A:** Ensure Category Filter button height (Line 565)
- [ ] **Fix 3B:** Ensure Footer buttons height (Lines 728-760)

### Testing Checklist
- [ ] Mobile: All amounts visible (including "Rp 1.234.567")
- [ ] Mobile: Header metrics more readable
- [ ] Mobile: All buttons easy to tap with thumb
- [ ] Desktop: NO visual changes
- [ ] Sticky header: Still works correctly
- [ ] Dark mode: All changes look good

---

## 🎨 Visual Changes Summary

### Mobile Only

| Element | Before | After | Improvement |
|---------|--------|-------|-------------|
| **Transaction Amount** | Truncated | Full width (100px) | ✅ Always readable |
| **Header Metrics** | 16px | 18px | ✅ +12.5% prominence |
| **Category Filter** | Default height | 44px min | ✅ Tap-friendly |
| **Footer Buttons** | Default height | 44px min | ✅ Tap-friendly |

### Desktop
- ❌ **NO CHANGES** (all fixes use `md:` breakpoint to preserve desktop)

---

## 🔍 Code Changes Summary

**Total Lines Modified:** ~8 lines  
**Files Changed:** 1 (`/components/SimulationSandbox.tsx`)

### Change Map:
```
Line 513: text-base → text-lg md:text-base
Line 522: text-base → text-lg md:text-base  
Line 531: text-base → text-lg md:text-base
Line 565: className → className + " h-11 md:h-auto"
Line 703: className → className + " md:w-auto w-[100px] text-right shrink-0"
Line 728-760: All footer buttons → className + " h-11 md:h-auto"
```

---

## ⚠️ Risk Assessment

### Low Risk ✅
- All changes use Tailwind responsive classes (`md:`)
- Desktop behavior explicitly preserved with `md:` prefix
- No logic changes, purely CSS adjustments
- Sticky header functionality untouched

### Testing Focus
1. **Mobile viewport** (375px - 428px width)
2. **Long transaction descriptions** with large amounts
3. **Footer button tap area** (especially in bottom corners)

---

## 📚 Related Documentation

- **Original Issue:** Screenshot showing truncated "Rp 376"
- **Sticky Header Implementation:** Lines 641-650 (DO NOT MODIFY)
- **Desktop Layout:** Lines 784-795 (PRESERVE AS-IS)

---

## 🎉 Success Criteria

✅ **Fix 1:** All transaction amounts fully visible on mobile  
✅ **Fix 2:** Header metrics more prominent (18px vs 16px)  
✅ **Fix 3:** All interactive elements ≥44px tap target  
✅ **Desktop:** Zero visual regression  
✅ **Sticky header:** Continues working perfectly  

---

**Next Step:** Execute implementation following this plan
