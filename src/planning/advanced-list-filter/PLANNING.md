# 🎛️ Advanced List Filter - Planning Document

**Status:** 📋 Planning Phase  
**Priority:** High  
**Estimated Complexity:** Medium  

---

## 📋 Overview

Menambahkan fitur **Filter Lanjutan** yang powerful ke Daftar Transaksi (ExpenseList & IncomeList) tanpa menambah clutter pada UI. Filter ini akan memungkinkan pengguna untuk:
- Filter berdasarkan **Kategori** (multi-select)
- Filter berdasarkan **Sumber Dana (Kantong)** (multi-select)

---

## 🎯 Goals

### Primary Goals
1. ✅ **Minimal UI Clutter** - Hanya tambahkan 1 tombol ikon di toolbar
2. ✅ **Powerful Filtering** - Support multi-select untuk Kategori & Kantong
3. ✅ **Intuitive UX** - Drawer/Modal yang clean dan mudah digunakan
4. ✅ **Non-Invasive** - JANGAN sentuh logic "☰ Pilih" (Bulk Action) yang sudah ada

### Secondary Goals
- Konsisten dengan design pattern yang sudah ada (Search, Sort, Breakdown)
- Responsive: Drawer di mobile, Modal/Popover di desktop
- State persistence: Filter tetap aktif sampai user reset

---

## 🔍 Current State Analysis

### Existing Toolbar (ExpenseList.tsx ~ line 2054)
```tsx
<div className="flex items-center gap-2">
  {/* Search Bar (dengan autocomplete) */}
  <div className="relative flex-1">
    <Search className="..." />
    <Input placeholder="Cari nama, kategori, hari, atau tanggal..." />
    {/* Suggestions dropdown */}
  </div>
  
  {/* Sort Button (Expense tab only) */}
  {activeTab === 'expense' && (
    <button onClick={toggleSortOrder} className="h-9 w-9 ...">
      <ArrowUpDown className="size-4" />
    </button>
  )}
</div>
```

**Current Layout:**
```
[ 🔍 Cari nama, kategori, hari... ] [ ↑↓ ]
```

### Existing Filter Systems
1. **Search Filter** - Text-based search (nama, kategori, tanggal)
2. **Category Badge Filter** - Click pie chart slice → filter by 1 category
3. **Sort** - Asc/Desc by date

**Gap:** No way to filter by **multiple categories** or **multiple pockets** at once.

---

## 🎨 Proposed UI Design

### 1. New Toolbar Layout

**Target Layout:**
```
[ 🔍 Cari nama, kategori, hari... ] [ ↑↓ ] [ 🎛️ ]
                                     Sort   Filter
```

**Implementation:**
- Add 1 new button after Sort button
- Icon: `<SlidersHorizontal>` from lucide-react (🎛️ Filter icon)
- Size: `h-9 w-9` (same as Sort button)
- Style: Same hover/active states as Sort button
- Visibility: Show on BOTH `expense` and `income` tabs

---

### 2. Filter Drawer/Modal Design

#### A. Trigger Behavior
- **Click Filter Icon (🎛️)** → Opens Drawer (mobile) atau Modal (desktop)

#### B. Content Structure

```
╔══════════════════════════════════════╗
║   🎛️ Filter Lanjutan                ║
╠══════════════════════════════════════╣
║                                      ║
║  📂 Filter berdasarkan Kategori      ║
║  ┌────────────────────────────────┐  ║
║  │ [x] 🎮 Game                    │  ║
║  │ [x] 🍔 Makanan                 │  ║
║  │ [ ] 🚗 Transportasi            │  ║
║  │ [ ] 💊 Kesehatan               │  ║
║  │ ... (all categories)           │  ║
║  └────────────────────────────────┘  ║
║                                      ║
║  💰 Filter berdasarkan Sumber Dana   ║
║  ┌────────────────────────────────┐  ║
║  │ [x] 💵 Sehari-hari             │  ║
║  │ [ ] 🧊 Uang Dingin             │  ║
║  │ [ ] 🎯 Investasi               │  ║
║  │ ... (all active pockets)       │  ║
║  └────────────────────────────────┘  ║
║                                      ║
║  ┌──────────────┐  ┌──────────────┐  ║
║  │ ✅ Terapkan  │  │ ❌ Reset     │  ║
║  └──────────────┘  └──────────────┘  ║
╚══════════════════════════════════════╝
```

#### C. Component Breakdown

**For Mobile (Drawer):**
```tsx
<Drawer open={isFilterOpen} onOpenChange={setIsFilterOpen}>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>🎛️ Filter Lanjutan</DrawerTitle>
    </DrawerHeader>
    
    {/* Filter Sections */}
    <div className="px-4 pb-6 space-y-6">
      {/* Section 1: Category Filter */}
      <CategoryFilterSection 
        selectedCategories={selectedCategoryFilters}
        onToggle={toggleCategoryFilter}
      />
      
      {/* Section 2: Pocket Filter (Expense only) */}
      {activeTab === 'expense' && (
        <PocketFilterSection 
          selectedPockets={selectedPocketFilters}
          onToggle={togglePocketFilter}
        />
      )}
      
      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={applyFilters} className="flex-1">
          ✅ Terapkan Filter
        </Button>
        <Button onClick={resetFilters} variant="outline" className="flex-1">
          ❌ Reset
        </Button>
      </div>
    </div>
  </DrawerContent>
</Drawer>
```

**For Desktop (Dialog):**
```tsx
<Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>🎛️ Filter Lanjutan</DialogTitle>
    </DialogHeader>
    {/* Same content as drawer */}
  </DialogContent>
</Dialog>
```

---

## 🔧 Implementation Plan

### Phase 1: State Management & UI Entry Point

#### 1.1 Add New State Variables (ExpenseList.tsx)
```tsx
// Filter state
const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
const [selectedCategoryFilters, setSelectedCategoryFilters] = useState<Set<string>>(new Set());
const [selectedPocketFilters, setSelectedPocketFilters] = useState<Set<string>>(new Set());
const [activeFilters, setActiveFilters] = useState<{
  categories: Set<string>;
  pockets: Set<string>;
}>({
  categories: new Set(),
  pockets: new Set(),
});
```

#### 1.2 Add Filter Button to Toolbar
**Location:** After Sort button in toolbar (line ~2054)

```tsx
{/* NEW: Advanced Filter Button */}
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        onClick={() => setIsFilterDrawerOpen(true)}
        className={`h-9 w-9 flex items-center justify-center rounded-lg transition-colors flex-shrink-0 ${
          (activeFilters.categories.size > 0 || activeFilters.pockets.size > 0)
            ? 'bg-blue-500/20 text-blue-600 hover:bg-blue-500/30'
            : 'hover:bg-[rgba(38,38,38,0.3)]'
        }`}
        title="Filter Lanjutan"
      >
        <SlidersHorizontal className="size-4" />
        {/* Active filter badge */}
        {(activeFilters.categories.size > 0 || activeFilters.pockets.size > 0) && (
          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] rounded-full size-4 flex items-center justify-center">
            {activeFilters.categories.size + activeFilters.pockets.size}
          </span>
        )}
      </button>
    </TooltipTrigger>
    <TooltipContent>Filter Lanjutan</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

### Phase 2: Filter Drawer/Modal Component

#### 2.1 Create AdvancedFilterDrawer Component
**New File:** `/components/AdvancedFilterDrawer.tsx`

```tsx
interface AdvancedFilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  
  // Tab context
  activeTab: 'expense' | 'income';
  
  // Category filter
  selectedCategories: Set<string>;
  onCategoryToggle: (categoryId: string) => void;
  
  // Pocket filter (expense only)
  selectedPockets: Set<string>;
  onPocketToggle: (pocketId: string) => void;
  
  // Actions
  onApply: () => void;
  onReset: () => void;
  
  // Data
  allCategories: Category[];
  allPockets: Pocket[];
}

export function AdvancedFilterDrawer({ ... }: AdvancedFilterDrawerProps) {
  const isMobile = useIsMobile();
  
  const content = (
    <div className="px-4 pb-6 space-y-6">
      {/* Category Filter Section */}
      <CategoryFilterSection ... />
      
      {/* Pocket Filter Section (Expense only) */}
      {activeTab === 'expense' && <PocketFilterSection ... />}
      
      {/* Action Buttons */}
      <ActionButtons ... />
    </div>
  );
  
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>🎛️ Filter Lanjutan</DrawerTitle>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    );
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>🎛️ Filter Lanjutan</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
```

#### 2.2 CategoryFilterSection Component
```tsx
function CategoryFilterSection({
  selectedCategories,
  onToggle,
  allCategories,
  settings
}: {
  selectedCategories: Set<string>;
  onToggle: (id: string) => void;
  allCategories: Category[];
  settings: CategorySettings;
}) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">📂 Filter berdasarkan Kategori</Label>
      <div className="space-y-2 max-h-[240px] overflow-y-auto border rounded-lg p-3">
        {allCategories.map(category => (
          <div 
            key={category.id}
            className="flex items-center gap-2 hover:bg-accent/50 p-2 rounded cursor-pointer transition-colors"
            onClick={() => onToggle(category.id)}
          >
            <Checkbox
              checked={selectedCategories.has(category.id)}
              onCheckedChange={() => onToggle(category.id)}
            />
            <span className="text-lg">{getCategoryEmoji(category.id, settings)}</span>
            <span className="text-sm">{getCategoryLabel(category.id, settings)}</span>
          </div>
        ))}
      </div>
      
      {selectedCategories.size > 0 && (
        <p className="text-xs text-muted-foreground">
          ✓ {selectedCategories.size} kategori dipilih
        </p>
      )}
    </div>
  );
}
```

#### 2.3 PocketFilterSection Component
```tsx
function PocketFilterSection({
  selectedPockets,
  onToggle,
  allPockets
}: {
  selectedPockets: Set<string>;
  onToggle: (id: string) => void;
  allPockets: Pocket[];
}) {
  const activePockets = allPockets.filter(p => p.isActive !== false);
  
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">💰 Filter berdasarkan Sumber Dana</Label>
      <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-lg p-3">
        {activePockets.map(pocket => (
          <div 
            key={pocket.id}
            className="flex items-center gap-2 hover:bg-accent/50 p-2 rounded cursor-pointer transition-colors"
            onClick={() => onToggle(pocket.id)}
          >
            <Checkbox
              checked={selectedPockets.has(pocket.id)}
              onCheckedChange={() => onToggle(pocket.id)}
            />
            <span className="text-lg">{pocket.emoji}</span>
            <span className="text-sm">{pocket.name}</span>
            <span className="text-xs text-muted-foreground ml-auto">
              {formatCurrency(pocket.balance)}
            </span>
          </div>
        ))}
      </div>
      
      {selectedPockets.size > 0 && (
        <p className="text-xs text-muted-foreground">
          ✓ {selectedPockets.size} kantong dipilih
        </p>
      )}
    </div>
  );
}
```

---

### Phase 3: Filter Logic Implementation

#### 3.1 Toggle Handlers
```tsx
// In ExpenseList.tsx

const toggleCategoryFilter = (categoryId: string) => {
  setSelectedCategoryFilters(prev => {
    const newSet = new Set(prev);
    if (newSet.has(categoryId)) {
      newSet.delete(categoryId);
    } else {
      newSet.add(categoryId);
    }
    return newSet;
  });
};

const togglePocketFilter = (pocketId: string) => {
  setSelectedPocketFilters(prev => {
    const newSet = new Set(prev);
    if (newSet.has(pocketId)) {
      newSet.delete(pocketId);
    } else {
      newSet.add(pocketId);
    }
    return newSet;
  });
};
```

#### 3.2 Apply & Reset Handlers
```tsx
const applyFilters = () => {
  // Copy temporary selections to active filters
  setActiveFilters({
    categories: new Set(selectedCategoryFilters),
    pockets: new Set(selectedPocketFilters),
  });
  
  // Close drawer
  setIsFilterDrawerOpen(false);
  
  // Show success toast
  const filterCount = selectedCategoryFilters.size + selectedPocketFilters.size;
  toast.success(`✅ ${filterCount} filter diterapkan`);
};

const resetFilters = () => {
  // Clear all selections
  setSelectedCategoryFilters(new Set());
  setSelectedPocketFilters(new Set());
  setActiveFilters({
    categories: new Set(),
    pockets: new Set(),
  });
  
  // Clear existing category filter badge
  setActiveCategoryFilter(new Set());
  
  // Close drawer
  setIsFilterDrawerOpen(false);
  
  // Show toast
  toast.info('🔄 Filter direset');
};
```

#### 3.3 Update Filtering Logic (useMemo)
**Current:**
```tsx
const filteredAndSortedExpenses = useMemo(() => {
  let filtered = expenses;
  
  // Search filter
  if (searchQuery) { ... }
  
  // Category badge filter (single category)
  if (activeCategoryFilter.size > 0) { ... }
  
  // Sort
  return filtered.sort(...);
}, [expenses, searchQuery, activeCategoryFilter, sortOrder]);
```

**New (Integrated):**
```tsx
const filteredAndSortedExpenses = useMemo(() => {
  let filtered = expenses;
  
  // 1. Search filter
  if (searchQuery) {
    const searchLower = searchQuery.toLowerCase();
    filtered = filtered.filter(e => 
      e.name?.toLowerCase().includes(searchLower) ||
      formatDateSafe(e.date, 'EEEE, dd MMMM yyyy').toLowerCase().includes(searchLower) ||
      getCategoryLabel(e.category as any, settings).toLowerCase().includes(searchLower)
    );
  }
  
  // 2. Advanced Category Filter (multi-select)
  if (activeFilters.categories.size > 0) {
    filtered = filtered.filter(e => 
      activeFilters.categories.has(e.category)
    );
  }
  
  // 3. Advanced Pocket Filter (multi-select, expense only)
  if (activeFilters.pockets.size > 0) {
    filtered = filtered.filter(e => 
      activeFilters.pockets.has(e.pocketId)
    );
  }
  
  // 4. Legacy category badge filter (backward compat)
  // NOTE: This is for pie chart click filter
  if (activeCategoryFilter.size > 0 && activeFilters.categories.size === 0) {
    filtered = filtered.filter(e => 
      activeCategoryFilter.has(e.category as any)
    );
  }
  
  // 5. Sort
  return filtered.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });
}, [expenses, searchQuery, activeFilters, activeCategoryFilter, sortOrder, settings]);
```

**Logic Notes:**
- Advanced filters take priority over legacy badge filter
- If advanced category filter active → ignore pie chart badge filter
- All filters work in AND mode (must match ALL active filters)

---

### Phase 4: Integration with Existing Features

#### 4.1 Interaction with Category Badge Filter
**Current Behavior:** Click pie chart slice → filter by 1 category

**New Behavior:**
- Keep existing badge filter as quick-filter
- When advanced filter is active → badge filter is disabled
- Show visual indicator when advanced filter overrides badge filter

#### 4.2 Interaction with Search
- Search filter works **in addition** to advanced filters
- Search filters the **already filtered** list
- Clear search does NOT clear advanced filters

#### 4.3 Visual Indicators
```tsx
{/* Show active filter count on filter button */}
{(activeFilters.categories.size > 0 || activeFilters.pockets.size > 0) && (
  <Badge className="ml-2 bg-blue-600">
    {activeFilters.categories.size + activeFilters.pockets.size}
  </Badge>
)}

{/* Show active filter chips below toolbar */}
{(activeFilters.categories.size > 0 || activeFilters.pockets.size > 0) && (
  <div className="flex flex-wrap gap-2 mt-2">
    {Array.from(activeFilters.categories).map(catId => (
      <Badge key={catId} variant="secondary" className="gap-1">
        {getCategoryEmoji(catId, settings)} {getCategoryLabel(catId, settings)}
        <X 
          className="size-3 cursor-pointer" 
          onClick={() => {
            const newFilters = new Set(activeFilters.categories);
            newFilters.delete(catId);
            setActiveFilters(prev => ({ ...prev, categories: newFilters }));
          }}
        />
      </Badge>
    ))}
    
    {Array.from(activeFilters.pockets).map(pocketId => {
      const pocket = pockets.find(p => p.id === pocketId);
      return (
        <Badge key={pocketId} variant="secondary" className="gap-1">
          {pocket?.emoji} {pocket?.name}
          <X 
            className="size-3 cursor-pointer" 
            onClick={() => {
              const newFilters = new Set(activeFilters.pockets);
              newFilters.delete(pocketId);
              setActiveFilters(prev => ({ ...prev, pockets: newFilters }));
            }}
          />
        </Badge>
      );
    })}
    
    <Button 
      size="sm" 
      variant="ghost" 
      onClick={resetFilters}
      className="h-6 text-xs"
    >
      ❌ Reset Semua
    </Button>
  </div>
)}
```

---

## 📝 Implementation Checklist

### Phase 1: UI Entry Point ✅
- [ ] Import `SlidersHorizontal` icon from lucide-react
- [ ] Add filter state variables
- [ ] Add filter button to toolbar (after Sort button)
- [ ] Add active filter badge to button
- [ ] Test button click → open drawer

### Phase 2: Drawer Component ✅
- [ ] Create `/components/AdvancedFilterDrawer.tsx`
- [ ] Implement mobile Drawer version
- [ ] Implement desktop Dialog version
- [ ] Create CategoryFilterSection sub-component
- [ ] Create PocketFilterSection sub-component
- [ ] Add Apply & Reset buttons
- [ ] Test opening/closing

### Phase 3: Filter Logic ✅
- [ ] Implement `toggleCategoryFilter()`
- [ ] Implement `togglePocketFilter()`
- [ ] Implement `applyFilters()`
- [ ] Implement `resetFilters()`
- [ ] Update `filteredAndSortedExpenses` useMemo
- [ ] Test filter combinations

### Phase 4: Integration ✅
- [ ] Test interaction with Search
- [ ] Test interaction with Category Badge filter
- [ ] Test interaction with Sort
- [ ] Add active filter chips below toolbar
- [ ] Add "Reset Semua" quick button
- [ ] Test on mobile & desktop

### Phase 5: Polish ✅
- [ ] Add loading states if needed
- [ ] Add empty states ("Tidak ada kategori")
- [ ] Ensure accessibility (DrawerTitle, DialogTitle)
- [ ] Add toast notifications
- [ ] Test with real data
- [ ] Update documentation

---

## 🎨 Design Tokens

### Colors
- **Active Filter Indicator:** `bg-blue-500/20 text-blue-600`
- **Filter Badge:** `bg-blue-600 text-white`
- **Hover States:** `hover:bg-accent/50`

### Spacing
- **Button Size:** `h-9 w-9` (consistent with Sort button)
- **Section Gap:** `space-y-6`
- **Filter Item Gap:** `gap-2`
- **Max Height Scrollable:** `max-h-[240px]` (categories), `max-h-[200px]` (pockets)

### Icons
- **Filter Button:** `SlidersHorizontal` (🎛️)
- **Category Section:** 📂
- **Pocket Section:** 💰
- **Apply Button:** ✅
- **Reset Button:** ❌

---

## 🚫 What NOT to Touch

### ❌ DO NOT Modify These:
1. **Bulk Action Button ("☰ Pilih")** - Completely separate feature
2. **Existing Category Badge Filter Logic** - Keep for backward compatibility
3. **Search Bar Component** - Already working perfectly
4. **Sort Button Logic** - Independent feature

### ✅ Safe to Integrate With:
1. **filteredAndSortedExpenses useMemo** - Add filter logic here
2. **Toolbar Layout** - Add 1 button after Sort
3. **State Management** - Add new filter state variables

---

## 🧪 Testing Scenarios

### Scenario 1: Basic Category Filter
1. Click Filter button (🎛️)
2. Select "🎮 Game" and "🍔 Makanan"
3. Click "✅ Terapkan"
4. **Expected:** List shows only Game & Makanan expenses

### Scenario 2: Pocket Filter (Expense only)
1. Click Filter button
2. Select "💵 Sehari-hari" pocket
3. Click "✅ Terapkan"
4. **Expected:** List shows only expenses from Sehari-hari pocket

### Scenario 3: Combined Filters
1. Select categories: "🎮 Game", "🍔 Makanan"
2. Select pockets: "💵 Sehari-hari"
3. **Expected:** List shows Game & Makanan expenses from Sehari-hari pocket only

### Scenario 4: Filter + Search
1. Apply category filter: "🎮 Game"
2. Type in search: "ps5"
3. **Expected:** List shows only Game expenses containing "ps5"

### Scenario 5: Reset Filters
1. Apply multiple filters
2. Click "❌ Reset"
3. **Expected:** All filters cleared, full list shown

### Scenario 6: Active Filter Chips
1. Apply filters
2. Click X on a filter chip
3. **Expected:** That specific filter removed, others remain

### Scenario 7: Income Tab
1. Switch to Income tab
2. Click Filter button
3. **Expected:** Only Category filter shown (no Pocket filter for income)

---

## 📚 Related Files

### Files to Modify
1. **`/components/ExpenseList.tsx`** - Add filter button, drawer integration, filter logic
2. **NEW: `/components/AdvancedFilterDrawer.tsx`** - Main filter drawer component

### Files to Reference
1. **`/components/CategoryBreakdown.tsx`** - Category rendering patterns
2. **`/components/ManagePocketsDialog.tsx`** - Pocket list patterns
3. **`/components/BulkEditCategoryDialog.tsx`** - Multi-select checkbox patterns
4. **`/utils/categoryManager.ts`** - Category utilities
5. **`/hooks/usePockets.ts`** - Pocket data access

---

## 🎯 Success Criteria

### Must Have ✅
- [ ] Filter button appears in toolbar
- [ ] Drawer/Modal opens on click
- [ ] Multi-select works for categories
- [ ] Multi-select works for pockets (expense only)
- [ ] Apply filter updates list correctly
- [ ] Reset clears all filters
- [ ] Visual indicator shows active filters

### Nice to Have 🌟
- [ ] Active filter chips with individual remove
- [ ] Quick "Reset Semua" button
- [ ] Filter count badge on button
- [ ] Smooth animations
- [ ] Empty state messages

### Must NOT Break ❌
- [ ] Search functionality
- [ ] Sort functionality
- [ ] Bulk action ("☰ Pilih") button
- [ ] Category badge filter (pie chart click)
- [ ] Mobile responsiveness

---

## 📖 Notes

### Why Multi-Select?
- Users often want to see expenses from multiple categories at once
- Example: "Show all entertainment (Game + Movies + Subscriptions)"
- More flexible than single-select pie chart filter

### Why Separate "Terapkan" Button?
- Prevents accidental filtering while selecting
- Allows users to preview selections before applying
- Common pattern in e-commerce filter drawers

### Mobile vs Desktop
- **Mobile:** Full-screen drawer (better for touch)
- **Desktop:** Modal dialog (more compact, less intrusive)

---

**Ready for Implementation!** 🚀

Next Steps:
1. Create AdvancedFilterDrawer component
2. Add filter button to toolbar
3. Implement filter logic
4. Test all scenarios
5. Polish & document
