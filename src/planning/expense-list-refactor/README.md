# Refactor Besar: Daftar Transaksi Header & Bulk Action

## 📋 Overview

Refactor ini bertujuan untuk:
1. **Mengelompokkan ulang** elemen UI berdasarkan fungsi logis
2. **Modernisasi alur bulk action** dengan pattern yang intuitif per platform (Mobile: long press, Desktop: hover checkbox)
3. **Memperbaiki kontras visual** checkbox untuk accessibility

## 🎯 Tujuan Utama

### Masalah Saat Ini
- Header "Daftar Transaksi" mencampur 3 jenis aksi berbeda (konfigurasi, mode-switch, tools) dengan tampilan data
- Layout terasa janggal: `[🔒 Lock] [Pilih] [↑↓] -Rp 4.168.170`
- Checkbox abu-abu pudar tidak terlihat di background gelap
- Bulk action mode tidak bisa digunakan di tab "Pemasukan"

### Solusi
- Pengelompokan logis: tools dengan tools, data dengan kontrol
- Pattern interaksi modern: long press (mobile) + hover checkbox (desktop)
- High contrast checkbox untuk visibility
- Unified bulk action untuk Pengeluaran DAN Pemasukan

## 📂 Dokumen Terkait

- [PLANNING.md](./PLANNING.md) - Analisis detail & breakdown perubahan
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Step-by-step implementation
- [VISUAL_MOCKUP.md](./VISUAL_MOCKUP.md) - Mockup visual before/after
- [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) - Testing scenarios

## 🚀 Quick Start

1. Baca [PLANNING.md](./PLANNING.md) untuk memahami scope
2. Review [VISUAL_MOCKUP.md](./VISUAL_MOCKUP.md) untuk target UI
3. Ikuti [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) untuk eksekusi
4. Gunakan [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) untuk verifikasi

## ⚠️ Critical Points

- **Harus handle 2 tabs**: Pengeluaran DAN Pemasukan
- **Harus handle 2 types**: Single expense DAN grouped expenses (with items)
- **Harus responsive**: Mobile (long press) DAN Desktop (hover checkbox)
- **High contrast**: Checkbox harus visible dengan border putih solid
