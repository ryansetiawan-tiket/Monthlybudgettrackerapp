# Simulation Sandbox UI Fix - Quick Reference

## 🎯 One-Line Summary
Fixed dialog content overflow by restructuring flex layout, adding proper overflow handling, and establishing clear height cascade.

## 🐛 Bug
Content menembus dialog boundaries, tidak ter-scroll dengan proper.

## ✅ Solution
Restructured flex layout dengan proper overflow handling di multiple levels.

## 🔧 Key Changes

### 1. Main Container Structure
```tsx
// Changed from sticky header pattern to stacked sections
<div className="flex flex-col overflow-hidden" style={{ maxHeight: 'inherit' }}>
  {/* All sections with mb-4 spacing */}
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

### 2. Desktop Dialog
```tsx
<DialogContent className="max-w-4xl h-[80vh] flex flex-col p-6 overflow-hidden">
  <DialogHeader className="shrink-0">
    <DialogTitle>🔬 Simulation Sandbox</DialogTitle>
  </DialogHeader>
  <div className="flex-1 overflow-hidden">
    {sandboxContent}
  </div>
</DialogContent>
```

### 3. Mobile Drawer
```tsx
<DrawerContent className="h-[95vh] flex flex-col p-4 overflow-hidden">
  {sandboxContent}
</DrawerContent>
```

## 📊 Height Cascade
1. DialogContent: `h-[80vh]` (fixed)
2. Wrapper: `flex-1` (remaining after header)
3. sandboxContent: `maxHeight: inherit`
4. ScrollArea wrapper: `flex-1` (remaining after sections)
5. ScrollArea: `h-full`

## 🎨 Layout Pattern

```
Fixed Height Dialog/Drawer
├── Header (shrink-0)
└── Content Wrapper (flex-1, overflow-hidden)
    └── Sections Container (flex flex-col, overflow-hidden, maxHeight: inherit)
        ├── Section 1 (mb-4)
        ├── Section 2 (mb-4)
        ├── Section 3 (mb-4)
        ├── Scrollable Area (flex-1, overflow-hidden)
        │   └── ScrollArea (h-full)
        └── Footer (mt-4, bg-background)
```

## ⚡ Quick Testing
1. Open Simulation Sandbox
2. Check dialog doesn't overflow
3. Verify smooth scrolling on transaction list
4. Ensure footer stays visible
5. Test on both desktop and mobile

## 📝 Key Lessons
- ❌ Don't use `h-full` on flex child in scrolling container
- ✅ Use `overflow-hidden` at multiple levels
- ✅ Establish clear height cascade
- ✅ Use inline `maxHeight: inherit` when needed
- ❌ Avoid sticky positioning in overflow flex containers

## 🔗 Full Documentation
See `/SIMULATION_SANDBOX_UI_FIX.md` for complete details.
