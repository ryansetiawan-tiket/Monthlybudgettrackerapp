# 🎯 Hybrid Insight Boxes v3 - Platform-Aware Implementation Plan

**Status**: ✅ Planning Complete  
**Target Component**: `CategoryBreakdown.tsx`  
**Platforms**: Desktop (Modal) & Mobile (Drawer)  
**Created**: 2025-11-09

---

## 📋 Executive Summary

Upgrade modal 'Breakdown Kategori' dengan **2 jenis insight boxes** baru yang memberikan insight kontekstual dan actionable kepada user. Insight boxes ini akan **platform-aware** dengan layout yang disesuaikan untuk Desktop (Modal) dan Mobile (Drawer).

### Visual Hierarchy (Desktop vs Mobile)

**Desktop (Modal Layout):**
```
┌─────────────────────────────────────────────────────────────┐
│  [X] Breakdown Kategori                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 🚀 TO THE MOON! Kategori "Game" naik 150% bulan ini! │ │ ← Dynamic Box
│  │ [Click untuk filter]                                  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 💸 HARI PALING BOROS ANDA                            │ │ ← Static Box
│  │ Senin, 10 Nov (Total: Rp 800.000)                    │ │
│  │ [ Lihat Detail Transaksi > ]                         │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  📊 Breakdown per Kategori          Total: Rp 5.331.719   │
│                                                             │
│  ┌──────────────────┬──────────────────────────────────┐   │
│  │  Bar Chart       │  Smart List (Cards)              │   │
│  │  (Left Col)      │  (Right Col)                     │   │
│  └──────────────────┴──────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Mobile (Drawer Layout):**
```
┌─────────────────────────────────┐
│  Breakdown Kategori             │
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────────┐  │
│  │ ☕ Kopi pagi, ya?         │  │ ← Dynamic Box
│  │ Kategori "Drinks" dominan│  │
│  │ [Tap untuk filter]       │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 💸 HARI PALING BOROS     │  │ ← Static Box
│  │ Senin, 10 Nov            │  │
│  │ Total: Rp 800.000        │  │
│  │ [ Lihat Detail > ]       │  │
│  └───────────────────────────┘  │
│                                 │
│  📊 Breakdown per Kategori      │
│  Total: Rp 5.331.719            │
│                                 │
│  ┌───────────────────────────┐  │
│  │  Smart List (Full Width)  │  │
│  │  - Keluarga (1.5M)        │  │
│  │  - Game (1.0M)            │  │
│  │  - Kids (761K)            │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

---

## 🎨 Component 1: Dynamic Insight Box (The "Fun" Box)

### Core Logic: Insight Engine

**3 Jenis Insight:**

#### 1. **Category Trend Insight** (Tren Kategori)
**Trigger Condition**: Kategori dengan perubahan signifikan (>50% naik/turun) vs bulan lalu

**Variasi Teks (5 variants):**
```tsx
const categoryTrendVariants = [
  {
    emoji: "🚀",
    template: (category: string, percentage: number) => 
      `TO THE MOON! Kategori "${category}" naik ${percentage}% bulan ini!`
  },
  {
    emoji: "📈",
    template: (category: string, percentage: number) => 
      `STONKS! "${category}" melonjak ${percentage}%! What happened? 👀`
  },
  {
    emoji: "💰",
    template: (category: string, percentage: number) => 
      `Wow! Budget "${category}" tumbuh ${percentage}%. New hobby detected?`
  },
  {
    emoji: "🔥",
    template: (category: string, percentage: number) => 
      `PANAS! Pengeluaran "${category}" eksplosi ${percentage}% 🌶️`
  },
  {
    emoji: "⚡",
    template: (category: string, percentage: number) => 
      `ZAPP! Kategori "${category}" nge-charge ${percentage}% lebih tinggi!`
  }
];
```

#### 2. **Behavior Insight** (Perilaku Pengguna)
**Trigger Condition**: Kategori dominan (>30% dari total pengeluaran)

**Variasi Teks (5 variants):**
```tsx
const behaviorInsightVariants = [
  {
    emoji: "☕",
    template: (category: string, percentage: number) => 
      `Kopi pagi, ya? Kategori "${category}" dominan di ${percentage}% pengeluaran Anda.`
  },
  {
    emoji: "🎮",
    template: (category: string, percentage: number) => 
      `Gamer detected! "${category}" mengambil ${percentage}% budget bulanan.`
  },
  {
    emoji: "🍕",
    template: (category: string, percentage: number) => 
      `Foodie alert! "${category}" mendominasi ${percentage}% spending Anda.`
  },
  {
    emoji: "🛒",
    template: (category: string, percentage: number) => 
      `Shopping spree? "${category}" makan ${percentage}% dari total budget!`
  },
  {
    emoji: "👨‍👩‍👧",
    template: (category: string, percentage: number) => 
      `Family first! "${category}" menghabiskan ${percentage}% budget Anda.`
  }
];
```

#### 3. **Day Trend Insight** (Tren Hari)
**Trigger Condition**: Hari dalam seminggu dengan pengeluaran tertinggi

**Variasi Teks (5 variants):**
```tsx
const dayTrendVariants = [
  {
    emoji: "📅",
    template: (day: string, amount: string) => 
      `Pattern alert! Anda paling royal di hari ${day} (${amount}).`
  },
  {
    emoji: "🗓️",
    template: (day: string, amount: string) => 
      `Fun fact: ${day} adalah "Payday Celebration Day" Anda (${amount})!`
  },
  {
    emoji: "💳",
    template: (day: string, amount: string) => 
      `Kartu gesek terbanyak: ${day} dengan total ${amount}!`
  },
  {
    emoji: "🎯",
    template: (day: string, amount: string) => 
      `Target locked! ${day} = Hari belanja terbesar (${amount}).`
  },
  {
    emoji: "⏰",
    template: (day: string, amount: string) => 
      `Clockwork spending! Setiap ${day}, Anda habis ${amount} rata-rata.`
  }
];
```

### Implementation Strategy: "Double Random"

```tsx
// 1. Analyze data and determine available insights
const availableInsights = analyzeExpenseData(expenses, selectedMonth);

// 2. Random selection: Pick insight type
const randomInsightType = availableInsights[Math.floor(Math.random() * availableInsights.length)];

// 3. Random selection: Pick text variant
const variants = getVariantsForType(randomInsightType);
const randomVariant = variants[Math.floor(Math.random() * variants.length)];

// 4. Generate final text
const insightText = randomVariant.template(...data);
```

### Click Action

**Behavior:**
- Saat box diklik → Filter breakdown berdasarkan kategori/hari yang disebutkan di insight
- Visual feedback: Box highlight saat hover, ripple effect saat click
- Filtered state: Update chip/badge "Filtered by: Game" di atas breakdown

**Desktop:**
```tsx
onClick={() => {
  if (insight.type === 'category') {
    handleCategoryClick(insight.category);
  } else if (insight.type === 'dayTrend') {
    handleDayFilter(insight.day);
  }
}}
```

**Mobile:**
Same behavior, but with haptic feedback (if available via Capacitor).

### Visual Design

**Desktop (Modal):**
```tsx
<div className="mb-4 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg cursor-pointer hover:border-purple-500/50 transition-all hover:shadow-md">
  <div className="flex items-start gap-3">
    <span className="text-2xl flex-shrink-0">{insight.emoji}</span>
    <div className="flex-1">
      <p className="text-sm font-medium text-foreground">{insight.text}</p>
      <p className="text-xs text-muted-foreground mt-1">Klik untuk filter 👆</p>
    </div>
  </div>
</div>
```

**Mobile (Drawer):**
```tsx
<div className="mx-4 mb-3 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg active:scale-[0.98] transition-transform">
  <div className="flex items-start gap-2">
    <span className="text-xl flex-shrink-0">{insight.emoji}</span>
    <div className="flex-1">
      <p className="text-xs font-medium text-foreground leading-tight">{insight.text}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">Tap untuk filter 👆</p>
    </div>
  </div>
</div>
```

---

## 📌 Component 2: Static Insight Box (The "Reflective" Box)

### Core Logic: "Hari Paling Boros"

**Data Processing:**
```tsx
// Group expenses by date
const expensesByDate = expenses.reduce((acc, expense) => {
  const date = expense.date; // "2025-11-10"
  if (!acc[date]) {
    acc[date] = { expenses: [], total: 0 };
  }
  acc[date].expenses.push(expense);
  acc[date].total += expense.amount;
  return acc;
}, {});

// Find date with highest total
const busiestDay = Object.entries(expensesByDate)
  .sort((a, b) => b[1].total - a[1].total)[0];

const { date, total, expenses: dayExpenses } = busiestDay;
```

**Display Format:**
```
[ 💸 ] HARI PALING BOROS ANDA
Senin, 10 Nov (Total: Rp 800.000)
[ Lihat Detail Transaksi > ]
```

### Click Action: "Detail Transaction Modal/Drawer"

**Behavior:**
- Button "Lihat Detail Transaksi >" → Open new modal/drawer
- Show all transactions from that specific day
- List format similar to ExpenseList
- Group by category (optional enhancement)

**Implementation:**
```tsx
const [showDayDetail, setShowDayDetail] = useState(false);
const [selectedDayData, setSelectedDayData] = useState(null);

const handleShowDayDetail = () => {
  setSelectedDayData({
    date: busiestDay.date,
    expenses: busiestDay.expenses,
    total: busiestDay.total
  });
  setShowDayDetail(true);
};
```

**Desktop: Dialog for Day Detail**
```tsx
<Dialog open={showDayDetail} onOpenChange={setShowDayDetail}>
  <DialogContent aria-describedby={undefined}>
    <DialogHeader>
      <DialogTitle>
        Transaksi Hari {formatDate(selectedDayData.date)}
      </DialogTitle>
    </DialogHeader>
    <div className="space-y-2">
      {selectedDayData.expenses.map(expense => (
        <ExpenseCard key={expense.id} {...expense} />
      ))}
    </div>
    <div className="pt-3 border-t">
      <p className="text-sm font-semibold">
        Total: {formatCurrency(selectedDayData.total)}
      </p>
    </div>
  </DialogContent>
</Dialog>
```

**Mobile: Drawer for Day Detail**
```tsx
<Drawer open={showDayDetail} onOpenChange={setShowDayDetail}>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>
        Transaksi {formatDate(selectedDayData.date)}
      </DrawerTitle>
    </DrawerHeader>
    <div className="px-4 pb-4 space-y-2 max-h-[60vh] overflow-y-auto">
      {selectedDayData.expenses.map(expense => (
        <ExpenseCard key={expense.id} {...expense} compact />
      ))}
    </div>
    <div className="px-4 py-3 border-t bg-muted/30">
      <p className="text-sm font-semibold">
        Total: {formatCurrency(selectedDayData.total)}
      </p>
    </div>
  </DrawerContent>
</Drawer>
```

### Visual Design

**Desktop (Modal):**
```tsx
<div className="mb-4 p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-lg">
  <div className="flex items-start gap-3">
    <span className="text-2xl flex-shrink-0">💸</span>
    <div className="flex-1">
      <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">
        Hari Paling Boros Anda
      </p>
      <p className="text-sm font-medium text-foreground">
        {formatDay(date)} ({formatCurrency(total)})
      </p>
      <button 
        onClick={handleShowDayDetail}
        className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1 hover:gap-2 transition-all"
      >
        Lihat Detail Transaksi
        <ChevronRight className="size-3" />
      </button>
    </div>
  </div>
</div>
```

**Mobile (Drawer):**
```tsx
<div className="mx-4 mb-3 p-3 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-lg">
  <div className="flex items-start gap-2">
    <span className="text-xl flex-shrink-0">💸</span>
    <div className="flex-1">
      <p className="text-[10px] font-semibold text-red-600 uppercase tracking-wide mb-0.5">
        Hari Paling Boros
      </p>
      <p className="text-xs font-medium text-foreground">
        {formatDay(date)} · {formatCurrency(total)}
      </p>
      <button 
        onClick={handleShowDayDetail}
        className="mt-1.5 text-[10px] text-red-600 font-medium flex items-center gap-0.5 active:scale-95 transition-transform"
      >
        Lihat Detail
        <ChevronRight className="size-3" />
      </button>
    </div>
  </div>
</div>
```

---

## 🔧 Integration into CategoryBreakdown.tsx

### Current Component Structure

**Desktop (useIsMobile = false):**
```tsx
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="max-w-5xl max-h-[85vh]">
    <DialogHeader>
      <DialogTitle>Breakdown Kategori</DialogTitle>
    </DialogHeader>
    
    {/* CURRENT: Direct content */}
    <div className="grid grid-cols-2 gap-6">
      {/* Left: Bar Chart */}
      {/* Right: Smart List */}
    </div>
  </DialogContent>
</Dialog>
```

**Mobile (useIsMobile = true):**
```tsx
<Drawer open={open} onOpenChange={onOpenChange}>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Breakdown Kategori</DrawerTitle>
    </DrawerHeader>
    
    {/* CURRENT: Smart List only */}
    <div className="px-4">
      {/* Smart List */}
    </div>
  </DrawerContent>
</Drawer>
```

### New Structure with Insight Boxes

**Desktop (Modal):**
```tsx
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="max-w-5xl max-h-[85vh]">
    <DialogHeader>
      <DialogTitle>Breakdown Kategori</DialogTitle>
    </DialogHeader>
    
    <div className="space-y-4">
      {/* ✨ NEW: Dynamic Insight Box */}
      {dynamicInsight && (
        <DynamicInsightBox 
          insight={dynamicInsight}
          onClick={handleInsightClick}
        />
      )}
      
      {/* ✨ NEW: Static Insight Box (Busiest Day) */}
      {busiestDayData && (
        <BusiestDayBox 
          date={busiestDayData.date}
          total={busiestDayData.total}
          onShowDetail={handleShowDayDetail}
        />
      )}
      
      {/* EXISTING: Header with total */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-5" />
          <h3 className="font-semibold">Breakdown per Kategori</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Total: {formatCurrency(total)}
        </p>
      </div>
      
      {/* EXISTING: 2-column layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left: Bar Chart */}
        {/* Right: Smart List */}
      </div>
    </div>
  </DialogContent>
</Dialog>
```

**Mobile (Drawer):**
```tsx
<Drawer open={open} onOpenChange={onOpenChange}>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Breakdown Kategori</DrawerTitle>
    </DrawerHeader>
    
    <div className="space-y-3">
      {/* ✨ NEW: Dynamic Insight Box */}
      {dynamicInsight && (
        <DynamicInsightBox 
          insight={dynamicInsight}
          onClick={handleInsightClick}
          compact
        />
      )}
      
      {/* ✨ NEW: Static Insight Box (Busiest Day) */}
      {busiestDayData && (
        <BusiestDayBox 
          date={busiestDayData.date}
          total={busiestDayData.total}
          onShowDetail={handleShowDayDetail}
          compact
        />
      )}
      
      {/* EXISTING: Header */}
      <div className="px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4" />
            <h3 className="text-sm font-semibold">Breakdown per Kategori</h3>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Total: {formatCurrency(total)}
        </p>
      </div>
      
      {/* EXISTING: Smart List */}
      <div className="px-4">
        {/* Smart List */}
      </div>
    </div>
  </DrawerContent>
</Drawer>
```

---

## 📁 File Structure

### New Components to Create

```
/components/
├── insight-boxes/
│   ├── DynamicInsightBox.tsx       # Dynamic insight with variants
│   ├── BusiestDayBox.tsx           # Static "Hari Paling Boros" box
│   └── DayDetailDialog.tsx         # Dialog/Drawer for day transactions
```

### Data/Logic Files

```
/utils/
└── insightEngine.ts                # Insight generation logic

/data/
└── insight-variants.ts             # Bank of text variations
```

---

## 🎯 Implementation Steps

### Phase 1: Data & Logic Layer (30 min)

**Step 1.1: Create Insight Variants Bank**
```bash
File: /data/insight-variants.ts
- Export categoryTrendVariants
- Export behaviorInsightVariants
- Export dayTrendVariants
```

**Step 1.2: Create Insight Engine**
```bash
File: /utils/insightEngine.ts
- Function: analyzeExpenseData()
- Function: generateDynamicInsight()
- Function: findBusiestDay()
- Function: doubleRandomSelection()
```

### Phase 2: UI Components (45 min)

**Step 2.1: Create DynamicInsightBox Component**
```bash
File: /components/insight-boxes/DynamicInsightBox.tsx
- Props: insight, onClick, compact?
- Desktop styling
- Mobile styling (compact mode)
- Click handler with filter logic
```

**Step 2.2: Create BusiestDayBox Component**
```bash
File: /components/insight-boxes/BusiestDayBox.tsx
- Props: date, total, onShowDetail, compact?
- Desktop styling
- Mobile styling (compact mode)
- Button click handler
```

**Step 2.3: Create DayDetailDialog Component**
```bash
File: /components/insight-boxes/DayDetailDialog.tsx
- Platform-aware: Dialog (desktop) vs Drawer (mobile)
- List of transactions for specific day
- Total summary footer
```

### Phase 3: Integration into CategoryBreakdown (30 min)

**Step 3.1: Import Components**
```tsx
import { DynamicInsightBox } from './insight-boxes/DynamicInsightBox';
import { BusiestDayBox } from './insight-boxes/BusiestDayBox';
import { DayDetailDialog } from './insight-boxes/DayDetailDialog';
import { generateDynamicInsight, findBusiestDay } from '../utils/insightEngine';
```

**Step 3.2: Add State Management**
```tsx
const [dynamicInsight, setDynamicInsight] = useState(null);
const [busiestDayData, setBusiestDayData] = useState(null);
const [showDayDetail, setShowDayDetail] = useState(false);
const [selectedDayData, setSelectedDayData] = useState(null);
```

**Step 3.3: Generate Insights on Open**
```tsx
useEffect(() => {
  if (open && filteredExpenses.length > 0) {
    // Generate dynamic insight (double random)
    const insight = generateDynamicInsight(filteredExpenses, selectedMonth);
    setDynamicInsight(insight);
    
    // Find busiest day
    const busiest = findBusiestDay(filteredExpenses);
    setBusiestDayData(busiest);
  }
}, [open, filteredExpenses]);
```

**Step 3.4: Add Components to Layout**
- Desktop: Insert before grid layout
- Mobile: Insert after DrawerHeader

### Phase 4: Testing & Polish (15 min)

**Test Cases:**
- [ ] Dynamic insight generates correctly on open
- [ ] Text variants are random (refresh test)
- [ ] Click on dynamic box filters breakdown
- [ ] Busiest day calculates correctly
- [ ] "Lihat Detail" opens day transaction dialog
- [ ] Day transaction dialog shows correct data
- [ ] Desktop layout spacing correct
- [ ] Mobile layout spacing correct
- [ ] Responsive behavior works
- [ ] Empty state handling (no expenses)

---

## 🎨 Design Tokens

### Colors

**Dynamic Insight Box:**
```scss
background: gradient-to-r from-purple-500/10 to-pink-500/10
border: border-purple-500/30
hover-border: border-purple-500/50
text: text-foreground
hint: text-muted-foreground
```

**Static Insight Box (Busiest Day):**
```scss
background: gradient-to-r from-red-500/10 to-orange-500/10
border: border-red-500/30
text: text-foreground
accent: text-red-600
button-hover: text-red-700
```

### Spacing

**Desktop:**
```scss
box-padding: p-4
gap-between-boxes: space-y-4
emoji-size: text-2xl
text-size: text-sm
hint-size: text-xs
```

**Mobile:**
```scss
box-padding: p-3
gap-between-boxes: space-y-3
horizontal-margin: mx-4
emoji-size: text-xl
text-size: text-xs
hint-size: text-[10px]
```

---

## 🚨 Edge Cases & Error Handling

### No Expenses
```tsx
if (expenses.length === 0) {
  return null; // Don't show insight boxes
}
```

### Insufficient Data for Trend
```tsx
if (expenses.length < 3) {
  // Skip category trend insight
  // Only show behavior or day trend if available
}
```

### Single Day of Expenses
```tsx
if (uniqueDays.length === 1) {
  // Still show busiest day box (it's the only day)
  // Adjust text: "Hari dengan transaksi: ..."
}
```

### No Clear Pattern
```tsx
if (!categoryTrend && !behaviorPattern && !dayTrend) {
  // Fallback insight
  const fallbackInsight = {
    emoji: "📊",
    text: `Total ${expenses.length} transaksi tercatat bulan ini.`,
    type: "fallback"
  };
}
```

---

## 📊 Success Metrics

### User Engagement
- [ ] Click-through rate on dynamic insight box >15%
- [ ] Click-through rate on "Lihat Detail" button >25%
- [ ] Time spent on breakdown modal increased >10%

### Technical Performance
- [ ] Insight generation <50ms
- [ ] No layout shift (CLS = 0)
- [ ] Smooth animations (60fps)

### User Feedback
- [ ] Insight text is "fun" and engaging
- [ ] Actionable filters are useful
- [ ] Day detail view provides value

---

## 🔄 Future Enhancements (Out of Scope)

1. **More Insight Types:**
   - Weekend vs Weekday pattern
   - Morning vs Night spender
   - Budget limit proximity warning

2. **Personalization:**
   - Remember user's preferred insight type
   - Adapt emoji based on category context

3. **Historical Comparison:**
   - "This month vs last 3 months average"
   - Year-over-year trends

4. **AI-Powered Insights:**
   - Predictive analytics
   - Anomaly detection
   - Smart recommendations

---

## ✅ Acceptance Criteria

### Desktop (Modal)
- [x] Planning complete
- [ ] Dynamic insight box appears at top of modal
- [ ] Static busiest day box appears below dynamic
- [ ] Both boxes above existing 2-column layout
- [ ] Click on dynamic box filters breakdown
- [ ] "Lihat Detail" opens dialog with day transactions
- [ ] Text variants are random on each open
- [ ] Responsive spacing and typography

### Mobile (Drawer)
- [x] Planning complete
- [ ] Dynamic insight box appears at top of drawer
- [ ] Static busiest day box appears below dynamic
- [ ] Both boxes above existing header
- [ ] Tap on dynamic box filters breakdown (with haptic)
- [ ] "Lihat Detail" opens drawer with day transactions
- [ ] Text variants are random on each open
- [ ] Compact styling optimized for mobile

### Cross-Platform
- [x] Planning complete
- [ ] Same logic, different presentation
- [ ] Consistent behavior across platforms
- [ ] No console errors
- [ ] Accessibility compliant (ARIA labels, keyboard nav)
- [ ] Error boundaries for graceful failures

---

## 📝 Notes for Implementation

### Platform Detection
```tsx
const isMobile = useIsMobile();

// Use for:
// - Component selection (Dialog vs Drawer)
// - Styling (compact vs full)
// - Interaction (click vs tap with haptic)
```

### Random Seed Stability
```tsx
// Don't re-randomize on re-render
// Only randomize on modal/drawer open (via useEffect with 'open' dependency)
```

### Performance Optimization
```tsx
// Memoize insight generation
const dynamicInsight = useMemo(() => 
  generateDynamicInsight(expenses), 
  [expenses, open]
);

// Memoize busiest day calculation
const busiestDay = useMemo(() => 
  findBusiestDay(expenses), 
  [expenses, open]
);
```

### Accessibility
```tsx
// Dynamic box
<div 
  role="button" 
  tabIndex={0}
  aria-label={`Filter by ${insight.category}`}
  onKeyPress={(e) => e.key === 'Enter' && handleClick()}
>

// Busiest day button
<button aria-label="Show transactions for busiest day">
  Lihat Detail Transaksi
</button>
```

---

**End of Planning Document**

**Next Step**: Proceed with implementation Phase 1 (Data & Logic Layer)
