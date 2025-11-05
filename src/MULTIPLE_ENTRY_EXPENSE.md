# Feature: Multiple Entry Expense

## Overview

Dialog tambah pengeluaran sekarang mendukung **multiple entries** untuk satu tanggal yang sama, plus **responsive UI** dengan bottomsheet untuk mobile.

## ✨ Fitur Baru

### 1. **Multiple Entry Support**
- User bisa menambahkan beberapa pengeluaran sekaligus untuk 1 tanggal
- Setiap entry memiliki:
  - Nama (opsional)
  - Nominal dengan math operation support
  - Pilihan kantong sumber dana
- Tombol "Tambah Entry Baru" untuk menambah entry
- Tombol hapus untuk setiap entry (minimal 1 entry harus ada)
- Total amount ditampilkan jika ada lebih dari 1 entry

### 2. **Responsive Dialog/Drawer**
- **Desktop**: Dialog biasa (center screen)
- **Mobile**: Drawer/Bottomsheet (slide from bottom)
- Auto-detect device dengan `useIsMobile()` hook
- Breakpoint: 768px

### 3. **Math Operations (Tetap Berfungsi)**
- Support operasi: `+`, `-`, `*`, `/`, `()`, `%`
- Real-time calculation preview
- Contoh: `50000+4000-20%` = Rp 43,200

## 📱 UI/UX

### Desktop View
```
┌─────────────────────────────────────┐
│  Tambah Pengeluaran            [X]  │
├─────────────────────────────────────┤
│  [Manual] [Template]                │
│                                     │
│  Tanggal: [<] Senin, 5 Nov [>]     │
│  ─────────────────────────────────  │
│                                     │
│  Pengeluaran (2)    Total: Rp 100k │
│                                     │
│  ┌─ Entry 1 ──────────────── [X] ─┐│
│  │ Nama: Makan Siang              ││
│  │ Nominal: 50000                 ││
│  │ Kantong: Kantong Sehari-hari  ││
│  └────────────────────────────────┘│
│                                     │
│  ┌─ Entry 2 ──────────────── [X] ─┐│
│  │ Nama: Bensin                   ││
│  │ Nominal: 50000                 ││
│  │ Kantong: Kantong Sehari-hari  ││
│  └────────────────────────────────┘│
│                                     │
│  [+ Tambah Entry Baru]             │
│  [Tambah 2 Pengeluaran]            │
│                                     │
│  ─────────────────────────────────  │
│  Template Section...                │
└─────────────────────────────────────┘
```

### Mobile View (Bottomsheet)
```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     ─────────────           │   │
│  │  Tambah Pengeluaran         │   │
│  │                             │   │
│  │  Tanggal: [<] Sen, 5 Nov [>]│   │
│  │  ────────────────────────── │   │
│  │                             │   │
│  │  Entry 1                [X] │   │
│  │  Nama: [...............]    │   │
│  │  Nominal: [............]    │   │
│  │  Kantong: [▼ Sehari-hari]  │   │
│  │                             │   │
│  │  [+ Tambah Entry Baru]      │   │
│  │  [Tambah 1 Pengeluaran]     │   │
│  │                             │   │
│  │  (scrollable content)       │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

## 🎯 Use Cases

### Use Case 1: Belanja Harian
User pergi ke supermarket dan ingin mencatat beberapa pembelian:
1. Buka dialog tambah pengeluaran
2. Entry 1: "Sayuran" - Rp 25,000
3. Klik "Tambah Entry Baru"
4. Entry 2: "Daging" - Rp 75,000
5. Entry 3: "Buah" - Rp 30,000
6. Klik "Tambah 3 Pengeluaran"
7. ✅ 3 expense tercatat dengan tanggal yang sama

### Use Case 2: Multiple Transaksi Berbeda Kantong
1. Entry 1: "Makan" dari "Kantong Sehari-hari"
2. Entry 2: "Investasi" dari "Kantong Uang Dingin"
3. Entry 3: "Tabungan" dari "Kantong Custom"
4. Submit semua sekaligus

### Use Case 3: Mobile Quick Entry
User sedang di jalan dan ingin cepat input expense:
1. Buka app di mobile
2. Bottomsheet muncul dari bawah
3. Quick input dengan keyboard mobile
4. Submit dan close

## 💻 Technical Implementation

### Component Structure
```
AddExpenseDialog (Container)
├── useIsMobile() → detect device
├── if mobile:
│   └── Drawer + DrawerContent
└── if desktop:
    └── Dialog + DialogContent
        
AddExpenseForm (Form Logic)
├── Multiple entries state management
├── Math operation evaluation
├── Template support (unchanged)
└── Validation & submission
```

### State Management
```tsx
interface ExpenseEntry {
  id: string;              // UUID for React key
  name: string;            // Entry name (optional)
  amount: string;          // Raw input (e.g., "50000+4000")
  calculatedAmount: number | null;  // Calculated result
  pocketId: string;        // Source pocket
}

const [entries, setEntries] = useState<ExpenseEntry[]>([...]);
```

### Key Functions

#### 1. Add New Entry
```tsx
const addNewEntry = () => {
  const defaultPocket = pockets.length > 0 ? pockets[0].id : 'pocket_daily';
  setEntries(prev => [...prev, {
    id: crypto.randomUUID(),
    name: "",
    amount: "",
    calculatedAmount: null,
    pocketId: defaultPocket
  }]);
};
```

#### 2. Remove Entry
```tsx
const removeEntry = (entryId: string) => {
  if (entries.length > 1) {
    setEntries(prev => prev.filter(entry => entry.id !== entryId));
  }
};
```

#### 3. Update Entry Calculation
```tsx
const updateEntryCalculation = (entryId: string, amount: string) => {
  const result = evaluateExpression(amount);
  setEntries(prev => prev.map(entry => 
    entry.id === entryId 
      ? { ...entry, amount, calculatedAmount: result }
      : entry
  ));
};
```

#### 4. Submit Multiple Entries
```tsx
const handleSubmitMultiple = async () => {
  const validEntries = entries.filter(entry => {
    const finalAmount = entry.calculatedAmount ?? Number(entry.amount);
    return finalAmount > 0;
  });

  for (const entry of validEntries) {
    const finalAmount = entry.calculatedAmount ?? Number(entry.amount);
    const finalName = entry.name.trim() || formatDateToIndonesian(date);
    
    onAddExpense(finalName, finalAmount, date, undefined, undefined, entry.pocketId);
  }

  if (onSuccess) onSuccess();
  resetEntries();
};
```

## 🔧 Modified Files

1. **`/components/AddExpenseDialog.tsx`** - REWRITTEN
   - Added responsive logic (Dialog vs Drawer)
   - Uses `useIsMobile()` hook
   - Conditional rendering based on device

2. **`/components/AddExpenseForm.tsx`** - REWRITTEN
   - Complete refactor to support multiple entries
   - New state structure with entries array
   - Add/remove entry functionality
   - Total amount calculation
   - Preserved template functionality

## 📋 Features Preserved

✅ Template system tetap berfungsi
✅ Math operations tetap berfungsi  
✅ Pocket selection tetap berfungsi
✅ Date picker dengan prev/next tetap berfungsi
✅ Real-time balance display tetap berfungsi
✅ All original functionality preserved

## 🎨 UI Improvements

### Card Design for Entries
- Setiap entry dibungkus dengan Card untuk visual separation
- Entry number ditampilkan (Entry 1, Entry 2, ...)
- Delete button di pojok kanan atas setiap card

### Total Display
- Jika ada lebih dari 1 entry, total ditampilkan di header
- Format: "Pengeluaran (3) Total: Rp 150,000"

### Responsive Spacing
- Desktop: max-width 2xl dengan proper padding
- Mobile: Full width dengan optimized spacing untuk thumb reach

## ✅ Testing Checklist

### Desktop
- [ ] Dialog terbuka dengan benar
- [ ] Bisa menambah entry baru
- [ ] Bisa menghapus entry (min 1)
- [ ] Math operations bekerja per entry
- [ ] Total calculation benar
- [ ] Submit multiple entries sukses
- [ ] Template system masih bekerja

### Mobile
- [ ] Drawer muncul dari bawah (bottomsheet)
- [ ] Touch interactions smooth
- [ ] Keyboard tidak overlap form
- [ ] Scrolling bekerja dengan baik
- [ ] Submit dan close behavior correct

### Edge Cases
- [ ] Submit dengan 1 entry (normal mode)
- [ ] Submit dengan multiple entries
- [ ] Hapus entry hingga tersisa 1
- [ ] Ganti tanggal ketika sudah ada multiple entries
- [ ] Ganti pocket untuk setiap entry
- [ ] Mix valid dan invalid entries (filter otomatis)

## 🚀 Usage Example

### Single Entry (Same as Before)
```tsx
// User input
Entry 1:
- Name: Makan
- Amount: 50000
- Pocket: Daily

// Result: 1 expense created
```

### Multiple Entries
```tsx
// User input
Entry 1:
- Name: Bensin
- Amount: 100000
- Pocket: Daily

Entry 2:
- Name: Parkir
- Amount: 5000
- Pocket: Daily

Entry 3:
- Name: Tol
- Amount: 25000
- Pocket: Daily

// Result: 3 expenses created for the same date
```

## 📝 Notes

### Why Multiple Entries?
- **Convenience**: Input beberapa expense sekaligus tanpa buka-tutup dialog
- **Context**: Expense yang terjadi di hari yang sama (e.g., shopping trip)
- **Speed**: Faster input untuk power users
- **Accuracy**: Lebih mudah track detail expense di 1 session

### Why Bottomsheet for Mobile?
- **Ergonomics**: Lebih mudah dijangkau thumb di bottom screen
- **Native Feel**: Following mobile UX best practices
- **Space**: Maximize content area
- **Gesture**: Support swipe-to-close gesture (built-in vaul)

### Performance Considerations
- Minimal re-renders dengan proper state management
- UUID generation hanya saat add entry
- Calculation per entry (tidak re-calculate semua)
- Lazy evaluation untuk validation

## 🎉 Benefits

1. **User Experience**
   - Faster expense entry workflow
   - Less context switching
   - More natural input flow
   
2. **Mobile First**
   - Native mobile experience
   - Better thumb ergonomics
   - Gesture support

3. **Flexibility**
   - Support single entry (backward compatible)
   - Support multiple entries (new capability)
   - Per-entry pocket selection

4. **Data Accuracy**
   - Better grouping untuk related expenses
   - Timestamp accuracy (same date/time)
   - Detailed tracking

## 📅 Date: November 5, 2025

## ✅ Status: COMPLETE
