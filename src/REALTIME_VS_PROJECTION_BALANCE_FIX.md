# Realtime vs Projection Balance Fix

## 🐛 Problem

**Issue**: Saldo Realtime dan Saldo Proyeksi terbalik di PocketTimeline Info tab  
**Symptom**: Ketika toggle Realtime OFF, malah menampilkan saldo realtime, dan sebaliknya

---

## 🔍 Root Cause

### ❌ Before (Incorrect Logic):

```typescript
// Line 558-562 in PocketTimeline.tsx
{formatCurrency(realtimeBalance !== null ? realtimeBalance : balance.availableBalance)}
```

**Problem:**
- Kondisi hanya cek `realtimeBalance !== null`
- **TIDAK** cek apakah `isRealtimeMode` aktif
- Jadi bahkan ketika mode proyeksi (realtime OFF), jika `realtimeBalance` masih ada nilainya dari sebelumnya, akan tetap ditampilkan

**Example Scenario (WRONG):**
```
1. User toggle Realtime ON
   → realtimeBalance = Rp 500.000 (calculated)
   
2. User toggle Realtime OFF (expect proyeksi)
   → realtimeBalance STILL = Rp 500.000 (not cleared)
   → Displayed: Rp 500.000 ❌ (WRONG! Should show projection)
   → Label: "Saldo Proyeksi" (correct label, wrong value)
```

---

## ✅ Solution

### ✅ After (Correct Logic):

```typescript
// Line 558-562 in PocketTimeline.tsx
{formatCurrency(isRealtimeMode && realtimeBalance !== null ? realtimeBalance : balance.availableBalance)}
```

**Fix:**
- Tambahkan kondisi `isRealtimeMode &&` sebelum `realtimeBalance !== null`
- Sekarang `realtimeBalance` **hanya digunakan** jika mode realtime **aktif**
- Ketika mode realtime OFF, **selalu** gunakan `balance.availableBalance`

**Example Scenario (CORRECT):**
```
1. User toggle Realtime ON
   → isRealtimeMode = true
   → realtimeBalance = Rp 500.000
   → Displayed: Rp 500.000 ✅
   → Label: "Saldo Hari Ini"
   
2. User toggle Realtime OFF
   → isRealtimeMode = false
   → realtimeBalance = Rp 500.000 (still exists but ignored)
   → Displayed: balance.availableBalance = Rp 800.000 ✅
   → Label: "Saldo Proyeksi"
```

---

## 📊 Comparison

| Mode | Label | Before (Bug) | After (Fixed) |
|------|-------|--------------|---------------|
| **Realtime ON** | "Saldo Hari Ini" | `realtimeBalance` ✅ | `realtimeBalance` ✅ |
| **Realtime OFF** | "Saldo Proyeksi" | `realtimeBalance` ❌ | `balance.availableBalance` ✅ |

---

## 🔧 Code Changes

### File: `/components/PocketTimeline.tsx`

**Lines 551-570:**

```diff
  {/* Current Balance */}
  <div className="flex items-start justify-between">
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">
        {isRealtimeMode ? 'Saldo Hari Ini' : 'Saldo Proyeksi'}
      </p>
      <p className={`text-2xl font-semibold ${
-       (realtimeBalance !== null ? realtimeBalance : balance.availableBalance) >= 0 
+       (isRealtimeMode && realtimeBalance !== null ? realtimeBalance : balance.availableBalance) >= 0 
          ? 'text-[#00c950]' 
          : 'text-red-500'
      }`}>
-       {formatCurrency(realtimeBalance !== null ? realtimeBalance : balance.availableBalance)}
+       {formatCurrency(isRealtimeMode && realtimeBalance !== null ? realtimeBalance : balance.availableBalance)}
      </p>
      {isRealtimeMode && (
        <p className="text-xs text-muted-foreground">
          Sampai {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      )}
    </div>
  </div>
```

**Changes:**
- Line 558: Added `isRealtimeMode &&` before `realtimeBalance !== null`
- Line 562: Added `isRealtimeMode &&` before `realtimeBalance !== null`

---

## 🧪 Testing Checklist

### Test Case 1: Realtime Mode ON
```
✅ Label: "Saldo Hari Ini"
✅ Value: Saldo sampai hari ini (ignoring future transactions)
✅ Subtitle: "Sampai [today's date]"
```

### Test Case 2: Realtime Mode OFF (Projection)
```
✅ Label: "Saldo Proyeksi"
✅ Value: Saldo termasuk transaksi masa depan
✅ No subtitle (subtitle only shows in realtime)
```

### Test Case 3: Toggle Back and Forth
```
1. Start with Realtime OFF → Shows projection ✅
2. Toggle Realtime ON → Shows today's balance ✅
3. Toggle Realtime OFF again → Shows projection ✅ (NOT stuck on realtime)
```

### Test Case 4: Future Transactions
```
Setup: Add expense dated tomorrow (Rp 100.000)

Realtime ON:
  → Balance should NOT include tomorrow's expense ✅
  
Realtime OFF:
  → Balance should include tomorrow's expense (lower balance) ✅
```

---

## 📝 Key Concepts

### Realtime Balance
- **Purpose**: Show balance "right now" (up to today)
- **Calculation**: Find last transaction where `date <= today`
- **Use Case**: "How much money do I actually have today?"

### Projection Balance
- **Purpose**: Show balance including all future transactions
- **Calculation**: Server-side balance with all transactions
- **Use Case**: "If all my planned expenses go through, what will be my balance?"

### Why This Matters
```
Example:
- Current balance: Rp 1.000.000
- Tomorrow: Planned expense Rp 500.000

Realtime (Today):      Rp 1.000.000 ✅
Projection (Future):   Rp 500.000   ✅
                      ↑ Shows impact of future expense
```

---

## 🎯 Related Logic

### Calculation in PocketsSummary.tsx (lines 203-233)

```typescript
const calculateRealtimeBalance = useCallback((pocketId: string, isRealtime: boolean): number | null => {
  if (!isRealtime) return null; // ✅ Return null when NOT in realtime mode
  
  const timeline = timelineCache.get(pocketId);
  if (!timeline || timeline.length === 0) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();
  
  // Find last transaction <= today
  for (const item of timeline) {
    const itemDate = new Date(item.date);
    itemDate.setHours(0, 0, 0, 0);
    
    if (itemDate.getTime() <= todayTime) {
      return item.balanceAfter; // ✅ Balance after most recent transaction up to today
    }
  }
  
  return null;
}, [timelineCache]);
```

---

## ✅ Status: FIXED

**Date**: November 9, 2025  
**Impact**: Correct balance display for Realtime vs Projection modes  
**Files Changed**: `/components/PocketTimeline.tsx` (2 lines)

---

## 📚 See Also

- `/planning/pockets-system/REALTIME_POCKET_FEATURE.md`
- `/docs/changelog/REALTIME_FEATURE_QUICK_REF.md`
- `/components/PocketTimeline.tsx` (lines 551-570)
- `/components/PocketsSummary.tsx` (lines 203-233)
