# CategoryBreakdown - Quick Reference Card

**Component**: `/components/CategoryBreakdown.tsx`  
**Status**: ✅ Production Ready  
**Last Updated**: Nov 7, 2025

---

## ⚡ Quick Start

### Import & Use
```tsx
import { CategoryBreakdown } from "./components/CategoryBreakdown";

<CategoryBreakdown 
  monthKey="2025-11"
  expenses={expenses}
/>
```

---

## 📋 Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `monthKey` | `string` | ✅ | Format: "YYYY-MM" |
| `expenses` | `Expense[]` | ❌ | Pass from parent or will fetch |
| `pocketId` | `string` | ❌ | Filter by specific pocket |
| `onRefresh` | `() => void` | ❌ | Callback after refresh |

---

## 🎨 Features

### 1️⃣ Pie Chart
- Interactive recharts visualization
- Category color-coded slices
- Percentage labels
- Custom tooltip (emoji, name, amount, %, count)

### 2️⃣ Top 3 Widget
- 🥇 Gold, 🥈 Silver, 🥉 Bronze medals
- Sorted by amount DESC
- Shows amount + percentage

### 3️⃣ Full Category List
- Collapsible section
- All 11 categories (even Rp 0)
- Transaction count per category

---

## 🎨 Category Colors

```typescript
food         → #10B981 (green)   🍔
transport    → #3B82F6 (blue)    🚗
savings      → #8B5CF6 (violet)  💰
bills        → #F59E0B (amber)   📄
health       → #EF4444 (red)     🏥
loan         → #EC4899 (pink)    💳
family       → #06B6D4 (cyan)    👨‍👩‍👧‍👦
entertainment→ #F97316 (orange)  🎬
installment  → #6366F1 (indigo)  💸
shopping     → #14B8A6 (teal)    🛒
other        → #6B7280 (gray)    📦
```

---

## 📱 Responsive

### Desktop (≥768px)
- Grid 2 columns: Pie chart | Top 3
- Pie height: 300px, radius: 100px

### Mobile (<768px)
- Stacked layout
- Pie height: 250px, radius: 80px
- Compact cards

---

## 🔧 Data Flow

```typescript
Input: expenses[] → Filter negatives → Group by category
      ↓
Calculate amounts & counts per category
      ↓
Calculate percentages (amount / total * 100)
      ↓
Sort by amount DESC
      ↓
Render: Pie Chart + Top 3 + Full List
```

---

## 🧪 Test Scenarios

```bash
# Empty state
expenses = [] → Shows empty state message

# Single category
expenses = [food, food] → 100% food pie

# Multiple categories
expenses = [food, transport, bills] → Proper distribution

# Uncategorized
expenses = [{ category: undefined }] → Defaults to 'other'
```

---

## 💡 Common Tasks

### Get category data for custom use
```typescript
const categoryData = useMemo(() => {
  // ... component's internal logic
  return processedData;
}, [expenses]);
```

### Add click handler to pie slice
```typescript
// Future enhancement - not yet implemented
<Pie onClick={(data, index) => {
  console.log('Clicked category:', data.category);
  // Filter ExpenseList by category
}} />
```

---

## 🐛 Troubleshooting

### No data showing
- ✅ Check expenses array not empty
- ✅ Check expenses have negative amounts (expenses)
- ✅ Check category field exists on expense objects

### Percentages not summing to 100%
- ✅ Check calculation logic in useMemo
- ✅ Ensure all expenses included in total

### Colors not showing
- ✅ Check CATEGORY_COLORS mapping
- ✅ Verify recharts Cell component receiving fill prop

---

## 🚀 Next Steps

### Phase 6 (Planned)
- [ ] Add category budget limits
- [ ] Budget vs actual progress bars
- [ ] Over-budget warnings

### Phase 7 (Planned)
- [ ] Click pie slice → filter expenses
- [ ] Multi-category filter dropdown
- [ ] Sort expenses by category

---

## 📚 Related Docs

- [Full Planning Doc](./CATEGORY_BREAKDOWN_PLANNING.md)
- [Implementation Summary](./CATEGORY_BREAKDOWN_COMPLETE.md)
- [Future Analytics Roadmap](./FUTURE_ANALYTICS.md)

---

**Quick Ref Version**: 1.0  
**Component Version**: 1.0  
**Maintainer**: Development Team
