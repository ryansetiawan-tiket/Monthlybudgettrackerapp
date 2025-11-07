# 🛠️ Implementation Guide

## Overview

Step-by-step guide for implementing the Wishlist Simulation refactor.

---

## 📋 Pre-Implementation Checklist

- [x] Read `/planning/wishlist-simulation-refactor/README.md`
- [x] Read `/planning/wishlist-simulation-refactor/COMPONENT_SPECS.md`
- [ ] Review current `/components/WishlistSimulation.tsx`
- [ ] Backup current implementation (git commit)
- [ ] Create feature branch (optional)

---

## 🎯 Implementation Phases

### **Phase 1: Header Refactor** ⏱️ 30 min

#### Step 1.1: Remove Panic Elements
```typescript
// ❌ REMOVE THESE SECTIONS:

// 1. Health bar section
<div className="...">
  <div className="flex items-center justify-between">
    <span>Health Saldo</span>
    <span className="text-red-500">0%</span>
  </div>
  <Progress value={0} className="..." />
</div>

// 2. "Saldo tidak cukup!" message
<div className="flex items-center gap-2 text-red-500">
  <X className="size-5" />
  <span>Saldo tidak cukup!</span>
</div>

// 3. Separate "SISA SALDO SETELAH WISHLIST" card
<div className="...">
  <span className="text-neutral-400">SISA SALDO SETELAH WISHLIST</span>
  <span className="text-red-500 text-xl">-Rp 627.565,12</span>
</div>
```

#### Step 1.2: Create SummaryHeader Component
```bash
# Location: Inside WishlistSimulation.tsx (inline component) or separate file
```

```typescript
interface SummaryHeaderProps {
  currentBalance: number;
  totalWishlist: number;
  itemCount: number;
}

const SummaryHeader = ({ currentBalance, totalWishlist, itemCount }: SummaryHeaderProps) => {
  const shortage = totalWishlist - currentBalance;
  const isAffordable = currentBalance >= totalWishlist;
  const progressPercentage = Math.min(Math.round((currentBalance / totalWishlist) * 100), 100);

  return (
    <div className="bg-[rgba(38,38,38,0.3)] border border-neutral-800 rounded-lg p-4 space-y-3">
      {/* Balance Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="flex flex-col">
          <span className="text-neutral-400 text-xs mb-1">💰 Saldo Kantong</span>
          <span className="text-neutral-50 text-base font-semibold">
            {formatRupiah(currentBalance)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-neutral-400 text-xs mb-1">🎯 Total Wishlist</span>
          <span className="text-neutral-50 text-base font-semibold">
            {formatRupiah(totalWishlist)}
            <span className="text-neutral-500 text-sm ml-1">({itemCount} items)</span>
          </span>
        </div>
      </div>

      {/* Status Message */}
      {isAffordable ? (
        <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
          <span className="text-lg">✅</span>
          <div className="flex-1">
            <p className="text-sm text-emerald-400">
              Saldo Anda cukup untuk semua wishlist
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
          <span className="text-lg">⚠️</span>
          <div className="flex-1">
            <p className="text-sm text-amber-400">
              Anda perlu <span className="font-semibold">{formatRupiah(shortage)}</span> lagi untuk semua wishlist
            </p>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <Progress value={progressPercentage} className="h-2" />
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>{formatRupiah(currentBalance)}</span>
          <span className="font-semibold">{progressPercentage}%</span>
          <span>{formatRupiah(totalWishlist)}</span>
        </div>
      </div>
    </div>
  );
};
```

#### Step 1.3: Update Main Component
```typescript
// In WishlistSimulation main return:
return (
  <DialogOrDrawer>
    <DialogOrDrawerContent>
      <DialogOrDrawerHeader>
        <DialogOrDrawerTitle>Simulasi Wishlist - {pocketName}</DialogOrDrawerTitle>
      </DialogOrDrawerHeader>

      <div className="space-y-4">
        {/* ✅ NEW: Replace old header sections with SummaryHeader */}
        <SummaryHeader
          currentBalance={currentBalance}
          totalWishlist={totalWishlist}
          itemCount={wishlistItems.length}
        />

        {/* ... rest of content */}
      </div>
    </DialogOrDrawerContent>
  </DialogOrDrawer>
);
```

#### 🧪 Testing Phase 1
- [ ] Header shows correct balance and total
- [ ] Status message displays correctly for insufficient balance
- [ ] Status message displays correctly for sufficient balance
- [ ] Progress bar animates smoothly
- [ ] Progress percentage is accurate and capped at 100%

---

### **Phase 2: Interactive Filters** ⏱️ 45 min

#### Step 2.1: Add Filter State
```typescript
type FilterState = {
  type: 'all' | 'affordable' | 'priority';
  value?: 'high' | 'medium' | 'low';
};

const [filterState, setFilterState] = useState<FilterState>({ type: 'all' });
```

#### Step 2.2: Calculate Affordable Items
```typescript
const affordableItems = useMemo(() => {
  return wishlistItems.filter(item => currentBalance >= item.targetAmount);
}, [wishlistItems, currentBalance]);
```

#### Step 2.3: Create QuickInsightButton Component
```typescript
interface QuickInsightButtonProps {
  affordableCount: number;
  isActive: boolean;
  onClick: () => void;
}

const QuickInsightButton = ({ affordableCount, isActive, onClick }: QuickInsightButtonProps) => {
  if (affordableCount === 0) return null;

  return (
    <Button
      variant={isActive ? "default" : "outline"}
      className="w-full justify-start gap-2 transition-all"
      onClick={onClick}
    >
      <span className="text-base">💡</span>
      <span className="flex-1 text-left text-sm">
        Tampilkan {affordableCount} item yang bisa dibeli sekarang
      </span>
      {isActive && (
        <X className="size-4 ml-auto" />
      )}
    </Button>
  );
};
```

#### Step 2.4: Create PriorityTabs Component
```typescript
interface PriorityTabsProps {
  items: WishlistItem[];
  activeTab: string;
  onTabChange: (value: string) => void;
}

const PriorityTabs = ({ items, activeTab, onTabChange }: PriorityTabsProps) => {
  const counts = useMemo(() => ({
    all: items.length,
    high: items.filter(i => i.priority === 'high').length,
    medium: items.filter(i => i.priority === 'medium').length,
    low: items.filter(i => i.priority === 'low').length,
  }), [items]);

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-4 h-auto">
        <TabsTrigger value="all" className="text-xs sm:text-sm">
          Semua ({counts.all})
        </TabsTrigger>
        <TabsTrigger value="high" className="text-xs sm:text-sm">
          <span className="mr-1">⭐</span>
          High ({counts.high})
        </TabsTrigger>
        <TabsTrigger value="medium" className="text-xs sm:text-sm">
          <span className="mr-1">🟡</span>
          Med ({counts.medium})
        </TabsTrigger>
        <TabsTrigger value="low" className="text-xs sm:text-sm">
          <span className="mr-1">🔵</span>
          Low ({counts.low})
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
```

#### Step 2.5: Implement Filter Logic
```typescript
// Toggle affordable filter
const toggleAffordableFilter = () => {
  if (filterState.type === 'affordable') {
    setFilterState({ type: 'all' });
  } else {
    setFilterState({ type: 'affordable' });
  }
};

// Handle priority filter
const handlePriorityFilter = (value: string) => {
  if (value === 'all') {
    setFilterState({ type: 'all' });
  } else {
    setFilterState({ 
      type: 'priority', 
      value: value as 'high' | 'medium' | 'low' 
    });
  }
};

// Apply filters to list
const filteredItems = useMemo(() => {
  if (filterState.type === 'affordable') {
    return affordableItems;
  }
  
  if (filterState.type === 'priority' && filterState.value) {
    return wishlistItems.filter(item => item.priority === filterState.value);
  }
  
  return wishlistItems;
}, [wishlistItems, affordableItems, filterState]);
```

#### Step 2.6: Remove Old Static Cards
```typescript
// ❌ REMOVE these three cards:
<div className="grid grid-cols-3 gap-2">
  <div>⭐ High - 2 items</div>
  <div>🟡 Medium - 2 items</div>
  <div>🔵 Low - 0 items</div>
</div>

// ❌ REMOVE this insight card:
<div>💡 Bisa beli 3 item sekarang (prioritas tertinggi)</div>
```

#### Step 2.7: Update Main Component
```typescript
return (
  <DialogOrDrawer>
    <DialogOrDrawerContent>
      {/* ... header ... */}

      <div className="space-y-4">
        <SummaryHeader {...} />

        {/* ✅ NEW: Interactive Filters */}
        <div className="space-y-3">
          <QuickInsightButton
            affordableCount={affordableItems.length}
            isActive={filterState.type === 'affordable'}
            onClick={toggleAffordableFilter}
          />

          <PriorityTabs
            items={wishlistItems}
            activeTab={filterState.type === 'priority' ? filterState.value! : 'all'}
            onTabChange={handlePriorityFilter}
          />
        </div>

        {/* Items List */}
        <div className="space-y-2">
          <h3 className="text-sm text-neutral-400">
            Items Wishlist 
            {filterState.type !== 'all' && ` (${filteredItems.length} dari ${wishlistItems.length})`}
          </h3>
          
          {filteredItems.map(item => (
            <WishlistItemCard key={item.id} {...} />
          ))}
        </div>
      </div>
    </DialogOrDrawerContent>
  </DialogOrDrawer>
);
```

#### 🧪 Testing Phase 2
- [ ] Quick insight button appears when there are affordable items
- [ ] Clicking quick insight filters list to affordable items only
- [ ] Clicking again resets to show all items
- [ ] Priority tabs show correct counts
- [ ] Clicking priority tabs filters list correctly
- [ ] "Semua" tab resets filter
- [ ] Active tab is visually highlighted

---

### **Phase 3: Items List Declutter** ⏱️ 1 hour

#### Step 3.1: Create SmartCTA Component
```typescript
interface SmartCTAProps {
  item: WishlistItem;
  currentBalance: number;
  onPurchase: (item: WishlistItem) => void;
}

const SmartCTA = ({ item, currentBalance, onPurchase }: SmartCTAProps) => {
  const isAffordable = currentBalance >= item.targetAmount;
  const shortage = item.targetAmount - currentBalance;

  if (isAffordable) {
    return (
      <Button
        className="w-full"
        onClick={() => onPurchase(item)}
      >
        <ShoppingCart className="size-4 mr-2" />
        Beli Sekarang
      </Button>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-full">
            <Button
              className="w-full"
              variant="outline"
              disabled
            >
              <ShoppingCart className="size-4 mr-2" />
              Beli Sekarang
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Kurang {formatRupiah(shortage)} untuk item ini</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
```

#### Step 3.2: Create PriorityBadge Component
```typescript
const PriorityBadge = ({ priority }: { priority: 'high' | 'medium' | 'low' }) => {
  const config = {
    high: { 
      icon: '⭐', 
      label: 'High', 
      className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
    },
    medium: { 
      icon: '🟡', 
      label: 'Medium', 
      className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' 
    },
    low: { 
      icon: '🔵', 
      label: 'Low', 
      className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
    },
  };

  const { icon, label, className } = config[priority];

  return (
    <Badge variant="outline" className={`${className} text-xs`}>
      <span className="mr-1">{icon}</span>
      {label}
    </Badge>
  );
};
```

#### Step 3.3: Refactor WishlistItemCard (Desktop)
```typescript
// Assuming existing card structure, modify to:

const WishlistItemCard = ({ item, currentBalance, onEdit, onDelete, onPurchase }: Props) => {
  return (
    <div className="relative group bg-[rgba(38,38,38,0.3)] border border-neutral-800 rounded-lg p-4 transition-all hover:border-neutral-700">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {item.emoji && <span className="text-2xl">{item.emoji}</span>}
          <h4 className="text-neutral-50 font-medium">{item.name}</h4>
        </div>
        
        <div className="flex items-center gap-2">
          <PriorityBadge priority={item.priority} />
          
          {/* Desktop: Hover reveal actions */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="size-8"
              onClick={() => onEdit(item)}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-8"
              onClick={() => onDelete(item)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Amount */}
      <p className="text-xl text-neutral-50 mb-3">
        {formatRupiah(item.targetAmount)}
      </p>

      {/* ❌ REMOVE: "Bisa dibeli sekarang" text */}
      {/* ❌ REMOVE: "Sisa saldo: Rp X" text */}

      {/* ✅ NEW: Smart CTA */}
      <SmartCTA
        item={item}
        currentBalance={currentBalance}
        onPurchase={onPurchase}
      />
    </div>
  );
};
```

#### 🧪 Testing Phase 3
- [ ] "Bisa dibeli sekarang" text removed
- [ ] "Sisa saldo" text removed
- [ ] CTA button is enabled when affordable
- [ ] CTA button is disabled when not affordable
- [ ] Tooltip appears on hover for disabled button
- [ ] Tooltip shows correct shortage amount
- [ ] Purchase action executes correctly

---

### **Phase 4: Platform-Specific Actions** ⏱️ 1.5 hours

#### Step 4.1: Setup Platform Detection
```typescript
import { useMediaQuery } from "./ui/use-mobile";

// In main component:
const isMobile = useMediaQuery("(max-width: 768px)");
```

#### Step 4.2: Desktop Implementation (Already done in Phase 3)
```typescript
// Already implemented with:
// - `group` class on card
// - `opacity-0 group-hover:opacity-100` on actions
// No additional work needed
```

#### Step 4.3: Mobile Swipe Implementation

##### Option A: Using react-swipeable (Recommended)
```bash
# Install (user will need to do this if not already installed)
# import { useSwipeable } from 'react-swipeable'
```

```typescript
interface SwipeableCardProps {
  item: WishlistItem;
  currentBalance: number;
  onEdit: (item: WishlistItem) => void;
  onDelete: (item: WishlistItem) => void;
  onPurchase: (item: WishlistItem) => void;
}

const SwipeableWishlistCard = (props: SwipeableCardProps) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (eventData.dir === 'Left') {
        const offset = Math.max(Math.min(eventData.deltaX, 0), -100);
        setSwipeOffset(offset);
      }
    },
    onSwipedLeft: () => {
      if (Math.abs(swipeOffset) > 50) {
        setIsRevealed(true);
        setSwipeOffset(-100);
      } else {
        setSwipeOffset(0);
      }
    },
    onSwipedRight: () => {
      setIsRevealed(false);
      setSwipeOffset(0);
    },
    trackMouse: false,
    trackTouch: true,
  });

  return (
    <div className="relative overflow-hidden bg-[rgba(38,38,38,0.3)] border border-neutral-800 rounded-lg">
      {/* Main Content (Swipeable) */}
      <div
        {...handlers}
        className="relative transition-transform duration-200"
        style={{ transform: `translateX(${swipeOffset}px)` }}
      >
        <div className="p-4">
          {/* Same content as desktop but without hover actions */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {props.item.emoji && <span className="text-2xl">{props.item.emoji}</span>}
              <h4 className="text-neutral-50 font-medium">{props.item.name}</h4>
            </div>
            <PriorityBadge priority={props.item.priority} />
          </div>

          <p className="text-xl text-neutral-50 mb-3">
            {formatRupiah(props.item.targetAmount)}
          </p>

          <SmartCTA
            item={props.item}
            currentBalance={props.currentBalance}
            onPurchase={props.onPurchase}
          />
        </div>
      </div>

      {/* Swipe Reveal Actions (Background) */}
      <div className="absolute inset-y-0 right-0 w-28 flex items-center justify-end gap-2 pr-2 bg-neutral-900/95">
        <Button
          size="icon"
          variant="ghost"
          className="size-10"
          onClick={() => {
            props.onEdit(props.item);
            setIsRevealed(false);
            setSwipeOffset(0);
          }}
        >
          <Pencil className="size-5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="size-10"
          onClick={() => {
            props.onDelete(props.item);
            setIsRevealed(false);
            setSwipeOffset(0);
          }}
        >
          <Trash2 className="size-5" />
        </Button>
      </div>
    </div>
  );
};
```

##### Option B: Custom Touch Handlers (If react-swipeable not available)
```typescript
const [swipeOffset, setSwipeOffset] = useState(0);
const touchStartX = useRef(0);
const touchStartTime = useRef(0);

const handleTouchStart = (e: React.TouchEvent) => {
  touchStartX.current = e.touches[0].clientX;
  touchStartTime.current = Date.now();
};

const handleTouchMove = (e: React.TouchEvent) => {
  const currentX = e.touches[0].clientX;
  const diff = currentX - touchStartX.current;
  
  // Only allow left swipe, limit to -100px
  if (diff < 0) {
    setSwipeOffset(Math.max(diff, -100));
  }
};

const handleTouchEnd = () => {
  const swipeDuration = Date.now() - touchStartTime.current;
  const swipeVelocity = Math.abs(swipeOffset) / swipeDuration;

  // Snap to revealed if swiped far enough or fast enough
  if (Math.abs(swipeOffset) > 50 || swipeVelocity > 0.3) {
    setSwipeOffset(-100);
  } else {
    setSwipeOffset(0);
  }
};

// Apply to main content div:
<div
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
  className="relative transition-transform duration-200"
  style={{ transform: `translateX(${swipeOffset}px)` }}
>
  {/* ... content ... */}
</div>
```

#### Step 4.4: Conditional Rendering
```typescript
// In main component:
return (
  <div className="space-y-2">
    {filteredItems.map(item => (
      isMobile ? (
        <SwipeableWishlistCard
          key={item.id}
          item={item}
          currentBalance={currentBalance}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPurchase={handlePurchase}
        />
      ) : (
        <WishlistItemCard
          key={item.id}
          item={item}
          currentBalance={currentBalance}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPurchase={handlePurchase}
        />
      )
    ))}
  </div>
);
```

#### 🧪 Testing Phase 4
- [ ] Desktop: Icons hidden by default
- [ ] Desktop: Icons fade in on card hover
- [ ] Desktop: Icons clickable and trigger correct actions
- [ ] Mobile: Swipe left reveals actions
- [ ] Mobile: Swipe right hides actions
- [ ] Mobile: Actions trigger correctly
- [ ] Mobile: Swipe animation is smooth
- [ ] No layout shift or jank

---

### **Phase 5: Polish & Testing** ⏱️ 30 min

#### Step 5.1: Add Empty State
```typescript
{filteredItems.length === 0 && (
  <div className="text-center py-8 text-neutral-400">
    <p className="text-sm">
      {filterState.type === 'affordable' 
        ? 'Tidak ada item yang bisa dibeli dengan saldo saat ini'
        : 'Tidak ada item wishlist'
      }
    </p>
  </div>
)}
```

#### Step 5.2: Add Loading State (if needed)
```typescript
{isLoading ? (
  <div className="space-y-2">
    {[1, 2, 3].map(i => (
      <div key={i} className="h-32 bg-neutral-800/30 rounded-lg animate-pulse" />
    ))}
  </div>
) : (
  // ... actual content
)}
```

#### Step 5.3: Accessibility Polish
```typescript
// Add ARIA labels
<Button aria-label="Edit wishlist item" onClick={...}>
  <Pencil className="size-4" />
</Button>

<Button aria-label="Delete wishlist item" onClick={...}>
  <Trash2 className="size-4" />
</Button>

// Add keyboard navigation for tabs
<Tabs ... onKeyDown={handleKeyDown}>
```

#### Step 5.4: Animation Polish
```typescript
// Add smooth transitions
className="transition-all duration-200 ease-in-out"

// Add stagger animation for list items
className="animate-in fade-in-50 slide-in-from-bottom-2"
style={{ animationDelay: `${index * 50}ms` }}
```

#### 🧪 Final Testing Checklist
- [ ] All panic elements removed
- [ ] Summary header displays correctly
- [ ] Progress bar accurate and smooth
- [ ] Quick insight button works
- [ ] Priority tabs filter correctly
- [ ] Items list decluttered
- [ ] CTA buttons smart (enabled/disabled)
- [ ] Tooltips show on disabled CTAs
- [ ] Desktop: Hover actions work
- [ ] Mobile: Swipe actions work
- [ ] Empty states display
- [ ] Loading states (if applicable)
- [ ] No console errors
- [ ] No layout shift
- [ ] Smooth animations
- [ ] Responsive on all screen sizes

---

## 📦 Required Imports Checklist

```typescript
// ✅ Add these imports if not already present:
import { Progress } from "./ui/progress";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "./ui/tooltip";
import { ShoppingCart, Pencil, Trash2, X } from "lucide-react";
import { useMediaQuery } from "./ui/use-mobile";
import { useMemo } from "react"; // if not already imported
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Progress bar not animating
**Solution**: Ensure `Progress` component has `className` prop for styling

### Issue 2: Tooltip not showing on mobile
**Solution**: Add explicit `TooltipProvider` wrapper and handle touch events

### Issue 3: Swipe gesture conflicts with scroll
**Solution**: Only capture horizontal swipe, allow vertical scroll

### Issue 4: Icons not fading on hover
**Solution**: Ensure parent has `group` class and children have `group-hover:opacity-100`

### Issue 5: Filter not updating list
**Solution**: Check `useMemo` dependencies for `filteredItems`

---

## 🚀 Deployment Checklist

- [ ] All phases completed
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Tested on desktop
- [ ] Tested on mobile (real device if possible)
- [ ] Tested on tablet
- [ ] Performance acceptable (no jank)
- [ ] Git commit with descriptive message
- [ ] Update documentation (if needed)

---

## 📝 Commit Message Template

```
feat(wishlist): Major UX refactor - from panic to constructive

- Remove panic elements (Health 0%, red warnings)
- Add centralized summary header with progress bar
- Implement interactive filters (quick insight + priority tabs)
- Declutter items list (remove redundant text)
- Add smart CTA buttons with affordability logic
- Implement platform-specific actions (hover/swipe)
- Improve overall UX from negative to constructive

Breaking changes: None (internal refactor only)
```

---

**Status**: 📋 Implementation Guide Complete
**Next**: Start Phase 1 Implementation
