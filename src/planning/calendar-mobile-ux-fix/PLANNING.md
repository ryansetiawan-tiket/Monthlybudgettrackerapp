# Calendar View Mobile UX Fix - Planning Document

**Date**: November 9, 2025  
**Status**: 🚧 In Progress  
**Goal**: Total UX overhaul for Calendar View on Mobile

---

## 🎯 Problem Statement

### **Issue 1: Main Calendar Page (Screenshot 21.49.55.png)**
- Two "Insight Cards" (Hari Boros, Pemasukan Terbesar) are too tall
- Takes up excessive vertical space
- Amount numbers are **truncated** with "..." ❌
- Not optimized for mobile viewport

### **Issue 2: Date Detail Drawer (Screenshot 21.51.59.png)**
- **Redundant header**: "Jumat, 7 Nov" appears twice
- **Inconsistent layout**: Doesn't match ExpenseList/IncomeList final design
- Expense items have wrong layout structure
- Income items missing expand/collapse functionality

---

## 📋 Task Breakdown

### **TASK 1: Convert Cards → Bars (Main Calendar Page)**

#### Current Problems:
```
┌─────────────────────────────────────────────┐
│  💸  Hari Boros: Selasa, 25 Nov (Rp 1.557.2...│  ← TRUNCATED!
│       Kamis, 13 Nov                          │
│       Rp 1.557.208  (but shows "1.557.2...") │
└─────────────────────────────────────────────┘
Height: ~80px (too tall for mobile)
```

#### Target Solution:
```
┌─────────────────────────────────────────────────────┐
│ 💸 Hari Boros: Selasa, 25 Nov (Rp 1.557.208)  →   │  ← Single line!
└─────────────────────────────────────────────────────┘
Height: ~40px (compact)
```

#### Implementation Details:

**Layout Changes**:
- Single horizontal line (no vertical stack)
- Inline emoji (no circle background)
- Compact padding: `py-2 px-3`
- Text size: `text-sm`
- **CRITICAL**: Remove `truncate` class or use proper overflow handling

**Text Format**:
- Spending: `💸 Hari Boros: Selasa, 25 Nov (Rp 1.557.208)`
- Income: `💰 Pemasukan Terbesar: Kamis, 13 Nov (+Rp 14.336.000)`

**Why Numbers Were Truncated**:
- Desktop: Used `truncate` class for overflow protection
- Mobile: Screen too narrow → numbers get cut off
- **Solution**: Use `overflow-x-auto` or remove truncate on mobile

**Approach**:
```tsx
// Option 1: Remove truncate on mobile
<span className={`flex-1 text-sm ${isMobile ? '' : 'truncate'}`}>
  {content}
</span>

// Option 2: Allow horizontal scroll (better for mobile)
<div className="flex-1 overflow-x-auto scrollbar-hide">
  <span className="text-sm whitespace-nowrap">
    {content}
  </span>
</div>
```

---

### **TASK 2: Refactor Date Detail Drawer (100% Consistency)**

#### Current Problems (Screenshot 21.51.59.png):

**Header Issues**:
```
Title 1: "Jumat, 7 Nov" (top of drawer)
Title 2: "Jumat, 7 Nov" (redundant!)
Sub-line: "Pengeluaran: Rp 155.549 • Pemasukan: +Rp 2.524.484"
```

**Expense List Issues**:
- Wrong layout (has indentation)
- Doesn't match ExpenseList final design (17.16.09.png)
- Should be: `[Icon] Name [Badge] ... Amount (right-aligned)`

**Income List Issues**:
- Missing expand/collapse [v] icon
- Missing metadata sub-line (Potongan: Rp xxx)
- Doesn't match IncomeList final design

#### Target Solution:

**New Header Design**:
```
┌─────────────────────────────────────────┐
│  Jumat, 7 Nov                           │  ← Line 1 (bold, large)
│  Pengeluaran: -Rp 155.549 •            │  ← Line 2 (smaller, gray)
│  Pemasukan: +Rp 2.524.484              │
├─────────────────────────────────────────┤
│  PEMASUKAN                              │
│  ─────────────────────────────────────  │
│  [v] Fiverr              +Rp 2.524.484  │  ← Expandable!
│      Potongan: Rp 1.000                 │  ← Metadata
├─────────────────────────────────────────┤
│  PENGELUARAN                            │
│  ─────────────────────────────────────  │
│  🍔 malam     [Makanan]     Rp 31.000  │  ← NO indentation!
│  👶 Nindya    [Lainnya]    Rp 100.000  │  ← Icon + Name + Badge
│  🍔 siang     [Makanan]     Rp 24.549  │  ← Amount right-aligned
└─────────────────────────────────────────┘
```

#### Implementation Details:

**1. Clean Header (NEW)**:
```tsx
<DrawerHeader>
  <DrawerTitle className="sr-only">
    Detail Transaksi {formatDateDisplay(selectedDate)}
  </DrawerTitle>
  
  {/* Custom visible header */}
  <div className="space-y-1 pb-4">
    {/* Line 1: Date */}
    <h2 className="text-xl font-bold">
      {formatDateDisplay(selectedDate)}
    </h2>
    
    {/* Line 2: Summary */}
    <p className="text-sm text-muted-foreground">
      Pengeluaran: <span className="text-red-600">-{formatCurrency(totalExpense)}</span>
      {' • '}
      Pemasukan: <span className="text-green-600">+{formatCurrency(totalIncome)}</span>
    </p>
  </div>
</DrawerHeader>
```

**2. Expense List (100% Consistency with ExpenseList.tsx)**:

**Must Read**: `/components/ExpenseList.tsx` final layout
**Reference Screenshot**: 17.16.09.png

**Layout Pattern**:
```tsx
{/* NO DATE HEADERS - already in drawer header */}

{/* Expense item */}
<div className="flex items-center gap-3 py-3">
  {/* Icon */}
  <span className="text-2xl">{expense.category.emoji}</span>
  
  {/* Name + Badge */}
  <div className="flex-1 min-w-0">
    <div className="flex items-center gap-2">
      <span className="font-medium">{expense.name}</span>
      <Badge>{expense.pocketName}</Badge>
    </div>
  </div>
  
  {/* Amount (right-aligned) */}
  <span className="text-red-600 font-semibold">
    {formatCurrency(expense.amount)}
  </span>
</div>
```

**CRITICAL RULES**:
- ❌ NO indentation (no `pl-4` or `ml-4`)
- ❌ NO date headers (already in drawer header)
- ✅ Icon on the left (text-2xl)
- ✅ Name + Badge in middle (flex-1)
- ✅ Amount on right (red color)

**3. Income List (100% Consistency with ExpenseList.tsx Income Section)**:

**Must Read**: Income rendering in `/components/ExpenseList.tsx`

**Layout Pattern with Expand/Collapse**:
```tsx
{/* Income item */}
<div>
  {/* Main row (expandable) */}
  <div 
    className="flex items-center gap-3 py-3 cursor-pointer"
    onClick={() => toggleIncomeExpand(income.id)}
  >
    {/* Expand icon */}
    <ChevronRight 
      className={`size-4 transition-transform ${
        isExpanded ? 'rotate-90' : ''
      }`}
    />
    
    {/* Name */}
    <div className="flex-1 min-w-0">
      <span className="font-medium">{income.source}</span>
    </div>
    
    {/* Amount (right-aligned, green) */}
    <span className="text-green-600 font-semibold">
      +{formatCurrency(netAmount)}
    </span>
  </div>
  
  {/* Metadata (when expanded) */}
  {isExpanded && (
    <div className="pl-7 pb-2 text-sm text-muted-foreground">
      Potongan: {formatCurrency(income.deduction)}
    </div>
  )}
</div>
```

**CRITICAL RULES**:
- ✅ [v] Expand icon (ChevronRight with rotate-90)
- ✅ Metadata sub-line when expanded (Potongan)
- ✅ Green color for income amount (+Rp)
- ✅ Same spacing as expense items

---

## 🔧 Files to Modify

### Primary File:
**Path**: `/components/CalendarView.tsx`

### Sections to Update:

#### 1. Insight Bars (Lines ~280-370):
**Current**: Desktop compact bars (with truncate)  
**Update**: Mobile-optimized (no truncate or overflow-x-auto)

#### 2. Drawer Header (Lines ~400-450):
**Current**: Redundant "Jumat, 7 Nov" + summary  
**Update**: Clean header with date + summary inline

#### 3. Drawer Content - Expense List (Lines ~500-600):
**Current**: Wrong layout with indentation  
**Update**: Match ExpenseList.tsx exactly (icon, name, badge, amount)

#### 4. Drawer Content - Income List (Lines ~600-700):
**Current**: Simple list without expand  
**Update**: Add expand/collapse + metadata (match ExpenseList.tsx)

---

## 📊 Reference Files

**Must Read Before Implementation**:

1. **ExpenseList.tsx**: `/components/ExpenseList.tsx`
   - Final layout pattern for expenses
   - Final layout pattern for incomes (with expand)
   - Badge positioning
   - Color scheme

2. **Reference Screenshot**: `17.16.09.png`
   - Shows final ExpenseList design
   - No indentation
   - Icon + Name + Badge + Amount pattern

3. **Current Mobile Calendar**: `21.49.55.png`
   - Shows truncated amounts (problem)
   - Shows tall cards (to be fixed)

4. **Current Drawer**: `21.51.59.png`
   - Shows redundant header
   - Shows wrong expense layout
   - Shows simple income list (no expand)

---

## 🎨 Visual Comparison

### Before (TASK 1 - Cards):
```
Main Calendar Page (Mobile):
┌─────────────────────────────────┐
│  Calendar Grid                  │
│  ...                            │
├─────────────────────────────────┤
│  💸  Hari Boros: Selasa, 25 ... │  ← TRUNCATED!
│       Nov (Rp 1.557.2...)       │
│                                 │
├─────────────────────────────────┤
│  💰  Pemasukan Terbesar:        │
│       Kamis, 13 Nov (+Rp 14...  │  ← TRUNCATED!
└─────────────────────────────────┘
Height: ~160px (too tall)
```

### After (TASK 1 - Bars):
```
Main Calendar Page (Mobile):
┌─────────────────────────────────────────┐
│  Calendar Grid                          │
│  ...                                    │
├─────────────────────────────────────────┤
│ 💸 Hari Boros: Selasa, 25 Nov (Rp 1.5M)→│  ← Compact, readable!
├─────────────────────────────────────────┤
│ 💰 Pemasukan: Kamis, 13 Nov (+Rp 14.3M)→│  ← Full numbers visible!
└─────────────────────────────────────────┘
Height: ~80px (50% reduction!)
```

### Before (TASK 2 - Drawer):
```
Date Detail Drawer (Mobile):
┌─────────────────────────────────┐
│  Jumat, 7 Nov                   │  ← Redundant title 1
│                                 │
│  Jumat, 7 Nov                   │  ← Redundant title 2
│  Pengeluaran: -Rp 155.549       │
│  Pemasukan: +Rp 2.524.484       │
├─────────────────────────────────┤
│  PEMASUKAN                      │
│  Fiverr           +Rp 2.524.484 │  ← No expand icon
│                                 │  ← No metadata
├─────────────────────────────────┤
│  PENGELUARAN                    │
│    malam [Makanan]   Rp 31.000  │  ← Wrong layout
│    Nindya [Lainnya] Rp 100.000  │  ← Has indentation
└─────────────────────────────────┘
```

### After (TASK 2 - Drawer):
```
Date Detail Drawer (Mobile):
┌─────────────────────────────────┐
│  Jumat, 7 Nov                   │  ← Single title
│  Pengeluaran: -Rp 155.549 •     │  ← Summary inline
│  Pemasukan: +Rp 2.524.484       │
├─────────────────────────────────┤
│  PEMASUKAN                      │
│  [v] Fiverr        +Rp 2.524.484│  ← Expand icon!
│      Potongan: Rp 1.000         │  ← Metadata shown
├─────────────────────────────────┤
│  PENGELUARAN                    │
│  🍔 malam [Makanan]   Rp 31.000 │  ← Icon first
│  👶 Nindya [Lainnya] Rp 100.000 │  ← NO indentation
│  🍔 siang [Makanan]   Rp 24.549 │  ← Right-aligned
└─────────────────────────────────┘
```

---

## ✅ Success Criteria

### TASK 1 (Insight Bars):
- [ ] Both bars display in single line
- [ ] **No truncated amounts** (full numbers visible)
- [ ] Compact height (~40px per bar)
- [ ] Total height reduction: ~50%
- [ ] Gradients maintained
- [ ] Click functionality preserved

### TASK 2 (Drawer Header):
- [ ] Single date title (no redundancy)
- [ ] Summary in second line (smaller, gray)
- [ ] Clean spacing between header and content

### TASK 2 (Expense List):
- [ ] **100% match** with ExpenseList.tsx layout
- [ ] Icon on left (text-2xl emoji)
- [ ] Name + Badge in middle
- [ ] Amount right-aligned (red)
- [ ] **NO indentation** (critical!)
- [ ] **NO date headers** (already in drawer header)

### TASK 2 (Income List):
- [ ] **100% match** with ExpenseList.tsx income section
- [ ] [v] Expand icon (ChevronRight)
- [ ] Rotate-90 when expanded
- [ ] Metadata sub-line (Potongan)
- [ ] Green color (+Rp)
- [ ] Same spacing as expenses

---

## 🔍 Implementation Steps

### STEP 1: Read Reference Files
1. Read `/components/ExpenseList.tsx` (expense rendering)
2. Read `/components/ExpenseList.tsx` (income rendering with expand)
3. Identify exact layout pattern
4. Note spacing, colors, classes

### STEP 2: Fix Insight Bars (TASK 1)
1. Locate insight bars in CalendarView.tsx
2. Remove `truncate` class on mobile
3. Test amount visibility (no "...")
4. Verify compact height

### STEP 3: Refactor Drawer Header (TASK 2)
1. Remove redundant date title
2. Create clean header structure
3. Date (large, bold)
4. Summary (small, gray, inline)

### STEP 4: Fix Expense List (TASK 2)
1. Remove all date headers
2. Remove indentation (pl-4, ml-4)
3. Apply ExpenseList.tsx pattern:
   - Icon (text-2xl)
   - Name + Badge (flex-1)
   - Amount (right, red)

### STEP 5: Fix Income List (TASK 2)
1. Add expand/collapse state
2. Add ChevronRight icon
3. Add metadata sub-line
4. Apply ExpenseList.tsx income pattern

### STEP 6: Test Mobile UX
1. Test insight bars (no truncation)
2. Test drawer header (no redundancy)
3. Test expense layout (matches ExpenseList)
4. Test income expand/collapse
5. Verify consistent spacing

---

## 📚 Code Patterns

### Pattern 1: Mobile-Optimized Bar (No Truncate)
```tsx
<motion.button className="py-2 px-3 ...">
  <div className="flex items-center gap-2">
    <span className="text-lg shrink-0">💸</span>
    
    {/* NO truncate on mobile - allow full text */}
    <span className="flex-1 text-sm whitespace-normal break-words">
      <span className="font-medium">Hari Boros:</span> 
      {formatDateDisplay(date)} 
      <span className="font-semibold text-red-600">
        ({formatCurrency(amount)})
      </span>
    </span>
    
    <svg className="size-4 shrink-0">→</svg>
  </div>
</motion.button>
```

### Pattern 2: Clean Drawer Header
```tsx
<DrawerHeader>
  <DrawerTitle className="sr-only">Detail Transaksi</DrawerTitle>
  
  <div className="space-y-1 pb-4">
    <h2 className="text-xl font-bold">Jumat, 7 Nov</h2>
    <p className="text-sm text-muted-foreground">
      Pengeluaran: <span className="text-red-600">-Rp 155.549</span>
      {' • '}
      Pemasukan: <span className="text-green-600">+Rp 2.524.484</span>
    </p>
  </div>
</DrawerHeader>
```

### Pattern 3: Expense Item (Match ExpenseList.tsx)
```tsx
<div className="flex items-center gap-3 py-3">
  <span className="text-2xl">{expense.category.emoji}</span>
  <div className="flex-1 min-w-0">
    <div className="flex items-center gap-2">
      <span className="font-medium">{expense.name}</span>
      <Badge>{expense.pocketName}</Badge>
    </div>
  </div>
  <span className="text-red-600 font-semibold">
    {formatCurrency(expense.amount)}
  </span>
</div>
```

### Pattern 4: Income Item with Expand (Match ExpenseList.tsx)
```tsx
<div>
  <div 
    className="flex items-center gap-3 py-3 cursor-pointer"
    onClick={() => setExpandedIncome(prev => 
      prev === income.id ? null : income.id
    )}
  >
    <ChevronRight 
      className={`size-4 transition-transform ${
        expandedIncome === income.id ? 'rotate-90' : ''
      }`}
    />
    <div className="flex-1">
      <span className="font-medium">{income.source}</span>
    </div>
    <span className="text-green-600 font-semibold">
      +{formatCurrency(netAmount)}
    </span>
  </div>
  
  {expandedIncome === income.id && (
    <div className="pl-7 pb-2 text-sm text-muted-foreground">
      Potongan: {formatCurrency(income.deduction)}
    </div>
  )}
</div>
```

---

## ⚠️ Critical Rules

### DO:
✅ Match ExpenseList.tsx layout **EXACTLY**  
✅ Remove ALL indentation from expense items  
✅ Remove ALL date headers (already in drawer header)  
✅ Add expand/collapse for income items  
✅ Show full amounts (no truncation)  
✅ Use proper spacing (py-3 for items)  

### DON'T:
❌ Keep truncate class on mobile bars  
❌ Keep redundant drawer titles  
❌ Add indentation to expense items  
❌ Forget expand icon for income  
❌ Use different colors than ExpenseList  
❌ Change layout structure from reference  

---

## 🎯 Expected Outcome

**Mobile Calendar UX After Fix**:
1. ✅ Insight bars compact and readable (no truncation)
2. ✅ Drawer header clean (single title + inline summary)
3. ✅ Expense list 100% matches ExpenseList.tsx
4. ✅ Income list 100% matches ExpenseList.tsx (with expand)
5. ✅ Consistent spacing and colors throughout
6. ✅ Professional, polished mobile experience

**User Experience**:
- Faster scanning (compact bars)
- Full information visible (no "...")
- Consistent patterns (same as main app)
- Clean, uncluttered drawer
- Familiar interaction (matches ExpenseList)

---

**Ready to execute!** 🚀

**Priority Order**:
1. TASK 1 first (quick win - fix truncation)
2. TASK 2 second (requires careful matching with ExpenseList)
3. Test on mobile viewport
4. Document changes
