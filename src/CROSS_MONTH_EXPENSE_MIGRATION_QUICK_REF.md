# 🔧 Cross-Month Expense Migration - Quick Reference

## Problem
**Old expenses tersimpan dengan key salah!**
- Oktober expense saved as `expense:2025-11:xxx` ❌
- Should be `expense:2025-10:xxx` ✅

## Solution Options

### Option A: Edit Individual Expense
**For regular users (simple!)**

1. Find expense in wrong month
2. Click edit
3. Click save (no need to change anything)
4. ✅ Auto-migrates to correct month!

---

### Option B: Bulk Migration
**For admins (fast!)**

#### Step 1: Preview (Dry Run)
```javascript
// Open browser console (F12)
await migrateExpenseKeys(2025, 11, true)
```

#### Step 2: Review Results
Look at the summary table - check `needsMigration` count

#### Step 3: Execute Migration
```javascript
await migrateExpenseKeys(2025, 11, false)
```

#### Bonus: Migrate All Months
```javascript
// Preview all months in 2025
await migrateAllMonths(2025, true)

// Execute
await migrateAllMonths(2025, false)
```

---

## Console Functions

| Function | Purpose |
|----------|---------|
| `migrateExpenseKeys(year, month, dryRun)` | Migrate single month |
| `migrateAllMonths(year, dryRun)` | Migrate all months |

**Always use `dryRun: true` first!**

---

## Expected Output

```
✅ Migration Dry Run
┌─────────────────┬───────┐
│     Summary     │ Value │
├─────────────────┼───────┤
│ scanned         │   25  │
│ needsMigration  │    5  │  ← How many need fixing
│ migrated        │    0  │  ← 0 in dry run
│ skipped         │   20  │  ← Already correct
│ errors          │    0  │
└─────────────────┴───────┘
```

---

## Safety Checklist

- [x] Always dry run first
- [x] Check `needsMigration` count
- [x] Review details table
- [x] Then run actual migration
- [x] Verify in UI

---

## Files Modified
- `/supabase/functions/server/index.tsx` - Edit endpoint + migration endpoint
- `/utils/migrate-expense-keys.ts` - Client utility
- `/App.tsx` - Import utility

---

**Status:** ✅ READY  
**Doc:** `/CROSS_MONTH_EXPENSE_EDIT_AND_MIGRATION_FIX.md`
