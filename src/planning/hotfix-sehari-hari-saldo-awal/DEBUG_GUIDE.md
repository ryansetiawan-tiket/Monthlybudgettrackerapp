# Debug Guide: Saldo Awal Sehari-hari Masih Rp 0

## 🔍 Problem

User melaporkan: **Saldo Awal Oktober masih Rp 0** padahal **Budget Awal ada (Rp 753.446)**

## 🧪 Debugging Steps

### Step 1: Check Console Logs (CRITICAL!)

Buka **Browser Console** (F12) dan cari log dengan pattern:

```
[TIMELINE DEBUG] Fetching budget with key: "budget:2025-10"
[TIMELINE DEBUG] budgetData raw: ...
[TIMELINE DEBUG] budgetAwal extracted: ...
[TIMELINE] 🏦 Sehari-hari Special Logic:
  - Month: 2025-10
  - Budget Key: "budget:2025-10"
  - Budget Data Found: YES/NO ← CRITICAL!
  - Budget Awal (2025-10): 0/753446
  - Carry-over from previous: 0
  - Initial Balance (FINAL): 0/753446
```

**Key Questions:**
1. ✅ **Budget Data Found: YES or NO?**
   - **NO** → Budget belum disimpan ke server!
   - **YES** → Lanjut ke Step 2

2. ✅ **budgetAwal extracted: 0 or 753446?**
   - **0** → Budget data kosong atau field salah
   - **753446** → Data correct, tapi Initial Balance calculation salah

---

### Step 2: Verify Budget is Saved

**Test:**
1. Buka modal "Budget Bulanan" (tombol hijau di header)
2. Verify: Budget Awal = Rp 753.446 ✅
3. **Klik "Simpan Budget"** (PENTING!)
4. Wait for success message
5. Refresh Timeline Sehari-hari

**Expected Console Log:**
```
POST /budget/2025/10
Response: { success: true, data: { initialBudget: 753446, ... } }
```

**If NO save log** → Budget tidak tersimpan! User harus klik Simpan!

---

### Step 3: Check KV Store (Advanced)

**For Developers Only:**

Query KV store untuk key `budget:2025-10`:

```typescript
// In server console or debug endpoint
const budgetData = await kv.get('budget:2025-10');
console.log('Budget Data:', budgetData);
```

**Expected Result:**
```json
{
  "initialBudget": 753446,
  "carryover": 0,
  "notes": "",
  "incomeDeduction": 0,
  "updatedAt": "2025-10-23T..."
}
```

**If null/undefined** → Budget belum pernah disimpan untuk Oktober!

---

### Step 4: Check Month Key Format

**Verify URL:**
```
Timeline Sehari-hari fetch:
GET /timeline/2025/10/pocket_sehari_hari

NOT:
GET /timeline/2025/010/pocket_sehari_hari ❌
GET /timeline/2025/Oct/pocket_sehari_hari ❌
```

**Month format must be: `10` (without leading zero in URL, but with leading zero in cache key!)**

---

### Step 5: Hard Refresh

**Clear all caches:**
1. Browser: `Ctrl + Shift + R` (hard refresh)
2. Service Worker: DevTools → Application → Clear Storage
3. Server: Restart Deno server

**Then:**
1. Refresh page
2. Open Timeline Sehari-hari
3. Check console logs again

---

## 🎯 Common Issues & Solutions

### Issue 1: "Budget Data Found: NO"

**Cause:** Budget belum disimpan ke server untuk bulan ini

**Solution:**
```
1. Open modal "Budget Bulanan"
2. Enter Budget Awal: Rp 753.446
3. Click "Simpan Budget" ← CRITICAL!
4. Wait for success toast
5. Refresh Timeline
```

**Verify:**
```
Console log should show:
[TIMELINE DEBUG] Budget Data Found: YES ✅
```

---

### Issue 2: "budgetAwal extracted: 0" (but Budget Data Found: YES)

**Cause:** Budget data structure mismatch

**Check budgetData raw log:**
```json
{
  "initialBudget": 753446,  ← Should be here!
  "carryover": 0,
  "notes": "",
  ...
}
```

**If field name different** → Update server code to match!

---

### Issue 3: "Initial Balance (FINAL): 0" (but budgetAwal: 753446)

**Cause:** Calculation bug

**Check:**
```
budgetAwal: 753446 ✅
carryoverFromPrevious: -753446 ❌ (WRONG!)
→ initialBalance = 753446 + (-753446) = 0 ❌
```

**Solution:** Debug carry-over calculation (previous expenses/income/transfers)

---

### Issue 4: Cache Issue

**Symptoms:**
- Console shows correct data
- BUT Timeline still shows Rp 0

**Solution:**
```
1. Hard refresh (Ctrl + Shift + R)
2. Clear browser cache
3. Clear service worker
4. Restart server
5. Re-fetch timeline
```

---

## 🔬 Advanced Debugging

### Enable Detailed Logging

**Server side:**
```typescript
// Already enabled in implementation!
console.log(`[TIMELINE DEBUG] budgetData raw:`, JSON.stringify(budgetData, null, 2));
```

**Frontend side (PocketTimeline.tsx):**
```typescript
console.log('[TIMELINE] Fetched entries:', entries);
console.log('[TIMELINE] Initial Balance entry:', entries.find(e => e.type === 'initial_balance'));
```

---

### Verify Endpoint Response

**Manual test:**
```bash
curl -X GET \
  'https://PROJECT_ID.supabase.co/functions/v1/make-server-3adbeaf1/timeline/2025/10/pocket_sehari_hari' \
  -H 'Authorization: Bearer ANON_KEY'
```

**Check response:**
```json
{
  "entries": [
    {
      "id": "initial_balance",
      "type": "initial_balance",
      "amount": 753446,  ← Should be 753446, not 0!
      "balanceAfter": 753446,
      "description": "Saldo Awal",
      ...
    },
    ...
  ],
  ...
}
```

---

### Verify Budget Save

**Test budget save:**
```bash
curl -X POST \
  'https://PROJECT_ID.supabase.co/functions/v1/make-server-3adbeaf1/budget/2025/10' \
  -H 'Authorization: Bearer ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "initialBudget": 753446,
    "carryover": 0,
    "notes": "Test",
    "incomeDeduction": 0
  }'
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "initialBudget": 753446,
    "carryover": 0,
    "notes": "Test",
    "incomeDeduction": 0,
    "updatedAt": "2025-10-23T..."
  }
}
```

---

## 📝 Checklist

**Before reporting bug, verify:**

- [ ] Budget modal shows Budget Awal = Rp 753.446
- [ ] User clicked "Simpan Budget" button
- [ ] Success toast appeared after save
- [ ] Hard refresh browser (Ctrl + Shift + R)
- [ ] Console shows `[TIMELINE DEBUG]` logs
- [ ] Console shows `Budget Data Found: YES`
- [ ] Console shows `budgetAwal extracted: 753446`
- [ ] Console shows `Initial Balance (FINAL): 753446`
- [ ] Timeline entry for "Saldo Awal" shows Rp 753.446

**If ALL checked but still Rp 0** → Report bug with console logs!

---

## 🎯 Expected Behavior

**After fix:**

```
Timeline Sehari-hari (Oktober 2025):

[Console Logs]
[TIMELINE DEBUG] Fetching budget with key: "budget:2025-10"
[TIMELINE DEBUG] budgetData raw: {
  "initialBudget": 753446,
  "carryover": 0,
  "notes": "",
  "incomeDeduction": 0,
  "updatedAt": "2025-10-23T..."
}
[TIMELINE DEBUG] budgetAwal extracted: 753446
[TIMELINE] 🏦 Sehari-hari Special Logic:
  - Month: 2025-10
  - Budget Key: "budget:2025-10"
  - Budget Data Found: YES ✅
  - Budget Awal (2025-10): 753446 ✅
  - Carry-over from previous: 0
  - Initial Balance (FINAL): 753446 ✅

[Timeline UI]
┌────────────────────────────────┐
│ Timeline Sehari-hari           │
├────────────────────────────────┤
│ 23 Okt - Ngantor               │
│ -Rp 61.100                     │
│ Saldo: -Rp 429.731             │
│                                │
│ 1 Okt - 🏦 Saldo Awal          │
│ Rp 753.446 ✅ (CORRECT!)       │
└────────────────────────────────┘
```

---

## 💡 Pro Tips

**Tip 1: Always Save Budget!**
> Modal Budget menampilkan data yang sudah ada, tapi TIDAK otomatis save!
> User HARUS klik "Simpan Budget" untuk persist ke server!

**Tip 2: Check Console First!**
> Console logs adalah sumber truth!
> Jangan report bug tanpa cek console logs dulu!

**Tip 3: Hard Refresh is Your Friend!**
> Browser cache bisa menyimpan data lama
> Always hard refresh (Ctrl + Shift + R) setelah changes!

---

## 🚨 Known Limitations

**1. Budget Must Be Set for Each Month**
- Sehari-hari pocket requires monthly budget allocation
- If no budget set → Saldo Awal = Rp 0 (expected behavior!)
- Solution: Set budget via "Budget Bulanan" modal

**2. First Month Scenario**
- For first month ever → No previous data
- Saldo Awal = Budget Awal ONLY (no carry-over)
- This is correct behavior!

**3. Auto-fill Carryover**
- Modal Budget auto-fills carryover from previous month
- But user can override it manually
- This affects calculations!

---

## 📞 Support

**If issue persists after all steps:**

1. **Copy console logs** (all `[TIMELINE DEBUG]` lines)
2. **Screenshot Timeline** (showing Rp 0)
3. **Screenshot Budget Modal** (showing Rp 753.446)
4. **Report to developer** with:
   - Browser (Chrome/Firefox/Safari)
   - Month (Oktober 2025)
   - Console logs (text, not screenshot!)
   - Steps to reproduce

---

**Last Updated:** November 10, 2025  
**Version:** 1.0  
**Status:** Active Debugging Guide
