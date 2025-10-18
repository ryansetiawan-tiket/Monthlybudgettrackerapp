# Fitur-Fitur Detail

## 1. Month Selector & Navigation

### Komponen: `MonthSelector.tsx`

#### Fitur
- Calendar popup untuk pemilihan bulan dan tahun
- Navigasi prev/next dengan arrow buttons
- Display format: "Januari 2025"
- Bahasa Indonesia untuk nama bulan

#### Implementasi
```typescript
// Calendar dari shadcn/ui dengan mode="month"
<Calendar
  mode="month"
  selected={selectedMonth}
  onSelect={handleMonthSelect}
  className="rounded-md border"
/>
```

#### User Flow
1. Klik calendar icon → popup calendar muncul
2. Pilih bulan/tahun di calendar, atau
3. Gunakan prev/next arrows untuk navigasi cepat
4. Data auto-load setelah bulan berubah

---

## 2. Budget Management

### Komponen: `BudgetForm.tsx`

#### 2.1 Budget Awal
- Input manual untuk budget awal bulan
- Format: Currency IDR dengan thousand separator
- Validation: Harus angka positif
- Real-time update ke total budget

#### 2.2 Carryover
**Auto Carryover:**
- Toggle switch untuk enable/disable
- Jika enabled: otomatis ambil hasil akhir dari bulan sebelumnya
- Realtime sync saat hasil akhir berubah
- Visual feedback: loading state saat fetching

**Manual Carryover:**
- Jika auto-carryover disabled
- User bisa input manual
- Useful untuk adjustment atau koreksi

#### Implementasi Auto-Carryover
```typescript
useEffect(() => {
  if (autoCarryover) {
    fetchPreviousMonthResult().then(result => {
      setCarryover(result);
    });
  }
}, [autoCarryover, selectedMonth, expenses, additionalIncomes]);
```

#### Edge Cases Handled
- Bulan sebelumnya belum ada data → carryover = 0
- Hasil akhir negatif → tetap di-carryover (debt tracking)
- Switch dari auto ke manual → preserve last value

---

## 3. Pemasukan Tambahan (Additional Income)

### Komponen: `AdditionalIncomeForm.tsx` & `AdditionalIncomeList.tsx`

#### 3.1 Input Pemasukan

**Fields:**
- Nama pemasukan (text)
- Jumlah (number)
- Mata uang (select: IDR/USD)

**Autocomplete untuk Nama:**
- Menggunakan riwayat input sebelumnya
- Fuzzy search untuk suggestions
- Keyboard navigation (Arrow Up/Down, Enter)
- Click outside to dismiss

**Multi-Currency Support:**
- **IDR**: Direct input, langsung masuk ke total
- **USD**: 
  - Input dalam USD
  - Auto-fetch exchange rate dari API
  - Display converted amount dalam IDR
  - Show rate yang digunakan
  - Fallback input manual jika API gagal

#### 3.2 Exchange Rate Integration

**API:** ExchangeRate-API (exchangerate-api.com)
```
GET https://v6.exchangerate-api.com/v6/{API_KEY}/latest/USD
```

**Server-Side Implementation:**
```typescript
// Server cache exchange rate untuk efisiensi
let cachedRate: { rate: number; timestamp: number } | null = null;
const CACHE_DURATION = 3600000; // 1 hour

app.get('/make-server-3adbeaf1/exchange-rate', async (c) => {
  const now = Date.now();
  
  // Return cache if valid
  if (cachedRate && now - cachedRate.timestamp < CACHE_DURATION) {
    return c.json({ rate: cachedRate.rate, timestamp: cachedRate.timestamp });
  }
  
  // Fetch from API
  const response = await fetch(`${API_URL}/${API_KEY}/latest/USD`);
  const data = await response.json();
  
  // Cache the result
  cachedRate = {
    rate: data.conversion_rates.IDR,
    timestamp: now
  };
  
  return c.json(cachedRate);
});
```

**Fallback Mechanism:**
1. Try fetch dari server
2. Jika gagal → show input manual untuk rate
3. User input rate → konversi menggunakan rate manual
4. Toast notification untuk inform user tentang fallback

#### 3.3 List Pemasukan

**Display:**
- Nama pemasukan
- Amount (original currency)
- Jika USD: show conversion rate & converted amount
- Edit & Delete actions

**Features:**
- Inline editing
- Delete confirmation (via toast undo pattern)
- Responsive layout
- Total calculation realtime

---

## 4. Pengeluaran (Expenses)

### 4.1 Input Pengeluaran

**Komponen:** `AddExpenseForm.tsx`, `AddExpenseDialog.tsx`

**Dua Cara Input:**
1. **Quick Add** (AddExpenseForm): Form inline sederhana
2. **Dialog** (AddExpenseDialog): Form lengkap dengan tabs

**Fields:**
- Nama pengeluaran
- Jumlah (untuk single expense)
- Tanggal (date picker)
- Items (untuk breakdown pengeluaran)

**Template Integration:**
- Dropdown untuk pilih template
- Auto-populate items dari template
- Color coding dari template
- Edit items sebelum save

---

### 4.2 Fixed Expense Templates

**Komponen:** `FixedExpenseTemplates.tsx`

#### Purpose
Untuk pengeluaran rutin bulanan yang itemnya selalu sama (e.g., Belanja Bulanan, Utilities, dll)

#### Features
- **Create Template**: Nama + multiple items + color picker
- **Edit Template**: Update nama, items, atau color
- **Delete Template**: Remove template
- **Use Template**: Pilih dari dropdown saat add expense

#### Template Structure
```typescript
{
  id: string,
  name: string,
  items: [
    { name: string, amount: number }
  ],
  color: string  // Hex color code
}
```

#### Color Picker
- 20 predefined colors
- Visual color swatches
- Color applied to expense entries dari template
- Membantu identifikasi visual di expense list

#### Management Dialog
- Collapsible sections per template
- Add/Edit/Delete items dalam template
- Drag-to-reorder (future enhancement)
- Export/Import templates (future enhancement)

---

### 4.3 Expense List dengan Upcoming & History

**Komponen:** `ExpenseList.tsx`

#### Layout Structure
```
┌─────────────────────────────────────┐
│ Daftar Pengeluaran      [Sort] [Rp] │
├─────────────────────────────────────┤
│ [🔍 Search box]                     │
│                                      │
│ ▼ Hari Ini & Mendatang (5) [Rp]    │
│   • Entry hari ini (🔵 dot)         │
│   • Entry besok                      │
│   • Entry 3 hari lagi                │
│                                      │
│ ▶ Riwayat (12) [Rp]                 │
│   (collapsed by default)             │
└─────────────────────────────────────┘
```

#### 4.3.1 Search & Autocomplete

**Search Capabilities:**
- Nama pengeluaran
- Nama items (dalam breakdown)
- Nama hari (Minggu, Senin, Selasa, dll)
- Tanggal (15, 20, 31, dll)

**Autocomplete Suggestions:**
- Real-time suggestions saat typing
- Fuzzy matching algorithm
- Keyboard navigation (↑↓ arrows, Enter)
- Mouse hover highlight
- Max 10 suggestions
- Click outside to dismiss

**Implementation:**
```typescript
const fuzzyMatch = (expense: Expense, query: string): boolean => {
  const lowerQuery = query.toLowerCase();
  
  // Check expense name
  if (expense.name.toLowerCase().includes(lowerQuery)) return true;
  
  // Check items
  if (expense.items?.some(item => 
    item.name.toLowerCase().includes(lowerQuery)
  )) return true;
  
  // Check day name
  if (getDayName(expense.date).toLowerCase().includes(lowerQuery)) return true;
  
  // Check date number
  if (getDateNumber(expense.date).includes(lowerQuery)) return true;
  
  return false;
};
```

#### 4.3.2 Visual Indicators

**Today Indicator:**
- Blue pulsing dot (🔵) untuk entry hari ini
- Blue ring border around card
- Tooltip "Hari ini"
- Animation: `animate-pulse`

**Weekend Indicator:**
- Green text untuk Sabtu & Minggu
- Overrides template color
- Helps identify weekend spending

**Template Colors:**
- Color dari template applied ke tanggal text
- Tidak override weekend indicator
- Membantu grouping visual

#### 4.3.3 Upcoming vs History Split

**Logic:**
```typescript
const isPast = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date < today;
};

const upcomingExpenses = expenses.filter(exp => !isPast(exp.date));
const historyExpenses = expenses.filter(exp => isPast(exp.date));
```

**Section Features:**
- **Upcoming**: Default expanded, hari ini & masa depan
- **History**: Default collapsed, pengeluaran yang sudah lewat
- Each section shows: count & subtotal
- Empty state jika tidak ada data
- Collapsible dengan smooth transition

**Benefits:**
- Fokus ke pengeluaran yang relevan (upcoming)
- History tidak mengganggu tapi tetap accessible
- Better organization untuk planning
- Subtotal per section untuk analisis

#### 4.3.4 Sorting

**Toggle:** Ascending ↔ Descending
- Ascending: Terlama ke Terbaru
- Descending: Terbaru ke Terlama

**Multi-Level Sort:**
1. Primary: Date
2. Secondary: Template expenses first (dengan items)
3. Regular expenses after templates

```typescript
.sort((a, b) => {
  const dateCompare = sortOrder === 'asc' 
    ? new Date(a.date).getTime() - new Date(b.date).getTime() 
    : new Date(b.date).getTime() - new Date(a.date).getTime();
  
  if (dateCompare === 0) {
    const aHasItems = a.items && a.items.length > 0;
    const bHasItems = b.items && b.items.length > 0;
    
    if (aHasItems && !bHasItems) return -1;
    if (!aHasItems && bHasItems) return 1;
  }
  
  return dateCompare;
})
```

#### 4.3.5 Expense Types

**Single Expense:**
```
┌────────────────────────────────────┐
│ 🔵 Jajan                           │
│    Senin, 15 Jan            Rp 50K │
│                      [🗑️] [✏️]    │
└────────────────────────────────────┘
```

**Template Expense (Collapsible):**
```
┌────────────────────────────────────┐
│ Senin, 15 Jan  Belanja Bulanan  ▼  │
│                         Rp 500K    │
│ ├─────────────────────────────────┤
│ │   • Beras           Rp 150K     │
│ │   • Sayur           Rp 50K      │
│ │   • Daging          Rp 300K     │
│                      [🗑️] [✏️]    │
└────────────────────────────────────┘
```

#### 4.3.6 Edit & Delete

**Edit:**
- Click pencil icon → dialog opens
- Edit name, amount, date
- For template expenses: edit items (add/remove/modify)
- Auto-recalculate total dari items
- Save → update state & database

**Delete:**
- Click trash icon → immediate delete
- Toast confirmation with undo option (future)
- Remove from state & database

---

## 5. Budget Overview & Summary

**Komponen:** `BudgetOverview.tsx`

### Display Cards

#### Total Budget
```
Budget awal + Carryover + Total Pemasukan Tambahan
```

#### Total Pengeluaran
```
Sum of all expenses (upcoming + history)
```

#### Hasil Akhir (Sisa Budget)
```
Total Budget - Total Pengeluaran
```

### Color Coding
- **Merah**: Hasil akhir negatif (defisit)
- **Hijau**: Hasil akhir positif (surplus)
- **Gray**: Hasil akhir = 0 (balanced)

### Features
- Large, clear numbers
- Currency formatting
- Responsive grid layout
- Real-time calculation

---

## 6. Dark Mode

**Implementation:** Tailwind CSS dark mode classes

**Toggle:** System preference (automatic)
- Uses `dark:` prefix untuk styling
- All components support dark mode
- Consistent color scheme
- Icons & borders adapt automatically

**Dark Mode Classes Example:**
```tsx
<div className="bg-white dark:bg-gray-900">
  <p className="text-gray-900 dark:text-gray-100">Text</p>
</div>
```

---

## 7. Floating Action Button (FAB)

**Komponen:** Dialog dengan tabs di `App.tsx`

**Tabs:**
1. **Pemasukan** - AdditionalIncomeForm
2. **Pengeluaran** - AddExpenseForm  
3. **Template** - FixedExpenseTemplates
4. **Catatan** - Notes textarea

**UX:**
- Fixed bottom-right position
- Click → dialog opens
- Tab switching untuk different actions
- Close on save/cancel
- Keyboard shortcut support (future)

**Benefits:**
- Cleaner UI (less clutter)
- Quick access to all add actions
- Consistent UX pattern
- Mobile friendly

---

## 8. Notes Field

**Simple textarea** untuk catatan tambahan per bulan

**Use Cases:**
- Reminder untuk bulan depan
- Catatan pengeluaran besar
- Goals finansial
- Notes pribadi

**Persistence:** Auto-save bersama data lainnya

---

## 9. Data Persistence

**Auto-Save Strategy:**
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    saveBudgetData();
  }, 1000); // Debounce 1 detik
  
  return () => clearTimeout(timer);
}, [budget, carryover, expenses, additionalIncomes, notes]);
```

**Benefits:**
- User tidak perlu manual save
- Debouncing prevent too many requests
- Data selalu tersinkron
- No data loss

**Feedback:**
- Toast notification on save success
- Error handling dengan toast
- Loading states saat fetch

---

## 10. UX Enhancements

### 10.1 Motivational Quotes

**Komponen:** `App.tsx` + `data/funny-quotes.ts`

#### Features
- Random quote ditampilkan di header
- Auto-rotate setiap **20 menit**
- Quotes berbahasa Indonesia
- Motivasi & humor untuk budget tracking

#### Implementation
```typescript
// Select random quote on mount
useEffect(() => {
  const randomIndex = Math.floor(Math.random() * funnyQuotes.length);
  setRandomQuote(funnyQuotes[randomIndex]);
}, []);

// Auto-rotate every 20 minutes
useEffect(() => {
  const rotateQuote = () => {
    const currentIndex = funnyQuotes.indexOf(randomQuote);
    let newIndex;
    
    // Get different quote
    do {
      newIndex = Math.floor(Math.random() * funnyQuotes.length);
    } while (newIndex === currentIndex && funnyQuotes.length > 1);
    
    setRandomQuote(funnyQuotes[newIndex]);
  };

  const intervalId = setInterval(rotateQuote, 1200000); // 20 minutes
  return () => clearInterval(intervalId);
}, [randomQuote]);
```

#### Benefits
- Keeps users engaged
- Adds personality to app
- Fresh motivation every 20 minutes
- Improves user experience

---

### 10.2 Loading States & Animations

**Komponen:** `LoadingSkeleton.tsx`

#### Skeleton Loading
- Replaces "Memuat data..." text dengan beautiful skeleton
- Mimics actual layout structure
- Smooth fade-in animations
- Staggered entrance (components appear sequentially)

#### Implementation
```typescript
// Loading skeleton dengan animations
<motion.div 
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
>
  <Skeleton className="h-10 w-64 mx-auto" />
</motion.div>
```

#### Page Transitions
**Using Motion (Framer Motion):**
```typescript
<AnimatePresence mode="wait">
  <motion.div
    key={`${selectedYear}-${selectedMonth}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
  >
    {/* Page content */}
  </motion.div>
</AnimatePresence>
```

#### Animation Details
- **Header**: Slide from top with delay 0.1s
- **Month Selector**: Scale effect with delay 0.15s
- **Budget Overview**: Slide up with delay 0.2s
- **Cards**: Individual scale animations
- **Lists**: Sequential staggered animations

#### Benefits
- Professional appearance
- Better perceived performance
- Visual feedback during loading
- Smooth transitions between months
- No jarring jumps

---

### 10.3 Client-Side Caching

**Implementation:** `App.tsx`

#### Purpose
Prevent re-fetching data untuk bulan yang sudah pernah dibuka, membuat navigasi terasa instant.

#### Cache Structure
```typescript
interface MonthCache {
  budget: BudgetData;
  expenses: Expense[];
  additionalIncomes: AdditionalIncome[];
  previousMonthRemaining: number | null;
}

const [cache, setCache] = useState<Record<string, MonthCache>>({});
```

#### Cache Key Format
```
YYYY-MM
Examples: "2024-10", "2025-01"
```

#### Cache Flow
```typescript
useEffect(() => {
  const cacheKey = getCacheKey(selectedYear, selectedMonth);
  const cachedData = cache[cacheKey];

  if (cachedData) {
    // Use cached data - instant load!
    setBudget(cachedData.budget);
    setExpenses(cachedData.expenses);
    setAdditionalIncomes(cachedData.additionalIncomes);
    setPreviousMonthRemaining(cachedData.previousMonthRemaining);
    setIsLoading(false);
  } else {
    // No cache - fetch from server
    loadBudgetData();
    loadExpenses();
    loadAdditionalIncomes();
    loadPreviousMonthData();
  }
}, [selectedMonth, selectedYear]);
```

#### Cache Invalidation
**When to invalidate:**
- User adds/edits/deletes expense → invalidate current month
- Also invalidate next month (carryover changes)
- User adds/edits/deletes income → invalidate current month

**Implementation:**
```typescript
const invalidateCache = (year: number, month: number) => {
  const key = getCacheKey(year, month);
  setCache((prev) => {
    const newCache = { ...prev };
    delete newCache[key];
    return newCache;
  });

  // Also invalidate next month (carryover changes)
  let nextMonth = month + 1;
  let nextYear = year;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear = year + 1;
  }
  const nextKey = getCacheKey(nextYear, nextMonth);
  setCache((prev) => {
    const newCache = { ...prev };
    delete newCache[nextKey];
    return newCache;
  });
};
```

#### User Experience Flow
1. **Oktober (first visit)**: Loading skeleton → Fetch dari server → Data displayed → Saved to cache
2. **November (first visit)**: Loading skeleton → Fetch dari server → Data displayed → Saved to cache
3. **Balik ke Oktober**: **INSTANT!** ⚡ No loading, data dari cache
4. **Add expense di Oktober**: Update state + invalidate cache Oktober & November
5. **Visit November lagi**: Loading skeleton (cache invalidated) → Fetch fresh data

#### Benefits
- ⚡ Lightning-fast navigation untuk bulan yang sudah dibuka
- 🎯 Better UX - users can quickly compare months
- 💾 Memory efficient - only caches visited months
- 🔄 Always fresh - smart invalidation ensures data consistency
- 📱 Reduces server load - fewer API calls

#### Technical Considerations
- Cache is stored in React state (memory only)
- Cache is cleared on page refresh (intentional - ensures fresh data on app restart)
- No localStorage usage (keeps implementation simple)
- Cache size is self-limiting (users typically only visit 2-3 months per session)