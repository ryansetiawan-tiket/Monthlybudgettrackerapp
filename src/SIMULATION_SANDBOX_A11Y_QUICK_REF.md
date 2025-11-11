# Accessibility Fix - Quick Reference

## 🎯 The Fix
Remove unnecessary `aria-describedby={undefined}` from DialogContent.

## ❌ Before
```tsx
<DialogContent aria-describedby={undefined}>
```

## ✅ After
```tsx
<DialogContent>
```

## 📋 Dialog Checklist
- [x] Has `<DialogTitle>` ✅ Required
- [x] No `aria-describedby={undefined}` ✅ Let Radix handle it
- [ ] Add `<DialogDescription>` if needed (optional)

## 💡 Golden Rule
**DialogTitle is mandatory. Everything else is optional.**

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

## 🔗 Full Docs
See `/SIMULATION_SANDBOX_A11Y_FIX.md` for complete explanation.
