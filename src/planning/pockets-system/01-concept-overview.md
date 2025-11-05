# Concept Overview - Pockets System

## Executive Summary

Pockets System adalah fitur untuk mengelola multiple saldo terpisah dalam satu aplikasi budget tracking, memungkinkan user untuk mengalokasikan dana ke berbagai "kantong" sesuai tujuan dan melacak pengeluaran dari setiap kantong secara independen.

## Core Concept

### Analogi Dunia Nyata
Seperti memiliki beberapa dompet fisik:
- **Dompet Utama** → untuk belanja sehari-hari
- **Dompet Hobby** → untuk hiburan/hobi
- **Amplop Tabungan** → untuk saving goals

User bisa memindahkan uang antar dompet sesuai kebutuhan.

## Problem Statement

### Current Pain Points
1. **No Separation of Funds**: Budget awal dan pemasukan tambahan tercampur dalam satu pool
2. **Lack of Purpose**: Sulit melacak uang untuk kebutuhan essentials vs discretionary spending
3. **No Savings Tracking**: Tidak ada cara untuk "set aside" uang untuk goals tertentu
4. **Mixed Reporting**: Sulit lihat berapa yang dihabiskan untuk essentials vs hobbies

### User Scenarios

#### Scenario 1: Daily Budget Management
```
User: Sarah, karyawan dengan gaji tetap

Context:
- Gaji bulan ini: Rp 8.000.000 (Budget Awal)
- Bonus dari client: Rp 2.000.000 (Pemasukan Tambahan)

Goal:
- Gaji untuk kebutuhan sehari-hari (transport, makan, bills)
- Bonus untuk hobi dan entertainment

Solution:
Kantong Sehari-hari: Rp 8.000.000
Kantong Uang Dingin: Rp 2.000.000

Saat beli groceries → pilih Kantong Sehari-hari
Saat beli game console → pilih Kantong Uang Dingin
```

#### Scenario 2: Emergency Transfer
```
User: Budi, freelancer dengan income tidak tetap

Context:
- Kantong Sehari-hari: Rp 500.000 (hampir habis)
- Kantong Uang Dingin: Rp 3.000.000
- Butuh bayar tagihan listrik: Rp 800.000

Problem:
Uang sehari-hari tidak cukup, tapi ada uang dingin

Solution:
Transfer Rp 1.000.000 dari Kantong Uang Dingin → Sehari-hari
Bayar listrik dari Kantong Sehari-hari
Timeline menunjukkan: Transfer masuk → Pembayaran listrik
```

#### Scenario 3: Savings Goal (Phase 2)
```
User: Lisa, ingin nabung untuk liburan

Goal:
Kumpulkan Rp 10.000.000 dalam 6 bulan

Solution:
Buat kantong custom "Liburan Bali"
Setiap bulan transfer Rp 1.500.000 dari:
  - Rp 1.000.000 dari Kantong Sehari-hari
  - Rp 500.000 dari Kantong Uang Dingin

Track progress: 15% achieved
```

## Design Principles

### 1. Clarity Over Complexity
- **Phase 1**: Start simple dengan 2 kantong tetap
- Avoid overwhelming new users
- Progressive disclosure untuk advanced features

### 2. Transparency
- User harus selalu tahu:
  - Berapa saldo di setiap kantong
  - Dari mana uang berasal (transfer vs original)
  - Kemana uang digunakan (timeline chronological)

### 3. Flexibility
- User punya kontrol penuh untuk:
  - Pilih dari kantong mana saat pengeluaran
  - Transfer antar kantong kapan saja
  - (Phase 2) Create kantong sesuai kebutuhan

### 4. Scalability
- Arsitektur harus support:
  - 2 kantong (Phase 1)
  - N kantong (Phase 2)
  - Complex transfers (multi-source)
  - Goals & budgeting per pocket

## Information Architecture

### Hierarchy

```
Monthly Budget
│
├─ 📊 Pockets Summary (NEW)
│  ├─ Kantong Sehari-hari
│  │  ├─ Saldo Asli: Rp X
│  │  ├─ Transfer Masuk: Rp Y
│  │  ├─ Transfer Keluar: Rp Z
│  │  └─ Total: Rp (X+Y-Z)
│  │
│  └─ Kantong Uang Dingin
│     ├─ Saldo Asli: Rp A
│     ├─ Transfer Masuk: Rp B
│     ├─ Transfer Keluar: Rp C
│     └─ Total: Rp (A+B-C)
│
├─ 📑 Tabs
│  ├─ Budget Awal
│  ├─ Pemasukan Tambahan
│  └─ Pengeluaran
│
└─ 🕐 Timeline per Pocket (Collapsible)
   ├─ Timeline Sehari-hari
   │  ├─ [1 Nov] Budget Awal +Rp 8.000.000
   │  ├─ [3 Nov] Transfer dari Uang Dingin +Rp 500.000
   │  ├─ [3 Nov] Groceries -Rp 200.000
   │  └─ [4 Nov] Transport -Rp 50.000
   │
   └─ Timeline Uang Dingin
      ├─ [2 Nov] Freelance Project +Rp 2.000.000
      ├─ [3 Nov] Transfer ke Sehari-hari -Rp 500.000
      └─ [5 Nov] Gaming Console -Rp 800.000
```

## Key Concepts

### 1. Pocket Types

#### Primary Pockets (Phase 1)
- **Kantong Sehari-hari**
  - Source: Budget Awal + Carryover
  - Purpose: Essential daily needs
  - Default: semua existing expenses
  
- **Kantong Uang Dingin**
  - Source: Pemasukan Tambahan
  - Purpose: Discretionary spending (hobby, entertainment)
  - Optional: bisa di-transfer ke pockets lain

#### Custom Pockets (Phase 2)
- **User-created**
  - Name: User-defined (Tabungan, Emergency, Liburan, dll)
  - Source: Transfer dari pockets lain
  - Purpose: Savings goals, specific allocations
  - Features: Target amount, deadline, auto-transfer

### 2. Transactions

#### Types
1. **Income** → Masuk ke pocket
   - Budget Awal → Sehari-hari
   - Pemasukan Tambahan → Uang Dingin
   
2. **Expense** → Keluar dari pocket
   - Pilih dari pocket mana
   - Kurangi saldo pocket tersebut
   
3. **Transfer** → Antar pockets
   - From: Pocket X
   - To: Pocket Y
   - Amount: Rp Z
   - Muncul di timeline kedua pockets

#### Transaction Properties
```typescript
{
  type: 'income' | 'expense' | 'transfer',
  amount: number,
  date: Date,
  pocket_id: string, // untuk income/expense
  from_pocket?: string, // untuk transfer
  to_pocket?: string, // untuk transfer
  note?: string
}
```

### 3. Balance Calculation

#### Kantong Sehari-hari
```
Saldo Asli = Budget Awal + Carryover
Transfer Masuk = Sum(transfers TO this pocket)
Transfer Keluar = Sum(transfers FROM this pocket)
Pengeluaran = Sum(expenses from this pocket)

Saldo Tersedia = Saldo Asli + Transfer Masuk - Transfer Keluar - Pengeluaran
```

#### Kantong Uang Dingin
```
Saldo Asli = Sum(Pemasukan Tambahan yang tidak excluded)
Transfer Masuk = Sum(transfers TO this pocket)
Transfer Keluar = Sum(transfers FROM this pocket)
Pengeluaran = Sum(expenses from this pocket)

Saldo Tersedia = Saldo Asli + Transfer Masuk - Transfer Keluar - Pengeluaran
```

### 4. Timeline View

Chronological list of all activities affecting a pocket:

```
Timeline Kantong Sehari-hari
───────────────────────────────
[1 Nov 2025]
📥 Budget Awal
   +Rp 8.000.000
   Saldo: Rp 8.000.000

[2 Nov 2025]
💸 Groceries - Superindo
   -Rp 350.000
   Saldo: Rp 7.650.000

[3 Nov 2025]
🔄 Transfer dari Uang Dingin
   +Rp 500.000
   Saldo: Rp 8.150.000
   
💸 Bensin Motor
   -Rp 50.000
   Saldo: Rp 8.100.000
   
[4 Nov 2025]
💸 Makan Siang
   -Rp 45.000
   Saldo: Rp 8.055.000
```

## User Flow

### Flow 1: Adding Expense
```
1. User clicks "Tambah Pengeluaran"
2. Form shows:
   - Nama Pengeluaran
   - Jumlah
   - Tanggal
   - [NEW] Pilih Kantong: [Dropdown: Sehari-hari / Uang Dingin]
3. User fills and submits
4. Expense added to selected pocket
5. Pocket balance updates
6. Appears in pocket timeline
```

### Flow 2: Transfer Between Pockets
```
1. User clicks "Transfer" button in Pockets Summary
2. Dialog shows:
   - Dari Kantong: [Dropdown]
   - Ke Kantong: [Dropdown]
   - Jumlah: [Input]
   - Tanggal: [Date picker]
   - Catatan (optional): [Input]
3. Validation:
   - Check sufficient balance in source pocket
   - Prevent transfer to same pocket
4. Submit → Create transfer record
5. Update both pockets:
   - Source: -Amount (Transfer Keluar)
   - Destination: +Amount (Transfer Masuk)
6. Appears in both timelines
```

### Flow 3: Viewing Timeline
```
1. User scrolls to "Timeline" section below tabs
2. Sees collapsible cards per pocket:
   - [▼] Timeline Kantong Sehari-hari
   - [▶] Timeline Kantong Uang Dingin
3. Click to expand/collapse
4. Shows chronological list:
   - Income entries (green)
   - Expenses (red)
   - Transfers (blue)
   - Running balance after each transaction
```

## Success Metrics

### Phase 1
- [ ] User dapat melihat 2 saldo terpisah dengan jelas
- [ ] User dapat memilih kantong saat add expense
- [ ] User dapat transfer antar kantong
- [ ] User dapat melihat timeline per kantong
- [ ] User dapat memahami breakdown saldo (asli vs transfer)

### Phase 2
- [ ] User dapat create custom pockets
- [ ] User dapat set goals per pocket
- [ ] User dapat visualize allocation across pockets
- [ ] User dapat export report per pocket

## Technical Considerations

### Performance
- Timeline bisa panjang → Implement virtualization atau pagination
- Calculation bisa complex → Cache computed balances
- Real-time updates → Optimistic UI updates

### Data Integrity
- Transfer harus atomic (deduct from source AND add to destination)
- Balance calculation harus konsisten
- Timeline sorting harus reliable (by date + time)

### UX Challenges
- Avoid overwhelming new users dengan too many options
- Make transfer flow intuitive
- Timeline harus readable tapi informatif
- Mobile responsive design

## Next Steps

1. ✅ Review concept dengan stakeholders
2. ⏭️ Design data structure (see `03-data-structure.md`)
3. ⏭️ Create UI mockups (see `04-ui-ux-design.md`)
4. ⏭️ Implement Phase 1 (see `02-phase1-implementation.md`)
5. ⏭️ User testing & iteration
6. ⏭️ Plan Phase 2 (see `05-phase2-roadmap.md`)

---

**Version**: 1.0
**Last Updated**: November 5, 2025
**Status**: Approved for Implementation
