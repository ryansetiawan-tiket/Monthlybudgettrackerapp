# Backend & Server Documentation

## Server Overview

**Framework:** Hono (Fast web framework untuk Edge)
**Runtime:** Deno (Supabase Edge Functions)
**File:** `/supabase/functions/server/index.tsx`

---

## Server Configuration

### Initialization
```typescript
import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Start server
Deno.serve(app.fetch);
```

### CORS Configuration
```typescript
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));
```

---

## API Endpoints

### Base URL
```
https://{projectId}.supabase.co/functions/v1/make-server-3adbeaf1
```

### Authentication
All requests require Authorization header:
```
Authorization: Bearer {publicAnonKey}
```

---

## 1. Get Budget Data

### Endpoint
```
GET /make-server-3adbeaf1/budget/:yearMonth
```

### Parameters
- `yearMonth`: String format `YYYY-MM` (e.g., "2025-01")

### Response
```json
{
  "budget": 5000000,
  "carryover": 500000,
  "additionalIncomes": [
    {
      "id": "income-123",
      "name": "Freelance",
      "amount": 1000000,
      "currency": "IDR"
    },
    {
      "id": "income-456",
      "name": "Bonus",
      "amount": 100,
      "currency": "USD",
      "exchangeRate": 15800,
      "convertedAmount": 1580000
    }
  ],
  "expenses": [
    {
      "id": "expense-789",
      "name": "Jajan",
      "amount": 50000,
      "date": "2025-01-15"
    },
    {
      "id": "expense-101",
      "name": "Belanja Bulanan",
      "amount": 500000,
      "date": "2025-01-10",
      "items": [
        { "name": "Beras", "amount": 150000 },
        { "name": "Sayur", "amount": 50000 },
        { "name": "Daging", "amount": 300000 }
      ],
      "color": "#3b82f6"
    }
  ],
  "notes": "Bulan ini harus lebih hemat"
}
```

### Implementation
```typescript
app.get('/make-server-3adbeaf1/budget/:yearMonth', async (c) => {
  try {
    const yearMonth = c.req.param('yearMonth');
    const key = `budget:${yearMonth}`;
    
    const data = await kv.get(key);
    
    if (!data) {
      return c.json({
        budget: 0,
        carryover: 0,
        additionalIncomes: [],
        expenses: [],
        notes: ''
      });
    }
    
    return c.json(data);
  } catch (error) {
    console.error('Error fetching budget data:', error);
    return c.json({ error: 'Failed to fetch budget data' }, 500);
  }
});
```

---

## 2. Save Budget Data

### Endpoint
```
POST /make-server-3adbeaf1/budget/:yearMonth
```

### Parameters
- `yearMonth`: String format `YYYY-MM`

### Request Body
```json
{
  "budget": 5000000,
  "carryover": 500000,
  "additionalIncomes": [...],
  "expenses": [...],
  "notes": "Some notes"
}
```

### Response
```json
{
  "success": true,
  "message": "Budget data saved successfully"
}
```

### Implementation
```typescript
app.post('/make-server-3adbeaf1/budget/:yearMonth', async (c) => {
  try {
    const yearMonth = c.req.param('yearMonth');
    const body = await c.req.json();
    const key = `budget:${yearMonth}`;
    
    await kv.set(key, body);
    
    console.log(`Budget data saved for ${yearMonth}`);
    
    return c.json({
      success: true,
      message: 'Budget data saved successfully'
    });
  } catch (error) {
    console.error('Error saving budget data:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to save budget data' 
    }, 500);
  }
});
```

---

## 3. Get Exchange Rate

### Endpoint
```
GET /make-server-3adbeaf1/exchange-rate
```

### Response
```json
{
  "rate": 15850,
  "timestamp": 1737187200000
}
```

### Implementation with Caching
```typescript
// Cache configuration
let cachedRate: { rate: number; timestamp: number } | null = null;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

app.get('/make-server-3adbeaf1/exchange-rate', async (c) => {
  try {
    const now = Date.now();
    
    // Return cached rate if still valid
    if (cachedRate && (now - cachedRate.timestamp) < CACHE_DURATION) {
      console.log('Returning cached exchange rate');
      return c.json({
        rate: cachedRate.rate,
        timestamp: cachedRate.timestamp
      });
    }
    
    // Fetch fresh rate from API
    const apiKey = Deno.env.get('EXCHANGE_RATE_API_KEY');
    if (!apiKey) {
      throw new Error('EXCHANGE_RATE_API_KEY not configured');
    }
    
    const apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Exchange rate API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.conversion_rates || !data.conversion_rates.IDR) {
      throw new Error('Invalid response from exchange rate API');
    }
    
    const rate = data.conversion_rates.IDR;
    
    // Update cache
    cachedRate = {
      rate: rate,
      timestamp: now
    };
    
    console.log(`Exchange rate fetched: 1 USD = ${rate} IDR`);
    
    return c.json({
      rate: rate,
      timestamp: now
    });
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    return c.json({ 
      error: 'Failed to fetch exchange rate',
      details: error.message 
    }, 500);
  }
});
```

### Caching Strategy
- **Duration**: 1 hour
- **Reason**: Exchange rates don't change frequently, reduces API calls
- **Invalidation**: Time-based (automatic after 1 hour)

### Error Handling
- Missing API key → 500 error
- API down → 500 error with details
- Invalid response → 500 error
- Frontend fallback: Manual rate input

---

## 4. Get Templates

### Endpoint
```
GET /make-server-3adbeaf1/templates
```

### Response
```json
{
  "templates": [
    {
      "id": "template-123",
      "name": "Belanja Bulanan",
      "items": [
        { "name": "Beras", "amount": 150000 },
        { "name": "Sayur", "amount": 50000 },
        { "name": "Daging", "amount": 300000 }
      ],
      "color": "#3b82f6"
    },
    {
      "id": "template-456",
      "name": "Utilities",
      "items": [
        { "name": "Listrik", "amount": 200000 },
        { "name": "Air", "amount": 100000 },
        { "name": "Internet", "amount": 300000 }
      ],
      "color": "#10b981"
    }
  ]
}
```

### Implementation
```typescript
app.get('/make-server-3adbeaf1/templates', async (c) => {
  try {
    const key = 'templates:fixedExpenses';
    const data = await kv.get(key);
    
    if (!data) {
      return c.json({ templates: [] });
    }
    
    return c.json(data);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return c.json({ error: 'Failed to fetch templates' }, 500);
  }
});
```

---

## 5. Save Templates

### Endpoint
```
POST /make-server-3adbeaf1/templates
```

### Request Body
```json
{
  "templates": [
    {
      "id": "template-123",
      "name": "Belanja Bulanan",
      "items": [...],
      "color": "#3b82f6"
    }
  ]
}
```

### Response
```json
{
  "success": true,
  "message": "Templates saved successfully"
}
```

### Implementation
```typescript
app.post('/make-server-3adbeaf1/templates', async (c) => {
  try {
    const body = await c.req.json();
    const key = 'templates:fixedExpenses';
    
    await kv.set(key, body);
    
    console.log('Templates saved successfully');
    
    return c.json({
      success: true,
      message: 'Templates saved successfully'
    });
  } catch (error) {
    console.error('Error saving templates:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to save templates' 
    }, 500);
  }
});
```

---

## KV Store Utilities

### File Location
```
/supabase/functions/server/kv_store.tsx
```

**⚠️ PROTECTED FILE - DO NOT MODIFY**

### Available Functions

#### get(key)
```typescript
const data = await kv.get('budget:2025-01');
// Returns: object | null
```

#### set(key, value)
```typescript
await kv.set('budget:2025-01', {
  budget: 5000000,
  expenses: []
});
// Returns: void
```

#### del(key)
```typescript
await kv.del('budget:2025-01');
// Returns: void
```

#### mget(keys[])
```typescript
const data = await kv.mget(['budget:2025-01', 'budget:2025-02']);
// Returns: array of values
```

#### mset(entries)
```typescript
await kv.mset([
  ['budget:2025-01', data1],
  ['budget:2025-02', data2]
]);
// Returns: void
```

#### mdel(keys[])
```typescript
await kv.mdel(['budget:2025-01', 'budget:2025-02']);
// Returns: void
```

#### getByPrefix(prefix)
```typescript
const allBudgets = await kv.getByPrefix('budget:');
// Returns: array of values
```

---

## Database Structure

### Table: kv_store_3adbeaf1

| Column | Type | Description |
|--------|------|-------------|
| key | TEXT | Primary key |
| value | JSONB | JSON data |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-updated |

### Key Patterns
```
budget:{yearMonth}              # e.g., "budget:2025-01"
templates:fixedExpenses         # Global templates
```

### Example Data
```sql
-- Budget data
{
  key: "budget:2025-01",
  value: {
    "budget": 5000000,
    "carryover": 500000,
    "additionalIncomes": [...],
    "expenses": [...],
    "notes": "..."
  }
}

-- Templates
{
  key: "templates:fixedExpenses",
  value: {
    "templates": [...]
  }
}
```

---

## Error Handling

### Server-Side Logging
```typescript
try {
  // Operation
} catch (error) {
  console.error('Detailed error message:', error);
  return c.json({ 
    error: 'User-friendly message',
    details: error.message 
  }, 500);
}
```

### Frontend Error Handling
```typescript
try {
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Request failed');
  }
  
  const data = await response.json();
  return data;
} catch (error) {
  console.error('API Error:', error);
  toast.error(error.message);
  // Fallback behavior
}
```

---

## Environment Variables

### Required Variables
```bash
SUPABASE_URL                    # Supabase project URL
SUPABASE_ANON_KEY              # Public anonymous key (frontend)
SUPABASE_SERVICE_ROLE_KEY       # Service role key (backend only)
EXCHANGE_RATE_API_KEY           # ExchangeRate-API key
```

### Accessing in Server
```typescript
const apiKey = Deno.env.get('EXCHANGE_RATE_API_KEY');
```

### Accessing in Frontend
```typescript
import { projectId, publicAnonKey } from './utils/supabase/info';
```

---

## Performance Optimizations

### 1. Exchange Rate Caching
- Cache duration: 1 hour
- Reduces external API calls
- Faster response time

### 2. Single Request Pattern
- Frontend sends all data in one request
- Server saves to database once
- Reduces database writes

### 3. Debounced Auto-Save
- Frontend debounces save requests (1 second)
- Prevents excessive writes during rapid changes
- Better UX (less network traffic)

---

## Security Considerations

### 1. API Key Protection
- Exchange Rate API key stored in environment variable
- Never exposed to frontend
- Only accessible from server

### 2. Service Role Key
- Used for server-side operations
- NEVER sent to frontend
- Provides elevated database permissions

### 3. CORS Configuration
- Open CORS for development
- In production: restrict to specific domains

### 4. Input Validation
**Future Enhancement:**
```typescript
// Validate budget data structure
const validateBudgetData = (data: any): boolean => {
  if (typeof data.budget !== 'number') return false;
  if (typeof data.carryover !== 'number') return false;
  if (!Array.isArray(data.expenses)) return false;
  // ... more validation
  return true;
};
```

---

## Monitoring & Debugging

### Server Logs
```typescript
// Logger middleware logs all requests
app.use('*', logger(console.log));

// Custom logging
console.log(`Budget data saved for ${yearMonth}`);
console.error('Error fetching budget data:', error);
```

### View Logs
```bash
# Supabase CLI
supabase functions logs make-server-3adbeaf1

# Or in Supabase Dashboard → Edge Functions → Logs
```

### Common Issues

**Issue:** 500 error on exchange rate
**Solution:** Check EXCHANGE_RATE_API_KEY is set

**Issue:** Data not saving
**Solution:** Check network tab, verify request body format

**Issue:** Slow response
**Solution:** Check database query performance, verify caching works
