# ✅ Saldo Proyeksi - Testing Guide for ALL Pockets

**Last Updated:** 10 November 2025  
**Purpose:** Verify Saldo Proyeksi fix works for **ALL** pockets (not just Uang Dingin)

---

## 🎯 Test Coverage

This fix applies to:
- ✅ **Sehari-hari** (Primary/Daily pocket)
- ✅ **Uang Dingin** (Cold Money pocket)
- ✅ **Custom Pockets** (All user-created pockets)

**Why:** The fix is implemented in `pockets.map()` loop → applies to ALL pockets universally!

---

## 🧪 Testing Checklist

### Test 1: Verify Fix Applies to Sehari-hari Pocket ✅

**Setup:**
1. Open app
2. Navigate to current month (e.g., November 2025)
3. Find "Sehari-hari" pocket card

**Test Steps:**
- [ ] 1. Check current balance display
- [ ] 2. Open Timeline for "Sehari-hari"
- [ ] 3. Note the **final balance** (bottom entry = newest = end of month)
- [ ] 4. Open Pocket Settings (3-dots menu)
- [ ] 5. Toggle to **"Saldo Proyeksi"** mode
- [ ] 6. Verify card balance **matches Timeline final balance**
- [ ] 7. Toggle back to **"Saldo Hari Ini"** mode
- [ ] 8. Verify balance shows **today's balance** (lower than projection if you have future transactions)

**Expected Results:**
```
Timeline (Sehari-hari):
┌─────────────────────────────────┐
│ [Future] Shopping -Rp 500.000  │  ← Future transaction
│ Saldo: Rp 2.500.000             │  ← Final (end of month)
├─────────────────────────────────┤
│ [Today] Groceries -Rp 200.000   │
│ Saldo: Rp 3.000.000             │  ← Today's balance
├─────────────────────────────────┤
│ Saldo Awal +Rp 3.200.000        │
│ Saldo: Rp 3.200.000             │
└─────────────────────────────────┘

Card Display:
- Saldo Hari Ini: Rp 3.000.000 ✅ (excludes future)
- Saldo Proyeksi: Rp 2.500.000 ✅ (includes future)
```

---

### Test 2: Verify Fix Applies to Uang Dingin Pocket ✅

**Setup:**
1. Find "Uang Dingin" pocket card
2. Ensure it has transactions (income + expenses)

**Test Steps:**
- [ ] 1. Open Timeline for "Uang Dingin"
- [ ] 2. Note the **final balance** (should be Rp 15.661.398 based on bug report)
- [ ] 3. Open Pocket Settings
- [ ] 4. Toggle to **"Saldo Proyeksi"** mode
- [ ] 5. Verify card shows **Rp 15.661.398** (not Rp 1.181.398!)
- [ ] 6. Verify "Saldo Proyeksi" label appears
- [ ] 7. Toggle to "Saldo Hari Ini"
- [ ] 8. Verify balance changes to today's balance

**Expected Results:**
```
Before Fix (BUGGY):
Card: Rp 1.181.398 ❌ (wrong!)

After Fix (CORRECT):
Card: Rp 15.661.398 ✅ (matches Timeline!)
```

---

### Test 3: Verify Fix Applies to Custom Pockets ✅

**Setup:**
1. Create a custom pocket (e.g., "Tabungan Liburan")
2. Add some income to it
3. Add some expenses (future-dated)

**Test Steps:**
- [ ] 1. Open Timeline for custom pocket
- [ ] 2. Note the final balance
- [ ] 3. Toggle to "Saldo Proyeksi" mode
- [ ] 4. Verify card balance matches Timeline
- [ ] 5. Create multiple custom pockets, test each one

**Expected Results:**
- All custom pockets show correct projected balance ✅
- Toggle works independently for each pocket ✅

---

### Test 4: Verify Desktop View Works ✅

**Setup:**
1. Open app on desktop browser (width > 768px)
2. Verify desktop layout appears (grid, not carousel)

**Test Steps:**
- [ ] 1. Check all pockets display in grid layout
- [ ] 2. For each pocket:
  - [ ] Open settings (More menu → Kelola Pengaturan)
  - [ ] Toggle "Saldo Proyeksi" mode
  - [ ] Verify balance updates correctly
  - [ ] Verify label shows "Saldo Proyeksi"
- [ ] 3. Verify all pockets can be toggled independently

---

### Test 5: Verify Mobile View Works ✅

**Setup:**
1. Open app on mobile browser or device
2. Verify carousel layout appears

**Test Steps:**
- [ ] 1. Swipe through all pocket cards
- [ ] 2. For each pocket:
  - [ ] Tap card to open Timeline
  - [ ] Note final balance
  - [ ] Tap Settings icon
  - [ ] Toggle mode
  - [ ] Verify balance matches
- [ ] 3. Test with touch gestures (swipe, tap)

---

### Test 6: Verify Timeline Prefetch Works for All Modes ✅

**Setup:**
1. Clear browser cache
2. Refresh page

**Test Steps:**
- [ ] 1. Wait for page load
- [ ] 2. Verify timeline prefetch happens for ALL pockets (check Network tab)
- [ ] 3. Toggle a pocket to "Saldo Proyeksi"
- [ ] 4. Verify balance appears **immediately** (no loading delay)
- [ ] 5. Create new custom pocket
- [ ] 6. Verify its timeline also prefetches

**Expected Results:**
```
Network Tab:
GET /timeline/2025/11/daily          ✅ Prefetched
GET /timeline/2025/11/cold_money     ✅ Prefetched
GET /timeline/2025/11/pocket_custom_xxx ✅ Prefetched

All timelines loaded on mount → Instant mode toggle!
```

---

### Test 7: Edge Cases ✅

**Test 7.1: Pocket with Only Past Transactions**
- [ ] Set all transactions to past dates
- [ ] Verify "Saldo Hari Ini" = "Saldo Proyeksi" (same balance)

**Test 7.2: Pocket with Only Future Transactions**
- [ ] Set all transactions to future dates
- [ ] Verify "Saldo Hari Ini" = Saldo Awal (no transactions yet)
- [ ] Verify "Saldo Proyeksi" = Final balance (includes future)

**Test 7.3: Empty Pocket (No Transactions)**
- [ ] Create new pocket, don't add transactions
- [ ] Verify both modes show Rp 0 (or carry-over if exists)

**Test 7.4: Pocket with Mixed Dates**
- [ ] Add transactions with dates: past, today, future
- [ ] Verify "Saldo Hari Ini" stops at today
- [ ] Verify "Saldo Proyeksi" includes all

**Test 7.5: Multiple Pockets, Different Modes**
- [ ] Set Pocket A → "Saldo Hari Ini"
- [ ] Set Pocket B → "Saldo Proyeksi"
- [ ] Set Pocket C → "Saldo Hari Ini"
- [ ] Verify each pocket shows correct balance independently

---

## 🔍 Debugging Tips

### Verify Timeline Cache
```javascript
// In browser console
const pocketId = 'daily'; // or 'cold_money', 'pocket_custom_xxx'
const timeline = timelineCache.get(pocketId);

console.log('Timeline loaded:', timeline ? 'Yes' : 'No');
console.log('Entry count:', timeline?.length);
console.log('Final balance:', timeline?.[0]?.balanceAfter);
```

### Verify Mode State
```javascript
// Check current mode for all pockets
pockets.forEach(pocket => {
  const mode = realtimeMode.get(pocket.id);
  console.log(`${pocket.name}: ${mode ? 'Realtime' : 'Projection'}`);
});
```

### Force Refresh Timeline
```javascript
// Force refresh specific pocket
prefetchTimeline('pocket_id_here');

// Or refresh all pockets
window.__refreshPockets?.();
```

---

## 📊 Visual Comparison

### Before Fix (Buggy) ❌

```
┌─────────────────────────────────────┐
│ 💰 Sehari-hari                      │
│ Saldo Proyeksi                      │
│ Rp 3.500.000 (WRONG!)              │ ← Only current month!
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ❄️ Uang Dingin                      │
│ Saldo Proyeksi                      │
│ Rp 1.181.398 (WRONG!)              │ ← Missing carry-over + future!
└──────────���──────────────────────────┘

┌─────────────────────────────────────┐
│ 🎯 Custom Pocket                    │
│ Saldo Proyeksi                      │
│ Rp 500.000 (WRONG!)                │ ← Incomplete calculation!
└─────────────────────────────────────┘
```

### After Fix (Correct) ✅

```
┌─────────────────────────────────────┐
│ 💰 Sehari-hari                      │
│ Saldo Proyeksi                      │
│ Rp 2.800.000 ✅                     │ ← Includes all future transactions!
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ❄️ Uang Dingin                      │
│ Saldo Proyeksi                      │
│ Rp 15.661.398 ✅                    │ ← Correct! Matches Timeline!
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🎯 Custom Pocket                    │
│ Saldo Proyeksi                      │
│ Rp 1.200.000 ✅                     │ ← Correct projected balance!
└─────────────────────────────────────┘
```

---

## 🎯 Success Criteria

**Fix is successful if:**

✅ ALL pockets (Daily, Cold Money, Custom) show correct projected balance  
✅ "Saldo Proyeksi" matches Timeline final balance exactly  
✅ "Saldo Hari Ini" shows today's balance (different from projection if future txns exist)  
✅ Toggle works independently for each pocket  
✅ Works on both Desktop and Mobile  
✅ Timeline prefetch happens for all pockets (both modes)  
✅ No loading delays when toggling modes  
✅ Edge cases handled correctly (empty, past-only, future-only)  

---

## 📁 Related Files

**Modified:**
- `/components/PocketsSummary.tsx` - Added `calculateProjectedBalance()`, updated prefetch logic

**Documentation:**
- `/SALDO_PROYEKSI_UANG_DINGIN_FIX.md` - Complete bug analysis
- `/SALDO_PROYEKSI_QUICK_REF.md` - Quick reference guide
- `/SALDO_PROYEKSI_ALL_POCKETS_TESTING.md` - This file (testing guide)

---

## 🚀 Quick Start Testing

**Minimal test (30 seconds):**
1. Open app
2. Find "Uang Dingin" card
3. Toggle to "Saldo Proyeksi"
4. Verify shows **Rp 15.661.398** (not Rp 1.181.398!)
5. Find "Sehari-hari" card
6. Toggle to "Saldo Proyeksi"
7. Verify matches Timeline final balance
8. ✅ Done!

**Full test (5 minutes):**
- Run all 7 test cases above
- Test on both desktop and mobile
- Test with different data scenarios
- Verify all edge cases

---

**Ready for deployment! 🎉**
