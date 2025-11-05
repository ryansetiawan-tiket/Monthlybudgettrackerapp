# Skeleton Loading - Quick Reference

## 📋 Quick Overview

**Updated:** November 5, 2025  
**Files Modified:** 3 files  
**Status:** ✅ Complete

## 🎯 What Was Updated

| Component | Change | Why |
|-----------|--------|-----|
| `LoadingSkeleton.tsx` | Added PocketsSummary skeleton | Match new app layout with pocket cards |
| `PocketTimeline.tsx` | Added timeline skeleton | Better UX than "Loading..." text |
| `AddExpenseDialog.tsx` | Added `dismissible={true}` | Ensure swipe-to-close works on mobile |

## 🔧 Key Changes

### 1. App Loading Skeleton
```tsx
// NEW: PocketsSummary skeleton with 3 cards
<Card>
  <CardHeader>
    <Skeleton className="h-6 w-32" />
    <Skeleton className="size-8 rounded-md" />
  </CardHeader>
  <CardContent className="space-y-4">
    {[1, 2, 3].map((i) => (
      <Card>
        {/* Icon + Name + Balance breakdown */}
      </Card>
    ))}
  </CardContent>
</Card>
```

### 2. Timeline Loading State
```tsx
// BEFORE
{loading ? (
  <div>Loading...</div>
) : ...}

// AFTER
{loading ? (
  <div className="space-y-4">
    {/* Date Group Skeleton */}
    <Skeleton className="h-4 w-32" />
    {[1, 2, 3].map(i => (
      <div className="flex gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    ))}
  </div>
) : ...}
```

### 3. Mobile Swipe-to-Close
```tsx
<Drawer open={open} onOpenChange={onOpenChange} dismissible={true}>
  <DrawerContent className="max-h-[90vh]">
    <DrawerHeader className="text-left">
      <DrawerTitle>Tambah Pengeluaran</DrawerTitle>
    </DrawerHeader>
    {/* content */}
  </DrawerContent>
</Drawer>
```

## 📱 Mobile Features

### Swipe-to-Close
- **Library**: vaul@1.1.2 (built-in feature)
- **Gesture**: Swipe down to dismiss
- **Visual**: Handle bar automatically shown at top
- **Props**: `dismissible={true}` (explicitly enabled)

### Handle Bar
```tsx
// Automatically added by DrawerContent for bottom drawers
<div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
```

## 🎨 Skeleton Patterns

### Basic Skeleton
```tsx
<Skeleton className="h-4 w-32" />
```

### Circle Skeleton (Icon)
```tsx
<Skeleton className="size-10 rounded-full" />
```

### Button Skeleton
```tsx
<Skeleton className="size-7 rounded-md" />
```

### List Skeleton
```tsx
{[1, 2, 3].map((i) => (
  <Skeleton key={i} className="h-4 w-full" />
))}
```

### Card Skeleton
```tsx
<Card>
  <CardContent className="p-4 space-y-2">
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-3 w-24" />
  </CardContent>
</Card>
```

## ⚡ Animation Timing

| Section | Delay | Duration |
|---------|-------|----------|
| Header | 0.1s | 0.3s |
| Month Selector | 0.15s | 0.3s |
| Budget Overview | 0.2s | 0.3s |
| Pockets Summary | 0.25s | 0.3s |
| Tabs | 0.35s | 0.3s |
| Individual Items | +0.05s each | - |

## 🧪 Testing Quick Check

### Desktop
```bash
✅ Skeleton matches layout
✅ Smooth animations
✅ Timeline shows skeleton
✅ No layout shift
```

### Mobile
```bash
✅ Bottomsheet from bottom
✅ Handle bar visible
✅ Swipe down works
✅ Timeline skeleton fits
```

## 🔍 Debugging

### Skeleton Not Showing?
1. Check if `isLoading` state is true
2. Verify Skeleton import: `import { Skeleton } from "./ui/skeleton"`
3. Check className prop is properly set

### Swipe Not Working?
1. Verify `dismissible={true}` prop on Drawer
2. Check if using mobile device or mobile viewport
3. Ensure vaul library is imported correctly

### Animation Jank?
1. Check delay values (should increment by 0.05s)
2. Verify motion/react is imported
3. Test on slower device/throttled network

## 📝 Common Tasks

### Add New Skeleton Section
```tsx
<motion.div
  initial={{ y: -20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ delay: 0.4 }} // Adjust delay
>
  <Card>
    <CardContent>
      <Skeleton className="h-4 w-32" />
    </CardContent>
  </Card>
</motion.div>
```

### Update Skeleton Count
```tsx
// Change array length
{[1, 2, 3, 4, 5].map((i) => (
  <SkeletonItem key={i} />
))}
```

### Add Loading to New Component
```tsx
import { Skeleton } from "./ui/skeleton";

export function MyComponent() {
  const [loading, setLoading] = useState(true);
  
  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }
  
  return <RealContent />;
}
```

## 💡 Best Practices

1. **Match Structure**: Skeleton should mirror actual component structure
2. **Consistent Sizing**: Use same height/width as real content
3. **Stagger Animations**: Add small delays for smooth appearance
4. **No Layout Shift**: Ensure skeleton takes same space as content
5. **Mobile First**: Test skeleton on mobile viewport

## 📚 Related Files

- `/components/LoadingSkeleton.tsx` - Main app skeleton
- `/components/PocketTimeline.tsx` - Timeline skeleton
- `/components/ui/skeleton.tsx` - Base skeleton component
- `/components/ui/drawer.tsx` - Drawer with swipe support
- `/components/AddExpenseDialog.tsx` - Dialog/Drawer wrapper

## 🚀 Quick Commands

```bash
# Test on mobile viewport
# Chrome DevTools: Cmd+Shift+M (Mac) or Ctrl+Shift+M (Windows)

# Test slow network
# Chrome DevTools > Network tab > Throttling > Slow 3G

# Test loading state
# Add delay in data fetching:
await new Promise(resolve => setTimeout(resolve, 2000));
```

---

**Last Updated:** November 5, 2025  
**Version:** 1.0  
**Status:** ✅ Production Ready
