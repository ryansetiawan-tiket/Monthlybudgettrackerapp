# Pockets System - Quick Reference

## Quick Start

### For Developers

```bash
# 1. Read concept
/planning/pockets-system/01-concept-overview.md

# 2. Review data structure
/planning/pockets-system/03-data-structure.md

# 3. Follow implementation guide
/planning/pockets-system/02-phase1-implementation.md

# 4. Check UI/UX mockups
/planning/pockets-system/04-ui-ux-design.md
```

---

## Key Concepts (60 Second Summary)

**What**: System untuk mengelola multiple saldo terpisah (kantong) dalam satu budget app

**Why**: Memisahkan uang sehari-hari vs uang dingin, tracking lebih jelas

**How**:
1. **2 Kantong Fixed**: "Sehari-hari" (dari budget awal) + "Uang Dingin" (dari pemasukan tambahan)
2. **Expense pilih kantong**: Saat add expense, pilih dari mana
3. **Transfer antar kantong**: Bisa pindahkan dana antar kantong
4. **Timeline per kantong**: Lihat kronologi semua aktivitas

---

## Data Structure Cheatsheet

### Pocket IDs (Phase 1)
```typescript
POCKET_IDS.DAILY       // 'pocket_daily' - Sehari-hari
POCKET_IDS.COLD_MONEY  // 'pocket_cold_money' - Uang Dingin
```

### Key Database Keys
```typescript
`pockets:${monthKey}`                → Pocket[]
`transfers:${monthKey}`              → TransferTransaction[]
`pocket_balance:${monthKey}:${pocketId}` → PocketBalance (optional cache)
```

### Modified Existing Keys
```typescript
// Expense now has pocketId field
interface Expense {
  // ... existing fields
  pocketId: string;  // NEW
}
```

---

## API Endpoints (New)

### GET /pockets
```typescript
Query: { monthKey: string }
Response: { pockets: Pocket[], balances: PocketBalance[] }
```

### POST /transfer
```typescript
Body: {
  monthKey: string,
  fromPocketId: string,
  toPocketId: string,
  amount: number,
  date: string,
  note?: string
}
Response: { transfer: TransferTransaction, updatedBalances: {...} }
```

### GET /timeline
```typescript
Query: { monthKey: string, pocketId: string, sortOrder?: 'asc'|'desc' }
Response: { entries: TimelineEntry[], summary: {...} }
```

### DELETE /transfer/:id
```typescript
Query: { monthKey: string }
Response: { deletedId: string, updatedBalances: {...} }
```

---

## Components Cheatsheet

### New Components

**PocketsSummary.tsx**
```typescript
<PocketsSummary
  monthKey={string}
  onTransferClick={() => void}
  onRefresh={() => void}
/>
```
Displays: 2 cards showing balance breakdown for each pocket

---

**PocketTimeline.tsx**
```typescript
<PocketTimeline
  pocketId={string}
  pocketName={string}
  monthKey={string}
/>
```
Displays: Collapsible timeline of all activities for a pocket

---

**TransferDialog.tsx**
```typescript
<TransferDialog
  open={boolean}
  onOpenChange={(open: boolean) => void}
  pockets={Pocket[]}
  balances={Map<string, PocketBalance>}
  onTransfer={(transfer) => Promise<void>}
/>
```
Displays: Dialog for transferring money between pockets

---

### Modified Components

**AddExpenseDialog.tsx / AddExpenseForm.tsx**
- Add: Pocket selector dropdown
- Field: `pocketId: string`

**ExpenseList.tsx**
- Add: Pocket badge/indicator per expense
- Display: Which pocket the expense is from

---

## Balance Calculation Formula

```typescript
// Kantong Sehari-hari
originalAmount = Budget Awal + Carryover
availableBalance = originalAmount 
                 + transferIn 
                 - transferOut 
                 - expenses

// Kantong Uang Dingin
originalAmount = Sum(Pemasukan Tambahan yang tidak excluded - deduction)
availableBalance = originalAmount 
                 + transferIn 
                 - transferOut 
                 - expenses
```

---

## Common Tasks

### Task: Add New Expense to Specific Pocket
```typescript
const expense = {
  name: "Makan Siang",
  amount: 50000,
  date: new Date().toISOString(),
  pocketId: POCKET_IDS.DAILY  // or POCKET_IDS.COLD_MONEY
};

await fetch(`${baseUrl}/expense`, {
  method: 'POST',
  body: JSON.stringify({ ...expense, monthKey })
});
```

### Task: Transfer Money Between Pockets
```typescript
const transfer = {
  fromPocketId: POCKET_IDS.COLD_MONEY,
  toPocketId: POCKET_IDS.DAILY,
  amount: 500000,
  date: new Date().toISOString(),
  note: "Untuk bayar tagihan"
};

await fetch(`${baseUrl}/transfer`, {
  method: 'POST',
  body: JSON.stringify({ ...transfer, monthKey })
});
```

### Task: Get Timeline for Pocket
```typescript
const response = await fetch(
  `${baseUrl}/timeline?monthKey=${monthKey}&pocketId=${POCKET_IDS.DAILY}&sortOrder=desc`
);
const data = await response.json();
const entries = data.data.entries;
```

### Task: Calculate Pocket Balance
```typescript
// Server-side (automatic)
const balance = await calculatePocketBalance(pocketId, monthKey);

// Client-side (fetch from API)
const response = await fetch(`${baseUrl}/pockets?monthKey=${monthKey}`);
const data = await response.json();
const balances = new Map(data.data.balances.map(b => [b.pocketId, b]));
const dailyBalance = balances.get(POCKET_IDS.DAILY);
```

---

## Validation Rules

### Transfer Validation
- ✅ Amount must be > 0
- ✅ From pocket ≠ To pocket
- ✅ Sufficient balance in source pocket
- ❌ Allow negative balances (show warning only)

### Expense Validation
- ✅ Pocket must exist
- ⚠️ Warning if expense > available balance (but allow)
- ✅ Default to POCKET_IDS.DAILY if no pocket specified

---

## Migration Strategy

### Existing Data → Phase 1
```typescript
// Auto-migration (happens automatically)
1. Create DEFAULT_POCKETS if not exist
2. Add pocketId = POCKET_IDS.DAILY to existing expenses
3. Initialize empty transfers array
4. Budget awal → Kantong Sehari-hari
5. Pemasukan tambahan → Kantong Uang Dingin
```

### Backward Compatibility
```typescript
// Old expenses without pocketId
expense.pocketId || POCKET_IDS.DAILY  // Default

// Pockets don't exist yet
await getPockets(monthKey);  // Auto-creates if not found
```

---

## UI/UX Patterns

### Pocket Colors
```typescript
POCKET_IDS.DAILY      → Blue   (Wallet icon)
POCKET_IDS.COLD_MONEY → Purple (Sparkles icon)
```

### Transaction Colors (Timeline)
```typescript
Income   → Green  (TrendingUp, DollarSign, Wallet icons)
Expense  → Red    (ShoppingBag icon)
Transfer → Blue   (ArrowLeft, ArrowRight icons)
```

### Layout Flow
```
1. Month Selector
2. Pockets Summary ← NEW
3. Tabs (Budget Awal, Pemasukan Tambahan, Pengeluaran)
4. Timeline per Pocket (Collapsible) ← NEW
```

---

## Troubleshooting

### Balance tidak update setelah transfer
```typescript
// Solution: Recalculate balances setelah setiap transfer
const updatedBalance = await calculatePocketBalance(pocketId, monthKey);
```

### Timeline tidak muncul
```typescript
// Check:
1. Pocket ID benar?
2. Month key valid?
3. API endpoint accessible?
4. Data exists in KV store?
```

### Expense masuk ke pocket yang salah
```typescript
// Check default value
const pocketId = expense.pocketId || POCKET_IDS.DAILY;  // Always default
```

### Transfer validation error
```typescript
// Check validation logic
const validation = validateTransfer(transfer, fromBalance);
if (!validation.valid) {
  console.error(validation.error);
}
```

---

## Performance Tips

### Cache Balances
```typescript
// Option 1: Cache in KV store
await kv.set(`pocket_balance:${monthKey}:${pocketId}`, balance);

// Option 2: Compute on-demand (simpler, good for Phase 1)
const balance = await calculatePocketBalance(pocketId, monthKey);
```

### Optimize Timeline
```typescript
// For large datasets:
1. Paginate timeline entries
2. Lazy load when expanded
3. Virtualize list if > 100 entries
```

---

## Phase 2 Preview (Future)

### Custom Pockets
```typescript
// User can create pockets
const customPocket: Pocket = {
  id: generateId(),
  name: "Tabungan Liburan",
  type: 'custom',
  targetAmount: 10000000,
  targetDate: "2026-06-01",
  // ...
};
```

### Multi-Source Transfer
```typescript
// Transfer dari multiple pockets
const transfer = {
  to: "pocket_vacation",
  sources: [
    { from: POCKET_IDS.DAILY, amount: 1000000 },
    { from: POCKET_IDS.COLD_MONEY, amount: 500000 }
  ]
};
```

### Pocket Goals & Alerts
```typescript
// Track progress toward goals
{
  target: 10000000,
  current: 3000000,
  progress: 30%,
  daysRemaining: 180,
  suggestedMonthly: 1166667
}
```

---

## Useful Commands

```bash
# Check if pockets exist
await kv.get(`pockets:2025-11`)

# Get all transfers for month
await kv.get(`transfers:2025-11`)

# Recalculate balance manually
await calculatePocketBalance('pocket_daily', '2025-11')

# Clear transfers (testing)
await kv.set(`transfers:2025-11`, [])
```

---

## Contact & Questions

Untuk pertanyaan tentang:
- **Konsep**: Lihat `01-concept-overview.md`
- **Data**: Lihat `03-data-structure.md`
- **Implementasi**: Lihat `02-phase1-implementation.md`
- **UI/UX**: Lihat `04-ui-ux-design.md` (coming soon)
- **Future**: Lihat `05-phase2-roadmap.md` (coming soon)

---

**Version**: 1.0  
**Last Updated**: November 5, 2025  
**Status**: Ready for Development
