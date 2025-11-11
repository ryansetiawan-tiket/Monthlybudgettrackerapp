# ⚠️ DEPRECATED - DO NOT USE

**Date:** November 10, 2025  
**Reason:** Wrong Architecture (All-Time Ledger Model)  
**Superseded By:** `/planning/monthly-statement-refactor-v2-final/`

---

## ❌ This Hotfix Was WRONG

**What This Did:**
- Created `/timeline/all/:pocketId` endpoint
- Fetched ALL transactions from ALL months
- Displayed continuous timeline across month boundaries
- Calculated Saldo Awal cumulatively from beginning

**Why It Was Wrong:**
1. ❌ Violates "Monthly Statement" mental model
2. ❌ Filter bulan tidak control data yang ditampilkan
3. ❌ Saldo Awal tidak jelas (cumulative dari kapan?)
4. ❌ Performance issue (fetch ALL data every time)
5. ❌ Tidak match dengan real-world accounting practices

---

## ✅ Correct Approach

**See:** `/planning/monthly-statement-refactor-v2-final/`

**What It Does:**
- Uses `/timeline/:year/:month/:pocketId` endpoint (month-scoped)
- Fetches ONLY current month transactions
- Calculates Saldo Awal = carry-over from previous months
- Follows "Monthly Statement" model (like bank statements)

**Benefits:**
- ✅ Filter bulan controls ALL data
- ✅ Saldo Awal jelas (carry-over from previous month)
- ✅ Fast performance (only 1 month data)
- ✅ Matches user mental model
- ✅ Correct accounting practice

---

## 🔄 Migration

**If You See References to `/timeline/all/:pocketId`:**
1. REMOVE them
2. Replace with `/timeline/:year/:month/:pocketId`
3. Update logic to use month-scoped approach

**Files to Check:**
- `/supabase/functions/server/index.tsx` - Should NOT have `/timeline/all/` endpoint
- `/components/PocketTimeline.tsx` - Should use `/timeline/${year}/${month}/${pocketId}`
- `/components/PocketsSummary.tsx` - Should use month-scoped prefetch

---

## 📚 Documentation

**Current (Correct):**
- `/planning/monthly-statement-refactor-v2-final/PLANNING.md`
- `/planning/monthly-statement-refactor-v2-final/IMPLEMENTATION_COMPLETE.md`
- `/planning/monthly-statement-refactor-v2-final/QUICK_REFERENCE.md`

**Deprecated (Wrong):**
- `/planning/timeline-hotfix-logic/PLANNING.md` ❌
- `/planning/timeline-hotfix-logic/IMPLEMENTATION_COMPLETE.md` ❌
- `/planning/timeline-hotfix-logic/QUICK_REFERENCE.md` ❌

---

## 🎓 Lesson Learned

**"Quick fixes that violate architecture principles are NOT fixes - they're technical debt."**

Always question:
1. Does this match user mental model?
2. Does this follow app architecture?
3. Is this scalable?
4. Would I explain this approach in documentation proudly?

If answer is "No" → It's probably wrong!

---

**Status:** 🚫 **DEPRECATED - DO NOT USE**  
**Use Instead:** `/planning/monthly-statement-refactor-v2-final/`
