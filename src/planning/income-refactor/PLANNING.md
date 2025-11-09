# Income Screen Refactor - Planning Document

**Date:** November 9, 2025  
**Scope:** Income tab in ExpenseList.tsx (CardContent section only)  
**Goal:** De-clutter, improve hierarchy, add context

---

## 🎯 SELECTED ELEMENT

**File:** `/components/ExpenseList.tsx`  
**Element:** `<CardContent>` section (lines ~1966+)  
**Constraint:** ONLY modify within selected CardContent element

---

## 🎯 3 TASKS TO IMPLEMENT

### Task 1: De-clutter with Progressive Disclosure ✅

**Problem:**
```tsx
{/* Current - TMI (Too Much Information) */}
<div>
  <p>Fiverr</p>
  <span>8 Nov 2025</span>
  {/* ❌ Always visible */}
  <div>$53.08 × Rp 16.111 (realtime)</div>
  <div>Potongan: Rp 24.000 (Kotor: Rp 855.000)</div>
</div>
```

**Solution:**
```tsx
{/* Default - Clean! */}
<div className="flex items-center justify-between">
  <button onClick={toggle}>
    {expanded ? <ChevronUp /> : <ChevronDown />}
  </button>
  
  <div>
    <p>Fiverr</p>
    <span className="text-xs text-muted-foreground">
      8 Nov • Auto
    </span>
  </div>
  
  <div className="flex items-center gap-2">
    <p className="text-green-600 font-medium">
      +Rp 831.000
    </p>
    {/* Actions */}
  </div>
</div>

{/* Expanded details */}
{expanded && (
  <div className="pl-8 pt-2 border-l-2">
    <div>Kotor: $53.08 × Rp 16.111 = Rp 855.000</div>
    <div>Potongan: -Rp 24.000</div>
  </div>
)}
```

**Implementation:**
1. Add state: `const [expandedIncomeIds, setExpandedIncomeIds] = useState<Set<string>>(new Set())`
2. Add chevron button (left side)
3. Hide USD conversion & deduction details by default
4. Show: Name + "Date • Type"
5. Right: Net amount (prominent) + actions
6. Expandable section with indentation

---

### Task 2: Refactor Summary Hierarchy ✅

**Problem:**
```tsx
{/* Current - Flat & ambiguous */}
<div>Total Kotor: Rp 1.000.000</div>
<div>— Potongan Individual: -Rp 50.000</div>  {/* ❌ Flat */}
<div>Subtotal: Rp 950.000</div>
<div>— Potongan Global: -Rp 100.000</div>     {/* ❌ Flat */}
<div>Total Bersih: Rp 850.000</div>           {/* ❌ Not highlighted */}
```

**Solution:**
```tsx
{/* Hierarchy with indentation */}
<div className="space-y-2">
  {/* Total Kotor */}
  <div className="flex justify-between">
    <span>Total Kotor</span>
    <span className="text-green-600">Rp 1.000.000</span>
  </div>

  {/* Indented: Individual deductions */}
  <div className="flex justify-between pl-4">
    <span className="text-muted-foreground">Potongan Individual</span>
    <span className="text-red-600">-Rp 50.000</span>
  </div>

  {/* Subtotal */}
  <div className="flex justify-between border-t pt-2">
    <span>Subtotal</span>
    <span className="text-green-600">Rp 950.000</span>
  </div>

  {/* Indented: Global deduction */}
  <div className="flex justify-between pl-4">
    <span className="text-muted-foreground">Potongan Global ℹ️</span>
    <span className="text-red-600">-Rp 100.000</span>
  </div>

  {/* Highlighted: Total Bersih */}
  <div className="flex justify-between border-t-2 pt-3 mt-2">
    <span className="font-semibold">Total Bersih</span>
    <span className="text-lg font-bold text-green-600">Rp 850.000</span>
  </div>
</div>
```

**Implementation:**
1. Remove `—` prefix
2. Add `pl-4` to deductions (indentation)
3. Clear labels: "Potongan Individual", "Potongan Global"
4. Highlight Total Bersih: `font-semibold`, `text-lg`, `border-t-2`
5. Color coding: red (deductions), green (totals)

---

### Task 3: Add Tooltip for "Potongan Global" ✅

**Problem:**
```tsx
<span>Potongan Global</span>  {/* ❌ No context */}
```

**Solution:**
```tsx
<span className="flex items-center gap-1">
  Potongan Global
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="size-3 cursor-help" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[250px]">
        <p className="text-xs">
          Potongan yang diterapkan sekali ke subtotal setelah semua
          pemasukan digabung, bukan diterapkan per item.
        </p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</span>
```

**Implementation:**
1. Import Tooltip components (if not already imported)
2. Add Info icon next to "Potongan Global"
3. Wrap with Tooltip
4. Clear explanation in tooltip content

---

## 📋 IMPLEMENTATION STEPS

### Step 1: Add State (Inside ExpenseListComponent)
```tsx
const [expandedIncomeIds, setExpandedIncomeIds] = useState<Set<string>>(new Set());

const toggleExpandIncome = (id: string) => {
  setExpandedIncomeIds(prev => {
    const newSet = new Set(prev);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    return newSet;
  });
};
```

### Step 2: Refactor Income Item Layout
**Current location:** `{incomes.map((income) => { ... })}`

**Changes:**
- Add chevron button (left)
- Simplify default view
- Move net amount to right (prominent)
- Add expandable details section

### Step 3: Refactor Summary Section
**Current location:** `{/* Income Breakdown Section */}`

**Changes:**
- Add indentation (`pl-4`) to deductions
- Remove `—` symbols
- Add tooltip to "Potongan Global"
- Highlight "Total Bersih"

---

## 🎨 VISUAL RESULT

### BEFORE (Item):
```
┌─────────────────────────────────────┐
│ Fiverr                              │
│ 8 Nov 2025                          │
│ $53.08 × Rp 16.111 (realtime)       │ ← TMI!
│ Potongan: Rp 24.000 (Kotor: ...)   │ ← TMI!
│                     Rp 831.000 [👁️][•••] │
└─────────────────────────────────────┘
```

### AFTER (Collapsed):
```
┌─────────────────────────────────────┐
│ 🔽 Fiverr              +Rp 831.000 [👁️][•••] │
│    8 Nov • Auto                     │
└─────────────────────────────────────┘
```

### AFTER (Expanded):
```
┌─────────────────────────────────────┐
│ 🔼 Fiverr              +Rp 831.000 [👁️][•••] │
│    8 Nov • Auto                     │
│    │ Kotor: $53.08 × Rp 16.111 = Rp 855k │
│    │ Potongan: -Rp 24.000          │
└─────────────────────────────────────┘
```

### BEFORE (Summary):
```
Total Kotor: Rp 1.000.000
— Potongan Individual: -Rp 50.000    ← Flat
Subtotal: Rp 950.000
— Potongan Global: -Rp 100.000       ← No context
Total Bersih: Rp 850.000             ← Not highlighted
```

### AFTER (Summary):
```
Total Kotor                Rp 1.000.000
    Potongan Individual      -Rp 50.000  ← Indented!
Subtotal                     Rp 950.000
    Potongan Global ℹ️        -Rp 100.000  ← Indented + tooltip!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Bersih               Rp 850.000    ← Bold, larger!
```

---

## 🚨 CONSTRAINTS

**CRITICAL:** Only modify within the selected `<CardContent>` element!

**Do NOT modify:**
- Component imports at top of file
- State declarations outside CardContent
- Props interface
- Other tabs (Expense tab)
- Code outside the selected element

**CAN modify:**
- Income tab rendering (inside CardContent)
- Income summary section
- Add local state for expand/collapse

---

## 📐 EXACT CHANGES

### Change 1: Add State for Progressive Disclosure
**Location:** Inside `ExpenseListComponent`, before the return statement

```tsx
// Add after other useState declarations
const [expandedIncomeIds, setExpandedIncomeIds] = useState<Set<string>>(new Set());
```

### Change 2: Refactor Income Item
**Location:** `{incomes.map((income) => { ... })}`

Replace the entire item div structure with progressive disclosure layout.

### Change 3: Refactor Summary Section
**Location:** `{/* Income Breakdown Section */}`

Add hierarchy with indentation and tooltip.

---

## ⏱️ EXECUTION PLAN

1. **Read current code** (verify structure) - 2 min
2. **Add expandedIncomeIds state** - 2 min
3. **Refactor income item layout** - 15 min
4. **Refactor summary hierarchy** - 10 min
5. **Add info tooltip** - 5 min
6. **Test interactions** - 5 min

**Total:** ~40 minutes

---

## ✅ SUCCESS CRITERIA

- [x] Items show clean summary by default
- [x] Chevron expands/collapses details
- [x] Net amount prominently displayed
- [x] Summary has clear hierarchy
- [x] Total Bersih highlighted
- [x] Info tooltip explains "Potongan Global"
- [x] All existing functionality preserved
- [x] No changes outside selected element

---

**Status:** Ready to implement  
**Next:** Execute changes within CardContent only
