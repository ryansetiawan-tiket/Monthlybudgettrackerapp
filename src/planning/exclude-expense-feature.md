# Fitur Exclude Pengeluaran Sementara

**Tanggal**: 18 Oktober 2025  
**Status**: ✅ Selesai Implementasi

---

## 📋 Ringkasan

Fitur untuk mengecualikan pengeluaran sementara dari perhitungan total tanpa menghapusnya dari database. Berguna untuk skenario:
- Pengeluaran yang belum pasti (pending confirmation)
- Simulasi budget tanpa pengeluaran tertentu
- Membandingkan skenario dengan/tanpa pengeluaran tertentu

---

## 🎯 Fungsionalitas

### Tombol Toggle Exclude
- **Lokasi**: Di antara tombol Edit (pensil) dan Delete (tong sampah)
- **Icon**: 
  - 👁️ Eye: Item aktif (dihitung dalam total)
  - 👁️‍🗨️ EyeOff: Item excluded (tidak dihitung)
- **Action**: Click untuk toggle status exclude

### Visual Indicator
**Item yang Di-exclude:**
- Opacity 50% (tampak redup)
- Background `bg-muted/30`
- Text dengan line-through (coret)
- Amount dengan line-through

**Header Indicator:**
- Badge `(X excluded)` muncul di header ketika ada item yang di-exclude
- Tooltip menunjukkan jumlah item dikecualikan

### Perhitungan
- Total pengeluaran **tidak** menghitung item yang di-exclude
- BudgetOverview menampilkan sisa budget dengan perhitungan yang benar
- Subtotal "Hari Ini & Mendatang" dan "Riwayat" juga mengexclude item

---

## 🔧 Implementasi Teknis

### State Management
```typescript
// Local state di ExpenseList.tsx
const [excludedExpenseIds, setExcludedExpenseIds] = useState<Set<string>>(new Set());

// Global state di App.tsx untuk calculation
const [excludedExpenseIds, setExcludedExpenseIds] = useState<Set<string>>(new Set());
```

### Calculation Logic
```typescript
// Filter excluded items saat menghitung total
const totalExpenses = expenses
  .filter(expense => !excludedExpenseIds.has(expense.id))
  .reduce((sum, expense) => sum + expense.amount, 0);
```

### Props Communication
```typescript
interface ExpenseListProps {
  // ... existing props
  onExcludedIdsChange?: (ids: Set<string>) => void;
}

// Di App.tsx
<ExpenseList
  // ... existing props
  onExcludedIdsChange={setExcludedExpenseIds}
/>
```

---

## 🧹 Auto-Cleanup

### Reset Scenarios
1. **Ganti Bulan**: Excluded IDs di-reset ke kosong
2. **Delete Item**: Item otomatis dihapus dari excluded list
3. **Bulk Delete**: Invalid IDs dibersihkan otomatis

### Implementation
```typescript
// Reset saat month change (App.tsx)
useEffect(() => {
  setExcludedExpenseIds(new Set());
  // ... load data
}, [selectedMonth, selectedYear]);

// Clean up invalid IDs (ExpenseList.tsx)
useEffect(() => {
  const validExcludedIds = new Set(
    Array.from(excludedExpenseIds).filter(id => 
      expenses.some(exp => exp.id === id)
    )
  );
  // ... update state
}, [expenses]);
```

---

## 📱 User Experience

### Feedback
- **Toast saat Exclude**: "Nama Item dikecualikan dari hitungan" (info)
- **Toast saat Include**: "Nama Item dimasukkan kembali dalam hitungan" (success)
- **Tooltip**: Hover pada icon menunjukkan action yang akan dilakukan
- **Visual**: Item langsung berubah tampilan (opacity + strikethrough)

### Keyboard Support
- Tab untuk navigasi ke tombol
- Enter/Space untuk toggle
- Tombol disabled saat bulk select mode aktif

---

## ⚠️ Catatan Penting

### Sementara (Non-Persistent)
- **Tidak disimpan ke database**
- Reset ketika refresh page
- Reset ketika ganti bulan
- Hanya untuk simulasi/analisis sementara

### Kompatibilitas
- ✅ Bekerja dengan search & filter
- ✅ Bekerja dengan sort order
- ✅ Bekerja dengan collapsible items
- ✅ Kompatibel dengan bulk select mode (tombol disembunyikan)
- ✅ Update realtime di BudgetOverview

---

## 🎨 Styling Classes

### Excluded Item Styles
```tsx
// Container
className={`... ${isExcluded ? 'opacity-50 bg-muted/30' : ''}`}

// Text elements
className={`... ${isExcluded ? 'line-through' : ''}`}
```

---

## 🧪 Testing

### Manual Testing Checklist
- [x] Toggle exclude/include berfungsi
- [x] Visual indicator muncul dengan benar
- [x] Total calculation benar (dengan & tanpa excluded)
- [x] BudgetOverview update dengan benar
- [x] Toast notification muncul
- [x] Reset saat ganti bulan
- [x] Cleanup saat delete item
- [x] Badge counter di header akurat
- [x] Tooltip informatif
- [x] Kompatibel dengan bulk mode

---

## 🚀 Future Enhancements

### Potential Features (v2)
- [ ] Simpan excluded state ke localStorage (persistent dalam sesi)
- [ ] Bulk exclude/include
- [ ] Filter untuk show/hide excluded items
- [ ] Export report dengan/tanpa excluded items
- [ ] Undo/redo exclude action
- [ ] Exclude reason/note

---

## 📊 Impact

### Before
- User harus delete pengeluaran untuk melihat skenario tanpa item tersebut
- Tidak bisa simulasi budget dengan mudah
- Perlu re-input jika ternyata pengeluaran dibatalkan

### After  
- ✅ Toggle cepat untuk exclude/include
- ✅ Simulasi budget lebih mudah
- ✅ Data tetap aman (tidak terhapus)
- ✅ Flexible analysis

---

**Implementor**: AI Assistant  
**Review**: ✅ Ready for use  
**Version**: 1.0.0
