# Timeline Kantong - Visual Refactor v3

**Status:** ✅ COMPLETE  
**Tujuan:** Maksimalkan kecepatan skimming & kejelasan hierarki visual

---

## 🎯 4 Perubahan Layout

### 1. Universal Transaction Icons (Lingkaran Berwarna)
**Masalah:** Ikon $ dan 🛍️ terlalu spesifik, bisa misleading.

**Solusi:**
- ✅ **Income:** Lingkaran Hijau + ikon `Plus` (Lucide)
- ✅ **Expense:** Lingkaran Merah + ikon `Minus` (Lucide)  
- ✅ **Transfer:** Lingkaran Biru + ikon `ArrowRight` (sudah benar, pertahankan)

**File:** `PocketTimeline.tsx` - function `getIcon()`

---

### 2. Emoji Kategori (Wajib Tampil)
**Masalah:** User tidak tahu kategori transaksi secara visual.

**Solusi:**
- Fetch emoji kategori dari `useCategorySettings()`
- Tampilkan emoji **inline** di sebelah kiri nama transaksi
- Format: `{emoji} {description}`
- Fallback: Jika tidak ada kategori, skip emoji (income/transfer)

**Dependency:**
```typescript
import { useCategorySettings } from "../hooks/useCategorySettings";
import { getCategoryConfig } from "../utils/categoryManager";
```

**Logic:**
```typescript
// Get category emoji from metadata
const categoryId = entry.metadata?.category;
const categoryConfig = categoryId ? getCategoryConfig(categoryId, settings) : null;
const categoryEmoji = categoryConfig?.emoji || '';
```

---

### 3. Gabungkan Metadata (De-clutter)
**Masalah:** Tanggal, waktu, dan badge "Akan Datang" memakan ruang vertikal.

**Solusi:**
- Gabung jadi **1 baris** teks abu-abu kecil
- Format: `{badge} • {date}, {time}`
- Contoh: `Akan Datang • 26 Nov 2025, 05:57`
- Atau (tanpa badge): `26 Nov 2025, 05:57`

**File:** `PocketTimeline.tsx` - bagian metadata display

---

### 4. Hierarki Nominal & Saldo (Kanan Jauh)
**Masalah:** Nominal dan saldo kurang menonjol secara visual.

**Solusi:**
- **Nominal transaksi:** Lebih besar, bold (sudah ada)
- **Saldo:** Font lebih kecil (text-xs), warna muted (text-muted-foreground)
- Pertahankan alignment kanan

**File:** `PocketTimeline.tsx` - bagian amount display (sudah OK, cek saja)

---

## 📝 Implementation Checklist

- [x] 1. Import dependencies: `useCategorySettings`, `getCategoryConfig`, `Plus`, `Minus`
- [x] 2. Add `useCategorySettings()` hook di component
- [x] 3. Update `getIcon()` function untuk universal icons (+, -, →)
- [x] 4. Add category emoji logic di entry rendering
- [x] 5. Gabungkan metadata (badge + date) jadi 1 baris
- [x] 6. Verify hierarki nominal & saldo (already correct)
- [ ] 7. Test dengan data real

---

## 🎨 Target Layout

```
[Timeline Drawer]
------------------------------------------------------------------
   [Header Tanggal]
   Rabu, 26 November 2025
   (Garis pemisah tipis)

     [Item Card]
     (Kiri)
     [Icon: Red -]    🏨 Hotel
                      <Abu-abu> Akan Datang • 26 Nov 2025, 05:57
     
     (Kanan)
     -Rp 1.557.208
     <Abu-abu kecil> Saldo: Rp 13.104.435
------------------------------------------------------------------
```

---

## ⚠️ BACKWARD COMPATIBILITY

✅ **SAFE** - Hanya visual changes, tidak ada perubahan data structure.

---

## 📁 Files to Modify

1. `/components/PocketTimeline.tsx` - Main component

---

**Ready to execute!** 🚀
