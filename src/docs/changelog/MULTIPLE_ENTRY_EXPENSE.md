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

[See full documentation for UI mockups, use cases, technical implementation, and more details]

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

## 📅 Date: November 5, 2025

## ✅ Status: COMPLETE
