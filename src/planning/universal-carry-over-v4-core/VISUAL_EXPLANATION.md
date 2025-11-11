# TUGAS 1: Visual Explanation

**Fix Bug Kalkulasi Saldo - Realtime vs Projected**

---

## 🎯 The Problem (Before Fix)

```
PayLater Pocket Timeline (November 2025):
═══════════════════════════════════════════════════════════════

TODAY → 10 Nov
        ↓
┌───────┴────────┬──────────────────────────────────┐
│                │                                   │
1 Nov            10 Nov                          16 Nov
Saldo Awal       Transfer IN                     Expense SP
Rp 0             +Rp 753.261                     -Rp 376.631
                 ✅ HAPPENED                      🔮 FUTURE


❌ OLD CALCULATION (WRONG):
────────────────────────────────────────────────────
"Saldo Hari Ini" (10 Nov):
= 0 + 753.261 - 376.631
= -Rp 376.631  ← ❌ NEGATIVE! (includes future expense)

Why wrong?
→ Future expense on 16 Nov was included in TODAY's balance!
```

---

## ✅ The Fix (After Implementation)

```
NEW CALCULATION SYSTEM:
═══════════════════════════════════════════════════════════════

                    TODAY'S CUTOFF
                         ↓
┌────────────────────────┴─────────────────────────────┐
│   REALTIME ZONE               │   FUTURE ZONE         │
│   (Past + Today)              │   (After Today)       │
└───────────────────────────────┴───────────────────────┘

1. REALTIME BALANCE (Saldo Hari Ini):
   ✅ Include: Transactions <= TODAY
   ❌ Exclude: Future transactions

   Calculation (10 Nov):
   = Saldo Awal + Transfer (10 Nov)
   = 0 + 753.261
   = +Rp 753.261 ✅ POSITIVE!

2. PROJECTED BALANCE (Saldo Proyeksi):
   ✅ Include: ALL transactions (past + future)
   
   Calculation (10 Nov):
   = Saldo Awal + Transfer (10 Nov) - Expense (16 Nov)
   = 0 + 753.261 - 376.631
   = +Rp 376.630 ✅ Still positive!
```

---

## 🔄 How Mode Toggle Works

```
USER INTERFACE:
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────┐
│  PayLater                                        [OFF] │ ← Toggle
│  ─────────────────────────────────────────────────────  │
│                                                          │
│  💰 Rp 753.261                                          │ ← Display Balance
│  Saldo Hari Ini                                        │ ← Mode Label
│                                                          │
│  [Transfer] [Timeline]                                  │
└─────────────────────────────────────────────────────────┘

MODE: REALTIME (Toggle OFF)
──────────────────────────────────────────────────────────
Server returns:
{
  realtimeBalance: 753261,    ← Frontend uses THIS
  projectedBalance: 376630
}

Display: Rp 753.261 ✅
Label: "Saldo Hari Ini" ✅



┌─────────────────────────────────────────────────────────┐
│  PayLater                                        [ON]  │ ← Toggle
│  ─────────────────────────────────────────────────────  │
│                                                          │
│  💰 Rp 376.630                                          │ ← Display Balance
│  Saldo Proyeksi                                        │ ← Mode Label
│                                                          │
│  [Transfer] [Timeline]                                  │
└─────────────────────────────────────────────────────────┘

MODE: PROYEKSI (Toggle ON)
──────────────────────────────────────────────────────────
Server returns:
{
  realtimeBalance: 753261,
  projectedBalance: 376630    ← Frontend uses THIS
}

Display: Rp 376.630 ✅
Label: "Saldo Proyeksi" ✅
```

---

## 🏗️ Architecture Flow

```
USER REQUEST
    │
    ↓
┌─────────────────────────────────────────────────────────┐
│ FRONTEND: PocketsSummary.tsx                            │
│                                                          │
│ 1. User views pocket card                               │
│ 2. Check mode: isRealtime?                              │
│    ├─ YES → Display realtimeBalance                     │
│    └─ NO  → Display projectedBalance                    │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ↓ Fetch /pockets/:year/:month
┌─────────────────────────────────────────────────────────┐
│ BACKEND: index.tsx                                      │
│                                                          │
│ calculatePocketBalance(pocketId, monthKey)              │
│   │                                                      │
│   ├─ 1. Fetch all transactions for month                │
│   │                                                      │
│   ├─ 2. Calculate REALTIME balance:                     │
│   │    └─ Filter: transaction.date <= TODAY             │
│   │                                                      │
│   └─ 3. Calculate PROJECTED balance:                    │
│        └─ Filter: ALL transactions                      │
│                                                          │
│ Return:                                                  │
│ {                                                        │
│   realtimeBalance: 753261,                              │
│   projectedBalance: 376630,                             │
│   availableBalance: 376630  // backward compat          │
│ }                                                        │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────┐
│ FRONTEND: Display                                       │
│                                                          │
│ if (isRealtime) {                                       │
│   show: Rp 753.261  ← realtimeBalance                   │
│ } else {                                                │
│   show: Rp 376.630  ← projectedBalance                  │
│ }                                                        │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Comparison

### ❌ BEFORE FIX (Wrong)

```
Server calculates ONE balance:
──────────────────────────────────────────────────────────
expenses = ALL expenses (no date filter)
         = expense(10 Nov) + expense(16 Nov)  ❌ WRONG!

availableBalance = original + income + transfers - expenses
                 = 0 + 753261 - 376631
                 = 376630

Frontend displays:
  "Saldo Hari Ini": Rp 376.630  ❌ WRONG! (includes future)
```

### ✅ AFTER FIX (Correct)

```
Server calculates TWO balances:
──────────────────────────────────────────────────────────
expensesRealtime = expenses WHERE date <= TODAY
                 = expense(10 Nov) ONLY
                 = 0  ✅ CORRECT!

expensesProjected = ALL expenses
                  = expense(10 Nov) + expense(16 Nov)
                  = 376631  ✅ CORRECT!

realtimeBalance = 0 + 753261 - 0 = 753261
projectedBalance = 0 + 753261 - 376631 = 376630

Frontend displays:
  Mode Realtime:  Rp 753.261  ✅ CORRECT!
  Mode Proyeksi:  Rp 376.630  ✅ CORRECT!
```

---

## 🎯 Use Cases

### Case 1: "How much can I spend TODAY?"
```
User: "I want to buy something. Do I have money?"
Mode: REALTIME (Saldo Hari Ini)
Answer: Rp 753.261 ✅

Why correct?
→ Shows actual available money TODAY
→ Doesn't count money you'll spend in the FUTURE
```

### Case 2: "How much will I have at END OF MONTH?"
```
User: "If everything goes as planned, what's my final balance?"
Mode: PROYEKSI (Saldo Proyeksi)
Answer: Rp 376.630 ✅

Why correct?
→ Shows projected final balance
→ Includes all planned future expenses
```

### Case 3: "Can I delete this pocket?"
```
System validation: Must check PROJECTED balance
Why?
→ Even if realtime balance is Rp 0 TODAY
→ There might be future expenses scheduled
→ Cannot delete if future transactions exist

Validation uses: projectedBalance ✅
```

---

## 🔍 Debug Example

```
Console logs from server (PayLater, 10 Nov):
═══════════════════════════════════════════════════════════════

[BALANCE] 📊 pocket_custom_paylater 2025-11:
  realtime: 753261           ← ✅ POSITIVE (correct!)
  projected: 376630          ← ✅ POSITIVE (correct!)
  cutoffDate: 2025-11-10
  breakdown:
    originalAmount: 0
    transferInRealtime: 753261   ← Transfer on 10 Nov
    transferInProjected: 753261  ← Same transfer
    expensesRealtime: 0          ← ✅ Future expense EXCLUDED
    expensesProjected: 376631    ← ✅ Future expense INCLUDED
    
This is CORRECT! ✅
```

---

## 🎉 Visual Success Indicator

```
BEFORE FIX:                      AFTER FIX:
═════════════                    ═════════════

┌──────────────────┐           ┌──────────────────┐
│ PayLater         │           │ PayLater         │
│                  │           │                  │
│ -Rp 376.631 ❌   │    →      │ +Rp 753.261 ✅   │
│ Saldo Hari Ini   │           │ Saldo Hari Ini   │
│                  │           │                  │
│ [RED COLOR]      │           │ [GREEN COLOR]    │
└──────────────────┘           └──────────────────┘
     WRONG!                           CORRECT!
```

---

**Summary:**
- ✅ Future transactions no longer affect "Saldo Hari Ini"
- ✅ Two separate calculations: realtime vs projected
- ✅ User can toggle between modes for different insights
- ✅ Delete validation uses projected (includes future)
- ✅ PayLater bug completely FIXED!
