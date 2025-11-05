# Performance Optimization Plan

**Phase**: Performance Optimization  
**Priority**: 🟡 High  
**Estimated Time**: 3-4 hours

---

## 🎯 Performance Goals

- **Initial Load**: < 2 seconds
- **Page Transitions**: < 300ms
- **Data Fetching**: < 1 second
- **Bundle Size**: Reduce by 10-15%
- **Runtime Performance**: 60fps interactions

---

## 1. Current Performance Baseline

### ✅ Already Optimized
- PocketsSummary parallel fetching (3-5s → <1s)
- PocketTimeline optimized queries (<1s)
- Skeleton loading states
- Conditional rendering

### 🔄 Need Optimization
- Initial bundle loading
- Heavy component re-renders
- Dialog lazy loading
- Image optimization (if any)

---

## 2. Bundle Size Optimization

### A. Code Splitting & Lazy Loading

#### Lazy Load Heavy Dialogs

```typescript
// Current: All dialogs loaded upfront
import { WishlistDialog } from './components/WishlistDialog';
import { ManagePocketsDialog } from './components/ManagePocketsDialog';
import { TransferDialog } from './components/TransferDialog';

// Optimized: Lazy load on demand
const WishlistDialog = lazy(() => import('./components/WishlistDialog'));
const ManagePocketsDialog = lazy(() => import('./components/ManagePocketsDialog'));
const TransferDialog = lazy(() => import('./components/TransferDialog'));

// Wrap in Suspense
<Suspense fallback={<DialogSkeleton />}>
  {isWishlistOpen && <WishlistDialog ... />}
</Suspense>
```

**Expected Savings**: 50-80KB per dialog (3-4 dialogs = 200-300KB)

---

#### Lazy Load emoji-picker-react

```typescript
// Current: Loaded immediately
import EmojiPicker from 'emoji-picker-react';

// Optimized: Lazy load when emoji picker opens
const EmojiPicker = lazy(() => import('emoji-picker-react'));

// In component
{showEmojiPicker && (
  <Suspense fallback={<div>Loading...</div>}>
    <EmojiPicker ... />
  </Suspense>
)}
```

**Expected Savings**: 100-150KB

---

### B. Tree Shaking Optimization

#### Check Import Patterns

```typescript
// ❌ Bad: Imports entire library
import * as Icons from 'lucide-react';

// ✅ Good: Import only what's needed
import { Wallet, Plus, Edit } from 'lucide-react';
```

**Files to Audit**:
- All component files
- Utility files

---

### C. Dynamic Imports for Heavy Components

```typescript
// For components only used conditionally
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false
});
```

**Candidates**:
- PocketTimeline (only shown when pocket is expanded)
- WishlistSimulation (only in wishlist tab)

---

## 3. Runtime Performance Optimization

### A. Memoization Strategy

#### App.tsx - Heavy Calculations

```typescript
// Current: Recalculates on every render
const totalExpenses = expenses
  .filter((e, i) => !excludedExpenseIds.has(i.toString()) && !e.fromIncome)
  .reduce((sum, e) => sum + e.amount, 0);

// Optimized: Memoize
const totalExpenses = useMemo(() => 
  expenses
    .filter((e, i) => !excludedExpenseIds.has(i.toString()) && !e.fromIncome)
    .reduce((sum, e) => sum + e.amount, 0),
  [expenses, excludedExpenseIds]
);

// Apply to:
- totalExpenses calculation
- totalAdditionalIncome calculation
- remainingBudget calculation
- percentUsed calculation
- sortedExpenses
- filteredPockets
```

**Expected Improvement**: 20-30% faster renders

---

#### Component Memoization

```typescript
// Wrap heavy components
export const ExpenseList = React.memo(ExpenseListComponent, (prev, next) => {
  return prev.expenses === next.expenses && 
         prev.onDelete === next.onDelete;
});

// Apply to:
- ExpenseList
- AdditionalIncomeList
- PocketsSummary (if not already)
- PocketTimeline (if not already)
- BudgetOverview
```

**Expected Improvement**: 40-50% fewer re-renders

---

### B. Event Handler Optimization

```typescript
// Current: Creates new function on every render
<Button onClick={() => handleClick(id)} />

// Optimized: useCallback
const handleClick = useCallback((id: string) => {
  // ...
}, [dependencies]);

<Button onClick={() => handleClick(id)} />

// Or better: Memoize the component
```

**Apply to**:
- All event handlers passed to child components
- Filter/sort functions
- API call functions

---

### C. Debounce Heavy Operations

```typescript
// Create debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Apply to:
- Search/filter inputs
- Auto-save operations
- Scroll handlers (if any)
```

---

## 4. Data Fetching Optimization

### A. Request Deduplication

```typescript
// Prevent duplicate requests for same data
const requestCache = new Map<string, Promise<any>>();

export const cachedFetch = async (url: string, options?: RequestInit) => {
  const key = `${url}-${JSON.stringify(options)}`;
  
  if (requestCache.has(key)) {
    return requestCache.get(key);
  }
  
  const promise = fetch(url, options);
  requestCache.set(key, promise);
  
  promise.finally(() => {
    requestCache.delete(key);
  });
  
  return promise;
};
```

---

### B. Prefetch Strategy

```typescript
// Prefetch next month data when user is viewing current month
useEffect(() => {
  const prefetchNextMonth = async () => {
    const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
    const nextYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
    
    // Prefetch in background
    await prefetchData(nextYear, nextMonth);
  };
  
  // Prefetch after 2 seconds of inactivity
  const timer = setTimeout(prefetchNextMonth, 2000);
  return () => clearTimeout(timer);
}, [selectedMonth, selectedYear]);
```

---

### C. Parallel Fetching (Already Implemented)

**Status**: ✅ Already optimized in PocketsSummary  
**Action**: Ensure all data loading uses parallel fetching pattern

---

## 5. Rendering Optimization

### A. Virtualization (If Needed)

**Check if needed**: 
- ExpenseList with 100+ items
- AdditionalIncomeList with 50+ items

**Solution**: Use `react-window` or `react-virtual`

```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={expenses.length}
  itemSize={80}
>
  {({ index, style }) => (
    <div style={style}>
      <ExpenseItem expense={expenses[index]} />
    </div>
  )}
</FixedSizeList>
```

**Threshold**: Implement if list > 50 items regularly

---

### B. Conditional Loading

```typescript
// Don't render off-screen content
{activeTab === 'expenses' && <ExpenseList ... />}
{activeTab === 'income' && <AdditionalIncomeList ... />}
{activeTab === 'wishlist' && <WishlistTab ... />}

// Instead of:
<ExpenseList style={{ display: activeTab === 'expenses' ? 'block' : 'none' }} />
```

**Status**: Check if already implemented

---

### C. Image Optimization

**If app has images**:
- Use next-gen formats (WebP)
- Lazy load images
- Use proper sizing
- Add loading="lazy" attribute

**Status**: Check if applicable

---

## 6. Network Optimization

### A. Response Compression

**Server-side**: Ensure gzip/brotli enabled on Supabase Edge Functions

```typescript
// In server headers
headers.set('Content-Encoding', 'gzip');
```

---

### B. Cache Headers

```typescript
// For static resources
headers.set('Cache-Control', 'public, max-age=31536000, immutable');

// For API responses (short cache)
headers.set('Cache-Control', 'public, max-age=60');
```

---

### C. Request Batching

**If multiple API calls happen together**:

```typescript
// Instead of:
await fetch('/api/expenses');
await fetch('/api/income');
await fetch('/api/pockets');

// Batch into one request:
await fetch('/api/budget-data', {
  body: JSON.stringify({ include: ['expenses', 'income', 'pockets'] })
});
```

---

## 7. State Management Optimization

### A. Context Optimization

**If using Context** (check if app uses React Context):

```typescript
// Split contexts to prevent unnecessary re-renders
<BudgetContext.Provider>
  <ExpenseContext.Provider>
    <PocketContext.Provider>
      <App />
    </PocketContext.Provider>
  </ExpenseContext.Provider>
</BudgetContext.Provider>
```

---

### B. Local Storage Optimization

```typescript
// Debounce localStorage writes
const debouncedSave = debounce((key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
}, 500);

// Batch localStorage operations
const batchSave = (items: Record<string, any>) => {
  Object.entries(items).forEach(([key, value]) => {
    localStorage.setItem(key, JSON.stringify(value));
  });
};
```

---

## 8. CSS & Animation Optimization

### A. Use CSS Transforms (Already Good with Tailwind)

```css
/* ✅ Good: GPU accelerated */
transform: translateX(100px);

/* ❌ Bad: CPU intensive */
left: 100px;
```

**Status**: Check Tailwind classes being used

---

### B. Reduce Animation Complexity

```typescript
// Use will-change sparingly
.animated-element {
  will-change: transform;
}

// Remove after animation
element.style.willChange = 'auto';
```

---

## 9. Monitoring & Measurement

### A. Add Performance Marks

```typescript
// In critical paths
performance.mark('data-fetch-start');
await fetchData();
performance.mark('data-fetch-end');

performance.measure('data-fetch', 'data-fetch-start', 'data-fetch-end');

const measure = performance.getEntriesByName('data-fetch')[0];
console.log(`Data fetch took: ${measure.duration}ms`);
```

---

### B. React DevTools Profiler

```typescript
// Wrap expensive components
<Profiler id="ExpenseList" onRender={onRenderCallback}>
  <ExpenseList />
</Profiler>

const onRenderCallback = (
  id, phase, actualDuration, baseDuration, startTime, commitTime
) => {
  console.log(`${id} ${phase} took ${actualDuration}ms`);
};
```

---

## Implementation Priority

### High Priority (Immediate Impact)
1. ✅ Lazy load dialogs (3-4 dialogs)
2. ✅ Lazy load emoji-picker-react
3. ✅ Add useMemo for calculations
4. ✅ Add React.memo for heavy components
5. ✅ Add useCallback for event handlers

### Medium Priority (Good Improvement)
6. ✅ Implement debounce for inputs
7. ✅ Request deduplication
8. ✅ Check tree-shaking
9. ✅ Prefetch strategy

### Low Priority (Nice to Have)
10. ✅ Virtualization (if needed)
11. ✅ Performance monitoring
12. ✅ Cache headers optimization

---

## Expected Results

### Bundle Size
- **Before**: ~800KB (estimated)
- **After**: ~600-650KB (estimated)
- **Reduction**: 20-25%

### Loading Time
- **Before**: 3-4 seconds (initial)
- **After**: 2-2.5 seconds (initial)
- **Improvement**: 30-40%

### Runtime Performance
- **Re-renders**: -50%
- **Calculation Time**: -30%
- **Memory Usage**: -15%

---

## Validation Checklist

After optimization:

- [ ] Lighthouse score > 90
- [ ] Initial load < 2.5s
- [ ] Page interactions < 300ms
- [ ] No unnecessary re-renders (check React DevTools)
- [ ] Bundle size reduced by 15%+
- [ ] Memory leaks checked
- [ ] Performance marks measured

---

**Next**: After performance optimization, proceed to DOCUMENTATION_PLAN.md
