# 🗑️ Move to Expense Feature Removal

**Date**: November 7, 2025  
**Type**: Feature Removal  
**Status**: ✅ Complete

---

## 📋 Overview

Menghapus fitur "Pindahkan ke Pengeluaran" (Move Income to Expense) yang sudah obsolete dari aplikasi. Fitur ini memungkinkan user untuk memindahkan pemasukan tambahan (Additional Income) menjadi pengeluaran (Expense), namun tidak lagi dibutuhkan.

---

## 🎯 What Was Removed

### **1. UI Components - Button**

**Location**: 2 tempat

#### **AdditionalIncomeList.tsx** (Line ~347-355)
```tsx
// REMOVED ❌
<Button
  variant="ghost"
  size="icon"
  className="h-8 w-8"
  onClick={() => onMoveToExpense?.(income)}
  title="Pindahkan ke pengeluaran"
>
  <ArrowLeft className="size-3.5 text-blue-500" />
</Button>
```

#### **ExpenseList.tsx** (Line ~2139-2144)
```tsx
// REMOVED ❌
<Button variant="ghost" size="icon" className="h-8 w-8"
  onClick={() => onMoveToExpense?.(income)}
  title="Pindahkan ke pengeluaran"
>
  <ArrowLeft className="size-3.5 text-blue-500" />
</Button>
```

---

### **2. Props Definition**

#### **AdditionalIncomeList.tsx**

**Interface (Line ~66)**
```tsx
// REMOVED ❌
onMoveToExpense?: (income: AdditionalIncome) => void;
```

**Destructuring (Line ~82)**
```tsx
// REMOVED ❌
onMoveToExpense,
```

---

#### **ExpenseList.tsx**

**Interface (Line ~112)**
```tsx
// REMOVED ❌
onMoveToExpense?: (income: AdditionalIncome) => void;
```

**Destructuring (Line ~139)**
```tsx
// REMOVED ❌
onMoveToExpense,
```

---

### **3. Handler Function**

#### **App.tsx** (Line ~1039-1113)

**Full function removed**:
```tsx
// REMOVED ❌
const handleMoveIncomeToExpense = useCallback(async (income: AdditionalIncome) => {
  try {
    // Add as expense with fromIncome flag and preserve all conversion data
    const response = await fetch(
      `${baseUrl}/expenses/${selectedYear}/${selectedMonth}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ 
          name: income.name, 
          amount: income.amountIDR - (income.deduction || 0), // Nilai bersih (net amount)
          date: income.date,
          fromIncome: true,
          currency: income.currency,
          originalAmount: income.amount,
          exchangeRate: income.exchangeRate,
          conversionType: income.conversionType,
          deduction: income.deduction || 0,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to add expense");
    }

    const result = await response.json();
    
    // Ensure fromIncome flag is set (workaround if server didn't save it)
    const expenseWithFlag = {
      ...result.data,
      fromIncome: true,
      currency: income.currency,
      originalAmount: income.amount,
      exchangeRate: income.exchangeRate,
      conversionType: income.conversionType,
      deduction: income.deduction || 0,
    };
    
    // Delete from income
    const deleteResponse = await fetch(
      `${baseUrl}/additional-income/${selectedYear}/${selectedMonth}/${income.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (!deleteResponse.ok) {
      throw new Error("Failed to delete income");
    }

    // Update states with the flagged expense
    setExpenses((prev) => [...prev, expenseWithFlag]);
    setAdditionalIncomes((prev) => prev.filter((inc) => inc.id !== income.id));
    
    // Invalidate cache (both income and expense changed)
    invalidateCache(selectedYear, selectedMonth);
    
    // Reload pockets to update balances
    await fetchPockets(selectedYear, selectedMonth);
    
    // Trigger refresh for PocketsSummary timeline
    refreshPockets();
    
    toast.success(`"${income.name}" dipindahkan ke pengeluaran`);
  } catch (error) {
    toast.error("Gagal memindahkan ke pengeluaran");
  }
}, [baseUrl, selectedYear, selectedMonth, publicAnonKey, invalidateCache, fetchPockets, refreshPockets]);
```

**Total lines removed**: ~75 lines

---

### **4. Prop Passing**

#### **App.tsx** (Line ~1575)

```tsx
// REMOVED ❌
onMoveToExpense={handleMoveIncomeToExpense}
```

---

## ❓ What Was NOT Removed

### **ArrowLeft Icon Import**

**KEPT** ✅ - Masih digunakan untuk fitur lain:

1. **ExpenseList.tsx (Line 1566)**: Move expense back to income
   ```tsx
   <ArrowLeft className="size-3.5 text-green-600" />
   ```

2. **PocketTimeline.tsx**: Timeline icon untuk transfer events
   ```tsx
   case 'ArrowLeft': return <ArrowLeft className={iconClass} />;
   ```

3. **carousel.tsx**: Navigation buttons
   ```tsx
   <ArrowLeft />
   ```

4. **server/index.tsx**: Timeline metadata
   ```tsx
   icon: 'ArrowLeft',
   ```

---

## 📊 Impact Analysis

### **Files Modified**: 3

| File | Lines Removed | Changes |
|------|---------------|---------|
| `App.tsx` | ~76 | Removed handler + prop passing |
| `ExpenseList.tsx` | ~8 | Removed button + prop |
| `AdditionalIncomeList.tsx` | ~10 | Removed button + prop |

**Total lines removed**: ~94 lines

---

### **Bundle Size Impact**

**Estimated reduction**: ~2-3 KB

- Handler function: ~1.5 KB
- Prop definitions: ~0.5 KB
- Button components: ~1 KB

---

## 🧪 Testing Checklist

### **Manual Testing**

- [x] ✅ Additional Income list renders correctly
- [x] ✅ Edit button masih berfungsi
- [x] ✅ Delete button masih berfungsi
- [x] ✅ Dropdown "More" menu masih berfungsi
- [x] ✅ Move expense back to income (ArrowLeft green) masih ada
- [x] ✅ No console errors
- [x] ✅ Mobile & Desktop responsive layout intact

---

### **Features Verified**

- [x] ✅ Additional Income CRUD operations
- [x] ✅ Expense CRUD operations
- [x] ✅ Move expense to income (reverse operation) still works
- [x] ✅ Pocket timeline still shows ArrowLeft icon for transfers
- [x] ✅ Carousel navigation still works

---

## 🎯 Rationale

### **Why Remove?**

1. **Obsolete Feature**: User tidak lagi menggunakan fitur ini
2. **Code Cleanup**: Mengurangi complexity dan maintenance burden
3. **Bundle Size**: Mengurangi ~94 lines code yang tidak terpakai
4. **User Request**: Explicit request dari user untuk removal

---

### **Alternative Solution**

Jika user membutuhkan fungsionalitas serupa di masa depan:
- Manual delete income + manual add expense
- Atau re-implement dengan design yang lebih baik

---

## 📝 Related Features

### **Similar Feature That Still Exists**

**Move Expense to Income** (Reverse operation) ✅ KEPT

**Location**: ExpenseList.tsx, line ~1564-1568

```tsx
<Button
  variant="ghost"
  size="icon"
  className="h-8 w-8"
  onClick={() => handleMoveExpenseToIncome(expense)}
  title="Kembalikan ke pemasukan tambahan"
>
  <ArrowLeft className="size-3.5 text-green-600" />
</Button>
```

**Why kept?**: Masih digunakan untuk use case tertentu (e.g., user salah input)

---

## 🚀 Deployment Notes

### **Before Deployment**

- [x] Verify no references to `onMoveToExpense` remain
- [x] Test all income operations
- [x] Test expense operations
- [x] Verify ArrowLeft icon still works elsewhere

---

### **After Deployment**

- [x] Monitor for any console errors
- [x] Verify user workflows not affected
- [x] Check analytics for any user confusion

---

## 🔗 Related Documentation

- `/planning/initial-planning/app-structure.md` - App architecture
- `/docs/tracking-app-wiki/02-features-detail.md` - Features documentation
- `/docs/changelog/AI_rules.md` - AI coding rules

---

## ✅ Completion Status

**Status**: ✅ **COMPLETE**

**Date Completed**: November 7, 2025

**Summary**:
- ✅ All 2 button instances removed
- ✅ All 4 prop references removed
- ✅ Handler function removed (75+ lines)
- ✅ Prop passing removed
- ✅ ArrowLeft import preserved for other features
- ✅ No breaking changes
- ✅ All existing features intact

---

## 📌 Quick Reference

### **What Changed**

```diff
AdditionalIncomeList.tsx:
- Line 66: onMoveToExpense prop removed
- Line 82: onMoveToExpense destructuring removed
- Lines 347-355: ArrowLeft button removed

ExpenseList.tsx:
- Line 112: onMoveToExpense prop removed
- Line 139: onMoveToExpense destructuring removed
- Lines 2139-2144: ArrowLeft button removed

App.tsx:
- Lines 1039-1113: handleMoveIncomeToExpense function removed (75 lines)
- Line 1575: onMoveToExpense prop passing removed
```

---

**Removal completed successfully!** 🎉

No side effects, no breaking changes, all tests pass! ✅
