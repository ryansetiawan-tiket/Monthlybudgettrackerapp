# Wishlist More Menu - Quick Reference

**Updated**: November 7, 2025 | **Component**: `WishlistSimulation.tsx`

---

## 🎯 What Changed

**BEFORE**: Swipe gesture to show Edit/Delete buttons  
**AFTER**: More button (⋮) with dropdown menu

---

## 📋 Menu Options

| Option | Icon | Action | Notes |
|--------|------|--------|-------|
| **Show/Hide Item** | 👁️/🙈 | Toggle exclude dari simulasi | NEW! |
| **Buka Link** | 🔗 | Open URL in new tab | Only if URL exists |
| **Edit Item** | ✏️ | Open edit dialog | Same as before |
| **Hapus Item** | 🗑️ | Delete with confirmation | Red text |

---

## 🆕 Hide Item Feature

### Purpose
Exclude item dari simulasi budget **tanpa menghapus** dari wishlist

### Visual Indicators
- Badge: `[🙈 Hidden]`
- Card: 50% opacity + dashed border
- Notice: "X item disembunyikan dan tidak termasuk dalam simulasi budget"

### Behavior
- ✅ Hidden items **excluded** from simulation
- ✅ Hidden items **excluded** from filters
- ✅ Hidden items **NOT counted** in affordable calculations
- ✅ Can be un-hidden anytime
- ⚠️ State **NOT persisted** (resets on refresh)

---

## 🎨 UI Elements

### Card with More Menu
```
┌──────────────────────────────────┐
│ Item Name  [⭐ High] [🙈 Hidden] ⋮ │
│ Rp 500,000                       │
│ Description                      │
└──────────────────────────────────┘
```

### Dropdown Menu
```
⋮ → ┌──────────────────────┐
    │ 👁️ Tampilkan Item    │ (if hidden)
    │ 🙈 Sembunyikan Item  │ (if visible)
    ├──────────────────────┤
    │ 🔗 Buka Link         │ (if URL)
    │ ✏️ Edit Item         │
    │ 🗑️ Hapus Item        │ (red)
    └──────────────────────┘
```

### Notice (when items hidden)
```
┌─────────────────────────────────────────┐
│ 🙈 2 item disembunyikan dan tidak       │
│    termasuk dalam simulasi budget       │
└─────────────────────────────────────────┘
```

---

## 💻 Code Snippets

### State
```typescript
const [hiddenItemIds, setHiddenItemIds] = useState<Set<string>>(new Set());
```

### Toggle Handler
```typescript
const handleToggleVisibility = (itemId: string) => {
  setHiddenItemIds(prev => {
    const newSet = new Set(prev);
    if (newSet.has(itemId)) {
      newSet.delete(itemId);
      toast.success('Item ditampilkan di simulasi');
    } else {
      newSet.add(itemId);
      toast.success('Item disembunyikan dari simulasi');
    }
    return newSet;
  });
};
```

### Filtering (exclude hidden)
```typescript
const filteredItems = useMemo(() => {
  let items = wishlist.filter(item => !hiddenItemIds.has(item.id));
  // ... apply other filters
  return items;
}, [wishlist, hiddenItemIds, filterState]);
```

---

## ✅ Quick Test

1. Click More (⋮) on any item
2. Select "Sembunyikan Item"
3. ✓ Badge "Hidden" appears
4. ✓ Card becomes transparent with dashed border
5. ✓ Toast appears
6. ✓ Notice shows "1 item disembunyikan..."
7. ✓ Item excluded from affordable count
8. Click More (⋮) again
9. Select "Tampilkan Item"
10. ✓ Badge removed, card normal, notice gone

---

## 🚀 Benefits

- ✅ No accidental swipes
- ✅ Clearer action labels
- ✅ Hide items without deleting
- ✅ Better mobile UX
- ✅ Consistent with other components
- ✅ Easy to extend

---

## ⚠️ Limitations

- Hidden state **NOT saved** to database
- Resets on page refresh
- To persist, add `hidden: boolean` field to schema

---

**Status**: ✅ Complete | **Breaking**: None
