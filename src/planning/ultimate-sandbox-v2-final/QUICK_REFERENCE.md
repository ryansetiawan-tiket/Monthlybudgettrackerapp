# 🚀 Ultimate Sandbox V2 - Quick Reference

## 📋 What's New?

### 1. 🏷️ Category Filter Dropdown
**Location:** Below tab filter (Semua/Pengeluaran/Pemasukan)

**Features:**
- Filter transactions by category with checkboxes
- Search categories
- "Semua Kategori" to toggle all
- Bulk actions: "Centang Semua" / "Hapus Semua"
- Shows count per category (e.g., "🍔 Makanan (5)")

**Usage:**
```
Click "Filter Kategori" → Select categories → See filtered results
```

---

### 2. 📅 Date Grouping with Parent Checkbox
**Location:** Transaction list (like ExpenseList)

**Features:**
- Transactions grouped by date (newest first)
- Parent checkbox per date group
- Toggle entire date group with 1 click
- Indeterminate state for partial selection
- Shows item count + total per date

**Usage:**
```
Click parent checkbox → All transactions for that date toggle
Uncheck 1 child → Parent shows indeterminate (-)
```

---

### 3. 🎨 Footer Button Hierarchy (Desktop)
**Location:** Bottom of sandbox

**Changes:**
- **Reset:** Now red (destructive) on desktop
- **Tutup:** Solid/primary (emphasized)
- **Simpan/Muat:** Outline (secondary)
- Mobile: Unchanged (good UX)

---

## 🎯 Quick Workflows

### Workflow 1: Filter by Category + Bulk Uncheck
```
1. Click "Filter Kategori"
2. Select "🎮 Game"
3. Click "Hapus Semua"
4. All game expenses unchecked
```

### Workflow 2: Exclude Entire Date
```
1. Find "Sabtu, 8 Nov" date header
2. Click parent checkbox (☑ → ☐)
3. All Saturday transactions excluded
```

### Workflow 3: Save Complex Scenario
```
1. Filter: "🍔 Makanan" + "🎮 Game"
2. Uncheck: "Jumat, 7 Nov" (all Friday)
3. Click "💾 Simpan"
4. Name: "No Food/Game on Friday"
5. Load anytime with "📂 Muat"
```

---

## 🎨 Visual Guide

### Complete Sandbox Layout
```
┌──────────────────────────────────────┐
│ 🔬 Simulation Sandbox                │
├──────────────────────────────────────┤
│ [Pemasukan] [Pengeluaran] [Sisa]    │ ← Metrics
├──────────────────────────────────────┤
│ [☑ Potongan Global - Rp 50K]        │ ← If exists
├──────────────────────────────────────┤
│ [Semua] [Pengeluaran] [Pemasukan]   │ ← Tabs
├──────────────────────────────────────┤
│ [🏷️ Filter Kategori: 2 dipilih ▼]  │ ← NEW: Category filter
├──────────────────────────────────────┤
│ ☑ Sabtu, 8 Nov (2 items) - Rp 65K   │ ← NEW: Parent checkbox
│   ☑ 🍔 Tahu + kecap    - Rp 15,000  │   Child (indented)
│   ☑ 🎮 Game            - Rp 50,000  │   Child (indented)
├──────────────────────────────────────┤
│ ☐ Jumat, 7 Nov (1 item) - Rp 20K    │ ← Parent checkbox
│   ☑ 🚌 Gojek           - Rp 20,000  │   Child
├──────────────────────────────────────┤
│ [💾 Simpan] [📂 Muat]                │ ← Row 1: Secondary
│ [🗑️ Reset]  [✓ Tutup]                │ ← Row 2: Destructive + Primary
└──────────────────────────────────────┘
```

### Category Filter Dropdown (Expanded)
```
┌──────────────────────────────────────┐
│ 🏷️ Filter Kategori                  │
├──────────────────────────────────────┤
│ 🔍 Cari kategori...                 │ ← Search
├──────────────────────────────────────┤
│ ☑ Semua Kategori                    │ ← Toggle all
├──────────────────────────────────────┤
│ ☑ 🍔 Makanan (5)                    │ ← Category + count
│ ☐ 🎮 Game (3)                       │
│ ☑ 🚌 Transport (2)                  │
├──────────────────────────────────────┤
│ [✅ Centang Semua] [⬜ Hapus Semua]  │ ← Bulk actions
└──────────────────────────────────────┘
```

---

## 🔧 Technical Details

### State Variables (New)
```typescript
const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
const [categorySearchQuery, setCategorySearchQuery] = useState('');
const [showCategoryFilter, setShowCategoryFilter] = useState(false);
```

### Key Functions (New)
```typescript
// Date grouping
groupTransactionsByDate(transactions: Transaction[]): DateGroup[]
getParentCheckboxState(dateGroup: DateGroup)
handleToggleDateGroup(dateGroup: DateGroup)

// Category filter
handleToggleCategory(categoryId: string)
handleSelectAllCategories()
handleCheckAllFiltered()
handleUncheckAllFiltered()
```

### Filter Logic
```typescript
// 2-step filtering
const filteredTransactions = useMemo(() => {
  // Step 1: Filter by tab (all/expense/income)
  // Step 2: Filter by category (NEW)
}, [allTransactions, activeTab, selectedCategories]);

// Then group by date
const groupedTransactions = useMemo(() => {
  return groupTransactionsByDate(filteredTransactions);
}, [filteredTransactions]);
```

---

## 🎯 Checkbox States Explained

### Parent Checkbox States
| Visual | State | Meaning |
|--------|-------|---------|
| ☑ | Checked | All children checked |
| ☐ | Unchecked | No children checked |
| ➖ | Indeterminate | Some children checked |

### Indeterminate Example
```
☐ Sabtu, 8 Nov (2 items)
  ☑ Tahu + kecap    ← Checked
  ☐ Game            ← Unchecked
  
↓ Parent becomes indeterminate ↓

➖ Sabtu, 8 Nov (2 items)  ← Mixed state
  ☑ Tahu + kecap
  ☐ Game
```

---

## 🚨 Important Notes

### Reset Button Behavior
```
Desktop: Red (destructive) - visual warning
Mobile:  Outline (same as before) - better mobile UX
```

**What Reset Does:**
- ✅ Checks all expenses
- ✅ Checks all incomes
- ✅ Enables global deduction
- ✅ **Clears category filter** ← NEW

### Category Filter Integration
```
Category filter works WITH tab filter:
- Tab = "Pengeluaran" + Category = "🍔 Makanan"
- Result: Only food expenses (not food income)
```

---

## 📊 Performance

**Optimizations:**
- All filtering uses `useMemo`
- Date grouping is memoized
- Category counts are memoized
- Parent checkbox state is efficient

**Tested:**
- ✅ 50+ transactions: Smooth
- ✅ 10+ categories: No lag
- ✅ 10+ date groups: Smooth scroll

---

## 🎓 Best Practices

### 1. Use Category Filter for Specific Analysis
```
Example: "How much do I spend on 🎮 Game + 🍔 Makanan?"
1. Select both categories
2. See total in metrics card
3. Save as "Entertainment + Food" scenario
```

### 2. Use Date Grouping for Time-based Exclusion
```
Example: "What if I skip all weekend expenses?"
1. Find "Sabtu" and "Minggu" date headers
2. Uncheck both parent checkboxes
3. See weekday-only budget
```

### 3. Combine Filters for Complex Scenarios
```
Example: "No game expenses on Friday"
1. Tab: "Pengeluaran"
2. Category: "🎮 Game"
3. Uncheck "Jumat" date group
4. Save scenario
```

---

## 🐛 Troubleshooting

### Issue: "Category filter not working"
**Solution:** Check that:
- ✅ Transactions have `category` field
- ✅ Category exists in settings
- ✅ Tab filter is compatible

### Issue: "Parent checkbox stuck in indeterminate"
**Solution:** This is correct behavior!
- Indeterminate = some children checked
- Click parent to check/uncheck all

### Issue: "Can't see bulk action buttons"
**Solution:** 
- Open category filter dropdown
- Scroll to bottom
- Buttons are in footer of dropdown

---

## 📚 Related Documentation

- **Full Planning:** `/planning/ultimate-sandbox-v2-final/PLANNING.md`
- **Implementation:** `/planning/ultimate-sandbox-v2-final/IMPLEMENTATION_COMPLETE.md`
- **Component:** `/components/SimulationSandbox.tsx`

---

## ✅ Quick Checklist

**Category Filter:**
- [ ] Can open dropdown
- [ ] Can search categories
- [ ] Can select multiple categories
- [ ] Can use "Centang Semua" / "Hapus Semua"
- [ ] Filter clears on Reset

**Date Grouping:**
- [ ] Transactions grouped by date
- [ ] Parent checkbox toggles all children
- [ ] Indeterminate state works correctly
- [ ] Date headers are sticky

**Footer Hierarchy:**
- [ ] Reset is red on desktop
- [ ] Tutup is primary (solid)
- [ ] Simpan/Muat are secondary (outline)

---

**Version:** Ultimate Sandbox V2  
**Date:** November 9, 2025  
**Status:** ✅ Production Ready
