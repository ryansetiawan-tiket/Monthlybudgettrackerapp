# 🚨 CRITICAL BUGS FIX - Nov 8, 2025

## 🎯 Issues List

### 1. **TIMEZONE HELL** 🕐 [CRITICAL]
- ✅ Tambah entry tanggal 7 → masuk tanggal 6
- ✅ Edit tanggal 6 ke 7 → masuk tanggal 8
- ✅ Hari ini tanggal 8, tapi data masuk salah

**Root Cause**: Date input type="date" menggunakan UTC, tapi backend/frontend pakai local timezone. Off by 1 day karena timezone offset.

**Solution**: 
```typescript
// ❌ WRONG (current)
const date = new Date(inputValue); // "2025-11-07" → UTC midnight → local timezone shift

// ✅ CORRECT
const [year, month, day] = inputValue.split('-');
const date = new Date(Number(year), Number(month) - 1, Number(day)); // Local timezone
const dateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
```

**Files to Fix**:
- `/components/AddExpenseDialog.tsx` - handleSubmit
- `/components/ExpenseList.tsx` - handleEditExpense, handleUpdateExpense
- `/components/AddAdditionalIncomeDialog.tsx` - handleAddIncome
- `/components/AdditionalIncomeList.tsx` - handleUpdateIncome

---

### 2. **CATEGORY NOT UPDATING** 🏷️ [CRITICAL]
Edit kategori di entry tidak tersimpan/berubah.

**Root Cause**: 
- Edit expense form tidak pass category ke update function
- Atau backend tidak update category field

**Files to Check**:
- `/components/ExpenseList.tsx` line ~829 - `editingExpense` state include category?
- `handleUpdateExpense` - apakah category di-pass ke onEditExpense?

---

### 3. **UI FREEZE AFTER UPDATE** 🧊 [CRITICAL]
Setelah update entry, tidak bisa klik dimanapun.

**Root Cause**: 
- Dialog/Drawer tidak close setelah update
- atau ada blocking overlay

**Solution**: Add explicit close after successful update:
```typescript
await onEditExpense(id, data);
setEditingExpenseId(null); // ← THIS
toast.success('Updated');
```

---

### 4. **SCROLL BLOCKED BY 3 DOTS** 📱 [UX]
Di mobile, scroll tapi jari di area 3 dots → malah klik 3 dots.

**Solution**: Add `pointer-events-none` ke wrapper, `pointer-events-auto` ke button:
```tsx
<div className="... pointer-events-none">
  <button className="... pointer-events-auto">...</button>
</div>
```

**Files**: 
- `/components/ExpenseList.tsx` - 3 dots button
- `/components/PocketTimeline.tsx` - 3 dots button

---

### 5. **CATEGORY CHANGES NO REFLECT** 🔄 [STATE]
Edit/tambah kategori tidak langsung reflect, harus refresh.

**Root Cause**: Category settings di localStorage, tapi components baca stale state.

**Solution**: 
- Add custom event listener untuk category changes
- Atau use Context API untuk global category state
- Trigger re-render saat category updated

**Files**:
- `/utils/categoryManager.ts` - emit event setelah save
- `/hooks/useCategorySettings.ts` - listen to event
- All components using categories - re-fetch saat event fired

---

## 📋 Execution Order

**PRIORITY 1 - TIMEZONE FIX** (affects all date operations):
1. Create `/utils/date-helpers.ts` with safe date parsing
2. Fix AddExpenseDialog
3. Fix ExpenseList edit
4. Fix AddAdditionalIncomeDialog
5. Fix AdditionalIncomeList edit

**PRIORITY 2 - CATEGORY + UI FREEZE**:
6. Fix category not updating in edit
7. Fix UI freeze by closing dialogs properly

**PRIORITY 3 - UX IMPROVEMENTS**:
8. Fix scroll blocked by 3 dots
9. Fix category changes not reflecting (add event system)

---

## 🧪 Testing Checklist

- [ ] Add expense tanggal 7 → masuk tanggal 7 (bukan 6)
- [ ] Edit expense tanggal 6 ke 7 → jadi tanggal 7 (bukan 8)
- [ ] Add income tanggal 7 → masuk tanggal 7
- [ ] Edit income tanggal 6 ke 7 → jadi tanggal 7
- [ ] Edit kategori expense → kategori berubah
- [ ] Setelah edit expense → bisa klik UI lain
- [ ] Scroll di mobile saat jari di 3 dots → tetap bisa scroll
- [ ] Edit custom category → langsung reflect di semua dropdown
- [ ] Add new category → langsung muncul di semua tempat

---

## 🛠️ Implementation Notes

### Date Helper Function
```typescript
// /utils/date-helpers.ts
export function parseLocalDate(dateString: string): string {
  // Input: "2025-11-07" from <input type="date">
  // Output: "2025-11-07" in YYYY-MM-DD format (no timezone conversion)
  const [year, month, day] = dateString.split('-').map(Number);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function formatDateForInput(dateString: string): string {
  // Input: "2025-11-07T12:34:56" or "2025-11-07"
  // Output: "2025-11-07" for <input type="date">
  return dateString.split('T')[0];
}
```

### Category Event System
```typescript
// /utils/categoryManager.ts
export function saveCategories(categories: any[]) {
  localStorage.setItem('categories', JSON.stringify(categories));
  window.dispatchEvent(new CustomEvent('categoriesUpdated', { detail: categories }));
}

// /hooks/useCategorySettings.ts
useEffect(() => {
  const handler = (e: CustomEvent) => {
    setSettings(prev => ({ ...prev, categories: e.detail }));
  };
  window.addEventListener('categoriesUpdated', handler);
  return () => window.removeEventListener('categoriesUpdated', handler);
}, []);
```
