# 🐛 Wishlist Tooltip Bug - Quick Fix (v2)

## The Bug
Tooltip "Belum Bisa Dibeli" menampilkan **angka yang SALAH**.

**Example**:
```
Item: "3ds old" - Rp 1.500.000
Balance: Rp 14.581.434,88

Orange text: "Kurang Rp 627.565,12" ✅ BENAR
Tooltip v1: "Kurang Rp -13.081.434,88" ❌ NEGATIF!
Tooltip v2: "Kurang Rp 0" ❌ SALAH JUGA!
```

**Expected**: Tooltip harus sama = "Kurang Rp 627.565,12"

---

## Root Cause
```typescript
// WRONG ❌ - Manual calculation
shortage={item.amount - currentBalance}
// Result: 1.500.000 - 14.581.434,88 = -13.081.434,88 (NEGATIVE!)

// FIX v1 ⚠️ - Still wrong!
shortage={Math.max(0, item.amount - currentBalance)}
// Result: Math.max(0, -13.081.434,88) = 0 (NOT ACCURATE!)
```

**Problem**: Manual calculation tidak akurat karena tidak consider priority order!

**Orange text uses**: `isSoon.amountNeeded` dari API simulation ✅ AKURAT!

---

## The Fix v2
```typescript
// CORRECT ✅ - Use API data when available!
shortage={isSoon?.amountNeeded || Math.max(0, item.amount - currentBalance)}
// Result: 627.565,12 dari API! ✅
```

**Logic**:
1. ✅ Kalau ada `isSoon.amountNeeded` → Pakai data API (AKURAT!)
2. ⚠️ Kalau tidak ada → Fallback ke manual calculation

---

## File Modified
**`/components/WishlistSimulation.tsx`** - Line 852

```diff
  <SmartCTA
    itemId={item.id}
    itemName={item.name}
    isAffordable={!!isAffordable}
-   shortage={Math.max(0, item.amount - (simulation?.currentBalance || 0))}
+   shortage={isSoon?.amountNeeded || Math.max(0, item.amount - (simulation?.currentBalance || 0))}
    onPurchase={handlePurchaseItem}
  />
```

---

## Result

| Version | Display | Status |
|---------|---------|--------|
| Before | "Kurang Rp **-13.081.434,88**" | ❌ Negatif! |
| Fix v1 | "Kurang Rp **0**" | ⚠️ Tidak akurat |
| Fix v2 | "Kurang Rp **627.565,12**" | ✅ **CORRECT!** |

**Orange text**: "Kurang Rp 627.565,12" ✅  
**Tooltip v2**: "Kurang Rp 627.565,12" ✅  
**MATCH!** 🎉

---

**Status**: ✅ Fixed (v2)!  
**Date**: Nov 7, 2025  
**Impact**: 1 line change (using API data)
