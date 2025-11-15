# ⚡ ExpenseList Refactoring - Quick Reference Card

**Print this out or keep it open during refactoring!**

---

## 🎯 Current Phase

**Phase:** **4 (Component Extraction)** ← IN PROGRESS (66% Complete!)  
**Status:** 🟢 Partial Complete (Manual Implementation)  
**Phases Complete:** 5.5/8 (69%) - Including bonus component!  
**Current File Size:** TBD (awaiting verification)  
**Target:** ~1,979 lines (50% reduction)

**Latest Update:** Phase 4A, 4B, and Bonus (ExpenseListTabs) completed manually by user! ✅

---

## ✅ Pre-Phase Checklist (Do EVERY Phase!)

```
[ ] Read phase instructions in MASTER_PLAN.md
[ ] Create git commit: git commit -am "Phase X complete"
[ ] Run smoke test (2 min)
[ ] Clear console errors
[ ] Note start time
```

---

## 🧪 Quick Smoke Test (Run OFTEN!)

```
Desktop:
[ ] App loads
[ ] ExpenseList renders
[ ] Can add expense
[ ] Can delete expense

Mobile:
[ ] App loads
[ ] ExpenseList renders
[ ] Can add expense
[ ] Long-press works

Console:
[ ] No errors
[ ] No TypeScript errors
```

**If ANY fail → STOP and debug!**

---

## 🚨 Emergency Rollback (Copy-Paste Ready)

```bash
# CRITICAL: App is broken, need immediate recovery
git checkout HEAD -- components/ExpenseList.tsx
rm -f types/expense.ts utils/expenseHelpers.ts
rm -f hooks/useExpenseFiltering.ts hooks/useBulkSelection.ts
rm -f hooks/useExpenseActions.ts hooks/useExpenseListModals.ts
rm -rf components/expense-list/
npm run dev
```

**Then verify smoke test passes!**

---

## 📂 File Paths Cheat Sheet

```
Types:          /types/expense.ts
Helpers:        /utils/expenseHelpers.ts

Hooks:          /hooks/useExpenseFiltering.ts
                /hooks/useBulkSelection.ts
                /hooks/useExpenseActions.ts
                /hooks/useExpenseListModals.ts

Components:     /components/expense-list/ExpenseListItem.tsx
                /components/expense-list/IncomeListItem.tsx
                /components/expense-list/ExpenseListHeader.tsx
                /components/expense-list/BulkActionToolbar.tsx

Original:       /components/ExpenseList.tsx (MODIFY, DON'T DELETE!)
```

---

## 🎯 Phase Quick Reference

| Phase | Time | LOC Reduction | Risk | Key Files |
|-------|------|---------------|------|-----------|
| **0** | 15m | 0 | ⭐ None | Planning docs |
| **1** | 30m | 140-190 | ⭐ Very Low | types/, utils/ |
| **2** | 20m | 0 | ⭐ Very Low | ExpenseList.tsx (lazy imports) |
| **3** | 90m | 430-550 | ⭐⭐⭐ Medium-High | hooks/ |
| **4** | 120m | 530-700 | ⭐⭐⭐ Medium-High | components/expense-list/ |
| **5** | 30m | 0-50 | ⭐⭐ Medium | Add memo/useMemo |
| **6** | 30m | 0 | ⭐ Very Low | Cleanup & docs |

**Total:** 4-6 hours, ~1100-1600 LOC reduction

---

## ⚠️ Common Pitfalls

### TypeScript Import Errors
```typescript
// ❌ DON'T
import { Expense } from './types/expense';

// ✅ DO
import { Expense } from '../types/expense';
// (Check relative path from current file!)
```

### Infinite Re-renders
```typescript
// ❌ DON'T
const handlers = {
  onEdit: () => {},
  onDelete: () => {}
};
// (Creates new object every render!)

// ✅ DO
const handleEdit = useCallback(() => {}, []);
const handleDelete = useCallback(() => {}, []);
```

### Stale Closures
```typescript
// ❌ DON'T
useEffect(() => {
  setTimeout(() => {
    console.log(expenses); // May be stale!
  }, 1000);
}, []); // Missing dependency

// ✅ DO
useEffect(() => {
  setTimeout(() => {
    console.log(expenses);
  }, 1000);
}, [expenses]); // Include in deps
```

### Props Drilling
```typescript
// ❌ DON'T
// Pass 10+ props individually

// ✅ DO
// Group related props into objects
const actions = { onEdit, onDelete, onMove };
const states = { isBulkMode, isLoading };
```

---

## 🔍 Debugging Commands

```bash
# TypeScript check
npm run type-check
# OR
tsc --noEmit

# Build check
npm run build

# Bundle size analysis
npm run build && ls -lh dist/

# Clear caches
rm -rf node_modules/.cache/
rm -rf .next/
rm -rf dist/
```

---

## 📊 Progress Tracker

### Phases
- [x] 0 - Preparation ✅
- [x] 1 - Types & Helpers ✅
- [x] 2 - Lazy Loading ✅
- [x] 3 - Custom Hooks ✅ (3/4 hooks)
- [x] 4A - ExpenseListItem ✅ **MANUAL**
- [x] 4B - IncomeListItem ✅ **MANUAL**
- [x] 4 (Bonus) - ExpenseListTabs ✅ **MANUAL**
- [ ] 4C - ExpenseListHeader ← **NEXT**
- [ ] 4D - BulkActionToolbar
- [ ] 5 - Memoization
- [ ] 6 - Cleanup

### Files Created
- [x] types/expense.ts ✅
- [x] utils/expenseHelpers.ts ✅
- [x] hooks/useExpenseFiltering.ts ✅
- [x] hooks/useBulkSelection.ts ✅
- [x] hooks/useExpenseActions.ts ✅
- [ ] hooks/useExpenseListModals.ts ⚠️ DEFERRED
- [x] components/expense-list/ExpenseListItem.tsx ✅ **MANUAL**
- [x] components/expense-list/IncomeListItem.tsx ✅ **MANUAL**
- [x] components/expense-list/ExpenseListTabs.tsx ✅ **MANUAL (BONUS)**
- [ ] components/expense-list/ExpenseListHeader.tsx ⚠️ PENDING
- [ ] components/expense-list/BulkActionToolbar.tsx ⚠️ PENDING

**Total:** 8/11 files (73% complete)

### Utils Enhanced (Manual)
- [x] utils/date-helpers.ts ✅ Enhanced
- [x] utils/currencyFormatting.ts ✅ Enhanced