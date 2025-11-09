# Drawer/Dialog Conditional Rendering Pattern Guide

**Date:** 2025-11-09  
**Context:** Critical bug fix for stuck overlay issue

---

## 🚨 The Problem

When you wrap a Drawer/Dialog in a conditional statement, the component **unmounts immediately** when the condition becomes false, **before the library can cleanup the overlay**.

---

## ❌ ANTI-PATTERN (Causes Stuck Overlay)

```tsx
// DON'T DO THIS!
{isOpen && (
  <Drawer open={isOpen} onOpenChange={setIsOpen}>
    <DrawerContent>
      {/* Your content */}
    </DrawerContent>
  </Drawer>
)}
```

### What Happens:
1. User closes drawer → `setIsOpen(false)`
2. React sees `{false && ...}` → Returns `null`
3. **Entire Drawer unmounts IMMEDIATELY**
4. Vaul library interrupted mid-cleanup
5. **Overlay stuck in DOM** with `z-50` blocking all clicks
6. 💥 **UI FROZEN**

---

## ✅ CORRECT PATTERN (Always Mount Wrapper)

```tsx
// DO THIS!
<Drawer open={isOpen} onOpenChange={setIsOpen}>
  {isOpen && (
    <DrawerContent>
      {/* Your content */}
    </DrawerContent>
  )}
</Drawer>
```

### What Happens:
1. User closes drawer → `setIsOpen(false)`
2. Drawer wrapper **stays mounted**
3. Vaul starts close animation (200-300ms)
4. **Overlay animates out properly**
5. Content conditionally hidden after animation
6. ✅ **Clean close, UI responsive**

---

## 📋 Pattern Variations

### With Additional Conditions

```tsx
// ✅ CORRECT - Combine conditions in `open` prop
<Drawer open={isOpen && hasData && !isLoading}>
  {isOpen && hasData && (
    <DrawerContent>
      {/* Content */}
    </DrawerContent>
  )}
</Drawer>
```

### With Desktop Dialog Alternative

```tsx
// ✅ CORRECT - Ternary at top level
{isMobile ? (
  <Drawer open={isOpen}>
    {isOpen && <DrawerContent>...</DrawerContent>}
  </Drawer>
) : (
  <Dialog open={isOpen}>
    {isOpen && <DialogContent>...</DialogContent>}
  </Dialog>
)}
```

### With Complex State

```tsx
// ✅ CORRECT - Wrapper always rendered
<Drawer open={!!editingId && !!editingData}>
  {editingId && editingData && (
    <DrawerContent>
      <EditForm data={editingData} />
    </DrawerContent>
  )}
</Drawer>
```

---

## 🧠 Why This Matters

### Vaul Library Lifecycle

1. **Mount Phase:**
   - Create portal
   - Mount overlay (`position: fixed`, `inset-0`, `z-50`)
   - Animate drawer in

2. **Open Phase:**
   - Drawer visible
   - Overlay blocks background clicks

3. **Close Phase:** 🎯 **CRITICAL**
   - Start close animation
   - Fade out overlay
   - Slide out drawer
   - **Remove overlay from DOM**
   - Cleanup event listeners

### When Wrapper Unmounts Early:

```
[User clicks close]
T+0ms:   setIsOpen(false)
T+0ms:   React sees {false && <Drawer>}
T+0ms:   React removes Drawer from virtual DOM
T+0ms:   Vaul cleanup interrupted ❌
T+0ms:   Overlay STUCK in real DOM
T+???:   User cannot click anything 💥
```

### With Always-Mounted Pattern:

```
[User clicks close]
T+0ms:   setIsOpen(false)
T+0ms:   Drawer open={false}
T+0ms:   Vaul starts close animation ✅
T+200ms: Animation complete
T+200ms: Overlay removed from DOM ✅
T+200ms: Content hidden by conditional
T+200ms: Everything clean, UI responsive 🎉
```

---

## 🎯 Implementation Checklist

When implementing Drawer/Dialog:

- [ ] Wrapper (`<Drawer>` or `<Dialog>`) is **NOT** inside conditional
- [ ] `open` prop is controlled by state/computed value
- [ ] Content (`<DrawerContent>` or `<DialogContent>`) is conditional if needed
- [ ] Same pattern used for both mobile (Drawer) and desktop (Dialog)
- [ ] `onOpenChange` handler updates state correctly
- [ ] Dialog registration added for back button support (mobile)

---

## 🔍 Real-World Example

### Before (Broken):
```tsx
// ExpenseList.tsx - BEFORE FIX
{editingIncomeId && editingIncome && onUpdateIncome && (
  isMobile ? (
    <Drawer open={!!editingIncomeId}>
      <DrawerContent>
        <AdditionalIncomeForm {...props} />
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={!!editingIncomeId}>
      <DialogContent>
        <AdditionalIncomeForm {...props} />
      </DialogContent>
    </Dialog>
  )
)}
```

**Problem:** When `editingIncomeId` becomes `null`, entire Drawer/Dialog unmounts → stuck overlay.

### After (Fixed):
```tsx
// ExpenseList.tsx - AFTER FIX
{isMobile ? (
  <Drawer open={!!editingIncomeId && !!editingIncome} onOpenChange={(open) => {
    if (!open) setEditingIncomeId(null);
  }}>
    {editingIncomeId && editingIncome && onUpdateIncome && (
      <DrawerContent>
        <AdditionalIncomeForm {...props} />
      </DrawerContent>
    )}
  </Drawer>
) : (
  <Dialog open={!!editingIncomeId && !!editingIncome} onOpenChange={(open) => {
    if (!open) setEditingIncomeId(null);
  }}>
    {editingIncomeId && editingIncome && onUpdateIncome && (
      <DialogContent>
        <AdditionalIncomeForm {...props} />
      </DialogContent>
    )}
  </Dialog>
)}
```

**Fixed:** Drawer/Dialog wrapper always mounted, only content is conditional → clean overlay cleanup.

---

## 🚀 Other Components to Check

Apply this pattern to ALL Drawer/Dialog implementations:

- [ ] Edit Expense Drawer
- [ ] Edit Income Drawer ✅ (Fixed)
- [ ] Transfer Dialog
- [ ] Wishlist Dialog
- [ ] Category Breakdown Drawer
- [ ] Pocket Timeline Modals
- [ ] Any custom modal/drawer components

---

## 📚 References

- **Bug Report:** `/planning/income-refactor-v3-polish/EDIT_INCOME_MOBILE_DRAWER_FIX.md`
- **Quick Ref:** `/planning/income-refactor-v3-polish/EDIT_INCOME_DRAWER_QUICK_FIX.md`
- **Vaul Docs:** https://github.com/emilkowalski/vaul
- **Radix Dialog:** https://www.radix-ui.com/primitives/docs/components/dialog

---

## 🎓 Key Takeaway

> **"Wrapper stays, content goes."**
> 
> Always mount the Drawer/Dialog wrapper. Use conditional rendering for the content inside.
> This allows the library to properly manage overlay lifecycle and cleanup.

---

**Remember:** If you see a stuck overlay bug, check the conditional rendering pattern FIRST!
