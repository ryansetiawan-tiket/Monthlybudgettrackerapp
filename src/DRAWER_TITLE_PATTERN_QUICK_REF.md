# 🎯 Drawer Title Pattern - Quick Reference

## ⚠️ CRITICAL RULE

**For Drawer without visible title, you MUST use `<DrawerTitle>` component with `sr-only` class!**

## ❌ WRONG (Will cause accessibility warnings)

```tsx
import { Drawer, DrawerContent } from './ui/drawer';

<Drawer open={open} onOpenChange={setOpen}>
  <DrawerContent>
    <h2 className="sr-only">Title</h2>  {/* ❌ NOT RECOGNIZED BY RADIX */}
    {content}
  </DrawerContent>
</Drawer>
```

**Error you'll get:**
```
❌ DialogContent requires a DialogTitle for screen reader users
⚠️ Warning: Missing Description or aria-describedby={undefined}
```

## ✅ CORRECT (No warnings)

```tsx
import { Drawer, DrawerContent, DrawerTitle } from './ui/drawer';

<Drawer open={open} onOpenChange={setOpen}>
  <DrawerContent>
    <DrawerTitle className="sr-only">Title</DrawerTitle>  {/* ✅ PROPER COMPONENT */}
    {content}
  </DrawerContent>
</Drawer>
```

## 🎓 Why?

**Radix UI Drawer uses Dialog primitive internally:**
- It programmatically checks for `DialogPrimitive.Title` component
- `DrawerTitle` wraps `DialogPrimitive.Title`
- Plain `<h2>`, `<h1>`, `<span>` etc. are NOT detected
- Even with `sr-only` class, must use proper component

## 📋 All Drawer Patterns

### Pattern A: Visible Title with Header
```tsx
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from './ui/drawer';

<Drawer open={open} onOpenChange={setOpen}>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Visible Title</DrawerTitle>
    </DrawerHeader>
    {content}
  </DrawerContent>
</Drawer>
```

### Pattern B: Hidden Title (Full Screen Experience)
```tsx
import { Drawer, DrawerContent, DrawerTitle } from './ui/drawer';

<Drawer open={open} onOpenChange={setOpen}>
  <DrawerContent style={{ height: '100vh' }}>
    <DrawerTitle className="sr-only">Hidden Title</DrawerTitle>
    {content}
  </DrawerContent>
</Drawer>
```

### Pattern C: Custom Styled Visible Title
```tsx
import { Drawer, DrawerContent, DrawerTitle } from './ui/drawer';

<Drawer open={open} onOpenChange={setOpen}>
  <DrawerContent>
    <DrawerTitle className="text-xl font-semibold mb-4">
      Custom Title
    </DrawerTitle>
    {content}
  </DrawerContent>
</Drawer>
```

## 🔍 Quick Checklist

When creating a Drawer:
- [ ] Import `DrawerTitle` from './ui/drawer'
- [ ] Use `<DrawerTitle>` component (not `<h2>` or other HTML tags)
- [ ] Add `className="sr-only"` if you want it hidden visually
- [ ] Verify no console errors about DialogContent/DialogTitle

## 📝 Import Examples

```tsx
// ✅ For Drawer with visible header
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from './ui/drawer';

// ✅ For Drawer with hidden title
import { Drawer, DrawerContent, DrawerTitle } from './ui/drawer';

// ❌ Missing DrawerTitle import - will cause errors!
import { Drawer, DrawerContent } from './ui/drawer';
```

## 🎯 Remember

**ALWAYS use the proper shadcn/ui component:**
- `<DrawerTitle>` for Drawer
- `<DialogTitle>` for Dialog
- `<AlertDialogTitle>` for AlertDialog

**NEVER use plain HTML headings for accessibility-critical titles!**

---

**Status:** Mandatory pattern for all Drawer implementations  
**Updated:** November 9, 2025  
**Related:** `/SIMULATION_SANDBOX_A11Y_FINAL_FIX.md`
