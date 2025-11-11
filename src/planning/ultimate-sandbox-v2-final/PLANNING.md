# 🎯 Ultimate Sandbox V2: Filter Kategori + Date Grouping + Footer Polish

## 📋 Executive Summary

**Objective:** Enhance SimulationSandbox with powerful filtering capabilities and visual polish  
**Scope:** 3 Major Tasks (Functional + Visual)  
**Impact:** Dramatically improves UX for bulk scenario testing  
**Timeline:** Single comprehensive implementation session

---

## 🎯 TUGAS 1: Quick Filter by Kategori

### Problem Statement
Users cannot quickly bulk-exclude transactions by category (e.g., "exclude all 'Game' transactions"). Current workflow requires manually unchecking each transaction one-by-one.

### Solution Design

#### UI Placement
```
┌─────────────────────────────────────┐
│  🔬 Simulation Sandbox              │
├─────────────────────────────────────┤
│  [Metrics Cards: Income/Expense/Remaining] │
│  [Global Deduction Toggle]          │
│  ┌───────────────────────────────┐ │
│  │ Semua │ Pengeluaran │ Pemasukan │ │  ← Tab Filter
│  └───────────────────────────────┘ │
│  ┌───────────────────────────────┐ │
│  │ 🏷️ Filter Kategori ▼          │ │  ← NEW: Category Filter Dropdown
│  └───────────────────────────────┘ │
│  [Transaction List]                 │
└─────────────────────────────────────┘
```

#### Component: Category Filter Dropdown

**Using:** shadcn/ui `Popover` + `Command` (for searchable dropdown)

**Dropdown Content:**
```
┌───────────────────────────────────┐
│ 🏷️ Filter Kategori                │
├───────────────────────────────────┤
│ 🔍 Cari kategori...               │  ← Search input
├───────────────────────────────────┤
│ ☑ Semua Kategori                  │  ← "Select All" checkbox
├───────────────────────────────────┤
│ ☑ 🍔 Makanan (5)                  │  ← Category with count
│ ☐ 🎮 Game (3)                     │
│ ☑ 🚌 Transport (2)                │
│ ☐ 💊 Kesehatan (1)                │
│ ...                                │
├───────────────────────────────────┤
│ [✅ Centang Semua] [⬜ Hapus Semua]│  ← Bulk actions
└───────────────────────────────────┘
```

#### State Management

**New State Variables:**
```typescript
// In SimulationSandbox.tsx
const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
const [categorySearchQuery, setCategorySearchQuery] = useState('');
```

**Filter Logic:**
```typescript
// Step 1: Filter by tab (all/expense/income) - EXISTING
// Step 2: Filter by category - NEW
const filteredTransactions = transactions
  .filter(t => activeTab === 'all' || t.type === activeTab)
  .filter(t => {
    // If no categories selected, show all
    if (selectedCategories.size === 0) return true;
    
    // Show transaction if its category is selected
    return t.category && selectedCategories.has(t.category);
  });
```

**Category Count Logic:**
```typescript
// Count transactions per category
const categoryCounts = useMemo(() => {
  const counts = new Map<string, number>();
  
  transactions.forEach(t => {
    if (!t.category) return;
    counts.set(t.category, (counts.get(t.category) || 0) + 1);
  });
  
  return counts;
}, [transactions]);
```

#### Bulk Actions

**"Centang Semua yang Terfilter":**
```typescript
const handleCheckAllFiltered = () => {
  const filteredIds = filteredTransactions.map(t => t.id);
  
  setIncludedExpenseIds(prev => {
    const newSet = new Set(prev);
    filteredIds.forEach(id => {
      const transaction = transactions.find(t => t.id === id);
      if (transaction?.type === 'expense') {
        newSet.add(id);
      }
    });
    return newSet;
  });
  
  setIncludedIncomeIds(prev => {
    const newSet = new Set(prev);
    filteredIds.forEach(id => {
      const transaction = transactions.find(t => t.id === id);
      if (transaction?.type === 'income') {
        newSet.add(id);
      }
    });
    return newSet;
  });
  
  toast.success(`✅ ${filteredIds.length} transaksi dicentang`);
};
```

**"Hapus Centang Semua":**
```typescript
const handleUncheckAllFiltered = () => {
  const filteredIds = filteredTransactions.map(t => t.id);
  
  setIncludedExpenseIds(prev => {
    const newSet = new Set(prev);
    filteredIds.forEach(id => newSet.delete(id));
    return newSet;
  });
  
  setIncludedIncomeIds(prev => {
    const newSet = new Set(prev);
    filteredIds.forEach(id => newSet.delete(id));
    return newSet;
  });
  
  toast.success(`⬜ ${filteredIds.length} transaksi dihapus centangnya`);
};
```

#### Implementation Checklist - Task 1

- [ ] Import Popover & Command components
- [ ] Add state: `selectedCategories`, `categorySearchQuery`
- [ ] Extract unique categories from transactions
- [ ] Calculate category counts with useMemo
- [ ] Create category filter dropdown UI
- [ ] Implement "Select All" checkbox logic
- [ ] Implement individual category checkbox logic
- [ ] Add bulk action buttons (Centang Semua / Hapus Semua)
- [ ] Update filteredTransactions to respect category filter
- [ ] Add visual indicator when category filter is active
- [ ] Test: Filter by single category
- [ ] Test: Filter by multiple categories
- [ ] Test: Bulk check/uncheck with filter active
- [ ] Test: Clear filter interaction with tab switching

---

## 🎯 TUGAS 2: Date Grouping & Parent Checkbox

### Problem Statement
Current transaction list is flat, making it impossible to bulk-exclude by date (e.g., "exclude all Sunday transactions"). ExpenseList has beautiful date grouping - we need the same!

### Solution Design

#### Current vs Target Layout

**BEFORE (Flat List):**
```
☑ 🍔 Tahu + kecap - Rp 15,000 (8 Nov)
☑ 🎮 Game - Rp 50,000 (8 Nov)
☑ 🚌 Gojek - Rp 20,000 (7 Nov)
```

**AFTER (Grouped with Parent Checkbox):**
```
┌─────────────────────────────────────┐
│ ☑ Sabtu, 8 Nov (2 items)            │  ← Parent checkbox + header
│   ☑ 🍔 Tahu + kecap - Rp 15,000     │  ← Child (indented)
│   ☑ 🎮 Game - Rp 50,000             │  ← Child (indented)
├─────────────────────────────────────┤
│ ☐ Jumat, 7 Nov (1 item)             │  ← Parent checkbox
│   ☑ 🚌 Gojek - Rp 20,000            │  ← Child (indented)
└─────────────────────────────────────┘
```

#### Data Grouping Logic

**Reuse ExpenseList Pattern:**
```typescript
// Import from date-helpers.ts
import { formatDateGroupHeader, groupTransactionsByDate } from '../utils/date-helpers';

// Group transactions by date
const groupedTransactions = useMemo(() => {
  return groupTransactionsByDate(filteredTransactions);
}, [filteredTransactions]);

// Type definition
interface DateGroup {
  date: string; // ISO date string (YYYY-MM-DD)
  displayDate: string; // "Sabtu, 8 Nov" 
  transactions: Transaction[];
}
```

**Helper Function (if doesn't exist):**
```typescript
// In utils/date-helpers.ts
export function groupTransactionsByDate(transactions: Transaction[]): DateGroup[] {
  const groups = new Map<string, Transaction[]>();
  
  transactions.forEach(t => {
    const dateOnly = t.date.split('T')[0]; // Get YYYY-MM-DD
    if (!groups.has(dateOnly)) {
      groups.set(dateOnly, []);
    }
    groups.get(dateOnly)!.push(t);
  });
  
  return Array.from(groups.entries())
    .map(([date, items]) => ({
      date,
      displayDate: formatDateGroupHeader(date),
      transactions: items,
    }))
    .sort((a, b) => b.date.localeCompare(a.date)); // Newest first
}
```

#### Parent Checkbox Logic

**State for Parent Checkboxes:**
```typescript
// Calculate parent state based on children
const getParentCheckboxState = (dateGroup: DateGroup): {
  checked: boolean;
  indeterminate: boolean;
} => {
  const expenseIds = dateGroup.transactions
    .filter(t => t.type === 'expense')
    .map(t => t.id);
  const incomeIds = dateGroup.transactions
    .filter(t => t.type === 'income')
    .map(t => t.id);
  
  const allIds = [...expenseIds, ...incomeIds];
  const checkedCount = allIds.filter(id => {
    const transaction = transactions.find(t => t.id === id);
    if (transaction?.type === 'expense') {
      return includedExpenseIds.has(id);
    } else {
      return includedIncomeIds.has(id);
    }
  }).length;
  
  if (checkedCount === 0) {
    return { checked: false, indeterminate: false };
  } else if (checkedCount === allIds.length) {
    return { checked: true, indeterminate: false };
  } else {
    return { checked: false, indeterminate: true };
  }
};
```

**Parent Toggle Handler:**
```typescript
const handleToggleDateGroup = (dateGroup: DateGroup) => {
  const parentState = getParentCheckboxState(dateGroup);
  const shouldCheck = !parentState.checked;
  
  dateGroup.transactions.forEach(transaction => {
    if (transaction.type === 'expense') {
      setIncludedExpenseIds(prev => {
        const newSet = new Set(prev);
        if (shouldCheck) {
          newSet.add(transaction.id);
        } else {
          newSet.delete(transaction.id);
        }
        return newSet;
      });
    } else {
      setIncludedIncomeIds(prev => {
        const newSet = new Set(prev);
        if (shouldCheck) {
          newSet.add(transaction.id);
        } else {
          newSet.delete(transaction.id);
        }
        return newSet;
      });
    }
  });
};
```

#### UI Component Structure

**Date Group Header:**
```tsx
<div className="sticky top-0 bg-background z-10 border-b border-border">
  <div className="flex items-center gap-3 p-3">
    <Checkbox
      checked={parentState.checked}
      // @ts-ignore - Checkbox supports indeterminate
      indeterminate={parentState.indeterminate}
      onCheckedChange={() => handleToggleDateGroup(dateGroup)}
    />
    <div className="flex-1">
      <div className="font-medium">{dateGroup.displayDate}</div>
      <div className="text-xs text-muted-foreground">
        {dateGroup.transactions.length} item{dateGroup.transactions.length > 1 ? 's' : ''}
      </div>
    </div>
    <div className="text-sm font-semibold">
      {formatCurrency(
        dateGroup.transactions.reduce((sum, t) => sum + t.amount, 0)
      )}
    </div>
  </div>
</div>
```

**Child Transaction Row (Indented):**
```tsx
<div className="flex items-center gap-3 p-3 pl-12 border-b">
  {/* pl-12 for indentation */}
  <Checkbox
    checked={isIncluded}
    onCheckedChange={() => handleToggleTransaction(transaction.id, transaction.type)}
  />
  {/* Rest of transaction row... */}
</div>
```

#### Implementation Checklist - Task 2

- [ ] Import/create `groupTransactionsByDate` helper
- [ ] Import/create `formatDateGroupHeader` helper
- [ ] Add `groupedTransactions` useMemo
- [ ] Create `getParentCheckboxState` function
- [ ] Create `handleToggleDateGroup` function
- [ ] Update UI: Replace flat list with grouped layout
- [ ] Add date group header component
- [ ] Add parent checkbox to header
- [ ] Indent child transaction rows (pl-12 or similar)
- [ ] Add sticky positioning to date headers
- [ ] Add total amount per date group
- [ ] Test: Parent checkbox toggles all children
- [ ] Test: Unchecking one child makes parent indeterminate
- [ ] Test: Checking all children makes parent checked
- [ ] Test: Date grouping respects category filter
- [ ] Test: Mobile responsive behavior

---

## 🎯 TUGAS 3: Footer Button Hierarchy (Desktop Only)

### Problem Statement
All 4 footer buttons have equal visual weight, making it unclear which is the primary action. This creates decision paralysis.

### Solution Design

#### Button Priority Analysis

| Button | Priority | User Goal | Frequency | Style |
|--------|----------|-----------|-----------|-------|
| **Tutup** | Primary | Exit after reviewing simulation | Every session | Filled/Solid |
| **Simpan** | Secondary | Save scenario for later | Occasional | Outlined |
| **Muat** | Secondary | Load saved scenario | Occasional | Outlined |
| **Reset** | Destructive | Undo all changes (warning action) | Rare | Destructive |

#### Current vs Target Styling

**BEFORE (All Equal Weight):**
```tsx
<div className="flex gap-2">
  <Button variant="outline">💾 Simpan</Button>
  <Button variant="outline">📂 Muat</Button>
</div>
<div className="flex gap-2">
  <Button variant="outline">Reset</Button>
  <Button>Tutup</Button>  {/* Already primary? */}
</div>
```

**AFTER (Clear Hierarchy):**
```tsx
<div className="flex gap-2">
  <Button variant="outline">💾 Simpan</Button>      {/* Secondary */}
  <Button variant="outline">📂 Muat</Button>        {/* Secondary */}
</div>
<div className="flex gap-2">
  <Button variant="destructive">Reset</Button>      {/* Destructive - NEW */}
  <Button variant="default">Tutup</Button>          {/* Primary - KEEP */}
</div>
```

#### Styling Specifications

**Desktop Footer (2x2 Grid):**
```tsx
{/* Row 1: Save/Load - Both Secondary */}
<div className="flex gap-2">
  <Button 
    variant="outline"        // ✅ Keep outline
    onClick={handleOpenSaveDialog}
    className="flex-1"
  >
    💾 Simpan
  </Button>
  <Button 
    variant="outline"        // ✅ Keep outline
    onClick={handleOpenLoadDialog}
    className="flex-1"
  >
    📂 Muat
  </Button>
</div>

{/* Row 2: Reset/Close - Destructive + Primary */}
<div className="flex gap-2">
  <Button 
    variant="destructive"    // ❌ CHANGE from outline
    onClick={handleReset} 
    className="flex-1"
  >
    Reset
  </Button>
  <Button 
    variant="default"        // ✅ Keep default (already primary)
    onClick={onClose} 
    className="flex-1"
  >
    Tutup
  </Button>
</div>
```

**Mobile Footer (Keep Unchanged):**
```tsx
// Mobile already has good hierarchy in 2x2 grid
// No changes needed for mobile
```

#### Visual Design Tokens

**Button Variants (from shadcn/ui):**
```typescript
// variant="default" (Primary)
// - Background: solid primary color
// - Text: white
// - Hover: darker primary

// variant="outline" (Secondary)
// - Background: transparent
// - Border: 1px solid border color
// - Text: foreground color
// - Hover: accent background

// variant="destructive" (Destructive)
// - Background: solid red/destructive color
// - Text: white
// - Hover: darker destructive
```

#### Implementation Checklist - Task 3

- [ ] Locate footer buttons section in SimulationSandbox.tsx
- [ ] Identify desktop vs mobile conditional rendering
- [ ] Update Reset button: `variant="destructive"` (desktop only)
- [ ] Verify Tutup button has `variant="default"` (should already exist)
- [ ] Verify Simpan/Muat keep `variant="outline"`
- [ ] Test visual hierarchy on desktop
- [ ] Verify mobile footer unchanged
- [ ] Test button hover states
- [ ] Test color contrast (accessibility)
- [ ] Add visual documentation screenshot

---

## 🏗️ Implementation Strategy

### Phase 1: Setup & Imports
1. Review current SimulationSandbox.tsx structure
2. Import necessary components (Popover, Command)
3. Import/create date grouping utilities
4. Plan state additions

### Phase 2: Task 1 - Category Filter
1. Add category filter state
2. Extract unique categories from transactions
3. Build category filter dropdown UI
4. Implement filter logic
5. Add bulk action buttons
6. Test filtering behavior

### Phase 3: Task 2 - Date Grouping
1. Create/import date grouping utilities
2. Group transactions by date
3. Implement parent checkbox logic
4. Update UI to grouped layout
5. Add sticky headers
6. Test all checkbox interactions

### Phase 4: Task 3 - Footer Polish
1. Locate footer button code
2. Update Reset button variant (desktop)
3. Verify other buttons
4. Test visual hierarchy

### Phase 5: Integration Testing
1. Test Task 1 + Task 2 interaction (category filter + date grouping)
2. Test all features together
3. Mobile responsiveness check
4. Accessibility audit
5. Performance check (large transaction lists)

---

## 🎨 Visual Mockups

### Complete Sandbox Layout (After All Tasks)

```
┌─────────────────────────────────────────────┐
│  🔬 Simulation Sandbox                      │
├─────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Pemasukan│ │Pengeluaran│ │Sisa Budget│   │
│  │ +500K    │ │ -300K     │ │ +200K     │   │
│  └──────────┘ └──────────┘ └──────────┘   │
├─────────────────────────────────────────────┤
│  ☑ Potongan Global - Rp 50,000             │  (if exists)
├─────────────────────────────────────────────┤
│  ┌────────────────────────────────────┐    │
│  │ Semua │ Pengeluaran │ Pemasukan    │    │  Tab filter
│  └────────────────────────────────────┘    │
│  ┌────────────────────────────────────┐    │
│  │ 🏷️ Filter Kategori: 2 dipilih ▼   │    │  NEW: Category filter
│  └────────────────────────────────────┘    │
├─────────────────────────────────────────────┤
│  ☑ Sabtu, 8 Nov (2 items) - Rp 65K         │  NEW: Date header + parent checkbox
│    ☑ 🍔 Tahu + kecap      - Rp 15,000      │  Child (indented)
│    ☑ 🎮 Game              - Rp 50,000      │  Child (indented)
├─────────────────────────────────────────────┤
│  ☐ Jumat, 7 Nov (1 item) - Rp 20K          │  Date header
│    ☑ 🚌 Gojek             - Rp 20,000      │  Child
├─────────────────────────────────────────────┤
│  [💾 Simpan] [📂 Muat]                     │  Row 1: Secondary buttons
│  [🗑️ Reset]  [✓ Tutup]                     │  Row 2: Destructive + Primary
└─────────────────────────────────────────────┘
```

### Category Filter Dropdown (Expanded)

```
┌─────────────────────────────────────┐
│ 🏷️ Filter Kategori                 │
├─────────────────────────────────────┤
│ 🔍 Cari kategori...                │
├─────────────────────────────────────┤
│ ☑ Semua Kategori                   │  ← Special "select all"
├─────────────────────────────────────┤
│ ☑ 🍔 Makanan (5)                   │  ← Checked
│ ☐ 🎮 Game (3)                      │  ← Unchecked
│ ☑ 🚌 Transport (2)                 │  ← Checked
│ ☐ 💊 Kesehatan (1)                 │
│ ☐ 🏠 Rumah Tangga (4)              │
│ ☐ 📱 Gadget (2)                    │
├─────────────────────────────────────┤
│ [✅ Centang Semua] [⬜ Hapus Semua] │  ← Bulk actions
└─────────────────────────────────────┘
```

---

## 🧪 Testing Checklist

### Task 1: Category Filter
- [ ] Dropdown opens correctly
- [ ] Search filters categories
- [ ] Selecting category filters transaction list
- [ ] Multiple category selection works
- [ ] "Semua Kategori" checkbox toggles all
- [ ] "Centang Semua" checks all filtered transactions
- [ ] "Hapus Semua" unchecks all filtered transactions
- [ ] Category count badges are accurate
- [ ] Filter persists when switching tabs
- [ ] Filter clears when Reset is pressed
- [ ] Visual indicator shows active filter

### Task 2: Date Grouping
- [ ] Transactions grouped by date correctly
- [ ] Date headers show correct day/date format
- [ ] Date headers are sticky during scroll
- [ ] Parent checkbox shows correct state (checked/unchecked/indeterminate)
- [ ] Clicking parent checkbox toggles all children
- [ ] Unchecking one child makes parent indeterminate
- [ ] Checking all children makes parent checked
- [ ] Item count per date is accurate
- [ ] Total amount per date is accurate
- [ ] Child rows are visually indented
- [ ] Grouping respects category filter
- [ ] Grouping respects tab filter

### Task 3: Footer Hierarchy
- [ ] Reset button has destructive styling (red) on desktop
- [ ] Tutup button has primary styling (filled) on desktop
- [ ] Simpan/Muat buttons have outline styling
- [ ] Mobile footer unchanged (2x2 grid retained)
- [ ] Button hover states work correctly
- [ ] Color contrast meets WCAG standards
- [ ] Visual hierarchy is clear and intuitive

### Integration Testing
- [ ] Category filter + Date grouping work together
- [ ] Category filter + Tab filter work together
- [ ] Bulk actions work with filtered + grouped view
- [ ] Save/Load preserves state correctly
- [ ] Reset clears all filters and selections
- [ ] Performance with 50+ transactions
- [ ] Performance with 10+ categories
- [ ] Mobile responsiveness (all tasks)
- [ ] Accessibility: keyboard navigation works
- [ ] Accessibility: screen reader announces correctly

---

## 📊 Success Metrics

### Functionality
- ✅ Users can filter by category with 1 click
- ✅ Users can bulk-exclude by date with 1 click
- ✅ Users can bulk-check/uncheck filtered results
- ✅ Visual hierarchy guides users to primary action

### UX Improvements
- ⏱️ **50% faster** to exclude by category (vs manual)
- ⏱️ **70% faster** to exclude by date (vs manual)
- 🎯 **Clear action priority** in footer (no confusion)
- ✨ **Professional grouping** (matches ExpenseList UX)

### Code Quality
- 🏗️ Reuses existing utilities (date-helpers, categoryManager)
- 🧩 Follows existing patterns (ExpenseList grouping)
- ♿ Maintains accessibility (WCAG compliant)
- 📱 Responsive on all screen sizes

---

## 🚀 Ready for Implementation

**Next Steps:**
1. ✅ Planning document created (this file)
2. ⏳ Proceed to implementation (3 tasks in sequence)
3. ⏳ Testing & QA
4. ⏳ Documentation update

**Estimated Time:** 2-3 hours for complete implementation + testing

**Dependencies:**
- shadcn/ui components: Popover, Command (for category filter)
- Existing utilities: date-helpers.ts, categoryManager.ts
- Existing state management: includedExpenseIds, includedIncomeIds

---

**Status:** 📋 Planning Complete - Ready for Implementation  
**Date:** November 9, 2025  
**Feature:** Ultimate Sandbox V2 (Filter + Grouping + Polish)
