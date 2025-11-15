# 🧪 ExpenseList Refactoring - Testing Checklist

**Purpose:** Ensure zero regression during ExpenseList.tsx refactoring  
**Run After:** Each phase completion  
**Time:** ~5-10 minutes per run

---

## 🎯 Quick Smoke Test (Run After Every Phase)

### Basic Rendering
- [ ] App loads without errors
- [ ] ExpenseList component renders
- [ ] No console errors
- [ ] No TypeScript compilation errors

### Core Functionality
- [ ] Can add new expense
- [ ] Can add new income
- [ ] Can view expense list
- [ ] Can view income list

**If all pass → Proceed to detailed testing**  
**If any fail → STOP and rollback immediately**

---

## 🔍 Detailed Testing Checklist

### 1. Desktop - Expense List

#### Display & Layout
- [ ] Expense list displays correctly
- [ ] Table headers show (Name, Amount, Date, Category, Actions)
- [ ] Category emojis display correctly
- [ ] Template emojis display correctly (if template-based expense)
- [ ] Currency badges display for USD/EUR entries
- [ ] Pocket badges display correctly
- [ ] Date format correct (DD MMM YYYY)
- [ ] Amount format correct (Rp X,XXX,XXX)

#### Sorting
- [ ] Click "Date" header → sorts by date ascending
- [ ] Click "Date" again → sorts by date descending
- [ ] Click "Amount" header → sorts by amount ascending
- [ ] Click "Amount" again → sorts by amount descending
- [ ] Sort icon updates correctly

#### Filtering
- [ ] Category filter badge appears when filter active
- [ ] Click category filter badge → opens CategoryBreakdown
- [ ] Click category in CategoryBreakdown → filters list
- [ ] Click "Clear Filter" → shows all expenses
- [ ] Filtered count displays correctly

#### Search
- [ ] Type in search box → filters expenses by name
- [ ] Search is case-insensitive
- [ ] Clear search → shows all expenses
- [ ] Search icon displays correctly

#### Actions
- [ ] Click Edit → opens edit dialog with pre-filled data
- [ ] Edit expense → saves correctly
- [ ] Click Delete → shows confirmation dialog
- [ ] Confirm delete → deletes expense
- [ ] Cancel delete → keeps expense
- [ ] Click "Move to Income" → moves expense to income list
- [ ] Expand template expense → shows sub-items
- [ ] Collapse template expense → hides sub-items

#### Bulk Operations
- [ ] Click "Select" → enters bulk select mode
- [ ] Checkboxes appear on all rows
- [ ] Click checkbox → selects/deselects expense
- [ ] Click "Select All" → selects all visible expenses
- [ ] Selected count displays correctly
- [ ] Click "Delete Selected" → shows confirmation
- [ ] Confirm bulk delete → deletes all selected
- [ ] Click "Change Category" → opens bulk category dialog
- [ ] Change category → applies to all selected
- [ ] Click "Cancel" → exits bulk mode

---

### 2. Mobile - Expense List

#### Display & Layout
- [ ] Expense list displays in compact card layout
- [ ] Category emoji displays (top-left of card)
- [ ] Template emoji displays (if template-based)
- [ ] Amount displays prominently
- [ ] Date displays below name
- [ ] Pocket badge displays (if assigned)
- [ ] Currency badge displays (if USD/EUR)
- [ ] Category badge displays below name

#### Gestures
- [ ] Long-press on expense → enters bulk select mode
- [ ] Long-press vibration feedback (if device supports)
- [ ] Tap on expense → opens action sheet (not in bulk mode)
- [ ] Swipe gestures don't interfere (no accidental deletes)

#### Action Sheet
- [ ] Action sheet opens from bottom
- [ ] Shows "Edit" option
- [ ] Shows "Delete" option
- [ ] Shows "Move to Income" option (if applicable)
- [ ] Click "Edit" → opens edit drawer
- [ ] Click "Delete" → shows confirmation
- [ ] Click outside → closes action sheet
- [ ] Click "Cancel" → closes action sheet

#### Bulk Mode (Mobile)
- [ ] Long-press enters bulk mode
- [ ] Checkboxes appear
- [ ] Bulk toolbar appears at bottom
- [ ] Select multiple expenses → count updates
- [ ] Tap "Delete" in toolbar → shows confirmation
- [ ] Tap "Category" in toolbar → opens category dialog
- [ ] Tap "Cancel" → exits bulk mode

#### Drawers
- [ ] Edit drawer opens from bottom
- [ ] Edit drawer pre-fills data
- [ ] Edit drawer can be dismissed by swipe-down
- [ ] Save changes → closes drawer and updates list
- [ ] Cancel → closes drawer without changes
- [ ] Delete confirmation uses AlertDialog (not browser confirm)

---

### 3. Desktop - Income List

#### Display & Layout
- [ ] Income list displays below expense list
- [ ] Table headers show (Name, Amount, Currency, Exchange Rate, Deduction, Date, Actions)
- [ ] Currency badges display (USD, EUR, IDR)
- [ ] Exchange rate displays correctly
- [ ] Deduction displays correctly
- [ ] Amount IDR displays correctly (after conversion)
- [ ] Pocket badges display correctly

#### Actions
- [ ] Click Edit → opens edit dialog with pre-filled data
- [ ] Edit income → saves correctly
- [ ] Click Delete → shows confirmation dialog
- [ ] Confirm delete → deletes income
- [ ] Cancel delete → keeps income

---

### 4. Mobile - Income List

#### Display & Layout
- [ ] Income list displays below expense list
- [ ] Compact card layout
- [ ] Currency badge prominent
- [ ] Exchange rate badge displays (if USD/EUR)
- [ ] Deduction badge displays (if > 0)
- [ ] Amount IDR displays
- [ ] Date displays

#### Actions
- [ ] Tap income → opens action sheet
- [ ] Action sheet shows "Edit" and "Delete"
- [ ] Edit → opens drawer with pre-filled data
- [ ] Delete → shows confirmation
- [ ] Save changes → updates list

---

### 5. Category Features

#### CategoryBreakdown
- [ ] Click "Total Pengeluaran" card → opens CategoryBreakdown
- [ ] Pie chart displays correctly
- [ ] Category list displays with percentages
- [ ] Click category in pie chart → filters expense list
- [ ] Click category in list → filters expense list
- [ ] Auto-scroll to filtered expenses works
- [ ] Close modal → returns to normal view
- [ ] Random insights display (3 of 12 configurations)
- [ ] Tab switching works (mobile: Overview / Insights)

#### Category Filter
- [ ] Active filter shows badge
- [ ] Badge shows category emoji + name
- [ ] Badge shows filtered count
- [ ] Click badge → opens CategoryBreakdown
- [ ] Clear filter → removes badge and shows all

---

### 6. Advanced Features

#### Smart Suggestions
- [ ] Add single expense with same name 3 times
- [ ] Smart suggestion badge appears after 3rd
- [ ] Click "Convert to Template" → converts correctly
- [ ] Template created successfully
- [ ] Single expenses removed from list

#### Simulation Sandbox
- [ ] Click "Simulation" button → opens sandbox
- [ ] Sandbox displays budget breakdown
- [ ] Can add test expenses
- [ ] Can add test incomes
- [ ] Health bar updates correctly
- [ ] Close sandbox → no changes to real data

#### Advanced Filter
- [ ] Click "Filter" button → opens advanced filter drawer
- [ ] Can filter by date range
- [ ] Can filter by amount range
- [ ] Can filter by pocket
- [ ] Can filter by category
- [ ] Apply filters → updates list
- [ ] Clear filters → shows all

---

### 7. Pull-to-Refresh Integration

#### Desktop (N/A)
- [ ] No pull-to-refresh on desktop

#### Mobile
- [ ] Pull-to-refresh works when no modal open
- [ ] Pull-to-refresh DISABLED when ExpenseList drawers open
- [ ] Pull-to-refresh DISABLED when IncomeBreakdown open
- [ ] Pull-to-refresh DISABLED when CategoryBreakdown open
- [ ] Pull-to-refresh DISABLED when AdvancedFilter open
- [ ] Pull-to-refresh DISABLED when SimulationSandbox open
- [ ] Pull-to-refresh DISABLED when any action sheet open
- [ ] Pull-to-refresh ENABLED after closing all modals

---

### 8. Performance & UX

#### Initial Load
- [ ] ExpenseList renders within 500ms
- [ ] No layout shift during load
- [ ] Loading states display (if applicable)

#### Scrolling
- [ ] Smooth scrolling on long lists (100+ expenses)
- [ ] No jank or stuttering
- [ ] Category emojis don't cause re-renders

#### Animations
- [ ] Drawer open/close animations smooth
- [ ] Dialog fade-in animations smooth
- [ ] Collapsible expand/collapse smooth
- [ ] Delete animation smooth (if any)

#### Bundle Size
- [ ] Check bundle size after refactor
- [ ] Target: 50-100KB reduction
- [ ] Use `npm run build` and check output

---

### 9. Backward Compatibility

#### Legacy Data
- [ ] Old expenses with numeric category IDs (0, 1, 2) display correctly
- [ ] Old expenses migrate to new category format
- [ ] `normalizeCategoryId()` handles legacy IDs
- [ ] No data corruption

#### Custom Categories
- [ ] Expenses with custom categories display correctly
- [ ] Custom category emojis display
- [ ] Custom category labels display

---

### 10. Edge Cases

#### Empty States
- [ ] Empty expense list shows "No expenses" message
- [ ] Empty income list shows "No incomes" message
- [ ] Empty search results show "No results"
- [ ] Empty filtered list shows "No expenses in this category"

#### Long Names
- [ ] Long expense names truncate correctly (no overflow)
- [ ] Long category names truncate correctly
- [ ] Long pocket names truncate correctly

#### Large Numbers
- [ ] Large amounts (> 100M) format correctly
- [ ] Large exchange rates display correctly
- [ ] Large deductions display correctly

#### Special Characters
- [ ] Expense names with emojis display correctly
- [ ] Expense names with special chars display correctly
- [ ] Search handles special characters

---

## 🚨 Critical Bugs to Watch For

During refactoring, watch for these common regression patterns:

### State Management Issues
- [ ] Modal doesn't close after save
- [ ] Form data doesn't persist between renders
- [ ] Bulk selection state resets unexpectedly
- [ ] Filter state lost after modal close

### Event Handler Issues
- [ ] Click handlers don't fire
- [ ] Event bubbling causes double-actions
- [ ] Long-press doesn't trigger on mobile
- [ ] Form submission triggers page reload

### Render Issues
- [ ] Infinite re-render loops
- [ ] Components don't update after state change
- [ ] Over-memoization prevents updates
- [ ] Missing keys in list items

### Data Issues
- [ ] Wrong data passed to child components
- [ ] Props not updating in child components
- [ ] Stale closure in callbacks
- [ ] Race conditions in async operations

---

## ✅ Sign-Off Checklist

Before marking a phase as complete:

- [ ] All smoke tests pass
- [ ] All detailed tests pass
- [ ] No console errors
- [ ] No console warnings (except known issues)
- [ ] No TypeScript errors
- [ ] Performance same or better
- [ ] Bundle size same or smaller
- [ ] Mobile tested on real device (if possible)
- [ ] Desktop tested on Chrome
- [ ] Desktop tested on Firefox/Safari (optional)

---

## 📝 Testing Log

### Phase 1 (Types & Helpers)
- Date: _______
- Tester: _______
- Result: ☐ Pass ☐ Fail
- Notes: _______________________

### Phase 2 (Lazy Loading)
- Date: _______
- Tester: _______
- Result: ☐ Pass ☐ Fail
- Notes: _______________________

### Phase 3 (Custom Hooks)
- Date: _______
- Tester: _______
- Result: ☐ Pass ☐ Fail
- Notes: _______________________

### Phase 4 (Components)
- Date: _______
- Tester: _______
- Result: ☐ Pass ☐ Fail
- Notes: _______________________

### Phase 5 (Memoization)
- Date: _______
- Tester: _______
- Result: ☐ Pass ☐ Fail
- Notes: _______________________

### Phase 6 (Cleanup)
- Date: _______
- Tester: _______
- Result: ☐ Pass ☐ Fail
- Notes: _______________________

---

**Testing Guide:**
1. Run smoke test first (2 min)
2. If pass, run detailed test (10 min)
3. If fail, stop and debug immediately
4. Document any issues found
5. Re-test after fixes
6. Sign off only when 100% pass
