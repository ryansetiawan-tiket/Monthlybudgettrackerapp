# Arsitektur & Struktur Aplikasi

## Arsitektur Sistem

### Three-Tier Architecture
```
┌─────────────────────────────────────────────┐
│           Frontend (React)                   │
│  - App.tsx (Main Component)                  │
│  - UI Components                             │
│  - State Management (useState)               │
└──────────────┬──────────────────────────────┘
               │
               │ HTTPS Requests
               │
┌──────────────▼──────────────────────────────┐
│     Server (Supabase Edge Functions)         │
│  - Hono Web Server                           │
│  - API Routes                                │
│  - Business Logic                            │
└──────────────┬──────────────────────────────┘
               │
               │ Database Operations
               │
┌──────────────▼──────────────────────────────┐
│        Database (Supabase)                   │
│  - KV Store (kv_store_3adbeaf1)             │
│  - Key-Value Storage                         │
└─────────────────────────────────────────────┘
```

## Struktur Folder

```
/
├── App.tsx                          # Main application component
├── components/                      # React components
│   ├── AddExpenseDialog.tsx        # Dialog untuk tambah pengeluaran
│   ├── AddExpenseForm.tsx          # Form tambah pengeluaran inline
│   ├── AdditionalIncomeForm.tsx    # Form pemasukan tambahan
│   ├── AdditionalIncomeList.tsx    # List pemasukan
│   ├── BudgetForm.tsx              # Form budget awal & carryover
│   ├── BudgetOverview.tsx          # Summary budget & hasil akhir
│   ├── ExpenseList.tsx             # List pengeluaran (Upcoming & History)
│   ├── FixedExpenseTemplates.tsx   # Management template pengeluaran tetap
│   ├── MonthSelector.tsx           # Selector bulan dengan calendar
│   └── ui/                         # Shadcn UI components
├── supabase/functions/server/      # Backend server
│   ├── index.tsx                   # Main server file (Hono routes)
│   └── kv_store.tsx                # KV Store utility (protected)
├── utils/supabase/                 # Supabase utilities
│   └── info.tsx                    # Project ID & API keys
├── data/                           # Static data
│   └── funny-quotes.ts             # Quotes untuk motivasi
├── styles/
│   └── globals.css                 # Global styles & Tailwind config
└── docs/tracking-app-wiki/         # Dokumentasi lengkap
```

## Data Flow

### 1. Frontend → Server
```typescript
// Frontend makes request
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-3adbeaf1/budget/${yearMonth}`,
  {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`
    }
  }
);
```

### 2. Server → Database
```typescript
// Server uses KV Store
import * as kv from './kv_store.tsx';

// Get data
const data = await kv.get(`budget:${yearMonth}`);

// Set data
await kv.set(`budget:${yearMonth}`, budgetData);
```

### 3. Response Flow
```
Database → Server (process) → Frontend (setState)
```

## State Management

### App-Level State
Semua state di-manage di `App.tsx` menggunakan React `useState`:

```typescript
// Budget & Income
const [budget, setBudget] = useState(0);
const [carryover, setCarryover] = useState(0);
const [additionalIncomes, setAdditionalIncomes] = useState<AdditionalIncome[]>([]);

// Expenses
const [expenses, setExpenses] = useState<Expense[]>([]);
const [fixedExpenseTemplates, setFixedExpenseTemplates] = useState<FixedExpenseTemplate[]>([]);

// UI State
const [selectedMonth, setSelectedMonth] = useState(new Date());
const [isDialogOpen, setIsDialogOpen] = useState(false);
const [activeTab, setActiveTab] = useState('');
```

### Data Persistence Flow
1. User melakukan aksi (input/edit/delete)
2. State di-update via setState
3. `useEffect` trigger save ke server
4. Server menyimpan ke database
5. Response confirmation (toast notification)

## API Routes

### Server Endpoints (`/supabase/functions/server/index.tsx`)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/make-server-3adbeaf1/budget/:yearMonth` | Get budget data untuk bulan tertentu |
| POST | `/make-server-3adbeaf1/budget/:yearMonth` | Save budget data |
| GET | `/make-server-3adbeaf1/exchange-rate` | Get USD to IDR exchange rate |
| GET | `/make-server-3adbeaf1/templates` | Get semua expense templates |
| POST | `/make-server-3adbeaf1/templates` | Save expense templates |

### Request/Response Format

#### GET Budget
```typescript
// Response
{
  budget: number,
  carryover: number,
  additionalIncomes: AdditionalIncome[],
  expenses: Expense[],
  notes: string
}
```

#### POST Budget
```typescript
// Request Body
{
  budget: number,
  carryover: number,
  additionalIncomes: AdditionalIncome[],
  expenses: Expense[],
  notes: string
}

// Response
{ success: true, message: "Budget saved" }
```

#### GET Exchange Rate
```typescript
// Response
{
  rate: number,        // USD to IDR rate
  timestamp: string    // Last update time
}
```

## Database Schema (KV Store)

### Key Structure
```
budget:{yearMonth}                    # e.g., "budget:2025-01"
templates:fixedExpenses               # Global templates
```

### Budget Data Structure
```typescript
{
  budget: number,                     // Budget awal
  carryover: number,                  // Carry over dari bulan lalu
  additionalIncomes: [
    {
      id: string,
      name: string,
      amount: number,
      currency: 'IDR' | 'USD',
      exchangeRate?: number,
      convertedAmount?: number
    }
  ],
  expenses: [
    {
      id: string,
      name: string,
      amount: number,
      date: string,                   // ISO date string
      items?: [
        {
          name: string,
          amount: number
        }
      ],
      color?: string                  // Template color
    }
  ],
  notes: string
}
```

### Template Data Structure
```typescript
{
  templates: [
    {
      id: string,
      name: string,
      items: [
        {
          name: string,
          amount: number
        }
      ],
      color: string                   // Hex color code
    }
  ]
}
```

## Component Communication

### Parent-Child Props Pattern
```
App.tsx
  ├── MonthSelector (selectedMonth, onMonthChange)
  ├── BudgetForm (budget, carryover, onBudgetChange, onCarryoverChange)
  ├── AdditionalIncomeForm (onAddIncome)
  ├── AdditionalIncomeList (incomes, onDeleteIncome, onEditIncome)
  ├── FixedExpenseTemplates (templates, onSaveTemplates)
  ├── AddExpenseForm (templates, onAddExpense)
  ├── ExpenseList (expenses, onDeleteExpense, onEditExpense)
  └── BudgetOverview (totalBudget, totalExpenses, result)
```

### Event Flow
1. User interaction di child component
2. Child component memanggil callback props (onXxx)
3. Parent (App.tsx) meng-update state
4. Re-render terjadi dengan data terbaru
5. useEffect auto-save ke database

## External Dependencies

### ExchangeRate-API
```
Endpoint: https://v6.exchangerate-api.com/v6/{API_KEY}/latest/USD
Response: { conversion_rates: { IDR: number } }
Cache: Server-side cache untuk mengurangi API calls
```

### Environment Variables
```
SUPABASE_URL                    # Supabase project URL
SUPABASE_ANON_KEY              # Public anonymous key
SUPABASE_SERVICE_ROLE_KEY       # Service role key (server-only)
EXCHANGE_RATE_API_KEY           # ExchangeRate-API key
```

## Performance Considerations

### Optimizations Implemented
1. **Debounced Auto-save**: Prevent too many database writes
2. **Memoized Calculations**: useMemo untuk perhitungan berat
3. **Server-side Caching**: Exchange rate di-cache di server
4. **Lazy Loading**: Components loaded on-demand
5. **Efficient Sorting**: Pre-sorted data di backend

### Future Optimization Opportunities
- Implement React Query for better caching
- Add pagination untuk expense list yang panjang
- Optimize bundle size dengan code splitting
- Add service worker for offline support
