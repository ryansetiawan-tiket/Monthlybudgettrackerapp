# Troubleshooting & Problem Resolution

## Masalah yang Pernah Dihadapi & Solusinya

---

## 1. Exchange Rate API Integration

### Problem 1.1: API Call Failures
**Deskripsi:**
- Exchange rate API kadang gagal atau slow
- User tidak bisa convert USD ke IDR
- App menjadi unusable untuk input pemasukan USD

**Root Cause:**
- Network issues
- API rate limit
- API downtime

**Solution:**
✅ **Implemented:**
1. **Server-side caching** (1 hour)
   - Reduce API calls
   - Faster response
   - Less prone to rate limits

2. **Fallback to manual input**
   ```typescript
   try {
     const rate = await fetchExchangeRate();
     setExchangeRate(rate);
   } catch (error) {
     setShowManualRate(true);
     toast.error('Gagal fetch rate, gunakan input manual');
   }
   ```

3. **Error handling & user feedback**
   - Toast notification saat gagal
   - Show manual input field
   - Clear instructions

**Lesson Learned:**
- Always have fallback for external dependencies
- Cache aggressively when data doesn't change frequently
- Inform user about errors clearly

---

### Problem 1.2: Cache Invalidation
**Deskripsi:**
- Rate ter-cache terlalu lama
- User dapat rate yang outdated

**Root Cause:**
- Cache duration terlalu panjang

**Solution:**
✅ **Balanced approach:**
```typescript
const CACHE_DURATION = 3600000; // 1 hour

// Check cache validity
if (cachedRate && (now - cachedRate.timestamp) < CACHE_DURATION) {
  return cachedRate;
}

// Fetch fresh rate
```

**Why 1 hour?**
- Exchange rates tidak berubah drastis dalam 1 jam
- Balance antara freshness dan performance
- Mengurangi API calls secara signifikan

---

## 2. Auto Carryover Implementation

### Problem 2.1: Infinite Loop
**Deskripsi:**
- useEffect untuk auto-carryover trigger infinite re-render
- App freeze atau crash
- Browser becomes unresponsive

**Root Cause:**
```typescript
// ❌ WRONG - causes infinite loop
useEffect(() => {
  fetchPreviousMonthResult();
}, [fetchPreviousMonthResult]); // Function re-created on every render
```

**Solution:**
✅ **Correct dependencies:**
```typescript
// ✅ CORRECT
useEffect(() => {
  if (autoCarryover) {
    fetchPreviousMonthResult();
  }
}, [autoCarryover, selectedMonth]);
// Only trigger when these values actually change
```

**Lesson Learned:**
- Be careful with useEffect dependencies
- Use ESLint exhaustive-deps rule
- Test re-render behavior thoroughly

---

### Problem 2.2: Stale Previous Month Data
**Deskripsi:**
- Auto carryover tidak update saat previous month expenses berubah
- User edit previous month, current month carryover tetap lama

**Root Cause:**
- No realtime sync between months

**Solution:**
✅ **Add trigger dependencies:**
```typescript
useEffect(() => {
  if (autoCarryover) {
    fetchPreviousMonthResult();
  }
}, [autoCarryover, selectedMonth, expenses, additionalIncomes]);
// Re-fetch when current data changes (implies prev month might have changed)
```

**Alternative Solution (Future):**
- Implement WebSocket for realtime sync
- Use React Query with cache invalidation
- Add "Refresh Carryover" button

---

## 3. Autocomplete Implementation

### Problem 3.1: Performance with Large Dataset
**Deskripsi:**
- App laggy saat ada banyak expenses
- Autocomplete suggestions slow to appear
- Typing feels sluggish

**Root Cause:**
- Filtering suggestions on every keystroke
- No memoization
- O(n) complexity on large arrays

**Solution:**
✅ **Memoization:**
```typescript
// Memoize all names extraction
const allNames = useMemo(() => {
  const namesSet = new Set<string>();
  expenses.forEach(expense => {
    namesSet.add(expense.name);
    expense.items?.forEach(item => namesSet.add(item.name));
  });
  return Array.from(namesSet).sort();
}, [expenses]);

// Memoize filtered suggestions
const suggestions = useMemo(() => {
  if (!searchQuery.trim()) return [];
  return allNames
    .filter(name => name.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 10); // Limit results
}, [allNames, searchQuery]);
```

**Performance Improvement:**
- Before: Re-compute on every render
- After: Only re-compute when dependencies change
- Result: Smooth typing experience

---

### Problem 3.2: Keyboard Navigation Issues
**Deskripsi:**
- Arrow keys scroll page instead of navigating suggestions
- Enter submits form instead of selecting suggestion

**Root Cause:**
- Default browser behavior not prevented

**Solution:**
✅ **Prevent default:**
```typescript
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (!showSuggestions || suggestions.length === 0) return;

  switch (e.key) {
    case 'ArrowDown':
    case 'ArrowUp':
    case 'Enter':
      e.preventDefault(); // ⭐ Prevent default behavior
      // Handle navigation
      break;
  }
};
```

**Lesson Learned:**
- Always handle keyboard events explicitly
- Test keyboard interactions thoroughly
- Provide visual feedback for selected item

---

### Problem 3.3: Click Outside Not Working
**Deskripsi:**
- Suggestions dropdown tidak close saat click outside
- Overlaps with other UI elements

**Root Cause:**
- Missing event listener for outside clicks

**Solution:**
✅ **Click outside detection:**
```typescript
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      searchInputRef.current && 
      !searchInputRef.current.contains(event.target as Node) &&
      suggestionsRef.current &&
      !suggestionsRef.current.contains(event.target as Node)
    ) {
      setShowSuggestions(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);
```

---

## 4. Dark Mode Issues

### Problem 4.1: Inconsistent Dark Mode Colors
**Deskripsi:**
- Some components look good in dark mode
- Others have poor contrast or wrong colors

**Root Cause:**
- Not all components use `dark:` classes
- Hardcoded colors instead of theme-aware classes

**Solution:**
✅ **Systematic approach:**
```typescript
// ❌ WRONG
<div className="bg-white text-black">

// ✅ CORRECT
<div className="bg-background text-foreground">
// Or explicit dark mode
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
```

**Testing:**
- Test every component in both modes
- Use semantic color tokens from globals.css
- Check contrast ratios

---

## 5. Template Management Issues

### Problem 5.1: Template Color Not Persisting
**Deskripsi:**
- User picks color untuk template
- Save berhasil
- Reload → color kembali ke default

**Root Cause:**
- Color tidak included dalam save payload

**Solution:**
✅ **Include color in data structure:**
```typescript
interface FixedExpenseTemplate {
  id: string;
  name: string;
  items: ExpenseItem[];
  color: string; // ⭐ Added this field
}

// Ensure it's saved
const handleSaveTemplates = async (templates: FixedExpenseTemplate[]) => {
  await fetch(`${SERVER_URL}/templates`, {
    method: 'POST',
    body: JSON.stringify({ templates }) // Color included here
  });
};
```

---

### Problem 5.2: Template Items Total Mismatch
**Deskripsi:**
- User creates template dengan 3 items
- Total expense amount tidak match sum of items

**Root Cause:**
- Manual amount input conflicts dengan items total

**Solution:**
✅ **Auto-calculate from items:**
```typescript
const handleSubmit = () => {
  const totalAmount = items.length > 0
    ? items.reduce((sum, item) => sum + item.amount, 0)
    : amount;
  
  onAddExpense({
    name,
    amount: totalAmount, // ⭐ Always calculated
    items: items.length > 0 ? items : undefined
  });
};
```

**UI Change:**
- Hide manual amount input when items exist
- Show total as read-only
- User can only edit items

---

## 6. Expense List UI/UX

### Problem 6.1: Confusing Date Display
**Deskripsi:**
- User tidak tahu which entries are today vs future vs past
- Hard to identify important expenses

**Root Cause:**
- All entries look the same
- No visual distinction

**Solution:**
✅ **Multi-layered visual indicators:**
1. **Blue pulsing dot** untuk hari ini
2. **Blue ring border** around today's entries
3. **Green text** untuk weekend
4. **Template colors** untuk categorization
5. **Upcoming/History sections** untuk temporal grouping

```typescript
<div className={`
  border rounded-lg 
  ${isToday(expense.date) ? 'ring-2 ring-blue-500' : ''}
`}>
  {isToday(expense.date) && (
    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
  )}
  <span className={isWeekend(expense.date) ? "text-green-600" : ""}>
    {formatDateShort(expense.date)}
  </span>
</div>
```

---

### Problem 6.2: Too Many Expenses, Hard to Navigate
**Deskripsi:**
- Long list of expenses (30+ items)
- Hard to scroll and find specific entry
- Upcoming expenses buried with old ones

**Root Cause:**
- Single flat list
- No organization

**Solution:**
✅ **Upcoming vs History Split:**
```typescript
// Split expenses
const upcomingExpenses = expenses.filter(exp => !isPast(exp.date));
const historyExpenses = expenses.filter(exp => isPast(exp.date));

// Render in collapsible sections
<Collapsible open={upcomingExpanded}>
  <CollapsibleTrigger>
    Hari Ini & Mendatang ({upcomingExpenses.length})
  </CollapsibleTrigger>
  <CollapsibleContent>
    {upcomingExpenses.map(renderExpenseItem)}
  </CollapsibleContent>
</Collapsible>

<Collapsible open={historyExpanded}>
  <CollapsibleTrigger>
    Riwayat ({historyExpenses.length})
  </CollapsibleTrigger>
  <CollapsibleContent>
    {historyExpenses.map(renderExpenseItem)}
  </CollapsibleContent>
</Collapsible>
```

**Benefits:**
- Focus on relevant (upcoming) expenses
- History accessible but not distracting
- Clearer mental model
- Better for mobile

---

### Problem 6.3: Search Not Finding Expected Results
**Deskripsi:**
- User search "Senin" (Monday)
- No results shown, but ada expenses on Monday

**Root Cause:**
- Search only checked expense names
- Didn't check dates or day names

**Solution:**
✅ **Fuzzy search multiple fields:**
```typescript
const fuzzyMatch = (expense: Expense, query: string): boolean => {
  const lowerQuery = query.toLowerCase();
  
  // Search in: name, items, day name, date number
  return (
    expense.name.toLowerCase().includes(lowerQuery) ||
    expense.items?.some(item => item.name.toLowerCase().includes(lowerQuery)) ||
    getDayName(expense.date).toLowerCase().includes(lowerQuery) ||
    getDateNumber(expense.date).includes(lowerQuery)
  );
};
```

**User Feedback:**
- Much more flexible search
- Can find by any relevant field
- Matches user mental model

---

## 7. Data Persistence Issues

### Problem 7.1: Data Lost on Refresh
**Deskripsi:**
- User input data
- Refresh page
- Data hilang

**Root Cause:**
- No auto-save implementation
- Data only in React state

**Solution:**
✅ **Debounced auto-save:**
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    saveBudgetData();
  }, 1000);
  
  return () => clearTimeout(timer);
}, [budget, carryover, expenses, additionalIncomes, notes]);
```

**Why debounce?**
- Prevent save on every keystroke
- Batch multiple changes
- Reduce server load
- Better performance

---

### Problem 7.2: Save Conflicts
**Deskripsi:**
- User opens app in 2 tabs
- Edit in both tabs
- Data conflicts

**Root Cause:**
- No conflict resolution
- Last write wins

**Solution (Current):**
⚠️ **Accepted limitation:**
- Document behavior in user guide
- Recommend using single tab

**Future Enhancement:**
- Implement optimistic locking
- Detect conflicts and ask user
- Use operational transforms
- Add last-modified timestamp

---

## 8. Month Navigation Issues

### Problem 8.1: Data Not Loading After Month Change
**Deskripsi:**
- User navigate to different month
- Data still shows previous month

**Root Cause:**
- useEffect not triggering loadBudgetData

**Solution:**
✅ **Proper dependency:**
```typescript
useEffect(() => {
  loadBudgetData(selectedMonth);
}, [selectedMonth]); // ⭐ Trigger on month change
```

---

### Problem 8.2: Slow Month Switching
**Deskripsi:**
- Click next month
- Delay before new data shows
- Poor UX

**Root Cause:**
- No loading state
- Network request blocking UI

**Solution:**
✅ **Loading states:**
```typescript
const [isLoading, setIsLoading] = useState(false);

const loadBudgetData = async (month: Date) => {
  setIsLoading(true);
  try {
    const data = await fetch(...);
    // Update state
  } finally {
    setIsLoading(false);
  }
};

// In UI
{isLoading ? <Skeleton /> : <ExpenseList />}
```

---

## 9. Mobile Responsiveness

### Problem 9.1: Floating Button Overlaps Content
**Deskripsi:**
- FAB covers last expense item on mobile
- Can't click on item

**Root Cause:**
- Fixed position without content padding

**Solution:**
✅ **Add bottom padding:**
```tsx
<div className="pb-24 md:pb-8">
  {/* Content */}
</div>

<Button className="fixed bottom-4 right-4">
  {/* FAB */}
</Button>
```

---

### Problem 9.2: Dialog Too Large on Mobile
**Deskripsi:**
- Dialog exceeds viewport height
- Can't scroll to see all content

**Root Cause:**
- No max-height or scroll

**Solution:**
✅ **Scrollable dialog:**
```tsx
<DialogContent className="max-h-[90vh] overflow-y-auto">
  {/* Content */}
</DialogContent>
```

---

## Common Development Issues

### Issue: TypeScript Errors
**Problem:** Type mismatches
**Solution:**
```typescript
// Define interfaces clearly
interface Expense {
  id: string;
  name: string;
  amount: number;
  date: string;
  items?: ExpenseItem[];
  color?: string;
}

// Use optional chaining
expense.items?.map(...)
```

---

### Issue: Build Errors
**Problem:** Import errors
**Solution:**
```typescript
// Use correct import paths
import { Button } from "./components/ui/button"; // ✅
import { Button } from "@/components/ui/button"; // ❌ Wrong alias
```

---

### Issue: Styling Not Applied
**Problem:** Tailwind classes not working
**Solution:**
- Check globals.css imported in App.tsx
- Verify class names (no typos)
- Check for conflicting styles
- Use dev tools to inspect

---

## Debugging Checklist

When something doesn't work:

1. ✅ Check browser console for errors
2. ✅ Check network tab for failed requests
3. ✅ Verify state values in React DevTools
4. ✅ Check server logs in Supabase
5. ✅ Verify API keys are set correctly
6. ✅ Test in incognito (clear cache issues)
7. ✅ Check database values directly
8. ✅ Verify useEffect dependencies
9. ✅ Check for TypeScript errors
10. ✅ Test in different browsers

---

## Prevention Strategies

### 1. Error Boundaries
**Future:** Wrap components in error boundaries
```typescript
<ErrorBoundary fallback={<ErrorScreen />}>
  <App />
</ErrorBoundary>
```

### 2. Input Validation
**Future:** Validate all user inputs
```typescript
const validateBudget = (value: number) => {
  if (value < 0) throw new Error('Budget must be positive');
  if (value > 1000000000) throw new Error('Budget too large');
  return true;
};
```

### 3. Unit Tests
**Future:** Add tests for critical functions
```typescript
describe('fuzzyMatch', () => {
  it('should match expense name', () => {
    expect(fuzzyMatch(expense, 'jajan')).toBe(true);
  });
});
```

### 4. Integration Tests
**Future:** Test user flows end-to-end
```typescript
test('should save expense and update total', async () => {
  // Test full flow
});
```
