# 🔍 ExpenseList.tsx - Manual Cleanup Guide

**File:** `/components/ExpenseList.tsx`  
**Total Lines:** 3,797  
**Estimated Cleanup:** ~500-600 lines (13-16% reduction)

---

## 📋 Blocks to Delete (11 Total)

Setelah kamu hapus semua blok ini, **ExpenseList.tsx akan berkurang menjadi ~3,200 lines** (from 3,797).

---

### 🔻 BLOCK 1: Commented Edit States (Lines 189-207)
**Lines:** 189-207 (19 lines)  
**Reason:** States sudah moved ke `useExpenseActions` hook

```
Line 189: Start from comment line
Line 207: End at closing comment
```

**Marker:**
```typescript
🔻hapus dari sini🔻
  // ⚠️ Edit expense states moved to useExpenseActions hook (Phase 3 - CANARY #3)
  // const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  // const [editingExpense, setEditingExpense] = useState<Omit<Expense, 'id'>>({ 
  //   name: '', 
  //   amount: 0, 
  //   date: '', 
  //   items: [], 
  //   color: '', 
  //   fromIncome: undefined,
  //   currency: undefined,
  //   originalAmount: undefined,
  //   exchangeRate: undefined,
  //   conversionType: undefined,
  //   deduction: undefined,
  //   pocketId: undefined,
  //   groupId: undefined,
  //   category: undefined,
  //   emoji: undefined
  // });
🔺hapus sampai sini🔺
```

---

### 🔻 BLOCK 2: Commented Search/Filter Comment (Line 208)
**Lines:** 208 (1 line)  
**Reason:** States sudah moved ke `useExpenseFiltering` hook

**Marker:**
```typescript
🔻hapus dari sini🔻
  // ⚠️ Search & filter states moved to useExpenseFiltering hook
🔺hapus sampai sini🔺
```

---

### 🔻 BLOCK 3: Commented Delete States (Lines 211-213)
**Lines:** 211-213 (3 lines)  
**Reason:** States sudah moved ke `useExpenseActions` hook

**Marker:**
```typescript
🔻hapus dari sini🔻
  // ⚠️ Delete confirmation states moved to useExpenseActions hook (Phase 3 - CANARY #3)
  // const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  // const [expenseToDelete, setExpenseToDelete] = useState<{ id: string; name: string; amount: number } | null>(null);
🔺hapus sampai sini🔺
```

---

### 🔻 BLOCK 4: Commented Bulk Select States (Lines 215-218)
**Lines:** 215-218 (4 lines)  
**Reason:** States sudah moved ke `useBulkSelection` hook

**Marker:**
```typescript
🔻hapus dari sini🔻
  // ⚠️ Bulk select states moved to useBulkSelection hook (Phase 3 - CANARY #2)
  // const [isBulkSelectMode, setIsBulkSelectMode] = useState(false);
  // const [selectedExpenseIds, setSelectedExpenseIds] = useState<Set<string>>(new Set());
  // const [selectedIncomeIds, setSelectedIncomeIds] = useState<Set<string>>(new Set());
🔺hapus sampai sini🔺
```

---

### 🔻 BLOCK 5: Commented Item Amount Inputs (Lines 220-221)
**Lines:** 220-221 (2 lines)  
**Reason:** States sudah moved ke `useExpenseActions` hook

**Marker:**
```typescript
🔻hapus dari sini🔻
  // ⚠️ Item amount inputs moved to useExpenseActions hook (Phase 3 - CANARY #3)
  // const [itemAmountInputs, setItemAmountInputs] = useState<{ [index: number]: string }>({});
🔺hapus sampai sini🔺
```

---

### 🔻 BLOCK 6: Commented Active Category Filter (Lines 231-232)
**Lines:** 231-232 (2 lines)  
**Reason:** State sudah moved ke `useExpenseFiltering` hook

**Marker:**
```typescript
🔻hapus dari sini🔻
  // ⚠️ activeCategoryFilter moved to useExpenseFiltering hook
  
🔺hapus sampai sini🔺
```

---

### 🔻 BLOCK 7: Commented Advanced Filter States (Line 237)
**Lines:** 237 (1 line)  
**Reason:** States sudah moved ke `useExpenseFiltering` hook

**Marker:**
```typescript
🔻hapus dari sini🔻
  // ⚠️ Advanced Filter states moved to useExpenseFiltering hook
🔺hapus sampai sini🔺
```

---

### 🔻 BLOCK 8: Commented Income Editing State (Lines 307-312)
**Lines:** 307-312 (6 lines)  
**Reason:** States sudah moved ke `useExpenseActions` hook

**Marker:**
```typescript
🔻hapus dari sini🔻
  // ⚠️ Income editing states moved to useExpenseActions hook (Phase 3 - CANARY #3)
  // const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null);
  
  // ⚠️ Loading states moved to useExpenseActions hook (Phase 3 - CANARY #3)
  // const [isUpdatingExpense, setIsUpdatingExpense] = useState(false);
  // const [isUpdatingIncome, setIsUpdatingIncome] = useState(false);
🔺hapus sampai sini🔺
```

---

### 🔻 BLOCK 9: Commented Action Sheet States (Lines 314-321)
**Lines:** 314-321 (8 lines)  
**Reason:** States sudah moved ke `useExpenseActions` hook

**Marker:**
```typescript
🔻hapus dari sini🔻
  // ⚠️ Mobile Bottom Sheet states moved to useExpenseActions hook (Phase 3 - CANARY #3)
  // const [actionSheetOpen, setActionSheetOpen] = useState(false);
  // const [actionSheetItem, setActionSheetItem] = useState<{
  //   id: string;
  //   name: string;
  //   type: 'expense' | 'income';
  //   fromIncome?: boolean;
  // } | null>(null);
🔺hapus sampai sini🔺
```

---

### 🔻 BLOCK 10: Commented Editing Income State (Lines 347-348)
**Lines:** 347-348 (2 lines)  
**Reason:** State sudah moved ke `useExpenseActions` hook

**Marker:**
```typescript
🔻hapus dari sini🔻
  // ⚠️ Editing income state moved to useExpenseActions hook (Phase 3 - CANARY #3)
  // const [editingIncome, setEditingIncome] = useState<Partial<AdditionalIncome>>({});
🔺hapus sampai sini🔺
```

---

### 🔻 BLOCK 11: LARGE COMMENTED BLOCK - Bulk Handlers (Lines 689-860)
**Lines:** 689-860 (~171 lines!) **← BIGGEST CLEANUP**  
**Reason:** Handlers sudah moved ke `useBulkSelection` hook

**Marker:**
```typescript
🔻hapus dari sini🔻
  // ⚠️ Bulk selection handlers moved to useBulkSelection hook (Phase 3 - CANARY #2)
  /*
  const handleActivateBulkMode = useCallback(() => {
    setIsBulkSelectMode(true);
    if (activeTab === 'expense') {
      setSelectedExpenseIds(new Set());
    } else {
      setSelectedIncomeIds(new Set());
    }
  }, [activeTab]);

  const handleCancelBulkMode = useCallback(() => {
    setIsBulkSelectMode(false);
    setSelectedExpenseIds(new Set());
    setSelectedIncomeIds(new Set());
  }, []);

  // Toggle handler for ConsolidatedToolbar
  const handleToggleBulkMode = useCallback(() => {
    if (isBulkSelectMode) {
      handleCancelBulkMode();
    } else {
      handleActivateBulkMode();
    }
  }, [isBulkSelectMode, handleCancelBulkMode, handleActivateBulkMode]);
  */

  // Phase 2: Handler to open sandbox with smart context
  const handleOpenSandbox = () => {
    // Map activeTab to sandbox context ('expense' or 'income' → same, otherwise 'all')
    const context = activeTab === 'expense' || activeTab === 'income' ? activeTab : 'all';
    setSandboxContext(context);
    setShowSandbox(true);
  };

  // Advanced Filter handlers
  /*
  // ⚠️ REMOVED - Now handled by useExpenseFiltering hook
  const toggleCategoryFilter = (categoryId: string) => {
    setSelectedCategoryFilters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const togglePocketFilter = (pocketId: string) => {
    setSelectedPocketFilters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pocketId)) {
        newSet.delete(pocketId);
      } else {
        newSet.add(pocketId);
      }
      return newSet;
    });
  };

  const toggleIncomeSourceFilter = (sourceName: string) => {
    setSelectedIncomeSourceFilters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sourceName)) {
        newSet.delete(sourceName);
      } else {
        newSet.add(sourceName);
      }
      return newSet;
    });
  };

  const applyFilters = () => {
    // Copy temporary selections to active filters
    setActiveFilters({
      categories: new Set(selectedCategoryFilters),
      pockets: new Set(selectedPocketFilters),
      incomeSources: new Set(selectedIncomeSourceFilters),
    });
    
    // Clear the pie chart category filter if advanced filter is active
    if (selectedCategoryFilters.size > 0) {
      setActiveCategoryFilter(new Set());
    }
    
    // Close drawer
    setIsFilterDrawerOpen(false);
    
    // Show success toast
    const filterCount = selectedCategoryFilters.size + selectedPocketFilters.size + selectedIncomeSourceFilters.size;
    if (filterCount > 0) {
      toast.success(`✅ ${filterCount} filter diterapkan`);
    }
  };

  const resetFilters = () => {
    // Clear all selections
    setSelectedCategoryFilters(new Set());
    setSelectedPocketFilters(new Set());
    setSelectedIncomeSourceFilters(new Set());
    setActiveFilters({
      categories: new Set(),
      pockets: new Set(),
      incomeSources: new Set(),
    });
    
    // Clear existing category filter badge
    setActiveCategoryFilter(new Set());
    
    // Close drawer
    setIsFilterDrawerOpen(false);
    
    // Show toast
    toast.info('🔄 Filter direset');
  };
  */

  // ⚠️ Bulk selection item toggle handlers moved to useBulkSelection hook (Phase 3 - CANARY #2)
  /*
  const handleToggleSelectExpense = (id: string) => {
    setSelectedExpenseIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleToggleSelectIncome = (id: string) => {
    setSelectedIncomeIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAllExpenses = () => {
    // ✅ FIX: Use allSortedExpenses (combined array) instead of sortedAndFilteredExpenses object
    const visibleExpenses = activeTab === 'expense' ? allSortedExpenses : [];
    if (selectedExpenseIds.size === visibleExpenses.length) {
      setSelectedExpenseIds(new Set());
    } else {
      setSelectedExpenseIds(new Set(visibleExpenses.map(exp => exp.id)));
    }
  };

  const handleSelectAllIncomes = () => {
    if (selectedIncomeIds.size === incomes.length) {
      setSelectedIncomeIds(new Set());
    } else {
      setSelectedIncomeIds(new Set(incomes.map(inc => inc.id)));
    }
  };

  // Unified handler for "Pilih semua" checkbox in toolbar
  const handleToggleSelectAll = () => {
    if (activeTab === 'expense') {
      handleSelectAllExpenses();
    } else {
      handleSelectAllIncomes();
    }
  };
  */
🔺hapus sampai sini🔺
```

**⚠️ IMPORTANT:** Setelah line 860, ada `const handleBulkDeleteIncomes = async () => {` yang HARUS TETAP! Jangan hapus!

---

### 🔻 BLOCK 12: Commented Fuzzy Match & Filter Logic (Lines 900-1075)
**Lines:** 900-1075 (~175 lines!) **← SECOND BIGGEST CLEANUP**  
**Reason:** Logic sudah moved ke `useExpenseFiltering` hook

**Marker:**
```typescript
🔻hapus dari sini🔻
  // ⚠️ fuzzyMatchExpense & fuzzyMatchIncome moved to useExpenseFiltering hook
  // ⚠️ categoryFilteredExpenses moved to useExpenseFiltering hook
  /*
  // Phase 7: Filter by category first, then by tab (expense/income), then by date
  // ⚠️ REMOVED - Now handled by useExpenseFiltering hook
  const _REMOVED_categoryFilteredExpenses = useMemo(() => {
    let filtered = expenses;
    
    // ... [ENTIRE BLOCK OF COMMENTED CODE] ...
    
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [incomes, activeFilters.incomeSources, searchQuery]);
  */
🔺hapus sampai sini🔺
```

**Note:** Ini adalah blok SANGAT BESAR (~175 lines). Cari dari line 900 sampai line 1075.

---

### 🔻 BLOCK 13: Commented isAllSelected Logic (Lines 1077-1107)
**Lines:** 1077-1107 (30 lines)  
**Reason:** Logic sudah moved ke `useBulkSelection` hook

**Marker:**
```typescript
🔻hapus dari sini🔻
  // ⚠️ isAllSelected and redundant handlers moved to useBulkSelection hook (Phase 3 - CANARY #2)
  /*
  const isAllSelected = useMemo(() => {
    return allSortedExpenses.length > 0 && 
           selectedExpenseIds.size === allSortedExpenses.length &&
           allSortedExpenses.every(exp => selectedExpenseIds.has(exp.id));
  }, [selectedExpenseIds, allSortedExpenses]);

  // Bulk select handlers with useCallback for performance - REMOVED (using handlers defined above that support both expense and income)

  const handleToggleExpense = useCallback((id: string) => {
    setSelectedExpenseIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedExpenseIds(new Set());
    } else {
      const allIds = new Set(allSortedExpenses.map(exp => exp.id));
      setSelectedExpenseIds(allIds);
    }
  }, [isAllSelected, sortedAndFilteredExpenses]);
  */
🔺hapus sampai sini🔺
```

---

### 🔻 BLOCK 14: Commented Auto-cleanup (Lines 1153-1169)
**Lines:** 1153-1169 (17 lines)  
**Reason:** Logic sudah moved ke `useBulkSelection` hook

**Marker:**
```typescript
🔻hapus dari sini🔻
  // ⚠️ Auto-cleanup selection moved to useBulkSelection hook (Phase 3 - CANARY #2)
  /*
  // Auto-exit bulk mode when expenses change (e.g., month change)
  useEffect(() => {
    if (isBulkSelectMode) {
      // Keep selections valid - remove any that no longer exist
      const validIds = new Set(
        Array.from(selectedExpenseIds).filter(id => 
          expenses.some(exp => exp.id === id)
        )
      );
      if (validIds.size !== selectedExpenseIds.size) {
        setSelectedExpenseIds(validIds);
      }
    }
  }, [expenses, isBulkSelectMode, selectedExpenseIds]);
  */
🔺hapus sampai sini🔺
```

---

### 🔻 BLOCK 15: LARGE DEPRECATED HANDLERS (Lines 1252-1350)
**Lines:** 1252-1350 (~98 lines!) **← THIRD BIGGEST CLEANUP**  
**Reason:** Handlers sudah moved ke `useExpenseActions` hook

**Marker:**
```typescript
🔻hapus dari sini🔻
  // ⚠️ DEPRECATED - Handlers moved to useExpenseActions hook - commenting to avoid duplicates
  /*
  const handleSheetEdit = useCallback(() => {
    if (!actionSheetItem) return;
    
    // ... [ENTIRE handleSheetEdit function] ...
  }, [actionSheetItem, incomes]);

  const handleSheetDelete = useCallback(() => {
    // ... [ENTIRE handleSheetDelete function] ...
  }, [actionSheetItem, expenses, onDeleteIncome]);

  const handleSheetMoveToIncome = useCallback(() => {
    // ... [ENTIRE handleSheetMoveToIncome function] ...
  }, [actionSheetItem, expenses, onMoveToIncome]);

  const handleSaveEditExpense = async () => {
    if (editingExpenseId) {
      // ... [ENTIRE handleSaveEditExpense function - VERY LONG] ...
    }
  };
  */
🔺hapus sampai sini🔺
```

**Note:** Cari dari line 1252 yang dimulai dengan `// ⚠️ DEPRECATED - Handlers moved to useExpenseActions hook` sampai line 1350 (akhir dari `};` dan `*/`).

---

## 📊 Summary

| Block | Lines | LOC to Delete | Percentage |
|-------|-------|---------------|------------|
| Block 1 | 189-207 | 19 | - |
| Block 2 | 208 | 1 | - |
| Block 3 | 211-213 | 3 | - |
| Block 4 | 215-218 | 4 | - |
| Block 5 | 220-221 | 2 | - |
| Block 6 | 231-232 | 2 | - |
| Block 7 | 237 | 1 | - |
| Block 8 | 307-312 | 6 | - |
| Block 9 | 314-321 | 8 | - |
| Block 10 | 347-348 | 2 | - |
| Block 11 | 689-860 | **171** | **🔥 Huge!** |
| Block 12 | 900-1075 | **175** | **🔥 Huge!** |
| Block 13 | 1077-1107 | 30 | - |
| Block 14 | 1153-1169 | 17 | - |
| Block 15 | 1252-1350 | **98** | **🔥 Huge!** |
| **TOTAL** | - | **~539 lines** | **14.2%** |

---

## ✅ After Cleanup

**Before:** 3,797 lines  
**After:** ~3,258 lines  
**Reduction:** ~539 lines (14.2%)

**Cumulative Progress:**
- Phase 1: -141 lines (types & helpers extracted)
- Phase 2: 0 lines (lazy loading only)
- Phase 3: -20 lines (hooks extracted, but new code added)
- **Manual Cleanup:** -539 lines (commented code removed)
- **Total:** -700 lines (18.5% reduction from original 3,958 lines)

**New File Size:** ~3,258 lines (from original 3,958)  
**Target:** ~1,979 lines (50% reduction)  
**Remaining:** ~1,279 lines to reduce via Phase 4-6

---

## ⚠️ CRITICAL NOTES

### DO NOT Delete These:
1. ❌ **Line 716:** `const handleOpenSandbox` - This is ACTIVE code!
2. ❌ **Line 862:** `const handleBulkDeleteIncomes` - This is ACTIVE code!
3. ❌ **Line 879:** `// Calculate totals` section - This is ACTIVE code!
4. ❌ **Line 1109:** `const handleBulkDelete` - This is ACTIVE code!
5. ❌ **Line 1354:** `const handleCloseEditDialog` - This is ACTIVE alias!

### How to Verify:
After deleting each block:
1. ✅ Check TypeScript compiles: `tsc --noEmit`
2. ✅ Run app: `npm run dev`
3. ✅ Test basic functionality (add, edit, delete expense)
4. ✅ Test bulk mode
5. ✅ Test search & filter

### Rollback if Needed:
```bash
git checkout HEAD -- components/ExpenseList.tsx
```

---

**Last Updated:** November 15, 2025  
**Cleanup Type:** Manual (User performs deletion)  
**Est. Time:** 15-20 minutes (careful deletion)
