# Expense Categories - Quick Reference

**Fast lookup guide for developers**

---

## 📦 Categories Cheatsheet

```typescript
food        → 🍔 Makanan
transport   → 🚗 Transportasi
savings     → 💰 Tabungan
bills       → 📄 Tagihan
health      → 🏥 Kesehatan
loan        → 💳 Pinjaman
family      → 👨‍👩‍👧‍👦 Keluarga
entertainment → 🎬 Hiburan
installment → 💸 Cicilan
shopping    → 🛒 Belanja
other       → 📦 Lainnya (default)
```

---

## 🔧 Quick Code Snippets

### Get Category Emoji
```typescript
import { EXPENSE_CATEGORIES } from '@/constants';

const emoji = EXPENSE_CATEGORIES[expense.category || 'other'].emoji;
// Result: 🍔
```

### Display in Component
```typescript
<div className="flex items-center gap-2">
  <span>{EXPENSE_CATEGORIES[expense.category || 'other'].emoji}</span>
  <span>{expense.name}</span>
</div>
```

### Category Selector (Select Component)
```typescript
<Select value={category} onValueChange={setCategory}>
  <SelectTrigger>
    <SelectValue placeholder="Pilih kategori (opsional)" />
  </SelectTrigger>
  <SelectContent>
    {Object.entries(EXPENSE_CATEGORIES).map(([key, { label, emoji }]) => (
      <SelectItem key={key} value={key}>
        {emoji} {label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

---

## 🎯 Common Patterns

### Add Category to Expense
```typescript
const newExpense: Expense = {
  // ... other fields
  category: selectedCategory || undefined, // Optional
};
```

### Filter by Category
```typescript
const foodExpenses = expenses.filter(e => e.category === 'food');
```

### Group by Category
```typescript
const byCategory = expenses.reduce((acc, expense) => {
  const cat = expense.category || 'other';
  if (!acc[cat]) acc[cat] = [];
  acc[cat].push(expense);
  return acc;
}, {} as Record<ExpenseCategory, Expense[]>);
```

---

## 🧪 Testing Quick Checks

```bash
# Create expense with category
✓ Emoji muncul di list

# Create expense without category  
✓ Emoji 📦 (other) muncul

# Load old data without category field
✓ Emoji 📦 (other) muncul, no crash

# Bulk edit 5 expenses
✓ All updated to new category

# Template "Pulsa" 
✓ Default category = bills (📄)
```

---

## 📱 UI Components Affected

- ✅ `AddExpenseForm.tsx` - Category selector
- ✅ `ExpenseList.tsx` - Emoji display
- ✅ `FixedExpenseTemplates.tsx` - Default categories
- ✅ `BulkEditCategoryDialog.tsx` - NEW component

---

## 🚀 Future Analytics Examples

### Pie Chart
```typescript
const categoryTotals = expenses.reduce((acc, e) => {
  const cat = e.category || 'other';
  acc[cat] = (acc[cat] || 0) + e.amount;
  return acc;
}, {});
```

### Budget per Category
```typescript
const categoryBudgets = {
  food: 2000000,
  transport: 1000000,
  // ... etc
};

const remaining = categoryBudgets.food - foodTotal;
```

---

**Last Updated**: November 6, 2025
