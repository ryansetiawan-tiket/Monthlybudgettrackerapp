# 🔄 State Management

## Overview

Complete state management architecture for the refactored Wishlist Simulation.

---

## 📦 State Structure

### Main Component State
```typescript
interface WishlistSimulationState {
  // Filter state
  filterState: FilterState;
  
  // Dialog/Drawer states
  isOpen: boolean;
  
  // Edit/Delete dialog states
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  selectedItem: WishlistItem | null;
  
  // Add item state
  isAddDialogOpen: boolean;
  
  // Mobile swipe state (per item)
  swipeStates: Map<string, SwipeState>;
}

type FilterState = {
  type: 'all' | 'affordable' | 'priority';
  value?: 'high' | 'medium' | 'low';
};

type SwipeState = {
  offset: number;
  isRevealed: boolean;
};
```

---

## 🎣 State Hooks Implementation

### 1. Filter State Hook
```typescript
const useFilterState = (wishlistItems: WishlistItem[], currentBalance: number) => {
  const [filterState, setFilterState] = useState<FilterState>({ type: 'all' });

  // Calculate affordable items
  const affordableItems = useMemo(() => {
    return wishlistItems.filter(item => currentBalance >= item.targetAmount);
  }, [wishlistItems, currentBalance]);

  // Toggle affordable filter
  const toggleAffordableFilter = useCallback(() => {
    setFilterState(prev => 
      prev.type === 'affordable' 
        ? { type: 'all' } 
        : { type: 'affordable' }
    );
  }, []);

  // Handle priority filter
  const handlePriorityFilter = useCallback((value: string) => {
    if (value === 'all') {
      setFilterState({ type: 'all' });
    } else {
      setFilterState({ 
        type: 'priority', 
        value: value as 'high' | 'medium' | 'low' 
      });
    }
  }, []);

  // Apply filters to get filtered items
  const filteredItems = useMemo(() => {
    if (filterState.type === 'affordable') {
      return affordableItems;
    }
    
    if (filterState.type === 'priority' && filterState.value) {
      return wishlistItems.filter(item => item.priority === filterState.value);
    }
    
    return wishlistItems;
  }, [wishlistItems, affordableItems, filterState]);

  return {
    filterState,
    affordableItems,
    filteredItems,
    toggleAffordableFilter,
    handlePriorityFilter,
  };
};
```

**Usage:**
```typescript
const {
  filterState,
  affordableItems,
  filteredItems,
  toggleAffordableFilter,
  handlePriorityFilter,
} = useFilterState(wishlistItems, currentBalance);
```

---

### 2. Summary Calculations Hook
```typescript
const useSummaryCalculations = (
  wishlistItems: WishlistItem[], 
  currentBalance: number
) => {
  // Total wishlist amount
  const totalWishlist = useMemo(() => 
    wishlistItems.reduce((sum, item) => sum + item.targetAmount, 0),
    [wishlistItems]
  );

  // Shortage or surplus
  const shortage = useMemo(() => 
    Math.max(totalWishlist - currentBalance, 0),
    [totalWishlist, currentBalance]
  );

  // Is balance sufficient?
  const isAffordable = useMemo(() => 
    currentBalance >= totalWishlist,
    [currentBalance, totalWishlist]
  );

  // Progress percentage (capped at 100%)
  const progressPercentage = useMemo(() => {
    if (totalWishlist === 0) return 0;
    return Math.min(Math.round((currentBalance / totalWishlist) * 100), 100);
  }, [currentBalance, totalWishlist]);

  return {
    totalWishlist,
    shortage,
    isAffordable,
    progressPercentage,
  };
};
```

**Usage:**
```typescript
const {
  totalWishlist,
  shortage,
  isAffordable,
  progressPercentage,
} = useSummaryCalculations(wishlistItems, currentBalance);
```

---

### 3. Item Actions Hook
```typescript
const useItemActions = (
  wishlistItems: WishlistItem[],
  onItemsChange: (items: WishlistItem[]) => void
) => {
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Open edit dialog
  const handleEdit = useCallback((item: WishlistItem) => {
    setSelectedItem(item);
    setIsEditDialogOpen(true);
  }, []);

  // Open delete dialog
  const handleDelete = useCallback((item: WishlistItem) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  }, []);

  // Confirm delete
  const confirmDelete = useCallback(() => {
    if (!selectedItem) return;
    
    const updatedItems = wishlistItems.filter(i => i.id !== selectedItem.id);
    onItemsChange(updatedItems);
    
    setIsDeleteDialogOpen(false);
    setSelectedItem(null);
  }, [selectedItem, wishlistItems, onItemsChange]);

  // Handle purchase
  const handlePurchase = useCallback(async (item: WishlistItem) => {
    // Execute purchase logic
    // This will create an expense and remove from wishlist
    try {
      // TODO: Implement purchase logic
      // 1. Create expense with item.targetAmount
      // 2. Remove item from wishlist
      // 3. Update budget
      
      const updatedItems = wishlistItems.filter(i => i.id !== item.id);
      onItemsChange(updatedItems);
      
      // Show success message
      toast.success(`${item.name} berhasil dibeli!`);
    } catch (error) {
      toast.error('Gagal membeli item');
      console.error(error);
    }
  }, [wishlistItems, onItemsChange]);

  return {
    selectedItem,
    isEditDialogOpen,
    isDeleteDialogOpen,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    handleEdit,
    handleDelete,
    confirmDelete,
    handlePurchase,
  };
};
```

**Usage:**
```typescript
const {
  selectedItem,
  isEditDialogOpen,
  isDeleteDialogOpen,
  setIsEditDialogOpen,
  setIsDeleteDialogOpen,
  handleEdit,
  handleDelete,
  confirmDelete,
  handlePurchase,
} = useItemActions(wishlistItems, updateWishlistItems);
```

---

### 4. Swipe State Hook (Mobile)
```typescript
const useSwipeState = () => {
  const [swipeStates, setSwipeStates] = useState<Map<string, SwipeState>>(new Map());

  const setSwipeOffset = useCallback((itemId: string, offset: number) => {
    setSwipeStates(prev => {
      const newMap = new Map(prev);
      newMap.set(itemId, {
        offset,
        isRevealed: offset <= -50,
      });
      return newMap;
    });
  }, []);

  const resetSwipe = useCallback((itemId: string) => {
    setSwipeStates(prev => {
      const newMap = new Map(prev);
      newMap.set(itemId, { offset: 0, isRevealed: false });
      return newMap;
    });
  }, []);

  const resetAllSwipes = useCallback(() => {
    setSwipeStates(new Map());
  }, []);

  const getSwipeState = useCallback((itemId: string): SwipeState => {
    return swipeStates.get(itemId) || { offset: 0, isRevealed: false };
  }, [swipeStates]);

  return {
    setSwipeOffset,
    resetSwipe,
    resetAllSwipes,
    getSwipeState,
  };
};
```

**Usage:**
```typescript
const {
  setSwipeOffset,
  resetSwipe,
  resetAllSwipes,
  getSwipeState,
} = useSwipeState();

// In touch handlers:
const swipeState = getSwipeState(item.id);
```

---

## 🔄 State Flow Diagrams

### Filter State Flow
```
User Action → State Update → Computed Values → UI Update

1. Click "Quick Insight Button"
   ↓
   toggleAffordableFilter()
   ↓
   filterState = { type: 'affordable' }
   ↓
   filteredItems = affordableItems
   ↓
   UI shows only affordable items

2. Click "High" Priority Tab
   ↓
   handlePriorityFilter('high')
   ↓
   filterState = { type: 'priority', value: 'high' }
   ↓
   filteredItems = items.filter(i => i.priority === 'high')
   ↓
   UI shows only high priority items
```

### Purchase Flow
```
User clicks "Beli Sekarang"
   ↓
   handlePurchase(item)
   ↓
   Create expense (API call)
   ↓
   Remove item from wishlist
   ↓
   Update budget data
   ↓
   Show success toast
   ↓
   Re-render with updated list
```

### Edit Flow
```
User clicks Edit icon
   ↓
   handleEdit(item)
   ↓
   setSelectedItem(item)
   setIsEditDialogOpen(true)
   ↓
   Edit dialog opens
   ↓
   User makes changes
   ↓
   Submit changes
   ↓
   Update wishlist items
   ↓
   setIsEditDialogOpen(false)
   ↓
   Re-render with updated item
```

### Swipe Flow (Mobile)
```
User starts swipe
   ↓
   handleTouchStart(e)
   ↓
   Store initial touch X
   ↓
   handleTouchMove(e)
   ↓
   Calculate offset
   ↓
   setSwipeOffset(itemId, offset)
   ↓
   UI updates (card slides)
   ↓
   handleTouchEnd()
   ↓
   Snap to revealed/hidden based on threshold
   ↓
   Actions visible/hidden
```

---

## 💾 Data Persistence

### Local State (Component Level)
```typescript
// These states don't need persistence
- filterState (reset on component unmount)
- swipeStates (reset on component unmount)
- isEditDialogOpen (transient)
- isDeleteDialogOpen (transient)
```

### Persisted State (Database Level)
```typescript
// These are already persisted via parent component
- wishlistItems (stored in pocket data)
- currentBalance (calculated from budget data)
```

---

## 🎯 State Update Patterns

### Pattern 1: Optimistic Updates
```typescript
// For immediate UI feedback
const handlePurchase = async (item: WishlistItem) => {
  // 1. Update UI immediately
  const optimisticItems = wishlistItems.filter(i => i.id !== item.id);
  setWishlistItems(optimisticItems);
  
  try {
    // 2. Make API call
    await createExpense(item);
    await removeFromWishlist(item.id);
    
    // 3. Success feedback
    toast.success('Item berhasil dibeli!');
  } catch (error) {
    // 4. Rollback on error
    setWishlistItems(wishlistItems);
    toast.error('Gagal membeli item');
  }
};
```

### Pattern 2: Derived State
```typescript
// Don't store what can be computed
// ❌ Bad
const [totalWishlist, setTotalWishlist] = useState(0);

// ✅ Good
const totalWishlist = useMemo(() => 
  wishlistItems.reduce((sum, item) => sum + item.targetAmount, 0),
  [wishlistItems]
);
```

### Pattern 3: Batched Updates
```typescript
// Batch multiple state updates together
const resetFilters = useCallback(() => {
  startTransition(() => {
    setFilterState({ type: 'all' });
    resetAllSwipes();
  });
}, [resetAllSwipes]);
```

---

## 🧪 State Testing

### Test Cases

#### Test 1: Filter State
```typescript
test('toggles affordable filter correctly', () => {
  const { result } = renderHook(() => 
    useFilterState(mockItems, 10000000)
  );
  
  // Initial state
  expect(result.current.filterState.type).toBe('all');
  
  // Toggle on
  act(() => {
    result.current.toggleAffordableFilter();
  });
  expect(result.current.filterState.type).toBe('affordable');
  
  // Toggle off
  act(() => {
    result.current.toggleAffordableFilter();
  });
  expect(result.current.filterState.type).toBe('all');
});
```

#### Test 2: Summary Calculations
```typescript
test('calculates summary correctly', () => {
  const { result } = renderHook(() => 
    useSummaryCalculations(mockItems, 14581434)
  );
  
  expect(result.current.totalWishlist).toBe(15209000);
  expect(result.current.shortage).toBe(627566);
  expect(result.current.isAffordable).toBe(false);
  expect(result.current.progressPercentage).toBe(96);
});
```

#### Test 3: Item Actions
```typescript
test('handles item edit', () => {
  const mockOnChange = jest.fn();
  const { result } = renderHook(() => 
    useItemActions(mockItems, mockOnChange)
  );
  
  act(() => {
    result.current.handleEdit(mockItems[0]);
  });
  
  expect(result.current.selectedItem).toBe(mockItems[0]);
  expect(result.current.isEditDialogOpen).toBe(true);
});
```

---

## 🔍 State Debugging

### Debug Helper Component
```typescript
const StateDebugger = ({ state }: { state: any }) => {
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <details className="fixed bottom-4 right-4 bg-black/90 p-4 rounded-lg text-xs text-green-400 max-w-md overflow-auto max-h-96">
      <summary className="cursor-pointer font-bold mb-2">
        🐛 State Debug
      </summary>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </details>
  );
};

// Usage:
<StateDebugger state={{
  filterState,
  filteredItems: filteredItems.length,
  totalWishlist,
  isAffordable,
  progressPercentage,
}} />
```

### Console Logging
```typescript
// Add logging in development
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    console.group('🔄 State Update');
    console.log('Filter State:', filterState);
    console.log('Filtered Items:', filteredItems.length);
    console.log('Affordable Items:', affordableItems.length);
    console.groupEnd();
  }
}, [filterState, filteredItems, affordableItems]);
```

---

## 📊 State Performance Optimization

### Memoization Strategy
```typescript
// ✅ Memoize expensive calculations
const totalWishlist = useMemo(() => 
  wishlistItems.reduce((sum, item) => sum + item.targetAmount, 0),
  [wishlistItems]
);

// ✅ Memoize filtered lists
const filteredItems = useMemo(() => {
  // ... filtering logic
}, [wishlistItems, affordableItems, filterState]);

// ✅ Memoize callbacks
const handleEdit = useCallback((item: WishlistItem) => {
  // ... edit logic
}, []);
```

### Avoid Unnecessary Re-renders
```typescript
// ✅ Use React.memo for expensive components
const WishlistItemCard = memo(({ item, ...props }: Props) => {
  // ... component logic
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.item.id === nextProps.item.id &&
         prevProps.currentBalance === nextProps.currentBalance;
});

// ✅ Separate frequently updating state
// Don't put swipe state in main component state
// Use separate hook to avoid re-rendering everything
```

---

## 🔐 State Validation

### Input Validation
```typescript
const validateWishlistItem = (item: Partial<WishlistItem>): boolean => {
  if (!item.name || item.name.trim() === '') return false;
  if (!item.targetAmount || item.targetAmount <= 0) return false;
  if (!item.priority || !['high', 'medium', 'low'].includes(item.priority)) return false;
  return true;
};
```

### State Consistency Checks
```typescript
// Ensure state is consistent
useEffect(() => {
  // Check if selected item still exists in list
  if (selectedItem && !wishlistItems.find(i => i.id === selectedItem.id)) {
    setSelectedItem(null);
    setIsEditDialogOpen(false);
  }
}, [wishlistItems, selectedItem]);
```

---

## 🎨 State Type Definitions

```typescript
// WishlistItem type
interface WishlistItem {
  id: string;
  name: string;
  emoji?: string;
  targetAmount: number;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
  createdAt: number;
}

// Filter state type
type FilterState = {
  type: 'all' | 'affordable' | 'priority';
  value?: 'high' | 'medium' | 'low';
};

// Swipe state type
type SwipeState = {
  offset: number;
  isRevealed: boolean;
};

// Summary calculations type
interface SummaryCalculations {
  totalWishlist: number;
  shortage: number;
  isAffordable: boolean;
  progressPercentage: number;
}

// Item actions type
interface ItemActions {
  selectedItem: WishlistItem | null;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
  handleEdit: (item: WishlistItem) => void;
  handleDelete: (item: WishlistItem) => void;
  confirmDelete: () => void;
  handlePurchase: (item: WishlistItem) => Promise<void>;
}
```

---

**Status**: 🔄 State Management Complete
**Next**: Review PLATFORM_DIFFERENCES.md
