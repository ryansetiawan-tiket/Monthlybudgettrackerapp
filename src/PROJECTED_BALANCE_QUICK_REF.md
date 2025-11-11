# Saldo Proyeksi Fix - Quick Reference

## 🐛 Problem
Saldo Proyeksi menampilkan **-Rp 77.304** padahal di timeline menunjukkan **Rp 15.661.398**

---

## ✅ Solution

### Change 1: Compute from Timeline

```tsx
// Added line 274-283 in PocketTimeline.tsx
const projectedBalance = useMemo(() => {
  if (!entries || entries.length === 0) {
    return balance.availableBalance;
  }
  return entries[0].balanceAfter; // ✅ Entry terakhir/terbaru
}, [entries, balance.availableBalance]);
```

---

### Change 2: Use in Display

```tsx
// Changed line 559, 563
// BEFORE:
{formatCurrency(isRealtimeMode ? realtimeBalance : balance.availableBalance)}

// AFTER:
{formatCurrency(isRealtimeMode ? realtimeBalance : projectedBalance)}
```

---

## 🎯 Logic

**Saldo Proyeksi = `entries[0].balanceAfter`**

Why? 
- Timeline entries sorted DESC (newest first)
- `entries[0]` = transaksi terakhir yang di-input user
- `balanceAfter` = saldo setelah transaksi tersebut

**Example:**
```
Timeline (sorted DESC):
├─ 26 Nov: Hotel -250k  → balanceAfter: 15.661.398 ← entries[0] ✅
├─ 25 Nov: Food  -500k  → balanceAfter: 15.911.398
└─ 10 Nov: Income +1M   → balanceAfter: 10.000.000

Saldo Proyeksi = 15.661.398 ✅
```

---

## 📊 Before vs After

| Metric | Before | After |
|--------|--------|-------|
| Saldo Proyeksi | -Rp 77.304 ❌ | Rp 15.661.398 ✅ |
| Source | `balance.availableBalance` (server) | `entries[0].balanceAfter` (timeline) |
| Consistency | Tidak match timeline ❌ | Match timeline ✅ |

---

## 🧪 Test Checklist

```
[ ] Saldo Proyeksi = timeline entry terakhir
[ ] Mode Realtime tetap pakai realtimeBalance
[ ] Empty timeline tidak error (fallback)
[ ] Add transaction update proyeksi
```

---

**Full Docs**: `/PROJECTED_BALANCE_FIX_TIMELINE.md`
