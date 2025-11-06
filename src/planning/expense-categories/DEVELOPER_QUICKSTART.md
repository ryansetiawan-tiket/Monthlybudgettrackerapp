# Developer Quick Start - Expense Categories

**Get started implementing category system in 5 minutes**

---

## 🚀 TL;DR

Adding category system to expense tracking app:
- 11 pre-defined categories (food, transport, bills, etc.)
- Emoji visual indicators (🍔, 🚗, 📄)
- Optional field - backward compatible
- Dropdown selector in AddExpenseForm
- Bulk edit for existing expenses

---

## ⚡ Quick Implementation Steps

### 1️⃣ Add Types (5 min)
**File**: `/types/index.ts`

```typescript
// Add this
export type ExpenseCategory = 
  | 'food' | 'transport' | 'savings' | 'bills' 
  | 'health' | 'loan' | 'family' | 'entertainment' 
  | 'installment' | 'shopping' | 'other';

// Update this
export interface Expense {
  // ... existing fields
  category?: ExpenseCategory; // NEW: optional
}
```

---

### 2️⃣ Add Constants (5 min)
**File**: `/constants/index.ts`

```typescript
export const EXPENSE_CATEGORIES = {
  food: { label: 'Makanan', emoji: '🍔' },
  transport: { label: 'Transportasi', emoji: '🚗' },
  savings: { label: 'Tabungan', emoji: '💰' },
  bills: { label: 'Tagihan', emoji: '📄' },
  health: { label: 'Kesehatan', emoji: '🏥' },
  loan: { label: 'Pinjaman', emoji: '💳' },
  family: { label: 'Keluarga', emoji: '👨‍👩‍👧‍👦' },
  entertainment: { label: 'Hiburan', emoji: '🎬' },
  installment: { label: 'Cicilan', emoji: '💸' },
  shopping: { label: 'Belanja', emoji: '🛒' },
  other: { label: 'Lainnya', emoji: '📦' }
} as const;
```

---

### 3️⃣ Add Helper (3 min)
**File**: `/utils/calculations.ts`

```typescript
import { EXPENSE_CATEGORIES } from '@/constants';
import type { ExpenseCategory } from '@/types';

export const getCategoryEmoji = (category?: ExpenseCategory): string => {
  return EXPENSE_CATEGORIES[category || 'other'].emoji;
};

export const getCategoryLabel = (category?: ExpenseCategory): string => {
  return EXPENSE_CATEGORIES[category || 'other'].label;
};
```

---

### 4️⃣ Update AddExpenseForm (10 min)
**File**: `/components/AddExpenseForm.tsx`

```typescript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { EXPENSE_CATEGORIES } from '@/constants';
import type { ExpenseCategory } from '@/types';

// Add state
const [category, setCategory] = useState<ExpenseCategory | undefined>();

// In form JSX, add after name input:
<div className="space-y-2">
  <Label htmlFor="category">Kategori (Opsional)</Label>
  <Select value={category} onValueChange={(val) => setCategory(val as ExpenseCategory)}>
    <SelectTrigger>
      <SelectValue placeholder="Pilih kategori" />
    </SelectTrigger>
    <SelectContent>
      {Object.entries(EXPENSE_CATEGORIES).map(([key, { label, emoji }]) => (
        <SelectItem key={key} value={key}>
          {emoji} {label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

// In submit handler, include category:
const newExpense: Expense = {
  // ... other fields
  category: category || undefined
};
```

---

### 5️⃣ Update ExpenseList Display (5 min)
**File**: `/components/ExpenseList.tsx`

```typescript
import { getCategoryEmoji } from '@/utils/calculations';

// In expense list item render:
<div className="flex items-center gap-2">
  <span className="text-xl">{getCategoryEmoji(expense.category)}</span>
  <span>{expense.name}</span>
</div>
```

---

### 6️⃣ Update Templates (10 min)
**File**: `/components/FixedExpenseTemplates.tsx`

```typescript
// Update template data structure
const templates = [
  { 
    name: 'Pulsa', 
    amount: 50000, 
    category: 'bills' as ExpenseCategory 
  },
  { 
    name: 'Bensin', 
    amount: 100000, 
    category: 'transport' as ExpenseCategory 
  },
  // ... etc
];

// When creating expense from template:
const newExpense: Expense = {
  // ... other fields
  category: template.category
};
```

---

## ✅ Verification Checklist

After implementation, verify:

```bash
# Test 1: New expense with category
[ ] Create expense → Select "🍔 Makanan" → Save
[ ] Expense shows "🍔" emoji in list

# Test 2: New expense without category
[ ] Create expense → Skip category → Save
[ ] Expense shows "📦" emoji (default 'other')

# Test 3: Backward compatibility
[ ] Refresh app with old data
[ ] Old expenses show "📦" emoji
[ ] No errors in console

# Test 4: Templates
[ ] Add expense from "Pulsa" template
[ ] Category pre-filled as "📄 Tagihan"
[ ] Can change category before saving

# Test 5: Mobile UX
[ ] Category dropdown opens smoothly
[ ] All 11 categories visible
[ ] Touch targets adequate (48px+)
```

---

## 🐛 Common Issues & Fixes

### Issue 1: Emoji not showing
```typescript
// ❌ Wrong
<div>{expense.category}</div>

// ✅ Correct
<div>{getCategoryEmoji(expense.category)}</div>
```

---

### Issue 2: Old data crashes
```typescript
// ❌ Wrong
const emoji = EXPENSE_CATEGORIES[expense.category].emoji;

// ✅ Correct (handles undefined)
const emoji = EXPENSE_CATEGORIES[expense.category || 'other'].emoji;
```

---

### Issue 3: Category not saving
```typescript
// ✅ Make sure to include in payload
const newExpense: Expense = {
  name,
  amount,
  category: category || undefined, // Don't forget this!
  // ... other fields
};
```

---

## 📚 Next Steps

**Phase 1 Complete?** Move to Phase 3:
1. Implement bulk edit dialog
2. See [BULK_EDIT_DESIGN.md](BULK_EDIT_DESIGN.md) for spec

**Want analytics?** Check future roadmap:
- See [FUTURE_ANALYTICS.md](FUTURE_ANALYTICS.md)

**Need code examples?** See quick reference:
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

---

## 🎯 Estimated Time

| Phase | Time | Files |
|-------|------|-------|
| Types & Constants | 10 min | 2 files |
| Helper Functions | 5 min | 1 file |
| AddExpenseForm | 15 min | 1 file |
| ExpenseList | 10 min | 1 file |
| Templates | 15 min | 1 file |
| **Total Core** | **~1 hour** | **5 files** |
| Bulk Edit | 30 min | 1 new file |
| Testing | 15 min | - |
| **Grand Total** | **~2 hours** | **6 files** |

---

## 💡 Pro Tips

1. **Test incrementally** - Test after each step, don't wait until end
2. **Use fallbacks** - Always handle `undefined` category gracefully
3. **Keep it optional** - Don't force users to categorize
4. **Mobile first** - Test dropdown on mobile screen size
5. **Log everything** - Console.log category values during development

---

## 🔗 Related Docs

- **Full Planning**: [README.md](README.md)
- **Visual Guide**: [VISUAL_SUMMARY.md](VISUAL_SUMMARY.md)
- **Implementation Log**: [IMPLEMENTATION_LOG.md](IMPLEMENTATION_LOG.md)
- **Code Snippets**: [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

---

**Quick Start v1.0** | November 6, 2025  
**Estimated Completion**: 1-2 hours for core features
