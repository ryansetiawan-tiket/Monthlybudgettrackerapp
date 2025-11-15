# 🔄 Incremental Commit Strategy - Micro-Commits for Safety

**PURPOSE:** Break large phases into small, testable, revertable commits  
**BENEFIT:** Easy debugging, granular rollback, clear history  
**RULE:** Commit every working increment, not just at phase end

---

## 🎯 Core Principles

### 1. **Small Commits = Safe Commits**
```
❌ BAD:  1 commit = entire phase (90 min work, 500 LOC)
✅ GOOD: 8 commits = 8 incremental steps (each 10 min, 60 LOC)
```

### 2. **Every Commit Must Be Working**
```
❌ BAD:  Commit broken code "will fix later"
✅ GOOD: Only commit when tests pass
```

### 3. **Commits Tell a Story**
```
❌ BAD:  "refactor phase 3"
✅ GOOD: "extract useExpenseFiltering hook - filtering works"
```

---

## 📏 Commit Size Guidelines

### Target Commit Size:
- **Lines Changed:** 50-150 LOC per commit
- **Time:** 10-20 minutes work per commit
- **Scope:** 1 feature/file/function per commit

### When to Commit:
- ✅ After creating new file
- ✅ After extracting one function
- ✅ After one feature works
- ✅ After tests pass
- ✅ Before taking break
- ✅ Before trying risky change

### When NOT to Commit:
- ❌ Code doesn't compile
- ❌ Tests failing
- ❌ Console has errors
- ❌ Feature half-done

---

## 🎯 Phase-by-Phase Commit Strategy

### Phase 0: Preparation
**Target:** 1-2 commits

```bash
# Commit 1: Setup
git add planning/expenselist-refactor-v1/
git commit -m "docs: add ExpenseList refactoring planning docs"

# Commit 2: Create branch
git checkout -b refactor/expenselist-modular
git commit --allow-empty -m "chore: start ExpenseList refactoring - Phase 0"
```

**Test Before Commit:** N/A (just setup)

---

### Phase 1: Types & Helpers
**Target:** 4-6 commits (not just 1!)

#### Micro-Step Breakdown:

**Commit 1:** Create type file
```bash
# Create /types/expense.ts with basic interfaces
# Time: 5 min, LOC: ~50

git add types/expense.ts
git commit -m "refactor(types): create expense.ts with ExpenseItem and Expense interfaces"
```
**Test:** TypeScript compiles, no errors

---

**Commit 2:** Move more types
```bash
# Add AdditionalIncome, PocketBalance to expense.ts
# Time: 5 min, LOC: ~40

git add types/expense.ts
git commit -m "refactor(types): add AdditionalIncome and PocketBalance interfaces"
```
**Test:** TypeScript compiles, no errors

---

**Commit 3:** Update ExpenseList imports
```bash
# Import types from new file, remove from ExpenseList.tsx
# Time: 5 min, LOC: ~10 changed

git add components/ExpenseList.tsx types/expense.ts
git commit -m "refactor(ExpenseList): import types from expense.ts"
```
**Test:** App loads, ExpenseList renders, no errors

---

**Commit 4:** Create helper file
```bash
# Create /utils/expenseHelpers.ts
# Move normalizeCategoryId() function
# Time: 5 min, LOC: ~30

git add utils/expenseHelpers.ts
git commit -m "refactor(utils): extract normalizeCategoryId helper"
```
**Test:** TypeScript compiles, no errors

---

**Commit 5:** Update ExpenseList to use helper
```bash
# Import helper, remove function from ExpenseList.tsx
# Time: 5 min, LOC: ~15 changed

git add components/ExpenseList.tsx utils/expenseHelpers.ts
git commit -m "refactor(ExpenseList): use normalizeCategoryId from helpers"
```
**Test:** App loads, category display works, no errors

---

**Commit 6:** Phase 1 complete marker
```bash
git commit --allow-empty -m "refactor: Phase 1 complete - types & helpers extracted (✓ tested)"
git tag phase-1-complete
```

**Total Phase 1:** 6 commits, ~30 minutes, ~140-190 LOC moved

---

### Phase 2: Lazy Loading
**Target:** 5 commits

#### Micro-Step Breakdown:

**Commit 1:** Lazy load BulkEditCategoryDialog
```bash
# Convert to React.lazy() import
# Time: 5 min, LOC: ~10 changed

git add components/ExpenseList.tsx
git commit -m "refactor(ExpenseList): lazy load BulkEditCategoryDialog"
```
**Test:** Open BulkEditCategoryDialog, verify works

---

**Commit 2:** Lazy load AdvancedFilterDrawer
```bash
git add components/ExpenseList.tsx
git commit -m "refactor(ExpenseList): lazy load AdvancedFilterDrawer"
```
**Test:** Open AdvancedFilterDrawer, verify works

---

**Commit 3:** Lazy load SimulationSandbox
```bash
git add components/ExpenseList.tsx
git commit -m "refactor(ExpenseList): lazy load SimulationSandbox"
```
**Test:** Open SimulationSandbox, verify works

---

**Commit 4:** Lazy load ItemActionSheet
```bash
git add components/ExpenseList.tsx
git commit -m "refactor(ExpenseList): lazy load ItemActionSheet"
```
**Test:** Open ItemActionSheet (mobile), verify works

---

**Commit 5:** Phase 2 complete marker
```bash
git commit --allow-empty -m "refactor: Phase 2 complete - lazy loading implemented (✓ tested)"
git tag phase-2-complete
```

**Total Phase 2:** 5 commits, ~20 minutes

---

### Phase 3: Custom Hooks (⚠️ CRITICAL - Most Commits!)
**Target:** 12-16 commits (NOT 1!)

#### 🚨 MANDATORY: One hook at a time!

#### Hook 1: useExpenseFiltering

**Commit 1:** Create hook file with basic structure
```bash
# Create /hooks/useExpenseFiltering.ts
# Just function signature and return stub
# Time: 5 min, LOC: ~20

git add hooks/useExpenseFiltering.ts
git commit -m "refactor(hooks): create useExpenseFiltering hook skeleton"
```
**Test:** TypeScript compiles

---

**Commit 2:** Extract search state
```bash
# Move searchTerm state to hook
# Time: 10 min, LOC: ~30

git add hooks/useExpenseFiltering.ts components/ExpenseList.tsx
git commit -m "refactor(hooks): extract search state to useExpenseFiltering"
```
**Test:** Search input displays, typing works

---

**Commit 3:** Extract search logic
```bash
# Move search filtering logic to hook
# Time: 10 min, LOC: ~40

git add hooks/useExpenseFiltering.ts components/ExpenseList.tsx
git commit -m "refactor(hooks): extract search filtering logic"
```
**Test:** Search actually filters expenses

---

**Commit 4:** Extract sort state
```bash
# Move sort state (sortBy, sortOrder) to hook
# Time: 10 min, LOC: ~30

git add hooks/useExpenseFiltering.ts components/ExpenseList.tsx
git commit -m "refactor(hooks): extract sort state to useExpenseFiltering"
```
**Test:** Sort controls display, click works

---

**Commit 5:** Extract sort logic
```bash
# Move sorting logic to hook
# Time: 10 min, LOC: ~50

git add hooks/useExpenseFiltering.ts components/ExpenseList.tsx
git commit -m "refactor(hooks): extract sort logic"
```
**Test:** Sorting actually works (date/amount ascending/descending)

---

**Commit 6:** Extract category filter
```bash
# Move category filter logic to hook
# Time: 10 min, LOC: ~40

git add hooks/useExpenseFiltering.ts components/ExpenseList.tsx
git commit -m "refactor(hooks): extract category filter logic"
```
**Test:** Category filtering works, badge displays

---

**Commit 7:** Hook 1 complete
```bash
git commit --allow-empty -m "refactor: useExpenseFiltering complete (✓ search, sort, filter tested)"
```

---

#### Hook 2: useBulkSelection

**Commit 8:** Create hook with bulk state
```bash
# Create /hooks/useBulkSelection.ts
# Extract isBulkSelectMode, selectedExpenseIds
# Time: 10 min, LOC: ~50

git add hooks/useBulkSelection.ts components/ExpenseList.tsx
git commit -m "refactor(hooks): create useBulkSelection with state"
```
**Test:** Bulk mode can be entered, checkboxes appear

---

**Commit 9:** Extract bulk handlers
```bash
# Move handleToggleExpense, handleSelectAll, etc.
# Time: 10 min, LOC: ~60

git add hooks/useBulkSelection.ts components/ExpenseList.tsx
git commit -m "refactor(hooks): extract bulk selection handlers"
```
**Test:** Bulk select/deselect works, count updates

---

**Commit 10:** Hook 2 complete
```bash
git commit --allow-empty -m "refactor: useBulkSelection complete (✓ bulk mode tested)"
```

---

#### Hook 3: useExpenseActions

**Commit 11:** Create hook with edit handler
```bash
# Create /hooks/useExpenseActions.ts
# Extract handleEditExpense
# Time: 10 min, LOC: ~40

git add hooks/useExpenseActions.ts components/ExpenseList.tsx
git commit -m "refactor(hooks): create useExpenseActions with edit handler"
```
**Test:** Edit expense works, modal opens and saves

---

**Commit 12:** Extract delete handler
```bash
# Move handleDeleteExpense
# Time: 10 min, LOC: ~30

git add hooks/useExpenseActions.ts components/ExpenseList.tsx
git commit -m "refactor(hooks): extract delete handler"
```
**Test:** Delete expense works, confirmation shows

---

**Commit 13:** Extract move-to-income handler
```bash
# Move handleMoveToIncome (if exists)
# Time: 10 min, LOC: ~30

git add hooks/useExpenseActions.ts components/ExpenseList.tsx
git commit -m "refactor(hooks): extract move-to-income handler"
```
**Test:** Move to income works

---

**Commit 14:** Hook 3 complete
```bash
git commit --allow-empty -m "refactor: useExpenseActions complete (✓ CRUD tested)"
```

---

#### Hook 4: useExpenseListModals

**Commit 15:** Create hook with modal states
```bash
# Create /hooks/useExpenseListModals.ts
# Extract all modal open/close states
# Time: 10 min, LOC: ~60

git add hooks/useExpenseListModals.ts components/ExpenseList.tsx
git commit -m "refactor(hooks): create useExpenseListModals with states"
```
**Test:** All modals can open and close

---

**Commit 16:** Phase 3 complete marker
```bash
git commit --allow-empty -m "refactor: Phase 3 complete - all hooks extracted (✓ all features tested)"
git tag phase-3-complete
```

**Total Phase 3:** 16 commits, ~90 minutes

---

### Phase 4: Render Components (⚠️ CRITICAL - Most Commits!)
**Target:** 12-16 commits

#### Component 1: ExpenseListItem

**Commit 1:** Create component file with basic structure
```bash
# Create /components/expense-list/ExpenseListItem.tsx
# Copy desktop row JSX only
# Time: 15 min, LOC: ~100

git add components/expense-list/ExpenseListItem.tsx
git commit -m "refactor(components): create ExpenseListItem - desktop only"
```
**Test:** Desktop expense rows render

---

**Commit 2:** Add mobile layout
```bash
# Add mobile row JSX
# Time: 15 min, LOC: ~100

git add components/expense-list/ExpenseListItem.tsx
git commit -m "refactor(components): add mobile layout to ExpenseListItem"
```
**Test:** Mobile expense rows render

---

**Commit 3:** Add category emoji logic
```bash
# Extract category emoji display
# Time: 10 min, LOC: ~40

git add components/expense-list/ExpenseListItem.tsx
git commit -m "refactor(components): add category emoji logic to ExpenseListItem"
```
**Test:** Category emojis display correctly

---

**Commit 4:** Update ExpenseList to use component
```bash
# Replace inline JSX with <ExpenseListItem />
# Time: 10 min, LOC: ~200 removed, ~10 added

git add components/ExpenseList.tsx components/expense-list/ExpenseListItem.tsx
git commit -m "refactor(ExpenseList): use ExpenseListItem component"
```
**Test:** All expense features work, long-press works, bulk mode works

---

**Commit 5:** Component 1 complete
```bash
git commit --allow-empty -m "refactor: ExpenseListItem complete (✓ tested desktop + mobile)"
```

---

#### Component 2: IncomeListItem

**Commit 6:** Create component
```bash
# Create /components/expense-list/IncomeListItem.tsx
# Time: 15 min, LOC: ~80

git add components/expense-list/IncomeListItem.tsx
git commit -m "refactor(components): create IncomeListItem"
```
**Test:** TypeScript compiles

---

**Commit 7:** Update ExpenseList to use component
```bash
# Replace income row JSX
# Time: 10 min, LOC: ~150 removed, ~10 added

git add components/ExpenseList.tsx components/expense-list/IncomeListItem.tsx
git commit -m "refactor(ExpenseList): use IncomeListItem component"
```
**Test:** Income rows render, currency badges show, edit/delete work

---

**Commit 8:** Component 2 complete
```bash
git commit --allow-empty -m "refactor: IncomeListItem complete (✓ tested desktop + mobile)"
```

---

#### Component 3: ExpenseListHeader

**Commit 9:** Create component
```bash
# Create /components/expense-list/ExpenseListHeader.tsx
# Time: 15 min, LOC: ~120

git add components/expense-list/ExpenseListHeader.tsx
git commit -m "refactor(components): create ExpenseListHeader"
```
**Test:** TypeScript compiles

---

**Commit 10:** Update ExpenseList to use component
```bash
# Replace header JSX
# Time: 10 min, LOC: ~100 removed, ~5 added

git add components/ExpenseList.tsx components/expense-list/ExpenseListHeader.tsx
git commit -m "refactor(ExpenseList): use ExpenseListHeader component"
```
**Test:** Header displays, sort/filter/search controls work

---

**Commit 11:** Component 3 complete
```bash
git commit --allow-empty -m "refactor: ExpenseListHeader complete (✓ tested all controls)"
```

---

#### Component 4: BulkActionToolbar

**Commit 12:** Create component
```bash
# Create /components/expense-list/BulkActionToolbar.tsx
# Time: 10 min, LOC: ~80

git add components/expense-list/BulkActionToolbar.tsx
git commit -m "refactor(components): create BulkActionToolbar"
```
**Test:** TypeScript compiles

---

**Commit 13:** Update ExpenseList to use component
```bash
# Replace bulk toolbar JSX
# Time: 10 min, LOC: ~80 removed, ~5 added

git add components/ExpenseList.tsx components/expense-list/BulkActionToolbar.tsx
git commit -m "refactor(ExpenseList): use BulkActionToolbar component"
```
**Test:** Bulk toolbar appears in bulk mode, select all/delete/category work

---

**Commit 14:** Component 4 complete
```bash
git commit --allow-empty -m "refactor: BulkActionToolbar complete (✓ tested bulk operations)"
```

---

**Commit 15:** Phase 4 complete marker
```bash
git commit --allow-empty -m "refactor: Phase 4 complete - all components extracted (✓ full UI tested)"
git tag phase-4-complete
```

**Total Phase 4:** 15 commits, ~120 minutes

---

### Phase 5: Memoization
**Target:** 4-6 commits

**Commit 1:** Memoize ExpenseListItem
```bash
git add components/expense-list/ExpenseListItem.tsx
git commit -m "perf(ExpenseListItem): add React.memo"
```
**Test:** Expense rows still update correctly

---

**Commit 2:** Memoize IncomeListItem
```bash
git add components/expense-list/IncomeListItem.tsx
git commit -m "perf(IncomeListItem): add React.memo"
```
**Test:** Income rows still update correctly

---

**Commit 3:** Add useMemo for filtered lists
```bash
git add hooks/useExpenseFiltering.ts
git commit -m "perf(useExpenseFiltering): add useMemo for filtered lists"
```
**Test:** Filtering still works, check performance with DevTools

---

**Commit 4:** Add useCallback for handlers
```bash
git add hooks/useExpenseActions.ts
git commit -m "perf(useExpenseActions): add useCallback for handlers"
```
**Test:** Edit/delete still work

---

**Commit 5:** Phase 5 complete marker
```bash
git commit --allow-empty -m "refactor: Phase 5 complete - memoization added (✓ performance tested)"
git tag phase-5-complete
```

**Total Phase 5:** 5 commits, ~30 minutes

---

### Phase 6: Cleanup
**Target:** 3-5 commits

**Commit 1:** Remove unused imports
```bash
git add components/ExpenseList.tsx
git commit -m "chore(ExpenseList): remove unused imports"
```

**Commit 2:** Add JSDoc comments
```bash
git add hooks/*.ts components/expense-list/*.tsx
git commit -m "docs: add JSDoc comments to hooks and components"
```

**Commit 3:** Format code
```bash
git add .
git commit -m "style: format code with prettier"
```

**Commit 4:** Phase 6 complete marker
```bash
git commit --allow-empty -m "refactor: Phase 6 complete - cleanup done (✓ all tests pass)"
git tag phase-6-complete
```

**Commit 5:** Final marker
```bash
git commit --allow-empty -m "refactor: ExpenseList refactoring COMPLETE 🎉 (all phases tested)"
git tag expenselist-refactor-complete
```

**Total Phase 6:** 5 commits, ~30 minutes

---

## 📊 Total Commit Summary

| Phase | Commits | Time | Avg per Commit |
|-------|---------|------|----------------|
| 0 | 2 | 15 min | 7 min |
| 1 | 6 | 30 min | 5 min |
| 2 | 5 | 20 min | 4 min |
| 3 | 16 | 90 min | 5-6 min |
| 4 | 15 | 120 min | 8 min |
| 5 | 5 | 30 min | 6 min |
| 6 | 5 | 30 min | 6 min |
| **TOTAL** | **54 commits** | **~5-6 hours** | **~6 min/commit** |

**Result:** 54 safe, revertable, tested commits instead of 6 large risky commits!

---

## 🎯 Commit Message Convention

Use conventional commits format:

```
<type>(<scope>): <description>

Examples:
refactor(hooks): extract useExpenseFiltering hook
refactor(components): create ExpenseListItem component
refactor(ExpenseList): use ExpenseListItem component
perf(ExpenseListItem): add React.memo
test(ExpenseList): verify filtering works
docs: add JSDoc comments to hooks
chore: Phase 3 complete marker
```

**Types:**
- `refactor`: Code restructuring
- `perf`: Performance improvement
- `test`: Testing
- `docs`: Documentation
- `chore`: Maintenance
- `fix`: Bug fix (if rollback then re-fix)

---

## 🛡️ Safety Rules

### Before Every Commit:
```bash
# 1. Check TypeScript
npm run type-check  # OR tsc --noEmit

# 2. Check app loads
# Open browser, verify no errors

# 3. Test feature
# Test the specific feature you just changed

# 4. Check git diff
git diff  # Review what you're committing
```

### Commit Only If:
- [ ] TypeScript compiles (0 errors)
- [ ] App loads without crash
- [ ] Feature you changed works
- [ ] No console errors (red)
- [ ] Diff looks correct

---

## 🔄 Rollback with Incremental Commits

### Advantage: Granular Rollback!

**Scenario:** Phase 4 broke something, but don't know which component

```bash
# Instead of rolling back entire Phase 4 (15 commits):
# Roll back just last component (3 commits):

git log --oneline  # Find last good commit
git revert HEAD~3..HEAD  # Revert last 3 commits

# Or reset to specific commit:
git reset --hard <commit-hash-before-BulkActionToolbar>

# Test: Is it fixed?
# YES → Problem was BulkActionToolbar, fix it
# NO → Roll back more commits
```

**With 1 large commit:** Can't do granular rollback, must redo entire phase!

---

## 📝 Git History Example (Good vs Bad)

### ❌ BAD (Large Commits):
```
* refactor: Phase 4 complete
* refactor: Phase 3 complete
* refactor: Phase 2 complete
* refactor: Phase 1 complete
```
**Problem:** Can't tell what broke, can't rollback granularly

---

### ✅ GOOD (Incremental Commits):
```
* refactor: Phase 4 complete - all components extracted (✓ full UI tested)
* refactor: BulkActionToolbar complete (✓ tested bulk operations)
* refactor(ExpenseList): use BulkActionToolbar component
* refactor(components): create BulkActionToolbar
* refactor: ExpenseListHeader complete (✓ tested all controls)
* refactor(ExpenseList): use ExpenseListHeader component
* refactor(components): create ExpenseListHeader
* refactor: IncomeListItem complete (✓ tested desktop + mobile)
* refactor(ExpenseList): use IncomeListItem component
* refactor(components): create IncomeListItem
* refactor: ExpenseListItem complete (✓ tested desktop + mobile)
* refactor(components): add category emoji logic to ExpenseListItem
* refactor(components): add mobile layout to ExpenseListItem
* refactor(components): create ExpenseListItem - desktop only
```
**Benefit:** Clear history, easy to find what broke, granular rollback!

---

## 🎓 Best Practices

### DO ✅
- Commit every 10-20 minutes
- Commit every working feature
- Test before every commit
- Write descriptive commit messages
- Use git tags for phase completion
- Review diff before commit

### DON'T ❌
- Commit broken code
- Commit without testing
- Make huge commits (> 200 LOC)
- Use vague messages ("update", "fix")
- Work for hours without committing
- Commit commented code

---

**REMEMBER: Small commits = Safe refactoring = Sleep well at night!** 😴✅

---

**Last Updated:** November 15, 2025  
**Status:** ✅ Active Strategy
