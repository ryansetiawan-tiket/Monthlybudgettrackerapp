# ⚡ Quick Cleanup Guide - ExpenseList.tsx

**Step-by-Step manual deletion guide**

---

## 🎯 How to Use This Guide

1. Open `/components/ExpenseList.tsx` in your editor
2. Use Ctrl+G (VS Code) or Cmd+L (other editors) to go to line number
3. Select the block range
4. Delete
5. Save
6. Test (optional after each block, mandatory after all)

---

## 📋 15 Blocks to Delete

### ✅ Block 1: Lines 189-207 (19 lines)
**Go to line 189**, select until line 207, delete.

**What you'll see:**
```
// ⚠️ Edit expense states moved to useExpenseActions hook...
```

**What remains after (line 188-209):**
```typescript
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [upcomingExpanded, setUpcomingExpanded] = useState(true);
```

---

### ✅ Block 2: Line 208 (1 line)
**Go to line 208**, delete line.

**What you'll see:**
```
// ⚠️ Search & filter states moved to useExpenseFiltering hook
```

---

### ✅ Block 3: Lines 211-213 (3 lines)
**Go to line 211**, select until line 213, delete.

**What you'll see:**
```
// ⚠️ Delete confirmation states moved to useExpenseActions hook...
```

---

### ✅ Block 4: Lines 215-218 (4 lines)
**Go to line 215**, select until line 218, delete.

**What you'll see:**
```
// ⚠️ Bulk select states moved to useBulkSelection hook...
```

---

### ✅ Block 5: Lines 220-221 (2 lines)
**Go to line 220**, select until line 221, delete.

**What you'll see:**
```
// ⚠️ Item amount inputs moved to useExpenseActions hook...
```

---

### ✅ Block 6: Lines 231-232 (2 lines including blank line)
**Go to line 231**, select until line 232, delete.

**What you'll see:**
```
// ⚠️ activeCategoryFilter moved to useExpenseFiltering hook

```

---

### ✅ Block 7: Line 237 (1 line)
**Go to line 237**, delete line.

**What you'll see:**
```
// ⚠️ Advanced Filter states moved to useExpenseFiltering hook
```

---

### ✅ Block 8: Lines 307-312 (6 lines)
**Go to line 307**, select until line 312, delete.

**What you'll see:**
```
// ⚠️ Income editing states moved to useExpenseActions hook...
// ⚠️ Loading states moved to useExpenseActions hook...
```

---

### ✅ Block 9: Lines 314-321 (8 lines)
**Go to line 314**, select until line 321, delete.

**What you'll see:**
```
// ⚠️ Mobile Bottom Sheet states moved to useExpenseActions hook...
```

⚠️ **STOP BEFORE:** Line 322+ should be `// Register action sheet...` ← KEEP THIS!

---

### ✅ Block 10: Lines 347-348 (2 lines)
**Go to line 347**, select until line 348, delete.

**What you'll see:**
```
// ⚠️ Editing income state moved to useExpenseActions hook...
```

---

### ✅ Block 11: Lines 689-714 (26 lines) - MEDIUM BLOCK
**Go to line 689**, select until line 714, delete.

**What you'll see (start):**
```
// ⚠️ Bulk selection handlers moved to useBulkSelection hook...
/*
const handleActivateBulkMode = useCallback(() => {
```

**What you'll see (end):**
```
  }, [isBulkSelectMode, handleCancelBulkMode, handleActivateBulkMode]);
  */
```

⚠️ **STOP BEFORE:** Line 716 should be `// Phase 2: Handler to open sandbox...` ← KEEP THIS!

---

### ✅ Block 12: Lines 724-806 (83 lines) - LARGE BLOCK
**Go to line 724**, select until line 806, delete.

**What you'll see (start):**
```
// Advanced Filter handlers
/*
// ⚠️ REMOVED - Now handled by useExpenseFiltering hook
const toggleCategoryFilter = (categoryId: string) => {
```

**What you'll see (end):**
```
    toast.info('🔄 Filter direset');
  };
  */
```

---

### ✅ Block 13: Lines 808-860 (53 lines) - MEDIUM BLOCK
**Go to line 808**, select until line 860, delete.

**What you'll see (start):**
```
// ⚠️ Bulk selection item toggle handlers moved to useBulkSelection hook...
/*
const handleToggleSelectExpense = (id: string) => {
```

**What you'll see (end):**
```
  };
  */
```

⚠️ **STOP BEFORE:** Line 862 should be `const handleBulkDeleteIncomes = async () => {` ← KEEP THIS!

---

### ✅ Block 14: Lines 900-1075 (176 lines) - 🔥 HUGE BLOCK!
**Go to line 900**, select until line 1075, delete.

**What you'll see (start):**
```
// ⚠️ fuzzyMatchExpense & fuzzyMatchIncome moved to useExpenseFiltering hook
// ⚠️ categoryFilteredExpenses moved to useExpenseFiltering hook
/*
// Phase 7: Filter by category first...
```

**What you'll see (end):**
```
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [incomes, activeFilters.incomeSources, searchQuery]);
  */
```

⚠️ **This is the BIGGEST block!** Take your time.

---

### ✅ Block 15: Lines 1077-1107 (31 lines) - MEDIUM BLOCK
**Go to line 1077**, select until line 1107, delete.

**What you'll see (start):**
```
// ⚠️ isAllSelected and redundant handlers moved to useBulkSelection hook...
/*
const isAllSelected = useMemo(() => {
```

**What you'll see (end):**
```
  }, [isAllSelected, sortedAndFilteredExpenses]);
  */
```

⚠️ **STOP BEFORE:** Line 1109 should be `const handleBulkDelete = useCallback(() => {` ← KEEP THIS!

---

### ✅ Block 16: Lines 1153-1169 (17 lines)
**Go to line 1153**, select until line 1169, delete.

**What you'll see (start):**
```
// ⚠️ Auto-cleanup selection moved to useBulkSelection hook...
/*
// Auto-exit bulk mode when expenses change...
```

**What you'll see (end):**
```
  }, [expenses, isBulkSelectMode, selectedExpenseIds]);
  */
```

---

### ✅ Block 17: Lines 1252-1350 (99 lines) - 🔥 HUGE BLOCK!
**Go to line 1252**, select until line 1350, delete.

**What you'll see (start):**
```
// ⚠️ DEPRECATED - Handlers moved to useExpenseActions hook...
/*
const handleSheetEdit = useCallback(() => {
```

**What you'll see (end):**
```
      }
    }
  };
  */
```

⚠️ **This is the SECOND BIGGEST block!** After line 1350, you should see:

```typescript
  // ⚠️ DEPRECATED - Use handleCloseEditExpense from hook instead
  // Keeping as alias temporarily for backward compatibility
  const handleCloseEditDialog = handleCloseEditExpense;
```

**KEEP the handleCloseEditDialog line!** (It's active code)

---

## ✅ After Cleanup Checklist

### 1. Compile Check
```bash
npm run build
```

✅ Should compile without errors

### 2. Visual Check
Open ExpenseList.tsx and verify:
- No `/* ... */` multi-line comment blocks remaining (search for `/*`)
- No lines starting with `// ⚠️` followed by commented code

### 3. Functional Test
```bash
npm run dev
```

Test these features:
- [ ] App loads
- [ ] Add expense
- [ ] Edit expense
- [ ] Delete expense
- [ ] Bulk select mode
- [ ] Search expenses
- [ ] Filter by category
- [ ] Open CategoryBreakdown

### 4. Final Metrics
After cleanup:
- **File size should be ~3,200-3,300 lines** (from 3,797)
- **Reduction: ~500-600 lines (13-16%)**

---

## 🚨 If Something Breaks

### Rollback Command:
```bash
git checkout HEAD -- components/ExpenseList.tsx
```

### Common Issues:

**TypeScript Error: "Cannot find name 'X'"**
→ You deleted active code by mistake. Rollback and try again.

**App won't load**
→ Check console for errors. Likely deleted a `const` that's still being used.

**Feature doesn't work**
→ Compare with CLEANUP_MARKERS.md to ensure you only deleted commented blocks.

---

## 📊 Progress After Cleanup

| Metric | Before Cleanup | After Cleanup | Change |
|--------|---------------|---------------|--------|
| File Size | 3,797 lines | ~3,200 lines | -597 lines |
| Commented Code | ~600 lines | 0 lines | -600 lines |
| Active Code | ~3,200 lines | ~3,200 lines | 0 lines |

**Next Step:** Phase 4 - Component Extraction (~530-700 more lines reduction)

---

## 💡 Tips

1. **Use Multi-Cursor:** In VS Code, you can delete multiple small blocks faster
2. **Incremental Save:** Save after every 3-5 blocks
3. **Git Commit:** After successful cleanup, commit immediately
4. **Test Early:** Don't wait until end to test

---

**Estimated Time:** 15-20 minutes (careful deletion)  
**Difficulty:** Easy (just deletion, no code writing)  
**Risk:** Low (commented code doesn't affect runtime)

**Good luck!** 🚀
