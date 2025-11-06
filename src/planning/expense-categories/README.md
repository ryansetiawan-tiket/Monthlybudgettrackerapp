# Expense Category System - Planning

**Date**: November 6, 2025  
**Status**: 📝 PLANNING  
**Priority**: 🟡 MEDIUM

---

## 🎯 Overview

Menambahkan sistem kategori untuk setiap pengeluaran dengan 11 kategori pre-defined, emoji visual indicator, dan support untuk backward compatibility.

### Goals
- ✅ 11 kategori dengan emoji unik
- ✅ Backward compatibility (existing entries → "Lainnya")
- ✅ Dropdown selector di AddExpenseForm
- ✅ Emoji display di kiri nama item
- ✅ Bulk edit untuk update kategori existing expenses
- ✅ Default categories untuk templates
- ✅ Optional field (tidak wajib diisi)

---

## 📊 Categories List

| Category | Label | Emoji | Use Case |
|----------|-------|-------|----------|
| `food` | Makanan | 🍔 | Makan, snack, groceries |
| `transport` | Transportasi | 🚗 | Bensin, parkir, toll, ojol |
| `savings` | Tabungan | 💰 | Transfer tabungan |
| `bills` | Tagihan | 📄 | Listrik, air, internet, pulsa |
| `health` | Kesehatan | 🏥 | Obat, dokter, asuransi |
| `loan` | Pinjaman | 💳 | Bayar hutang, KTA |
| `family` | Keluarga | 👨‍👩‍👧‍👦 | Kiriman ortu, kebutuhan anak |
| `entertainment` | Hiburan | 🎬 | Bioskop, konser, hobi |
| `installment` | Cicilan | 💸 | Cicilan motor, rumah, HP |
| `shopping` | Belanja | 🛒 | Fashion, elektronik, barang |
| `other` | Lainnya | 📦 | Default/uncategorized |

---

## 🗂️ Implementation Plan

### Phase 1: Foundation
1. **Update Types** (`/types/index.ts`)
   - Add `ExpenseCategory` type
   - Update `Expense` interface with optional `category?` field

2. **Add Constants** (`/constants/index.ts`)
   - Define `EXPENSE_CATEGORIES` mapping

3. **Helper Functions** (`/utils/calculations.ts`)
   - `getCategoryEmoji(category?: ExpenseCategory): string`
   - `getCategoryLabel(category?: ExpenseCategory): string`

### Phase 2: UI Components
4. **Update AddExpenseForm** (`/components/AddExpenseForm.tsx`)
   - Add category state
   - Add Select dropdown with emoji + label
   - Default to undefined (optional)
   - Include in submit payload

5. **Update ExpenseList** (`/components/ExpenseList.tsx`)
   - Display emoji before expense name
   - Fallback to 'other' emoji if undefined

### Phase 3: Templates & Bulk Edit
6. **Update FixedExpenseTemplates** (`/components/FixedExpenseTemplates.tsx`)
   - Assign sensible default categories
   - Examples: Pulsa → bills, Bensin → transport

7. **Create BulkEditCategoryDialog** (`/components/BulkEditCategoryDialog.tsx`)
   - Select multiple expenses
   - Update category in batch
   - Accessible from ExpenseList

### Phase 4: Testing & Documentation
8. **Testing Checklist**
   - New expense with category
   - Existing expenses (backward compatibility)
   - Bulk edit functionality
   - Template categories
   - Mobile UX

---

## 🔄 Backward Compatibility Strategy

```typescript
// All existing expenses without category → auto fallback to 'other'
const getCategoryEmoji = (category?: ExpenseCategory): string => {
  return EXPENSE_CATEGORIES[category || 'other'].emoji;
};
```

**No data migration needed** - handled at runtime with fallback logic.

---

## 📱 UI/UX Mockups

### AddExpenseForm - Category Selector
```
┌─────────────────────────────────────┐
│ Tambah Pengeluaran                  │
├─────────────────────────────────────┤
│                                     │
│ Nama Pengeluaran                    │
│ ┌─────────────────────────────────┐ │
│ │ Makan Siang                     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Kategori (Opsional)                 │
│ ┌─────────────────────────────────┐ │
│ │ 🍔 Makanan                  ▼  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Jumlah                              │
│ ┌─────────────────────────────────┐ │
│ │ 50,000                          │ │
│ └─────────────────────────────────┘ │
│                                     │
│         [Batal]     [Simpan]        │
└─────────────────────────────────────┘
```

### ExpenseList - Display with Emoji
```
┌─────────────────────────────────────┐
│ Daftar Pengeluaran                  │
├─────────────────────────────────────┤
│ 🍔 Makan Siang         -50,000     │
│ 🚗 Bensin             -100,000     │
│ 📄 Listrik            -200,000     │
│ 👨‍👩‍👧‍👦 Kiriman Ortu     -500,000     │
│ 📦 Belanja Bulanan    -300,000     │
└─────────────────────────────────────┘
```

### Bulk Edit Dialog
```
┌─────────────────────────────────────┐
│ Edit Kategori                       │
├─────────────────────────────────────┤
│ 3 pengeluaran dipilih               │
│                                     │
│ Kategori Baru                       │
│ ┌─────────────────────────────────┐ │
│ │ 🍔 Makanan                  ▼  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Pengeluaran yang akan diupdate:     │
│ • Makan Siang                       │
│ • Nasi Goreng                       │
│ • Kopi                              │
│                                     │
│         [Batal]     [Update]        │
└─────────────────────────────────────┘
```

---

## 🎯 Template Categories Assignment

```typescript
// Example default categories for templates
const TEMPLATE_CATEGORIES = {
  'Pulsa': 'bills',
  'Internet': 'bills',
  'Listrik': 'bills',
  'Air': 'bills',
  'Token Listrik': 'bills',
  'Bensin': 'transport',
  'Parkir': 'transport',
  'Toll': 'transport',
  'Cicilan Motor': 'installment',
  'Cicilan Rumah': 'installment',
  'Bayar Kartu Kredit': 'loan',
  'Netflix': 'entertainment',
  'Spotify': 'entertainment',
  'Gym': 'health',
  'Belanja Bulanan': 'shopping',
  // ... etc
};
```

---

## 🚀 Future Enhancements

### Phase 5: Analytics
- **Category Breakdown Chart** - Pie chart pengeluaran per kategori
- **Monthly Category Trends** - Line chart kategori over time
- **Top Categories** - Kategori dengan pengeluaran terbesar

### Phase 6: Budget Limits
- **Category Budget Limits** - Set max budget per kategori
- **Category Warnings** - Alert saat mendekati limit
- **Category Budget Overview** - Progress bar per kategori

### Phase 7: Filtering & Sorting
- **Category Filter** - Filter expenses by category
- **Multi-Category Filter** - Select multiple categories
- **Sort by Category** - Group dan sort berdasarkan kategori

### Phase 8: Customization
- **Custom Categories** - User bisa add kategori sendiri
- **Custom Emoji** - User bisa ganti emoji kategori
- **Category Aliases** - Multiple names untuk satu kategori
- **Category Colors** - Color coding selain emoji

### Phase 9: Smart Features
- **Auto-Categorization** - AI suggest kategori based on nama
- **Learning from History** - Remember user's category choices
- **Bulk Auto-Categorize** - Auto categorize all uncategorized expenses

### Phase 10: Export & Reporting
- **Category Export** - Export data grouped by category
- **Category Report** - PDF report per kategori
- **Tax Category Mapping** - Map categories to tax categories

---

## 📋 Files to Create/Modify

### New Files
- `/components/BulkEditCategoryDialog.tsx` - Bulk edit component
- `/planning/expense-categories/IMPLEMENTATION_LOG.md` - Track progress
- `/planning/expense-categories/QUICK_REFERENCE.md` - Quick guide

### Modified Files
- `/types/index.ts` - Add types
- `/constants/index.ts` - Add category constants
- `/components/AddExpenseForm.tsx` - Add category selector
- `/components/AddExpenseDialog.tsx` - Pass category to form
- `/components/ExpenseList.tsx` - Display emoji
- `/components/FixedExpenseTemplates.tsx` - Add default categories
- `/utils/calculations.ts` - Add helper functions

---

## ✅ Acceptance Criteria

### Core Features
- [ ] 11 categories dengan emoji muncul di dropdown
- [ ] Emoji display di kiri nama expense di semua views
- [ ] Existing expenses tanpa category fallback ke 'other'
- [ ] Category optional (boleh kosong)
- [ ] Dropdown UI mobile-friendly

### Bulk Edit
- [ ] Select multiple expenses
- [ ] Update category in batch
- [ ] Visual feedback saat update
- [ ] Undo/confirm dialog

### Templates
- [ ] All templates punya default category
- [ ] Category bisa diubah saat add from template
- [ ] Sensible defaults (pulsa=bills, bensin=transport)

### UX/UI
- [ ] Emoji visible dan clear
- [ ] Dropdown smooth di mobile
- [ ] No layout shift saat add emoji
- [ ] Consistent spacing

### Performance
- [ ] No performance degradation
- [ ] Bulk edit efficient (batch update)
- [ ] Lazy load kategori selector jika perlu

---

## 🎓 Technical Notes

### Why Optional Category?
- User flexibility - tidak semua expense perlu dikategorikan
- Backward compatibility - existing data tetap valid
- Progressive disclosure - fitur bisa diadopsi gradually

### Why Emoji-First Display?
- Visual recognition lebih cepat dari text
- Hemat space di mobile
- International (emoji universal)
- Fun & engaging UX

### Bulk Edit Rationale
- User punya banyak uncategorized expenses
- Manual edit satu-satu terlalu lama
- Enable quick cleanup/organization

---

**Planning by**: AI Assistant  
**Reviewed by**: Developer  
**Next Step**: Implementation Phase 1 - Foundation
