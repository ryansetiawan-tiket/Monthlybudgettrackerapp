# Wishlist Hide Fix - Quick Reference

**Updated**: Nov 7, 2025 | **Component**: `WishlistSimulation.tsx`

---

## ✅ What Was Fixed

### 1. Calculations Now Accurate ✅
**Before**: Hidden items still counted in totals  
**After**: Hidden items excluded from ALL calculations

### 2. Can Unhide Items ✅
**Before**: No way to see or unhide items  
**After**: Collapsible "Hidden Items" section at bottom

---

## 🔧 How It Works

### Filtered Simulation
```typescript
// Recalculates all metrics excluding hidden items
const filteredSimulation = useMemo(() => {
  const visibleItems = wishlist.filter(item => !hiddenItemIds.has(item.id));
  return {
    ...simulation,
    wishlist: { total, count, byPriority }, // Recalculated
    affordableNow: [...],  // Filtered
    scenarios: [...]       // Filtered
  };
}, [simulation, wishlist, hiddenItemIds]);
```

### Hidden Items Section
```typescript
const hiddenItems = wishlist.filter(item => hiddenItemIds.has(item.id));
const [showHiddenItems, setShowHiddenItems] = useState(false);
```

---

## 🎨 UI Elements

### 1. Clickable Notice
```
┌──────────────────────────────────────┐
│ 🙈 2 item disembunyikan dan tidak   │ ← Click to expand
│    termasuk dalam simulasi budget   │   "Klik untuk lihat →"
└──────────────────────────────────────┘
```

### 2. Hidden Items Section
```
┌──────────────────────────────────────┐
│ 🙈 Hidden Items (2)            ▼    │ ← Collapsible button
├──────────────────────────────────────┤
│ 💡 Item yang disembunyikan tidak    │
│    termasuk dalam simulasi budget   │
│                                      │
│ ┌────────────────────────────────┐  │
│ │ Item B - Rp 500,000       ⋮   │  │
│ │ [🙈 Hidden]                    │  │
│ │   More menu:                   │  │
│ │   → 👁️ Tampilkan Item          │  │
│ │   → ✏️ Edit Item               │  │
│ │   → 🗑️ Hapus Item              │  │
│ └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

---

## 📊 What Updates When Hiding/Showing

| Metric | Updates? | Example |
|--------|----------|---------|
| Total Wishlist | ✅ Yes | Rp 2M → Rp 1M |
| Item Count | ✅ Yes | 5 items → 4 items |
| Affordable Count | ✅ Yes | 3 → 2 |
| Priority Breakdown | ✅ Yes | High: 2 → 1 |
| Progress Bar | ✅ Yes | 50% → 75% |
| Shortage/Surplus | ✅ Yes | Kurang Rp 500K → Sisa Rp 200K |
| Scenarios | ✅ Yes | Only visible items |

---

## 🔄 User Flows

### Hide Item
```
1. Click More (⋮) on item
2. Select "Sembunyikan Item"
3. ✅ Calculations update instantly
4. ✅ Notice appears
5. ✅ Item moves to hidden section
```

### Unhide Item
```
Method 1: Via Notice
1. Click notice
2. Section expands
3. Click More (⋮) → "Tampilkan Item"
4. ✅ Item returns to main list
5. ✅ Calculations revert

Method 2: Via Button
1. Click "Hidden Items (X)" button
2. (same as above)
```

---

## 🧪 Quick Test

```
Initial State:
- Balance: Rp 1,000,000
- Item A: Rp 500,000
- Item B: Rp 800,000
- Total: Rp 1,300,000
- Kurang: Rp 300,000

Hide Item B:
- Total: Rp 500,000     ✅
- Sisa: Rp 500,000      ✅ (changed from shortage!)
- Notice: "1 item..."   ✅
- Hidden section shows  ✅

Show Item B:
- Total: Rp 1,300,000   ✅
- Kurang: Rp 300,000    ✅
- Notice disappears     ✅
```

---

## 💡 Key Features

1. **Real-time Calculations** - All metrics update instantly
2. **Reversible** - Easy to unhide without refresh
3. **Discoverable** - Clickable notice guides user
4. **Clean UI** - Collapsible section keeps interface tidy
5. **Transparent** - Always shows what's hidden

---

## ⚠️ Note

Hidden state is **NOT persisted** to database.  
Refreshing page will reset all items to visible.

---

**Status**: ✅ Complete | **Breaking**: None
