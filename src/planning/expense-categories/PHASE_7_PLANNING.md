# Phase 7: Smart Filtering & Interaction - Technical Planning

**Status**: 📋 PLANNING COMPLETE - READY FOR IMPLEMENTATION  
**Estimated Time**: 45-60 minutes  
**Priority**: HIGH (User explicitly likes this feature)  
**Complexity**: MEDIUM

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [User Stories](#user-stories)
3. [Technical Specifications](#technical-specifications)
4. [Implementation Steps](#implementation-steps)
5. [Component Changes](#component-changes)
6. [State Management](#state-management)
7. [User Flow](#user-flow)
8. [UI/UX Design](#uiux-design)
9. [Testing Checklist](#testing-checklist)
10. [Edge Cases](#edge-cases)

---

## Overview

### Goals
Enable users to **interactively filter expenses by category** through:
- Click pie chart slice → auto-filter ExpenseList
- Multi-category filter dropdown
- Active filter badges with clear functionality
- Sort by category options

### Benefits
- **Faster insights**: Click → instant filtered view
- **Better analysis**: Focus on one category at a time
- **Less scrolling**: Filter instead of manual searching
- **Data exploration**: Easy category navigation

### Dependencies
- ✅ CategoryBreakdown component (already implemented)
- ✅ ExpenseList component (already implemented)
- ✅ Tab system in App.tsx (already implemented)
- ✅ Category system (already implemented)

---

## User Stories

### Story 1: Click Pie Chart to Filter
```
AS A user
I WANT to click on a category slice in the pie chart
SO THAT I can see all expenses in that category

Acceptance Criteria:
- Clicking "Makanan" slice switches to "Pengeluaran" tab
- ExpenseList shows only "Makanan" expenses
- Filter badge appears: "Filter: 🍔 Makanan (7 items)"
- Clicking "X" clears the filter
- Pie chart slice is highlighted when active
```

### Story 2: Multi-Category Filter Dropdown
```
AS A user
I WANT to filter expenses using a dropdown
SO THAT I can select multiple categories to view

Acceptance Criteria:
- Dropdown shows all categories with transaction counts
- Categories can be selected/deselected
- Multiple categories can be active simultaneously
- "Clear All" button appears when filters active
- Filter persists when switching tabs and back
```

### Story 3: Sort by Category
```
AS A user
I WANT to sort expenses by category
SO THAT I can see related expenses grouped together

Acceptance Criteria:
- "Sort by Category" option in sort dropdown
- Expenses grouped by category, then by date
- Category sections have visual separators
- Maintains existing sort options (date, amount)
```

---

## Technical Specifications

### 1. State Management

#### App.tsx State (Global)
```typescript
// Add to existing App.tsx state
const [categoryFilter, setCategoryFilter] = useState<Set<ExpenseCategory>>(new Set());
const [activeCategoryFromPieChart, setActiveCategoryFromPieChart] = useState<ExpenseCategory | null>(null);
```

**Why Set<ExpenseCategory>?**
- Supports multiple category filtering
- Easy add/remove operations
- Efficient lookup: `O(1)`
- Future-proof for multi-select

#### Filter State Type
```typescript
// In /types/index.ts
export interface CategoryFilterState {
  activeCategories: Set<ExpenseCategory>;
  source: 'pie-chart' | 'dropdown' | 'manual';
  timestamp: number;
}
```

### 2. Props Changes

#### CategoryBreakdown Props
```typescript
interface CategoryBreakdownProps {
  expenses: Expense[];
  loading?: boolean;
  onCategoryClick?: (category: ExpenseCategory) => void;  // NEW
  activeFilter?: Set<ExpenseCategory>;                    // NEW
}
```

#### ExpenseList Props
```typescript
interface ExpenseListProps {
  // ... existing props
  categoryFilter?: Set<ExpenseCategory>;                  // NEW
  onClearFilter?: () => void;                             // NEW
  showCategoryFilter?: boolean;                           // NEW
}
```

### 3. Data Flow

```
User Action
    ↓
CategoryBreakdown (Pie Chart Click)
    ↓
onCategoryClick(category) → App.tsx
    ↓
setCategoryFilter(new Set([category]))
setActiveTab('expenses')
    ↓
ExpenseList receives categoryFilter prop
    ↓
Filters expenses in useMemo
    ↓
Renders filtered list + Filter Badge
```

### 4. Component Architecture

```
App.tsx
├── State: categoryFilter, activeCategoryFromPieChart
├── Handlers: handleCategoryClick, handleClearFilter
└── Pass props down
    ├── CategoryBreakdown
    │   ├── onCategoryClick prop
    │   ├── activeFilter prop
    │   └── Highlight active slice
    └── ExpenseList
        ├── categoryFilter prop
        ├── onClearFilter prop
        ├── Filter Badge Component (NEW)
        └── Category Filter Dropdown (NEW)
```

---

## Implementation Steps

### Step 1: Update Types (5 mins)
**File**: `/types/index.ts`

```typescript
export interface CategoryFilterState {
  activeCategories: Set<ExpenseCategory>;
  source: 'pie-chart' | 'dropdown' | 'manual';
}
```

### Step 2: Add State to App.tsx (10 mins)
**File**: `/App.tsx`

```typescript
// Add after existing state declarations
const [categoryFilter, setCategoryFilter] = useState<Set<ExpenseCategory>>(new Set());

// Handler for pie chart click
const handleCategoryClick = useCallback((category: ExpenseCategory) => {
  setCategoryFilter(new Set([category]));
  setActiveTab('expenses'); // Switch to Pengeluaran tab
}, []);

// Handler to clear filter
const handleClearFilter = useCallback(() => {
  setCategoryFilter(new Set());
}, []);
```

### Step 3: Update CategoryBreakdown - Add Click Handler (15 mins)
**File**: `/components/CategoryBreakdown.tsx`

**Changes**:
1. Add props: `onCategoryClick`, `activeFilter`
2. Add click handler to PieChart
3. Highlight active slice
4. Add visual feedback

```typescript
interface CategoryBreakdownProps {
  expenses: Expense[];
  loading?: boolean;
  onCategoryClick?: (category: ExpenseCategory) => void;
  activeFilter?: Set<ExpenseCategory>;
}

export function CategoryBreakdown({ 
  expenses, 
  loading, 
  onCategoryClick,
  activeFilter = new Set()
}: CategoryBreakdownProps) {
  // ... existing code

  return (
    {/* Pie Chart with click handler */}
    <PieChart>
      <Pie
        data={categoryData}
        onClick={(data) => {
          if (onCategoryClick) {
            onCategoryClick(data.category);
          }
        }}
        // Highlight active slice
        activeIndex={categoryData.findIndex(d => 
          activeFilter.has(d.category)
        )}
        activeShape={{
          stroke: '#000',
          strokeWidth: 3,
          scale: 1.05
        }}
      />
    </PieChart>
  );
}
```

### Step 4: Create Filter Badge Component (10 mins)
**File**: `/components/CategoryFilterBadge.tsx` (NEW)

```typescript
import { Badge } from "./ui/badge";
import { X } from "lucide-react";
import { ExpenseCategory } from "../types";
import { getCategoryEmoji, getCategoryLabel } from "../utils/calculations";

interface CategoryFilterBadgeProps {
  activeCategories: Set<ExpenseCategory>;
  onClear: () => void;
  itemCount: number;
}

export function CategoryFilterBadge({ 
  activeCategories, 
  onClear, 
  itemCount 
}: CategoryFilterBadgeProps) {
  if (activeCategories.size === 0) return null;

  const categories = Array.from(activeCategories);
  
  // Single category filter
  if (categories.length === 1) {
    const category = categories[0];
    return (
      <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
        <span className="text-sm">
          🔍 Filter: {getCategoryEmoji(category)} {getCategoryLabel(category)}
        </span>
        <Badge variant="secondary">{itemCount} item{itemCount !== 1 ? 's' : ''}</Badge>
        <button
          onClick={onClear}
          className="ml-auto p-1 hover:bg-background rounded-full transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }
  
  // Multiple categories filter
  return (
    <div className="flex items-center gap-2 p-3 bg-accent rounded-lg flex-wrap">
      <span className="text-sm">🔍 Filter:</span>
      {categories.map(cat => (
        <Badge key={cat} variant="secondary">
          {getCategoryEmoji(cat)} {getCategoryLabel(cat)}
        </Badge>
      ))}
      <Badge variant="secondary">{itemCount} items</Badge>
      <button
        onClick={onClear}
        className="ml-auto p-1 hover:bg-background rounded-full transition-colors"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
```

### Step 5: Update ExpenseList - Add Filtering (20 mins)
**File**: `/components/ExpenseList.tsx`

**Changes**:
1. Add props: `categoryFilter`, `onClearFilter`
2. Filter expenses in useMemo
3. Add CategoryFilterBadge
4. Add category filter dropdown (optional for Phase 7)

```typescript
interface ExpenseListProps {
  // ... existing props
  categoryFilter?: Set<ExpenseCategory>;
  onClearFilter?: () => void;
}

export function ExpenseList({
  // ... existing props
  categoryFilter = new Set(),
  onClearFilter
}: ExpenseListProps) {
  
  // Filter expenses by category
  const filteredExpenses = useMemo(() => {
    if (categoryFilter.size === 0) return expenses;
    
    return expenses.filter(expense => {
      const expCategory = expense.category || 'other';
      return categoryFilter.has(expCategory as ExpenseCategory);
    });
  }, [expenses, categoryFilter]);

  // Use filteredExpenses instead of expenses for all operations
  const sortedAndFilteredExpenses = useMemo(() => {
    return filteredExpenses
      .sort(/* existing sort logic */)
      .filter(/* existing search filter */);
  }, [filteredExpenses, sortOrder, searchQuery]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>...</CardTitle>
        
        {/* Filter Badge */}
        {categoryFilter.size > 0 && onClearFilter && (
          <CategoryFilterBadge
            activeCategories={categoryFilter}
            onClear={onClearFilter}
            itemCount={filteredExpenses.length}
          />
        )}
      </CardHeader>
      
      <CardContent>
        {/* Existing content */}
      </CardContent>
    </Card>
  );
}
```

### Step 6: Wire Everything in App.tsx (5 mins)
**File**: `/App.tsx`

```typescript
{/* CategoryBreakdown Tab */}
{activeTab === 'categories' && (
  <CategoryBreakdown
    expenses={expenses}
    loading={loading}
    onCategoryClick={handleCategoryClick}
    activeFilter={categoryFilter}
  />
)}

{/* ExpenseList Tab */}
{activeTab === 'expenses' && (
  <ExpenseList
    expenses={expenses}
    categoryFilter={categoryFilter}
    onClearFilter={handleClearFilter}
    // ... other props
  />
)}
```

---

## Component Changes

### Files to Modify

1. **`/types/index.ts`** - Add CategoryFilterState interface
2. **`/App.tsx`** - Add state & handlers (15 lines)
3. **`/components/CategoryBreakdown.tsx`** - Add click handler (30 lines)
4. **`/components/CategoryFilterBadge.tsx`** - NEW COMPONENT (80 lines)
5. **`/components/ExpenseList.tsx`** - Add filtering logic (40 lines)

### Total LOC: ~165 lines

---

## State Management

### State Location: App.tsx (Lift State Up)

**Why App.tsx?**
- CategoryBreakdown and ExpenseList are siblings
- Need to communicate between tabs
- Centralized state = single source of truth
- Easy to add persistence later

### State Persistence (Optional - Phase 7.1)
```typescript
// Save filter state to localStorage
useEffect(() => {
  if (categoryFilter.size > 0) {
    localStorage.setItem('categoryFilter', JSON.stringify(Array.from(categoryFilter)));
  } else {
    localStorage.removeItem('categoryFilter');
  }
}, [categoryFilter]);

// Restore on mount
useEffect(() => {
  const saved = localStorage.getItem('categoryFilter');
  if (saved) {
    setCategoryFilter(new Set(JSON.parse(saved)));
  }
}, []);
```

---

## User Flow

### Flow 1: Click Pie Chart Slice

```
1. User is on "📊 Kategori" tab
2. User sees pie chart with categories
3. User clicks "Makanan" slice (37%)
   ↓
4. Pie chart highlights clicked slice (scale 1.05, stroke)
5. App switches to "Pengeluaran" tab
6. ExpenseList shows filter badge: "🔍 Filter: 🍔 Makanan (7 items)"
7. Only "Makanan" expenses are shown
   ↓
8. User clicks "X" on filter badge
9. Filter clears, all expenses shown
10. User switches back to "📊 Kategori" tab
11. Pie chart no longer highlighted
```

### Flow 2: Multi-Category Filter (Phase 7.1 - Optional)

```
1. User is on "Pengeluaran" tab
2. User clicks [Filter by Category ▼]
3. Dropdown shows all categories with counts:
   ☐ 🍔 Makanan (7)
   ☐ 🚗 Transportasi (2)
   ☐ 📦 Lainnya (9)
   ...
4. User checks "Makanan" and "Transportasi"
5. Filter badge updates: "🔍 Filter: 🍔 Makanan, 🚗 Transportasi (9 items)"
6. Only those expenses shown
7. User clicks "Clear All"
8. All filters removed
```

---

## UI/UX Design

### 1. Filter Badge Design

**Location**: Below CardTitle in ExpenseList

**Mobile Layout**:
```
┌─────────────────────────────────────┐
│ Pengeluaran                         │
├─────────────────────────────────────┤
│ 🔍 Filter: 🍔 Makanan   7 items  [X]│
├─────────────────────────────────────┤
│ [Search] [Sort] [⋮]                 │
│                                     │
│ 7 Nov - Rp 50.000                   │
│ ...                                 │
└─────────────────────────────────────┘
```

**Desktop Layout**:
```
┌───────────────────────────────────────────────┐
│ Pengeluaran                                   │
├───────────────────────────────────────────────┤
│ 🔍 Filter: 🍔 Makanan  7 items  [X]          │
├───────────────────────────────────────────────┤
│ [Search............]  [Sort ▼]  [⋮]          │
│                                               │
│ 7 Nov 2025                    -Rp 50.000      │
│ ...                                           │
└───────────────────────────────────────────────┘
```

### 2. Pie Chart Active State

**Visual Changes**:
- **Scale**: 1.05 (5% larger)
- **Stroke**: Black, 3px
- **Cursor**: pointer
- **Hover**: opacity 0.8
- **Transition**: all 0.2s ease

**Implementation**:
```typescript
<Pie
  activeShape={{
    stroke: '#000',
    strokeWidth: 3,
    scale: 1.05,
    cursor: 'pointer'
  }}
  style={{ cursor: 'pointer' }}
  onMouseEnter={(_, index) => setHoveredIndex(index)}
  onMouseLeave={() => setHoveredIndex(null)}
/>
```

### 3. Empty State (Filtered)

```
┌─────────────────────────────────────┐
│ 🔍 Filter: 🍔 Makanan  0 items  [X] │
├─────────────────────────────────────┤
│                                     │
│          🍽️                          │
│                                     │
│   Tidak ada pengeluaran Makanan     │
│                                     │
│   [Hapus Filter]  [Tambah Expense]  │
│                                     │
└─────────────────────────────────────┘
```

---

## Testing Checklist

### Unit Tests

- [ ] `categoryFilter` state updates correctly
- [ ] `handleCategoryClick` sets filter and switches tab
- [ ] `handleClearFilter` resets filter
- [ ] Filtered expenses array is correct
- [ ] Empty filter shows all expenses
- [ ] Invalid category handled gracefully

### Integration Tests

- [ ] Click pie chart → switches tab
- [ ] Click pie chart → shows filtered expenses
- [ ] Filter badge shows correct count
- [ ] Clear filter → all expenses shown
- [ ] Filter persists when switching tabs
- [ ] Pie chart highlights correct slice
- [ ] Search works with filtered expenses
- [ ] Sort works with filtered expenses
- [ ] Bulk select works with filtered expenses

### UI/UX Tests

- [ ] Filter badge is visible and readable (mobile)
- [ ] Filter badge is visible and readable (desktop)
- [ ] Active pie slice is visually distinct
- [ ] Hover state on pie chart works
- [ ] Click animation is smooth
- [ ] Tab transition is instant
- [ ] Empty state shows when no matches
- [ ] Clear button is easily clickable (min 44x44px touch target)

### Edge Cases

- [ ] Filter "Lainnya" (uncategorized expenses)
- [ ] Filter category with 0 expenses
- [ ] Filter while search is active
- [ ] Filter while bulk select mode is active
- [ ] Multiple rapid clicks on pie chart
- [ ] Click same slice twice (toggle behavior?)
- [ ] Filter persistence across page refresh (if implemented)

---

## Edge Cases

### 1. Category with 0 Expenses
```typescript
// ExpenseList should show empty state
if (filteredExpenses.length === 0 && categoryFilter.size > 0) {
  return <FilteredEmptyState category={categoryFilter} onClear={onClearFilter} />;
}
```

### 2. Filter While Search Active
```typescript
// Search should apply to filtered expenses
const finalExpenses = useMemo(() => {
  return filteredExpenses  // Already filtered by category
    .filter(exp => fuzzyMatch(exp, searchQuery));  // Then filter by search
}, [filteredExpenses, searchQuery]);
```

### 3. Filter While Bulk Select Active
```typescript
// Clear bulk selection when filter changes
useEffect(() => {
  if (categoryFilter.size > 0) {
    setSelectedExpenseIds(new Set());
    setIsBulkSelectMode(false);
  }
}, [categoryFilter]);
```

### 4. Rapid Clicks on Pie Chart
```typescript
// Debounce click handler
const handleCategoryClick = useMemo(
  () => debounce((category: ExpenseCategory) => {
    setCategoryFilter(new Set([category]));
    setActiveTab('expenses');
  }, 150),
  []
);
```

### 5. Toggle Behavior (Optional)
```typescript
// Click same category twice to clear
const handleCategoryClick = useCallback((category: ExpenseCategory) => {
  setCategoryFilter(prev => {
    const newSet = new Set(prev);
    if (newSet.has(category) && newSet.size === 1) {
      newSet.clear(); // Toggle off
    } else {
      newSet.clear();
      newSet.add(category); // Single select
    }
    return newSet;
  });
  setActiveTab('expenses');
}, []);
```

---

## Performance Considerations

### 1. Memoization
```typescript
// Memoize filtered expenses
const filteredExpenses = useMemo(() => {
  if (categoryFilter.size === 0) return expenses;
  return expenses.filter(exp => 
    categoryFilter.has((exp.category || 'other') as ExpenseCategory)
  );
}, [expenses, categoryFilter]);
```

**Why**: Prevent re-filtering on every render

### 2. Set Operations
```typescript
// Use Set for O(1) lookup
categoryFilter.has(category)  // O(1)
// vs
categoryFilterArray.includes(category)  // O(n)
```

**Performance**: 1000 expenses × O(1) = 1ms vs O(n) = ~10ms

### 3. Component Memoization
```typescript
// Memoize CategoryFilterBadge
export const CategoryFilterBadge = memo(function CategoryFilterBadge({ ... }) {
  // ...
});
```

**Why**: Prevent re-render when parent re-renders

---

## Migration & Rollback

### Backward Compatibility
- ✅ All props are optional
- ✅ Filter defaults to empty Set (no filtering)
- ✅ Works without changes to existing code
- ✅ No database changes needed

### Rollback Steps
1. Remove `categoryFilter` state from App.tsx
2. Remove props from CategoryBreakdown & ExpenseList
3. Delete `/components/CategoryFilterBadge.tsx`
4. Git revert changes

**Risk**: LOW - Isolated feature, no breaking changes

---

## Success Metrics

### User Engagement
- Click-through rate on pie chart: **> 30%**
- Filter usage per session: **> 2 times**
- Time to find expense: **< 10 seconds** (vs 30s scrolling)

### Technical Performance
- Filter operation: **< 5ms** for 1000 expenses
- Tab switch + filter: **< 200ms** total
- Memory impact: **< 1MB** additional

### User Satisfaction
- Feature discovery: **> 50%** within first week
- Feature retention: **> 60%** weekly active
- User feedback: **> 4.5/5** rating

---

## Next Steps (After Phase 7)

### Phase 7.1: Multi-Select Filter (Optional)
- Add category filter dropdown
- Checkbox multi-select
- "Select All" / "Clear All" buttons
- Persist filter in localStorage

### Phase 8: Customization
- Custom categories
- Color picker
- Category manager
- Budget limits per category

---

## Implementation Order

```
Day 1: Core Functionality (30 mins)
├── Step 1: Update types (5 mins)
├── Step 2: Add state to App.tsx (10 mins)
└── Step 3: Update CategoryBreakdown (15 mins)

Day 1: UI Components (30 mins)
├── Step 4: Create CategoryFilterBadge (10 mins)
├── Step 5: Update ExpenseList (15 mins)
└── Step 6: Wire in App.tsx (5 mins)

Day 2: Testing & Polish (30 mins)
├── Manual testing (15 mins)
├── Edge case handling (10 mins)
└── Performance check (5 mins)

Total: 90 minutes
```

---

## Questions to Resolve

- [ ] Should clicking same slice toggle filter off?
- [ ] Should filter persist across page refreshes?
- [ ] Should we clear search when filter is applied?
- [ ] Should we disable bulk select when filter is active?
- [ ] Should we show "X of Y expenses" in filter badge?

---

**Status**: ✅ PLANNING COMPLETE  
**Ready for Implementation**: YES  
**Estimated Complexity**: MEDIUM  
**Risk Level**: LOW

---

**Next**: Review with user, then proceed to implementation! 🚀
