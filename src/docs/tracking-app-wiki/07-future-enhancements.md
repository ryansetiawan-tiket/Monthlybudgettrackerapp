# Future Enhancements & Roadmap

## Prioritized Feature Roadmap

---

## Phase 1: Core Improvements (High Priority)

### 1.1 Data Export/Import
**Priority:** HIGH
**Effort:** Medium

**Features:**
- Export budget data to JSON/CSV
- Import from JSON/CSV
- Backup all months at once
- Selective export (specific months)

**Use Cases:**
- Data backup
- Migrate to new account
- Share budget template
- Analyze in Excel/Sheets

**Implementation:**
```typescript
// Export
const exportAllData = async () => {
  const allBudgets = await kv.getByPrefix('budget:');
  const allTemplates = await kv.get('templates:fixedExpenses');
  
  const exportData = {
    budgets: allBudgets,
    templates: allTemplates,
    exportDate: new Date().toISOString(),
    version: '1.0'
  };
  
  downloadJSON(exportData, `budget-export-${Date.now()}.json`);
};

// Import
const importData = async (file: File) => {
  const data = await parseJSON(file);
  
  // Validate structure
  if (!validateImportData(data)) {
    throw new Error('Invalid data format');
  }
  
  // Confirm overwrite
  if (await confirmOverwrite()) {
    for (const [key, value] of Object.entries(data.budgets)) {
      await kv.set(key, value);
    }
    await kv.set('templates:fixedExpenses', data.templates);
  }
};
```

---

### 1.2 Undo/Redo Functionality
**Priority:** HIGH
**Effort:** Medium

**Features:**
- Undo last action
- Redo undone action
- History stack (last 10 actions)
- Keyboard shortcuts (Ctrl+Z, Ctrl+Y)

**Implementation:**
```typescript
const [history, setHistory] = useState<Action[]>([]);
const [historyIndex, setHistoryIndex] = useState(-1);

const undo = () => {
  if (historyIndex < 0) return;
  
  const action = history[historyIndex];
  revertAction(action);
  setHistoryIndex(historyIndex - 1);
};

const redo = () => {
  if (historyIndex >= history.length - 1) return;
  
  const action = history[historyIndex + 1];
  applyAction(action);
  setHistoryIndex(historyIndex + 1);
};

// Keyboard shortcuts
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z') {
        e.preventDefault();
        undo();
      } else if (e.key === 'y') {
        e.preventDefault();
        redo();
      }
    }
  };
  
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [history, historyIndex]);
```

---

### 1.3 Better Delete Confirmation
**Priority:** MEDIUM
**Effort:** Low

**Features:**
- Toast with undo button (instead of immediate delete)
- Confirmation dialog for bulk delete
- Soft delete with recovery window

**Implementation:**
```typescript
const handleDeleteExpense = (id: string) => {
  const expense = expenses.find(e => e.id === id);
  
  // Soft delete (mark as deleted)
  setExpenses(expenses.filter(e => e.id !== id));
  
  // Show undo toast
  toast.success('Pengeluaran dihapus', {
    action: {
      label: 'Undo',
      onClick: () => {
        // Restore expense
        setExpenses([...expenses, expense]);
      }
    },
    duration: 5000
  });
  
  // Permanent delete after timeout
  setTimeout(() => {
    permanentlyDelete(id);
  }, 5000);
};
```

---

## Phase 2: Analytics & Insights (Medium Priority)

### 2.1 Budget Analytics Dashboard
**Priority:** HIGH
**Effort:** High

**Features:**
- Monthly spending trends (chart)
- Category breakdown (pie chart)
- Budget vs actual comparison
- Savings rate over time
- Top spending categories

**Visualizations:**
```typescript
import { LineChart, PieChart, BarChart } from 'recharts';

// Monthly trend
<LineChart data={monthlyData}>
  <Line dataKey="budget" stroke="#10b981" />
  <Line dataKey="expenses" stroke="#ef4444" />
  <Line dataKey="savings" stroke="#3b82f6" />
</LineChart>

// Category breakdown
<PieChart>
  <Pie data={categoryData} dataKey="amount" nameKey="category" />
</PieChart>
```

---

### 2.2 Budget Predictions
**Priority:** MEDIUM
**Effort:** Medium

**Features:**
- Predict next month's expenses based on history
- Identify spending patterns
- Alert if current month exceeds average
- Suggest budget adjustments

**Algorithm:**
```typescript
const predictNextMonthExpenses = (historicalData: MonthlyData[]) => {
  // Simple moving average (last 3 months)
  const recentMonths = historicalData.slice(-3);
  const avgExpenses = recentMonths.reduce((sum, month) => 
    sum + month.totalExpenses, 0
  ) / recentMonths.length;
  
  // Trend adjustment
  const trend = calculateTrend(recentMonths);
  const prediction = avgExpenses + (avgExpenses * trend);
  
  return {
    predicted: prediction,
    confidence: calculateConfidence(recentMonths),
    recommendation: generateRecommendation(prediction, avgExpenses)
  };
};
```

---

### 2.3 Spending Categories
**Priority:** MEDIUM
**Effort:** Medium

**Features:**
- Add category field to expenses
- Predefined categories (Food, Transport, etc.)
- Custom categories
- Category-based filtering
- Category budgets & limits

**Data Structure:**
```typescript
interface Expense {
  id: string;
  name: string;
  amount: number;
  date: string;
  category: string;  // NEW
  items?: ExpenseItem[];
}

interface CategoryBudget {
  category: string;
  limit: number;
  spent: number;
  percentage: number;
}
```

---

## Phase 3: Enhanced UX (Medium Priority)

### 3.1 Bulk Operations
**Priority:** MEDIUM
**Effort:** Medium

**Features:**
- Select multiple expenses (checkbox)
- Bulk delete
- Bulk edit (change date, category)
- Bulk export

**UI:**
```typescript
const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set());

// Select all in section
<Checkbox 
  checked={selectedExpenses.size === expenses.length}
  onCheckedChange={(checked) => {
    if (checked) {
      setSelectedExpenses(new Set(expenses.map(e => e.id)));
    } else {
      setSelectedExpenses(new Set());
    }
  }}
/>

// Bulk actions
{selectedExpenses.size > 0 && (
  <div className="fixed bottom-20 left-0 right-0 flex justify-center gap-2">
    <Button onClick={bulkDelete}>Delete ({selectedExpenses.size})</Button>
    <Button onClick={bulkEdit}>Edit ({selectedExpenses.size})</Button>
  </div>
)}
```

---

### 3.2 Drag & Drop Reordering
**Priority:** LOW
**Effort:** Medium

**Features:**
- Drag to reorder expenses (manual sort)
- Drag to reorder template items
- Visual feedback during drag

**Library:** react-dnd

---

### 3.3 Keyboard Shortcuts
**Priority:** MEDIUM
**Effort:** Low

**Shortcuts:**
- `N` - New expense
- `T` - New template
- `I` - New income
- `/` - Focus search
- `Ctrl+S` - Manual save
- `Ctrl+Z` - Undo
- `Ctrl+Y` - Redo
- `←/→` - Navigate months
- `Esc` - Close dialog

**Implementation:**
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ignore if typing in input
    if (e.target instanceof HTMLInputElement) return;
    
    switch (e.key) {
      case 'n':
        setIsDialogOpen(true);
        setActiveTab('pengeluaran');
        break;
      case '/':
        e.preventDefault();
        searchInputRef.current?.focus();
        break;
      // ... more shortcuts
    }
  };
  
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);
```

---

## Phase 4: Collaboration & Sharing (Low Priority)

### 4.1 Multi-User Support
**Priority:** LOW
**Effort:** HIGH

**Features:**
- Share budget with family/partner
- Role-based permissions (view/edit)
- Real-time sync between users
- Activity log (who changed what)

**Implementation:**
- Use Supabase Auth
- Add user_id to all data
- Implement Row Level Security (RLS)
- Use Supabase Realtime for sync

---

### 4.2 Public Budget Templates
**Priority:** LOW
**Effort:** Medium

**Features:**
- Share your template with community
- Browse public templates
- Import template from others
- Rating & reviews

---

## Phase 5: Mobile Experience (Medium Priority)

### 5.1 Progressive Web App (PWA)
**Priority:** MEDIUM
**Effort:** Medium

**Features:**
- Install on home screen
- Offline support
- Push notifications (budget alerts)
- App-like experience

**Implementation:**
```typescript
// Service worker for offline
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// Manifest.json
{
  "name": "Budget Tracker",
  "short_name": "Budget",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [...]
}
```

---

### 5.2 Mobile-Optimized Gestures
**Priority:** LOW
**Effort:** Medium

**Features:**
- Swipe to delete expense
- Pull to refresh
- Swipe between months
- Long-press for quick actions

---

## Phase 6: Advanced Features (Low Priority)

### 6.1 Recurring Expenses
**Priority:** MEDIUM
**Effort:** Medium

**Features:**
- Set expense as recurring (monthly, weekly, etc.)
- Auto-add on schedule
- Edit future occurrences
- Skip/delete specific occurrence

**Data Structure:**
```typescript
interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  items?: ExpenseItem[];
}
```

---

### 6.2 Budget Goals
**Priority:** MEDIUM
**Effort:** Low

**Features:**
- Set savings goal
- Track progress
- Visual progress bar
- Alerts when off-track

**UI:**
```typescript
<Card>
  <CardHeader>
    <CardTitle>Savings Goal</CardTitle>
  </CardHeader>
  <CardContent>
    <Progress value={(saved / goal) * 100} />
    <p>{formatCurrency(saved)} / {formatCurrency(goal)}</p>
    <p className="text-sm text-muted-foreground">
      {daysRemaining} days remaining
    </p>
  </CardContent>
</Card>
```

---

### 6.3 Receipt Scanning (OCR)
**Priority:** LOW
**Effort:** HIGH

**Features:**
- Take photo of receipt
- OCR extracts amount, date, items
- Auto-populate expense form
- Store receipt image

**Implementation:**
- Use Tesseract.js for OCR
- Store images in Supabase Storage
- Link image to expense

---

### 6.4 Multi-Currency Support
**Priority:** LOW
**Effort:** Medium

**Features:**
- Support more currencies (EUR, GBP, etc.)
- Set primary currency
- Convert all to primary for totals
- Historical exchange rates

---

### 6.5 Budget Comparison
**Priority:** LOW
**Effort:** Low

**Features:**
- Compare 2+ months side-by-side
- Highlight differences
- Trend indicators
- Export comparison report

---

## Phase 7: Integrations (Low Priority)

### 7.1 Bank Account Integration
**Priority:** LOW
**Effort:** VERY HIGH

**Features:**
- Connect bank account (Plaid/similar)
- Auto-import transactions
- Categorize automatically
- Reconcile with manual entries

**Challenges:**
- Compliance & security
- API costs
- Limited bank support in Indonesia

---

### 7.2 Calendar Integration
**Priority:** LOW
**Effort:** Low

**Features:**
- Export expenses to Google Calendar
- Import events as expenses
- Sync due dates

---

## Technical Debt & Refactoring

### Code Quality
- [ ] Add TypeScript strict mode
- [ ] Add ESLint rules
- [ ] Add Prettier for formatting
- [ ] Add unit tests (Jest)
- [ ] Add integration tests (Playwright)
- [ ] Add E2E tests

### Performance
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Virtual scrolling for large lists
- [ ] Optimize bundle size
- [ ] Add performance monitoring

### Architecture
- [ ] Migrate to React Query for data fetching
- [ ] Implement proper state management (Zustand/Redux)
- [ ] Extract business logic from components
- [ ] Create custom hooks for reusable logic

---

## Community Features

### 7.1 User Feedback System
**Priority:** MEDIUM
**Effort:** Low

**Features:**
- In-app feedback form
- Bug reporting
- Feature requests
- Rating system

---

### 7.2 Help & Onboarding
**Priority:** MEDIUM
**Effort:** Medium

**Features:**
- First-time user tutorial
- Interactive walkthrough
- Tooltips for features
- Video tutorials
- FAQ section

---

## Metrics & Monitoring

### Add Analytics
- Track feature usage
- Monitor performance
- Error tracking (Sentry)
- User behavior analytics

### Health Checks
- API uptime monitoring
- Database performance
- Error rate alerts
- Usage quota monitoring

---

## Estimated Timeline

### Q1 2025
- ✅ Core features (DONE)
- [ ] Phase 1.1: Export/Import
- [ ] Phase 1.2: Undo/Redo
- [ ] Phase 1.3: Better delete confirmation

### Q2 2025
- [ ] Phase 2.1: Analytics dashboard
- [ ] Phase 3.3: Keyboard shortcuts
- [ ] Phase 5.1: PWA support

### Q3 2025
- [ ] Phase 2.2: Budget predictions
- [ ] Phase 2.3: Categories
- [ ] Phase 6.2: Budget goals

### Q4 2025
- [ ] Phase 3.1: Bulk operations
- [ ] Phase 6.1: Recurring expenses
- [ ] Phase 7.1: Help & onboarding

---

## Community Input

**We welcome suggestions!**

Please submit feature requests via:
- GitHub Issues
- In-app feedback form (when implemented)
- Email to support

**Voting:**
Users can vote on feature requests to help prioritize development.
