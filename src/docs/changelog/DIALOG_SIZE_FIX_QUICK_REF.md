# Dialog Size Fix - Quick Reference (20% Larger)

## 🎯 Problem
Dialog tidak membesar meskipun sudah set `max-w-6xl` → constraint `sm:max-w-lg` di base component

## ✅ Solution
1. **Remove** `sm:max-w-lg` dari `/components/ui/dialog.tsx` dan `/components/ui/alert-dialog.tsx`
2. **Enlarge ALL** dialogs by ~20% untuk desktop (15 dialogs total)
3. **Use** responsive pattern: `max-w-[calc(100%-2rem)] sm:max-w-*`

## 📏 Dialog Sizes Reference (20% Larger)

### Extra Large Dialogs
```tsx
<DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
  {/* WishlistSimulation - 896px (was 768px) */}
</DialogContent>
```

### Large Dialogs  
```tsx
<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
  {/* Complex Forms - 768px (was 672px) */}
  {/* AddExpense, AddIncome, EditExpense, ManagePockets, PocketTimeline */}
</DialogContent>
```

### Medium Dialogs
```tsx
<DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
  {/* WishlistDialog - 672px (was 576px) */}
</DialogContent>
```

### Standard Dialogs
```tsx
<DialogContent className="sm:max-w-[600px]">
  {/* Budget, Transfer - 600px (was 500px) */}
</DialogContent>

<DialogContent className="max-w-xl">
  {/* Command Palette - 576px (was 512px) */}
</DialogContent>
```

### Small Dialogs
```tsx
<AlertDialogContent className="max-w-xl">
  {/* Confirmations - 576px (was 448px) */}
</AlertDialogContent>
```

## 🎨 WishlistSimulation Enhancements

### Skeleton Loading
- ✅ Summary cards skeleton
- ✅ Health bar skeleton  
- ✅ Priority breakdown skeleton
- ✅ Item cards skeleton (3 items)

### Enlarged Elements (Desktop)
- Dialog: `max-w-3xl` → `max-w-4xl` (896px)
- Title: default → `text-2xl`
- Amounts: `text-2xl` → `text-3xl`
- Spacing: `space-y-4 gap-4` → `space-y-6 gap-6`
- Icons: `h-4 w-4` → `h-5 w-5`
- ScrollArea: `400px` → `500px`

## 📊 Complete Dialog Inventory (15 Total)

### By Size Category:
- **4xl (896px)**: 1 dialog - WishlistSimulation
- **3xl (768px)**: 7 dialogs - AddExpense, AddIncome, EditExpense, BulkDelete, ManagePockets, PocketTimeline, EditIncome
- **2xl (672px)**: 1 dialog - WishlistDialog
- **xl (576px)**: 4 dialogs - CommandPalette, FixedTemplates, DeleteConfirm (2x)
- **[600px]**: 2 dialogs - Budget, Transfer

## 🔧 Modified Files (17 Total)

### Base Components (2):
- `/components/ui/dialog.tsx`
- `/components/ui/alert-dialog.tsx`

### App Components (15):
- `/components/BudgetForm.tsx`
- `/components/ExpenseList.tsx` (3 dialogs)
- `/components/AdditionalIncomeList.tsx`
- `/components/AddAdditionalIncomeDialog.tsx`
- `/components/AddExpenseDialog.tsx`
- `/components/FixedExpenseTemplates.tsx`
- `/components/PocketTimeline.tsx`
- `/components/PocketsSummary.tsx` (2 dialogs)
- `/components/TransferDialog.tsx`
- `/components/ManagePocketsDialog.tsx`
- `/components/WishlistDialog.tsx`
- `/components/WishlistSimulation.tsx`
- `/components/ui/command.tsx`

## 📱 Responsive Behavior
- **Mobile**: Bottom sheet `h-[75vh]` - UNCHANGED ✓
- **Desktop**: All dialogs ~20% larger with proper max-width ✓
- **Tablet**: Smooth transition between mobile/desktop ✓
