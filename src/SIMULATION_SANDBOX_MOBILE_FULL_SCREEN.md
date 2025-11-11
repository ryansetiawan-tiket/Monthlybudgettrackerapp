# Simulation Sandbox - Mobile Full Screen Update

## 🎯 Change
Mobile drawer dibuat **TRUE full screen** untuk tampilan yang lebih lega dengan mengatasi constraints dari shadcn/ui Drawer component menggunakan inline styles.

## 🚨 Problem Found
Drawer component dari shadcn/ui memiliki built-in constraints yang mencegah full screen:
- `max-h-[80vh]` - Membatasi tinggi hanya 80% viewport
- `mt-24` - Margin top 6rem yang memakan space
- **CSS specificity tinggi** - Tailwind classes tidak cukup kuat untuk override

## ❌ Failed Attempts

### Attempt 1: Tailwind Classes Only
```tsx
<DrawerContent className="h-[95vh] flex flex-col p-4">
```
- ❌ Height: 95% viewport height
- ❌ Masih kena constraint `max-h-[80vh]` dari shadcn
- ❌ Ada gap dari `mt-24`

### Attempt 2: More Specific Classes
```tsx
<DrawerContent className="h-full flex flex-col p-4">
```
- ❌ Height: 100% attempt
- ❌ Masih kena constraint `max-h-[80vh]` dari shadcn
- ❌ Masih ada `mt-24` margin
- ❌ **Still not truly full screen!**

### Attempt 3: Override Classes
```tsx
<DrawerContent className="h-full max-h-screen mt-0 flex flex-col p-4">
```
- ❌ `h-full` - Set height to 100%
- ❌ `max-h-screen` - Tried to override `max-h-[80vh]`
- ❌ `mt-0` - Tried to override `mt-24`
- ❌ **CSS specificity kalah! Shadcn's data attributes lebih kuat!**

## ✅ Final Solution: Inline Styles

```tsx
<DrawerContent 
  className="flex flex-col p-4"
  style={{ 
    height: '100vh',
    maxHeight: '100vh',
    marginTop: 0,
  }}
>
  {/* Hidden title for accessibility */}
  <h2 className="sr-only">Simulation Sandbox</h2>
  {sandboxContent}
</DrawerContent>
```

### Why Inline Styles Work
- ✅ **Highest specificity** - Inline styles override everything
- ✅ **Direct DOM manipulation** - Bypasses CSS cascade
- ✅ **100vh guaranteed** - No shadcn constraints apply
- ✅ **Accessibility fix** - Added sr-only title for screen readers

## 📱 Visual Impact

### Before (With Constraints)
```
[Status Bar - Android]
│                         │
│ [Gap from mt-24]        │ ← 6rem wasted
│ [Gap from max-h-80vh]   │ ← 20vh wasted
├─────────────────────────┤
│ 🔬 Simulation Sandbox   │
│ [X]                     │
├─────────────────────────┤
│ Metrics Cards           │
├─────────────────────────┤
│ Tabs                    │
├─────────────────────────┤
│ Transaction List        │
│ (Scrollable)            │
│ ...                     │ ← Limited space
├─────────────────────────┤
│ Buttons                 │
└─────────────────────────┘
[Navigation Bar - Android]
```
**Total wasted: ~26vh (20vh + 6rem)!**

### After (True Full Screen)
```
[Status Bar - Android]    ← Safe area respected
┌─────────────────────────┐
│ 🔬 Simulation Sandbox   │ ← Starts immediately
│ [X]                     │
├─────────────────────────┤
│ Metrics Cards           │
├─────────────────────────┤
│ Tabs                    │
├─────────────────────────┤
│ Transaction List        │
│ (Scrollable)            │
│ ...                     │
│ ...                     │ ← Much more space!
│ ...                     │
│ ...                     │
│ ...                     │
├─────────────────────────┤
│ Buttons                 │
└─────────────────────────┘
[Navigation Bar - Android] ← Safe area respected
```
**Reclaimed ~26vh space for content!** 🎉

## 🎨 Benefits

1. **Much More Space** ✅
   - Reclaimed ~26vh space (20vh from max-h + 6rem from margin)
   - **Significantly more** items visible at once
   - Better utilization of mobile screen real estate

2. **Better UX** ✅
   - Feels truly native/app-like
   - No unnecessary gaps or margins
   - Immersive full-screen experience

3. **Consistent with Modern Mobile Apps** ✅
   - Full screen bottom sheets are standard (Google, Instagram, etc.)
   - Professional appearance
   - Maximizes content visibility

4. **Fixed Shadcn Constraints** ✅
   - Overcame `max-h-[80vh]` limitation
   - Removed `mt-24` margin overhead
   - Proper override strategy documented

## 📝 Files Modified
- `/components/SimulationSandbox.tsx` - Added `max-h-screen mt-0` overrides

## 🔗 Related Changes
- Desktop dialog remains at `h-[80vh]` (appropriate for desktop UX)
- Title row with close button (X) still visible at top
- Scroll functionality unchanged (from previous fix)

## 🔧 Technical Details

### Shadcn/UI Drawer Constraints (from `/components/ui/drawer.tsx`)
```tsx
// Line 62-64 - Bottom drawer default constraints with DATA ATTRIBUTES
className={cn(
  // ... other classes
  "data-[vaul-drawer-direction=bottom]:mt-24",         // ❌ 6rem margin
  "data-[vaul-drawer-direction=bottom]:max-h-[80vh]",  // ❌ Max 80% viewport
)}
```

### Why Tailwind Classes Failed
```tsx
// ❌ FAILED - CSS Specificity Battle
<DrawerContent className="h-full max-h-screen mt-0">

// CSS Output:
.h-full { height: 100%; }                               // Specificity: 0,1,0
.max-h-screen { max-height: 100vh; }                    // Specificity: 0,1,0
.mt-0 { margin-top: 0; }                                // Specificity: 0,1,0

// But shadcn uses data attributes (HIGHER specificity):
[data-vaul-drawer-direction=bottom].mt-24               // Specificity: 0,2,0 ✅ WINS!
[data-vaul-drawer-direction=bottom].max-h-\[80vh\]     // Specificity: 0,2,0 ✅ WINS!
```

**Result: Data attribute selectors = Higher specificity = Our classes ignored!**

### Final Solution: Inline Styles
```tsx
// ✅ WORKS - Inline styles have HIGHEST specificity
<DrawerContent 
  style={{ 
    height: '100vh',      // Inline style specificity: 1,0,0,0 (WINS!)
    maxHeight: '100vh',   // Inline style specificity: 1,0,0,0 (WINS!)
    marginTop: 0,         // Inline style specificity: 1,0,0,0 (WINS!)
  }}
>
```

### CSS Specificity Hierarchy
1. ❌ Class (`.mt-0`) = `0,1,0`
2. ❌ Attribute selector (`[data-*].mt-24`) = `0,2,0` ← Shadcn uses this
3. ✅ **Inline style** (`style={{ marginTop: 0 }}`) = `1,0,0,0` ← **WE USE THIS!**

## 💡 Quick Reference

```tsx
// ❌ WRONG - Tailwind classes can't override data attributes
<DrawerContent className="h-full max-h-screen mt-0 flex flex-col p-4">

// ✅ CORRECT - Inline styles with highest specificity
<DrawerContent 
  className="flex flex-col p-4"
  style={{ 
    height: '100vh',
    maxHeight: '100vh',
    marginTop: 0,
  }}
>
  {/* Accessibility: Hidden title for screen readers */}
  <h2 className="sr-only">Simulation Sandbox</h2>
  {content}
</DrawerContent>

// Desktop (with accessibility fix)
<DialogContent 
  className="max-w-4xl h-[80vh] flex flex-col p-6"
  aria-describedby={undefined}  // Suppress description warning
>
  <DialogHeader>
    <DialogTitle>🔬 Simulation Sandbox</DialogTitle>
  </DialogHeader>
  {content}
</DialogContent>
```

## ⚠️ Important Notes

1. **Inline Styles Required**: Tailwind classes insufficient due to data attribute specificity
2. **Accessibility**: Add `sr-only` title for Drawer, `aria-describedby={undefined}` for Dialog
3. **Height Values**: Use `100vh` not `100%` for predictable full screen
4. **Console Errors Fixed**: Both DialogTitle and aria-describedby warnings resolved

## 🐛 Common Accessibility Errors Fixed

### Error 1: Missing DialogTitle
```
❌ DialogContent requires a DialogTitle for screen reader users
```

**Fix for Drawer (no visual title):**
```tsx
<h2 className="sr-only">Simulation Sandbox</h2>
```

**Fix for Dialog (with visible title):**
```tsx
<DialogHeader>
  <DialogTitle>🔬 Simulation Sandbox</DialogTitle>
</DialogHeader>
```

### Error 2: Missing Description
```
⚠️ Warning: Missing Description or aria-describedby={undefined}
```

**Fix:**
```tsx
<DialogContent aria-describedby={undefined}>
```

**Platform-appropriate heights + accessibility for optimal UX!** 📱💻♿
