# Future Analytics - Category-Based Insights

**Vision for category analytics features**

---

## 🎯 Overview

Leverage expense categories to provide powerful insights, visualizations, and budget management capabilities.

---

## 📊 Phase 5: Category Analytics

### 5.1 Category Breakdown Pie Chart

**Visual**: Pie chart showing expense distribution by category

```
     📊 Pengeluaran Bulan Ini
     
        🍔 Makanan
        35% - Rp 2,100,000
        
    🚗           📄
  Transport    Tagihan
  25% - 1.5M   20% - 1.2M
  
        🎬           🛒
     Hiburan      Belanja
     10% - 600k   10% - 600k
```

**Implementation**:
- Use `recharts` library (already in project)
- `<PieChart>` with category colors
- Click to drill down

---

### 5.2 Monthly Trend by Category

**Visual**: Line chart showing category spending over time

```
Rp (juta)
3.0 ┤           🍔 Makanan
    │         ╱╲
2.0 ┤        ╱  ╲
    │    🚗 ╱    ╲
1.0 ┤      ╱      ╲
    │    ╱         ╲___📄
0   └─────────────────────
     Jan  Feb  Mar  Apr
```

**Use Cases**:
- Identify spending spikes
- Seasonal patterns (e.g., transport higher in mudik season)
- Track reduction progress

---

### 5.3 Top Categories Widget

**Visual**: Quick summary of top spending categories

```
┌──────────────────────────────────┐
│ Top 3 Kategori Bulan Ini         │
├──────────────────────────────────┤
│ 🥇 🍔 Makanan     Rp 2,100,000  │
│ 🥈 🚗 Transport   Rp 1,500,000  │
│ 🥉 📄 Tagihan     Rp 1,200,000  │
└──────────────────────────────────┘
```

**Placement**: Dashboard overview

---

## 💰 Phase 6: Category Budget Limits

### 6.1 Set Budget per Category

**UI**: Category budget configuration

```
┌─────────────────────────────────────┐
│ Budget per Kategori                 │
├─────────────────────────────────────┤
│ 🍔 Makanan                          │
│ Budget: Rp 2,000,000 /bulan        │
│ ┌─────────────────────────────────┐ │
│ │ 2000000                         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 🚗 Transportasi                     │
│ Budget: Rp 1,500,000 /bulan        │
│ ┌─────────────────────────────────┐ │
│ │ 1500000                         │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

### 6.2 Category Budget Progress Bars

**Visual**: Real-time tracking per category

```
┌─────────────────────────────────────┐
│ Budget Kategori                     │
├─────────────────────────────────────┤
│ 🍔 Makanan                          │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░ 80%          │
│ 1.6M / 2M                          │
│                                     │
│ 🚗 Transport                        │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░ 70%          │
│ 1.05M / 1.5M                       │
│                                     │
│ ⚠️ 📄 Tagihan                       │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 105% OVER!   │
│ 1.26M / 1.2M                       │
└─────────────────────────────────────┘
```

**Alert Logic**:
- 🟢 < 70%: Safe
- 🟡 70-90%: Warning
- 🔴 90-100%: Critical
- ⚠️ > 100%: Over budget!

---

### 6.3 Category Warnings & Notifications

**Toast Notifications**:
```
⚠️ Budget Makanan hampir habis!
   Sisa Rp 400,000 (20%)
   
   [Lihat Detail]  [Dismiss]
```

**Email Digest** (future):
- Weekly category spending summary
- Budget alerts for overspending
- Suggestions for optimization

---

## 🔍 Phase 7: Filtering & Sorting

### 7.1 Category Filter

**UI**: Filter dropdown in ExpenseList

```
┌─────────────────────────────────────┐
│ Filter: [🍔 Makanan          ▼]    │
├─────────────────────────────────────┤
│ 🍔 Makan Siang         -50,000     │
│ 🍔 Kopi                -15,000     │
│ 🍔 Nasi Goreng         -25,000     │
└─────────────────────────────────────┘
```

---

### 7.2 Multi-Category Filter

**UI**: Checkbox multi-select

```
┌─────────────────────────────────────┐
│ Filter Kategori                     │
├─────────────────────────────────────┤
│ ☑ 🍔 Makanan                        │
│ ☑ 🚗 Transportasi                   │
│ ☐ 📄 Tagihan                        │
│ ☐ 🎬 Hiburan                        │
│                                     │
│ 2 kategori dipilih                  │
│         [Reset]     [Terapkan]      │
└─────────────────────────────────────┘
```

---

### 7.3 Sort by Category

**Logic**: Group and sort expenses by category

```
┌─────────────────────────────────────┐
│ Sort: [Kategori             ▼]     │
├─────────────────────────────────────┤
│ 🍔 MAKANAN                          │
│   Makan Siang         -50,000      │
│   Kopi                -15,000      │
│                                     │
│ 🚗 TRANSPORTASI                     │
│   Bensin              -100,000     │
│   Parkir              -20,000      │
└─────────────────────────────────────┘
```

---

## 🎨 Phase 8: Customization

### 8.1 Custom Categories

**Allow users to create own categories**

```
┌─────────────────────────────────────┐
│ Tambah Kategori Custom              │
├─────────────────────────────────────┤
│ Nama Kategori                       │
│ ┌─────────────────────────────────┐ │
│ │ Investasi                       │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Emoji                               │
│ ┌─────────────────────────────────┐ │
│ │ 📈                          [🎨]│ │
│ └─────────────────────────────────┘ │
│                                     │
│         [Batal]     [Simpan]        │
└─────────────────────────────────────┘
```

---

### 8.2 Category Color Coding

**Visual**: Color-coded categories for faster recognition

```
┌─────────────────────────────────────┐
│ 🍔 Makan Siang         -50,000     │ (bg-green-50)
│ 🚗 Bensin             -100,000     │ (bg-blue-50)
│ 📄 Listrik            -200,000     │ (bg-yellow-50)
└─────────────────────────────────────┘
```

**Implementation**: Tailwind background colors based on category

---

### 8.3 Category Aliases

**Multiple names for same category**

Example:
- "Makanan" = "Food" = "F&B" = "Kuliner"
- Auto-detect based on expense name

---

## 🤖 Phase 9: Smart Features

### 9.1 Auto-Categorization (AI)

**Smart suggestions based on expense name**

```
Input: "Gojek ke kantor"
  → Suggested: 🚗 Transportasi

Input: "Indomaret belanja bulanan"
  → Suggested: 🛒 Belanja

Input: "Netflix"
  → Suggested: 🎬 Hiburan
```

**Implementation**:
- Keyword matching
- Learning from user's history
- ML model (future)

---

### 9.2 Learning from History

**Remember user's categorization patterns**

```
User always categorizes "Indomaret" → 🛒 Belanja

Next time:
  Input: "Indomaret"
  Auto-suggest: 🛒 Belanja
```

---

### 9.3 Bulk Auto-Categorize

**One-click to categorize all uncategorized expenses**

```
┌─────────────────────────────────────┐
│ 47 pengeluaran belum dikategorikan  │
│                                     │
│ [Auto-Kategorikan Semua]            │
└─────────────────────────────────────┘

Result:
  ✅ 42 berhasil dikategorikan
  ⚠️ 5 perlu review manual
```

---

## 📄 Phase 10: Export & Reporting

### 10.1 Category Export

**Export to Excel/CSV grouped by category**

```csv
Kategori,Item,Jumlah,Tanggal
Makanan,Makan Siang,50000,2025-11-01
Makanan,Kopi,15000,2025-11-01
Transport,Bensin,100000,2025-11-02
```

---

### 10.2 Category Report PDF

**Professional PDF report**

```
═══════════════════════════════════════
  LAPORAN PENGELUARAN NOVEMBER 2025
═══════════════════════════════════════

Ringkasan per Kategori:
  🍔 Makanan         Rp 2,100,000 (35%)
  🚗 Transportasi    Rp 1,500,000 (25%)
  📄 Tagihan         Rp 1,200,000 (20%)
  ...

Detail Pengeluaran:
  [Category breakdown table]
  
Grafik:
  [Pie chart image]
  
═══════════════════════════════════════
Generated: 2025-11-06 14:30
═══════════════════════════════════════
```

---

### 10.3 Tax Category Mapping

**Map expense categories to tax categories**

```typescript
const TAX_MAPPING = {
  health: 'Medical Deductible',
  savings: 'Investment',
  loan: 'Interest Expense',
  // ... etc
};
```

**Export for tax filing**

---

## 🎯 Priority Roadmap

### High Priority (Next 3 months)
1. ✅ Basic category system
2. ✅ Dropdown selector
3. ✅ Emoji display
4. 🔲 Category breakdown pie chart
5. 🔲 Category budget limits

### Medium Priority (3-6 months)
6. 🔲 Category filters
7. 🔲 Monthly trends
8. 🔲 Budget warnings
9. 🔲 Custom categories

### Low Priority (6-12 months)
10. 🔲 Auto-categorization AI
11. 🔲 PDF reports
12. 🔲 Tax mapping
13. 🔲 Learning from history

---

## 💡 Analytics Metrics to Track

- Total spending per category per month
- Category with highest/lowest spending
- Month-over-month category growth
- Budget adherence per category
- Most common uncategorized expense names
- Time to categorize (UX metric)
- Category adoption rate

---

**Vision Document**: 1.0  
**Last Updated**: November 6, 2025  
**Status**: Future Roadmap
