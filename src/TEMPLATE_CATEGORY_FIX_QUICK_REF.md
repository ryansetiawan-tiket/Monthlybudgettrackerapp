# Template Category Fix - Quick Reference

**Status:** ✅ FIXED  
**Date:** November 10, 2025

---

## 🐛 The Bug

Template expenses showed ⚠️ warning instead of category emoji

**Root Cause:**
- Template expenses store category PER ITEM in `expense.items[].category`
- ExpenseList only checked `expense.category` (which is undefined for templates)

---

## ✅ The Fix

**File:** `/components/ExpenseList.tsx` (3 locations updated)

**Logic:**
```tsx
1. If expense.category exists → Show it (single expense)
2. Else if expense.items[].category exists → Show first item's category (template)
3. Else → Show ⚠️ (truly uncategorized)
```

**Code Pattern:**
```tsx
{(() => {
  // Single expense
  if (expense.category) {
    return <span>{getCategoryEmoji(expense.category, settings)}</span>;
  }
  // Template expense
  if (expense.items && expense.items.length > 0) {
    const itemsWithCategories = expense.items.filter((item: any) => item.category);
    if (itemsWithCategories.length > 0) {
      const firstCategory = itemsWithCategories[0].category;
      return <span title={`multi-cat (${itemsWithCategories.length} items)`}>
        {getCategoryEmoji(firstCategory, settings)}
      </span>;
    }
  }
  // No category
  return <span>⚠️</span>;
})()}
```

---

## 📊 Data Structure

### Single Expense
```typescript
{
  category: "food",  // ← Category here
  items: undefined
}
```

### Template Expense
```typescript
{
  category: undefined,  // ← No category at expense level
  items: [
    { name: "Item 1", category: "food" },      // ← Category per item
    { name: "Item 2", category: "transport" }
  ]
}
```

---

## 🎯 Result

**Before:**
```
⚠️ Ngantor  Rp 75.000
```

**After:**
```
🍔 Ngantor  Rp 75.000
   (tooltip: "multi-cat (3 items)")
```

---

## 🧪 Testing

- [x] Template with categories → Shows first item's category ✅
- [x] Single expense → Shows expense category ✅  
- [x] Uncategorized → Shows ⚠️ ✅
- [x] Custom categories work ✅

---

**Quick Fix Summary:**  
Changed category display logic to check BOTH `expense.category` AND `expense.items[].category` in 3 locations in ExpenseList.tsx

**Impact:** Template expenses now display category emoji correctly instead of ⚠️ warning
