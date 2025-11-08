# Category Breakdown Refactor - PLANNING

## 🎯 GOAL
Transform CategoryBreakdown menjadi dashboard insight yang powerful dengan budget tracking visual.

---

## 📋 CHECKLIST

### Part 1: Logic Global
- [ ] **Budget Status Logic** - Import dari BudgetLimitEditor status indicators (Safe/Warning/Danger/Exceeded)
- [ ] **MoM Comparison** - Fetch previous month data, calculate diff, show 🔺/✅ badge
- [ ] **3-Month Average** - Calculate avg spending, display di header
- [ ] **Click to Filter** - Navigate ke filtered expense list saat klik category row

### Part 2: Desktop Layout
- [ ] **2-Column Layout** - Left: visualization, Right: data list
- [ ] **Horizontal Bar Chart** - Replace pie chart, show all 14 categories sorted by amount
- [ ] **Smart Category List** - Scrollable list dengan:
  - Category emoji + label + transaction count
  - Actual amount + MoM diff badge
  - Full-width progress bar (colored by status)
  - Budget context text (Rp X dari budget Rp Y)

### Part 3: Mobile Layout
- [ ] **1-Column Vertical** - Stack everything vertically
- [ ] **No Bar Chart** - Too narrow, skip it
- [ ] **Compact Cards** - 4-line format:
  - Line 1: [Emoji] Name (X trans)
  - Line 2: Rp Amount (🔺 +Rp diff)
  - Line 3: [Progress bar 209%] colored
  - Line 4: Budget: Rp X (muted)

---

## 🎨 BUDGET STATUS COLORS

```typescript
Safe (< warningAt): #10B981 (green)
Warning (warningAt-89%): #F59E0B (amber)
Danger (90-99%): #F97316 (orange)
Exceeded (100%+): #EF4444 (red)
```

---

## 🔧 DATA STRUCTURE

```typescript
interface CategoryWithBudget {
  category: string;
  emoji: string;
  label: string;
  amount: number;
  count: number;
  percentage: number;
  
  // NEW:
  budget?: {
    limit: number;
    warningAt: number;
    spent: number;
    percentage: number;
    status: 'safe' | 'warning' | 'danger' | 'exceeded';
  };
  
  mom?: {
    diff: number;
    percentage: number;
    trend: 'up' | 'down' | 'same';
  };
}
```

---

## 📊 NEW FUNCTIONS NEEDED

```typescript
// 1. Budget status
function getBudgetStatus(spent, limit, warningAt): status

// 2. MoM comparison
async function getPreviousMonthData(monthKey, pocketId): expenses[]
function calculateMoM(current, previous): { diff, percentage, trend }

// 3. 3-month average
async function getThreeMonthAverage(monthKey, pocketId): number

// 4. Navigate to filtered
function handleCategoryClick(category: string) {
  // Set filter in parent
  // Close breakdown drawer/dialog
}
```

---

## 🚀 IMPLEMENTATION ORDER

1. **Data Layer** - Fetch logic untuk previous month, calculate MoM, 3-month avg
2. **Budget Integration** - Connect to useCategorySettings, calculate status
3. **Desktop UI** - 2-column layout, horizontal bar chart, smart list
4. **Mobile UI** - 1-column compact cards
5. **Interactivity** - Click to filter functionality
6. **Polish** - Animations, loading states, empty states

---

## 📁 FILES TO MODIFY

- `/components/CategoryBreakdown.tsx` - Main refactor
- `/hooks/useCategorySettings.ts` - Already has budget data
- `/utils/calculations.ts` - Add budget status helpers
- `/components/ExpenseList.tsx` - Accept category filter from parent (already exists from Phase 7)

---

## ⚠️ CRITICAL NOTES

1. **Backward Compatibility** - Existing budget data in localStorage must work
2. **Mobile Responsive** - Must work perfectly on small screens
3. **Performance** - Fetch previous month data efficiently
4. **Filter Integration** - Phase 7 already has category filter, reuse it!

---

**Time Estimate:** 2-3 hours  
**Priority:** HIGH - User explicitly requested  
**Breaking Changes:** NO - Pure enhancement
