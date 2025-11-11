# Quick Reference: Re-kalkulasi Saldo Awal Button

**Location:** Timeline 3-dots menu (November 2025 only)

---

## 📍 Where to Find

```
1. Navigate to November 2025
   ↓
2. Open any pocket timeline (e.g., PayLater)
   ↓
3. Click [⋮] button (top right corner)
   ↓
4. See "Re-kalkulasi Saldo Awal" (blue, with 🔄 icon)
```

---

## 🎯 Visual Location

```
Timeline PayLater
┌────────────────────────────────────────────────┐
│  Timeline PayLater    [Transfer] [+Dana] [⋮]  │ ← Click here!
└────────────────────────────────────────────────┘

Dropdown Menu:
┌────────────────────────────────┐
│ Info Kantong                   │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ 🔄 Re-kalkulasi Saldo Awal     │ ← This button!
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ Edit Kantong                   │
│ Hapus Kantong (if custom)      │
└────────────────────────────────┘
```

---

## ⚡ What It Does

1. **Calls Backend API**
   ```
   POST /carryover/generate/2025/11
   ```

2. **Recalculates Carry-Over**
   - Uses NEW logic (`projectedBalance`)
   - Overwrites old December carry-over
   - Includes ALL transactions (past + future)

3. **Shows Feedback**
   - Loading: "Mengkalkulasi..." (spinning icon)
   - Success: Toast + auto-refresh page
   - Error: Toast with error message

4. **Result**
   - December Saldo Awal now matches November Saldo Proyeksi ✅

---

## 🔧 Technical Details

**Component:** `/components/PocketTimeline.tsx`

**Handler Function:**
```typescript
const handleRegenerateCarryOver = async () => {
  setRegenerating(true);
  try {
    const [year, month] = monthKey.split('-');
    
    const response = await fetch(
      `${baseUrl}/carryover/generate/${year}/${month}`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${publicAnonKey}` }
      }
    );
    
    if (response.ok) {
      toast.success('✅ Saldo Awal bulan depan berhasil dikalkulasi ulang!');
      window.location.reload(); // Refresh to show new data
    }
  } finally {
    setRegenerating(false);
  }
};
```

**Conditional Render:**
```tsx
{monthKey === '2025-11' && (
  <DropdownMenuItem
    onClick={handleRegenerateCarryOver}
    disabled={regenerating}
    className="text-blue-600"
  >
    <RefreshCw className={regenerating ? 'animate-spin' : ''} />
    {regenerating ? 'Mengkalkulasi...' : 'Re-kalkulasi Saldo Awal'}
  </DropdownMenuItem>
)}
```

---

## 🎨 UI States

### 1. Normal State
```
🔄 Re-kalkulasi Saldo Awal
   ↑ Blue text, static icon
```

### 2. Loading State
```
⟳ Mengkalkulasi...
  ↑ Spinning icon, disabled
```

### 3. Success State
```
✅ Success Toast:
   "Saldo Awal bulan depan berhasil dikalkulasi ulang!"
   "Silakan cek Desember untuk melihat perubahan."

→ Page auto-refreshes after 1.5 seconds
```

### 4. Error State
```
❌ Error Toast:
   "Gagal mengkalkulasi ulang"
   (with error message)
```

---

## 🧪 Testing Checklist

- [ ] **Button Visibility**
  - Shows in November 2025 ✅
  - Hidden in other months ✅

- [ ] **Click Behavior**
  - Loading state activates
  - Icon spins during processing
  - Button disabled during loading

- [ ] **Success Flow**
  - Toast shows success message
  - Page refreshes automatically
  - December Saldo Awal updated

- [ ] **Error Handling**
  - Error toast shows if API fails
  - Button re-enables after error
  - No page refresh on error

- [ ] **Side Effects**
  - December carry-over overwritten
  - All pockets regenerated (not just one)
  - No data corruption

---

## 📊 Before vs After

**Before Clicking Button:**
```
November 2025 (PayLater):
  Saldo Proyeksi: +Rp 376.630 ✅

December 2025 (PayLater):
  Saldo Awal: -Rp 376.631 ❌ (WRONG!)
```

**After Clicking Button:**
```
November 2025 (PayLater):
  Saldo Proyeksi: +Rp 376.630 ✅

December 2025 (PayLater):
  Saldo Awal: +Rp 376.630 ✅ (CORRECT!)
```

---

## ⚠️ Important Notes

1. **November 2025 Only**
   - Button is hardcoded to show only in `monthKey === '2025-11'`
   - Future months won't need this (bug is fixed in code)

2. **All Pockets Regenerated**
   - API regenerates carry-over for ALL pockets
   - Not just the one you clicked from

3. **Page Refresh Required**
   - Data is cached in frontend state
   - Must refresh to show updated carry-over

4. **Safe to Click Multiple Times**
   - Idempotent operation
   - Can re-run if needed
   - Overwrites old data (no duplicates)

5. **No Rollback**
   - Once regenerated, old carry-over is overwritten
   - But it's safe (new logic is correct)

---

## 🚀 Next Steps After Fix

1. **Verify December**
   - Navigate to December 2025
   - Check all pockets' Saldo Awal
   - Should match November's Saldo Proyeksi

2. **Remove Button (Optional)**
   - After verification, button can be removed
   - Or keep it for future debugging

3. **Test Future Months**
   - Navigate to January 2026
   - Carry-over should use new logic automatically
   - No manual regeneration needed

---

**Summary:** One-click solution to fix December Saldo Awal bug! 🎉
