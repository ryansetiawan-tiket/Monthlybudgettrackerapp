# Overview - Aplikasi Budget Tracking

## Deskripsi
Aplikasi tracking budget bulanan yang komprehensif dengan fitur lengkap untuk mengelola keuangan pribadi per bulan. Aplikasi ini dibangun menggunakan React, TypeScript, Tailwind CSS, dan terintegrasi dengan Supabase sebagai backend.

## Tujuan Aplikasi
- Membantu user melacak budget bulanan dengan detail
- Mengelola pemasukan dan pengeluaran dengan mudah
- Mendukung multi-currency (IDR & USD) dengan konversi realtime
- Menyediakan template pengeluaran tetap untuk efisiensi
- Memberikan visibilitas penuh terhadap kondisi keuangan bulanan

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS v4.0
- **UI Components**: Shadcn/ui
- **Backend**: Supabase (Edge Functions + Hono server)
- **Database**: Supabase KV Store
- **Icons**: Lucide React
- **External API**: ExchangeRate-API untuk konversi mata uang

## Fitur Utama

### 1. Budget Management
- Input budget awal bulanan
- Auto carryover dari budget bulan sebelumnya (optional)
- Manual input carryover jika diperlukan
- Realtime sync untuk carryover otomatis

### 2. Pemasukan Tambahan
- Input nama pemasukan dengan autocomplete dari riwayat
- Pilihan mata uang: IDR atau USD
- Konversi realtime USD ke Rupiah menggunakan ExchangeRate-API
- Fallback input manual untuk kurs jika API gagal
- List pemasukan dengan detail lengkap

### 3. Pengeluaran
- Tambah pengeluaran dengan nama, jumlah, dan tanggal
- Support untuk pengeluaran dengan multiple items (breakdown)
- Template pengeluaran tetap dengan management lengkap
- Color coding untuk template pengeluaran
- Sorting (ascending/descending) berdasarkan tanggal
- Search & autocomplete untuk nama, hari, dan tanggal
- Keyboard navigation untuk suggestions
- Visual indicator (dot biru berkedip) untuk entry hari ini
- Pemisahan **Upcoming** (hari ini & mendatang) dan **History** (masa lalu)

### 4. Tampilan & UX
- Dark mode support
- Calendar component untuk navigasi bulan
- Navigasi prev/next bulan
- Floating action button untuk tambah data
- Dialog dengan tabs untuk berbagai input
- Responsive design
- Weekend indicator (hijau untuk Sabtu/Minggu)

### 5. Hasil & Summary
- Total budget (awal + carryover + pemasukan)
- Total pengeluaran
- Sisa budget (hasil akhir)
- Color coding: merah jika defisit, hijau jika surplus
- Subtotal untuk upcoming dan history expenses

## Versi & Development
- **Versi**: v1.0 (Initial Release)
- **Status**: Production ready, akan di-iterate seiring waktu
- **Development Approach**: Iterative development dengan continuous improvement

## User Journey
1. User memilih bulan yang ingin ditrack
2. Input budget awal (atau auto carryover dari bulan sebelumnya)
3. Tambah pemasukan tambahan jika ada
4. Input pengeluaran (manual atau menggunakan template)
5. Monitor sisa budget realtime
6. Review riwayat pengeluaran
7. Budget akhir bulan bisa auto carryover ke bulan berikutnya

## Key Benefits
✅ Pencatatan keuangan yang terorganisir per bulan
✅ Tidak perlu hitung manual untuk konversi mata uang
✅ Template untuk pengeluaran rutin (hemat waktu)
✅ Autocomplete mengurangi typo dan mempercepat input
✅ Visual indicator membantu identifikasi pengeluaran penting
✅ Pemisahan upcoming vs history untuk fokus yang lebih baik
✅ Data tersimpan aman di cloud (Supabase)
