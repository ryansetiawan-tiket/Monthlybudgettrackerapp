# Simulation Sandbox UI Fix - Dialog Content Overflow

## 🐛 Bug Report
**Issue:** Content menembus dialog boundaries pada Simulation Sandbox, konten list tidak ter-contain dengan proper dan menyebabkan UI broken.

**Date:** November 9, 2025  
**Component:** `/components/SimulationSandbox.tsx`

## 📸 Before
- Konten list menembus batas dialog
- Tidak ada proper overflow handling
- ScrollArea tidak memiliki height constraint yang jelas
- Footer tidak sticky dan bisa ter-scroll

## 🔍 Root Cause Analysis

### Masalah Struktur Layout:
1. **Conflicting Height Values:**
   - `sandboxContent` menggunakan `h-full` yang mencoba mengambil 100% height dari parent
   - DialogContent memiliki `max-h-[80vh]` tapi tidak ada `overflow-hidden`
   - Menyebabkan content menembus boundaries

2. **Sticky Header Pattern Tidak Efektif:**
   - Sticky header di dalam div dengan `h-full` tidak bekerja dengan baik
   - Tidak ada proper flex structure untuk membagi space

3. **ScrollArea Tanpa Height Constraint:**
   - ScrollArea dengan `flex-1` tapi tidak ada overflow container
   - Tidak memiliki fixed height reference

4. **Footer Tidak Fixed:**
   - Footer tidak sticky sehingga bisa ter-scroll

## ✅ Solution Implemented

### 1. **Fixed Flex Structure**
```tsx
// OLD - Broken structure
<div className="flex flex-col h-full">
  <div className="sticky top-0 bg-background z-10 border-b pb-4 space-y-4">
    {/* Header content */}
  </div>
  <ScrollArea className="flex-1">
    {/* List */}
  </ScrollArea>
  <div className="border-t pt-4 space-y-2">
    {/* Footer */}
  </div>
</div>

// NEW - Fixed structure
<div className="flex flex-col overflow-hidden" style={{ maxHeight: 'inherit' }}>
  {/* Title (only mobile) */}
  {/* Cards - mb-4 */}
  {/* Global Deduction - mb-4 */}
  {/* Tabs - mb-4 */}
  
  <div className="flex-1 overflow-hidden">
    <ScrollArea className="h-full">
      {/* List */}
    </ScrollArea>
  </div>
  
  <div className="border-t pt-4 space-y-2 mt-4 bg-background">
    {/* Footer */}
  </div>
</div>
```

### 2. **Desktop Dialog Container**
```tsx
// OLD
<DialogContent className="max-w-4xl max-h-[80vh] flex flex-col p-6">
  <DialogHeader>
    <DialogTitle>🔬 Simulation Sandbox</DialogTitle>
  </DialogHeader>
  {sandboxContent}
</DialogContent>

// NEW - Added overflow-hidden and wrapper
<DialogContent className="max-w-4xl h-[80vh] flex flex-col p-6 overflow-hidden">
  <DialogHeader className="shrink-0">
    <DialogTitle>🔬 Simulation Sandbox</DialogTitle>
  </DialogHeader>
  <div className="flex-1 overflow-hidden">
    {sandboxContent}
  </div>
</DialogContent>
```

### 3. **Mobile Drawer Consistency**
```tsx
// Added overflow-hidden
<DrawerContent className="h-[95vh] flex flex-col p-4 overflow-hidden">
  {sandboxContent}
</DrawerContent>
```

## 🎯 Key Changes

### Layout Changes:
1. ✅ Removed sticky header pattern - converted to regular stacked elements
2. ✅ Added `overflow-hidden` to main container
3. ✅ Added `maxHeight: 'inherit'` inline style untuk inherit dari parent
4. ✅ Wrapped ScrollArea dengan `<div className="flex-1 overflow-hidden">`
5. ✅ Set ScrollArea `className="h-full"` untuk full height dari wrapper
6. ✅ Added `mt-4 bg-background` ke footer untuk visual separation

### Spacing Changes:
1. ✅ Converted sticky header sections ke individual sections dengan `mb-4`
2. ✅ Removed nested `space-y-4` wrapper
3. ✅ Each section now self-contained dengan proper margin

### Desktop Specific:
1. ✅ Changed `max-h-[80vh]` → `h-[80vh]` untuk fixed height
2. ✅ Added `overflow-hidden` ke DialogContent
3. ✅ Added `shrink-0` ke DialogHeader
4. ✅ Wrapped sandboxContent dengan `<div className="flex-1 overflow-hidden">`

### Mobile Specific:
1. ✅ Added `overflow-hidden` ke DrawerContent
2. ✅ Consistent structure dengan desktop

## 🧪 Testing Checklist

### Desktop Testing:
- [ ] Dialog tidak menembus boundaries
- [ ] Content list ter-scroll dengan smooth
- [ ] Header (title, cards, tabs) tidak scroll
- [ ] Footer tetap visible di bottom
- [ ] Dialog height 80vh dan tidak grow beyond
- [ ] Content tidak overflow horizontal

### Mobile Testing:
- [ ] Drawer tidak menembus boundaries
- [ ] Content list ter-scroll dengan smooth
- [ ] Title, cards, tabs tidak scroll
- [ ] Footer tetap visible di bottom
- [ ] Drawer height 95vh dan tidak grow beyond

### Functional Testing:
- [ ] Toggle checkbox berfungsi normal
- [ ] Tab switching berfungsi
- [ ] Save/Load simulation berfungsi
- [ ] Reset berfungsi
- [ ] Close button berfungsi
- [ ] ScrollArea smooth scroll

## 📊 Technical Details

### Flex Architecture:
```
DialogContent (h-[80vh], overflow-hidden, flex flex-col)
├── DialogHeader (shrink-0)
└── Wrapper (flex-1, overflow-hidden)
    └── sandboxContent (flex flex-col, overflow-hidden, maxHeight: inherit)
        ├── Title (mobile only, mb-4)
        ├── Cards (mb-4)
        ├── Global Deduction (mb-4, conditional)
        ├── Tabs (mb-4)
        ├── ScrollArea Wrapper (flex-1, overflow-hidden)
        │   └── ScrollArea (h-full)
        │       └── Transaction List
        └── Footer (mt-4, bg-background)
```

### Height Cascade:
1. `DialogContent`: Fixed `h-[80vh]`
2. `Wrapper div`: `flex-1` takes remaining space after DialogHeader
3. `sandboxContent`: `maxHeight: inherit` dari wrapper
4. `ScrollArea wrapper`: `flex-1` takes remaining space after header sections
5. `ScrollArea`: `h-full` fills wrapper completely

## 🎨 Visual Behavior

### Before Fix:
- ❌ Content menembus dialog
- ❌ Tidak bisa scroll dengan proper
- ❌ UI broken dan tidak user-friendly

### After Fix:
- ✅ Content ter-contain dalam dialog boundaries
- ✅ Smooth scrolling pada transaction list
- ✅ Header sections tetap visible saat scroll
- ✅ Footer tetap visible di bottom
- ✅ Responsive dan user-friendly

## 📝 Notes

### Why `maxHeight: inherit`?
- Inline style `maxHeight: inherit` diperlukan untuk mewarisi height constraint dari parent wrapper
- Tailwind `max-h-full` tidak cukup karena perlu inherit dari flex-1 wrapper

### Why Remove Sticky Header?
- Sticky positioning tidak bekerja dengan baik dalam flex container dengan overflow
- Simpler approach: stack sections dengan margin, let ScrollArea handle scrolling

### Why `overflow-hidden` di Multiple Levels?
- **DialogContent**: Prevent overflow dari entire dialog
- **Wrapper div**: Establish scrolling context
- **sandboxContent**: Prevent internal overflow
- **ScrollArea wrapper**: Contain scrolling area

## 🚀 Impact
- ✅ Bug fixed: Content tidak lagi menembus dialog
- ✅ UX improved: Proper scrolling behavior
- ✅ Visual consistency: Desktop dan mobile behavior consistent
- ✅ Maintainability: Cleaner flex structure tanpa sticky positioning

## 📚 Related Files
- `/components/SimulationSandbox.tsx` - Main component (UPDATED)

## ✨ Future Improvements
1. Consider adding resize handle untuk user adjust dialog height
2. Add scroll-to-top button untuk long lists
3. Consider virtual scrolling untuk performance dengan data besar
4. Add loading skeleton untuk transaction list
