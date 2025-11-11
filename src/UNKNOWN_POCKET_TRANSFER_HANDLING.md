# Unknown Pocket Transfer Handling

## 📋 Overview

**Problem**: Transfer lama (sebelum sistem pocket baru) menampilkan "Transfer ke Unknown Pocket" di timeline karena pocket tujuan sudah tidak ada atau menggunakan ID berbeda.

**Solution**: Sistem sekarang mendeteksi dan menampilkan transfer ke/dari unknown pocket dengan styling khusus dan label yang jelas.

---

## 🔧 What Was Changed

### 1. **Server-Side (index.tsx)**

#### Before:
```typescript
const toPocketName = t.toPocketName || toPocket?.name || 'Unknown Pocket';
```

#### After:
```typescript
const isUnknownPocket = !t.toPocketName && !toPocket;
const toPocketName = t.toPocketName || toPocket?.name || 'Kantong Lama (Tidak Aktif)';

metadata: {
  // ... existing metadata
  isUnknownPocket: isUnknownPocket // ⚠️ Flag for old data
}
```

**Changes:**
- ✅ Text lebih deskriptif: `"Kantong Lama (Tidak Aktif)"` instead of `"Unknown Pocket"`
- ✅ Add `isUnknownPocket` flag to metadata for frontend styling
- ✅ Applies to both transfer IN and transfer OUT

---

### 2. **Frontend (PocketTimeline.tsx)**

#### New Detection:
```typescript
// ⚠️ BACKWARD COMPATIBILITY: Check if this is a transfer to/from unknown pocket (old data)
const isUnknownPocket = entry.type === 'transfer' && entry.metadata?.isUnknownPocket;
```

#### Visual Changes:
1. **Reduced opacity** (60%) untuk entire entry
2. **Muted text color** untuk description
3. **Warning badge** dengan icon dan text "Data lama dari sistem sebelumnya"

```typescript
<div className={`... ${isUnknownPocket ? 'opacity-60' : ''}`}>
  <p className={`... ${isUnknownPocket ? 'text-muted-foreground' : ''}`}>
    {entry.description}
  </p>
  
  {isUnknownPocket && (
    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 flex items-center gap-1">
      <Info className="size-3" />
      <span>Data lama dari sistem sebelumnya</span>
    </p>
  )}
</div>
```

---

## 📸 Visual Example

### Before Fix:
```
Timeline Uang Dingin
─────────────────────
7 Nov 2025, 16:44
→ Transfer ke Unknown Pocket         -Rp 753.261
  Saldo: -Rp 52.139
```

### After Fix:
```
Timeline Uang Dingin
─────────────────────
7 Nov 2025, 16:44 (60% opacity)
→ Transfer ke Kantong Lama (Tidak Aktif)  -Rp 753.261
  ⚠️ Data lama dari sistem sebelumnya
  Saldo: -Rp 52.139
```

---

## 🎯 How It Works

### Server Logic Flow:
```typescript
1. Get transfer transaction from database
2. Check if toPocketName is stored (new data) ✅
   └─ YES: Use stored name
   └─ NO:  Try to find pocket in active pockets list
       └─ FOUND: Use current pocket name ✅
       └─ NOT FOUND: 
           - Set isUnknownPocket = true ⚠️
           - Use fallback "Kantong Lama (Tidak Aktif)"
```

### Frontend Styling Logic:
```typescript
1. Receive timeline entry
2. Check entry.type === 'transfer' AND metadata.isUnknownPocket
3. Apply special styling:
   - opacity-60 (faded appearance)
   - text-muted-foreground (grayed out text)
   - Show warning badge with orange color
```

---

## 🧪 Testing Guide

### Test Case 1: New Transfer (After Fix)
**Expected**: Normal display, NO warning badge
```bash
1. Create new transfer between two active pockets
2. View timeline
3. Should show: Normal opacity + pocket name ✅
```

### Test Case 2: Old Transfer - Pocket Still Exists
**Expected**: Normal display (backward compatible)
```bash
1. Old transfer data (no fromPocketName/toPocketName)
2. Target pocket still exists in system
3. Should show: Normal opacity + current pocket name ✅
```

### Test Case 3: Old Transfer - Pocket Deleted ⚠️
**Expected**: Special styling with warning
```bash
1. Old transfer data (no fromPocketName/toPocketName)
2. Target pocket was deleted/doesn't exist
3. Should show:
   ✅ 60% opacity
   ✅ "Kantong Lama (Tidak Aktif)" text
   ✅ Orange warning badge
   ✅ "Data lama dari sistem sebelumnya"
```

### Test Case 4: Dark Mode
**Expected**: Orange warning uses dark mode color
```bash
1. Switch to dark mode
2. View unknown pocket transfer
3. Warning should be: text-orange-400 (lighter for dark bg)
```

---

## 📝 User Impact

### ✅ Benefits:
1. **Clear indication** - User tahu ini data lama, bukan error
2. **Non-intrusive** - Hanya faded, tidak blocking
3. **Informative** - Warning badge menjelaskan kenapa
4. **Professional** - Tidak menggunakan "Unknown" yang terlihat seperti bug

### ⚠️ Limitations:
- Old transfer data **cannot be edited** (pocket reference lost)
- User **cannot delete** individual old transfers (would break balance)
- Recommendation: Let them stay as historical record

---

## 🔮 Future Enhancements (Optional)

### Option 1: Migration Tool
```typescript
// Allow user to reassign old transfers to existing pockets
POST /migrate-transfers
{
  transferId: "old_transfer_123",
  newPocketId: "pocket_daily"
}
```

### Option 2: Bulk Hide
```typescript
// Hide all unknown pocket transfers from view
{
  hideUnknownTransfers: true // User preference
}
```

### Option 3: Archive Old Data
```typescript
// Move transfers older than X months to archive
archiveTransfersBefore("2024-10-01");
```

---

## 📚 Related Files

- `/supabase/functions/server/index.tsx` - Server logic (lines 1052-1100)
- `/components/PocketTimeline.tsx` - Frontend display (lines 405-490)
- `/types/index.ts` - Type definitions

---

## 🚨 Important Notes

### DO NOT:
- ❌ Remove old transfer data (breaks balance history)
- ❌ Try to "fix" by assigning random pocket IDs
- ❌ Show error messages for unknown pockets

### DO:
- ✅ Display gracefully with reduced emphasis
- ✅ Preserve exact amounts and dates
- ✅ Keep as historical record
- ✅ Inform user it's old data

---

## Quick Checklist

- [x] Server detects unknown pocket transfers
- [x] Server adds `isUnknownPocket` metadata flag
- [x] Server uses descriptive fallback text
- [x] Frontend detects unknown pocket flag
- [x] Frontend applies 60% opacity styling
- [x] Frontend shows orange warning badge
- [x] Dark mode colors work correctly
- [x] Documentation created

---

**Status**: ✅ **COMPLETE**  
**Date**: November 9, 2025  
**Impact**: Backward compatibility for old transfer data
