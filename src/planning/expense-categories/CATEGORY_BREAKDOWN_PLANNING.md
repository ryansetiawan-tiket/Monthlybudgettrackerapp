# Category Breakdown Component - Planning Document

**Feature**: Visual analytics untuk menampilkan distribusi pengeluaran per kategori

---

## 🎯 Tujuan

Implementasi **Phase 5.1** dan **5.3** dari FUTURE_ANALYTICS.md:
1. **Pie Chart** distribusi spending per kategori
2. **Top Categories Widget** - Top 3 kategori terbanyak
3. **Category Summary List** - Detail semua kategori dengan nominal

---

## 📋 Scope

### ✅ In Scope (v1.0)
- [x] Pie chart dengan recharts library
- [x] Top 3 categories summary
- [x] Complete category list dengan emoji
- [x] Percentage + nominal untuk setiap kategori
- [x] Empty state (jika tidak ada data)
- [x] Responsive mobile & desktop
- [x] Filter by pocket (opsional)

### ❌ Out of Scope (Future)
- Budget limits per category (Phase 6)
- Category filters/sorting (Phase 7)
- Custom categories (Phase 8)
- AI auto-categorization (Phase 9)
- PDF export (Phase 10)

---

## 🎨 Visual Design

### Desktop Layout
```
┌─────────────────────────────────────────────────┐
│  📊 Breakdown per Kategori - November 2025     │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌────────────┐      ┌─────────────────────┐  │
│  │            │      │ 🥇 Top Kategori     │  │
│  │   Pie      │      ├─────────────────────┤  │
│  │   Chart    │      │ 🍔 Makanan          │  │
│  │            │      │    Rp 2,100,000     │  │
│  │            │      │    35%              │  │
│  │            │      ├─────────────────────┤  │
│  │            │      │ 🚗 Transportasi     │  │
│  └────────────┘      │    Rp 1,500,000     │  │
│                      │    25%              │  │
│                      ├─────────────────────┤  │
│                      │ 📄 Tagihan          │  │
│                      │    Rp 1,200,000     │  │
│                      │    20%              │  │
│                      └─────────────────────┘  │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ Detail Semua Kategori                     │ │
│  ├───────────────────────────────────────────┤ │
│  │ 🍔 Makanan           Rp 2,100,000  (35%) │ │
│  │ 🚗 Transportasi      Rp 1,500,000  (25%) │ │
│  │ 📄 Tagihan           Rp 1,200,000  (20%) │ │
│  │ 🎬 Hiburan             Rp 600,000  (10%) │ │
│  │ 🛒 Belanja             Rp 600,000  (10%) │ │
│  │ 📦 Lainnya                     Rp 0   (0%)│ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Mobile Layout
```
┌─────────────────────────┐
│ 📊 Breakdown Kategori   │
├─────────────────────────┤
│                         │
│      ┌──────┐           │
│      │ Pie  │           │
│      │Chart │           │
│      └──────┘           │
│                         │
│ 🥇 Top 3 Kategori       │
│ ┌─────────────────────┐ │
│ │ 🍔 Makanan     35%  │ │
│ │    Rp 2,100,000    │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 🚗 Transport   25%  │ │
│ │    Rp 1,500,000    │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 📄 Tagihan     20%  │ │
│ │    Rp 1,200,000    │ │
│ └─────────────────────┘ │
│                         │
│ Semua Kategori ▼        │
│ (Collapsible)           │
└─────────────────────────┘
```

---

## 🔧 Component Architecture

### Component: `CategoryBreakdown.tsx`

**Location**: `/components/CategoryBreakdown.tsx`

**Props Interface**:
```typescript
interface CategoryBreakdownProps {
  monthKey: string;          // "2025-11"
  pocketId?: string;         // Optional: filter by pocket
  onRefresh?: () => void;    // Callback after data changes
}
```

**State**:
```typescript
const [loading, setLoading] = useState(true);
const [categoryData, setCategoryData] = useState<CategoryDataItem[]>([]);
const [totalExpenses, setTotalExpenses] = useState(0);
```

**Data Structure**:
```typescript
interface CategoryDataItem {
  category: ExpenseCategory;
  emoji: string;
  label: string;
  amount: number;        // Total pengeluaran
  count: number;         // Jumlah transaksi
  percentage: number;    // Persentase dari total
}
```

---

## 📊 Data Flow

### 1. Fetch Expenses
```typescript
// GET /timeline/{year}/{month}/{pocketId}
// OR aggregate from all pockets

const expenses = await fetchExpenses(monthKey, pocketId);
```

### 2. Process Category Data
```typescript
const categoryMap = new Map<ExpenseCategory, number>();

expenses.forEach(expense => {
  const category = expense.category || 'other';
  const current = categoryMap.get(category) || 0;
  categoryMap.set(category, current + Math.abs(expense.amount));
});

// Calculate percentages
const total = Array.from(categoryMap.values()).reduce((a, b) => a + b, 0);
const data = Array.from(categoryMap.entries()).map(([cat, amount]) => ({
  category: cat,
  emoji: getCategoryEmoji(cat),
  label: getCategoryLabel(cat),
  amount,
  count: expenses.filter(e => (e.category || 'other') === cat).length,
  percentage: (amount / total) * 100
}));

// Sort by amount DESC
data.sort((a, b) => b.amount - a.amount);
```

### 3. Render Charts
- **Pie Chart**: Use recharts `<PieChart>` component
- **Top 3**: Take first 3 items from sorted data
- **Full List**: Display all categories including 0-amount ones

---

## 🎨 UI Components

### 1. Pie Chart Section
```tsx
<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={categoryData}
      dataKey="amount"
      nameKey="label"
      cx="50%"
      cy="50%"
      outerRadius={80}
      label={({ percentage }) => `${percentage.toFixed(0)}%`}
    >
      {categoryData.map((entry, index) => (
        <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category]} />
      ))}
    </Pie>
    <Tooltip content={<CustomTooltip />} />
  </PieChart>
</ResponsiveContainer>
```

### 2. Top 3 Widget
```tsx
<div className="space-y-2">
  <h3>🥇 Top 3 Kategori</h3>
  {categoryData.slice(0, 3).map((item, index) => (
    <Card key={item.category}>
      <div className="flex justify-between">
        <div>
          <span>{['🥇', '🥈', '🥉'][index]}</span>
          <span>{item.emoji} {item.label}</span>
        </div>
        <div className="text-right">
          <p className="font-semibold">{formatCurrency(item.amount)}</p>
          <p className="text-sm text-muted-foreground">{item.percentage.toFixed(1)}%</p>
        </div>
      </div>
    </Card>
  ))}
</div>
```

### 3. Full Category List
```tsx
<Collapsible>
  <CollapsibleTrigger>
    Semua Kategori ({categoryData.length})
  </CollapsibleTrigger>
  <CollapsibleContent>
    {EXPENSE_CATEGORIES.map(cat => {
      const data = categoryData.find(d => d.category === cat);
      const amount = data?.amount || 0;
      const percentage = data?.percentage || 0;
      
      return (
        <div key={cat} className="flex justify-between py-2 border-b">
          <span>{getCategoryEmoji(cat)} {getCategoryLabel(cat)}</span>
          <div className="text-right">
            <p>{formatCurrency(amount)}</p>
            <p className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</p>
          </div>
        </div>
      );
    })}
  </CollapsibleContent>
</Collapsible>
```

---

## 🎨 Color Palette

**Category Colors** (for pie chart):
```typescript
const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  food: '#10B981',         // green-500
  transport: '#3B82F6',    // blue-500
  savings: '#8B5CF6',      // violet-500
  bills: '#F59E0B',        // amber-500
  health: '#EF4444',       // red-500
  loan: '#EC4899',         // pink-500
  family: '#06B6D4',       // cyan-500
  entertainment: '#F97316', // orange-500
  installment: '#6366F1',  // indigo-500
  shopping: '#14B8A6',     // teal-500
  other: '#6B7280',        // gray-500
};
```

---

## 📊 Empty State

```tsx
{categoryData.length === 0 && (
  <div className="text-center py-8">
    <div className="text-6xl mb-4">📊</div>
    <h3 className="text-lg font-medium mb-2">Belum Ada Data</h3>
    <p className="text-sm text-muted-foreground">
      Tambahkan pengeluaran untuk melihat breakdown kategori
    </p>
  </div>
)}
```

---

## 🔄 Integration with App

### Where to Place Component

**Option 1**: New Tab in BudgetOverview
```tsx
<Tabs>
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="categories">📊 Kategori</TabsTrigger>
  </TabsList>
  <TabsContent value="categories">
    <CategoryBreakdown monthKey={monthKey} />
  </TabsContent>
</Tabs>
```

**Option 2**: Separate Card in Dashboard
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <BudgetOverview {...} />
  <CategoryBreakdown monthKey={monthKey} />
</div>
```

**Option 3**: Expandable Section
```tsx
<Collapsible>
  <CollapsibleTrigger>
    <h2>📊 Lihat Breakdown Kategori</h2>
  </CollapsibleTrigger>
  <CollapsibleContent>
    <CategoryBreakdown monthKey={monthKey} />
  </CollapsibleContent>
</Collapsible>
```

**DECISION**: Go with **Option 2** for visibility + Option 3 for mobile (space efficiency)

---

## 🧪 Testing Checklist

### Functional Testing
- [ ] Data loads correctly from server
- [ ] Pie chart renders with correct percentages
- [ ] Top 3 categories sorted by amount DESC
- [ ] All 11 categories shown in full list (even if Rp 0)
- [ ] Empty state shows when no expenses
- [ ] Percentages sum to 100%
- [ ] Currency formatting correct

### Visual Testing
- [ ] Responsive on mobile (320px+)
- [ ] Pie chart readable on small screens
- [ ] Colors distinct and accessible
- [ ] Emoji display properly
- [ ] Loading skeleton shows during fetch

### Edge Cases
- [ ] Only 1 category has expenses (100%)
- [ ] All categories = Rp 0 (empty state)
- [ ] Very large amounts (billions)
- [ ] Very small percentages (<1%)
- [ ] Uncategorized expenses (default to 'other')

---

## 📝 Implementation Steps

### Step 1: Create Component File ✅
- Create `/components/CategoryBreakdown.tsx`
- Import dependencies (recharts, shadcn components)
- Setup basic structure

### Step 2: Data Fetching & Processing ✅
- Fetch expenses for monthKey
- Aggregate by category
- Calculate percentages
- Sort by amount

### Step 3: Pie Chart Implementation ✅
- Setup recharts PieChart
- Configure colors
- Add tooltip
- Add labels

### Step 4: Top 3 Widget ✅
- Display top 3 categories
- Medal icons 🥇🥈🥉
- Format currency & percentage

### Step 5: Full Category List ✅
- Collapsible section
- Show all 11 categories
- Include 0-amount categories

### Step 6: Integration ✅
- Add to App.tsx
- Pass monthKey prop
- Test with real data

### Step 7: Polish & Optimization ✅
- Add loading skeleton
- Add empty state
- Add motion animations
- Mobile responsive tweaks

---

## 🚀 Performance Considerations

### Optimization Strategies
1. **useMemo** for category calculations
2. **React.memo** for CategoryBreakdown component
3. **Debounce** data refresh (if realtime)
4. **Lazy load** recharts library (code splitting)

### Expected Performance
- **Load time**: < 200ms (after data fetch)
- **Render time**: < 100ms
- **Bundle size**: +15KB (recharts already in project)

---

## 🔮 Future Enhancements

### Phase 2 (Next Iteration)
1. **Click to drill down** - Click pie slice to filter ExpenseList
2. **Month-over-month comparison** - Show trend arrows
3. **Export to image** - Download pie chart as PNG
4. **Animated transitions** - Smooth chart updates

### Phase 3 (Later)
1. **Budget limits overlay** - Show budget vs actual
2. **Warning indicators** - Highlight over-budget categories
3. **Custom color picker** - User-defined category colors
4. **Category insights** - "You spent 20% more on food this month"

---

## 📦 Dependencies

### Already in Project ✅
- `recharts` - Chart library
- `lucide-react` - Icons
- `motion/react` - Animations
- Shadcn components (Card, Collapsible, etc.)

### No New Dependencies Needed ✅

---

## 🎯 Success Criteria

**MVP Complete When:**
- [x] Pie chart displays with all categories
- [x] Top 3 widget shows correct ranking
- [x] Full category list includes all 11 categories
- [x] Responsive on mobile & desktop
- [x] No crashes with empty/missing data
- [x] Integrated into main app flow

**User Validation:**
- User can see at-a-glance spending distribution
- User can identify top expense categories
- User can see detailed breakdown per category
- Visual is clear and actionable

---

## 📄 Related Documents

- [FUTURE_ANALYTICS.md](./FUTURE_ANALYTICS.md) - Full vision for analytics
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Category code snippets
- [README.md](./README.md) - Main category planning doc

---

## 🏁 Timeline

**Estimated Time**: 2-3 hours

**Phases**:
1. Component creation + data logic: 60 min
2. Pie chart implementation: 45 min
3. Top 3 + full list UI: 30 min
4. Integration + testing: 30 min
5. Polish + responsive: 15 min

---

**Planning Version**: 1.0  
**Created**: November 7, 2025  
**Status**: Ready for Implementation 🚀
