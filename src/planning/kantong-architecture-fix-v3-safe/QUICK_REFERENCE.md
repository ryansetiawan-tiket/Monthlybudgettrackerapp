# ⚡ QUICK REFERENCE - Kantong Architecture Fix V3

**Quick navigation untuk development workflow**

---

## 🎯 PROBLEM OVERVIEW

| Bug | Symptom | Root Cause | Fixed In |
|-----|---------|------------|----------|
| **Kantong Hilang** | Kantong custom menghilang saat bulan berganti | Per-month storage (`pocket:2025-11:*`) | FASE 1 |
| **Saldo Reset 0** | Saldo tidak carry-over ke bulan baru | Missing carry-over logic | FASE 2 |
| **Timeline Campur** | Timeline shows all months (tidak filter) | No month filter in query | FASE 3 |

---

## 🚀 FASE QUICK OVERVIEW

### **FASE 1: Persistence** (2 hours)
```
OLD: pocket:2025-11:custom_abc  ❌ (hilang tiap bulan)
NEW: pocket:global:custom_abc   ✅ (permanen)
```

**Files:**
- `/supabase/functions/server/index.tsx` - Add global registry functions
- No frontend changes needed! 🎉

**Verification:**
```bash
# Create pocket in Nov → Should exist in Dec
curl -X POST .../pockets/2025/11 -d '{"name":"Test"}'
curl .../pockets/2025/12  # ✅ "Test" should appear
```

---

### **FASE 2: Carry-Over** (3 hours)
```
Tipe 1 (Daily):  Saldo = Carry-over + Budget Baru
Tipe 2 (Cold):   Saldo = Carry-over only
Tipe 3 (Custom): Saldo = Carry-over only
```

**Files:**
- `/supabase/functions/server/index.tsx` - Refactor `calculatePocketBalance()`

**Verification:**
```javascript
// Nov: Budget 3M, Spend 2.8M → Sisa 200K
// Dec: Set Budget 3.2M
// Expected: Saldo Awal Dec = 3.4M (200K + 3.2M) ✅
```

---

### **FASE 3: Timeline UI** (2 hours)
```
OLD: Show all months (Oct+Nov+Dec)  ❌
NEW: Show current month only        ✅
     + "Saldo Awal" entry at top
```

**Files:**
- `/supabase/functions/server/index.tsx` - Filter by `monthKey`
- `/components/PocketTimeline.tsx` - Style "Saldo Awal" entry

**Verification:**
```
Timeline Dec:
  [Saldo Awal (Carry-over dari Nov): +Rp 500K]  ← New!
  [1 Des] Income Rp 200K
  [5 Des] Expense Rp 100K
  [10 Des] Transfer Rp 50K
  
  (No Oct/Nov transactions!) ✅
```

---

## 📋 DEVELOPMENT WORKFLOW

### **Step-by-Step:**

```bash
# 1. Read planning
cat /planning/kantong-architecture-fix-v3-safe/PLANNING.md

# 2. Start FASE 1
# → Implement global pocket registry
# → Test: Kantong tetap ada di bulan baru
# → Create FASE_1_COMPLETE.md

# 3. Start FASE 2
# → Implement carry-over logic
# → Test: Saldo carry-over akurat
# → Create FASE_2_COMPLETE.md

# 4. Start FASE 3
# → Filter timeline per bulan
# → Add "Saldo Awal" entry
# → Create FASE_3_COMPLETE.md

# 5. Final verification
# → Run all end-to-end tests
# → Create FINAL_VERIFICATION.md
```

---

## ✅ VERIFICATION CHECKLIST

### **Quick Test Matrix:**

| Test | FASE 1 | FASE 2 | FASE 3 |
|------|--------|--------|--------|
| Kantong tidak hilang bulan baru | ✅ | - | - |
| Saldo carry-over akurat | - | ✅ | - |
| Timeline filter per bulan | - | - | ✅ |
| "Saldo Awal" displayed | - | - | ✅ |
| No regressions | ✅ | ✅ | ✅ |

---

## 🔧 KEY FUNCTIONS TO MODIFY

### **FASE 1:**
```typescript
// /supabase/functions/server/index.tsx

// NEW functions:
+ getGlobalPockets()              // Fetch from pocket:global:*
+ createGlobalPocket()            // Save to pocket:global:*
+ updateGlobalPocket()            // Update global entry
+ archivePocket()                 // Soft delete

// UPDATED functions:
~ getPockets(monthKey)            // Now calls getGlobalPockets()

// DEPRECATED functions:
- getPockets_DEPRECATED(monthKey) // Old per-month logic
```

### **FASE 2:**
```typescript
// /supabase/functions/server/index.tsx

// UPDATED functions:
~ calculatePocketBalance()        // Add carry-over logic
+ getCarryOverForPocket()         // Helper to fetch carry-over
+ generateCarryOversForNextMonth() // Auto-generate on month end
+ checkCarryOverExists()          // Check if carry-over data exists

// UPDATED endpoints:
~ GET /pockets/:year/:month       // Auto-trigger carry-over generation
+ POST /carryover/generate/:y/:m  // Manual trigger
```

### **FASE 3:**
```typescript
// /supabase/functions/server/index.tsx

// UPDATED functions:
~ buildPocketTimeline()           // Add monthKey filter, add "Saldo Awal"

// /components/PocketTimeline.tsx

// UPDATED components:
~ renderTimelineEntry()           // Special styling for isCarryOver
+ EmptyTimelineState()            // Empty state for new months
```

---

## 🚨 CRITICAL REMINDERS

### **Before Each Fase:**
```
[ ] Read fase details in PLANNING.md
[ ] Backup data
[ ] Have rollback script ready
[ ] Clear console (clean start)
```

### **During Implementation:**
```
[ ] Follow steps exactly as written
[ ] Don't skip verification steps
[ ] Test each change before proceeding
[ ] Console.log for debugging
```

### **After Each Fase:**
```
[ ] Run ALL verification tests
[ ] Create FASE_X_COMPLETE.md
[ ] Document any issues found
[ ] Only proceed if ALL tests pass
```

---

## 🔥 EMERGENCY COMMANDS

### **If Things Go Wrong:**

```bash
# 1. STOP execution immediately
# Don't try to fix on the fly!

# 2. Check logs
# Look for error messages in console

# 3. Rollback
# Use scripts in PLANNING.md per fase

# 4. Restore from backup
# If rollback fails, restore data

# 5. Document & retry
# Fix issue, then start fase again
```

### **Rollback Scripts:**

**FASE 1 Rollback:**
```typescript
// Revert to old getPockets()
async function getPockets(monthKey: string): Promise<Pocket[]> {
  const pockets = await kv.getByPrefix(`pocket:${monthKey}:`);
  return pockets.length === 0 ? DEFAULT_POCKETS : pockets;
}
```

**FASE 2 Rollback:**
```typescript
// Revert to simple logic
async function calculatePocketBalance(pocketId: string, monthKey: string) {
  if (pocketId === POCKET_IDS.DAILY) {
    return budget.initialBudget + budget.carryover;
  } else {
    return sumOfIncomesThisMonth();
  }
}
```

**FASE 3 Rollback:**
```typescript
// Remove monthKey filter
function buildPocketTimeline(pocketId, monthKey, sortOrder, sharedData) {
  const allExpenses = expenses.filter(e => e.pocketId === pocketId);
  // No filtering, no "Saldo Awal"
  return buildOldTimeline(allExpenses);
}
```

---

## 📊 DATA STRUCTURES REFERENCE

### **Pocket (Global Registry):**
```typescript
Key: "pocket:global:custom_abc123"
Value: {
  id: "custom_abc123",
  name: "Investasi Saham",
  type: "custom",
  icon: "📈",
  color: "#10b981",
  order: 3,
  status: "active",
  createdAt: "2025-11-01T00:00:00Z"
}
```

### **Carry-Over Entry:**
```typescript
Key: "carryover:2025-12:pocket_cold_money"
Value: {
  id: "carryover_2025-12_pocket_cold_money",
  pocketId: "pocket_cold_money",
  fromMonth: "2025-11",
  toMonth: "2025-12",
  amount: 500000,
  breakdown: {
    originalAmount: 1000000,
    transferIn: 0,
    transferOut: 200000,
    expenses: 300000
  },
  calculatedAt: "2025-12-01T00:00:00Z"
}
```

### **Timeline Entry (Saldo Awal):**
```typescript
{
  id: "initial_pocket_cold_money_2025-12",
  type: "initial",
  date: "2025-12-01T00:00:00Z",
  description: "Saldo Awal (Carry-over dari November)",
  amount: 500000,
  balanceAfter: 500000,
  icon: "❄️",
  color: "#8b5cf6",
  metadata: {
    isCarryOver: true,
    fromMonth: "2025-11"
  }
}
```

---

## 🎯 TESTING SHORTCUTS

### **Quick Test: FASE 1**
```bash
# Create pocket
curl -X POST https://PROJECT.supabase.co/functions/v1/make-server-3adbeaf1/pockets/2025/11 \
  -H "Authorization: Bearer ANON_KEY" \
  -d '{"name":"Test Invest","type":"custom","icon":"📈"}'

# Check Nov
curl https://PROJECT.supabase.co/functions/v1/make-server-3adbeaf1/pockets/2025/11 \
  -H "Authorization: Bearer ANON_KEY"

# Check Dec (should still exist!)
curl https://PROJECT.supabase.co/functions/v1/make-server-3adbeaf1/pockets/2025/12 \
  -H "Authorization: Bearer ANON_KEY"
```

### **Quick Test: FASE 2**
```javascript
// In browser console:
// 1. Set Nov budget: Rp 3M
// 2. Add Nov expense: Rp 2.8M
// 3. Navigate to Dec
// 4. Set Dec budget: Rp 3.2M
// 5. Check balance: Should be Rp 3.4M (200K + 3.2M)
console.log('Saldo Awal Dec:', balances.get('pocket_daily').originalAmount);
// Expected: 3400000 ✅
```

### **Quick Test: FASE 3**
```javascript
// In browser console:
// 1. Open Timeline Desember
// 2. Check first entry
const timeline = await fetchTimeline('pocket_cold_money', '2025-12');
console.log(timeline[0]);
// Expected: 
// {
//   description: "Saldo Awal (Carry-over dari November)",
//   metadata: { isCarryOver: true }
// } ✅
```

---

## 📚 FULL DOCUMENTATION

**For complete details, see:**
- [PLANNING.md](./PLANNING.md) - Full implementation plan
- [README.md](./README.md) - Project overview
- [/guidelines/BACKWARD_COMPATIBILITY_RULES.md](/guidelines/BACKWARD_COMPATIBILITY_RULES.md)

---

**Last Updated:** November 9, 2025  
**Status:** 📋 PLANNING COMPLETE  
**Next:** Awaiting approval to start FASE 1
