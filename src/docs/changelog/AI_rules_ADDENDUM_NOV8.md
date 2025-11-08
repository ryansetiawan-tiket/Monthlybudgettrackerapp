# 🔥 AI Rules Addendum - November 8, 2025

**APPEND TO**: `/docs/changelog/AI_rules.md`

---

## ⚠️🚨 CRITICAL WARNING - READ FIRST! 🚨⚠️

### BACKWARD COMPATIBILITY IS MANDATORY!

**BEFORE changing ANY data schema or format:**

```
██████╗  █████╗  ██████╗██╗  ██╗██╗    ██╗ █████╗ ██████╗ ██████╗ 
██╔══██╗██╔══██╗██╔════╝██║ ██╔╝██║    ██║██╔══██╗██╔══██╗██╔══██╗
██████╔╝███████║██║     █████╔╝ ██║ █╗ ██║███████║██████╔╝██║  ██║
██╔══██╗██╔══██║██║     ██╔═██╗ ██║███╗██║██╔══██║██╔══██╗██║  ██║
██████╔╝██║  ██║╚██████╗██║  ██╗╚███╔███╔╝██║  ██║██║  ██║██████╔╝
╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝ ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ 
```

**JIKA ADA YANG BUTUH BACKWARD COMPATIBILITY, ITU HARUS DI-HANDLE!**  
**JANGAN DIABAIKAN!**

**👉 MANDATORY READING:**
1. [/⚠️_BACKWARD_COMPATIBILITY_WARNING.md](/⚠️_BACKWARD_COMPATIBILITY_WARNING.md) - Root warning
2. [/guidelines/BACKWARD_COMPATIBILITY_RULES.md](/guidelines/BACKWARD_COMPATIBILITY_RULES.md) - Complete rules
3. [/planning/expense-categories/AI_CRITICAL_RULES_BACKWARD_COMPAT.md](/planning/expense-categories/AI_CRITICAL_RULES_BACKWARD_COMPAT.md) - AI checklist

**Real disaster:** November 8, 2025 - 70% of data broke because we forgot backward compatibility!

---

## 📅 Date Handling Rules (CRITICAL)

### Never Use Date Object for Date-Only Values
**PROBLEM**: JavaScript's `new Date("YYYY-MM-DD")` parses strings as UTC midnight, causing timezone shift (±1 day bug).

**❌ NEVER DO THIS**:
```typescript
const date = new Date("2025-11-07");  // UTC midnight
const timestamp = date.toISOString(); // Timezone shift!
```

**✅ ALWAYS DO THIS**:
```typescript
// Keep date as YYYY-MM-DD string
const date = "2025-11-07"; // No conversion

// Or use date-helpers.ts
import { getTodayLocal, formatDateForInput } from '../utils/date-helpers';
const today = getTodayLocal(); // "2025-11-08"
```

### Date Storage Format
- **Input**: `<input type="date">` gives `"YYYY-MM-DD"` string
- **Storage**: Store as `"YYYY-MM-DD"` string (no ISO timestamp for date-only)
- **Display**: Use `"YYYY-MM-DD"` directly or parse manually

**Files Using Dates**:
- `AddExpenseForm.tsx` - Store date string directly
- `AdditionalIncomeForm.tsx` - Store date string directly
- `ExpenseList.tsx` - Extract date with `.split('T')[0]` if has time

**Helper Functions**: `/utils/date-helpers.ts`
- `getTodayLocal()` - Get today in YYYY-MM-DD format
- `formatDateForInput()` - Format for input element
- `parseLocalDate()` - Safe date parsing

---

## 🏷️ Category & State Update Rules (CRITICAL)

### Explicitly Include Critical Fields in Updates
**PROBLEM**: Spread operator doesn't guarantee field inclusion, TypeScript won't catch optional fields.

**❌ BAD**:
```typescript
onEditExpense(id, { 
  ...editingExpense,  // category might be lost
  amount: finalAmount 
});
```

**✅ GOOD**:
```typescript
onEditExpense(id, { 
  ...editingExpense,
  amount: finalAmount,
  date: finalDate,
  category: editingExpense.category  // ← Explicit!
});
```

**Critical Fields That Must Be Explicit**:
- `category` - Expense category
- `date` - Date string
- `pocketId` - Pocket assignment
- `groupId` - Group tracking
- `fromIncome` - Income flag

### Category Changes Event System
**How It Works**:
1. `useCategorySettings()` emits `'categoriesUpdated'` event after save
2. All hooks listen to event and update their state
3. Components re-render automatically with new categories

**Implementation** (`useCategorySettings.ts`):
```typescript
// After save:
window.dispatchEvent(new CustomEvent('categoriesUpdated', { 
  detail: newSettings 
}));

// Listen for updates:
useEffect(() => {
  const handler = (e: CustomEvent) => {
    setSettings(e.detail);
    localStorage.setItem(CACHE_KEY, JSON.stringify(e.detail));
  };
  window.addEventListener('categoriesUpdated', handler);
  return () => window.removeEventListener('categoriesUpdated', handler);
}, []);
```

**DO NOT**:
- ❌ Remove the event system
- ❌ Use Context API instead (event system is lighter)
- ❌ Require manual refresh after category changes

---

## 📱 Mobile Touch & Scroll Rules

### Pointer Events for Touch-Friendly Buttons
**PROBLEM**: Buttons block scroll on mobile when user touches button area while scrolling.

**✅ SOLUTION**:
```tsx
{/* Wrapper has pointer-events-none */}
<div className="pointer-events-none flex items-center gap-1">
  {/* Each button has pointer-events-auto */}
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

**How It Works**:
- Parent `pointer-events-none` allows scroll events to pass through
- Child `pointer-events-auto` makes buttons still clickable

**Apply To**:
- All button groups in scrollable lists
- Mobile expense list action buttons
- Mobile income list action buttons
- Any touch-sensitive button areas

---

## 🔄 Data Migration & Backward Compatibility Rules (CRITICAL)

### Always Handle Legacy Data Formats
**PROBLEM**: Changing data schema without backward compatibility breaks old records.

**EXAMPLE - Category System**:
- **Old format**: Categories as numeric indices (`"0"`, `"1"`, `"2"`)
- **New format**: Categories as string names (`"food"`, `"transport"`, `"savings"`)
- **Bug**: Lookup failed for old numeric values → wrong emoji displayed

**✅ SOLUTION - Add Backward Compatibility Layer**:
```typescript
// Add mapping for old format → new format
const indexToCategoryMap: Record<string, string> = {
  '0': 'food',
  '1': 'transport',
  '2': 'savings',
  // ... etc
};

// Convert before lookup
const categoryName = indexToCategoryMap[category] || category.toLowerCase();
const emoji = categoryMap[categoryName] || '📦';
```

### Data Migration Checklist
**BEFORE changing any data format**, ask:

- [ ] **Does existing data use this field?**
- [ ] **What format is the existing data in?**
- [ ] **Do I need migration OR backward compatibility?**
- [ ] **Have I tested with REAL old data, not just fresh test data?**
- [ ] **What happens if old and new data coexist?**

### Migration Strategy Options

**Option A: Database Migration** (Risky)
```typescript
// Update all old records
UPDATE expenses SET category = 'food' WHERE category = '0';
```
- ❌ Risky - can fail or corrupt data
- ❌ Requires downtime
- ❌ Hard to rollback

**Option B: Backward Compatibility Layer** (Recommended)
```typescript
// Code handles both old and new formats
const normalized = oldFormatMap[value] || value;
```
- ✅ Zero risk - no database changes
- ✅ Zero downtime
- ✅ Handles edge cases automatically
- ✅ Future-proof

**Option C: Hybrid**
- Deploy backward compatibility layer first
- Optionally migrate data later when safe
- Keep compatibility layer for safety

### Testing Requirements

**❌ NOT ENOUGH**:
- Testing with fresh data only
- Testing with perfect test cases
- Assuming TypeScript types enforce database format

**✅ REQUIRED**:
- Test with OLD database records
- Test with MIXED old + new data
- Test with edge cases and malformed data
- Add logging to see ACTUAL runtime values

### Debug Strategy for Data Issues

1. **Add comprehensive logging**:
```typescript
console.log('Input value:', { value, type: typeof value });
console.log('After transform:', normalized);
console.log('Lookup result:', result);
```

2. **Compare working vs failing cases**:
- What values work?
- What values fail?
- What's the pattern/difference?

3. **Check for data format changes**:
- Did we change how we store this data?
- When did we change it?
- Do we have old data in different format?

### Common Pitfalls

**Pitfall #1: Partial Functionality Masks Bug**
```typescript
// This override path SHORT-CIRCUITS:
if (settings?.overrides?.[category]) {
  return settings.overrides[category].emoji;  // Returns early!
}
// Bug in categoryMap lookup is HIDDEN if override exists!
```
**Lesson**: Working cases don't prove code is correct - test ALL paths!

**Pitfall #2: Type Safety ≠ Runtime Safety**
```typescript
export type ExpenseCategory = 'food' | 'transport' | ...;
```
- TypeScript can't enforce database data formats
- Runtime data can have unexpected legacy values
- Always add runtime validation/compatibility

**Pitfall #3: Assuming Data is Clean**
- Database can contain old formats, typos, null values
- Users might have edge case data
- Always have fallbacks and error handling

---

## 📚 Reference

**Bug Fixes**: 
- `/docs/changelog/CRITICAL_BUGS_NOV8_FIX.md`
- `/docs/changelog/BACKWARD_COMPATIBILITY_FIX_NOV8.md` ← NEW!

**Planning**: 
- `/planning/critical-bugs-nov8/PLANNING.md`
- `/planning/expense-categories/BACKWARD_COMPATIBILITY_DISASTER_NOV8.md` ← NEW!
- `/planning/expense-categories/BACKWARD_COMPATIBILITY_QUICK_REF.md` ← NEW!

**Debug Guide**: 
- `/planning/critical-bugs-nov8/QUICK_DEBUG_GUIDE.md`

---

**Added**: November 8, 2025  
**Updated**: November 8, 2025 (Added Backward Compatibility Rules)  
**Impact**: Prevents 6+ critical bugs from recurring
