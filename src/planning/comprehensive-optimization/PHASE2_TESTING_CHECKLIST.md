# Phase 2: Testing Checklist

**Purpose**: Verify that all Phase 2 refactoring changes work correctly  
**Status**: 📋 Ready for Testing  
**Date**: November 5, 2025

---

## 🧪 Testing Categories

### 1. **Currency Formatting** ✅

**Test Utilities**:
- [ ] Open browser console
- [ ] Import and test: `import { formatCurrency } from './utils/currency'`
- [ ] Test: `formatCurrency(1234567)` → Should show "Rp 1.234.567"
- [ ] Test: `formatCurrencyCompact(1500000)` → Should show "Rp 1.5jt"

**Test in Components**:
- [ ] BudgetOverview shows currency correctly
- [ ] ExpenseList shows currency correctly
- [ ] AdditionalIncomeList shows currency correctly
- [ ] PocketsSummary shows currency correctly
- [ ] WishlistSimulation shows currency correctly

**Verify**:
- [ ] All amounts formatted consistently
- [ ] No "NaN" or "undefined" displayed
- [ ] Negative amounts show correctly

---

### 2. **API Calls** ✅

**Test getBaseUrl**:
- [ ] Check console for API calls
- [ ] Verify all calls use format: `https://{projectId}.supabase.co/functions/v1/make-server-3adbeaf1`
- [ ] No hardcoded URLs remaining

**Test Components**:
- [ ] App.tsx fetches budget data correctly
- [ ] AdditionalIncomeForm submits correctly
- [ ] AdditionalIncomeList updates correctly
- [ ] WishlistSimulation CRUD operations work
- [ ] Transfers work correctly

**Verify**:
- [ ] All API calls succeed
- [ ] Error handling works
- [ ] Loading states display
- [ ] Success toasts appear

---

### 3. **Custom Hooks** ⏳

**useBudgetData**:
- [ ] Budget data loads on month change
- [ ] Cache works (switching back to same month is instant)
- [ ] Cache invalidation works (after adding expense)
- [ ] Previous month carryover calculates correctly

**usePockets**:
- [ ] Pockets load correctly
- [ ] Create pocket works
- [ ] Update pocket works
- [ ] Delete pocket works
- [ ] Transfer between pockets works
- [ ] Balance calculations correct

**useExcludeState**:
- [ ] Exclude expense/income works
- [ ] Lock/unlock works
- [ ] Locked state persists across refreshes
- [ ] Unlocking clears exclusions

**Note**: These hooks are created but not yet integrated into App.tsx  
**Status**: Optional integration, can be done later

---

### 4. **React.memo Optimizations** ✅

**Test Re-rendering**:

**BudgetOverview**:
- [ ] Open React DevTools Profiler
- [ ] Change month → BudgetOverview should re-render
- [ ] Add expense → BudgetOverview should re-render
- [ ] Open dialog → BudgetOverview should NOT re-render ✅
- [ ] Type in form → BudgetOverview should NOT re-render ✅

**MonthSelector**:
- [ ] Open React DevTools Profiler
- [ ] Add expense → MonthSelector should NOT re-render ✅
- [ ] Open dialog → MonthSelector should NOT re-render ✅
- [ ] Type in form → MonthSelector should NOT re-render ✅
- [ ] Change month → MonthSelector should re-render

**Verify**:
- [ ] Fewer unnecessary re-renders
- [ ] UI still updates correctly
- [ ] No visual bugs

---

### 5. **Types & Constants** ✅

**TypeScript Compilation**:
- [ ] Run: Check TypeScript compiles without errors
- [ ] No new type errors
- [ ] IDE autocomplete works for new types

**Constants Usage**:
- [ ] Open `/constants/index.ts`
- [ ] Verify all constants are properly typed
- [ ] Search for magic numbers in code
- [ ] Gradually replace with constants (optional)

**Verify**:
- [ ] No TypeScript errors
- [ ] Types improve developer experience
- [ ] Constants are self-documenting

---

## 🎯 Critical User Flows

### Flow 1: Add Budget & View Summary
1. [ ] Set initial budget (e.g., Rp 10.000.000)
2. [ ] Verify shows in BudgetOverview with correct formatting
3. [ ] Verify "Sisa Budget" shows correctly
4. [ ] Check currency format consistency

### Flow 2: Add Expense
1. [ ] Add expense (e.g., "Makan siang" - Rp 50.000)
2. [ ] Verify appears in ExpenseList
3. [ ] Verify BudgetOverview updates
4. [ ] Verify currency formatting correct
5. [ ] Check API call in Network tab

### Flow 3: Add Additional Income
1. [ ] Add income in IDR (e.g., Rp 2.000.000)
2. [ ] Verify appears in list with correct format
3. [ ] Verify BudgetOverview updates
4. [ ] Add income in USD (e.g., $100 @ 15,800)
5. [ ] Verify conversion displays correctly

### Flow 4: Pockets System
1. [ ] Create custom pocket
2. [ ] Transfer between pockets
3. [ ] Check balance calculations
4. [ ] View pocket timeline
5. [ ] Verify all currency formatting

### Flow 5: Wishlist
1. [ ] Add wishlist item
2. [ ] Run simulation
3. [ ] Check health bar
4. [ ] Mark as purchased
5. [ ] Verify converts to expense correctly

### Flow 6: Month Navigation
1. [ ] Switch to next month
2. [ ] Add data
3. [ ] Switch back to previous month
4. [ ] Verify cache works (instant load)
5. [ ] Switch to next month again
6. [ ] Verify data still there

### Flow 7: Exclude Feature
1. [ ] Exclude an expense
2. [ ] Check budget recalculates
3. [ ] Lock exclude state
4. [ ] Try to exclude another (should fail)
5. [ ] Refresh page
6. [ ] Verify locked state persists
7. [ ] Unlock
8. [ ] Verify exclusions cleared

---

## 🐛 Bug Checks

### Visual Bugs
- [ ] No UI flickering
- [ ] No layout shifts
- [ ] Currency alignment correct
- [ ] Colors consistent
- [ ] Icons display correctly

### Functional Bugs
- [ ] No console errors
- [ ] No network errors
- [ ] No TypeScript errors
- [ ] Data persists correctly
- [ ] Cache works correctly

### Edge Cases
- [ ] Empty state (no budget set)
- [ ] Zero amounts (Rp 0)
- [ ] Very large amounts (Rp 999.999.999)
- [ ] Negative amounts (deficit)
- [ ] Special characters in names
- [ ] Long names (truncation)

---

## 📊 Performance Checks

### Loading Performance
- [ ] Initial load < 2 seconds
- [ ] Month switch < 500ms (with cache)
- [ ] Month switch < 1.5 seconds (without cache)
- [ ] Dialog open < 200ms
- [ ] Form submission < 1 second

### Re-render Performance
- [ ] Use React DevTools Profiler
- [ ] Count re-renders when typing in form
- [ ] Count re-renders when opening dialog
- [ ] Verify memo components don't re-render unnecessarily

### Memory
- [ ] No memory leaks
- [ ] Cache doesn't grow indefinitely
- [ ] EventListeners cleaned up

---

## ✅ Acceptance Criteria

**Must Pass**:
- [x] All utilities work correctly
- [ ] All API calls work correctly
- [ ] All components render correctly
- [ ] All user flows complete successfully
- [ ] No console errors
- [ ] No visual bugs
- [ ] Performance acceptable

**Nice to Have**:
- [ ] Custom hooks integrated into App.tsx
- [ ] All magic numbers replaced with constants
- [ ] Bundle size measured
- [ ] Lighthouse score > 90

---

## 🚀 Testing Instructions

### Quick Test (5 minutes)
1. Load app
2. Add budget
3. Add expense
4. Add income
5. Create pocket
6. Transfer
7. Check console for errors

### Full Test (30 minutes)
1. Go through all Critical User Flows
2. Check all Bug Checks
3. Verify all Performance Checks
4. Document any issues

### Thorough Test (1 hour)
1. Full test above
2. Test all edge cases
3. Test on different browsers
4. Test on mobile
5. Run Lighthouse audit

---

## 📝 Testing Notes

**Date Tested**: ___________  
**Tested By**: ___________  
**Browser**: ___________  
**Issues Found**: ___________

**Pass/Fail**: ___________

---

## 🎉 Sign-off

- [ ] All critical tests passed
- [ ] No blocking bugs found
- [ ] Performance acceptable
- [ ] Ready for Phase 3

**Signed**: ___________  
**Date**: ___________
