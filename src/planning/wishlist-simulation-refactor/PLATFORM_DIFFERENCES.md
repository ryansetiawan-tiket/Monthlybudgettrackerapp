# 📱 Platform-Specific Differences

## Overview

Detailed guide for implementing platform-specific behaviors in the refactored Wishlist Simulation.

---

## 🖥️ vs 📱 Comparison Table

| Feature | Desktop (≥768px) | Mobile (<768px) |
|---------|-----------------|----------------|
| **Container** | Modal (Dialog) | Drawer (Bottom sheet) |
| **Edit/Delete Actions** | Hover to reveal | Swipe left to reveal |
| **Tooltip Trigger** | Mouse hover | Tap/long press |
| **Layout** | Side-by-side grids | Stacked vertically |
| **Text Size** | Full size | Compact |
| **Touch Target** | 40px minimum | 48px minimum |
| **Scroll** | Mouse wheel / trackpad | Touch scroll |
| **Quick Insight Button** | Full text | Shorter text |
| **Priority Tabs** | Full labels | Abbreviated |

---

## 🖥️ Desktop Implementation

### Container: Modal Dialog
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

const DesktopWishlistSimulation = ({ isOpen, onClose, ...props }: Props) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Simulasi Wishlist - {pocketName}</DialogTitle>
        </DialogHeader>
        
        {/* Content */}
        <div className="space-y-4">
          {/* ... components ... */}
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

### Hover-Reveal Actions
```typescript
const DesktopWishlistCard = ({ item, ...props }: Props) => {
  return (
    <div className="relative group bg-[rgba(38,38,38,0.3)] border border-neutral-800 rounded-lg p-4 transition-all hover:border-neutral-700">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {item.emoji && <span className="text-2xl">{item.emoji}</span>}
          <h4 className="text-neutral-50 font-medium">{item.name}</h4>
        </div>
        
        <div className="flex items-center gap-2">
          <PriorityBadge priority={item.priority} />
          
          {/* Hover-reveal actions */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="size-8"
              onClick={() => props.onEdit(item)}
              aria-label="Edit wishlist item"
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-8"
              onClick={() => props.onDelete(item)}
              aria-label="Delete wishlist item"
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

      {/* CTA */}
      <SmartCTA {...props} item={item} />
    </div>
  );
};
```

### Hover Tooltip
```typescript
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "./ui/tooltip";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <div className="w-full">
        <Button disabled variant="outline" className="w-full">
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
```

### Desktop-Specific Styles
```typescript
const desktopStyles = {
  // Larger touch targets
  iconButton: "size-8",
  
  // Full text labels
  quickInsightText: "text-sm",
  
  // Side-by-side layout
  summaryGrid: "grid grid-cols-2 gap-3",
  
  // Full priority labels
  priorityTab: "text-sm",
};
```

---

## 📱 Mobile Implementation

### Container: Drawer
```typescript
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";

const MobileWishlistSimulation = ({ isOpen, onClose, ...props }: Props) => {
  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Simulasi Wishlist - {pocketName}</DrawerTitle>
        </DrawerHeader>
        
        <div className="overflow-y-auto px-4 pb-4 space-y-3">
          {/* Content */}
          {/* ... components ... */}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
```

### Swipe-to-Reveal Actions

#### Option A: Using react-swipeable (Recommended)
```bash
# User needs to ensure react-swipeable is available
```

```typescript
import { useSwipeable } from 'react-swipeable';

const MobileWishlistCard = ({ item, ...props }: Props) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (eventData.dir === 'Left') {
        // Limit swipe to -100px
        const offset = Math.max(Math.min(eventData.deltaX, 0), -100);
        setSwipeOffset(offset);
      }
    },
    onSwipedLeft: () => {
      // Snap to revealed if swiped far enough
      if (Math.abs(swipeOffset) > 50) {
        setIsRevealed(true);
        setSwipeOffset(-100);
      } else {
        setIsRevealed(false);
        setSwipeOffset(0);
      }
    },
    onSwipedRight: () => {
      // Snap back to hidden
      setIsRevealed(false);
      setSwipeOffset(0);
    },
    trackMouse: false, // Only track touch
    trackTouch: true,
    preventScrollOnSwipe: false, // Allow vertical scroll
  });

  const handleActionClick = (action: () => void) => {
    // Execute action
    action();
    // Reset swipe
    setIsRevealed(false);
    setSwipeOffset(0);
  };

  return (
    <div className="relative overflow-hidden bg-[rgba(38,38,38,0.3)] border border-neutral-800 rounded-lg">
      {/* Swipeable Content */}
      <div
        {...handlers}
        className="relative transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${swipeOffset}px)` }}
      >
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {item.emoji && <span className="text-2xl">{item.emoji}</span>}
              <h4 className="text-neutral-50 font-medium">{item.name}</h4>
            </div>
            <PriorityBadge priority={item.priority} />
          </div>

          <p className="text-xl text-neutral-50 mb-3">
            {formatRupiah(item.targetAmount)}
          </p>

          <SmartCTA {...props} item={item} />
        </div>
      </div>

      {/* Revealed Actions (Background) */}
      <div className="absolute inset-y-0 right-0 w-28 flex items-center justify-end gap-2 pr-2 bg-neutral-900/95">
        <Button
          size="icon"
          variant="ghost"
          className="size-10"
          onClick={() => handleActionClick(() => props.onEdit(item))}
          aria-label="Edit wishlist item"
        >
          <Pencil className="size-5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="size-10"
          onClick={() => handleActionClick(() => props.onDelete(item))}
          aria-label="Delete wishlist item"
        >
          <Trash2 className="size-5" />
        </Button>
      </div>
    </div>
  );
};
```

#### Option B: Custom Touch Handlers (Fallback)
```typescript
const MobileWishlistCard = ({ item, ...props }: Props) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const isSwiping = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    isSwiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = currentY - touchStartY.current;

    // Determine if horizontal swipe
    if (!isSwiping.current && Math.abs(diffX) > Math.abs(diffY)) {
      isSwiping.current = true;
    }

    // Only allow left swipe, limit to -100px
    if (isSwiping.current && diffX < 0) {
      e.preventDefault(); // Prevent scroll during horizontal swipe
      setSwipeOffset(Math.max(diffX, -100));
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

    isSwiping.current = false;
  };

  const handleActionClick = (action: () => void) => {
    action();
    setSwipeOffset(0);
  };

  return (
    <div className="relative overflow-hidden bg-[rgba(38,38,38,0.3)] border border-neutral-800 rounded-lg">
      {/* Swipeable Content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${swipeOffset}px)` }}
      >
        {/* ... same content as Option A ... */}
      </div>

      {/* Revealed Actions (Background) */}
      {/* ... same as Option A ... */}
    </div>
  );
};
```

### Mobile Tooltip
```typescript
// Mobile: Show tooltip on tap with slight delay
const [isTooltipOpen, setIsTooltipOpen] = useState(false);

<Tooltip open={isTooltipOpen} onOpenChange={setIsTooltipOpen}>
  <TooltipTrigger asChild>
    <div 
      className="w-full"
      onTouchStart={() => {
        // Delay to avoid triggering during scroll
        setTimeout(() => setIsTooltipOpen(true), 300);
      }}
      onTouchEnd={() => {
        setTimeout(() => setIsTooltipOpen(false), 2000);
      }}
    >
      <Button disabled variant="outline" className="w-full">
        <ShoppingCart className="size-4 mr-2" />
        Beli Sekarang
      </Button>
    </div>
  </TooltipTrigger>
  <TooltipContent>
    <p className="text-xs">Kurang {formatRupiah(shortage)} untuk item ini</p>
  </TooltipContent>
</Tooltip>
```

### Mobile-Specific Styles
```typescript
const mobileStyles = {
  // Larger touch targets for fingers
  iconButton: "size-10",
  
  // Compact text
  quickInsightText: "text-xs",
  
  // Stacked layout
  summaryGrid: "grid grid-cols-1 gap-2",
  
  // Abbreviated priority labels
  priorityTab: "text-xs",
};
```

---

## 🔀 Platform Detection & Conditional Rendering

### Setup Platform Detection
```typescript
import { useMediaQuery } from "./ui/use-mobile";

const WishlistSimulation = (props: Props) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  return isMobile ? (
    <MobileWishlistSimulation {...props} />
  ) : (
    <DesktopWishlistSimulation {...props} />
  );
};
```

### Alternative: Shared Component with Platform Variations
```typescript
const WishlistSimulation = (props: Props) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const Container = isMobile ? Drawer : Dialog;
  const Content = isMobile ? DrawerContent : DialogContent;
  const Header = isMobile ? DrawerHeader : DialogHeader;
  const Title = isMobile ? DrawerTitle : DialogTitle;
  
  return (
    <Container open={props.isOpen} onOpenChange={props.onClose}>
      <Content className={isMobile ? "max-h-[90vh]" : "sm:max-w-[600px] max-h-[90vh]"}>
        <Header>
          <Title>Simulasi Wishlist - {props.pocketName}</Title>
        </Header>
        
        <div className={isMobile ? "px-4 pb-4 space-y-3" : "space-y-4"}>
          {/* Shared components */}
          <SummaryHeader {...} />
          
          {/* Platform-specific card rendering */}
          {props.wishlistItems.map(item => (
            isMobile ? (
              <MobileWishlistCard key={item.id} item={item} {...} />
            ) : (
              <DesktopWishlistCard key={item.id} item={item} {...} />
            )
          ))}
        </div>
      </Content>
    </Container>
  );
};
```

---

## 📐 Responsive Layouts

### Summary Header
```typescript
// Desktop: Side-by-side
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
  <div>💰 Saldo Kantong: ...</div>
  <div>🎯 Total Wishlist: ...</div>
</div>

// Mobile: Stacked
<div className="grid grid-cols-1 gap-2">
  <div>💰 Saldo Kantong: ...</div>
  <div>🎯 Total Wishlist: ...</div>
</div>
```

### Priority Tabs
```typescript
// Desktop: Full labels
<TabsTrigger value="high" className="text-sm">
  <span className="mr-1">⭐</span>
  High ({counts.high})
</TabsTrigger>

// Mobile: Abbreviated
<TabsTrigger value="high" className="text-xs">
  <span className="mr-1">⭐</span>
  {counts.high}
</TabsTrigger>
```

### Quick Insight Button
```typescript
// Desktop: Full text
<Button variant="outline" className="w-full justify-start gap-2">
  <span className="text-base">💡</span>
  <span className="flex-1 text-left text-sm">
    Tampilkan {affordableCount} item yang bisa dibeli sekarang
  </span>
</Button>

// Mobile: Shorter text
<Button variant="outline" className="w-full justify-start gap-2">
  <span className="text-base">💡</span>
  <span className="flex-1 text-left text-xs">
    {affordableCount} item bisa dibeli
  </span>
</Button>
```

---

## 🎯 Touch Targets

### Minimum Touch Target Sizes

**Desktop:**
- Buttons: 40px minimum
- Icons: 32px minimum
- Clickable area: 40px × 40px

**Mobile:**
- Buttons: 48px minimum
- Icons: 40px minimum
- Clickable area: 48px × 48px

### Implementation
```typescript
// Desktop
<Button size="icon" className="size-8"> {/* 32px */}
  <Pencil className="size-4" />
</Button>

// Mobile
<Button size="icon" className="size-10"> {/* 40px */}
  <Pencil className="size-5" />
</Button>
```

---

## 🖱️ vs 👆 Interaction Patterns

### Desktop Interaction Patterns
```typescript
// Hover states
className="hover:bg-neutral-800 transition-colors"

// Cursor changes
className="cursor-pointer"

// Focus visible (keyboard navigation)
className="focus-visible:ring-2 focus-visible:ring-offset-2"

// Tooltip on hover
<Tooltip>
  <TooltipTrigger>...</TooltipTrigger>
  <TooltipContent>...</TooltipContent>
</Tooltip>
```

### Mobile Interaction Patterns
```typescript
// Active/pressed states
className="active:bg-neutral-800 transition-colors"

// No cursor changes (not relevant)

// Touch feedback
className="active:scale-95 transition-transform"

// Tooltip on tap
onTouchStart={() => setIsTooltipOpen(true)}
onTouchEnd={() => setTimeout(() => setIsTooltipOpen(false), 2000)}

// Swipe gestures
onTouchStart={handleTouchStart}
onTouchMove={handleTouchMove}
onTouchEnd={handleTouchEnd}
```

---

## 🔄 Scroll Behavior

### Desktop
```typescript
// Mouse wheel scroll
<DialogContent className="overflow-y-auto max-h-[90vh]">
  {/* ... content ... */}
</DialogContent>
```

### Mobile
```typescript
// Touch scroll with momentum
<DrawerContent className="max-h-[90vh]">
  <div className="overflow-y-auto overscroll-contain px-4">
    {/* ... content ... */}
  </div>
</DrawerContent>

// Prevent scroll when swiping horizontally
const handleTouchMove = (e: React.TouchEvent) => {
  if (isSwiping.current) {
    e.preventDefault(); // Prevent vertical scroll during horizontal swipe
  }
};
```

---

## 🎨 Visual Feedback

### Desktop
```typescript
// Hover effects
className="hover:border-neutral-700 transition-colors"

// Focus rings
className="focus:ring-2 focus:ring-blue-500"

// Cursor feedback
className="cursor-pointer"
className="cursor-not-allowed" // for disabled
```

### Mobile
```typescript
// Tap highlight (native)
style={{ WebkitTapHighlightColor: 'rgba(0,0,0,0.1)' }}

// Active press state
className="active:bg-neutral-800"

// Haptic feedback (if Capacitor is available)
import { Haptics } from '@capacitor/haptics';

const handleAction = async () => {
  await Haptics.impact({ style: 'light' });
  // ... action logic
};
```

---

## 📱 Capacitor-Specific Considerations

### Haptic Feedback (Mobile App)
```typescript
import { Capacitor } from '@capacitor/core';
import { Haptics } from '@capacitor/haptics';

const vibrate = async (style: 'light' | 'medium' | 'heavy' = 'light') => {
  if (Capacitor.isNativePlatform()) {
    try {
      await Haptics.impact({ style });
    } catch (error) {
      // Silently fail if not supported
    }
  }
};

// Usage:
const handleDelete = async (item: WishlistItem) => {
  await vibrate('medium');
  // ... delete logic
};
```

### Safe Area Insets (Mobile App)
```typescript
// Mobile: Account for notch/bottom bar
<DrawerContent className="pb-[env(safe-area-inset-bottom)]">
  {/* ... content ... */}
</DrawerContent>
```

---

## 🧪 Platform Testing Checklist

### Desktop Testing
- [ ] Modal opens/closes correctly
- [ ] Hover reveals edit/delete icons
- [ ] Hover tooltip appears on disabled CTA
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Mouse wheel scrolling works
- [ ] Resize window doesn't break layout
- [ ] All click interactions work

### Mobile Testing
- [ ] Drawer slides up/down correctly
- [ ] Swipe left reveals actions
- [ ] Swipe right hides actions
- [ ] Vertical scroll works while swipe is hidden
- [ ] Touch targets are large enough (48px+)
- [ ] Tooltip appears on tap (with delay)
- [ ] No accidental triggers while scrolling
- [ ] Haptic feedback works (if native app)
- [ ] Safe area insets respected (if native app)

### Cross-Platform Testing
- [ ] Responsive breakpoints work (768px)
- [ ] Layout switches correctly at breakpoint
- [ ] No console errors on either platform
- [ ] Performance is acceptable
- [ ] Animations are smooth

---

## 🐛 Common Platform Issues & Solutions

### Issue 1: Swipe Conflicts with Scroll (Mobile)
**Problem**: Vertical scroll triggers swipe action

**Solution**: Detect swipe direction before enabling swipe
```typescript
const handleTouchMove = (e: React.TouchEvent) => {
  const diffX = Math.abs(currentX - startX);
  const diffY = Math.abs(currentY - startY);
  
  // Only enable swipe if horizontal movement is greater
  if (diffX > diffY) {
    isSwiping.current = true;
    e.preventDefault(); // Now prevent scroll
  }
};
```

### Issue 2: Hover Actions Not Appearing (Desktop)
**Problem**: Icons don't fade in on hover

**Solution**: Ensure parent has `group` class
```typescript
// Parent must have 'group'
<div className="group ...">
  {/* Child must have 'group-hover:' */}
  <div className="opacity-0 group-hover:opacity-100 ...">
    ...
  </div>
</div>
```

### Issue 3: Tooltip Not Showing (Mobile)
**Problem**: Tooltip doesn't appear on tap

**Solution**: Control tooltip state manually
```typescript
const [isOpen, setIsOpen] = useState(false);

<Tooltip open={isOpen} onOpenChange={setIsOpen}>
  <TooltipTrigger asChild>
    <div onTouchStart={() => setIsOpen(true)}>
      ...
    </div>
  </TooltipTrigger>
</Tooltip>
```

### Issue 4: Touch Targets Too Small (Mobile)
**Problem**: Hard to tap small icons

**Solution**: Increase touch target size
```typescript
// ❌ Bad (too small)
<Button size="icon" className="size-6">

// ✅ Good (48px minimum)
<Button size="icon" className="size-12">
```

---

## 📊 Performance Considerations

### Desktop
- Hover effects should be instant (no delay)
- Transitions should be smooth (60fps)
- Large lists should be virtualized

### Mobile
- Swipe should follow finger precisely
- Animations should use transform (GPU accelerated)
- Avoid layout thrashing
- Use `will-change` sparingly

```typescript
// Optimize swipe performance
<div
  className="transition-transform"
  style={{ 
    transform: `translateX(${swipeOffset}px)`,
    willChange: isRevealed ? 'transform' : 'auto' // Only when needed
  }}
>
```

---

**Status**: 📱 Platform Differences Complete
**Next**: Review TESTING_CHECKLIST.md
