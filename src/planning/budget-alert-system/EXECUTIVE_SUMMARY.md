# Budget Alert System - Executive Summary

**TL;DR:** Real-time budget monitoring dengan 2 fitur peringatan! 🚨

---

## 🎯 APA INI?

Sistem peringatan budget yang:
1. **Kasih tau** pas budget lo mulai habis (toast alert)
2. **Cegah** budget lo jebol dengan konfirmasi dulu (dialog)

**Tone of Voice:** Santai, kocak, friendly - sesuai personality app kita! 😎

---

## ✨ FITUR 1: TOAST ALERT (PASSIVE)

### Kapan Muncul?
SETELAH lo save transaksi, kalau budget status naik level:

```
Safe (0-79%) → Warning (80-89%)  →  😅 "Hati-hati, Bos!"
Warning      → Danger (90-99%)    →  😱 "Awas!"
Danger       → Exceeded (100%+)   →  🚨 "WADUH! JEBOL!"
```

### Gimana Tampilannya?

**Warning Toast (Kuning):**
```
┌────────────────────────────────────┐
│ 😅  Hati-hati, Bos!                │
│                                    │
│ Budget 'Game' udah masuk zona      │
│ kuning (85%)!                      │
│                                    │
│ Total: Rp 425.000 dari             │
│ Rp 500.000                         │
└────────────────────────────────────┘
Auto-dismiss: 5 detik
```

**Danger Toast (Oranye):**
```
┌────────────────────────────────────┐
│ 😱  Awas!                          │
│                                    │
│ Budget 'Game' lo udah mepet banget │
│ (95%)!                             │
│                                    │
│ Total: Rp 475.000 dari             │
│ Rp 500.000                         │
└────────────────────────────────────┘
Auto-dismiss: 6 detik
```

**Exceeded Toast (Merah):**
```
┌────────────────────────────────────┐
│ 🚨  WADUH!                         │
│                                    │
│ Budget 'Game' JEBOL! Udah 110%     │
│ nih!                               │
│                                    │
│ Total: Rp 550.000 dari             │
│ Rp 500.000                         │
└────────────────────────────────────┘
Auto-dismiss: 8 detik
```

### Kapan TIDAK Muncul?
- ❌ Status tetap sama (misal: Warning → Warning lagi)
- ❌ Gak ada budget limit di kategori itu
- ❌ Transaksi yang gak punya kategori

---

## ✨ FITUR 2: CONFIRMATION DIALOG (ACTIVE)

### Kapan Muncul?
SEBELUM lo save, kalau transaksi yang mau ditambah bakal bikin budget jebol!

```
Lo mau add: Rp 150.000 ke "Game"
Current total: Rp 450.000
Budget limit: Rp 500.000
Projection: Rp 600.000 → JEBOL! 🚨
→ Dialog muncul!
```

### Gimana Tampilannya?

**Single Category:**
```
┌────────────────────────────────────────┐
│ ⚠️  YAKIN, NIH BOS?                [X] │
│                                        │
│ Budget 'Game' lo bakal JEBOL nih kalo  │
│ ditambahin!                            │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ 📊 Detail:                         │ │
│ │                                    │ │
│ │ • Sekarang:                        │ │
│ │   Rp 450.000 / Rp 500.000 (90%)   │ │
│ │                                    │ │
│ │ • Bakal jadi:                      │ │
│ │   Rp 600.000 (120%) 🚨            │ │
│ │                                    │ │
│ │ • Lebih:                           │ │
│ │   +Rp 100.000 dari limit          │ │
│ └────────────────────────────────────┘ │
│                                        │
│ Gimana nih?                            │
│                                        │
│ ┌─────────────┐  ┌──────────────────┐ │
│ │ Batal Aja   │  │ Bodo Amat,       │ │
│ │ Deh         │  │ Tetap Tambah     │ │
│ │             │  │ (RED BUTTON)     │ │
│ └─────────────┘  └──────────────────┘ │
└────────────────────────────────────────┘
```

**Multiple Categories:**
```
┌────────────────────────────────────────┐
│ ⚠️  WADUH! BANYAK BUDGET           [X] │
│    BAKAL JEBOL!                        │
│                                        │
│ Beberapa budget bakal jebol kalo lo    │
│ tetap nambah:                          │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ • Game:                            │ │
│ │   - Sekarang: Rp 450K (90%)       │ │
│ │   - Bakal jadi: Rp 550K (110%) 🚨 │ │
│ │                                    │ │
│ │ • Makanan:                         │ │
│ │   - Sekarang: Rp 1.9M (95%)       │ │
│ │   - Bakal jadi: Rp 2.1M (105%) 🚨 │ │
│ │                                    │ │
│ │ [Scrollable...]                    │ │
│ └────────────────────────────────────┘ │
│                                        │
│ Serius mau lanjut?                     │
│                                        │
│ [Buttons same as single]               │
└────────────────────────────────────────┘
```

### User Actions:

**Klik "Batal Aja Deh":**
- ✅ Dialog tutup
- ✅ Tetap di form (data gak hilang)
- ❌ Transaksi TIDAK disave

**Klik "Bodo Amat, Tetap Tambah":**
- ✅ Dialog tutup
- ✅ Transaksi disave
- ✅ Success toast muncul
- ✅ Toast "WADUH! JEBOL!" muncul (Fitur 1)

---

## 🔄 USER FLOW EXAMPLES

### Scenario A: Budget Aman → Warning

```
1. User add expense Rp 75.000 ke "Game"
2. Klik "Simpan"
3. ✅ Save berhasil
4. Success toast: "Pengeluaran berhasil ditambahkan"
5. 😅 Warning toast: "Hati-hati, Bos! Budget 'Game' udah 85%!"
```

**No dialog** karena gak exceed, cuma warning doang.

---

### Scenario B: Budget Bakal Jebol

```
1. User add expense Rp 150.000 ke "Game"
2. Klik "Simpan"
3. ⚠️  Dialog muncul: "YAKIN, NIH BOS?"
   Shows: Bakal jadi 120% (jebol!)
   
4a. User klik "Batal Aja Deh"
    → Stay di form, nothing saved ✅

4b. User klik "Bodo Amat, Tetap Tambah"
    → Save berhasil ✅
    → Success toast ✅
    → 🚨 "WADUH! JEBOL!" toast ✅
```

---

### Scenario C: Multiple Entries, Mixed

```
1. User add 3 expenses:
   - Game: Rp 100K (bakal jebol)
   - Food: Rp 200K (aman)
   - Transport: Rp 50K (aman)
   
2. Klik "Simpan"

3. ⚠️  Dialog muncul (hanya Game yang jebol)

4. If confirm:
   - Semua 3 expenses disave
   - Success toast: "3 pengeluaran berhasil ditambahkan"
   - 🚨 Toast jebol hanya untuk Game
```

---

## 🎨 DESIGN PRINCIPLES

### Colors
- **Warning:** Amber (#F59E0B) - Kuning
- **Danger:** Orange (#F97316) - Oranye
- **Exceeded:** Red (#EF4444) - Merah

### Tone of Voice
✅ **Good:**
- "Hati-hati, Bos!"
- "Budget lo udah mepet banget!"
- "WADUH! JEBOL!"
- "Bodo Amat, Tetap Tambah"

❌ **Avoid:**
- "Peringatan: Anggaran terlampaui" (too formal)
- "Budget exceeded. Confirm action?" (too robotic)

### UX Philosophy
- **Non-intrusive:** Toast auto-dismiss
- **Informative:** Show exact numbers
- **Empowering:** User stays in control
- **Fun:** Keep it light and engaging

---

## 📊 WHEN ALERTS SHOW

### Toast Alert Matrix

| Old Status | New Status | Toast? | Message |
|------------|------------|--------|---------|
| Safe | Safe | ❌ No | - |
| Safe | Warning | ✅ Yes | 😅 Hati-hati! |
| Safe | Danger | ✅ Yes | 😱 Awas! |
| Safe | Exceeded | ✅ Yes | 🚨 WADUH! |
| Warning | Warning | ❌ No | - |
| Warning | Danger | ✅ Yes | 😱 Awas! |
| Warning | Exceeded | ✅ Yes | 🚨 WADUH! |
| Danger | Danger | ❌ No | - |
| Danger | Exceeded | ✅ Yes | 🚨 WADUH! |
| Exceeded | Exceeded | ❌ No | - |

**Rule:** Only show when status **increases** to new level.

### Dialog Matrix

| Projection | Dialog? |
|------------|---------|
| ≤ Budget Limit | ❌ No |
| > Budget Limit | ✅ Yes |
| No Budget Set | ❌ No |

**Rule:** Only show when **will exceed** limit.

---

## 🚀 IMPLEMENTATION

### New Files
```
/utils/budgetAlerts.ts              - Toast logic
/components/BudgetExceedDialog.tsx  - Dialog component
```

### Modified Files
```
/components/AddExpenseForm.tsx      - Integration
/components/AddExpenseDialog.tsx    - Pass data (maybe)
```

### Effort Estimate
- **Feature 1 (Toast):** ~2-3 hours
- **Feature 2 (Dialog):** ~3-4 hours
- **Integration & Testing:** ~2-3 hours
- **Total:** ~7-10 hours

---

## ✅ SUCCESS CRITERIA

### Functionality
- [ ] Toast shows ONLY when status increases
- [ ] Dialog blocks save when will exceed
- [ ] "Batal" keeps user in form
- [ ] "Tetap Tambah" proceeds with save
- [ ] Works for single and multiple entries
- [ ] Works with custom categories

### UX
- [ ] Messages clear and helpful
- [ ] Tone of voice maintained
- [ ] Not annoying (only shows when needed)
- [ ] Mobile-friendly
- [ ] Toast above FAB on mobile

### Performance
- [ ] No lag when calculating
- [ ] Smooth animations
- [ ] No memory leaks
- [ ] Works offline (if expenses cached)

---

## 🎯 BENEFITS

### For Users
✅ **Awareness:** Know budget status in real-time  
✅ **Control:** Can prevent overspending  
✅ **Transparency:** See exact numbers  
✅ **Flexibility:** Can override if needed  

### For App
✅ **Engagement:** Proactive notifications  
✅ **Value:** Practical budget management  
✅ **Personality:** Maintains fun tone  
✅ **Trust:** Helps users stay on track  

---

## 📝 NEXT STEPS

1. ✅ **Planning Complete** (YOU ARE HERE)
2. ⏳ **Implement Toast Alerts** (Feature 1)
3. ⏳ **Implement Confirmation Dialog** (Feature 2)
4. ⏳ **Integration Testing**
5. ⏳ **Mobile Testing**
6. ⏳ **Deploy & Monitor**

---

## 📚 FULL DOCUMENTATION

Need more details? Check these files:

- **[README.md](README.md)** - Documentation index
- **[PLANNING.md](PLANNING.md)** - Complete specs
- **[VISUAL_MOCKUPS.md](VISUAL_MOCKUPS.md)** - All UI designs
- **[IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)** - Code guide
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Fast lookup

---

**Siap untuk diimplementasikan!** 🚀  

**Pertanyaan? Check full docs atau ask away!** 💬
