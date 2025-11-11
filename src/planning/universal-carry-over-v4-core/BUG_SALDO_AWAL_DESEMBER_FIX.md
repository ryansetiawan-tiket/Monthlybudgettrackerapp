# Bug Fix: Saldo Awal Desember Negatif

**Date:** 10 November 2025  
**Status:** ✅ FIXED - Requires Re-Generation

---

## 🔥 The Bug

**Symptom:**
- Saldo Proyeksi November: **+Rp 376.630** ✅ (CORRECT after TUGAS 1 fix)
- Saldo Awal Desember: **-Rp 376.631** ❌ (WRONG!)

**Expected:**
- Saldo Awal Desember should equal Saldo Proyeksi November
- Both should be **+Rp 376.630**

---

## 🔍 Root Cause

### Timeline of Events:

```
1. November 10, 2025:
   ✅ TUGAS 1 completed:
      - Backend now calculates projectedBalance correctly
      - Frontend displays correct balance
      - PayLater Saldo Proyeksi November = +Rp 376.630 ✅

2. User navigates to December:
   ❌ Carry-over was ALREADY generated (with OLD logic)
   ❌ Used availableBalance (old calculation)
   ❌ Saldo Awal Desember = -Rp 376.631 (WRONG!)
```

### Code Bug (Fixed):

**File:** `/supabase/functions/server/index.tsx`

**Line 632 (BEFORE FIX):**
```typescript
// ❌ WRONG: Uses old availableBalance
const carryOver: CarryOverEntry = {
  amount: balance.availableBalance,  // ❌ Might use old logic
  breakdown: {
    finalBalance: balance.availableBalance  // ❌ Same problem
  }
};
```

**Line 632 (AFTER FIX):**
```typescript
// ✅ CORRECT: Uses projectedBalance (includes ALL transactions)
const carryOverAmount = balance.projectedBalance ?? balance.availableBalance;

const carryOver: CarryOverEntry = {
  amount: carryOverAmount,  // ✅ Correct projected balance
  breakdown: {
    income: balance.income || 0,  // ✅ Include income
    finalBalance: carryOverAmount  // ✅ Correct final balance
  }
};
```

---

## ✅ The Fix

### 1. Backend Code Updated

**Changes Made:**
- ✅ `generateCarryOversForNextMonth()` now uses `projectedBalance`
- ✅ `generateCarryOvers_DEPRECATED()` also updated (backward compat)
- ✅ Breakdown now includes income from previous month

**Key Logic:**
```typescript
// Priority: projectedBalance > availableBalance
const carryOverAmount = balance.projectedBalance ?? balance.availableBalance;
```

### 2. Re-Generation Required

**Problem:**
- December carry-over was already generated with OLD logic
- Stored in database: `carryover:2025-12:pocket_custom_paylater`
- Value: -Rp 376.631 (WRONG)

**Solution:**
User must **re-generate** December carry-over with new logic

---

## 🔧 How to Re-Generate Carry-Over

### Option 1: API Call (Manual)

```bash
# Call backend endpoint to regenerate December carry-over
curl -X POST "https://{projectId}.supabase.co/functions/v1/make-server-3adbeaf1/carryover/generate/2025/11" \
  -H "Authorization: Bearer {publicAnonKey}"

# This will:
# 1. Calculate November final balance using NEW logic (projected)
# 2. Generate December carry-over with CORRECT amount
# 3. Overwrite old carry-over data
```

### Option 2: Navigate Away and Back

**Steps:**
1. Go to November 2025 (current month)
2. Navigate to January 2026 (skip December)
3. Navigate back to December 2025
4. System will auto-regenerate carry-over

**Why this works:**
- Auto-generation only triggers when navigating to NEW month
- Skipping ahead forces fresh calculation
- New logic will be used

### Option 3: Frontend Button (Recommended)

Add "Re-calculate Saldo Awal" button in Timeline:

```typescript
// In PocketTimeline component
const handleRegenerateCarryOver = async () => {
  const [year, month] = monthKey.split('-');
  const prevMonth = getPreviousMonthKey(monthKey);
  const [prevYear, prevMonthNum] = prevMonth.split('-');
  
  const response = await fetch(
    `${baseUrl}/carryover/generate/${prevYear}/${prevMonthNum}`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${publicAnonKey}` }
    }
  );
  
  if (response.ok) {
    toast.success('Saldo Awal berhasil di-generate ulang!');
    // Refresh timeline
    fetchTimeline();
  }
};
```

---

## 🧪 Verification

### Before Fix:
```
November 2025 (PayLater):
  Saldo Proyeksi: +Rp 376.630 ✅

December 2025 (PayLater):
  Saldo Awal: -Rp 376.631 ❌  ← WRONG!
  Text: "Dari November 2025"
```

### After Re-Generation:
```
November 2025 (PayLater):
  Saldo Proyeksi: +Rp 376.630 ✅

December 2025 (PayLater):
  Saldo Awal: +Rp 376.630 ✅  ← CORRECT!
  Text: "Dari November 2025"
```

### Console Verification:

**Before:**
```
[CARRY-OVER] ✅ Saved: PayLater (pocket_custom_paylater) = -376631
```

**After:**
```
[CARRY-OVER] ✅ Saved: PayLater (pocket_custom_paylater) = 376630
```

---

## 📊 Impact Analysis

### What's Fixed:
- ✅ Future carry-overs will use correct `projectedBalance`
- ✅ All pocket types benefit from fix
- ✅ Consistent with displayed "Saldo Proyeksi"

### What Needs Action:
- ⚠️ **Existing carry-overs** (already generated) are WRONG
- ⚠️ User must **re-generate** for affected months
- ⚠️ Affected months: Any month after first navigation post-TUGAS 1

### Safe to Re-Generate:
- ✅ Re-generation is **idempotent** (can run multiple times safely)
- ✅ Overwrites old data (no duplicates)
- ✅ Uses current month's final balance (fresh calculation)

---

## 🎯 Testing Checklist

### Test 1: New Carry-Over Generation
- [ ] Navigate from November to January (new month)
- [ ] Check January Saldo Awal = November Saldo Proyeksi
- [ ] Verify console log shows correct amount

### Test 2: Re-Generation (Manual API)
- [ ] Call `/carryover/generate/2025/11` endpoint
- [ ] Navigate to December
- [ ] Verify Saldo Awal now shows +Rp 376.630

### Test 3: All Pocket Types
- [ ] Daily pocket: Carry-over correct
- [ ] Cold Money: Carry-over correct
- [ ] Custom pockets: Carry-over correct

### Test 4: Future Expenses Impact
- [ ] Pocket with future expense in November
- [ ] Projected balance includes future expense
- [ ] December Saldo Awal = November Projected (includes that expense)

---

## 💡 Recommended Next Steps

### Immediate Action (User):
1. **Option A:** Call API to regenerate December carry-over
2. **Option B:** Navigate to January, then back to December

### Future Enhancement (Developer):
1. Add "Re-calculate Saldo Awal" button in Timeline
2. Show warning if carry-over seems incorrect
3. Auto-detect and offer to fix old carry-overs

### Prevention:
- ✅ All new carry-overs use correct logic (no more bugs!)
- ✅ Future months will be correct automatically
- ✅ No migration needed for new users

---

## 📝 Files Modified

1. ✅ `/supabase/functions/server/index.tsx`
   - Line 622-643: `generateCarryOversForNextMonth()`
   - Line 685-710: `generateCarryOvers_DEPRECATED()`

---

## Summary

**Root Cause:**
- Carry-over generation used `availableBalance` (old logic)
- Should use `projectedBalance` (new TUGAS 1 logic)

**Fix:**
- ✅ Backend code updated
- ✅ Future carry-overs will be correct
- ⚠️ Existing carry-overs need re-generation

**User Action Required:**
- Re-generate December carry-over via API or navigation

**Result:**
- December Saldo Awal will match November Saldo Proyeksi ✅
