# Desktop Transaction Entry - Quick Reference

**Ultra-Fast Lookup Guide**  
**Date:** November 8, 2025

---

## 🎯 WHAT IS THIS?

Desktop CTA button + unified modal for adding transactions (Expense/Income)

---

## 📍 WHERE?

**Button Location:**  
`Daftar Transaksi ... [ + Tambah Transaksi ] [ 📊 ]`

**Component:**  
`/components/UnifiedTransactionDialog.tsx` (NEW)

---

## 🔧 FILES MODIFIED

```
✅ /components/UnifiedTransactionDialog.tsx (NEW - 100 lines)
✅ /components/ExpenseList.tsx (Modified - 3 locations)
✅ /App.tsx (Modified - 3 locations)
```

---

## 📦 COMPONENT STRUCTURE

```
UnifiedTransactionDialog
├─ Dialog (shadcn/ui)
│  └─ DialogContent
│     ├─ DialogHeader
│     │  └─ DialogTitle: "Tambah Transaksi"
│     └─ Tabs
│        ├─ TabsList (Segmented Control)
│        │  ├─ "Pengeluaran" (default)
│        │  └─ "Pemasukan"
│        ├─ TabsContent: expense
│        │  └─ AddExpenseForm (reused)
│        └─ TabsContent: income
│           └─ AdditionalIncomeForm (reused)
```

---

## 🎨 KEY STYLING

```tsx
// Button (desktop only)
className="hidden md:flex items-center gap-1.5"

// Dialog
className="max-w-2xl max-h-[90vh] overflow-y-auto"

// Tabs
className="grid w-full grid-cols-2"
```

---

## 🔌 PROPS QUICK REF

```typescript
<UnifiedTransactionDialog
  open={isTransactionDialogOpen}
  onOpenChange={setIsTransactionDialogOpen}
  
  // Expense
  onAddExpense={handleAddExpense}
  isAddingExpense={isAdding}
  templates={templates}
  onAddTemplate={handleAddTemplate}
  onUpdateTemplate={handleUpdateTemplate}
  onDeleteTemplate={handleDeleteTemplate}
  
  // Income
  onAddIncome={handleAddIncome}
  isAddingIncome={isAddingIncome}
  
  // Shared
  pockets={pockets}
  balances={balances}
  currentExpenses={currentMonthExpenses}
/>
```

---

## 🎯 USER FLOW

```
Desktop User
    ↓
Sees [ + Tambah Transaksi ] button
    ↓
Clicks button
    ↓
Modal opens (default: Pengeluaran)
    ↓
User fills form OR switches to Pemasukan
    ↓
Clicks "Simpan"
    ↓
Modal closes + Toast shows
    ↓
Transaction in list
```

---

## ✅ TESTING CHECKLIST

**Desktop (≥768px):**
- [x] Button visible
- [x] Dialog opens
- [x] Tabs switch
- [x] Forms work
- [x] Data saves

**Mobile (<768px):**
- [x] Button hidden
- [x] FAB still works

---

## 🐛 COMMON ISSUES

**Button not showing?**
→ Check: `hidden md:flex` + viewport ≥768px

**Dialog not opening?**
→ Check: `isTransactionDialogOpen` state + `onOpenChange` prop

**Forms not working?**
→ Check: All handler props passed correctly

**Tab not resetting?**
→ Check: `useEffect` with `open` dependency

---

## 📝 CODE SNIPPETS

### ExpenseList Header (Line ~1880)

```tsx
<div className="flex items-center justify-between">
  <span className="text-base sm:text-lg">Daftar Transaksi</span>
  
  <div className="flex items-center gap-2">
    {onOpenAddTransaction && (
      <Button
        variant="default"
        size="sm"
        onClick={onOpenAddTransaction}
        className="hidden md:flex items-center gap-1.5"
      >
        <Plus className="size-4" />
        Tambah Transaksi
      </Button>
    )}
    
    <DropdownMenu>{/* Category breakdown */}</DropdownMenu>
  </div>
</div>
```

### App.tsx State

```tsx
const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
```

### App.tsx ExpenseList Prop

```tsx
onOpenAddTransaction={() => setIsTransactionDialogOpen(true)}
```

---

## 🎨 VISUAL QUICK REF

**Before:**
```
[Daftar Transaksi]                    [📊]
```

**After:**
```
[Daftar Transaksi] [+ Tambah Transaksi] [📊]
                    ↑ NEW!
```

---

## 📊 STATS

- **Files Created:** 1
- **Files Modified:** 2
- **Lines of Code:** ~150 total
- **Components Reused:** 2 (AddExpenseForm, AdditionalIncomeForm)
- **New Dependencies:** 0 (uses existing)

---

## 🔗 RELATED DOCS

- [PLANNING.md](PLANNING.md) - Full specification
- [VISUAL_MOCKUPS.md](VISUAL_MOCKUPS.md) - UI design
- [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) - Step-by-step

---

## ⚡ QUICK DEBUG

```bash
# Check if button shows
# Desktop viewport ≥768px required

# Check state
console.log('Dialog open:', isTransactionDialogOpen);

# Check props
console.log('Has handler:', !!onOpenAddTransaction);

# Check form submission
console.log('Adding expense:', isAddingExpense);
console.log('Adding income:', isAddingIncome);
```

---

## 🎯 SUCCESS CRITERIA

✅ Button visible on desktop  
✅ Button hidden on mobile  
✅ Dialog opens smoothly  
✅ Tabs switch correctly  
✅ Forms fully functional  
✅ Data saves to DB  
✅ No TypeScript errors  
✅ No console errors

---

**Quick Reference Complete!** ⚡  
**Implementation Time:** ~45-60 minutes 🚀

---

**For Full Details:** See [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)
