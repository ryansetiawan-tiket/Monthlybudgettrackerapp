# Quick Fix: Saldo Awal Desember

**Problem:** Saldo Awal Desember shows **-Rp 376.631** instead of **+Rp 376.630**

---

## ✅ Solution (Choose One)

### Option 1: In-App Button (Recommended - Easiest!)

**Steps:**
1. Buka aplikasi, **navigate ke November 2025**
2. Buka **Timeline** kantong mana saja (misal: PayLater)
3. Klik tombol **3 dots (⋮)** di pojok kanan atas
4. Pilih **"Re-kalkulasi Saldo Awal"** (warna biru)
5. Tunggu proses selesai (icon akan berputar)
6. Page akan refresh otomatis
7. **Done!** Navigate ke Desember untuk verify

**Screenshot Guide:**
```
Timeline PayLater (November 2025)
┌──────────────────────────────────────┐
│ Timeline PayLater     [≡] [+] [⋮]   │ ← Click [⋮]
├──────────────────────────────────────┤
│  ╔════════════════════════════╗      │
│  ║ Info Kantong               ║      │
│  ║ Re-kalkulasi Saldo Awal ✨ ║ ← Click this!
│  ║ Edit Kantong               ║      │
│  ║ Hapus Kantong              ║      │
│  ╚════════════════════════════╝      │
└──────────────────────────────────────┘
```

**Note:** Button ini **hanya muncul di November 2025** (otomatis hidden di bulan lain)

---

### Option 2: Browser Console (Advanced)

```javascript
// 1. Open browser console (F12)
// 2. Copy and paste this code:

(async () => {
  const baseUrl = 'https://vszpntayvgtayfmfxhzf.supabase.co/functions/v1/make-server-3adbeaf1';
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzenBudGF5dmd0YXlmbWZ4aHpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkxNDI0MzIsImV4cCI6MjA0NDcxODQzMn0.QqoSx-KuZf_Sz6DcHiNRoLbVZFaOlUYiFUGIR7o03RY';
  
  const response = await fetch(`${baseUrl}/carryover/generate/2025/11`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const result = await response.json();
  console.log('✅ Carry-over regenerated:', result);
  
  // Refresh page
  window.location.reload();
})();
```

### Option 3: Navigate Away and Back

**Steps:**
1. Open app, go to **November 2025**
2. Click month selector
3. Navigate to **January 2026** (skip December)
4. Navigate back to **December 2025**
5. Done! Saldo Awal will be recalculated

### Option 4: Manual API Call

```bash
# Replace with your actual API URL if different
curl -X POST \
  "https://vszpntayvgtayfmfxhzf.supabase.co/functions/v1/make-server-3adbeaf1/carryover/generate/2025/11" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzenBudGF5dmd0YXlmbWZ4aHpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkxNDI0MzIsImV4cCI6MjA0NDcxODQzMn0.QqoSx-KuZf_Sz6DcHiNRoLbVZFaOlUYiFUGIR7o03RY"
```

---

## ✅ Verify Fix

After running one of the options above:

1. Navigate to **December 2025**
2. Open **PayLater** timeline
3. Check "Saldo Awal" entry
4. Should show: **+Rp 376.630** ✅

---

## 🔍 Why This Happened

- TUGAS 1 fixed balance calculation (November now shows correct projected balance)
- But December carry-over was already generated with **old logic**
- Re-generating carry-over uses **new logic** with correct projected balance

---

## ⚠️ Important Notes

- This fix is **safe** (can run multiple times)
- Only affects **existing** carry-overs (already generated)
- **Future** carry-overs (new months) will be correct automatically
- No data loss or side effects

---

**Recommendation:** Use **Option 1** (in-app button) - easiest and most user-friendly! ✨
