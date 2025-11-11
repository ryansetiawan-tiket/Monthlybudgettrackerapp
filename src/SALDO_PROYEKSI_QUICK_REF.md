# 🚀 Saldo Proyeksi - Quick Reference

**Last Updated:** 10 November 2025  
**Status:** ✅ Fixed and tested  
**Scope:** ✅ **UNIVERSAL** - Berlaku untuk SEMUA kantong (Sehari-hari, Uang Dingin, Custom)

---

## ⚡ Quick Debug Guide

### Issue: Saldo Proyeksi shows wrong amount
**Symptoms:**
- Card shows different balance than Timeline final balance
- Amount much smaller than expected
- Missing future transactions

**⚠️ Note:** This can affect **ANY pocket** (Sehari-hari, Uang Dingin, Custom)!

**Quick Check:**
1. Open Timeline for the pocket
2. Look at the FIRST entry (newest/bottom in visual = top in data)
3. Check `balanceAfter` value
4. Compare with card "Saldo Proyeksi" amount
5. Should match exactly! ✅

**If different:**
- Timeline not loaded yet → Wait for prefetch
- Cache issue → Refresh page
- Mode is "Saldo Hari Ini" not "Saldo Proyeksi" → Toggle mode

---

## 📍 Key Code Locations

### calculateProjectedBalance Function
**File:** `/components/PocketsSummary.tsx`  
**Line:** ~235-246  
**Purpose:** Calculate projected balance at end of month

```typescript
const calculateProjectedBalance = useCallback((pocketId: string): number | null => {
  const timeline = timelineCache.get(pocketId);
  if (!timeline || timeline.length === 0) {
    return null; // Fallback to server balance
  }
  
  // Timeline sorted DESC → [0] = newest = final balance
  return timeline[0].balanceAfter;
}, [timelineCache]);
```

### Balance Display Logic
**File:** `/components/PocketsSummary.tsx`  
**Line:** ~640-650  
**Purpose:** Choose correct balance based on mode

```typescript
const isRealtime = realtimeMode.get(pocket.id);
const realtimeBalance = isRealtime ? calculateRealtimeBalance(pocket.id, true) : null;
const projectedBalance = !isRealtime ? calculateProjectedBalance(pocket.id) : null;
const displayBalance = realtimeBalance !== null 
  ? realtimeBalance 
  : (projectedBalance !== null ? projectedBalance : balance.availableBalance);
```

---

## 🔍 Mode Comparison

| Mode | Label | Calculation | Includes Future? | Use Case |
|------|-------|-------------|------------------|----------|
| **Realtime** | "Saldo Hari Ini" | Last entry ≤ today | ❌ No | Current balance |
| **Projection** | "Saldo Proyeksi" | Latest entry (timeline[0]) | ✅ Yes | Month-end projection |

---

## 🐛 Common Mistakes

### Mistake 1: Using availableBalance for projection
```typescript
❌ const displayBalance = balance.availableBalance  // Only current month!
✅ const displayBalance = calculateProjectedBalance(pocketId)  // Full month!
```

### Mistake 2: Not checking timeline cache
```typescript
❌ return timeline[0].balanceAfter  // Crash if timeline empty!
✅ if (!timeline || timeline.length === 0) return null;  // Safe!
   return timeline[0].balanceAfter;
```

### Mistake 3: Confusing realtime vs projection
```typescript
❌ Always use calculateRealtimeBalance()  // Wrong for projection!
✅ Use calculateRealtimeBalance() for "Saldo Hari Ini"
   Use calculateProjectedBalance() for "Saldo Proyeksi"
```

---

## 🧪 Testing Quick Checklist

### Basic Test
- [ ] Card shows "Saldo Proyeksi" label
- [ ] Amount matches Timeline final balance
- [ ] Toggle to "Saldo Hari Ini" shows different (lower) amount
- [ ] Toggle back to "Saldo Proyeksi" restores projected amount

### Edge Cases
- [ ] Timeline not loaded → Shows loading skeleton
- [ ] Empty timeline → Fallback to server balance
- [ ] Future transactions exist → Included in projection
- [ ] Past transactions only → Shows accurate total

### Data Validation
```typescript
// Console debug command
const pocket = pockets.find(p => p.id === 'cold_money');
const timeline = timelineCache.get(pocket.id);
console.log({
  finalBalance: timeline[0].balanceAfter,  // Should match card!
  cardBalance: displayBalance,
  mode: realtimeMode.get(pocket.id) ? 'Realtime' : 'Projection'
});
```

---

## 💡 Pro Tips

### Tip 1: Timeline is Source of Truth
For display purposes, **always prefer timeline balance** over server balance:
- Timeline has complete history
- Timeline balanceAfter already calculated
- Server balance might be stale

### Tip 2: Prefetch is Key
PocketsSummary prefetches timeline on:
- Component mount (for realtime-enabled pockets)
- Mouse hover (desktop)
- Touch start (mobile)

→ Makes "Saldo Proyeksi" instant!

### Tip 3: Fallback Strategy
Always have 3-tier fallback:
1. Try mode-specific calculation (realtime/projection)
2. Try opposite mode calculation (if cache exists)
3. Fallback to server balance (last resort)

### Tip 4: Cache Invalidation
Timeline cache invalidates when:
- New transaction added
- Transaction edited
- Transaction deleted
- Month changed

→ Refresh handled automatically by prefetch system!

---

## 🔧 Debugging Commands

### Check timeline cache
```javascript
// In browser console
const pocketId = 'cold_money';
const timeline = timelineCache.get(pocketId);
console.log('Timeline entries:', timeline?.length);
console.log('Final balance:', timeline?.[0]?.balanceAfter);
console.log('First entry:', timeline?.[0]);
```

### Verify mode state
```javascript
// Check current mode
const mode = realtimeMode.get('cold_money');
console.log('Mode:', mode ? 'Realtime (Saldo Hari Ini)' : 'Projection (Saldo Proyeksi)');
```

### Force refresh
```javascript
// Refresh all pocket data
window.__refreshPockets?.();

// Refresh specific timeline (internal function)
// prefetchTimeline('cold_money');
```

---

## 📊 Data Flow Diagram

```
User Opens Page
      ↓
fetchPockets()
      ↓
Server returns balances { availableBalance }
      ↓
Prefetch timeline (realtime-enabled pockets)
      ↓
Timeline cached in timelineCache Map
      ↓
User views card
      ↓
Check mode: Realtime or Projection?
      ↓
┌─────────────────┬─────────────────┐
│   Realtime      │   Projection    │
│       ↓         │        ↓        │
│ Find entry      │  Use timeline[0]│
│  ≤ today        │   (newest)      │
│       ↓         │        ↓        │
│ balanceAfter    │  balanceAfter   │
└─────────────────┴─────────────────┘
      ↓
Display Balance on Card ✅
```

---

## ⚠️ Important Notes

1. **Timeline sorting:** Always DESC (newest first in array)
   - `timeline[0]` = Latest entry = End of month balance
   - `timeline[timeline.length - 1]` = Oldest entry = Beginning of month

2. **Mode persistence:** Saved in localStorage per pocket
   - Key: `realtime-mode-${pocketId}`
   - Value: `'true'` or `'false'`
   - Default: `true` (Realtime mode)

3. **Loading states:**
   - Show skeleton while `timelineLoading.get(pocketId) === true`
   - Show server balance while timeline loading
   - Update to timeline balance when loaded

4. **Performance:**
   - Timeline prefetch is parallel (all pockets at once)
   - Memoized with `useCallback` to prevent recalculation
   - Cache persists until invalidated

---

## 📁 Related Documentation

- **Main Fix:** `/SALDO_PROYEKSI_UANG_DINGIN_FIX.md`
- **Timeline Bugs:** `/TIMELINE_UANG_DINGIN_BUG_FIX_COMPLETE.md`
- **Carry-Over System:** `/SALDO_AWAL_FIX_V2_COMPLETE.md`
- **Architecture:** `/planning/kantong-architecture-fix-v3-safe/`

---

**Need help? Check server logs with `[TIMELINE]` or `[BALANCE]` prefix! 🚀**
