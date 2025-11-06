# Mobile Grouping UX - Quick Reference

**Quick lookup untuk perubahan mobile expense grouping**

---

## 📱 Key Changes at a Glance

| Element | Before | After |
|---------|--------|-------|
| **Group Header** | Single line | Multi-line (2 rows) |
| **Individual Items** | Single line | Stacked (2 rows) |
| **Touch Targets** | 24px (h-6 w-6) | 32px (h-8 w-8) |
| **Icon Size** | size-3 (12px) | size-4 (16px) |
| **Group Spacing** | space-y-2 | space-y-3 |
| **Padding** | p-2, p-3 | p-3, p-4 |
| **Rounded** | rounded-lg | rounded-2xl |

---

## 🎨 Layout Patterns

### **Group Header (Mobile)**
```tsx
<div className="md:hidden p-4 space-y-3">
  {/* Row 1: Date, badge, icon */}
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      {/* Date + Badge */}
    </div>
    {/* Expand icon */}
  </div>
  
  {/* Row 2: Total amount */}
  <div className="flex items-center justify-end">
    {/* Amount */}
  </div>
</div>
```

### **Individual Item (Mobile)**
```tsx
<div className="md:hidden p-3 space-y-2.5">
  {/* Row 1: Name + Pocket */}
  <div className="flex items-start gap-2">
    {/* Name, Badge */}
  </div>
  
  {/* Row 2: Amount + Actions */}
  <div className="flex items-center justify-between pl-8">
    {/* Amount, Buttons */}
  </div>
</div>
```

---

## 🔧 Utility Classes

### **Spacing**
```css
/* Mobile */
p-4             /* 16px padding */
p-3             /* 12px padding */
space-y-3       /* 12px gap */
space-y-2.5     /* 10px gap */

/* Desktop (keep original) */
md:p-3          /* 12px padding */
md:p-2          /* 8px padding */
md:space-y-2    /* 8px gap */
```

### **Touch Targets**
```css
/* Mobile - WCAG compliant */
h-8 w-8         /* 32px × 32px */
size-4          /* 16px icon */

/* Desktop */
md:h-6 md:w-6   /* 24px × 24px */
md:size-3       /* 12px icon */
```

### **Borders**
```css
/* Groups */
rounded-2xl     /* 16px radius */

/* Items */
rounded-xl      /* 12px radius */

/* Sub-items */
rounded-lg      /* 8px radius */
md:rounded-none /* Desktop no radius */
```

---

## 📐 Responsive Breakpoints

### **Show/Hide Pattern**
```tsx
{/* Mobile only */}
<div className="md:hidden">
  {/* Mobile-optimized layout */}
</div>

{/* Desktop only */}
<div className="hidden md:flex">
  {/* Original desktop layout */}
</div>
```

**Breakpoint:** `md` = 768px

---

## 🎯 Testing Commands

### **Mobile Viewport**
```bash
# Chrome DevTools
Ctrl+Shift+M (Windows/Linux)
Cmd+Shift+M (Mac)

# Test dimensions
375×667  # iPhone SE
390×844  # iPhone 12/13
360×640  # Android (small)
```

### **Visual Check**
- [ ] Group header in 2 rows
- [ ] Items in stacked layout
- [ ] Touch targets 32px+
- [ ] No horizontal scroll
- [ ] Comfortable spacing

---

## 🐛 Common Issues

### **Issue:** Layout breaks on small screens
**Fix:** Check for `min-w-0` on flex containers

### **Issue:** Text overflow
**Fix:** Use `truncate` or wrap with proper width

### **Issue:** Touch targets overlap
**Fix:** Increase spacing with `gap-1` → `gap-2`

### **Issue:** Desktop shows mobile layout
**Fix:** Check `md:hidden` / `hidden md:flex` pairing

---

## 📊 Before/After

### **Group Header**
```tsx
// ❌ Before (cramped)
<div className="flex items-center justify-between p-3">
  <div className="flex-1 flex items-center gap-2">
    {date} {count} {icon}
  </div>
  <div>{amount}</div>
</div>

// ✅ After (spacious mobile)
<div className="md:hidden p-4 space-y-3">
  <div className="flex items-center justify-between">
    {date} {badge} {icon}
  </div>
  <div className="flex items-center justify-end">
    {amount}
  </div>
</div>
```

---

## 🔗 Related Files

- `/components/ExpenseList.tsx` - Main component
- `/docs/changelog/MOBILE_EXPENSE_GROUPING_UX_IMPROVEMENT.md` - Full doc
- `/components/ui/badge.tsx` - Badge component
- `/components/ui/button.tsx` - Button component

---

## 💡 Quick Tips

1. **Always test on real mobile device**
   - Simulator ≠ Real device
   - Touch behavior differs

2. **Use 32px minimum for touch**
   - WCAG 2.1 Level AAA
   - Apple HIG: 44pt

3. **More space on mobile**
   - Desktop: Dense
   - Mobile: Spacious

4. **Keep desktop unchanged**
   - Use `hidden md:flex` pattern
   - Zero regressions

5. **Test edge cases**
   - Long names
   - Many items
   - Small screens

---

## ✅ Checklist

**Before committing:**
- [ ] Test on mobile viewport
- [ ] Test on desktop viewport
- [ ] Check touch target sizes
- [ ] Verify text doesn't overflow
- [ ] Ensure smooth transitions
- [ ] No horizontal scroll
- [ ] All actions accessible
- [ ] Visual hierarchy clear

---

**Updated:** 6 November 2025  
**Maintained by:** AI Assistant
