# Fix: GroupId Hilang Saat Update Expense

**Tanggal:** 6 November 2025  
**Status:** ✅ Fixed  
**Priority:** 🔴 CRITICAL

## Masalah

Ketika user mengedit salah satu expense dalam grup, expense tersebut **terpisah dari grup** setelah di-update.

### Root Cause

**Frontend (ExpenseList.tsx):**
```typescript
// ❌ BEFORE: groupId tidak di-copy saat edit
setEditingExpense({ 
  name: expense.name, 
  amount: expense.amount, 
  // ... other fields
  pocketId: expense.pocketId
  // ❌ Missing: groupId
});
```

**Backend (index.tsx):**
```typescript
// ❌ BEFORE: groupId tidak di-destructure dan tidak di-save
const { name, amount, date, ..., pocketId } = body;
// ❌ Missing: groupId

const expenseData = {
  // ... all fields
  // ❌ Missing: groupId preservation
};
```

## Solusi

### 1. Frontend Fix - Preserve groupId Saat Edit

**File:** `/components/ExpenseList.tsx`

#### A. Initial State
```typescript
// ✅ AFTER: Include groupId in initial state
const [editingExpense, setEditingExpense] = useState<Omit<Expense, 'id'>>({ 
  name: '', 
  amount: 0, 
  // ...
  pocketId: undefined,
  groupId: undefined  // ✅ Added
});
```

#### B. Load Expense untuk Edit
```typescript
// ✅ AFTER: Copy groupId from expense
setEditingExpense({ 
  name: expense.name, 
  amount: expense.amount, 
  // ...
  pocketId: expense.pocketId,
  groupId: expense.groupId  // ✅ Added - Preserve groupId
});
```

#### C. Reset State Setelah Save/Close
```typescript
// ✅ AFTER: Include groupId in reset
setEditingExpense({ 
  name: '', 
  amount: 0, 
  // ...
  pocketId: undefined,
  groupId: undefined  // ✅ Added
});
```

**Changes Made:**
- Line 65-78: Initial state + `groupId: undefined`
- Line 491-504: Load expense + `groupId: expense.groupId`
- Line 524-539: Reset after save + `groupId: undefined`
- Line 543-561: Reset on close + `groupId: undefined`

### 2. Backend Fix - Preserve groupId Saat Update

**File:** `/supabase/functions/server/index.tsx`

#### A. Destructure groupId dari Request Body
```typescript
// ✅ AFTER: Include groupId in destructuring
const { name, amount, date, ..., pocketId, groupId } = body;
```

#### B. Preserve groupId di Updated Data
```typescript
// ✅ AFTER: Preserve groupId (from body or existing)
const expenseData = {
  id,
  name,
  // ... all fields
  ...(groupId !== undefined 
    ? { groupId } 
    : existingExpense?.groupId 
      ? { groupId: existingExpense.groupId } 
      : {}
  ),
  createdAt: existingExpense?.createdAt || new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
```

**Logic:**
1. If `groupId` provided in body → use it
2. Else if existing expense has `groupId` → preserve it
3. Else → no groupId (backward compatible)

**Changes Made:**
- Line 1202: Destructure `groupId` from body
- Line 1208: Update comment
- Line 1249 (new): Preserve groupId logic

## Testing

### Scenario 1: Edit Expense dalam Grup
```
GIVEN: 2 expenses grouped together (same groupId)
WHEN: User edits one of them (change name/amount)
THEN: ✅ Expense remains in the group after update
```

### Scenario 2: Edit Single Expense
```
GIVEN: Single expense (no groupId)
WHEN: User edits it
THEN: ✅ No groupId added (backward compatible)
```

### Scenario 3: Edit Expense dan Pindah Pocket
```
GIVEN: Expense in group with pocketId A
WHEN: User edits and changes to pocketId B
THEN: ✅ PocketId updated, groupId preserved
```

## Files Modified

1. **Frontend:**
   - `/components/ExpenseList.tsx`
     - Initial state (line 65-78)
     - handleEditExpense (line 491-504)
     - handleSaveEditExpense reset (line 524-539)
     - handleCloseEditDialog reset (line 543-561)

2. **Backend:**
   - `/supabase/functions/server/index.tsx`
     - Update expense endpoint (line 1202, 1249)

## Impact

✅ **Resolved:**
- Expenses stay grouped after edit
- Group integrity maintained
- Backward compatible (expenses without groupId unaffected)

⚡ **Performance:**
- No impact (minimal change)

🎯 **UX:**
- Expected behavior: editing doesn't break grouping
- Consistent experience across all operations

## Related Issues

- Initial grouping implementation: `EXPENSE_GROUPING_FIX.md`
- Race condition fix: `EXPENSE_GROUPING_RACE_CONDITION_FIX.md`
- This fix: **Preserve groupId during update**

## Verification Checklist

- [x] Edit expense dalam grup → masih grouped
- [x] Edit expense tanpa grup → tetap tidak grouped
- [x] Edit multiple fields → groupId preserved
- [x] Edit pocket → groupId preserved
- [x] Edit items → groupId preserved
- [x] Backend receives groupId
- [x] Backend saves groupId
- [x] Frontend displays correctly after update
- [x] No console errors

## Conclusion

✅ **FIXED:** GroupId sekarang dipertahankan saat update expense, baik di frontend maupun backend.

🎯 **Result:** Expenses tetap dalam grup setelah di-edit, memberikan pengalaman yang konsisten dan sesuai ekspektasi user.
