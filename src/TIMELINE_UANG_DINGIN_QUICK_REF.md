# 🚀 Timeline Uang Dingin - Quick Reference

**Last Updated:** 10 November 2025  
**Status:** ✅ All bugs fixed

---

## ⚡ Quick Debug Guide

### Issue: Timeline shows wrong amounts (USD instead of IDR)
**Check:**
1. Which endpoint is being used?
   - ✅ Correct: `/make-server-3adbeaf1/timeline/:year/:month/:pocketId` (line 2808)
   - ❌ Wrong: `/make-server-3adbeaf1/timeline-OLD-DEPRECATED/...` (line 2209)

2. Income mapping in `generatePocketTimeline()` (line 1037-1038):
   ```typescript
   description: i.name,  // ✅ Correct
   amount: i.amountIDR - i.deduction,  // ✅ Correct
   ```

**Fix:** Endpoint should use `income.amountIDR` NOT `income.amount`

---

### Issue: Income names show generic "Pemasukan"
**Check:**
1. Income field mapping (line 1037):
   ```typescript
   description: i.name,  // ✅ Correct field
   ```

**Fix:** Use `income.name` NOT `income.description`

---

### Issue: Many transactions missing from timeline
**Check:**
1. Route conflicts - only ONE endpoint should have this route:
   ```typescript
   app.get("/make-server-3adbeaf1/timeline/:year/:month/:pocketId", ...)
   ```

2. Old endpoint should be deprecated (line 2209):
   ```typescript
   app.get("/make-server-3adbeaf1/timeline-OLD-DEPRECATED/:year/:month/:pocketId", ...)
   ```

**Fix:** Deprecate old endpoint to avoid route conflicts

---

## 📍 Key Code Locations

### Active Endpoint (✅ USE THIS)
**File:** `/supabase/functions/server/index.tsx`  
**Line:** ~2808  
**Function:** Uses `generatePocketTimeline()`  
**Features:**
- ✅ Auto carry-over system
- ✅ Correct field mapping
- ✅ Consistent with FASE 3 architecture

### Deprecated Endpoint (❌ DO NOT USE)
**File:** `/supabase/functions/server/index.tsx`  
**Line:** ~2209  
**Route:** `/timeline-OLD-DEPRECATED/...`  
**Why deprecated:**
- ❌ Manual carry-over calculation
- ❌ Had field mapping bugs
- ❌ Not using `generatePocketTimeline()`

### Income Data Structure
```typescript
{
  id: string,
  name: string,           // ✅ Use this for description
  amount: number,         // ⚠️ Legacy field (USD)
  amountUSD: number,      // Proper USD field
  amountIDR: number,      // ✅ Use this for timeline amount
  deduction: number,      // Must subtract from amountIDR
  exchangeRate: number,
  pocketId: string,
  date: string
}
```

---

## 🔍 Debugging Commands

### 1. Check which endpoint is handling timeline requests
```bash
# In browser console after opening timeline
# Look for this log:
"[TIMELINE] Error in GET /timeline:"  # ✅ New endpoint
"[TIMELINE] Error:"                   # ❌ Old endpoint
```

### 2. Verify income data structure
```typescript
// In server logs when income is created
console.log('Income data:', {
  name: incomeData.name,           // Should have value
  amountUSD: incomeData.amountUSD, // USD amount
  amountIDR: incomeData.amountIDR, // IDR amount (larger!)
  deduction: incomeData.deduction
});
```

### 3. Check timeline entry mapping
```typescript
// In generatePocketTimeline (line 1033-1046)
console.log('Income entry:', {
  description: i.name,  // Should show actual name
  amount: i.amountIDR - i.deduction,  // Should be large number (IDR)
  metadata: {
    amountUSD: i.amountUSD,  // Small number (USD)
    exchangeRate: i.exchangeRate
  }
});
```

---

## ⚠️ Common Mistakes

### Mistake 1: Using wrong field for amount
```typescript
❌ amount: income.amount         // This is USD!
❌ amount: income.amountUSD      // This is also USD!
✅ amount: income.amountIDR - income.deduction  // Correct!
```

### Mistake 2: Using wrong field for description
```typescript
❌ description: income.description  // Field doesn't exist!
✅ description: income.name          // Correct!
```

### Mistake 3: Not handling backward compatibility
```typescript
❌ const pocketId = i.pocketId  // Might be undefined in old data
✅ const pocketId = i.pocketId || POCKET_IDS.COLD_MONEY  // Safe!
```

### Mistake 4: Duplicate routes
```typescript
❌ // Two endpoints with same route (conflict!)
app.get("/timeline/:year/:month/:pocketId", ...)  // First
app.get("/timeline/:year/:month/:pocketId", ...)  // Second (never called!)

✅ // Only one active endpoint
app.get("/timeline/:year/:month/:pocketId", ...)  // Active
app.get("/timeline-OLD-DEPRECATED/:year/:month/:pocketId", ...)  // Deprecated
```

---

## 📊 Testing Matrix

| Test Case | Input | Expected Output | Status |
|-----------|-------|-----------------|--------|
| Income $32 (rate 15.500) | amountUSD: 32, amountIDR: 496.000, deduction: 1.000 | +Rp 495.000 | ✅ |
| Income "Fiverr" | name: "Fiverr" | Description: "Fiverr" | ✅ |
| Multiple incomes | 7 entries in DB | 7 entries in timeline | ✅ |
| Old data (no pocketId) | pocketId: undefined | Default to Cold Money | ✅ |
| Deduction handling | deduction: 1.000 | Subtracted from amount | ✅ |

---

## 🎯 Quick Fix Checklist

When timeline shows wrong data:

1. [ ] Check endpoint route (should be line 2808, NOT 2209)
2. [ ] Verify `generatePocketTimeline()` is being called
3. [ ] Check income field mapping: `i.name` and `i.amountIDR`
4. [ ] Confirm deduction is subtracted: `i.amountIDR - i.deduction`
5. [ ] Test with real data (not just mock data)
6. [ ] Check for duplicate route definitions
7. [ ] Verify carry-over calculation uses `getCarryOverForPocket()`

---

## 📁 Documentation Links

- **Main Fix Doc:** `/TIMELINE_UANG_DINGIN_BUG_FIX_COMPLETE.md`
- **Auto Carry-Over:** `/SALDO_AWAL_FIX_V2_COMPLETE.md`
- **FASE 3 Architecture:** `/planning/kantong-architecture-fix-v3-safe/`

---

## 💡 Pro Tips

1. **Always use the new endpoint** - It's integrated with auto carry-over
2. **Never modify the deprecated endpoint** - It exists only for reference
3. **Test with real USD/IDR conversions** - Mock data might hide bugs
4. **Check server logs** - Look for `[TIMELINE]` prefix messages
5. **Verify field names** - `name` vs `description`, `amountIDR` vs `amount`

---

**Need help? Check the main documentation or server logs! 🚀**
