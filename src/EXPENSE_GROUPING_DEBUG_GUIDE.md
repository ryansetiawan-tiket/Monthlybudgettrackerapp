# 🔍 Quick Guide: Debug Expense Grouping Issue

**Problem:** Expenses tidak ter-group sebagaimana mestinya  
**Solution:** Enable debug logging dan check data

---

## 🚀 QUICK START (2 Menit)

### Step 1: Enable Debug Mode

1. Buka file `/components/ExpenseList.tsx`
2. Cari baris ~970 (di dalam function `groupExpensesByDate`)
3. Ubah dari:
   ```typescript
   const DEBUG_GROUPING = false;
   ```
   Menjadi:
   ```typescript
   const DEBUG_GROUPING = true;
   ```
4. Save file

### Step 2: Check Console

1. Refresh app di browser
2. Buka Developer Console (F12)
3. Lihat console logs

### Step 3: Analyze Output

Cari log dengan emoji:
- 🔍 = Expense being grouped
- 📦 = Final grouped results

---

## 📊 WHAT TO LOOK FOR

### Example Console Output

```javascript
// For each expense:
🔍 Grouping expense: {
  name: "3ds old",
  fullDate: "2025-11-08T10:00:00",
  dateOnly: "2025-11-08",        // ← Check this!
  groupKey: "2025-11-08",        // ← Should match for same-date expenses
  pocketId: "pocket-uang-dingin",
  category: "Food"
}

🔍 Grouping expense: {
  name: "Tahu + kecap",
  fullDate: "2025-11-08T12:00:00",
  dateOnly: "2025-11-08",        // ← Same as above!
  groupKey: "2025-11-08",
  pocketId: "pocket-sehari-hari",
  category: "Food"
}

// Final result:
📦 Grouped results: [{
  date: "2025-11-08",
  count: 3,                       // ← Should be 3 for your case
  expenses: [
    { name: "3ds old", pocket: "pocket-uang-dingin" },
    { name: "Tahu + kecap", pocket: "pocket-sehari-hari" },
    { name: "Burger + kentang", pocket: "pocket-uang-dingin" }
  ]
}]
```

---

## ✅ VERIFICATION CHECKLIST

### If ALL 3 expenses show in console:

**Check `dateOnly` values:**
- [ ] "3ds old" → `dateOnly: "2025-11-08"`
- [ ] "Tahu + kecap" → `dateOnly: "2025-11-08"`
- [ ] "Burger + kentang" → `dateOnly: "2025-11-08"`

**All same?** ✅ They SHOULD be grouped  
**Different?** ❌ That's the problem!

### If they're GROUPED in console but NOT in UI:

Possible causes:
1. **Excluded:** One expense is in `excludedExpenseIds`
2. **Filtered:** Category filter or search query is active
3. **Wrong tab:** Check if you're on "Pengeluaran" tab
4. **Collapsed:** Try expanding the date group

---

## 🐛 COMMON ISSUES & FIXES

### Issue 1: Different `dateOnly` Values

**Problem:**
```
"3ds old"       → dateOnly: "2025-11-07"  ❌
"Tahu + kecap"  → dateOnly: "2025-11-08"  ✅
```

**Root Cause:** Data in database has wrong date

**Fix:**
1. Edit "3ds old" expense
2. Change date to "8 Nov 2025"
3. Save
4. Should auto-group now

---

### Issue 2: Missing from Console Logs

**Problem:** "3ds old" tidak muncul di console logs sama sekali

**Root Cause:** Expense ter-filter sebelum grouping

**Check:**
1. Apakah category filter aktif? → Clear filter
2. Apakah ada search query? → Clear search
3. Apakah di tab "Pengeluaran"? → Switch tab
4. Apakah pocket filter aktif? → Clear pocket filter

---

### Issue 3: Grouped in Logs, Separate in UI

**Problem:** Console shows `count: 3` but UI shows separate cards

**Debugging:**
1. Check if expense is excluded:
   - Look for strikethrough text
   - Check opacity (excluded items are faded)
2. Check rendering logic:
   - Single expense might render differently
3. Check browser cache:
   - Hard refresh (Ctrl+Shift+R)

---

## 📸 SEND ME THIS INFO

Kalau masih tidak bisa, screenshot atau copy-paste console output:

```
🔍 Grouping expense: { ... }  ← Copy all of these
🔍 Grouping expense: { ... }
🔍 Grouping expense: { ... }
📦 Grouped results: [ ... ]   ← And this
```

Juga screenshot UI yang menunjukkan masalahnya.

---

## 🔧 AFTER DEBUGGING

### To Disable Debug Mode:

1. Buka `/components/ExpenseList.tsx`
2. Ubah kembali ke:
   ```typescript
   const DEBUG_GROUPING = false;
   ```
3. Save

Debug logs akan hilang dari console.

---

## 🎯 EXPECTED RESULT

**Correct Behavior:**
- All expenses with **same date** → grouped together
- Doesn't matter:
  - Different pockets ✅
  - Different categories ✅
  - Added separately ✅

**UI Should Show:**
```
┌─────────────────────────────────────┐
│ Sabtu, 8 Nov [3]    -Rp 50.000  ▼  │
├─────────────────────────────────────┤
│ 3ds old (Uang Dingin)   -Rp 10.000 │
│ Tahu + kecap (Sehari-hari) -Rp 15k │
│ Burger + kentang (Uang D.) -Rp 25k │
└─────────────────────────────────────┘
```

---

## 📞 NEED HELP?

Kalau masih stuck, kirim:
1. ✅ Screenshot UI yang bermasalah
2. ✅ Console output (dengan DEBUG_GROUPING = true)
3. ✅ Info tambahan:
   - Apakah expenses ditambah bersamaan atau terpisah?
   - Apakah ada filter aktif?
   - Apakah ada exclude aktif?

Saya akan bantu investigate lebih lanjut! 🚀
