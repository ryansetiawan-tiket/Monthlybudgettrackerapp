# 🧩 Component Specifications

## Overview

This document provides detailed component-level specifications for the WishlistSimulation refactor.

---

## 🏗️ Component Architecture

```
WishlistSimulation (Main Container)
├── SummaryHeader (NEW)
│   ├── BalanceInfo
│   ├── StatusMessage
│   └── ProgressBar
│
├── InteractiveFilters (REFACTORED)
│   ├── QuickInsightButton (NEW)
│   └── PriorityTabs (NEW - replaces static cards)
│
├── WishlistItemsList (REFACTORED)
│   └── WishlistItemCard (REFACTORED)
│       ├── ItemInfo
│       ├── SmartCTA (NEW - with affordability logic)
│       └── PlatformActions (NEW - hover/swipe)
│
└── [Existing] AddItemButton
```

---

## 1️⃣ SummaryHeader Component

### Props
```typescript
interface SummaryHeaderProps {
  currentBalance: number;
  totalWishlist: number;
  itemCount: number;
}
```

### Structure
```tsx
<div className="bg-[rgba(38,38,38,0.3)] border border-neutral-800 rounded-lg p-4 space-y-3">
  {/* Balance Info */}
  <div className="flex justify-between text-sm">
    <div>
      <span className="text-neutral-400">💰 Saldo Kantong:</span>
      <span className="ml-2 text-neutral-50">{formatRupiah(currentBalance)}</span>
    </div>
    <div>
      <span className="text-neutral-400">🎯 Total Wishlist:</span>
      <span className="ml-2 text-neutral-50">{formatRupiah(totalWishlist)}</span>
      <span className="text-neutral-500 ml-1">({itemCount} items)</span>
    </div>
  </div>

  {/* Status Message */}
  <StatusMessage 
    currentBalance={currentBalance}
    totalWishlist={totalWishlist}
  />

  {/* Progress Bar */}
  <div className="space-y-1">
    <Progress value={progressPercentage} className="h-2" />
    <div className="flex justify-between text-xs text-neutral-500">
      <span>{formatRupiah(currentBalance)}</span>
      <span>{progressPercentage}%</span>
      <span>{formatRupiah(totalWishlist)}</span>
    </div>
  </div>
</div>
```

### StatusMessage Sub-component
```typescript
interface StatusMessageProps {
  currentBalance: number;
  totalWishlist: number;
}

const StatusMessage = ({ currentBalance, totalWishlist }: StatusMessageProps) => {
  const shortage = totalWishlist - currentBalance;
  const isAffordable = currentBalance >= totalWishlist;

  if (isAffordable) {
    return (
      <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
        <span className="text-lg">✅</span>
        <div className="flex-1">
          <p className="text-sm text-emerald-400">
            Saldo Anda cukup untuk semua wishlist
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
      <span className="text-lg">⚠️</span>
      <div className="flex-1">
        <p className="text-sm text-amber-400">
          Anda perlu <span className="font-semibold">{formatRupiah(shortage)}</span> lagi untuk semua wishlist
        </p>
      </div>
    </div>
  );
};
```

### Logic
```typescript
const progressPercentage = Math.min(
  Math.round((currentBalance / totalWishlist) * 100),
  100
);
```

---

## 2️⃣ InteractiveFilters Component

### Props
```typescript
interface InteractiveFiltersProps {
  wishlistItems: WishlistItem[];
  currentBalance: number;
  onFilterChange: (filter: FilterState) => void;
}

type FilterState = {
  type: 'all' | 'affordable' | 'priority';
  value?: 'high' | 'medium' | 'low';
};
```

### Structure
```tsx
<div className="space-y-3">
  {/* Quick Insight Button */}
  <QuickInsightButton
    affordableCount={affordableItems.length}
    isActive={filterState.type === 'affordable'}
    onClick={() => toggleAffordableFilter()}
  />

  {/* Priority Tabs */}
  <PriorityTabs
    items={wishlistItems}
    activeTab={filterState.value || 'all'}
    onTabChange={(priority) => handlePriorityFilter(priority)}
  />
</div>
```

### QuickInsightButton Sub-component
```tsx
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
      className="w-full justify-start gap-2"
      onClick={onClick}
    >
      <span className="text-base">💡</span>
      <span className="flex-1 text-left">
        Tampilkan {affordableCount} item yang bisa dibeli sekarang
      </span>
      {isActive && (
        <X className="size-4 ml-auto" />
      )}
    </Button>
  );
};
```

### PriorityTabs Sub-component
```tsx
interface PriorityTabsProps {
  items: WishlistItem[];
  activeTab: 'all' | 'high' | 'medium' | 'low';
  onTabChange: (priority: 'all' | 'high' | 'medium' | 'low') => void;
}

const PriorityTabs = ({ items, activeTab, onTabChange }: PriorityTabsProps) => {
  const counts = {
    all: items.length,
    high: items.filter(i => i.priority === 'high').length,
    medium: items.filter(i => i.priority === 'medium').length,
    low: items.filter(i => i.priority === 'low').length,
  };

  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all">
          Semua ({counts.all})
        </TabsTrigger>
        <TabsTrigger value="high">
          ⭐ High ({counts.high})
        </TabsTrigger>
        <TabsTrigger value="medium">
          🟡 Medium ({counts.medium})
        </TabsTrigger>
        <TabsTrigger value="low">
          🔵 Low ({counts.low})
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
```

### Filter Logic
```typescript
const [filterState, setFilterState] = useState<FilterState>({
  type: 'all'
});

// Calculate affordable items
const affordableItems = useMemo(() => {
  return wishlistItems.filter(item => currentBalance >= item.targetAmount);
}, [wishlistItems, currentBalance]);

// Toggle affordable filter
const toggleAffordableFilter = () => {
  if (filterState.type === 'affordable') {
    setFilterState({ type: 'all' });
  } else {
    setFilterState({ type: 'affordable' });
  }
};

// Handle priority filter
const handlePriorityFilter = (priority: string) => {
  if (priority === 'all') {
    setFilterState({ type: 'all' });
  } else {
    setFilterState({ 
      type: 'priority', 
      value: priority as 'high' | 'medium' | 'low' 
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

---

## 3️⃣ WishlistItemCard Component

### Props
```typescript
interface WishlistItemCardProps {
  item: WishlistItem;
  currentBalance: number;
  isMobile: boolean;
  onEdit: (item: WishlistItem) => void;
  onDelete: (item: WishlistItem) => void;
  onPurchase: (item: WishlistItem) => void;
}
```

### Structure (Desktop)
```tsx
<div className="relative group bg-[rgba(38,38,38,0.3)] border border-neutral-800 rounded-lg p-4 transition-all hover:border-neutral-700">
  {/* Header: Title + Priority */}
  <div className="flex items-start justify-between mb-2">
    <div className="flex-1">
      <h4 className="text-neutral-50">{item.name}</h4>
      {item.emoji && <span className="text-2xl">{item.emoji}</span>}
    </div>
    
    <div className="flex items-center gap-2">
      <PriorityBadge priority={item.priority} />
      
      {/* Desktop: Hover reveal actions */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onEdit(item)}
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onDelete(item)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  </div>

  {/* Amount */}
  <p className="text-xl mb-3">{formatRupiah(item.targetAmount)}</p>

  {/* Smart CTA */}
  <SmartCTA
    item={item}
    currentBalance={currentBalance}
    onPurchase={onPurchase}
  />
</div>
```

### Structure (Mobile)
```tsx
<div className="relative bg-[rgba(38,38,38,0.3)] border border-neutral-800 rounded-lg overflow-hidden">
  {/* Swipeable Content */}
  <div 
    className="relative"
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}
    style={{ transform: `translateX(${swipeOffset}px)` }}
  >
    <div className="p-4">
      {/* Same content as desktop but without hover actions */}
      {/* ... */}
    </div>
  </div>

  {/* Swipe Reveal Actions */}
  <div className="absolute inset-y-0 right-0 w-32 flex items-center justify-end gap-2 pr-2 bg-neutral-900/95">
    <Button
      size="icon"
      variant="ghost"
      onClick={() => onEdit(item)}
    >
      <Pencil className="size-5" />
    </Button>
    <Button
      size="icon"
      variant="ghost"
      onClick={() => onDelete(item)}
    >
      <Trash2 className="size-5" />
    </Button>
  </div>
</div>
```

### SmartCTA Sub-component
```tsx
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
        <p>Kurang {formatRupiah(shortage)} untuk item ini</p>
      </TooltipContent>
    </Tooltip>
  );
};
```

### Swipe Logic (Mobile)
```typescript
const [swipeOffset, setSwipeOffset] = useState(0);
const touchStartX = useRef(0);
const SWIPE_THRESHOLD = -80; // Pixels to reveal actions

const handleTouchStart = (e: React.TouchEvent) => {
  touchStartX.current = e.touches[0].clientX;
};

const handleTouchMove = (e: React.TouchEvent) => {
  const currentX = e.touches[0].clientX;
  const diff = currentX - touchStartX.current;
  
  // Only allow left swipe
  if (diff < 0) {
    setSwipeOffset(Math.max(diff, SWIPE_THRESHOLD));
  }
};

const handleTouchEnd = () => {
  if (swipeOffset < SWIPE_THRESHOLD / 2) {
    // Snap to revealed
    setSwipeOffset(SWIPE_THRESHOLD);
  } else {
    // Snap back
    setSwipeOffset(0);
  }
};
```

---

## 4️⃣ Utility Components

### PriorityBadge
```tsx
const PriorityBadge = ({ priority }: { priority: 'high' | 'medium' | 'low' }) => {
  const config = {
    high: { icon: '⭐', label: 'High', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    medium: { icon: '🟡', label: 'Medium', className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    low: { icon: '🔵', label: 'Low', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  };

  const { icon, label, className } = config[priority];

  return (
    <Badge variant="outline" className={className}>
      <span className="mr-1">{icon}</span>
      {label}
    </Badge>
  );
};
```

---

## 📦 Required Imports

```typescript
// shadcn/ui components
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "./ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";

// lucide-react icons
import { ShoppingCart, Pencil, Trash2, X } from "lucide-react";

// React hooks
import { useState, useMemo, useRef } from "react";

// Utils
import { formatRupiah } from "../utils/currency";
import { useMediaQuery } from "./ui/use-mobile";
```

---

## 🎨 Styling Notes

### Color Palette
```typescript
const colors = {
  // Background
  cardBg: 'bg-[rgba(38,38,38,0.3)]',
  cardBorder: 'border-neutral-800',
  cardHoverBorder: 'hover:border-neutral-700',
  
  // Status colors
  success: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400'
  },
  warning: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400'
  },
  
  // Text
  primary: 'text-neutral-50',
  secondary: 'text-neutral-400',
  muted: 'text-neutral-500'
};
```

### Transitions
```css
/* Hover reveal (desktop) */
.opacity-0.group-hover\\:opacity-100 {
  transition: opacity 200ms ease-in-out;
}

/* Swipe animation (mobile) */
.transition-transform {
  transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 🔄 State Management

### Main Component State
```typescript
const [filterState, setFilterState] = useState<FilterState>({ type: 'all' });
const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);
const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
```

### Computed Values
```typescript
const totalWishlist = useMemo(() => 
  wishlistItems.reduce((sum, item) => sum + item.targetAmount, 0),
  [wishlistItems]
);

const affordableItems = useMemo(() =>
  wishlistItems.filter(item => currentBalance >= item.targetAmount),
  [wishlistItems, currentBalance]
);

const filteredItems = useMemo(() => {
  // Apply filter logic
}, [wishlistItems, filterState, affordableItems]);
```

---

## 🧪 Component Testing Checklist

### SummaryHeader
- [ ] Shows correct balance and total
- [ ] Displays shortage message when insufficient
- [ ] Displays success message when sufficient
- [ ] Progress bar animates correctly
- [ ] Progress percentage capped at 100%

### InteractiveFilters
- [ ] Quick insight button shows/hides based on affordable items
- [ ] Quick insight button toggles filter state
- [ ] Priority tabs show correct counts
- [ ] Priority tabs filter list correctly
- [ ] Active tab is highlighted

### WishlistItemCard
- [ ] Desktop: Icons fade in on hover
- [ ] Mobile: Swipe reveals actions
- [ ] CTA enabled when affordable
- [ ] CTA disabled when not affordable
- [ ] Tooltip shows correct shortage amount
- [ ] Purchase action executes correctly

---

**Status**: 📋 Specifications Complete
**Next**: Review IMPLEMENTATION_GUIDE.md
