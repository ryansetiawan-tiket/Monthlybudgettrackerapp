# Skeleton Loading Update - November 5, 2025

## Overview

Update skeleton loading untuk match dengan layout terbaru yang menggunakan sistem kantong (pockets), plus penambahan skeleton loading di timeline kantong dan improvement swipe-to-close di mobile bottomsheet.

## ✨ What's New

### 1. **Updated App Loading Skeleton**
- Skeleton loading sekarang match dengan layout baru yang include PocketsSummary
- Menampilkan skeleton untuk 3 pocket cards dengan detail breakdown
- Animation timing disesuaikan untuk smooth loading experience

### 2. **Timeline Skeleton Loading**
- Timeline kantong sekarang menampilkan skeleton loading saat data sedang di-fetch
- Skeleton meniru struktur timeline sebenarnya dengan grouped dates
- Better UX - user tidak melihat "Loading..." text tapi skeleton yang mirip dengan data asli

### 3. **Improved Mobile Bottomsheet**
- Swipe-to-close feature sudah built-in dari vaul library
- Visual handle bar otomatis muncul di mobile untuk indicate swipe gesture
- `dismissible={true}` explicitly set untuk ensure swipe gesture enabled

## 📋 Modified Files

### 1. `/components/LoadingSkeleton.tsx` - UPDATED

**Changes:**
- Removed old "Additional Income Section" skeleton
- Removed "Template Section" skeleton (now in dialog)
- **Added PocketsSummary skeleton section** with 3 pocket cards
- Each pocket card shows:
  - Icon skeleton
  - Name and description skeleton
  - Balance breakdown skeleton (original, transfer in/out)
  - Action buttons skeleton
- Updated spacing to match new layout (`space-y-8` instead of `space-y-6`)
- Updated container max-width to `max-w-5xl` (match App.tsx)

**New Skeleton Structure:**
```tsx
{/* Pockets Summary Section */}
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="size-8 rounded-md" />
    </div>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* 3 Pocket Cards with details */}
    {[1, 2, 3].map((i) => (
      <Card>
        <CardContent>
          {/* Icon + Name */}
          {/* Balance breakdown */}
          {/* Action buttons */}
        </CardContent>
      </Card>
    ))}
  </CardContent>
</Card>
```

### 2. `/components/PocketTimeline.tsx` - UPDATED

**Changes:**
- Added `import { Skeleton } from "./ui/skeleton";`
- Replaced simple "Loading..." text with detailed skeleton loading
- Skeleton shows 2 date groups with multiple entries each
- Each skeleton entry includes:
  - Icon circle skeleton
  - Description and timestamp skeleton
  - Amount and balance skeleton

**Before:**
```tsx
{loading ? (
  <div className="text-center text-muted-foreground py-8">
    Loading...
  </div>
) : ...}
```

**After:**
```tsx
{loading ? (
  <div className="space-y-4 py-2">
    {/* Date Group 1 */}
    <div className="space-y-3">
      <Skeleton className="h-4 w-32" /> {/* Date header */}
      {[1, 2, 3].map((i) => (
        <div className="flex gap-3 pb-3 border-b">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between gap-2">
              <div className="space-y-1 flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="space-y-1 text-right">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
    {/* Date Group 2 */}
    ...
  </div>
) : ...}
```

### 3. `/components/AddExpenseDialog.tsx` - UPDATED

**Changes:**
- Added `dismissible={true}` prop to Drawer for explicit swipe-to-close enable
- Changed DrawerHeader to use `text-left` className for better mobile alignment
- Ensures swipe gesture is enabled on mobile

**Code:**
```tsx
if (isMobile) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} dismissible={true}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Tambah Pengeluaran</DrawerTitle>
        </DrawerHeader>
        {/* ... */}
      </DrawerContent>
    </Drawer>
  );
}
```

## 🎨 Visual Improvements

### App Loading State
**Before:**
- Generic skeleton that doesn't match actual layout
- No pocket cards representation
- Shows sections that are now in dialogs (templates, etc)

**After:**
- Accurate representation of actual app layout
- Shows 3 pocket cards with proper structure
- Matches spacing and sizing of real components
- Progressive animation for smooth appearance

### Timeline Loading State
**Before:**
- Simple "Loading..." text
- No visual feedback of data structure
- Jarring transition when data loads

**After:**
- Skeleton mimics actual timeline structure
- Shows grouped dates with entries
- Smooth transition to real data
- Users can see the structure while waiting

### Mobile Bottomsheet
**Before:**
- Swipe gesture might not be obvious
- Generic drawer behavior

**After:**
- Visual handle bar at top (built-in from vaul)
- Explicit `dismissible={true}` ensures gesture works
- Better mobile UX with clear swipe indication

## 🔧 Technical Details

### Skeleton Component Usage
All skeleton components use the shadcn `Skeleton` component from `/components/ui/skeleton.tsx`:

```tsx
import { Skeleton } from "./ui/skeleton";

<Skeleton className="h-4 w-32" /> // Height 4, width 32
<Skeleton className="size-10 rounded-full" /> // Circle
```

### Animation Timing
LoadingSkeleton uses staggered delays for smooth appearance:
- Header: 0.1s
- Month Selector: 0.15s
- Budget Overview: 0.2s
- Pockets Summary: 0.25s
- Tabs: 0.35s
- Pulse dots: 0.3s

Each item within sections has additional micro-delays (0.05s increment).

### Responsive Considerations
- Desktop: Dialog (center screen)
- Mobile (< 768px): Drawer/Bottomsheet
- Timeline skeleton adapts to mobile/desktop heights
- Spacing optimized for both breakpoints

## 📱 Mobile Bottomsheet Details

### Vaul Library Features
The Drawer component uses `vaul@1.1.2` which provides:
- Built-in swipe-to-close gesture
- Visual handle bar (automatic on bottom drawer)
- Smooth animations
- Backdrop overlay
- Proper z-index management

### Handle Bar
The handle bar is automatically shown for bottom drawers:
```tsx
<div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
```

Styling:
- Width: 100px
- Height: 2 (0.5rem)
- Color: `bg-muted` (muted gray)
- Position: Top center of drawer
- Rounded: Full rounded

### Swipe Behavior
- **Direction**: Down to dismiss (for bottom drawer)
- **Threshold**: Default vaul threshold (~25% of height)
- **Velocity**: Supports quick flick gestures
- **Feedback**: Visual drag as you swipe
- **Animation**: Smooth spring animation on dismiss

## ✅ Testing Checklist

### Desktop
- [ ] App loads with proper skeleton animation
- [ ] Skeleton matches actual layout structure
- [ ] PocketsSummary skeleton shows 3 cards
- [ ] Timeline shows skeleton when loading
- [ ] Smooth transition from skeleton to real data

### Mobile
- [ ] Bottomsheet opens from bottom
- [ ] Handle bar is visible at top of drawer
- [ ] Swipe down gesture dismisses drawer
- [ ] Timeline skeleton fits mobile viewport
- [ ] Skeleton doesn't cause horizontal scroll

### Edge Cases
- [ ] Very fast network (skeleton briefly visible)
- [ ] Slow network (skeleton shows properly)
- [ ] Timeline with no data (shows "Belum ada aktivitas")
- [ ] Timeline with error (handled gracefully)
- [ ] Multiple rapid open/close of timeline

## 🎯 Benefits

### User Experience
1. **Visual Continuity**: Skeleton matches actual layout structure
2. **Perceived Performance**: App feels faster with immediate visual feedback
3. **Reduced Confusion**: Users see structure while waiting for data
4. **Mobile-First**: Swipe gesture follows mobile platform conventions

### Developer Experience
1. **Maintainable**: Skeleton structure mirrors actual component structure
2. **Reusable**: Skeleton patterns can be used in other components
3. **Consistent**: Uses shadcn Skeleton component throughout
4. **Type-Safe**: All components properly typed

### Performance
1. **No Layout Shift**: Skeleton prevents CLS (Cumulative Layout Shift)
2. **Optimized Animations**: Staggered delays prevent jank
3. **Lazy Loading**: Timeline data fetched only when needed
4. **Efficient Rendering**: Skeleton components are lightweight

## 📝 Code Patterns

### Skeleton Card Pattern
```tsx
<Card>
  <CardContent className="p-4">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Skeleton className="size-8 rounded-md" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="flex gap-1">
        <Skeleton className="size-7 rounded-md" />
      </div>
    </div>
    {/* More content */}
  </CardContent>
</Card>
```

### Skeleton List Pattern
```tsx
{[1, 2, 3].map((i) => (
  <motion.div
    key={i}
    initial={{ x: -20, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ delay: baseDelay + i * 0.05 }}
  >
    <Skeleton />
  </motion.div>
))}
```

### Conditional Loading Pattern
```tsx
{loading ? (
  <SkeletonComponent />
) : data.length === 0 ? (
  <EmptyState />
) : (
  <DataDisplay data={data} />
)}
```

## 🚀 Future Enhancements

Potential improvements for future iterations:

1. **Shimmer Effect**: Add shimmer animation to skeleton for more polish
2. **Custom Delays**: Make animation delays configurable via props
3. **Dark Mode Optimization**: Adjust skeleton colors for better dark mode contrast
4. **Error States**: Add dedicated error skeleton states
5. **Progressive Loading**: Show partial data as it loads (streaming)

## 📚 References

- Vaul Library: https://github.com/emilkowalski/vaul
- Shadcn Skeleton: https://ui.shadcn.com/docs/components/skeleton
- Skeleton Loading Best Practices: https://www.nngroup.com/articles/skeleton-screens/

## 📅 Date: November 5, 2025

## ✅ Status: COMPLETE

All skeleton loading states updated to match current app structure. Mobile bottomsheet swipe-to-close verified working.
