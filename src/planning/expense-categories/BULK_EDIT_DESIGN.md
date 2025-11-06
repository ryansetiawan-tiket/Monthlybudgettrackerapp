# Bulk Edit Category - Feature Design

**Detailed design for bulk category editing**

---

## 🎯 Feature Overview

Allow users to select multiple expenses and update their categories in one action. Essential for organizing existing uncategorized expenses quickly.

---

## 🎨 UI Flow

### Step 1: Enter Bulk Edit Mode
```
┌─────────────────────────────────────┐
│ Daftar Pengeluaran    [Edit Massal]│
├─────────────────────────────────────┤
│ ☐ 🍔 Makan Siang       -50,000     │
│ ☐ 📦 Belanja          -100,000     │
│ ☐ 📦 Bensin           -200,000     │
│ ☐ 👨‍👩‍👧‍👦 Kiriman         -500,000     │
└─────────────────────────────────────┘
```

### Step 2: Select Items
```
┌─────────────────────────────────────┐
│ 2 dipilih             [Batal] [OK] │
├─────────────────────────────────────┤
│ ☑ 🍔 Makan Siang       -50,000     │
│ ☐ 📦 Belanja          -100,000     │
│ ☑ 📦 Bensin           -200,000     │
│ ☐ 👨‍👩‍👧‍👦 Kiriman         -500,000     │
└─────────────────────────────────────┘
```

### Step 3: Choose New Category
```
┌─────────────────────────────────────┐
│ Edit Kategori                       │
├─────────────────────────────────────┤
│ 2 pengeluaran dipilih               │
│                                     │
│ Kategori Baru                       │
│ ┌─────────────────────────────────┐ │
│ │ 🚗 Transportasi             ▼  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Yang akan diupdate:                 │
│ • Makan Siang                       │
│ • Bensin                            │
│                                     │
│         [Batal]     [Update]        │
└─────────────────────────────────────┘
```

### Step 4: Confirmation & Success
```
┌─────────────────────────────────────┐
│ ✅ 2 pengeluaran berhasil diupdate  │
└─────────────────────────────────────┘

Updated list:
┌─────────────────────────────────────┐
│ Daftar Pengeluaran                  │
├─────────────────────────────────────┤
│ 🚗 Makan Siang         -50,000     │
│ 📦 Belanja            -100,000     │
│ 🚗 Bensin             -200,000     │
│ 👨‍👩‍👧‍👦 Kiriman           -500,000     │
└─────────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### State Management
```typescript
// In ExpenseList.tsx
const [isBulkEditMode, setIsBulkEditMode] = useState(false);
const [selectedExpenseIds, setSelectedExpenseIds] = useState<string[]>([]);
const [bulkEditDialogOpen, setBulkEditDialogOpen] = useState(false);

// Toggle bulk edit mode
const toggleBulkEditMode = () => {
  setIsBulkEditMode(!isBulkEditMode);
  setSelectedExpenseIds([]); // Clear selections
};

// Toggle individual selection
const toggleExpenseSelection = (id: string) => {
  setSelectedExpenseIds(prev =>
    prev.includes(id)
      ? prev.filter(eid => eid !== id)
      : [...prev, id]
  );
};
```

### BulkEditCategoryDialog Component
```typescript
interface BulkEditCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenseIds: string[];
  expenses: Expense[];
  onUpdate: (ids: string[], category: ExpenseCategory) => Promise<void>;
}

const BulkEditCategoryDialog: React.FC<BulkEditCategoryDialogProps> = ({
  open,
  onOpenChange,
  expenseIds,
  expenses,
  onUpdate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory>();
  const [isLoading, setIsLoading] = useState(false);

  const selectedExpenses = expenses.filter(e => expenseIds.includes(e.id));

  const handleUpdate = async () => {
    if (!selectedCategory) return;
    
    setIsLoading(true);
    try {
      await onUpdate(expenseIds, selectedCategory);
      toast.success(`${expenseIds.length} pengeluaran berhasil diupdate`);
      onOpenChange(false);
    } catch (error) {
      toast.error('Gagal update kategori');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* ... Dialog content */}
    </Dialog>
  );
};
```

### API Update Function
```typescript
// In useBudgetData.ts or similar
const bulkUpdateCategory = async (
  expenseIds: string[], 
  category: ExpenseCategory
) => {
  // Batch update via Supabase
  const updates = expenseIds.map(id => ({
    id,
    category,
    updated_at: new Date().toISOString()
  }));

  const { error } = await supabase
    .from('expenses')
    .upsert(updates);

  if (error) throw error;

  // Update local state
  setExpenses(prev =>
    prev.map(expense =>
      expenseIds.includes(expense.id)
        ? { ...expense, category }
        : expense
    )
  );
};
```

---

## 🎯 UX Considerations

### Entry Point
- **"Edit Massal" button** di header ExpenseList
- Only visible when expenses exist
- Clear visual state when active

### Selection UX
- **Checkbox** appears on left of each item
- **Tap anywhere on row** to toggle (not just checkbox)
- **Select All** option in header
- **Count indicator** shows how many selected

### Feedback
- **Disable "OK" button** if nothing selected
- **Loading state** during update
- **Success toast** with count
- **Error handling** with retry option

### Mobile Optimization
- Large touch targets (48px minimum)
- Clear visual selected state
- Bottom sheet for category picker on mobile
- Prevent accidental selections

---

## 🚀 Future Enhancements

### Smart Selection
- "Select all uncategorized" quick action
- "Select all in category X" filter
- Date range selection

### Advanced Actions
- **Multi-action**: Delete, exclude, transfer pocket
- **Copy category** from one expense to others
- **Batch edit multiple fields** (not just category)

### Undo/Redo
- Undo last bulk action
- Action history
- Revert changes within timeframe

---

## ✅ Acceptance Criteria

- [ ] Can enter bulk edit mode
- [ ] Can select/deselect multiple expenses
- [ ] Select all / clear all works
- [ ] Category picker shows all 11 categories
- [ ] Update successful with toast feedback
- [ ] UI exits bulk mode after update
- [ ] Error handling graceful
- [ ] Mobile-friendly touch targets
- [ ] Performance good with 100+ expenses
- [ ] Keyboard accessible (desktop)

---

**Design Version**: 1.0  
**Last Updated**: November 6, 2025
