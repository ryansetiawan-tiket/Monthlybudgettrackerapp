# Implementation Steps - Category Breakdown Refactor

## Step 1: Budget Status Helper Functions
**File:** `/utils/calculations.ts`

```typescript
export function getBudgetStatus(
  spent: number,
  limit: number,
  warningAt: number
): 'safe' | 'warning' | 'danger' | 'exceeded' {
  const percentage = (spent / limit) * 100;
  if (percentage >= 100) return 'exceeded';
  if (percentage >= 90) return 'danger';
  if (percentage >= warningAt) return 'warning';
  return 'safe';
}

export function getBudgetStatusColor(status: string): string {
  const colors = {
    safe: '#10B981',
    warning: '#F59E0B',
    danger: '#F97316',
    exceeded: '#EF4444'
  };
  return colors[status] || colors.safe;
}
```

---

## Step 2: MoM Data Fetching
**File:** `/components/CategoryBreakdown.tsx`

```typescript
// Fetch previous month expenses
const fetchPreviousMonth = async () => {
  const [year, month] = monthKey.split('-').map(Number);
  const prevDate = new Date(year, month - 2, 1); // -2 because month is 1-indexed
  const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
  
  // Fetch from API
  const response = await fetch(...);
  return response.json();
};

// Calculate MoM diff
function calculateMoM(current: number, previous: number) {
  const diff = current - previous;
  const percentage = previous > 0 ? ((diff / previous) * 100) : 0;
  const trend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'same';
  return { diff, percentage, trend };
}
```

---

## Step 3: Desktop Layout
**File:** `/components/CategoryBreakdown.tsx`

```tsx
{!isMobile && (
  <div className="grid grid-cols-2 gap-6">
    {/* LEFT: Horizontal Bar Chart */}
    <div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={categoryData} layout="vertical">
          <XAxis type="number" />
          <YAxis type="category" dataKey="label" width={80} />
          <Tooltip />
          <Bar dataKey="amount" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
    
    {/* RIGHT: Smart List */}
    <ScrollArea className="h-[400px]">
      {categoryData.map(item => (
        <CategorySmartCard
          key={item.category}
          data={item}
          onClick={() => handleCategoryClick(item.category)}
        />
      ))}
    </ScrollArea>
  </div>
)}
```

---

## Step 4: Mobile Layout
**File:** `/components/CategoryBreakdown.tsx`

```tsx
{isMobile && (
  <ScrollArea className="max-h-[60vh]">
    {categoryData.map(item => (
      <CategoryCompactCard
        key={item.category}
        data={item}
        onClick={() => handleCategoryClick(item.category)}
      />
    ))}
  </ScrollArea>
)}
```

---

## Step 5: Smart Card Component
**File:** `/components/CategoryBreakdown.tsx` (internal)

```tsx
function CategorySmartCard({ data, onClick }) {
  const { budget, mom } = data;
  
  return (
    <Card 
      className="p-3 mb-2 cursor-pointer hover:bg-muted/50"
      onClick={onClick}
    >
      {/* Row 1: Icon + Name + Count */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{data.emoji}</span>
          <span className="font-medium">{data.label}</span>
          <span className="text-xs text-muted-foreground">
            ({data.count} trans)
          </span>
        </div>
      </div>
      
      {/* Row 2: Amount + MoM */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold">{formatCurrency(data.amount)}</span>
        {mom && (
          <Badge variant={mom.trend === 'up' ? 'destructive' : 'default'}>
            {mom.trend === 'up' ? '🔺' : '✅'} 
            {formatCurrency(Math.abs(mom.diff))}
          </Badge>
        )}
      </div>
      
      {/* Row 3: Progress Bar (if budget enabled) */}
      {budget && (
        <>
          <Progress 
            value={Math.min(budget.percentage, 100)} 
            className="h-2 mb-1"
            style={{ 
              '--progress-background': getBudgetStatusColor(budget.status) 
            }}
          />
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Budget: {formatCurrency(budget.limit)}
            </span>
            <span 
              className="font-medium"
              style={{ color: getBudgetStatusColor(budget.status) }}
            >
              {budget.percentage.toFixed(0)}%
            </span>
          </div>
        </>
      )}
    </Card>
  );
}
```

---

## Step 6: Compact Card (Mobile)
**File:** `/components/CategoryBreakdown.tsx` (internal)

```tsx
function CategoryCompactCard({ data, onClick }) {
  return (
    <Card 
      className="p-3 mb-2 cursor-pointer"
      onClick={onClick}
    >
      {/* Line 1 */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{data.emoji}</span>
        <span className="font-medium">{data.label}</span>
        <span className="text-xs text-muted-foreground">
          ({data.count} transaksi)
        </span>
      </div>
      
      {/* Line 2 */}
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold">{formatCurrency(data.amount)}</span>
        {data.mom && (
          <span className="text-xs">
            {data.mom.trend === 'up' ? '🔺' : '✅'} 
            {formatCurrency(Math.abs(data.mom.diff))}
          </span>
        )}
      </div>
      
      {/* Line 3 - Progress bar if budget */}
      {data.budget && (
        <Progress 
          value={Math.min(data.budget.percentage, 100)}
          className="h-2 mb-1"
        />
      )}
      
      {/* Line 4 - Budget context */}
      {data.budget && (
        <div className="text-xs text-muted-foreground">
          Budget: {formatCurrency(data.budget.limit)}
        </div>
      )}
    </Card>
  );
}
```

---

## Step 7: Click Handler
**File:** `/components/CategoryBreakdown.tsx`

```typescript
const handleCategoryClick = useCallback((category: ExpenseCategory) => {
  if (onCategoryClick) {
    onCategoryClick(category);
    // Close drawer/dialog if mobile
    if (isMobile) {
      onOpenChange?.(false);
    }
  }
}, [onCategoryClick, isMobile]);
```

---

## Step 8: Header Enhancement
**File:** `/components/CategoryBreakdown.tsx`

```tsx
<CardHeader>
  <div className="flex items-center justify-between">
    <CardTitle>📊 Breakdown per Kategori</CardTitle>
    <div className="text-right">
      <p className="font-semibold">Total: {formatCurrency(totalExpenses)}</p>
      {threeMonthAvg > 0 && (
        <p className="text-xs text-muted-foreground">
          Avg 3 bulan: {formatCurrency(threeMonthAvg)}
        </p>
      )}
    </div>
  </div>
</CardHeader>
```

---

## 🎯 ORDER OF EXECUTION

1. ✅ Step 1: Budget helpers
2. ✅ Step 2: MoM fetching
3. ✅ Step 3: Desktop layout
4. ✅ Step 4: Mobile layout  
5. ✅ Step 5: Smart card component
6. ✅ Step 6: Compact card component
7. ✅ Step 7: Click handler
8. ✅ Step 8: Header enhancement

---

**Ready to implement!**
