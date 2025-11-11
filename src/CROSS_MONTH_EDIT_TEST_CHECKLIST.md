# ✅ Cross-Month Edit - Test Checklist

## 🎯 **Critical Test Cases**

### **Test 1: Oktober Expense in November View (MAIN BUG)**
```
Setup:
  1. Navigate to November 2025
  2. Ensure there's an expense with date Oktober 30, 2025
     (If not, add via timeline or create manually)

Steps:
  [ ] 1. View November 2025
  [ ] 2. See Oktober expense in list (30 Okt)
  [ ] 3. Click Edit on Oktober expense
  [ ] 4. Confirm date shows "30 Oktober 2025"
  [ ] 5. Click Save (DO NOT change anything)

Expected:
  [ ] ✅ Expense disappears from November list instantly
  [ ] ✅ Screen navigates to Oktober 2025
  [ ] ✅ Toast appears: "Pindah ke Oktober 2025"
  [ ] ✅ Expense appears in Oktober list
  [ ] ✅ Toast dismisses after 3 seconds
  [ ] ✅ No UI glitches or broken buttons

Result: _______________
```

---

### **Test 2: Same Month Edit (No Navigation)**
```
Setup:
  1. Navigate to November 2025
  2. Find expense dated November 15, 2025

Steps:
  [ ] 1. Click Edit on November expense
  [ ] 2. Change name from "Makan" to "Belanja"
  [ ] 3. Click Save

Expected:
  [ ] ✅ Expense stays in November list
  [ ] ✅ Name updates to "Belanja"
  [ ] ✅ Screen stays in November (no navigation)
  [ ] ✅ Toast: "Pengeluaran berhasil diupdate"
  [ ] ✅ Changes reflected immediately

Result: _______________
```

---

### **Test 3: Change Date to Different Month**
```
Setup:
  1. Navigate to November 2025
  2. Find expense dated November 15, 2025

Steps:
  [ ] 1. Click Edit
  [ ] 2. Change date from Nov 15 to Dec 20
  [ ] 3. Click Save

Expected:
  [ ] ✅ Expense disappears from November
  [ ] ✅ Navigate to December 2025
  [ ] ✅ Toast: "Pindah ke Desember 2025"
  [ ] ✅ Expense appears in December with new date
  [ ] ✅ Smooth transition

Result: _______________
```

---

### **Test 4: Income Cross-Month**
```
Setup:
  1. Navigate to November 2025
  2. Ensure income with date Oktober 20, 2025 exists

Steps:
  [ ] 1. View November 2025
  [ ] 2. Find Oktober income in list
  [ ] 3. Click Edit
  [ ] 4. Click Save (no changes)

Expected:
  [ ] ✅ Income disappears from November
  [ ] ✅ Navigate to Oktober 2025
  [ ] ✅ Toast: "Pindah ke Oktober 2025"
  [ ] ✅ Income appears in Oktober list

Result: _______________
```

---

### **Test 5: Multiple Cross-Month Entries**
```
Setup:
  1. Create multiple Oktober expenses in November view
  2. At least 3 expenses

Steps:
  [ ] 1. View November 2025
  [ ] 2. Edit first Oktober expense → Save
  [ ] 3. Navigate back to November
  [ ] 4. Edit second Oktober expense → Save
  [ ] 5. Navigate back to November
  [ ] 6. Edit third Oktober expense → Save

Expected:
  [ ] ✅ Each edit navigates to Oktober
  [ ] ✅ All expenses end up in Oktober
  [ ] ✅ No expenses left in November
  [ ] ✅ Toast appears each time
  [ ] ✅ No errors in console

Result: _______________
```

---

### **Test 6: Edit from Timeline**
```
Setup:
  1. Open PocketDetailPage for any pocket
  2. View timeline showing multiple months

Steps:
  [ ] 1. Find expense from different month (e.g., Oktober)
  [ ] 2. Click Edit
  [ ] 3. Change name
  [ ] 4. Click Save

Expected:
  [ ] ✅ Timeline closes
  [ ] ✅ Navigate to expense's actual month (Oktober)
  [ ] ✅ Toast appears
  [ ] ✅ Expense shows updated name
  [ ] ✅ No errors

Result: _______________
```

---

### **Test 7: Network Error Handling**
```
Setup:
  1. Open DevTools → Network tab
  2. Set throttling to "Offline"

Steps:
  [ ] 1. Edit any expense
  [ ] 2. Click Save
  [ ] 3. Wait for error

Expected:
  [ ] ✅ Toast: "Gagal mengupdate pengeluaran"
  [ ] ✅ Expense still visible in list
  [ ] ✅ No navigation occurs
  [ ] ✅ Can retry edit

Result: _______________
Restore: Set network to "Online"
```

---

### **Test 8: Rapid Edits (Stress Test)**
```
Steps:
  [ ] 1. Edit expense → Change date to Dec → Save
  [ ] 2. Immediately navigate back to Nov
  [ ] 3. Edit another expense → Change to Dec → Save
  [ ] 4. Repeat 5 times quickly

Expected:
  [ ] ✅ All navigations work correctly
  [ ] ✅ No race conditions
  [ ] ✅ All toasts appear
  [ ] ✅ No duplicate expenses
  [ ] ✅ Data consistency maintained

Result: _______________
```

---

## 🔍 **Console Checks**

### **During Each Test, Verify Console:**
```
[ ] No errors
[ ] No warnings
[ ] Expected logs appear:
    - "📅 Expense date is X-Y but viewing A-B - removing and navigating"
    - OR "Expense same month logic"
[ ] Supabase queries successful
[ ] Cache invalidation logs present
```

---

## 📱 **Mobile-Specific Tests**

### **Test 9: Mobile Drawer Edit**
```
Setup:
  1. Use mobile viewport (< 768px)
  2. View November 2025

Steps:
  [ ] 1. Click Edit (opens drawer)
  [ ] 2. Expense shows Oktober date
  [ ] 3. Click Save
  [ ] 4. Drawer closes

Expected:
  [ ] ✅ Drawer closes smoothly
  [ ] ✅ Navigate to Oktober
  [ ] ✅ Toast appears at bottom
  [ ] ✅ Mobile layout intact

Result: _______________
```

---

## 🎨 **Visual Checks**

### **UI Elements to Verify:**
```
[ ] Toast appears in correct position
[ ] Toast has correct color (green for success)
[ ] Toast text is readable
[ ] Toast doesn't overlap content
[ ] Navigation is smooth (no flicker)
[ ] List updates without flash
[ ] Loading states show if applicable
[ ] Month selector updates correctly
```

---

## 🧪 **Data Integrity Checks**

### **After Cross-Month Navigation:**
```
[ ] 1. Check expense appears in correct month
[ ] 2. All expense data preserved (name, amount, pocket, etc.)
[ ] 3. Date is correct
[ ] 4. Pocket balance updated correctly
[ ] 5. Timeline shows expense in right place
[ ] 6. No duplicates in any month
[ ] 7. Category preserved
[ ] 8. Color/styling preserved
```

---

## 🔄 **Cache Validation**

### **Test Cache Behavior:**
```
Steps:
  [ ] 1. View November (data loads)
  [ ] 2. Navigate to Oktober
  [ ] 3. Navigate back to November
  [ ] 4. Verify November data loads from cache
  [ ] 5. Edit cross-month expense
  [ ] 6. Navigate back to November
  [ ] 7. Verify November cache was invalidated
  [ ] 8. Fresh data loaded (expense gone)

Expected:
  [ ] ✅ Cache used when valid
  [ ] ✅ Cache invalidated after cross-month edit
  [ ] ✅ Fresh data after invalidation
```

---

## ⚡ **Performance Checks**

### **Measure:**
```
[ ] Navigation speed: < 300ms
[ ] Toast appears: < 100ms after save
[ ] List update: < 200ms
[ ] No unnecessary re-renders
[ ] No memory leaks (check DevTools)
```

---

## 🐛 **Regression Tests**

### **Verify Previous Features Still Work:**
```
[ ] Normal expense add (same month)
[ ] Normal expense edit (same month)
[ ] Expense delete
[ ] Bulk operations
[ ] Category changes
[ ] Pocket transfers
[ ] Income operations
[ ] Timeline navigation
[ ] Search/filter
[ ] Sort
```

---

## 📋 **Sign-Off Checklist**

### **Before Marking Complete:**
```
[ ] All 9 main tests passed
[ ] Console clean (no errors)
[ ] Mobile tests passed
[ ] Visual checks passed
[ ] Data integrity verified
[ ] Cache working correctly
[ ] Performance acceptable
[ ] No regressions
[ ] Documentation reviewed
[ ] Ready for production
```

---

## 🎯 **Quick Test Script**

### **5-Minute Smoke Test:**
```bash
1. [1 min] Test 1: Cross-month cleanup
   → Oktober expense in November
   → Edit → Save
   → ✅ Navigate to Oktober

2. [1 min] Test 2: Same month
   → Edit November expense
   → Change name
   → ✅ Stay in November

3. [1 min] Test 3: Date change
   → Change Nov → Dec
   → ✅ Navigate to Dec

4. [1 min] Test 4: Income cross-month
   → Edit Oktober income from Nov
   → ✅ Navigate to Oktober

5. [1 min] Console check
   → ✅ No errors
   → ✅ Expected logs present
```

**If all 5 pass → Feature is working!** ✅

---

## 📊 **Test Results Template**

```
Date: _____________
Tester: _____________
Environment: [ ] Desktop [ ] Mobile [ ] Both

Test Results:
  Test 1: [ ] Pass [ ] Fail - Notes: _______________
  Test 2: [ ] Pass [ ] Fail - Notes: _______________
  Test 3: [ ] Pass [ ] Fail - Notes: _______________
  Test 4: [ ] Pass [ ] Fail - Notes: _______________
  Test 5: [ ] Pass [ ] Fail - Notes: _______________
  Test 6: [ ] Pass [ ] Fail - Notes: _______________
  Test 7: [ ] Pass [ ] Fail - Notes: _______________
  Test 8: [ ] Pass [ ] Fail - Notes: _______________
  Test 9: [ ] Pass [ ] Fail - Notes: _______________

Console: [ ] Clean [ ] Has warnings/errors
Performance: [ ] Good [ ] Needs improvement
Regressions: [ ] None [ ] Found (list): _______________

Overall: [ ] PASS [ ] FAIL
Sign-off: _______________
```

---

## 🚀 **Test NOW!**

```bash
# Hard refresh
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)

# Start with Test 1 (most critical)
# Work through checklist systematically
# Document any issues found
```

**Let's verify this fix works perfectly!** ✅🎯
