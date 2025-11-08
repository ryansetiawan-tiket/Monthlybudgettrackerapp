# Budget Alert System - Testing Guide

**Quick guide untuk testing fitur baru** 🧪

---

## 🎯 QUICK START

### Setup Budget Limit Dulu
1. Buka app
2. Klik "Breakdown Kategori" 
3. Klik kategori (misal: "Game")
4. Set budget limit: **Rp 500.000**
5. Set warning at: **80%** (default)
6. Save

---

## 🧪 TEST SCENARIOS

### Test 1: Warning Toast (80-89%) ⚠️

**Setup:**
```
Category: Game
Limit: Rp 500.000
Current: Rp 0 (0%)
```

**Steps:**
1. Tambah expense:
   - Amount: **Rp 425.000**
   - Category: **Game**
2. Klik "Simpan"

**Expected Result:**
```
✅ Expense saved
✅ Success toast: "Pengeluaran berhasil ditambahkan"
✅ Warning toast muncul (salah satu):
   - "😅 Hati-hati, Bos! Budget 'Game' udah masuk zona kuning (85%)!"
   - "😅 Woy! Budget 'Game' lo udah 85% nih!"
   - "😅 Pelan-pelan, Bro! Budget 'Game' hampir habis (85%)!"
✅ Toast shows: "Total: Rp 425.000 dari Rp 500.000"
✅ Auto-dismiss after 5 seconds
```

**What to Check:**
- [ ] Toast warna kuning/amber
- [ ] Message kocak (tone of voice benar)
- [ ] Percentage ditampilkan
- [ ] Total amount ditampilkan
- [ ] Auto-dismiss works

---

### Test 2: Danger Toast (90-99%) 🔴

**Setup:**
```
Category: Game  
Limit: Rp 500.000
Current: Rp 425.000 (85%) - dari Test 1
```

**Steps:**
1. Tambah expense:
   - Amount: **Rp 50.000**
   - Category: **Game**
2. Klik "Simpan"

**Expected Result:**
```
✅ Expense saved
✅ Success toast shows
✅ Danger toast muncul (salah satu):
   - "😱 Awas! Budget 'Game' lo udah mepet banget (95%)!"
   - "😱 Gawat! Budget 'Game' tinggal dikit lagi jebol (95%)!"
   - "😱 Bahaya! Budget 'Game' udah 95%!"
✅ Toast shows: "Total: Rp 475.000 dari Rp 500.000"
✅ Auto-dismiss after 6 seconds
```

**What to Check:**
- [ ] Toast warna oranye
- [ ] Message lebih urgent
- [ ] Duration lebih lama (6s)
- [ ] Emoji berubah dari 😅 ke 😱

---

### Test 3: Confirmation Dialog + Exceeded Toast 🚨

**Setup:**
```
Category: Game
Limit: Rp 500.000
Current: Rp 475.000 (95%) - dari Test 2
```

**Steps:**
1. Tambah expense:
   - Amount: **Rp 100.000**
   - Category: **Game**
2. Klik "Simpan"

**Expected Result:**
```
⚠️ Dialog muncul (SEBELUM save):

┌──────────────────────────────────────┐
│ ⚠️  YAKIN, NIH BOS?              [X] │
│                                      │
│ Budget 'Game' lo bakal JEBOL nih     │
│ kalo ditambahin!                     │
│                                      │
│ 📊 Detail:                           │
│ • Sekarang: Rp 475.000 / Rp 500.000  │
│   (95%)                              │
│ • Bakal jadi: Rp 575.000 (115%) 🚨   │
│ • Lebih: +Rp 75.000 dari limit       │
│                                      │
│ Gimana nih?                          │
│                                      │
│ [Batal Aja Deh] [Bodo Amat, Tetap  │
│                  Tambah]             │
└──────────────────────────────────────┘
```

**Test A: Klik "Batal Aja Deh"**
```
✅ Dialog closes
✅ Form tetap terbuka
✅ Data tidak hilang (amount masih Rp 100.000)
❌ Expense TIDAK disave
❌ Tidak ada toast
```

**Test B: Klik "Bodo Amat, Tetap Tambah"**
```
✅ Dialog closes
✅ Expense saved
✅ Success toast: "Pengeluaran berhasil ditambahkan"
✅ Exceeded toast muncul (salah satu):
   - "🚨 WADUH! Budget 'Game' JEBOL! Udah 115% nih!"
   - "🚨 ANJAY! Budget 'Game' udah lewat limit! (115%)"
   - "🚨 KEBANGETEN! Budget 'Game' jebol parah! (115%)"
✅ Toast shows: "Total: Rp 575.000 dari Rp 500.000"
✅ Auto-dismiss after 8 seconds
✅ Form closes (success)
```

**What to Check:**
- [ ] Dialog shows BEFORE save
- [ ] Projection calculation correct
- [ ] Current & projected amounts correct
- [ ] Excess amount correct (+Rp 75.000)
- [ ] Percentages correct
- [ ] Both buttons work
- [ ] Cancel keeps data
- [ ] Confirm proceeds with save
- [ ] Exceeded toast warna merah
- [ ] Duration terlama (8s)

---

### Test 4: No Alert When Status Same ✅

**Setup:**
```
Category: Game
Limit: Rp 500.000
Current: Rp 425.000 (85% - Warning)
```

**Steps:**
1. Tambah expense:
   - Amount: **Rp 20.000**
   - Category: **Game**
2. Klik "Simpan"

**Expected Result:**
```
✅ Expense saved
✅ Success toast shows
❌ NO budget alert toast (status masih Warning 89%)
```

**Why:**
- Old status: Warning (85%)
- New status: Warning (89%)
- Status tidak naik level → NO ALERT

**What to Check:**
- [ ] Only success toast, no budget toast
- [ ] Expense tetap tersimpan
- [ ] No dialog

---

### Test 5: Multiple Entries - Some Exceed 🔢

**Setup:**
```
Category: Game - Limit Rp 500.000, Current: Rp 490.000 (98%)
Category: Food - Limit Rp 2.000.000, Current: Rp 1.950.000 (97.5%)
Category: Transport - Limit Rp 800.000, Current: Rp 300.000 (37.5%)
```

**Steps:**
1. Tambah 3 expenses (multiple entry):
   - Entry 1: Rp 50.000 → Game (will exceed: 108%)
   - Entry 2: Rp 200.000 → Food (will exceed: 107.5%)
   - Entry 3: Rp 100.000 → Transport (safe: 50%)
2. Klik "Simpan"

**Expected Result:**
```
⚠️ Dialog muncul dengan 2 categories:

┌──────────────────────────────────────┐
│ ⚠️  WADUH! BANYAK BUDGET         [X] │
│    BAKAL JEBOL!                      │
│                                      │
│ Beberapa budget bakal jebol kalo lo  │
│ tetap nambah:                        │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ • Game:                          │ │
│ │   - Sekarang: Rp 490K (98%)     │ │
│ │   - Bakal jadi: Rp 540K (108%) 🚨│ │
│ │                                  │ │
│ │ • Makanan:                       │ │
│ │   - Sekarang: Rp 1.95M (97.5%)  │ │
│ │   - Bakal jadi: Rp 2.15M (107%)🚨│ │
│ └──────────────────────────────────┘ │
│                                      │
│ Serius mau lanjut?                   │
│                                      │
│ [Batal Aja Deh] [Bodo Amat, Tetap  │
│                  Tambah]             │
└──────────────────────────────────────┘
```

**If Confirm:**
```
✅ All 3 expenses saved
✅ Success toast: "3 pengeluaran berhasil ditambahkan"
✅ Exceeded toast for Game (🚨 115%)
✅ Exceeded toast for Food (🚨 107.5%)
❌ NO toast for Transport (safe)
```

**What to Check:**
- [ ] Dialog shows both exceeding categories
- [ ] Transport not shown (safe)
- [ ] Scrollable jika banyak
- [ ] All entries saved if confirmed
- [ ] Only exceeding categories get toast

---

### Test 6: No Budget Limit = No Alerts ⭕

**Setup:**
```
Category: Shopping
Budget Limit: NOT SET
```

**Steps:**
1. Tambah expense:
   - Amount: **Rp 5.000.000** (very large)
   - Category: **Shopping**
2. Klik "Simpan"

**Expected Result:**
```
✅ Expense saved normally
✅ Success toast shows
❌ NO dialog
❌ NO budget alert toast
```

**Why:**
- No budget limit → no alerts

**What to Check:**
- [ ] Normal save flow
- [ ] No interference
- [ ] No errors

---

### Test 7: Mobile Responsive 📱

**Test on mobile device or narrow browser:**

**Steps:**
1. Add expense yang will exceed
2. Check dialog UI

**Expected Result:**
```
✅ Dialog full-width on mobile
✅ Buttons stacked vertically
✅ Text wraps properly
✅ Scrollable content
✅ Toast appears above FAB
✅ Toast doesn't block FAB
```

**What to Check:**
- [ ] Dialog readable on small screen
- [ ] Buttons touch-friendly
- [ ] No horizontal scroll
- [ ] Toast positioning correct

---

## 🎨 VISUAL CHECKS

### Toast Colors
```
Warning:  #F59E0B (Amber)  - 😅
Danger:   #F97316 (Orange) - 😱
Exceeded: #EF4444 (Red)    - 🚨
```

### Dialog Colors
```
Title: Default text
Budget name: Red/destructive text
Current: Gray muted text
Projected: Red destructive text
Detail box: Light gray background
Cancel button: Default
Confirm button: Red destructive background
```

---

## 🐛 COMMON ISSUES

### Issue: Toast tidak muncul
**Check:**
- [ ] Budget limit sudah diset?
- [ ] Status benar-benar naik level?
- [ ] Console ada error?

### Issue: Dialog tidak muncul
**Check:**
- [ ] Projection benar > limit?
- [ ] Category punya budget limit?
- [ ] Console ada error?

### Issue: Data tidak accurate
**Check:**
- [ ] Current month expenses loaded?
- [ ] Category ID sama?
- [ ] Amount calculation benar?

---

## ✅ COMPLETE TESTING CHECKLIST

### Basic Functionality
- [ ] Toast shows when status increases
- [ ] Toast doesn't show when status same
- [ ] Dialog shows when will exceed
- [ ] Dialog doesn't show when safe
- [ ] Cancel button works
- [ ] Confirm button works

### All Status Levels
- [ ] Safe → Warning (80%) ✅
- [ ] Warning → Danger (90%) ✅
- [ ] Danger → Exceeded (100%+) ✅
- [ ] Warning → Warning (no alert) ✅

### Multiple Entries
- [ ] Single category exceed ✅
- [ ] Multiple categories exceed ✅
- [ ] Mixed (some exceed, some safe) ✅

### Edge Cases
- [ ] No budget limit = no alerts ✅
- [ ] Budget limit = 0 = no alerts ✅
- [ ] Empty entries = no action ✅
- [ ] Very large amounts ✅

### UI/UX
- [ ] Messages kocak (tone of voice) ✅
- [ ] Random message selection ✅
- [ ] Proper colors ✅
- [ ] Duration scaling ✅
- [ ] Mobile responsive ✅
- [ ] Toast above FAB ✅
- [ ] Dialog scrollable ✅

### Integration
- [ ] Works with custom categories ✅
- [ ] Works with default categories ✅
- [ ] Works with budget overrides ✅
- [ ] Doesn't break existing features ✅

---

## 🎯 ACCEPTANCE CRITERIA

All must pass ✅:

1. **Toast Alert:**
   - [ ] Shows only when status increases
   - [ ] Correct message for each level
   - [ ] Auto-dismisses with correct duration
   - [ ] Doesn't spam (status same = no alert)

2. **Confirmation Dialog:**
   - [ ] Shows when will exceed limit
   - [ ] Shows accurate projection
   - [ ] Cancel keeps user in form
   - [ ] Confirm proceeds with save
   - [ ] Works for single & multiple categories

3. **User Experience:**
   - [ ] Messages friendly & kocak
   - [ ] Not annoying
   - [ ] Helpful information
   - [ ] Clear actions
   - [ ] Mobile friendly

4. **Technical:**
   - [ ] No TypeScript errors
   - [ ] No console warnings
   - [ ] No performance issues
   - [ ] Works offline (with cached data)

---

**HAPPY TESTING!** 🎉

If all tests pass, implementation is **VERIFIED & READY!** ✅
