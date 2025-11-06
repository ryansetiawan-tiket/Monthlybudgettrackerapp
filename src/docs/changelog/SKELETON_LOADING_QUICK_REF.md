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

## 🎨 Skeleton Patterns

### Basic Skeleton
```tsx
<Skeleton className="h-4 w-32" />
```

### Circle Skeleton (Icon)
```tsx
<Skeleton className="size-10 rounded-full" />
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

## 💡 Best Practices

1. **Match Structure**: Skeleton should mirror actual component structure
2. **Consistent Sizing**: Use same height/width as real content
3. **Stagger Animations**: Add small delays for smooth appearance
4. **No Layout Shift**: Ensure skeleton takes same space as content
5. **Mobile First**: Test skeleton on mobile viewport

---

**Last Updated:** November 5, 2025  
**Version:** 1.0  
**Status:** ✅ Production Ready
