# Calendar View - Quick Reference 🗓️

**Last Updated**: November 9, 2025

---

## 🎯 What Is This?

Calendar View adalah fitur visual untuk melihat transaksi dalam format kalender bulanan dengan:
- 📅 Grid kalender 7x6 (Sun-Sat)
- 🔴🟢 Dot indicators (merah = expense, hijau = income)
- 💡 Visual insights (highest spending day, weekend highlight)
- 📱 Responsive (desktop split, mobile fullscreen + drawer)

---

## 🚀 How to Use

### User Flow:

**Desktop**:
1. Click Calendar button (📅) di MonthSelector
2. Calendar overlay muncul (60% calendar | 40% transactions)
3. Click tanggal → List di kanan ter-filter instant
4. Click X atau Escape → Close calendar

**Mobile**:
1. Tap Calendar button (📅) di header (sebelah kiri Settings)
2. Fullscreen calendar muncul
3. Tap tanggal → Bottom drawer slide-up dengan transaksi
4. Swipe down atau back button → Close drawer
5. Back button lagi → Close calendar

---

## 📂 Component Structure

```tsx
CalendarView.tsx (550 lines)
├── Props:
│   ├── month: string ("2025-11")
│   ├── expenses: Expense[]
│   ├── incomes: AdditionalIncome[]
│   ├── pockets: Pocket[]
│   ├── settings: CategorySettings
│   ├── onClose: () => void
│   ├── onEditExpense?: (expense: Expense) => void
│   ├── onDeleteExpense?: (id: string) => void
│   ├── onEditIncome?: (income: AdditionalIncome) => void
│   └── onDeleteIncome?: (id: string) => void
│
├── State:
│   ├── selectedDate: string | null
│   └── isDrawerOpen: boolean (mobile only)
│
├── Computed:
│   ├── calendarDays: CalendarDay[] (useMemo)
│   ├── highestSpendingDay: string (useMemo)
│   └── selectedDateTransactions (useMemo)
│
└── Renders:
    ├── Desktop: Split layout (Card modal)
    └── Mobile: Fullscreen + Drawer
```

---

## 🎨 Visual Elements

### Calendar Cell States:
```tsx
// Normal day
<button className="aspect-square p-1 rounded-lg">
  <span>8</span>
  <div className="dots">
    {hasExpense && <div className="dot-red" />}
    {hasIncome && <div className="dot-green" />}
  </div>
</button>

// Today
ring-2 ring-blue-500 + pulse animation

// Weekend (Sat/Sun)
bg-green-50/30 dark:bg-green-950/10

// Highest spending
bg-red-50 dark:bg-red-950/20

// Selected
bg-accent ring-2 ring-primary

// Hover
hover:scale-105 hover:shadow-md
```

### Dot Indicators:
- 🔴 **Red dot**: Ada pengeluaran (w-1.5 h-1.5 bg-red-500)
- 🟢 **Green dot**: Ada pemasukan (w-1.5 h-1.5 bg-green-500)
- **Stacked**: Both dots muncul jika ada expense + income
- **Pulse**: Today's date dots animate

### Insight Cards (NEW v1.2 - DUAL):

**Spending Card** (Red Theme):
- 📊 **Icon**: Chart emoji in rounded circle
- 🏷️ **Badge**: "Klik untuk detail" call-to-action
- 📅 **Date**: Formatted display (e.g., "Sabtu, 8 Nov")
- 💰 **Amount**: Largest spending day
- ➡️ **Arrow**: Right arrow indicator
- 🎨 **Gradient**: Red to orange background
- 🖱️ **Clickable**: Auto-selects that date

**Income Card** (Green Theme):
- 💰 **Icon**: Money bag emoji in rounded circle
- 🏷️ **Badge**: "Klik untuk detail" call-to-action
- 📅 **Date**: Formatted display (e.g., "Jumat, 7 Nov")
- 💵 **Amount**: Largest income day (with + prefix)
- ➡️ **Arrow**: Right arrow indicator
- 🎨 **Gradient**: Green to emerald background
- 🖱️ **Clickable**: Auto-selects that date

---

## 🔧 Integration Points

### In App.tsx:

```tsx
// 1. Import
const CalendarView = lazy(() =>
  import("./components/CalendarView").then(m => ({ default: m.CalendarView }))
);

// 2. State
const [showCalendarView, setShowCalendarView] = useState(false);
const { settings: categorySettings } = useCategorySettings();

// 3. Button (Mobile)
<Button onClick={() => setShowCalendarView(true)}>
  <Calendar className="size-4" />
</Button>

// 4. Button (Desktop - MonthSelector)
<MonthSelector
  onCalendarClick={() => setShowCalendarView(true)}
  {...otherProps}
/>

// 5. Render
<AnimatePresence>
  {showCalendarView && (
    <Suspense fallback={<DialogSkeleton />}>
      <CalendarView
        month={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`}
        expenses={expenses}
        incomes={additionalIncomes}
        pockets={pockets}
        settings={categorySettings}
        onClose={() => setShowCalendarView(false)}
        onEditExpense={handleEditExpense}
        onDeleteExpense={handleDeleteExpense}
        onEditIncome={handleUpdateIncome}
        onDeleteIncome={handleDeleteIncome}
      />
    </Suspense>
  )}
</AnimatePresence>
```

---

## 📊 Data Processing

### Calendar Generation:
```tsx
const calendarDays = useMemo(() => {
  const [year, monthNum] = month.split('-').map(Number);
  const firstDay = new Date(year, monthNum - 1, 1);
  const lastDay = new Date(year, monthNum, 0);
  const startPadding = firstDay.getDay(); // 0-6 (Sun-Sat)
  const totalDays = lastDay.getDate();
  
  const days = [];
  
  // Padding days
  for (let i = 0; i < startPadding; i++) {
    days.push({ date: null, isPadding: true, ... });
  }
  
  // Actual days
  for (let i = 1; i <= totalDays; i++) {
    const dateStr = `${year}-${monthNum.padStart(2, '0')}-${i.padStart(2, '0')}`;
    const dayExpenses = expenses.filter(e => e.date.startsWith(dateStr));
    const dayIncomes = incomes.filter(i => i.date.startsWith(dateStr));
    
    days.push({
      date: dateStr,
      hasExpense: dayExpenses.length > 0,
      hasIncome: dayIncomes.length > 0,
      totalExpense: sum(dayExpenses),
      totalIncome: sum(dayIncomes),
      ...
    });
  }
  
  return days;
}, [month, expenses, incomes]);
```

### Highest Spending Day:
```tsx
const highestSpendingDay = useMemo(() => {
  let maxDate = '';
  let maxAmount = 0;
  
  calendarDays.forEach(day => {
    if (day.date && day.totalExpense > maxAmount) {
      maxAmount = day.totalExpense;
      maxDate = day.date;
    }
  });
  
  return maxDate;
}, [calendarDays]);
```

---

## 🎭 Animation Specs

### Desktop:
```tsx
// Calendar overlay
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ duration: 0.2 }}

// Transaction list (on date change)
<AnimatePresence mode="wait">
  <motion.div
    key={selectedDate}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
  >
    {renderTransactionList()}
  </motion.div>
</AnimatePresence>
```

### Mobile:
```tsx
// Calendar enter
initial={{ opacity: 0, x: '100%' }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: '100%' }}
transition={{ type: 'spring', damping: 25, stiffness: 200 }}

// Drawer (built-in Vaul animation)
<Drawer open={isDrawerOpen}>...</Drawer>
```

---

## 🧪 Testing Quick Checklist

**Visual**:
- [ ] Calendar grid is 7 columns (Sun-Sat)
- [ ] Dot indicators show correct colors
- [ ] Highest spending has red/orange bg
- [ ] Weekends have green tint
- [ ] Today has blue ring
- [ ] Hover shows scale effect

**Interaction**:
- [ ] Desktop: Click date → List updates
- [ ] Mobile: Tap date → Drawer opens
- [ ] Swipe down → Drawer closes
- [ ] Back button → Drawer → Calendar → Main
- [ ] Empty state shows correctly

**Data**:
- [ ] Expenses show correct amounts
- [ ] Incomes show correct amounts (with deduction)
- [ ] Pockets/categories display
- [ ] Empty dates have no dots

**Consistency**:
- [ ] Transaction list matches ExpenseList layout
- [ ] No custom font sizes
- [ ] Icons from lucide-react
- [ ] Colors from globals.css

---

## 🐛 Common Issues & Fixes

### Issue: Calendar grid tidak align
**Fix**: Check grid-cols-7 dan aspect-square pada cells

### Issue: Dots tidak muncul
**Fix**: Verify `hasExpense` dan `hasIncome` calculation di calendarDays

### Issue: Highest spending tidak highlight
**Fix**: Check `highestSpendingDay` useMemo logic

### Issue: Mobile drawer tidak tutup dengan back button
**Fix**: Verify useMobileBackButton hook dipanggil dengan priority benar

### Issue: Transaction list tidak konsisten dengan ExpenseList
**Fix**: Compare rendering logic, pastikan sama persis

---

## 📱 Mobile-Specific Notes

### Back Button Priority:
```tsx
// Drawer (priority 2)
useMobileBackButton(
  isDrawerOpen,
  () => setIsDrawerOpen(false),
  'calendar-drawer'
);

// Calendar (priority 1)
useMobileBackButton(
  !isDrawerOpen, // Only active when drawer closed
  onClose,
  'calendar-view'
);
```

### Fullscreen Layout:
```tsx
<motion.div className="fixed inset-0 z-50 bg-background">
  {/* Header sticky */}
  <div className="sticky top-0 z-10">...</div>
  
  {/* Calendar scrollable */}
  <div className="p-4">
    {renderCalendarGrid()}
  </div>
</motion.div>
```

---

## 🔗 Related Files

**Component**:
- `/components/CalendarView.tsx` - Main component

**Integration**:
- `/App.tsx` - State, buttons, render
- `/components/MonthSelector.tsx` - Desktop button

**Types**:
- `/types/index.ts` - Pocket, AdditionalIncome interfaces

**Hooks**:
- `/hooks/useMobileBackButton.ts` - Mobile back support
- `/hooks/useCategorySettings.ts` - Category data

**Documentation**:
- `/planning/calendar-view/PLANNING.md` - Full planning
- `/planning/calendar-view/IMPLEMENTATION_COMPLETE.md` - Complete docs

---

## ⚡ Performance Tips

1. **useMemo** for calendar generation (heavy computation)
2. **useMemo** for highestSpendingDay (array iteration)
3. **useMemo** for filtered transactions
4. **useCallback** for date click handler
5. **Lazy loading** for CalendarView (reduces initial bundle)
6. **AnimatePresence** for efficient exit animations

---

## 🎨 Customization Points

### Colors:
- Weekend tint: `bg-green-50/30 dark:bg-green-950/10`
- Highest spending: `bg-red-50 dark:bg-red-950/20`
- Today ring: `ring-blue-500`
- Selected ring: `ring-primary`
- Red dot: `bg-red-500`
- Green dot: `bg-green-500`

### Spacing:
- Cell gap: `gap-1`
- Cell padding: `p-1`
- Dot size: `w-1.5 h-1.5`
- Dot gap: `gap-0.5`

### Animations:
- Duration: `200ms` (desktop), `300ms` (mobile)
- Easing: `ease-out` (desktop), `spring` (mobile)
- Hover scale: `1.05x`

---

**Last Updated**: November 9, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
