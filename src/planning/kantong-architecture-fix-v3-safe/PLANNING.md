# 🏗️ KANTONG ARCHITECTURE FIX V3 - SAFE PLANNING

**Status:** 📋 PLANNING  
**Risk Level:** 🔴 **SANGAT TINGGI** (Menyentuh core logic saldo aplikasi)  
**Created:** November 9, 2025  
**Last Updated:** November 9, 2025

---

## ⚠️ CRITICAL WARNING

**INI ADALAH REFACTOR ARSITEKTUR CORE YANG SANGAT BERISIKO!**

- ✋ **JANGAN** ambil jalan pintas
- ✋ **JANGAN** skip langkah verifikasi
- ✋ **JANGAN** langsung implement tanpa planning matang
- ✋ **JANGAN** ubah multiple components sekaligus tanpa testing
- ✅ **HARUS** bekerja metodis, hati-hati, dan sistematis
- ✅ **HARUS** verifikasi setiap fase sebelum lanjut
- ✅ **HARUS** backup data before major changes

**Jika logic salah → 100% data saldo RUSAK! 🔥**

---

## 📊 CURRENT STATE ANALYSIS

### **Current Problems (Bug yang Harus Diperbaiki):**

#### **Problem 1: Kantong "Hilang" Saat Bulan Berganti** ❌
**Symptom:**
- User membuat kantong custom "Investasi" di November
- Saat pindah ke Desember, kantong "Investasi" HILANG
- Kantong harus dibuat ulang setiap bulan

**Root Cause:**
```typescript
// File: /supabase/functions/server/index.tsx
// Line ~260: getPockets() function

// ❌ CURRENT LOGIC (WRONG):
async function getPockets(monthKey: string): Promise<Pocket[]> {
  // Fetch pockets dari KV store dengan prefix SPECIFIC ke bulan
  const pockets = await kv.getByPrefix(`pocket:${monthKey}:`);
  
  // Jika tidak ada → return default pockets
  if (pockets.length === 0) {
    return DEFAULT_POCKETS;
  }
  
  return pockets;
}

// PROBLEM: 
// - Kantong disimpan dengan key "pocket:2025-11:custom_abc123"
// - Saat query Desember, query "pocket:2025-12:*" → TIDAK KETEMU!
// - Kantong custom hilang setiap bulan berganti
```

#### **Problem 2: Saldo Reset ke 0 Setiap Bulan** ❌
**Symptom:**
- November: Kantong "Uang Dingin" punya saldo Rp 500.000
- Desember: Saldo "Uang Dingin" jadi Rp 0 (padahal harusnya carry over)

**Root Cause:**
```typescript
// File: /supabase/functions/server/index.tsx
// Line ~290: calculatePocketBalance() function

// ❌ CURRENT LOGIC (WRONG untuk Tipe 2 & 3):
if (pocketId === POCKET_IDS.DAILY) {
  // Tipe 1: Budget Awal + Carryover manual ✅ (ini BENAR)
  originalAmount = budget.initialBudget + budget.carryover;
} else if (pocketId === POCKET_IDS.COLD_MONEY) {
  // Tipe 2: Hanya dari income bulan ini ❌ (ini SALAH!)
  originalAmount = sumOfIncomes(currentMonth);
  // PROBLEM: Saldo bulan lalu HILANG!
} else {
  // Tipe 3: Auto carry-over ✅ (ada logic, tapi...)
  const carryOver = carryOvers.find(co => co.pocketId === pocketId);
  originalAmount = carryOver?.amount || 0;
  // PROBLEM: Tidak jalan karena kantong hilang (Problem 1)!
}
```

#### **Problem 3: Timeline Tidak Filter Per Bulan** ❌
**Symptom:**
- User buka Timeline "Uang Dingin" di Desember
- Muncul SEMUA transaksi dari Oktober, November, Desember (campur aduk)
- Harusnya HANYA tampilkan transaksi Desember

**Root Cause:**
```typescript
// File: /components/PocketTimeline.tsx
// ❌ CURRENT LOGIC:
// Fetch semua transaksi tanpa filter bulan
const allTransactions = await fetchAllTransactions(pocketId);
// Tidak ada filter: .filter(t => t.month === currentMonth)
```

---

## 🎯 GOALS & SUCCESS CRITERIA

### **FASE 1 Goals:**
- ✅ Kantong PERMANEN (tidak hilang saat bulan berganti)
- ✅ Kantong PERSISTEN (tidak hilang saat saldo = 0)
- ✅ Kantong hanya bisa dihapus dengan user action eksplisit

### **FASE 2 Goals:**
- ✅ Tipe 1 (Sehari-hari): Zero-Based Budgeting = Sisa + Budget Baru
- ✅ Tipe 2 (Uang Dingin): Simple Carry-Over = Saldo Akhir Bulan Lalu
- ✅ Tipe 3 (Custom): Simple Carry-Over = Saldo Akhir Bulan Lalu

### **FASE 3 Goals:**
- ✅ Timeline filter per bulan (hanya transaksi bulan aktif)
- ✅ Item "Saldo Awal" di top timeline (menampilkan carry-over)
- ✅ UI/UX clean dan mudah dipahami

---

## 📐 ARCHITECTURE DESIGN

### **New Data Model: Pocket Storage (Fase 1)**

```typescript
// ❌ OLD (Per-Month Storage):
// Key: "pocket:2025-11:custom_abc123"
// Problem: Hilang saat bulan berganti

// ✅ NEW (Global Pocket Registry):
// Key: "pocket:global:custom_abc123"
// Benefits: PERMANEN, tidak terikat bulan

interface PocketMetadata {
  id: string;              // "custom_abc123"
  name: string;            // "Investasi Saham"
  type: PocketType;        // "primary" | "custom"
  icon?: string;           // "📈"
  color?: string;          // "#10b981"
  order: number;           // 3
  createdAt: string;       // ISO date
  status: "active" | "archived";
  archivedAt?: string;
  enableWishlist?: boolean;
}

// Storage Strategy:
// 1. Global Registry: "pocket:global:*" → All pocket definitions
// 2. Month-Specific: "pocket:2025-11:*" → DEPRECATED (remove)
// 3. Balance Still Per-Month: Calculated on-demand
```

### **New Data Model: Carry-Over Logic (Fase 2)**

```typescript
// Carry-Over Entry (sudah ada, tapi perlu diperbaiki)
interface CarryOverEntry {
  id: string;                    // "carryover_2025-12_pocket_cold_money"
  pocketId: string;              // "pocket_cold_money"
  fromMonth: string;             // "2025-11"
  toMonth: string;               // "2025-12"
  amount: number;                // Rp 500.000 (saldo akhir Nov)
  breakdown: {
    originalAmount: number;      // Total income Nov
    transferIn: number;          // Transfer masuk Nov
    transferOut: number;         // Transfer keluar Nov
    expenses: number;            // Total pengeluaran Nov
  };
  calculatedAt: string;          // ISO timestamp
}

// Storage:
// Key: "carryover:2025-12:pocket_cold_money"
```

### **Calculation Logic Per Pocket Type (Fase 2)**

```typescript
/**
 * TIPE 1: SEHARI-HARI (Zero-Based Budgeting)
 * 
 * Formula Saldo Awal Desember:
 * = Sisa Saldo November + Budget Awal Desember
 * 
 * Example:
 * - Budget Nov: Rp 3.000.000
 * - Sisa Nov: Rp 200.000 (carryover)
 * - Budget Des (new): Rp 3.200.000 (user input di modal)
 * → Saldo Awal Des = Rp 200.000 + Rp 3.200.000 = Rp 3.400.000
 */
function calculateDailySaldoAwal(
  previousMonthBalance: number,  // Rp 200.000
  newMonthBudget: number          // Rp 3.200.000 (from modal)
): number {
  return previousMonthBalance + newMonthBudget;
}

/**
 * TIPE 2: UANG DINGIN (Simple Carry-Over)
 * 
 * Formula Saldo Awal Desember:
 * = Saldo Akhir November
 * 
 * Example:
 * - Saldo Akhir Nov: Rp 500.000
 * → Saldo Awal Des = Rp 500.000
 * 
 * Note: Income baru Desember ditambahkan TERPISAH (bukan di saldo awal)
 */
function calculateColdMoneySaldoAwal(
  previousMonthBalance: number   // Rp 500.000
): number {
  return previousMonthBalance;
}

/**
 * TIPE 3: CUSTOM POCKETS (Simple Carry-Over)
 * 
 * Formula Saldo Awal Desember:
 * = Saldo Akhir November
 * 
 * Example:
 * - Kantong "Investasi" Saldo Akhir Nov: Rp 1.000.000
 * → Saldo Awal Des = Rp 1.000.000
 */
function calculateCustomPocketSaldoAwal(
  previousMonthBalance: number   // Rp 1.000.000
): number {
  return previousMonthBalance;
}
```

### **Timeline Data Structure (Fase 3)**

```typescript
interface TimelineEntry {
  id: string;
  type: 'initial' | 'income' | 'expense' | 'transfer';
  date: string;              // ISO date
  description: string;
  amount: number;
  balanceAfter: number;
  icon: string;
  color: string;
  metadata?: any;
  isCarryOver?: boolean;     // NEW: Flag for "Saldo Awal" entry
}

// Timeline for Desember 2025:
// [
//   {
//     id: "initial_2025-12_pocket_cold_money",
//     type: "initial",
//     date: "2025-12-01T00:00:00Z",
//     description: "Saldo Awal (Carry-over dari November)",
//     amount: 500000,
//     balanceAfter: 500000,
//     icon: "💰",
//     color: "#10b981",
//     isCarryOver: true
//   },
//   { /* Transaksi Desember 1 */ },
//   { /* Transaksi Desember 5 */ },
//   { /* Transaksi Desember 10 */ },
//   ...
// ]
```

---

## 🚀 IMPLEMENTATION PHASES

---

## **FASE 1: KANTONG PERSISTENCE** 🔧

### **Objective:**
Memastikan kantong adalah entitas permanen yang TIDAK hilang saat bulan berganti atau saldo = 0.

### **Scope:**
- Backend: Refactor pocket storage dari per-month ke global registry
- Backend: Update API endpoints untuk support global pockets
- Frontend: Update hooks untuk fetch dari global registry
- Testing: Verifikasi kantong tetap ada saat bulan berganti

---

### **FASE 1.1: Backend - Global Pocket Registry**

#### **Files to Modify:**
1. `/supabase/functions/server/index.tsx`

#### **Changes:**

**1.1.1 - Create Global Pocket Management Functions**

```typescript
// Location: Line ~200 (after type definitions)

/**
 * Get all pockets from GLOBAL registry (not month-specific)
 * ✅ NEW APPROACH: Pockets are permanent entities
 */
async function getGlobalPockets(): Promise<Pocket[]> {
  try {
    const pockets = await kv.getByPrefix('pocket:global:');
    
    if (pockets.length === 0) {
      // First time setup: Initialize default pockets
      await initializeDefaultPockets();
      return DEFAULT_POCKETS;
    }
    
    // Sort by order
    return pockets.sort((a: Pocket, b: Pocket) => a.order - b.order);
  } catch (error) {
    console.error('Error fetching global pockets:', error);
    return DEFAULT_POCKETS;
  }
}

/**
 * Initialize default pockets in global registry
 */
async function initializeDefaultPockets(): Promise<void> {
  const promises = DEFAULT_POCKETS.map(pocket => 
    kv.set(`pocket:global:${pocket.id}`, pocket)
  );
  await Promise.all(promises);
}

/**
 * Create a new pocket in GLOBAL registry
 */
async function createGlobalPocket(pocket: Pocket): Promise<Pocket> {
  await kv.set(`pocket:global:${pocket.id}`, pocket);
  return pocket;
}

/**
 * Update a pocket in GLOBAL registry
 */
async function updateGlobalPocket(
  pocketId: string, 
  updates: Partial<Pocket>
): Promise<Pocket> {
  const existing = await kv.get(`pocket:global:${pocketId}`);
  if (!existing) {
    throw new Error(`Pocket ${pocketId} not found`);
  }
  
  const updated = { ...existing, ...updates };
  await kv.set(`pocket:global:${pocketId}`, updated);
  return updated;
}

/**
 * Delete pocket (soft delete - archive)
 */
async function archivePocket(pocketId: string): Promise<void> {
  await updateGlobalPocket(pocketId, {
    status: 'archived',
    archivedAt: new Date().toISOString()
  });
}

/**
 * Get active pockets only
 */
async function getActivePockets(): Promise<Pocket[]> {
  const allPockets = await getGlobalPockets();
  return allPockets.filter(p => p.status !== 'archived');
}
```

**1.1.2 - Deprecate Old getPockets() Function**

```typescript
// Location: Find existing getPockets() function (~line 260)

// ❌ DEPRECATED - DO NOT USE
// This function fetches per-month pockets (causes "hilang" bug)
async function getPockets_DEPRECATED(monthKey: string): Promise<Pocket[]> {
  // Keep for backward compatibility during migration
  // Will be removed in Phase 2
  const pockets = await kv.getByPrefix(`pocket:${monthKey}:`);
  if (pockets.length === 0) {
    return DEFAULT_POCKETS;
  }
  return pockets;
}

// ✅ NEW - Use this instead
async function getPockets(monthKey: string): Promise<Pocket[]> {
  // Month parameter kept for API compatibility
  // But now we fetch from global registry
  return await getActivePockets();
}
```

**1.1.3 - Update API Endpoints**

```typescript
// Location: Find pocket endpoints (~line 1800+)

// GET /pockets/:year/:month
// ✅ UPDATED to use global registry
app.get("/make-server-3adbeaf1/pockets/:year/:month", async (c) => {
  try {
    const year = c.req.param("year");
    const month = c.req.param("month");
    const monthKey = `${year}-${month}`;
    
    // ✅ NEW: Fetch from global registry (not per-month)
    const pockets = await getActivePockets();
    
    // Calculate balances (still per-month)
    const balances = await Promise.all(
      pockets.map(async (pocket) => {
        return await calculatePocketBalance(pocket.id, monthKey);
      })
    );
    
    return c.json({
      success: true,
      data: { pockets, balances }
    });
  } catch (error: any) {
    console.error('Error in GET /pockets:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST /pockets/:year/:month
// ✅ UPDATED to save to global registry
app.post("/make-server-3adbeaf1/pockets/:year/:month", async (c) => {
  try {
    const body = await c.req.json();
    const { name, type, icon, color } = body;
    
    // Generate unique ID
    const id = `pocket_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    
    // Get current order
    const existingPockets = await getActivePockets();
    const maxOrder = Math.max(...existingPockets.map(p => p.order), 0);
    
    const newPocket: Pocket = {
      id,
      name,
      type: type || 'custom',
      icon,
      color,
      order: maxOrder + 1,
      createdAt: new Date().toISOString(),
      status: 'active',
      enableWishlist: type !== 'primary'
    };
    
    // ✅ NEW: Save to global registry
    await createGlobalPocket(newPocket);
    
    return c.json({
      success: true,
      data: { pocket: newPocket }
    });
  } catch (error: any) {
    console.error('Error in POST /pockets:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PUT /pockets/:year/:month/:pocketId
// ✅ UPDATED to update global registry
app.put("/make-server-3adbeaf1/pockets/:year/:month/:pocketId", async (c) => {
  try {
    const pocketId = c.req.param("pocketId");
    const updates = await c.req.json();
    
    // ✅ NEW: Update in global registry
    const updatedPocket = await updateGlobalPocket(pocketId, updates);
    
    return c.json({
      success: true,
      data: { pocket: updatedPocket }
    });
  } catch (error: any) {
    console.error('Error in PUT /pockets:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// DELETE /pockets/:year/:month/:pocketId
// ✅ UPDATED to archive (soft delete)
app.delete("/make-server-3adbeaf1/pockets/:year/:month/:pocketId", async (c) => {
  try {
    const pocketId = c.req.param("pocketId");
    
    // Prevent deletion of default pockets
    if (pocketId === POCKET_IDS.DAILY || pocketId === POCKET_IDS.COLD_MONEY) {
      return c.json({ 
        success: false, 
        error: 'Cannot delete default pockets' 
      }, 400);
    }
    
    // ✅ NEW: Soft delete (archive)
    await archivePocket(pocketId);
    
    return c.json({
      success: true,
      message: 'Pocket archived successfully'
    });
  } catch (error: any) {
    console.error('Error in DELETE /pockets:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});
```

---

### **FASE 1.2: Frontend - Update Hooks**

#### **Files to Modify:**
1. `/hooks/usePockets.ts`

#### **Changes:**

**No changes needed!** 🎉

Karena API contract tetap sama (`/pockets/:year/:month`), frontend hooks TIDAK perlu diubah. Backend transparently menggunakan global registry.

---

### **FASE 1.3: Data Migration (One-Time)**

#### **Migration Strategy:**

**Option A: Automatic Migration (Recommended)**
```typescript
// Add migration endpoint in server
app.post("/make-server-3adbeaf1/admin/migrate-pockets", async (c) => {
  try {
    // 1. Get all unique pocket IDs from all months
    const allKeys = await kv.getByPrefix('pocket:');
    const uniquePockets = new Map<string, Pocket>();
    
    for (const pocket of allKeys) {
      // Skip if already in global registry
      if (pocket.id.startsWith('pocket:global:')) continue;
      
      // Extract actual pocket data
      const pocketId = pocket.id.split(':')[2]; // "pocket:2025-11:custom_abc" → "custom_abc"
      
      if (!uniquePockets.has(pocketId)) {
        uniquePockets.set(pocketId, {
          ...pocket,
          id: pocketId,
          status: 'active'
        });
      }
    }
    
    // 2. Save to global registry
    const migrationPromises = Array.from(uniquePockets.values()).map(pocket => 
      kv.set(`pocket:global:${pocket.id}`, pocket)
    );
    await Promise.all(migrationPromises);
    
    return c.json({
      success: true,
      message: `Migrated ${uniquePockets.size} pockets to global registry`
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});
```

**Option B: Manual Migration**
- User creates pockets again in new system
- Old data preserved but not actively used

**Recommendation:** Use Option A for seamless transition.

---

### **FASE 1.4: Verification Steps**

#### **✅ Checklist:**

1. **Backend Tests:**
   ```bash
   # Test 1: Create pocket in November
   curl -X POST https://PROJECT_ID.supabase.co/functions/v1/make-server-3adbeaf1/pockets/2025/11 \
     -H "Authorization: Bearer ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{"name": "Test Investasi", "type": "custom", "icon": "📈"}'
   
   # Test 2: Fetch pockets in November
   curl https://PROJECT_ID.supabase.co/functions/v1/make-server-3adbeaf1/pockets/2025/11 \
     -H "Authorization: Bearer ANON_KEY"
   
   # Test 3: Fetch pockets in December (should still exist!)
   curl https://PROJECT_ID.supabase.co/functions/v1/make-server-3adbeaf1/pockets/2025/12 \
     -H "Authorization: Bearer ANON_KEY"
   
   # ✅ EXPECTED: "Test Investasi" muncul di November DAN December
   ```

2. **Frontend Tests:**
   - [ ] Create custom pocket "Investasi" in November
   - [ ] Navigate to December using MonthSelector
   - [ ] Verify "Investasi" pocket still visible
   - [ ] Check PocketsSummary shows all pockets
   - [ ] Verify balance calculated correctly

3. **Edge Cases:**
   - [ ] Create pocket with saldo Rp 0 → should NOT disappear
   - [ ] Archive pocket → should disappear from active list
   - [ ] Unarchive pocket → should reappear

4. **Regression Tests:**
   - [ ] Default pockets (Sehari-hari, Uang Dingin) still work
   - [ ] Can create/edit/delete custom pockets
   - [ ] Transfer between pockets still works
   - [ ] Timeline still displays correctly

#### **❌ Rollback Plan:**

If major issues occur:
```typescript
// Revert to old getPockets() function
async function getPockets(monthKey: string): Promise<Pocket[]> {
  const pockets = await kv.getByPrefix(`pocket:${monthKey}:`);
  if (pockets.length === 0) {
    return DEFAULT_POCKETS;
  }
  return pockets;
}
```

---

### **FASE 1.5: Documentation**

Create `/planning/kantong-architecture-fix-v3-safe/FASE_1_COMPLETE.md`:

```markdown
# ✅ FASE 1 COMPLETE: Kantong Persistence

## Changes Made:
1. Backend: Global pocket registry (`pocket:global:*`)
2. API: Updated all endpoints to use global registry
3. Migration: One-time migration script
4. Testing: All tests passed

## Verification:
- ✅ Kantong tidak hilang saat bulan berganti
- ✅ Kantong tidak hilang saat saldo = 0
- ✅ Archive/delete works correctly
- ✅ No regressions in existing features

## Next Steps:
→ FASE 2: Implement carry-over logic
```

---

## **FASE 2: CARRY-OVER LOGIC** 💰

### **Objective:**
Menerapkan aturan carry-over yang BENAR dan BERBEDA untuk setiap tipe kantong.

### **Scope:**
- Backend: Refactor balance calculation logic
- Backend: Implement proper carry-over for each pocket type
- Backend: Auto-calculate carry-over on month transition
- Frontend: Update modal "Budget Bulanan" untuk support new budget input
- Testing: Verifikasi saldo carry-over correct untuk semua tipe

---

### **FASE 2.1: Backend - Carry-Over Calculation**

#### **Files to Modify:**
1. `/supabase/functions/server/index.tsx`

#### **Changes:**

**2.1.1 - Refactor calculatePocketBalance()**

```typescript
// Location: Find existing calculatePocketBalance() (~line 280)

/**
 * Calculate pocket balance for a specific month
 * ✅ UPDATED: Proper carry-over logic per pocket type
 */
async function calculatePocketBalance(
  pocketId: string,
  monthKey: string
): Promise<PocketBalance> {
  // Fetch all required data
  const [budget, expenses, additionalIncome, transfers, excludeState, pocket] = await Promise.all([
    kv.get(`budget:${monthKey}`),
    kv.getByPrefix(`expense:${monthKey}:`),
    kv.getByPrefix(`income:${monthKey}:`),
    kv.getByPrefix(`transfer:${monthKey}:`),
    kv.get(`exclude-state:${monthKey}`),
    kv.get(`pocket:global:${pocketId}`) // ✅ NEW: Fetch from global registry
  ]);
  
  const excludedExpenseIds = new Set(excludeState?.excludedExpenseIds || []);
  const excludedIncomeIds = new Set(excludeState?.excludedIncomeIds || []);
  
  // Calculate original amount based on pocket type
  let originalAmount = 0;
  
  if (pocketId === POCKET_IDS.DAILY) {
    // ✅ TIPE 1: SEHARI-HARI (Zero-Based Budgeting)
    // Saldo Awal = Carry-over bulan lalu + Budget baru bulan ini
    const carryOver = await getCarryOverForPocket(pocketId, monthKey);
    const newBudget = budget?.initialBudget || 0;
    
    originalAmount = (carryOver?.amount || 0) + newBudget;
    
    console.log(`💰 [DAILY] Saldo Awal ${monthKey}:`, {
      carryOverFromPrevMonth: carryOver?.amount || 0,
      newMonthBudget: newBudget,
      totalSaldoAwal: originalAmount
    });
    
  } else if (pocketId === POCKET_IDS.COLD_MONEY) {
    // ✅ TIPE 2: UANG DINGIN (Simple Carry-Over)
    // Saldo Awal = Saldo akhir bulan lalu
    // Income bulan ini ditambahkan TERPISAH (bukan di saldo awal)
    const carryOver = await getCarryOverForPocket(pocketId, monthKey);
    
    originalAmount = carryOver?.amount || 0;
    
    console.log(`❄️ [COLD MONEY] Saldo Awal ${monthKey}:`, {
      carryOverFromPrevMonth: carryOver?.amount || 0,
      totalSaldoAwal: originalAmount
    });
    
  } else {
    // ✅ TIPE 3: CUSTOM POCKETS (Simple Carry-Over)
    // Saldo Awal = Saldo akhir bulan lalu
    const carryOver = await getCarryOverForPocket(pocketId, monthKey);
    
    originalAmount = carryOver?.amount || 0;
    
    console.log(`🎯 [CUSTOM: ${pocket?.name}] Saldo Awal ${monthKey}:`, {
      carryOverFromPrevMonth: carryOver?.amount || 0,
      totalSaldoAwal: originalAmount
    });
  }
  
  // Calculate transfers
  let transferIn = 0;
  let transferOut = 0;
  
  transfers.forEach((transfer: any) => {
    if (transfer.toPocketId === pocketId) {
      transferIn += transfer.amount;
    }
    if (transfer.fromPocketId === pocketId) {
      transferOut += transfer.amount;
    }
  });
  
  // Calculate expenses for this pocket
  const expensesTotal = expenses
    .filter((exp: any) => 
      exp.pocketId === pocketId && 
      !excludedExpenseIds.has(exp.id)
    )
    .reduce((sum: number, exp: any) => sum + exp.amount, 0);
  
  // Add income for this pocket (ONLY for Uang Dingin and Custom)
  let incomeTotal = 0;
  if (pocketId === POCKET_IDS.COLD_MONEY || pocket?.type === 'custom') {
    incomeTotal = additionalIncome
      .filter((income: any) => 
        income.pocketId === pocketId && 
        !excludedIncomeIds.has(income.id)
      )
      .reduce((sum: number, income: any) => sum + (income.amountIDR - income.deduction), 0);
  }
  
  // Final balance calculation
  const availableBalance = 
    originalAmount +      // Saldo awal (dengan carry-over yang benar)
    incomeTotal +         // Income bulan ini (untuk Tipe 2 & 3)
    transferIn -          // Transfer masuk
    transferOut -         // Transfer keluar
    expensesTotal;        // Pengeluaran
  
  return {
    pocketId,
    originalAmount,
    transferIn,
    transferOut,
    expenses: expensesTotal,
    availableBalance,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Get carry-over entry for a pocket
 * Helper function to fetch carry-over data
 */
async function getCarryOverForPocket(
  pocketId: string,
  monthKey: string
): Promise<CarryOverEntry | null> {
  try {
    const carryOver = await kv.get(`carryover:${monthKey}:${pocketId}`);
    return carryOver;
  } catch (error) {
    console.error(`Error fetching carry-over for ${pocketId}:`, error);
    return null;
  }
}
```

**2.1.2 - Auto-Generate Carry-Over on Month End**

```typescript
// Location: Add new function (~line 400)

/**
 * Generate carry-over entries for next month
 * Called automatically when user navigates to new month
 * OR can be called manually via cron job
 */
async function generateCarryOversForNextMonth(
  currentMonthKey: string  // e.g., "2025-11"
): Promise<void> {
  try {
    // Parse current month
    const [year, month] = currentMonthKey.split('-').map(Number);
    
    // Calculate next month
    const nextDate = new Date(year, month, 1); // month is 0-indexed in Date
    const nextMonthKey = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
    
    console.log(`🔄 Generating carry-overs: ${currentMonthKey} → ${nextMonthKey}`);
    
    // Get all active pockets
    const pockets = await getActivePockets();
    
    // Generate carry-over for each pocket
    const carryOverPromises = pockets.map(async (pocket) => {
      // Calculate final balance of current month
      const balance = await calculatePocketBalance(pocket.id, currentMonthKey);
      
      // Create carry-over entry
      const carryOver: CarryOverEntry = {
        id: `carryover_${nextMonthKey}_${pocket.id}`,
        pocketId: pocket.id,
        fromMonth: currentMonthKey,
        toMonth: nextMonthKey,
        amount: balance.availableBalance,
        breakdown: {
          originalAmount: balance.originalAmount,
          transferIn: balance.transferIn,
          transferOut: balance.transferOut,
          expenses: balance.expenses
        },
        calculatedAt: new Date().toISOString()
      };
      
      // Save carry-over
      await kv.set(`carryover:${nextMonthKey}:${pocket.id}`, carryOver);
      
      console.log(`✅ Carry-over saved: ${pocket.name} (${pocket.id})`, {
        from: currentMonthKey,
        to: nextMonthKey,
        amount: carryOver.amount
      });
      
      return carryOver;
    });
    
    await Promise.all(carryOverPromises);
    
    console.log(`🎉 All carry-overs generated for ${nextMonthKey}`);
  } catch (error) {
    console.error('Error generating carry-overs:', error);
    throw error;
  }
}

/**
 * Endpoint to manually trigger carry-over generation
 */
app.post("/make-server-3adbeaf1/carryover/generate/:year/:month", async (c) => {
  try {
    const year = c.req.param("year");
    const month = c.req.param("month");
    const monthKey = `${year}-${month}`;
    
    await generateCarryOversForNextMonth(monthKey);
    
    return c.json({
      success: true,
      message: `Carry-overs generated for next month after ${monthKey}`
    });
  } catch (error: any) {
    console.error('Error in POST /carryover/generate:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});
```

**2.1.3 - Auto-Trigger Carry-Over on Month Navigation**

```typescript
// Update existing GET /pockets/:year/:month endpoint

app.get("/make-server-3adbeaf1/pockets/:year/:month", async (c) => {
  try {
    const year = c.req.param("year");
    const month = c.req.param("month");
    const monthKey = `${year}-${month}`;
    
    // ✅ NEW: Auto-generate carry-over if not exists
    // Check if this is a new month (no carry-over data yet)
    const hasCarryOvers = await checkCarryOverExists(monthKey);
    
    if (!hasCarryOvers) {
      // Calculate previous month
      const [y, m] = monthKey.split('-').map(Number);
      const prevDate = new Date(y, m - 2, 1); // m-2 because month is 1-indexed
      const prevMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
      
      console.log(`🔄 First time accessing ${monthKey}, generating carry-overs from ${prevMonthKey}`);
      
      try {
        await generateCarryOversForNextMonth(prevMonthKey);
      } catch (error) {
        console.warn('Could not generate carry-overs (maybe first month):', error);
      }
    }
    
    // Fetch pockets and balances
    const pockets = await getActivePockets();
    const balances = await Promise.all(
      pockets.map(async (pocket) => {
        return await calculatePocketBalance(pocket.id, monthKey);
      })
    );
    
    return c.json({
      success: true,
      data: { pockets, balances }
    });
  } catch (error: any) {
    console.error('Error in GET /pockets:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * Check if carry-over data exists for a month
 */
async function checkCarryOverExists(monthKey: string): Promise<boolean> {
  const carryOvers = await kv.getByPrefix(`carryover:${monthKey}:`);
  return carryOvers.length > 0;
}
```

---

### **FASE 2.2: Frontend - Budget Modal Update**

#### **Files to Modify:**
1. `/components/BudgetForm.tsx`

#### **Changes:**

**2.2.1 - Add New Budget Input for Desember**

```typescript
// No changes needed in form component!
// Logic sudah ada di backend untuk:
// - Fetch carry-over otomatis
// - Calculate saldo awal with carry-over + new budget
// - User tetap input "Budget Awal" di modal seperti biasa
```

**Why no changes needed?**
- User flow tetap sama: Input "Budget Awal Rp 3.200.000" di modal
- Backend yang handle: "Saldo Awal = Carry-over (Rp 200K) + Budget Baru (Rp 3.2M)"
- Transparent untuk user! 🎉

---

### **FASE 2.3: Verification Steps**

#### **✅ Checklist:**

1. **Backend Tests:**
   ```bash
   # Setup: Create data in November
   # - Budget Awal: Rp 3.000.000
   # - Pengeluaran: Rp 2.800.000
   # - Sisa: Rp 200.000
   
   # Test 1: Generate carry-over
   curl -X POST https://PROJECT_ID.supabase.co/functions/v1/make-server-3adbeaf1/carryover/generate/2025/11 \
     -H "Authorization: Bearer ANON_KEY"
   
   # Test 2: Check carry-over data
   curl https://PROJECT_ID.supabase.co/functions/v1/make-server-3adbeaf1/carryover/2025/12 \
     -H "Authorization: Bearer ANON_KEY"
   
   # ✅ EXPECTED: 
   # {
   #   "pocketId": "pocket_daily",
   #   "amount": 200000,
   #   "fromMonth": "2025-11",
   #   "toMonth": "2025-12"
   # }
   
   # Test 3: Set budget Desember = Rp 3.200.000
   # Test 4: Fetch balance Desember
   curl https://PROJECT_ID.supabase.co/functions/v1/make-server-3adbeaf1/pockets/2025/12 \
     -H "Authorization: Bearer ANON_KEY"
   
   # ✅ EXPECTED: 
   # Saldo Awal = Rp 3.400.000 (200K carry-over + 3.2M budget)
   ```

2. **Frontend Tests - Tipe 1 (Sehari-hari):**
   - [ ] November: Budget Rp 3M, Pengeluaran Rp 2.8M → Sisa Rp 200K
   - [ ] Navigate to Desember
   - [ ] Input Budget Baru: Rp 3.2M di modal
   - [ ] Check BudgetOverview: Should show Rp 3.4M (200K + 3.2M)
   - [ ] Check Timeline: "Saldo Awal" should show Rp 3.4M

3. **Frontend Tests - Tipe 2 (Uang Dingin):**
   - [ ] November: Income Rp 1M, Pengeluaran Rp 500K → Sisa Rp 500K
   - [ ] Navigate to Desember
   - [ ] Check balance: Should start at Rp 500K (carry-over)
   - [ ] Add income Rp 200K in Desember
   - [ ] Balance should be Rp 700K (500K carry + 200K income)

4. **Frontend Tests - Tipe 3 (Custom Pockets):**
   - [ ] Create "Investasi" pocket in November
   - [ ] Add income Rp 1M to Investasi
   - [ ] Pengeluaran Rp 300K
   - [ ] Sisa November: Rp 700K
   - [ ] Navigate to Desember
   - [ ] Check Investasi balance: Should be Rp 700K (carry-over)

5. **Edge Cases:**
   - [ ] Negative balance carry-over (hutang) → Should carry over correctly
   - [ ] Zero balance → Should show Rp 0 in next month
   - [ ] First month (no previous data) → Should use initial budget only

#### **❌ Rollback Plan:**

If calculation errors occur:
```typescript
// Revert to simple logic (no carry-over)
async function calculatePocketBalance(pocketId: string, monthKey: string) {
  if (pocketId === POCKET_IDS.DAILY) {
    return budget.initialBudget + budget.carryover; // Manual carryover only
  } else {
    return sumOfIncomesThisMonth(); // No carry-over
  }
}
```

---

### **FASE 2.4: Documentation**

Create `/planning/kantong-architecture-fix-v3-safe/FASE_2_COMPLETE.md`:

```markdown
# ✅ FASE 2 COMPLETE: Carry-Over Logic

## Changes Made:
1. Backend: Refactored calculatePocketBalance() with proper carry-over
2. Backend: Auto-generate carry-over on month navigation
3. Logic: Tipe 1 = Zero-Based, Tipe 2/3 = Simple Carry-Over
4. Testing: All scenarios verified

## Verification:
- ✅ Tipe 1: Saldo = Carry-over + Budget Baru
- ✅ Tipe 2: Saldo = Carry-over only
- ✅ Tipe 3: Saldo = Carry-over only
- ✅ Auto-generation works on month navigation
- ✅ No regressions in balance calculation

## Next Steps:
→ FASE 3: Update Timeline UI
```

---

## **FASE 3: TIMELINE UI REFACTOR** 🎨

### **Objective:**
Memastikan timeline kantong clean, filtered per bulan, dan menampilkan "Saldo Awal" dengan jelas.

### **Scope:**
- Backend: Filter timeline per bulan
- Backend: Add "Saldo Awal" entry at top
- Frontend: Display initial balance entry
- Frontend: Improve UX for clarity
- Testing: Verify timeline shows correct data

---

### **FASE 3.1: Backend - Timeline Filtering**

#### **Files to Modify:**
1. `/supabase/functions/server/index.tsx`

#### **Changes:**

**3.1.1 - Update buildPocketTimeline() Function**

```typescript
// Location: Find existing buildPocketTimeline() (~line 637)

/**
 * Build pocket timeline with proper month filtering
 * ✅ UPDATED: Only show transactions from current month + Saldo Awal
 */
function buildPocketTimeline(
  pocketId: string,
  monthKey: string,
  sortOrder: 'asc' | 'desc',
  sharedData: any
): TimelineEntry[] {
  const { budget, expenses, additionalIncome, transfers, excludeState, pockets } = sharedData;
  
  const excludedExpenseIds = new Set(excludeState?.excludedExpenseIds || []);
  const excludedIncomeIds = new Set(excludeState?.excludedIncomeIds || []);
  
  const pocket = pockets.find((p: Pocket) => p.id === pocketId);
  const allTransactions: TimelineEntry[] = [];
  
  // ========================================
  // 1️⃣ ADD "SALDO AWAL" ENTRY (TOP OF TIMELINE)
  // ========================================
  
  const carryOver = await getCarryOverForPocket(pocketId, monthKey);
  
  if (pocketId === POCKET_IDS.DAILY) {
    // TIPE 1: Show "Saldo Awal (Budget Baru + Sisa Nov)"
    const newBudget = budget?.initialBudget || 0;
    const carryOverAmount = carryOver?.amount || 0;
    const totalSaldoAwal = carryOverAmount + newBudget;
    
    allTransactions.push({
      id: `initial_${pocketId}_${monthKey}`,
      type: 'initial',
      date: `${monthKey}-01T00:00:00.000Z`,
      description: `Saldo Awal (Budget Baru + Sisa ${carryOver?.fromMonth || 'bulan lalu'})`,
      amount: totalSaldoAwal,
      balanceAfter: totalSaldoAwal,
      icon: '💰',
      color: '#10b981',
      metadata: {
        isCarryOver: true,
        breakdown: {
          carryOver: carryOverAmount,
          newBudget: newBudget
        }
      }
    });
    
  } else if (pocketId === POCKET_IDS.COLD_MONEY) {
    // TIPE 2: Show "Saldo Awal (Carry-over dari Nov)"
    const carryOverAmount = carryOver?.amount || 0;
    
    if (carryOverAmount !== 0) {
      allTransactions.push({
        id: `initial_${pocketId}_${monthKey}`,
        type: 'initial',
        date: `${monthKey}-01T00:00:00.000Z`,
        description: `Saldo Awal (Carry-over dari ${carryOver?.fromMonth || 'bulan lalu'})`,
        amount: carryOverAmount,
        balanceAfter: carryOverAmount,
        icon: '❄️',
        color: '#8b5cf6',
        metadata: {
          isCarryOver: true,
          fromMonth: carryOver?.fromMonth
        }
      });
    }
    
  } else {
    // TIPE 3: Custom Pockets - Show carry-over
    const carryOverAmount = carryOver?.amount || 0;
    
    if (carryOverAmount !== 0) {
      allTransactions.push({
        id: `initial_${pocketId}_${monthKey}`,
        type: 'initial',
        date: `${monthKey}-01T00:00:00.000Z`,
        description: `Saldo Awal (Carry-over dari ${carryOver?.fromMonth || 'bulan lalu'})`,
        amount: carryOverAmount,
        balanceAfter: carryOverAmount,
        icon: pocket?.icon || '🎯',
        color: pocket?.color || '#6366f1',
        metadata: {
          isCarryOver: true,
          fromMonth: carryOver?.fromMonth
        }
      });
    }
  }
  
  // ========================================
  // 2️⃣ ADD INCOME ENTRIES (CURRENT MONTH ONLY)
  // ========================================
  
  if (pocketId === POCKET_IDS.COLD_MONEY || pocket?.type === 'custom') {
    additionalIncome
      .filter((income: any) => 
        income.pocketId === pocketId && 
        !excludedIncomeIds.has(income.id) &&
        income.date.startsWith(monthKey)  // ✅ FILTER: Only this month
      )
      .forEach((income: any) => {
        const netAmount = income.amountIDR - income.deduction;
        
        allTransactions.push({
          id: income.id,
          type: 'income',
          date: income.date,
          description: `${income.name} (${income.currency || 'USD'})`,
          amount: netAmount,
          balanceAfter: 0, // Will be calculated later
          icon: '💵',
          color: '#10b981',
          metadata: income
        });
      });
  }
  
  // ========================================
  // 3️⃣ ADD EXPENSE ENTRIES (CURRENT MONTH ONLY)
  // ========================================
  
  expenses
    .filter((exp: any) => 
      exp.pocketId === pocketId && 
      !excludedExpenseIds.has(exp.id) &&
      exp.date.startsWith(monthKey)  // ✅ FILTER: Only this month
    )
    .forEach((exp: any) => {
      allTransactions.push({
        id: exp.id,
        type: 'expense',
        date: exp.date,
        description: exp.name,
        amount: -exp.amount,
        balanceAfter: 0,
        icon: '💸',
        color: '#ef4444',
        metadata: exp
      });
    });
  
  // ========================================
  // 4️⃣ ADD TRANSFER ENTRIES (CURRENT MONTH ONLY)
  // ========================================
  
  transfers
    .filter((transfer: any) => 
      transfer.date.startsWith(monthKey)  // ✅ FILTER: Only this month
    )
    .forEach((transfer: any) => {
      if (transfer.fromPocketId === pocketId) {
        // Transfer OUT
        allTransactions.push({
          id: transfer.id + '_out',
          type: 'transfer',
          date: transfer.date,
          description: `Transfer ke ${transfer.toPocketName || 'kantong lain'}`,
          amount: -transfer.amount,
          balanceAfter: 0,
          icon: '↗️',
          color: '#f59e0b',
          metadata: transfer
        });
      }
      
      if (transfer.toPocketId === pocketId) {
        // Transfer IN
        allTransactions.push({
          id: transfer.id + '_in',
          type: 'transfer',
          date: transfer.date,
          description: `Transfer dari ${transfer.fromPocketName || 'kantong lain'}`,
          amount: transfer.amount,
          balanceAfter: 0,
          icon: '↙️',
          color: '#10b981',
          metadata: transfer
        });
      }
    });
  
  // ========================================
  // 5️⃣ SORT & CALCULATE RUNNING BALANCE
  // ========================================
  
  // Sort by date
  allTransactions.sort((a, b) => {
    if (sortOrder === 'asc') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });
  
  // Calculate running balance
  let runningBalance = 0;
  allTransactions.forEach((entry) => {
    runningBalance += entry.amount;
    entry.balanceAfter = runningBalance;
  });
  
  return allTransactions;
}
```

---

### **FASE 3.2: Frontend - Timeline Display**

#### **Files to Modify:**
1. `/components/PocketTimeline.tsx`

#### **Changes:**

**3.2.1 - Add Special Styling for "Saldo Awal" Entry**

```typescript
// Location: Update renderTimelineEntry() function

const renderTimelineEntry = (entry: TimelineEntry) => {
  const isInitial = entry.metadata?.isCarryOver === true;
  
  return (
    <motion.div
      key={entry.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        flex items-center gap-3 p-3 rounded-lg
        ${isInitial 
          ? 'bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200' 
          : 'bg-muted/50'
        }
      `}
    >
      {/* Icon */}
      <div 
        className={`
          flex items-center justify-center w-10 h-10 rounded-full
          ${isInitial ? 'bg-blue-500 text-white text-xl' : 'bg-background'}
        `}
        style={{ backgroundColor: isInitial ? undefined : entry.color }}
      >
        {entry.icon}
      </div>
      
      {/* Content */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className={isInitial ? 'font-bold text-blue-900' : 'font-medium'}>
            {entry.description}
          </p>
          {isInitial && (
            <Badge variant="secondary" className="text-xs">
              Saldo Awal
            </Badge>
          )}
        </div>
        
        {/* Show breakdown for Daily pocket */}
        {isInitial && entry.metadata?.breakdown && (
          <p className="text-xs text-muted-foreground mt-1">
            Carry-over: {formatCurrency(entry.metadata.breakdown.carryOver)} + 
            Budget Baru: {formatCurrency(entry.metadata.breakdown.newBudget)}
          </p>
        )}
        
        <p className="text-sm text-muted-foreground">
          {new Date(entry.date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </p>
      </div>
      
      {/* Amount */}
      <div className="text-right">
        <p className={`
          font-bold
          ${entry.amount >= 0 ? 'text-green-600' : 'text-red-600'}
        `}>
          {entry.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(entry.amount))}
        </p>
        
        <p className="text-sm text-muted-foreground">
          Saldo: {formatCurrency(entry.balanceAfter)}
        </p>
      </div>
    </motion.div>
  );
};
```

**3.2.2 - Add Empty State for New Months**

```typescript
// Add empty state component
const EmptyTimelineState = ({ monthKey }: { monthKey: string }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="text-6xl mb-4">📅</div>
    <h3 className="text-lg font-semibold mb-2">
      Belum ada transaksi di {new Date(monthKey).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
    </h3>
    <p className="text-sm text-muted-foreground max-w-sm">
      Timeline akan menampilkan semua transaksi yang terjadi bulan ini.
      Mulai tambahkan income atau expense untuk melihat riwayat!
    </p>
  </div>
);

// Use in render:
{timeline.length === 0 ? (
  <EmptyTimelineState monthKey={monthKey} />
) : (
  timeline.map(entry => renderTimelineEntry(entry))
)}
```

---

### **FASE 3.3: Verification Steps**

#### **✅ Checklist:**

1. **Timeline Filtering:**
   - [ ] November: Create 5 expenses
   - [ ] December: Create 3 expenses
   - [ ] Open Timeline in November → Should show ONLY 5 Nov expenses
   - [ ] Open Timeline in December → Should show ONLY 3 Dec expenses
   - [ ] No cross-month contamination

2. **Saldo Awal Display:**
   - [ ] Tipe 1 (Sehari-hari): Shows "Saldo Awal (Budget Baru + Sisa Nov)"
   - [ ] Tipe 2 (Uang Dingin): Shows "Saldo Awal (Carry-over dari Nov)"
   - [ ] Tipe 3 (Custom): Shows "Saldo Awal (Carry-over dari Nov)"
   - [ ] Badge "Saldo Awal" visible
   - [ ] Special styling applied (blue gradient background)

3. **Running Balance:**
   - [ ] Saldo Awal: Shows correct carry-over amount
   - [ ] After income: Balance increases correctly
   - [ ] After expense: Balance decreases correctly
   - [ ] After transfer: Balance adjusts correctly
   - [ ] Final balance matches BudgetOverview

4. **Edge Cases:**
   - [ ] First month (no carry-over) → No "Saldo Awal" entry shown
   - [ ] Zero carry-over → Shows "Saldo Awal: Rp 0"
   - [ ] Negative carry-over → Shows correctly with red color

5. **Mobile UX:**
   - [ ] Timeline scrolls smoothly
   - [ ] Saldo Awal entry readable on small screens
   - [ ] Amounts don't overflow
   - [ ] Icons visible

#### **❌ Rollback Plan:**

If timeline display issues:
```typescript
// Revert to old timeline (show all months)
function buildPocketTimeline(pocketId, monthKey, sortOrder, sharedData) {
  // Remove monthKey filter
  const allExpenses = expenses.filter(e => e.pocketId === pocketId);
  // No "Saldo Awal" entry
  return buildOldTimeline(allExpenses);
}
```

---

### **FASE 3.4: Documentation**

Create `/planning/kantong-architecture-fix-v3-safe/FASE_3_COMPLETE.md`:

```markdown
# ✅ FASE 3 COMPLETE: Timeline UI Refactor

## Changes Made:
1. Backend: Filter timeline per month
2. Backend: Add "Saldo Awal" entry at top
3. Frontend: Special styling for initial balance
4. Frontend: Improved UX with badges and breakdowns
5. Testing: All scenarios verified

## Verification:
- ✅ Timeline filtered per month
- ✅ "Saldo Awal" displayed correctly
- ✅ Running balance accurate
- ✅ Mobile responsive
- ✅ No regressions

## Architecture Complete! 🎉
All 3 phases finished. System ready for production.
```

---

## 📋 FINAL VERIFICATION CHECKLIST

### **End-to-End Testing:**

#### **Scenario 1: New User (First Month)**
- [ ] Create account, start in December 2025
- [ ] Set budget Rp 3M for Sehari-hari
- [ ] Create custom pocket "Investasi"
- [ ] Add income Rp 500K to Investasi
- [ ] Check all pockets visible
- [ ] Check Timeline shows correct data

#### **Scenario 2: Month Transition (Nov → Dec)**
- [ ] November data exists (budget, expenses, income)
- [ ] Navigate to December using MonthSelector
- [ ] Verify pockets still exist (not disappeared)
- [ ] Verify carry-over calculated correctly
- [ ] Set new budget for December
- [ ] Verify Saldo Awal = Carry-over + New Budget
- [ ] Check Timeline shows only December data + Saldo Awal

#### **Scenario 3: Multi-Month Usage (Oct → Nov → Dec)**
- [ ] October: Set budget Rp 3M, spend Rp 2.5M → Sisa Rp 500K
- [ ] November: Auto carry-over Rp 500K, set new budget Rp 3.2M
- [ ] November Saldo Awal should be Rp 3.7M (500K + 3.2M)
- [ ] November: Spend Rp 3M → Sisa Rp 700K
- [ ] December: Auto carry-over Rp 700K, set new budget Rp 3.5M
- [ ] December Saldo Awal should be Rp 4.2M (700K + 3.5M)
- [ ] All timelines show correct month data

#### **Scenario 4: Custom Pockets Persistence**
- [ ] Create "Tabungan Liburan" in November
- [ ] Add income Rp 1M to Tabungan
- [ ] Spend Rp 200K from Tabungan
- [ ] Sisa November: Rp 800K
- [ ] Navigate to December
- [ ] "Tabungan Liburan" still exists ✅
- [ ] December Saldo Awal: Rp 800K ✅
- [ ] Add income Rp 300K in December
- [ ] Balance: Rp 1.1M (800K + 300K) ✅

#### **Scenario 5: Edge Cases**
- [ ] Zero balance carry-over
- [ ] Negative balance (hutang) carry-over
- [ ] Delete pocket → Timeline disappears
- [ ] Archive pocket → Not visible but data preserved
- [ ] Transfer between pockets → Both timelines updated

---

## 🚨 KNOWN RISKS & MITIGATION

### **Risk 1: Data Migration Failure**
**Impact:** Old pockets disappear  
**Probability:** Medium  
**Mitigation:**
- Test migration on staging first
- Backup all data before migration
- Provide rollback script

### **Risk 2: Calculation Logic Error**
**Impact:** Saldo salah, user kehilangan data  
**Probability:** Medium  
**Mitigation:**
- Extensive unit tests
- Manual verification per fase
- Console logging for debugging
- Rollback plan per fase

### **Risk 3: Timeline Display Bug**
**Impact:** User confused, UX buruk  
**Probability:** Low  
**Mitigation:**
- Careful testing on mobile & desktop
- Edge case handling
- Empty state design

### **Risk 4: Performance Degradation**
**Impact:** Slow loading  
**Probability:** Low  
**Mitigation:**
- Use Promise.all() for parallel fetching
- Cache carry-over data
- Optimize KV queries

---

## 📚 SUCCESS METRICS

### **Must Have (P0):**
- ✅ Kantong tidak hilang saat bulan berganti
- ✅ Saldo carry-over akurat untuk semua tipe
- ✅ Timeline filter per bulan
- ✅ No data loss
- ✅ No regression in existing features

### **Should Have (P1):**
- ✅ "Saldo Awal" entry di timeline
- ✅ Special styling for initial balance
- ✅ Console logging untuk debugging
- ✅ Auto-generate carry-over

### **Nice to Have (P2):**
- ⭕ Carry-over history API
- ⭕ Manual carry-over adjustment UI
- ⭕ Monthly summary dashboard

---

## 🎯 NEXT STEPS AFTER COMPLETION

1. **Monitoring:**
   - Watch for user reports
   - Monitor error logs
   - Track carry-over accuracy

2. **Documentation:**
   - Update user guide
   - Create troubleshooting FAQ
   - Document API changes

3. **Future Enhancements:**
   - Add carry-over history view
   - Budget recommendations based on carry-over patterns
   - Auto-budget adjustment suggestions

---

## 📞 SUPPORT & ROLLBACK

### **If Major Issues Occur:**

1. **Stop immediately** - Don't proceed to next fase
2. **Check logs** - Console errors, API responses
3. **Test rollback** - Use rollback scripts per fase
4. **Report issues** - Document what went wrong
5. **Fix & retry** - Don't skip verification steps

### **Emergency Rollback:**
```bash
# Restore to pre-refactor state
git revert <commit-hash>

# Or manual rollback:
# 1. Restore old getPockets() function
# 2. Restore old calculatePocketBalance() function
# 3. Restore old buildPocketTimeline() function
# 4. Clear carry-over data if needed
```

---

## ✅ PLANNING COMPLETE - READY FOR EXECUTION

**This planning document is MANDATORY reading before ANY code changes.**

**Do NOT skip verification steps.**

**Do NOT rush implementation.**

**Safety first, speed second.** 🛡️

---

**Created by:** AI Code Agent  
**Date:** November 9, 2025  
**Status:** 📋 READY FOR REVIEW & APPROVAL  
**Risk Level:** 🔴 CRITICAL - Handle with extreme care
