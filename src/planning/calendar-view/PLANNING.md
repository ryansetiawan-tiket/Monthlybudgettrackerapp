# Calendar View - Planning Document

**Status**: Ready for Implementation  
**Created**: November 9, 2025  
**Framework**: CUCUD (Clarity, Usability, Consistency, Usefulness, Delight)

---

## 🎯 Overview

Calendar View adalah fitur baru yang memungkinkan user melihat transaksi bulanan dalam format kalender visual dengan dot indicators dan filtering by date.

**Core Value Proposition**:
- Visual overview of spending patterns per tanggal
- Quick access ke transaksi specific date
- Pattern recognition (hari boros, income days)

---

## 📐 CUCUD Framework Analysis

### **C - Clarity** (Kejelasan)

#### Desktop:
- ✅ **Layout**: Left (Calendar 60-65%) | Right (Transactions 35-40%)
- ✅ **Visual Hierarchy**: Calendar dominan, list supportive
- ✅ **Typography**: Consistent dengan app (no custom font-size)
- ✅ **Date Format**: "Sabtu, 8 Nov" (short, localized)

#### Mobile:
- ✅ **Layout**: Fullscreen calendar → Tap → Bottom drawer
- ✅ **Single Focus**: Calendar only (no split screen confusion)
- ✅ **Large Touch Targets**: Min 44x44px for date cells
- ✅ **Clear Feedback**: Dot indicators below dates

### **U - Usability** (Kemudahan Pakai)

#### Desktop:
- ✅ **Click Date**: Instant filter list di kanan (no loading state)
- ✅ **Draggable Divider**: User bisa adjust rasio calendar/list (optional v1.1)
- ✅ **Keyboard Nav**: Arrow keys untuk navigate dates
- ✅ **Scroll List**: Independent scroll untuk transaction list

#### Mobile:
- ✅ **Tap Date**: Bottom drawer slide-up (smooth 300ms)
- ✅ **Swipe Down**: Close drawer (native gesture)
- ✅ **Pull to Refresh**: Sync data (konsisten dengan app)
- ✅ **Back Button**: Close drawer atau exit calendar view

### **C - Consistency** (Konsistensi)

#### Critical Requirements:
- ✅ **Transaction List Layout**: MUST use ExpenseList "simple list" pattern
  - Date header dengan total harian (gray, subtle)
  - Item indentation
  - Pocket badge + amount right-aligned
  - Collapsible expansion untuk detail
- ✅ **Icons**: Lucide-react (consistent dengan app)
- ✅ **Colors**: Use existing tokens dari globals.css
- ✅ **Components**: Reuse Card, Badge, Drawer, Dialog
- ✅ **Mobile Gestures**: Use existing hooks (useSwipeGesture, useMobileBackButton)

### **U - Usefulness** (Kegunaan)

#### Desktop:
- ✅ **Dot Indicators**:
  - 🔴 Red dot = Ada pengeluaran
  - 🟢 Green dot = Ada pemasukan
  - Both = Stack vertically (red on top)
- ✅ **Visual Insight**: Highlight tanggal dengan spending tertinggi (subtle red bg)
- ✅ **Quick Stats**: Show total pengeluaran + pemasukan untuk selected date

#### Mobile:
- ✅ **Same Dot Indicators**: Konsisten dengan desktop
- ✅ **Drawer Header**: "Transaksi - Sabtu, 8 Nov" + total
- ✅ **Empty State**: Friendly message jika no transactions

### **D - Delight** (Kesenangan)

#### Animations:
- ✅ **Desktop**: Fade-in list saat filter date (200ms ease-out)
- ✅ **Mobile**: Smooth drawer slide-up (300ms spring)
- ✅ **Date Select**: Subtle scale animation (1.05x) on click
- ✅ **Dot Pulse**: Today's date dot pulse animation

#### Visual Polish:
- ✅ **Weekend Highlighting**: Sabtu/Minggu dengan subtle green tint
- ✅ **Today Indicator**: Blue ring around today's date
- ✅ **Highest Spending Day**: Subtle red/orange gradient background

---

## 🏗️ Implementation Plan

### Phase 1: Global Entry Point (15 min)
**File**: `App.tsx` (or existing header component)

```tsx
// Add button next to "Budget Bulanan" (!!!)
<Button
  variant="ghost"
  size="icon"
  onClick={() => setShowCalendarView(true)}
  className="h-9 w-9"
>
  <Calendar className="size-5" />
</Button>
```

**Styling**: Match existing header icons (same hover, size, spacing)

### Phase 2: Calendar Component (45 min)
**File**: `/components/CalendarView.tsx`

**Props**:
```typescript
interface CalendarViewProps {
  month: string; // "2025-11"
  expenses: Expense[];
  incomes: AdditionalIncome[];
  onClose: () => void;
}
```

**Key Features**:
- Generate calendar grid (7 columns, 5-6 rows)
- Calculate dot indicators per date
- Find highest spending day
- Handle date selection
- Responsive layout (desktop vs mobile)

**Component Structure**:
```tsx
<CalendarView>
  {/* Desktop: Split Layout */}
  <div className="hidden md:grid md:grid-cols-[60%_40%]">
    <CalendarGrid /> {/* Left */}
    <TransactionList /> {/* Right */}
  </div>
  
  {/* Mobile: Fullscreen Calendar */}
  <div className="md:hidden">
    <CalendarGrid />
    <TransactionDrawer /> {/* Bottom Sheet */}
  </div>
</CalendarView>
```

### Phase 3: Calendar Grid (30 min)
**File**: `/components/CalendarGrid.tsx`

**Responsibilities**:
- Render 7x6 grid (Sun-Sat)
- Show date numbers
- Render dot indicators
- Highlight today, weekends, highest spending
- Handle click/tap events

**Visual Elements Per Cell**:
```tsx
<div className="calendar-cell">
  <span className="date-number">8</span>
  <div className="dots">
    {hasExpense && <div className="dot-red" />}
    {hasIncome && <div className="dot-green" />}
  </div>
  {isHighestSpending && <div className="bg-gradient" />}
</div>
```

### Phase 4: Transaction List (Desktop) (20 min)
**File**: Reuse `ExpenseList.tsx` component

**Integration**:
- Pass filtered expenses/incomes by selected date
- Use existing "simple list" layout
- Show empty state if no transactions
- Independent scroll area

### Phase 5: Transaction Drawer (Mobile) (30 min)
**File**: `/components/CalendarTransactionDrawer.tsx`

**Pattern**: Use Shadcn Drawer (same as PocketTimeline)

```tsx
<Drawer open={open} onOpenChange={setOpen}>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Transaksi - {formatDate(date)}</DrawerTitle>
    </DrawerHeader>
    <ScrollArea className="max-h-[60vh]">
      {/* Reuse ExpenseList simple layout */}
      <TransactionListContent />
    </ScrollArea>
  </DrawerContent>
</Drawer>
```

**Accessibility**:
- ✅ DrawerTitle (not sr-only since we show header)
- ✅ aria-describedby={undefined} if no description
- ✅ Swipe to close gesture
- ✅ Back button support (useMobileBackButton)

### Phase 6: Polish & Animations (20 min)

**Desktop Animations**:
```tsx
// Fade-in list
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2 }}
>
  <TransactionList />
</motion.div>
```

**Mobile Animations**:
- Drawer animation built-in (Shadcn Drawer uses Vaul)
- Date cell scale on tap

**Visual Highlights**:
- Calculate highest spending day:
  ```typescript
  const highestSpendingDay = useMemo(() => {
    const dailyTotals = expenses.reduce((acc, exp) => {
      const date = exp.date.split('T')[0];
      acc[date] = (acc[date] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.keys(dailyTotals).reduce((a, b) => 
      dailyTotals[a] > dailyTotals[b] ? a : b
    );
  }, [expenses]);
  ```

---

## 📊 Data Processing

### Dot Indicators Logic:
```typescript
const getDotIndicators = (date: string) => {
  const dateStr = date.split('T')[0];
  const hasExpense = expenses.some(e => e.date.startsWith(dateStr));
  const hasIncome = incomes.some(i => i.date.startsWith(dateStr));
  
  return { hasExpense, hasIncome };
};
```

### Date Filtering:
```typescript
const getTransactionsForDate = (date: string) => {
  const dateStr = date.split('T')[0];
  
  return {
    expenses: expenses.filter(e => e.date.startsWith(dateStr)),
    incomes: incomes.filter(i => i.date.startsWith(dateStr))
  };
};
```

---

## 🎨 Visual Design

### Desktop Layout:
```
┌─────────────────────────────────────────────────┐
│  [← Back]  Calendar View - November 2025        │
├─────────────────────────┬───────────────────────┤
│                         │                       │
│   📅 Calendar (60%)     │  📋 Transaksi (40%)  │
│   ┌─────────────────┐   │   ┌───────────────┐  │
│   │ Sun Mon Tue ... │   │   │ Sabtu, 8 Nov  │  │
│   │  1   2   3  ... │   │   │ Total: 500K   │  │
│   │ 🔴  🟢  🔴      │   │   ├───────────────┤  │
│   │  8   9  10  ... │   │   │ • Makan 100K  │  │
│   │ 🔴⬆️ 🟢  🔴      │   │   │ • Netflix 50K │  │
│   └─────────────────┘   │   │ • etc...      │  │
│                         │   └───────────────┘  │
└─────────────────────────┴───────────────────────┘
```

### Mobile Layout:
```
┌─────────────────────────┐
│  [← Back] Calendar View │
├─────────────────────────┤
│   📅 November 2025      │
│   ┌─────────────────┐   │
│   │ Sun Mon Tue ... │   │
│   │  1   2   3  ... │   │
│   │ 🔴  🟢  🔴      │   │
│   │  8   9  10  ... │   │  ← Tap "8"
│   │ 🔴⬆️ 🟢  🔴      │   │
│   └─────────────────┘   │
└─────────────────────────┘
         ⬇️ (Drawer slides up)
┌─────────────────────────┐
│ ═══ (Handle bar)        │
│ Transaksi - Sabtu, 8 Nov│
│ Total: 500K             │
├─────────────────────────┤
│ • Makan Siang    100K   │
│ • Netflix         50K   │
│ • Gojek           30K   │
└─────────────────────────┘
```

---

## ✅ Testing Checklist

### Desktop:
- [ ] Calendar renders correctly (7 columns)
- [ ] Dot indicators show for correct dates
- [ ] Highest spending day highlighted
- [ ] Click date filters list instantly
- [ ] List scrolls independently
- [ ] Keyboard navigation works
- [ ] Back button returns to main view

### Mobile:
- [ ] Calendar fullscreen on mobile
- [ ] Touch targets 44x44px minimum
- [ ] Tap date opens drawer (smooth animation)
- [ ] Drawer shows correct transactions
- [ ] Swipe down closes drawer
- [ ] Hardware back button closes drawer
- [ ] No layout overflow/scroll issues

### Consistency:
- [ ] Transaction list matches ExpenseList layout
- [ ] Icons consistent (Lucide-react)
- [ ] Colors match design tokens
- [ ] Typography consistent (no custom sizes)
- [ ] Animations smooth and professional

### Accessibility:
- [ ] DrawerTitle present (not suppressed)
- [ ] aria-describedby set correctly
- [ ] Keyboard accessible
- [ ] Screen reader friendly
- [ ] No console warnings

---

## 🚀 Implementation Order

1. ✅ **Entry Point** (App.tsx) - 15 min
2. ✅ **Calendar View Shell** (CalendarView.tsx) - 20 min
3. ✅ **Calendar Grid** (CalendarGrid.tsx) - 30 min
4. ✅ **Desktop Transaction List** (Reuse ExpenseList) - 15 min
5. ✅ **Mobile Drawer** (CalendarTransactionDrawer.tsx) - 30 min
6. ✅ **Dot Indicators & Highlights** - 20 min
7. ✅ **Animations & Polish** - 20 min
8. ✅ **Testing & Refinement** - 30 min

**Total Estimated Time**: ~3 hours

---

## 🔧 Technical Notes

### Calendar Date Generation:
```typescript
const generateCalendarDays = (month: string) => {
  const [year, monthNum] = month.split('-').map(Number);
  const firstDay = new Date(year, monthNum - 1, 1);
  const lastDay = new Date(year, monthNum, 0);
  
  const startPadding = firstDay.getDay(); // 0-6 (Sun-Sat)
  const totalDays = lastDay.getDate();
  
  const days = [];
  
  // Padding days dari bulan sebelumnya
  for (let i = 0; i < startPadding; i++) {
    days.push({ date: null, isPadding: true });
  }
  
  // Actual days
  for (let i = 1; i <= totalDays; i++) {
    days.push({
      date: `${year}-${String(monthNum).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
      isPadding: false
    });
  }
  
  return days;
};
```

### Performance:
- Use `useMemo` for calendar generation
- Use `useMemo` for dot indicators calculation
- Use `useMemo` for highest spending day
- Debounce date selection if needed (probably not necessary)

---

## 📝 Next Steps

After v1.0 implementation, consider:
- [ ] Week view option
- [ ] Drag to select date range
- [ ] Export calendar as image
- [ ] Compare with previous month
- [ ] Budget progress per day

---

**Ready to implement!** 🚀
