# Category Breakdown Refactor - QUICK REFERENCE

## 🎯 WHAT CHANGED

**Old:** Simple pie chart + top 3 categories  
**New:** Powerful dashboard with budget tracking, MoM comparison, and insights

---

## 📊 LAYOUTS

### Desktop (≥768px)
```
[ Horizontal Bar Chart ] | [ Smart Category List ]
        (Left)            |        (Right)
       400px H            |      Scrollable
```

### Mobile (<768px)
```
[ Compact Category Cards ]
     (Scrollable)
```

---

## 🎨 BUDGET STATUS COLORS

| Status | Threshold | Color | Hex |
|--------|-----------|-------|-----|
| 🟢 Safe | < warningAt (default 80%) | Green | #10B981 |
| 🟡 Warning | warningAt - 89% | Amber | #F59E0B |
| 🟠 Danger | 90% - 99% | Orange | #F97316 |
| 🔴 Exceeded | ≥ 100% | Red | #EF4444 |

---

## 📈 DATA FEATURES

### 1. Budget Tracking
- Shows progress bar if category has budget limit
- Color-coded by status (safe/warning/danger/exceeded)
- Displays: `Rp X dari budget Rp Y (Z%)`

### 2. Month-over-Month (MoM)
- Compares current vs previous month
- Shows diff with trend icon:
  - 🔺 TrendingUp (red) if spending increased
  - ✅ TrendingDown (green) if spending decreased
- Format: `🔺 +Rp 200.000` or `✅ -Rp 50.000`

### 3. 3-Month Average
- Displays in header: `Avg 3 bulan: Rp 4.800.000`
- Provides spending context
- Helps identify unusual months

---

## 🔧 NEW HELPER FUNCTIONS

**File:** `/utils/calculations.ts`

```typescript
// Get budget status
getBudgetStatus(spent: number, limit: number, warningAt: number): BudgetStatus

// Get status color
getBudgetStatusColor(status: BudgetStatus): string

// Get status label
getBudgetStatusLabel(status: BudgetStatus, warningAt: number): string

// Calculate percentage
getBudgetPercentage(spent: number, limit: number): number
```

---

## 💻 USAGE

### In Parent Component
```tsx
<CategoryBreakdown
  monthKey="2025-11"
  pocketId="pocket-123"
  expenses={expenses}
  onCategoryClick={(category) => {
    // Filter expenses by category
    setActiveFilter(new Set([category]));
  }}
  activeFilter={activeFilter}
/>
```

### Click to Filter Flow
1. User clicks category card
2. `onCategoryClick(category)` called
3. Parent sets filter
4. ExpenseList shows filtered results
5. Drawer closes (mobile)

---

## 🎨 CSS CUSTOMIZATION

**Dynamic Progress Bar Color:**
```css
/* In globals.css */
[data-slot="progress"] [data-slot="indicator"] {
  background-color: var(--progress-background, var(--color-primary)) !important;
}
```

**Usage:**
```tsx
<Progress 
  value={80}
  style={{ '--progress-background': '#10B981' }}
/>
```

---

## 📱 RESPONSIVE BREAKPOINTS

| Device | Width | Layout |
|--------|-------|--------|
| Desktop | ≥768px | 2-column (bar chart + list) |
| Mobile | <768px | 1-column (compact cards) |

**Detection:** `useIsMobile()` hook

---

## 🚀 PERFORMANCE

**Optimizations:**
- `useMemo` for category data calculation
- `useCallback` for event handlers
- Staggered animations (0.05s delay per card)
- Conditional API calls (only if needed)

**Loading States:**
- Skeleton loader while fetching
- Empty state with helpful message

---

## 🐛 COMMON ISSUES

### Progress bar color not changing
**Fix:** Check data-slot in Progress component matches CSS selector

### MoM data not showing
**Fix:** Ensure previous month API call succeeds (check network tab)

### Click to filter not working
**Fix:** Ensure `onCategoryClick` prop is passed and parent handles it

### Mobile layout shows bar chart
**Fix:** Check `useIsMobile()` hook returns correct value

---

## 📚 FILES MODIFIED

| File | Purpose |
|------|---------|
| `/utils/calculations.ts` | Budget status helpers |
| `/components/CategoryBreakdown.tsx` | Main component (rewritten) |
| `/components/ui/progress.tsx` | Fixed data-slot |
| `/styles/globals.css` | Dynamic color support |

---

## 🧪 QUICK TEST

1. Set budget Rp 500K for "Game"
2. Add expense Rp 550K Game
3. Check:
   - ✅ Progress bar is RED (exceeded)
   - ✅ Shows "110%" 
   - ✅ MoM badge visible (if prev month exists)
   - ✅ Click card → filters work
   - ✅ Desktop shows bar chart
   - ✅ Mobile shows compact cards

---

## 💡 PRO TIPS

1. **Budget Status:** Set warning threshold in BudgetLimitEditor, breakdown will auto-sync
2. **MoM Insights:** Check badge color - red means spending up, green means down
3. **3-Month Avg:** Compare current vs avg to spot unusual spending patterns
4. **Click to Drill Down:** Click any category to see detailed transaction list
5. **Mobile First:** Design works great on small screens, no horizontal scroll!

---

**Quick Links:**
- [Full Documentation](/planning/category-breakdown-refactor/IMPLEMENTATION_COMPLETE.md)
- [Budget System Explained](/docs/BUDGET_LIMIT_SYSTEM_EXPLAINED.md)
- [Planning](/planning/category-breakdown-refactor/PLANNING.md)
