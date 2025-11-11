# Simulation Sandbox Scroll Fix - Quick Reference

## 🎯 The Problem
ScrollArea tidak scroll di desktop dan mobile.

## 🔑 The Solution (3 Key Changes)

### 1. Add `min-h-0` to ScrollArea ⭐ MOST CRITICAL
```tsx
// ❌ BEFORE
<ScrollArea className="flex-1">

// ✅ AFTER
<ScrollArea className="flex-1 min-h-0">
```

**Why:** Allows flexbox to constrain height properly.

### 2. Add `shrink-0` to All Fixed Elements
```tsx
// All non-scrollable elements need this
<div className="... shrink-0">  {/* Metrics */}
<Tabs className="... shrink-0">  {/* Tabs */}
<div className="... shrink-0">  {/* Footer */}
```

**Why:** Prevents them from shrinking and stealing space.

### 3. Remove `overflow-hidden` Everywhere
```tsx
// ❌ BEFORE
<div className="flex flex-col overflow-hidden">
<DialogContent className="... overflow-hidden">
<DrawerContent className="... overflow-hidden">

// ✅ AFTER
<div className="flex flex-col h-full">
<DialogContent className="...">  {/* No overflow-hidden */}
<DrawerContent className="...">  {/* No overflow-hidden */}
```

**Why:** Let ScrollArea manage overflow itself.

## 📋 Checklist

Desktop:
- [ ] Can scroll list
- [ ] All buttons visible

Mobile:
- [ ] Can scroll list
- [ ] All buttons visible

## 🔗 Full Docs
See `/SIMULATION_SANDBOX_SCROLL_FIX.md` for complete technical explanation.

## 💡 The Magic Formula

```tsx
<Container className="h-[fixed] flex flex-col">
  <Header className="shrink-0" />
  <ScrollArea className="flex-1 min-h-0">
    {/* Content */}
  </ScrollArea>
  <Footer className="shrink-0" />
</Container>
```

**Remember:** `flex-1 min-h-0` is the secret sauce! 🎉
