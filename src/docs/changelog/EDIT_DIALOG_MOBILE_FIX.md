# Edit Dialog Mobile Fix - Implementation Guide

**Date**: November 6, 2025  
**Status**: ✅ READY TO IMPLEMENT  

---

## 🎯 Changes Required

### 1. ExpenseList.tsx
**Line 1414-1533**: Replace Dialog with responsive Drawer/Dialog

**Changes**:
- Import `Drawer`, `DrawerContent`, `DrawerHeader`, `DrawerTitle` from `./ui/drawer`
- Import `useIsMobile` from `./ui/use-mobile`
- Add `const isMobile = useIsMobile()` in component
- Wrap edit dialog with conditional rendering:
  - Mobile: Use `<Drawer dismissible={true}>` with `<DrawerContent>`
  - Desktop: Use `<Dialog>` with `<DialogContent>`

### 2. AdditionalIncomeList.tsx
**Line 529-720**: Replace Dialog with responsive Drawer/Dialog  

**Changes**:
- Import `Drawer`, `DrawerContent`, `DrawerHeader`, `DrawerTitle` from `./ui/drawer`
- Import `useIsMobile` from `./ui/use-mobile`
- Add `const isMobile = useIsMobile()` in component
- Wrap edit dialog with conditional rendering (same pattern as ExpenseList)

### 3. AddExpenseDialog.tsx  
**Line 72-84**: Replace `Sheet` with `Drawer`

**Changes**:
- Change `<Sheet>` to `<Drawer dismissible={true}>`
- Change `<SheetContent>` to `<DrawerContent>`
- Change `<SheetHeader>` to `<DrawerHeader>`
- Change `<SheetTitle>` to `<DrawerTitle>`
- Remove `side="bottom"` prop (Drawer defaults to bottom)
- Keep `className="h-[75vh] flex flex-col rounded-t-2xl p-0"`

---

## 📝 Pattern to Follow

### Mobile (Drawer):
```tsx
{isMobile ? (
  <Drawer open={isOpen} onOpenChange={onOpenChange} dismissible={true}>
    <DrawerContent className="max-h-[90vh] flex flex-col">
      <DrawerHeader className="text-left border-b">
        <DrawerTitle>Title</DrawerTitle>
      </DrawerHeader>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Content */}
      </div>
      <div className="px-4 py-4 border-t bg-background sticky bottom-0">
        {/* Footer buttons */}
      </div>
    </DrawerContent>
  </Drawer>
) : (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Title</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        {/* Content */}
      </div>
      <div className="mt-6 flex justify-end gap-2">
        {/* Footer buttons */}
      </div>
    </DialogContent>
  </Dialog>
)}
```

---

## ✅ Benefits

1. **Swipe to close** - All drawer instances have `dismissible={true}`
2. **Native mobile feel** - Drawer slides from bottom
3. **Consistent UX** - Same pattern across all edit dialogs
4. **Better touch target** - Easier to interact on mobile
5. **Visual handle** - Drawer auto-shows handle bar for swipe gesture

---

## 🧪 Testing Checklist

- [ ] ExpenseList edit dialog → Drawer on mobile, Dialog on desktop
- [ ] AdditionalIncomeList edit dialog → Drawer on mobile, Dialog on desktop
- [ ] AddExpenseDialog → Uses Drawer instead of Sheet
- [ ] All drawers can be swiped down to close
- [ ] Handle bar visible on all drawers
- [ ] No layout shift or UI breaks
- [ ] Desktop dialogs work as before

---

**Status**: Implementation guide ready  
**Next**: Apply changes to actual files
