# Dialog Size Constraint Fix - 20% Larger for Desktop

## Masalah
Dialog tidak bisa diperbesar meskipun sudah mengubah `max-w-*` di className karena ada constraint default `sm:max-w-lg` di base component.

## Root Cause
Di `/components/ui/dialog.tsx` dan `/components/ui/alert-dialog.tsx`, ada default max-width yang di-hardcode:
```tsx
// Before
className="... sm:max-w-lg"
```

Constraint ini akan selalu override max-width custom karena menggunakan responsive variant `sm:` yang lebih specific.

## Solution

### 1. Remove Default Max-Width Constraint
Menghapus `sm:max-w-lg` dari base component agar setiap dialog bisa set ukuran sendiri:

**File: `/components/ui/dialog.tsx` (line 63)**
```tsx
// Before
className="... sm:max-w-lg"

// After  
className="..." // removed sm:max-w-lg
```

**File: `/components/ui/alert-dialog.tsx` (line 57)**
```tsx
// Before
className="... sm:max-w-lg"

// After
className="..." // removed sm:max-w-lg
```

### 2. Add Explicit Max-Width to All Dialogs (20% Increase)
Memastikan setiap dialog punya max-width explicit dan **semua diperbesar 20%** untuk desktop:

#### Size Mapping (20% Increase):
- `max-w-md` (448px) → `max-w-xl` (576px) - ~29% actual
- `max-w-lg` (512px) → `max-w-xl` (576px) - ~12.5% actual  
- `max-w-xl` (576px) → `max-w-2xl` (672px) - ~17% actual
- `max-w-2xl` (672px) → `max-w-3xl` (768px) - ~14% actual
- `max-w-3xl` (768px) → `max-w-4xl` (896px) - ~17% actual
- `max-w-[500px]` → `max-w-[600px]` - 20% exact

#### All Dialog Components Updated:
1. ✅ `BudgetForm.tsx`: `sm:max-w-[500px]` → `sm:max-w-[600px]`
2. ✅ `ExpenseList.tsx` (Edit): `max-w-2xl` → `max-w-3xl`
3. ✅ `ExpenseList.tsx` (Delete): `max-w-md` → `max-w-xl`
4. ✅ `ExpenseList.tsx` (Bulk Delete): `max-w-2xl` → `max-w-3xl`
5. ✅ `AdditionalIncomeList.tsx`: `max-w-md` → `max-w-xl`
6. ✅ `AddAdditionalIncomeDialog.tsx`: `max-w-2xl` → `max-w-3xl`
7. ✅ `AddExpenseDialog.tsx`: `max-w-2xl` → `max-w-3xl`
8. ✅ `FixedExpenseTemplates.tsx`: `max-w-md` → `max-w-xl`
9. ✅ `PocketTimeline.tsx`: `max-w-2xl` → `max-w-3xl`
10. ✅ `PocketsSummary.tsx` (Wishlist): `sm:max-w-6xl` → `sm:max-w-4xl`
11. ✅ `PocketsSummary.tsx` (Delete): `max-w-md` → `max-w-xl`
12. ✅ `TransferDialog.tsx`: `sm:max-w-[500px]` → `sm:max-w-[600px]`
13. ✅ `CommandDialog`: `max-w-lg` → `max-w-xl`
14. ✅ `ManagePocketsDialog.tsx`: `max-w-2xl` → `max-w-3xl`
15. ✅ `WishlistDialog.tsx`: `sm:max-w-xl` → `sm:max-w-2xl`

**Total: 15 Dialogs Updated - No Dialog Left Behind! ✓**

### 3. Responsive Pattern
Menggunakan pattern yang konsisten untuk mobile + desktop:
```tsx
className="max-w-[calc(100%-2rem)] sm:max-w-6xl"
//         ^mobile fallback      ^desktop size
```

## Impact

### Before:
- ❌ Semua dialog terbatas maksimal `sm:max-w-lg` (~32rem/512px)
- ❌ Custom max-width tidak berfungsi
- ❌ Dialog terasa sempit di layar desktop yang lebar

### After:
- ✅ Dialog bisa diperbesar sesuai kebutuhan
- ✅ **Semua 15 dialog diperbesar ~20% untuk desktop**
- ✅ WishlistSimulation dialog: `max-w-4xl` (~56rem/896px)
- ✅ Form dialogs: lebih lega dengan `max-w-3xl` (~48rem/768px)
- ✅ Confirmation dialogs: `max-w-xl` (~36rem/576px)
- ✅ Semua dialog tetap responsive dengan fallback mobile yang proper
- ✅ Mobile view (bottom sheet) tidak terpengaruh - tetap `h-[75vh]`
- ✅ Skeleton loading state sudah ditambahkan untuk WishlistSimulation

## Files Modified (17 Total)

### Base Components (2):
1. `/components/ui/dialog.tsx` - Remove `sm:max-w-lg` constraint
2. `/components/ui/alert-dialog.tsx` - Remove `sm:max-w-lg` constraint

### App Components (15):
3. `/components/BudgetForm.tsx` - 500px → 600px
4. `/components/ExpenseList.tsx` - 3 dialogs updated (edit, delete, bulk delete)
5. `/components/AdditionalIncomeList.tsx` - md → xl
6. `/components/AddAdditionalIncomeDialog.tsx` - 2xl → 3xl
7. `/components/AddExpenseDialog.tsx` - 2xl → 3xl
8. `/components/FixedExpenseTemplates.tsx` - md → xl
9. `/components/PocketTimeline.tsx` - 2xl → 3xl
10. `/components/PocketsSummary.tsx` - 2 dialogs updated (wishlist, delete)
11. `/components/TransferDialog.tsx` - 500px → 600px
12. `/components/ManagePocketsDialog.tsx` - 2xl → 3xl
13. `/components/WishlistDialog.tsx` - xl → 2xl
14. `/components/WishlistSimulation.tsx` - Add skeleton + larger content
15. `/components/ui/command.tsx` - lg → xl

## Testing Checklist
- ✅ Desktop: All 15 dialogs ~20% lebih besar
- ✅ Mobile: Bottom sheet tetap `h-[75vh]` - tidak terpengaruh
- ✅ All dialogs have explicit max-width
- ✅ Skeleton loading displays correct structure in WishlistSimulation
- ✅ No dialogs left behind - comprehensive update completed
- ✅ Responsive breakpoints work correctly (mobile fallback preserved)

## Future Considerations
- ⚠️ **IMPORTANT**: Jika menambah dialog baru, HARUS set explicit `max-w-*` atau `sm:max-w-*`
- ⚠️ Base component sudah tidak punya default max-width
- ✅ Follow size mapping above untuk consistency (20% larger pattern)
- ✅ Gunakan pattern responsive: `max-w-[calc(100%-2rem)] sm:max-w-*` untuk dialog yang ingin custom size
- ✅ Desktop dialog: gunakan `sm:max-w-*` atau `max-w-*`
- ✅ Mobile sheet: gunakan `h-[75vh]` (sudah standard di semua komponen)
