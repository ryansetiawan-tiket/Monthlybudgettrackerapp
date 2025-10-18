# Component Documentation

## Component Hierarchy

```
App.tsx
├── Toaster (from sonner)
├── LoadingSkeleton (conditional)
├── MonthSelector
├── BudgetForm
├── AdditionalIncomeList
├── ExpenseList
├── BudgetOverview
└── Dialog (Floating Action Button)
    ├── Tab: Pemasukan → AdditionalIncomeForm
    ├── Tab: Pengeluaran → AddExpenseForm
    ├── Tab: Template → FixedExpenseTemplates
    └── Tab: Catatan → Textarea
```

---

## 1. App.tsx

### Purpose
Main application component, orchestrates semua child components dan manages global state.

### State Management
```typescript
// Budget & Income
const [budget, setBudget] = useState<number>(0);
const [carryover, setCarryover] = useState<number>(0);
const [additionalIncomes, setAdditionalIncomes] = useState<AdditionalIncome[]>([]);

// Expenses
const [expenses, setExpenses] = useState<Expense[]>([]);
const [fixedExpenseTemplates, setFixedExpenseTemplates] = useState<FixedExpenseTemplate[]>([]);

// UI State
const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
const [activeTab, setActiveTab] = useState<string>('pemasukan');
const [notes, setNotes] = useState<string>('');
```

### Key Functions

#### loadBudgetData
```typescript
const loadBudgetData = async (month: Date) => {
  const yearMonth = format(month, 'yyyy-MM');
  const response = await fetch(`${SERVER_URL}/budget/${yearMonth}`, {
    headers: { 'Authorization': `Bearer ${publicAnonKey}` }
  });
  const data = await response.json();
  
  // Update all states
  setBudget(data.budget || 0);
  setCarryover(data.carryover || 0);
  setExpenses(data.expenses || []);
  // ... etc
};
```

#### saveBudgetData
```typescript
const saveBudgetData = async () => {
  const yearMonth = format(selectedMonth, 'yyyy-MM');
  const data = {
    budget,
    carryover,
    additionalIncomes,
    expenses,
    notes
  };
  
  await fetch(`${SERVER_URL}/budget/${yearMonth}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`
    },
    body: JSON.stringify(data)
  });
  
  toast.success('Data tersimpan');
};
```

#### Auto-Save Effect
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    saveBudgetData();
  }, 1000);
  
  return () => clearTimeout(timer);
}, [budget, carryover, expenses, additionalIncomes, notes]);
```

### Calculations
```typescript
const totalAdditionalIncome = additionalIncomes.reduce(
  (sum, income) => sum + (income.convertedAmount || income.amount), 
  0
);

const totalBudget = budget + carryover + totalAdditionalIncome;

const totalExpenses = expenses.reduce(
  (sum, expense) => sum + expense.amount, 
  0
);

const result = totalBudget - totalExpenses;
```

---

## 2. MonthSelector.tsx

### Props
```typescript
interface MonthSelectorProps {
  selectedMonth: Date;
  onMonthChange: (month: Date) => void;
}
```

### Features
- Calendar popup dengan Popover dari shadcn
- Prev/Next navigation
- Display format: "Januari 2025"
- Bahasa Indonesia

### Usage
```tsx
<MonthSelector
  selectedMonth={selectedMonth}
  onMonthChange={setSelectedMonth}
/>
```

### Implementation Notes
- Calendar mode set to "month"
- Custom month names array untuk Bahasa Indonesia
- addMonths dan subMonths dari date-fns

---

## 3. BudgetForm.tsx

### Props
```typescript
interface BudgetFormProps {
  budget: number;
  carryover: number;
  autoCarryover: boolean;
  onBudgetChange: (value: number) => void;
  onCarryoverChange: (value: number) => void;
  onAutoCarryoverChange: (value: boolean) => void;
}
```

### Features
- Number input dengan currency formatting
- Auto-carryover toggle switch
- Previous month result fetch
- Loading state

### Key Functions

#### fetchPreviousMonthResult
```typescript
const fetchPreviousMonthResult = async () => {
  if (!autoCarryover) return;
  
  setLoadingCarryover(true);
  const prevMonth = subMonths(selectedMonth, 1);
  const yearMonth = format(prevMonth, 'yyyy-MM');
  
  const response = await fetch(`${SERVER_URL}/budget/${yearMonth}`);
  const data = await response.json();
  
  // Calculate previous month result
  const prevTotalBudget = (data.budget || 0) + (data.carryover || 0) + 
    (data.additionalIncomes || []).reduce(...);
  const prevTotalExpenses = (data.expenses || []).reduce(...);
  const prevResult = prevTotalBudget - prevTotalExpenses;
  
  onCarryoverChange(prevResult);
  setLoadingCarryover(false);
};
```

### Usage
```tsx
<BudgetForm
  budget={budget}
  carryover={carryover}
  autoCarryover={autoCarryover}
  onBudgetChange={setBudget}
  onCarryoverChange={setCarryover}
  onAutoCarryoverChange={setAutoCarryover}
/>
```

---

## 4. AdditionalIncomeForm.tsx

### Props
```typescript
interface AdditionalIncomeFormProps {
  onAddIncome: (income: Omit<AdditionalIncome, 'id'>) => void;
}
```

### State
```typescript
const [name, setName] = useState('');
const [amount, setAmount] = useState(0);
const [currency, setCurrency] = useState<'IDR' | 'USD'>('IDR');
const [exchangeRate, setExchangeRate] = useState<number | null>(null);
const [manualRate, setManualRate] = useState<number>(0);
const [showManualRate, setShowManualRate] = useState(false);
const [suggestions, setSuggestions] = useState<string[]>([]);
```

### Features
- Autocomplete name dengan riwayat
- Currency selection (IDR/USD)
- Auto-fetch exchange rate
- Manual rate fallback
- Converted amount display

### Exchange Rate Flow
```typescript
useEffect(() => {
  if (currency === 'USD') {
    fetchExchangeRate();
  }
}, [currency]);

const fetchExchangeRate = async () => {
  try {
    const response = await fetch(`${SERVER_URL}/exchange-rate`);
    const data = await response.json();
    setExchangeRate(data.rate);
    setShowManualRate(false);
  } catch (error) {
    setShowManualRate(true);
    toast.error('Gagal fetch rate, gunakan input manual');
  }
};
```

### Submit Handler
```typescript
const handleSubmit = () => {
  const finalRate = showManualRate ? manualRate : exchangeRate;
  const convertedAmount = currency === 'USD' 
    ? amount * (finalRate || 0) 
    : amount;
  
  onAddIncome({
    name,
    amount,
    currency,
    exchangeRate: currency === 'USD' ? finalRate : undefined,
    convertedAmount: currency === 'USD' ? convertedAmount : undefined
  });
  
  // Reset form
  setName('');
  setAmount(0);
  setCurrency('IDR');
};
```

---

## 5. AdditionalIncomeList.tsx

### Props
```typescript
interface AdditionalIncomeListProps {
  incomes: AdditionalIncome[];
  onDeleteIncome: (id: string) => void;
  onEditIncome: (id: string, income: Omit<AdditionalIncome, 'id'>) => void;
}
```

### Features
- List semua pemasukan tambahan
- Edit inline (future)
- Delete action
- Display conversion info untuk USD

### Display Logic
```tsx
{incomes.map(income => (
  <div key={income.id}>
    <p>{income.name}</p>
    <p>{formatCurrency(income.amount)} {income.currency}</p>
    {income.currency === 'USD' && (
      <p className="text-sm text-muted-foreground">
        Rate: {income.exchangeRate} → {formatCurrency(income.convertedAmount)}
      </p>
    )}
    <Button onClick={() => onDeleteIncome(income.id)}>Delete</Button>
  </div>
))}
```

---

## 6. ExpenseList.tsx

### Props
```typescript
interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  onEditExpense: (id: string, expense: Omit<Expense, 'id'>) => void;
}
```

### State
```typescript
const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
const [editingExpense, setEditingExpense] = useState<Omit<Expense, 'id'>>(...);
const [searchQuery, setSearchQuery] = useState('');
const [showSuggestions, setShowSuggestions] = useState(false);
const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
const [upcomingExpanded, setUpcomingExpanded] = useState(true);
const [historyExpanded, setHistoryExpanded] = useState(false);
```

### Key Functions

#### isPast
```typescript
const isPast = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date < today;
};
```

#### isToday
```typescript
const isToday = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};
```

#### fuzzyMatch (Search)
```typescript
const fuzzyMatch = (expense: Expense, query: string): boolean => {
  if (!query) return true;
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

#### Split Expenses
```typescript
const upcomingExpenses = sortedAndFilteredExpenses.filter(
  exp => !isPast(exp.date)
);
const historyExpenses = sortedAndFilteredExpenses.filter(
  exp => isPast(exp.date)
);
```

### Autocomplete Implementation
```typescript
// Extract suggestions
const allNames = useMemo(() => {
  const namesSet = new Set<string>();
  const dayNamesSet = new Set<string>();
  const datesSet = new Set<string>();
  
  expenses.forEach(expense => {
    namesSet.add(expense.name);
    dayNamesSet.add(getDayName(expense.date));
    datesSet.add(getDateNumber(expense.date));
    
    expense.items?.forEach(item => {
      namesSet.add(item.name);
    });
  });
  
  return [...namesSet, ...dayNamesSet, ...datesSet].sort();
}, [expenses]);

// Filter suggestions
const suggestions = useMemo(() => {
  if (!searchQuery.trim()) return [];
  
  return allNames
    .filter(name => name.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 10);
}, [allNames, searchQuery]);
```

### Keyboard Navigation
```typescript
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (!showSuggestions || suggestions.length === 0) return;

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
      break;
    case 'ArrowUp':
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
      break;
    case 'Enter':
      e.preventDefault();
      if (selectedSuggestionIndex >= 0) {
        handleSelectSuggestion(suggestions[selectedSuggestionIndex]);
      }
      break;
    case 'Escape':
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
      break;
  }
};
```

---

## 7. AddExpenseForm.tsx

### Props
```typescript
interface AddExpenseFormProps {
  templates: FixedExpenseTemplate[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
}
```

### State
```typescript
const [name, setName] = useState('');
const [amount, setAmount] = useState(0);
const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
const [selectedTemplate, setSelectedTemplate] = useState<string>('');
const [items, setItems] = useState<ExpenseItem[]>([]);
```

### Template Selection
```typescript
const handleTemplateSelect = (templateId: string) => {
  const template = templates.find(t => t.id === templateId);
  if (template) {
    setName(template.name);
    setItems([...template.items]);
    setSelectedTemplate(templateId);
  }
};
```

### Submit Handler
```typescript
const handleSubmit = () => {
  const template = templates.find(t => t.id === selectedTemplate);
  const totalAmount = items.length > 0
    ? items.reduce((sum, item) => sum + item.amount, 0)
    : amount;
  
  onAddExpense({
    name,
    amount: totalAmount,
    date,
    items: items.length > 0 ? items : undefined,
    color: template?.color
  });
  
  // Reset
  setName('');
  setAmount(0);
  setItems([]);
  setSelectedTemplate('');
};
```

---

## 8. FixedExpenseTemplates.tsx

### Props
```typescript
interface FixedExpenseTemplatesProps {
  templates: FixedExpenseTemplate[];
  onSaveTemplates: (templates: FixedExpenseTemplate[]) => void;
}
```

### State
```typescript
const [localTemplates, setLocalTemplates] = useState<FixedExpenseTemplate[]>(templates);
const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set());
```

### Add New Template
```typescript
const handleAddTemplate = () => {
  const newTemplate: FixedExpenseTemplate = {
    id: `template-${Date.now()}`,
    name: 'Template Baru',
    items: [{ name: '', amount: 0 }],
    color: '#3b82f6'
  };
  
  setLocalTemplates([...localTemplates, newTemplate]);
  setEditingTemplateId(newTemplate.id);
};
```

### Color Picker
```typescript
const colors = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#64748b', '#78716c', '#a8a29e'
];

<div className="flex flex-wrap gap-2">
  {colors.map(color => (
    <button
      key={color}
      className="w-8 h-8 rounded-full border-2"
      style={{ backgroundColor: color }}
      onClick={() => updateTemplateColor(templateId, color)}
    />
  ))}
</div>
```

### Save Templates
```typescript
const handleSave = () => {
  onSaveTemplates(localTemplates);
  toast.success('Template tersimpan');
};
```

---

## 9. BudgetOverview.tsx

### Props
```typescript
interface BudgetOverviewProps {
  totalBudget: number;
  totalExpenses: number;
  result: number;
}
```

### Display
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <Card>
    <CardHeader>
      <CardTitle className="text-sm">Total Budget</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-2xl">{formatCurrency(totalBudget)}</p>
    </CardContent>
  </Card>
  
  <Card>
    <CardHeader>
      <CardTitle className="text-sm">Total Pengeluaran</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-2xl text-red-600">{formatCurrency(totalExpenses)}</p>
    </CardContent>
  </Card>
  
  <Card>
    <CardHeader>
      <CardTitle className="text-sm">Sisa Budget</CardTitle>
    </CardHeader>
    <CardContent>
      <p className={`text-2xl ${result < 0 ? 'text-red-600' : 'text-green-600'}`}>
        {formatCurrency(result)}
      </p>
    </CardContent>
  </Card>
</div>
```

### Currency Formatting
```typescript
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
```

---

## 10. LoadingSkeleton.tsx

### Purpose
Beautiful skeleton loading screen with animations untuk better user experience saat fetching data.

### Features
- Mimics actual layout structure
- Smooth fade-in and slide animations
- Staggered entrance (components appear sequentially)
- Pulsing dots animation untuk visual feedback
- No props needed (pure presentational component)

### Structure
```tsx
export function LoadingSkeleton() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background p-4 md:p-8"
    >
      {/* Header skeleton */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <Skeleton className="h-10 w-64 mx-auto" />
        <Skeleton className="h-5 w-96 mx-auto" />
      </motion.div>

      {/* Month selector skeleton */}
      <Skeleton className="h-12 w-full max-w-md mx-auto" />

      {/* Budget overview cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-full" />
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* More skeletons... */}

      {/* Loading indicator with pulse animation */}
      <motion.div className="flex items-center justify-center gap-2 py-8">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="size-2 rounded-full bg-primary"
        />
        {/* More dots... */}
      </motion.div>
    </motion.div>
  );
}
```

### Animation Delays
- Header: 0.1s
- Month Selector: 0.15s
- Budget Cards: 0.2s, 0.3s, 0.4s (staggered)
- Collapsible Section: 0.5s
- Add Button: 0.6s
- Expense List: 0.7s
- List items: 0.7s, 0.8s, 0.9s, 1.0s (staggered)

### Usage
```tsx
if (isLoading) {
  return <LoadingSkeleton />;
}
```

### Benefits
- Professional appearance
- Better perceived performance (feels faster)
- Clear visual feedback during loading
- Prevents layout shift
- Engaging animation keeps users patient

---

## Utility Functions

### Date Formatting
```typescript
// Format: "Senin, 15 Jan"
const formatDateShort = (dateString: string) => {
  const date = new Date(dateString);
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
};
```

### Weekend Check
```typescript
const isWeekend = (dateString: string) => {
  const date = new Date(dateString);
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
};
```

### Day Name
```typescript
const getDayName = (dateString: string): string => {
  const date = new Date(dateString);
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  return days[date.getDay()];
};
```