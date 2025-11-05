# 🎯 Wishlist & Simulation - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Buka Wishlist

1. Di halaman utama, lihat section **"Ringkasan Kantong"**
2. Pilih kantong yang ingin ditambahkan wishlist (misal: Kantong Uang Dingin)
3. Klik button **"Simulasi Wishlist"** di bagian bawah card kantong

### Step 2: Tambah Item Pertama

1. Di dialog yang terbuka, klik **"+ Tambah Item"**
2. Isi form:
   - **Nama Item**: Contoh "Gaming Console"
   - **Harga**: Contoh 8.000.000
   - **Prioritas**: Pilih High/Medium/Low
   - (Opsional) Target tanggal, deskripsi, link produk
3. Klik **"Tambah"**

### Step 3: Lihat Simulasi

Setelah item ditambahkan, sistem otomatis menampilkan:

✅ **Status Affordability**:
- ✅ Hijau = Bisa dibeli sekarang
- 🕐 Kuning = Affordable soon (kurang sedikit)
- ❌ Merah = Belum bisa dibeli

📊 **Progress Bar**: Menunjukkan % kemampuan beli dari total wishlist

💡 **Smart Recommendations**:
- "Bisa beli N item sekarang"
- "Transfer Rp X/minggu untuk beli dalam N minggu"
- "Kurang Rp X untuk beli semua items"

### Step 4: Beli Item

Jika item sudah ✅ affordable:
1. Klik button **"Beli Sekarang"**
2. Confirm pembelian
3. Item otomatis jadi pengeluaran
4. Saldo kantong berkurang
5. Item ditandai "purchased" di wishlist

---

## 🎬 Example Usage Scenario

### Skenario: Ingin Beli Gaming Setup

**Initial State:**
- Kantong Uang Dingin: Rp 5.000.000

**Wishlist yang Ditambahkan:**

1. **Gaming Console** - Rp 8.000.000 - ⭐ High
2. **Gaming Keyboard** - Rp 1.500.000 - 🟡 Medium  
3. **Gaming Mouse** - Rp 800.000 - 🔵 Low

**Simulation Result:**

```
Current Balance: Rp 5.000.000
Total Wishlist: Rp 10.300.000
Affordability: 48%

Status per Item:
✅ Gaming Mouse (Low) - Bisa dibeli, sisa Rp 4.200.000
🕐 Gaming Keyboard (Medium) - Kurang Rp 100.000, ~1 minggu lagi
❌ Gaming Console (High) - Kurang Rp 3.000.000, ~12 minggu

Recommendations:
💡 Bisa beli Gaming Mouse sekarang
💰 Transfer Rp 100.000 untuk beli Keyboard minggu depan
⚠️ Console butuh lebih banyak tabungan, prioritaskan transfer
```

**User Decision:**
- Beli Gaming Mouse sekarang (Rp 800.000)
- Transfer Rp 200.000 dari Kantong Sehari-hari
- Wait 1 week, then beli Keyboard
- Lanjut nabung untuk Console

---

## 📱 UI Overview

### Main Simulation View

```
┌─────────────────────────────────────────┐
│ 🎯 Simulasi Budget - Uang Dingin       │
│                          [+ Tambah Item] │
├─────────────────────────────────────────┤
│ Saldo Tersedia     Total Wishlist       │
│ Rp 5.000.000       Rp 10.300.000        │
│                                          │
│ Kemampuan Beli            48%            │
│ [████████░░░░░░░░░░] ────────────────    │
│                                          │
│ 💡 Bisa beli 1 item sekarang            │
│ 💰 Transfer Rp X/minggu untuk ...       │
├─────────────────────────────────────────┤
│ Priority Breakdown                       │
│ ⭐ High: 1 item (Rp 8.000.000)          │
│ 🟡 Medium: 1 item (Rp 1.500.000)        │
│ 🔵 Low: 1 item (Rp 800.000)             │
├─────────────────────────────────────────┤
│ Items Wishlist                           │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ Gaming Mouse            🔵 Low      │ │
│ │ Rp 800.000                          │ │
│ │                                     │ │
│ │ ✅ Bisa dibeli sekarang             │ │
│ │ Sisa saldo: Rp 4.200.000            │ │
│ │                                     │ │
│ │ [🛒 Beli Sekarang]                  │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ Gaming Keyboard      🟡 Medium      │ │
│ │ Rp 1.500.000                        │ │
│ │                                     │ │
│ │ 🕐 Kurang Rp 100.000 (~1 minggu)    │ │
│ │ ⚠️ Jika beli Mouse, kurang Rp ...   │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ Gaming Console       ⭐ High        │ │
│ │ Rp 8.000.000                        │ │
│ │                                     │ │
│ │ ❌ Belum bisa dibeli                │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 🔑 Key Features

### 1. Priority-Based Simulation
- Items diurutkan berdasarkan prioritas (High → Medium → Low)
- Simulasi menunjukkan impact pembelian secara cascade
- "Jika beli A, apakah masih bisa beli B?"

### 2. Smart Affordability Status
- **Affordable Now**: Saldo cukup untuk beli + masih ada sisa
- **Low Balance**: Bisa beli tapi sisa sedikit (< Rp 500k)
- **Affordable Soon**: Kurang sedikit, dengan estimasi waktu
- **Insufficient**: Belum bisa dibeli

### 3. Real-Time Updates
- Simulasi otomatis recalculate setelah:
  - Tambah/edit/delete item
  - Transfer antar kantong
  - Pengeluaran baru
  - Pemasukan tambahan

### 4. One-Click Purchase
- Button "Beli Sekarang" untuk affordable items
- Auto-convert ke expense
- Linked metadata untuk tracking
- Status update otomatis

### 5. Actionable Recommendations
- Personalized untuk setiap saldo
- Consider prioritas items
- Realistic timeline estimates
- Specific action suggestions

---

## 🎨 Priority Guidelines

### ⭐ High Priority
- **Use for**: Must-have items, urgent needs
- **Budget planning**: Prioritize savings untuk ini
- **Example**: 
  - Emergency purchase
  - Time-sensitive deals
  - Critical upgrades

### 🟡 Medium Priority
- **Use for**: Want-to-have items, planned purchases
- **Budget planning**: Balanced savings approach
- **Example**:
  - Regular upgrades
  - Nice-to-have items
  - Planned purchases within 1-3 months

### 🔵 Low Priority
- **Use for**: Nice-to-have, flexible timing
- **Budget planning**: Buy jika ada sisa budget
- **Example**:
  - Impulse buys
  - Future plans (> 3 months)
  - Lowest urgency items

---

## 💡 Pro Tips

### Tip 1: Start with High Priority Items
Tambahkan high-priority items dulu untuk lihat apakah saldo cukup. Baru tambahkan medium/low untuk planning.

### Tip 2: Use Target Dates
Set target tanggal untuk items dengan deadline (misal: promo ends, event date). Simulasi akan calculate urgency.

### Tip 3: Add Product URLs
Simpan link produk untuk quick reference. Klik external link icon untuk buka langsung.

### Tip 4: Review Recommendations
Baca smart recommendations untuk actionable insights. Sistem analisa saldo dan kasih saran realistis.

### Tip 5: One Pocket at a Time
Fokus wishlist per kantong untuk budget clarity. Jangan campur wishlist hobi dan daily needs.

### Tip 6: Update Regularly
Update wishlist saat ada perubahan harga atau prioritas berubah. Simulasi real-time akan adjust.

### Tip 7: Convert When Affordable
Jangan tunda pembelian affordable items jika memang sudah waktunya. Use "Beli Sekarang" untuk seamless tracking.

---

## ❓ FAQ

### Q: Apakah wishlist sama untuk semua bulan?
**A**: Tidak. Wishlist adalah per-bulan per-kantong. Setiap bulan baru memulai fresh wishlist. Future feature: carry over wishlist items.

### Q: Bagaimana jika saldo berubah setelah transfer?
**A**: Simulasi otomatis recalculate. Refresh dialog atau buka kembali untuk lihat update.

### Q: Bisa add wishlist untuk semua kantong sekaligus?
**A**: Ya. Setiap kantong punya wishlist sendiri. Bisa buka simulasi untuk setiap kantong.

### Q: Estimasi waktu akurat?
**A**: Estimasi based on asumsi income Rp 250k/minggu. Ini hanya guideline. Actual bisa berbeda tergantung income pattern.

### Q: Item purchased masih muncul di wishlist?
**A**: Tidak. Purchased items di-filter by default. Bisa enable `includePurchased=true` di API untuk history.

### Q: Bisa edit item setelah ditambahkan?
**A**: Ya. Klik icon Edit di setiap item card untuk update nama, harga, prioritas, dll.

### Q: Maksimal berapa item per wishlist?
**A**: No hard limit, tapi recommend max 10-15 items per pocket untuk UI clarity.

### Q: Apakah simulasi consider transfer keluar?
**A**: Ya. Simulasi gunakan **available balance** yang sudah termasuk transfer in/out dan expenses.

---

## 🚀 Next Steps After Adding Wishlist

1. **Review simulasi** untuk understand budget situation
2. **Prioritize items** based on affordability dan urgency
3. **Plan transfers** jika butuh top-up kantong
4. **Set reminders** untuk check wishlist secara berkala
5. **Update priorities** saat situasi berubah
6. **Purchase items** saat sudah affordable
7. **Track spending** via expense list dengan wishlist link

---

## 📞 Support & Documentation

**Full Documentation**: `/planning/pockets-system/WISHLIST_IMPLEMENTATION.md`

**API Reference**:
- GET `/wishlist/:year/:month/:pocketId`
- POST `/wishlist/:year/:month/:pocketId`
- PUT `/wishlist/:year/:month/:pocketId/:itemId`
- DELETE `/wishlist/:year/:month/:pocketId/:itemId`
- POST `/wishlist/:year/:month/:pocketId/simulate`
- POST `/wishlist/:year/:month/:pocketId/:itemId/purchase`

**Components**:
- `WishlistDialog.tsx` - Add/edit form
- `WishlistSimulation.tsx` - Main view
- `PocketsSummary.tsx` - Entry point

---

**Happy Budgeting! 🎯💰**
