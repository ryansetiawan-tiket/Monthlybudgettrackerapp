# Test Cases: Auto-Scroll to Transaction List After Category Filter

## ✅ Test Scenario 1: Desktop - Click from BudgetOverview Card
### Steps:
1. Open app on desktop
2. Click "Total Pengeluaran" card (with chevron icon) in BudgetOverview
3. CategoryBreakdown dialog opens
4. Click any category card (e.g., "🍔 Makanan")
5. Dialog closes with smooth animation

### Expected Result:
- ✅ Dialog closes smoothly (300ms animation)
- ✅ Page scrolls to ExpenseList section
- ✅ Scroll is smooth (not instant jump)
- ✅ ExpenseList shows filtered transactions for "Makanan"
- ✅ Filter badge appears at top of list: "🍔 Makanan (X)"
- ✅ Scroll offset prevents sticky header from covering list

---

## ✅ Test Scenario 2: Mobile - Click from BudgetOverview Card
### Steps:
1. Open app on mobile
2. Scroll to BudgetOverview section
3. Click "Total Pengeluaran" card (with chevron icon)
4. CategoryBreakdown drawer opens from bottom
5. Click any category card (e.g., "🚗 Transportasi")
6. Drawer slides down to close

### Expected Result:
- ✅ Drawer closes smoothly (300ms animation)
- ✅ Page scrolls to ExpenseList section
- ✅ Scroll is smooth (not instant jump)
- ✅ ExpenseList shows filtered transactions for "Transportasi"
- ✅ Filter badge appears: "🚗 Transportasi (X)"
- ✅ Scroll offset prevents sticky header from covering list (important on mobile!)
- ✅ Toast notification: "Filter aktif: 🚗 Transportasi"

---

## ✅ Test Scenario 3: Desktop - Click from ExpenseList Internal Pie Chart
### Steps:
1. Scroll down to ExpenseList section
2. Click "Breakdown Kategori" button in ConsolidatedToolbar
3. CategoryBreakdown dialog opens
4. Click any category card

### Expected Result:
- ✅ Dialog closes
- ✅ Filter applied
- ✅ **NO SCROLL** (already at ExpenseList section)
- ✅ Filter badge appears
- ✅ Toast notification appears

**Note**: Auto-scroll logic still runs but `elementPosition - window.scrollY` is already ~0, so no visible scroll happens. This is correct behavior!

---

## ✅ Test Scenario 4: Mobile - Click Pie Chart Slice Directly (ExpenseList)
### Steps:
1. Open app on mobile
2. Scroll to ExpenseList section
3. Click directly on pie chart slice (e.g., blue slice for "Kesehatan")
4. CategoryBreakdown drawer does NOT open (this is click-to-filter shortcut)

### Expected Result:
- ✅ Drawer does NOT open
- ✅ Filter applied immediately
- ✅ **NO SCROLL** (already at ExpenseList section)
- ✅ Toast: "Filter aktif: 🏥 Kesehatan"

---

## ✅ Test Scenario 5: Multiple Category Clicks (Toggle Behavior)
### Steps:
1. Click "Total Pengeluaran" card → open CategoryBreakdown
2. Click "🍔 Makanan" → scroll + filter
3. Open CategoryBreakdown again
4. Click "🚗 Transportasi" → scroll + replace filter

### Expected Result:
- ✅ First filter: Shows only "Makanan" expenses
- ✅ Second filter: Replaces "Makanan" with "Transportasi" (only 1 active filter)
- ✅ Each time scrolls to ExpenseList
- ✅ Filter badge updates accordingly

---

## 🔍 Test Scenario 6: Edge Case - No Transactions
### Steps:
1. Select a month with NO transactions
2. Click "Total Pengeluaran" card
3. CategoryBreakdown shows all categories with Rp 0
4. Click any category

### Expected Result:
- ✅ Dialog closes
- ✅ Scroll to ExpenseList
- ✅ ExpenseList shows "Belum ada pengeluaran"
- ✅ Filter badge still appears
- ✅ **ONLY 1 filter badge** (not duplicate!)

---

## 🐛 BUG FIX: Duplicate Filter Badge (November 14, 2025)

### Problem:
After clicking category from CategoryBreakdown opened via BudgetOverview card, user saw **2 identical filter badges**:
- Badge 1: From `categoryFilter` (parent state)
- Badge 2: From `activeCategoryFilter` (internal state)

### Root Cause:
```tsx
// ❌ WRONG: Both states were being set
const handleCategoryClick = (category) => {
  setCategoryFilter(new Set([category])); // Parent filter ❌
  // ...
}

// ExpenseList internal handler also sets:
setActiveCategoryFilter(new Set([category])); // Internal filter ❌
```

### Solution:
```tsx
// ✅ CORRECT: Only scroll, don't update parent filter
const handleCategoryClick = (category) => {
  // Don't set categoryFilter here!
  // Only scroll to results
  setTimeout(() => {
    if (expenseListRef.current) {
      window.scrollTo({...});
    }
  }, 300);
}
```

ExpenseList's internal `activeCategoryFilter` already handles all filtering logic.

---

## 🔍 Test Scenario 7: Edge Case - Scroll Already at Bottom
### Steps:
1. Scroll to bottom of page (past ExpenseList)
2. Click browser back or scroll up
3. Click "Total Pengeluaran" card
4. Click any category

### Expected Result:
- ✅ Scrolls UP to ExpenseList section
- ✅ Smooth scroll animation
- ✅ Offset prevents header overlap

---

## 📱 Mobile-Specific Tests

### Test 8: Status Bar Offset (Android/iOS)
### Steps:
1. Build app with Capacitor
2. Install on Android device
3. Test category filter scroll

### Expected Result:
- ✅ Status bar (44px) does NOT cover ExpenseList
- ✅ Adjust offset in code if needed:
  ```tsx
  const offset = 120; // For native app with status bar
  ```

---

## 🐛 Debugging Tips

### If scroll doesn't happen:
1. Check `expenseListRef.current` is not null
2. Verify `handleCategoryClick` in App.tsx is being called
3. Check console for errors
4. Verify ExpenseList has `onCategoryClick={handleCategoryClick}` prop

### If scroll timing is wrong:
1. Adjust setTimeout delay to match animation:
   ```tsx
   setTimeout(() => { /* scroll */ }, 400); // Increase if animation is slow
   ```

### If scroll offset is wrong:
1. Inspect sticky header actual height
2. Adjust offset value:
   ```tsx
   const offset = 100; // Increase for taller header
   ```

### If scroll happens on internal pie chart click:
This is EXPECTED! The scroll logic runs but has minimal effect since already at ExpenseList. To disable scroll for internal clicks, add a flag:
```tsx
const handleCategoryClick = useCallback((category, fromExternal = false) => {
  setCategoryFilter(new Set([category]));
  
  if (fromExternal) { // Only scroll if from external source
    setTimeout(() => { /* scroll logic */ }, 300);
  }
}, []);
```

---

## ✅ Success Criteria
- [x] Smooth scroll animation (no instant jump)
- [x] Correct offset (header doesn't cover list)
- [x] Works on both desktop and mobile
- [x] Works with drawer (mobile) and dialog (desktop)
- [x] Filter badge appears after scroll
- [x] Toast notification appears
- [x] No errors in console
- [x] Works with external trigger (BudgetOverview card)
- [x] Works with internal trigger (ExpenseList pie chart)

## 🎉 Expected User Delight
> "Wow, it automatically shows me the filtered results! I don't need to scroll down manually anymore!" 🎯