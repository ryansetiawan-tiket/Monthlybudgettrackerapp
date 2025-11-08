# 🔧 Quick Debug Guide - Date & Category Issues

## 🕐 Date Issues Troubleshooting

### Symptom: Date off by ±1 day

**Quick Check**:
```typescript
// ❌ BAD - Will cause timezone shift
const date = new Date("2025-11-07");
const timestamp = date.toISOString();

// ✅ GOOD - Keep as string
const date = "2025-11-07"; // Use directly
```

**Fix Locations**:
- `AddExpenseForm.tsx` → Use `date` string directly
- `AdditionalIncomeForm.tsx` → Use `date` string directly
- `ExpenseList.tsx` → Use `date.split('T')[0]` to extract date part
- **NEVER** convert YYYY-MM-DD to Date object then back to ISO

**Helper Functions** (`/utils/date-helpers.ts`):
```typescript
import { parseLocalDate, formatDateForInput, getTodayLocal } from '../utils/date-helpers';

// Get today: "2025-11-08"
const today = getTodayLocal();

// Format for input: "2025-11-08"
const inputValue = formatDateForInput(isoTimestamp);

// Parse safely: "2025-11-08"
const safeDate = parseLocalDate(inputString);
```

---

## 🏷️ Category Not Updating

### Symptom: Edit kategori tidak tersimpan

**Quick Check** (`ExpenseList.tsx` line ~814):
```typescript
// ✅ MUST explicitly include category
onEditExpense(editingExpenseId, { 
  ...editingExpense, 
  amount: finalAmount,
  date: finalDate,
  category: editingExpense.category // ← This is critical!
});
```

**Common Mistake**:
```typescript
// ❌ BAD - category might not be in spread
onEditExpense(editingExpenseId, { ...editingExpense, amount: finalAmount });
```

---

## 🔄 Category Changes Not Reflecting

### Symptom: Edit custom category tapi dropdown tidak update

**Quick Check**:
1. Verify event emission (`useCategorySettings.ts` line ~107):
```typescript
window.dispatchEvent(new CustomEvent('categoriesUpdated', { 
  detail: newSettings 
}));
```

2. Verify event listener (`useCategorySettings.ts` line ~327):
```typescript
window.addEventListener('categoriesUpdated', handleCategoriesUpdated);
```

3. Check browser console for event logs:
```
[useCategorySettings] Categories updated event received
```

**Force Refresh (if needed)**:
```typescript
const { loadSettings } = useCategorySettings();
await loadSettings(); // Force reload from server
```

---

## 📱 Mobile Scroll Blocked by Buttons

### Symptom: Tidak bisa scroll ketika jari di area button

**Quick Fix**:
```tsx
{/* Wrap button area */}
<div className="pointer-events-none flex items-center gap-1">
  {/* Each button needs pointer-events-auto */}
  <Button className="h-7 w-7 pointer-events-auto">
    <Icon />
  </Button>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button className="h-7 w-7 pointer-events-auto">
        <MoreVertical />
      </Button>
    </DropdownMenuTrigger>
  </DropdownMenu>
</div>
```

**Explanation**:
- Parent `pointer-events-none` → allows scroll events to pass through
- Child `pointer-events-auto` → buttons still clickable
- Best of both worlds! 🎉

---

## 🧊 UI Freeze After Edit

### Symptom: Tidak bisa klik setelah edit expense

**Quick Check**:
1. Verify dialog closes: `setEditingExpenseId(null)`
2. Verify drawer closes: `setIsOpen(false)` or `onOpenChange(false)`
3. Check for infinite re-render loops (console will flood with logs)

**Common Cause**: State dependency causing re-render loop

**Fix**: Normalize data before saving
```typescript
// Extract date part to prevent re-render when comparing dates
const finalDate = editingExpense.date?.split('T')[0] || editingExpense.date;
```

---

## 🚨 Emergency Rollback

If bugs persist, revert these files:
```bash
git checkout HEAD~1 -- components/AddExpenseForm.tsx
git checkout HEAD~1 -- components/ExpenseList.tsx
git checkout HEAD~1 -- components/AdditionalIncomeForm.tsx
git checkout HEAD~1 -- hooks/useCategorySettings.ts
rm utils/date-helpers.ts
```

---

## 📞 Debug Commands

### Check localStorage
```javascript
// Category settings
JSON.parse(localStorage.getItem('category_settings_cache'))

// Check if events are working
window.addEventListener('categoriesUpdated', (e) => {
  console.log('Category update:', e.detail);
});
```

### Force Category Reload
```javascript
// In browser console
window.dispatchEvent(new CustomEvent('categoriesUpdated', { 
  detail: JSON.parse(localStorage.getItem('category_settings_cache'))
}));
```

### Test Date Parsing
```javascript
// In browser console
const testDate = "2025-11-07";
console.log('Input:', testDate);
console.log('Bad way:', new Date(testDate).toISOString());
console.log('Good way:', testDate);
```

---

## 🎯 Quick Wins

**Date Issues**: Use string format, never convert to Date object  
**Category Not Saving**: Always explicitly include `category` field in updates  
**Category Not Reflecting**: Event system should auto-update, check console logs  
**Scroll Blocked**: `pointer-events-none` on wrapper, `pointer-events-auto` on buttons  
**UI Freeze**: Ensure dialogs close with `setIsOpen(false)` or `setEditingId(null)`

---

Last Updated: November 8, 2025
