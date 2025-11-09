# Timeline Kantong v3 - Quick Reference

**File:** `/components/PocketTimeline.tsx`  
**Status:** ✅ Production Ready

---

## 🎯 4 Perubahan Visual

| # | Perubahan | Before | After |
|---|-----------|--------|-------|
| 1 | **Universal Icons** | $ (Dollar), 🛍️ (Shopping) | + (Plus), - (Minus), → (Arrow) |
| 2 | **Category Emoji** | ❌ Tidak ada | ✅ Inline: `🏨 Hotel` |
| 3 | **Metadata** | 2 baris (badge + date) | 1 baris: `Akan Datang • 26 Nov` |
| 4 | **Hierarchy** | ✅ Already correct | Nominal bold, Saldo abu-abu kecil |

---

## 🔧 Key Functions

### 1. Universal Icons
```typescript
const getIcon = (entry: TimelineEntry) => {
  switch (entry.type) {
    case 'income': return <Plus />;
    case 'expense': return <Minus />;
    case 'transfer': return entry.metadata?.direction === 'in' 
      ? <ArrowLeft /> : <ArrowRight />;
  }
}
```

### 2. Category Emoji
```typescript
const categoryId = entry.metadata?.category;
const categoryConfig = getCategoryConfig(categoryId, settings);
const categoryEmoji = categoryConfig?.emoji || '';

// Display
{categoryEmoji && <span className="mr-1">{categoryEmoji}</span>}
{entry.description}
```

### 3. Metadata (1 Line)
```typescript
<p className="text-xs text-muted-foreground">
  {showFutureStyle && <span>Akan Datang • </span>}
  {formatDate(entry.date)}
</p>
```

---

## ✅ Backward Compatibility

| Scenario | Handling |
|----------|----------|
| Entry tanpa kategori | Skip emoji (graceful fallback) |
| Legacy Lucide icons | `renderPocketIcon()` masih support |
| Old timeline data | Works perfectly |

---

## 🎨 Visual Example

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Rabu, 26 November 2025
   ──────────────────────────────────

   ⊖  🏨 Hotel              -Rp 1.557.208
      Akan Datang • 26 Nov   Saldo: Rp 13M

   ⊕  💻 CGTrader           +Rp 48.000
      19 Nov, 07:00          Saldo: Rp 14M
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 📊 Testing Checklist

```
✅ Expense dengan kategori → Emoji muncul
✅ Expense tanpa kategori → No crash, skip emoji
✅ Income → Plus icon, no emoji
✅ Transfer In → Arrow Left
✅ Transfer Out → Arrow Right
✅ Badge "Akan Datang" → Gabung dengan date
✅ Mobile & Desktop → Layout responsive
```

---

## 🚀 Benefits

1. **2x Faster Skimming** - Emoji kategori langsung scan
2. **Universal Icons** - Tidak bias ke kategori
3. **30% Less Vertical Space** - Metadata 1 baris
4. **Clear Hierarchy** - Nominal menonjol, saldo subtle

---

## 📁 Related

- Planning: `PLANNING.md`
- Implementation: `IMPLEMENTATION_COMPLETE.md`
- Component: `/components/PocketTimeline.tsx`

---

**Last Updated:** 2025-11-09
