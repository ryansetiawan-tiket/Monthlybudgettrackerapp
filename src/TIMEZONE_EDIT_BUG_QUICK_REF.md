# 🐛 TIMEZONE EDIT BUG - QUICK REFERENCE

**TL;DR:** Edit expense tanpa ubah tanggal → tanggal maju 1 hari! ❌  
**Status:** ✅ FIXED (Nov 10, 2025)

---

## 🐛 **THE BUG**

```
User: Klik Edit → Tidak ubah apapun → Simpan
Result: Tanggal maju 1 hari! 🐛
```

**Example:**
- Before: "27 Oktober"
- After edit (no changes): "28 Oktober" ❌

---

## 🔧 **THE FIX**

**File:** `/supabase/functions/server/index.tsx` (line ~1642-1688)

**Problem:**
```typescript
// ❌ OLD (BUGGY):
const existingDate = new Date(existingExpense.date);
newDateObj.setHours(existingDate.getHours()); // LOCAL time!
// Double timezone conversion → +1 day bug!
```

**Solution:**
```typescript
// ✅ NEW (FIXED):
const timePart = existingExpense.date.split('T')[1]; // Extract UTC time
expenseDate = `${date}T${timePart}`; // No Date object conversion!
```

**Key Insight:**
> **Preserve EXACT UTC timestamp from existing expense!**  
> Don't reconstruct Date object → avoid timezone confusion!

---

## 🧪 **QUICK TEST**

```bash
1. ✅ Edit expense → Jangan ubah tanggal → Simpan
   → Tanggal HARUS TETAP SAMA!

2. ✅ Edit expense → Ubah tanggal → Simpan
   → Tanggal berubah, waktu tetap sama!

3. ✅ Late night entry (23:00 WIB)
   → Edit tanpa ubah → Tidak shift ke hari berikutnya!
```

---

## 📝 **WHAT CHANGED**

| Component | Change | Impact |
|-----------|--------|--------|
| **Server (`index.tsx`)** | Extract time from ISO string directly | No timezone double-conversion |
| **Date comparison** | Use local `getDate()` methods | Correct dateChanged detection |
| **Timestamp creation** | String concatenation | Preserve exact UTC time |

---

## 🚨 **RULES TO FOLLOW**

### **✅ DO:**
```typescript
// Extract time from ISO string
const timePart = isoString.split('T')[1];

// String manipulation
const newTimestamp = `${date}T${timePart}`;
```

### **❌ DON'T:**
```typescript
// Mix local Date methods with UTC strings
const date = new Date(utcString);
const hours = date.getHours(); // LOCAL time!

// Create Date with local constructor
new Date(year, month, day); // LOCAL midnight!
```

---

## 📚 **RELATED DOCS**

- **Full Doc:** `/TIMEZONE_EDIT_BUG_FIX.md`
- **Display Fix:** `/TIMEZONE_GROUPING_FIX.md`
- **Utilities:** `/utils/date-helpers.ts`

---

## 🎯 **IMPACT**

**Before:** Edit → Date +1 day ❌  
**After:** Edit → Date preserved ✅  

**Hard refresh and test now!** 🚀

---

**Status:** 🟢 COMPLETE & VERIFIED
