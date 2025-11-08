# 📊 BUDGET LIMIT SYSTEM - HOW IT WORKS

**Complete Explanation** - November 8, 2025

---

## 🎯 OVERVIEW

**Budget Limit System** adalah fitur di **Phase 8 (Customization Features)** yang memungkinkan user untuk:
1. Set **budget limit bulanan** per kategori
2. Set **warning threshold** (kapan diberi warning)
3. Set **reset day** (tanggal reset tracking setiap bulan)
4. Melihat **status indicator** real-time (Safe/Warning/Danger/Exceeded)

**Contoh Use Case:**
- User set budget "Food 🍔" = Rp 500.000/bulan
- Warning threshold = 80%
- Setiap bulan auto-reset di tanggal 1
- Sistem akan warn jika spending ≥ Rp 400.000 (80%)
- Sistem akan alert jika spending ≥ Rp 500.000 (100%)

---

## 📋 KOMPONEN SISTEM

### 1. **BudgetLimitEditor Component**
**File:** `/components/BudgetLimitEditor.tsx`

**Fungsi:** Dialog untuk set/edit budget limit per kategori

**Fields:**
```typescript
{
  enabled: boolean;        // Enable/disable budget limit
  limit: number;           // Monthly budget limit (Rp)
  warningAt: number;       // Warning threshold (50-95%)
  resetDay: number;        // Reset day of month (1-31)
}
```

**UI Elements:**
- ✅ Enable/Disable toggle switch
- 💰 Monthly Budget Limit input (with currency formatting)
- ⚠️ Warning Threshold slider (50%-95%, step 5%)
- 📅 Monthly Reset Day input (1-31)
- 🎨 Status Indicators preview

---

## 🚀 CARA KERJA SISTEM

### Step 1: User Set Budget Limit

**User Actions:**
1. Buka **Category Manager** (dari menu)
2. Pilih kategori (misal: "Food 🍔")
3. Klik **Settings icon** (⚙️)
4. **BudgetLimitEditor** dialog opens
5. Enable budget limit dengan toggle
6. Set:
   - **Monthly Budget Limit:** Rp 500.000
   - **Warning Threshold:** 80% (slider)
   - **Reset Day:** 1 (tanggal 1 setiap bulan)
7. Klik **Save**

**Data Tersimpan:**
```typescript
{
  id: 'food',
  label: 'Food',
  emoji: '🍔',
  color: '#10B981',
  budget: {
    enabled: true,
    limit: 500000,           // Rp 500.000
    warningAt: 80,           // 80%
    resetDay: 1              // Reset tanggal 1
  }
}
```

**Lokasi Penyimpanan:**
- `localStorage` key: `category-settings-v1`
- Managed by: `/hooks/useCategorySettings.ts`

---

### Step 2: User Menambah Expense

**Scenario:**
- User tambah expense kategori "Food 🍔"
- Amount: Rp 100.000
- Current spending for Food: Rp 0 → Rp 100.000

**Yang Terjadi:**
1. ✅ Expense tersimpan di database
2. 🔄 Category breakdown di-update
3. 📊 Budget tracking dihitung:
   ```
   Total Spent: Rp 100.000
   Budget Limit: Rp 500.000
   Percentage: 20%
   Status: SAFE (below 80%)
   ```

---

### Step 3: User Approaching Warning Threshold

**Scenario:**
- User terus tambah expense Food
- Total spending: Rp 420.000

**Yang Terjadi:**
```
Total Spent: Rp 420.000
Budget Limit: Rp 500.000
Percentage: 84%
Status: WARNING (80% - 89%)
```

**⚠️ WARNING INDICATOR:**
- Visual indicator: 🟡 Amber/Yellow
- Badge: "Warning (80% - 89%)"
- Background: `bg-amber-500/10`
- Border: `border-amber-500/20`
- Dot: `bg-amber-500`

---

### Step 4: User Approaching Danger Zone

**Scenario:**
- Total spending: Rp 480.000

**Yang Terjadi:**
```
Total Spent: Rp 480.000
Budget Limit: Rp 500.000
Percentage: 96%
Status: DANGER (90% - 99%)
```

**🔶 DANGER INDICATOR:**
- Visual indicator: 🟠 Orange
- Badge: "Danger (90% - 99%)"
- Background: `bg-orange-500/10`
- Border: `border-orange-500/20`
- Dot: `bg-orange-500`

---

### Step 5: User Over Budget (EXCEEDED!)

**Scenario:**
- Total spending: Rp 550.000 (melebihi budget!)

**Yang Terjadi:**
```
Total Spent: Rp 550.000
Budget Limit: Rp 500.000
Percentage: 110%
Status: EXCEEDED (100%+)
```

**🔴 EXCEEDED INDICATOR:**
- Visual indicator: 🔴 Red
- Badge: "Exceeded (100%+)"
- Background: `bg-red-500/10`
- Border: `border-red-500/20`
- Dot: `bg-red-500`

---

### Step 6: Monthly Reset

**Scenario:**
- Tanggal 1 bulan berikutnya (sesuai `resetDay`)

**Yang Terjadi:**
1. 🔄 Budget tracking di-reset
2. ✨ Total spent kembali ke Rp 0
3. ✅ Status kembali ke SAFE
4. 📊 History bulan lalu tetap tersimpan (untuk analytics)

**Note:** 
- Reset HANYA mempengaruhi tracking, NOT data pengeluaran!
- Data expense tetap tersimpan dengan tanggalnya masing-masing
- Budget tracking dihitung per bulan berdasarkan `resetDay`

---

## 🎨 STATUS INDICATORS EXPLAINED

### 1. 🟢 SAFE (Below Warning Threshold)

**Kondisi:**
```typescript
percentage < warningAt
// Example: 20% < 80% → SAFE
```

**Visual:**
- Color: Green (#10B981)
- Background: `bg-green-500/10`
- Border: `border-green-500/20`
- Dot: `bg-green-500`
- Text: "Safe (below 80%)"

**Meaning:** 
- Spending masih jauh di bawah budget
- Aman untuk terus spending
- No action needed

---

### 2. 🟡 WARNING (Warning Threshold - 89%)

**Kondisi:**
```typescript
percentage >= warningAt && percentage < 90
// Example: 84% → WARNING
```

**Visual:**
- Color: Amber (#F59E0B)
- Background: `bg-amber-500/10`
- Border: `border-amber-500/20`
- Dot: `bg-amber-500`
- Text: "Warning (80% - 89%)"

**Meaning:**
- Spending mendekati budget limit
- User should be careful
- Consider reducing spending

---

### 3. 🟠 DANGER (90% - 99%)

**Kondisi:**
```typescript
percentage >= 90 && percentage < 100
// Example: 96% → DANGER
```

**Visual:**
- Color: Orange (#F97316)
- Background: `bg-orange-500/10`
- Border: `border-orange-500/20`
- Dot: `bg-orange-500`
- Text: "Danger (90% - 99%)"

**Meaning:**
- Spending hampir melebihi budget!
- User should STOP spending in this category
- Critical warning!

---

### 4. 🔴 EXCEEDED (100%+)

**Kondisi:**
```typescript
percentage >= 100
// Example: 110% → EXCEEDED
```

**Visual:**
- Color: Red (#EF4444)
- Background: `bg-red-500/10`
- Border: `border-red-500/20`
- Dot: `bg-red-500`
- Text: "Exceeded (100%+)"

**Meaning:**
- Budget sudah melebihi limit!
- User over budget!
- Need to adjust spending immediately

---

## 💻 IMPLEMENTATION DETAILS

### Data Structure

```typescript
interface CategoryBudget {
  limit: number;           // Monthly budget limit in Rp
  warningAt: number;       // Warning threshold percentage (50-95)
  enabled: boolean;        // Budget tracking enabled/disabled
  resetDay: number;        // Day of month to reset (1-31)
}

interface CategoryConfig {
  id: string;
  label: string;
  emoji: string;
  color: string;
  isCustom: boolean;
  budget?: CategoryBudget; // Optional budget configuration
}
```

---

### Calculation Logic

```typescript
/**
 * Calculate budget status for a category
 */
function getBudgetStatus(
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

/**
 * Get budget percentage
 */
function getBudgetPercentage(spent: number, limit: number): number {
  return (spent / limit) * 100;
}

/**
 * Calculate warning amount (when warning triggers)
 */
function getWarningAmount(limit: number, warningAt: number): number {
  return limit * (warningAt / 100);
}

// Example:
// limit = 500000, warningAt = 80
// warningAmount = 500000 * 0.80 = 400000
// → User warned when spending ≥ Rp 400.000
```

---

### Budget Tracking Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. User adds expense with category "food"              │
│    Amount: Rp 100.000                                   │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 2. System fetches all expenses for current month       │
│    with category = "food"                               │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Calculate total spent                                │
│    Total = SUM(all food expenses in current month)      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Get category budget config from localStorage        │
│    { limit: 500000, warningAt: 80 }                     │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 5. Calculate percentage                                 │
│    percentage = (total / limit) * 100                   │
│    percentage = (100000 / 500000) * 100 = 20%          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 6. Determine status                                     │
│    if (percentage < 80) → SAFE ✅                       │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 7. Display status indicator in UI                      │
│    🟢 Safe (below 80%)                                  │
│    Rp 100.000 / Rp 500.000 (20%)                       │
└─────────────────────────────────────────────────────────┘
```

---

## 🖥️ UI DISPLAY LOCATIONS

### 1. CategoryManager (List View)

**Location:** `/components/CategoryManager.tsx` line 305-309

```tsx
{category.budget?.enabled && (
  <Badge variant="outline" className="text-xs">
    Budget: {formatCurrency(category.budget.limit)}
  </Badge>
)}
```

**Display:**
```
🍔 Food                    [Custom] [Budget: Rp 500.000]
🟢 #10B981                 ⚙️ ✏️
```

---

### 2. BudgetLimitEditor (Settings Dialog)

**Location:** `/components/BudgetLimitEditor.tsx`

**Display:**
```
┌─────────────────────────────────────────────────┐
│ Set Budget Limit                           ✕   │
├─────────────────────────────────────────────────┤
│                                                 │
│ 🍔 Food                                         │
│ 🟢 Default Category                             │
│                                                 │
│ Enable Budget Limit                   [  ON  ] │
│ Set a monthly spending limit for this category │
│                                                 │
│ Monthly Budget Limit *                          │
│ ┌─────────────────────────────────┐            │
│ │ 500.000                          │            │
│ └─────────────────────────────────┘            │
│ Rp 500.000 per bulan                            │
│                                                 │
│ Warning Threshold                        80%    │
│ ━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━            │
│ 50%    70%    90%    95%                        │
│                                                 │
│ ⚠️ You'll be warned when spending reaches 80%  │
│    of the budget limit (Rp 400.000)            │
│                                                 │
│ Monthly Reset Day                               │
│ ┌─────────────────────────────────┐            │
│ │ 1                                │            │
│ └─────────────────────────────────┘            │
│ Budget tracking resets on day 1 of each month  │
│                                                 │
│ Status Indicators                               │
│ ┌─────────────────────────────────┐            │
│ │ 🟢 Safe (below 80%)              │            │
│ │ 🟡 Warning (80% - 89%)           │            │
│ │ 🟠 Danger (90% - 99%)            │            │
│ │ 🔴 Exceeded (100%+)              │            │
│ └─────────────────────────────────┘            │
│                                                 │
│         [Remove Budget]    [Cancel]  [Save]    │
└─────────────────────────────────────────────────┘
```

---

### 3. CategoryBreakdown (Future Implementation)

**Note:** Budget status indicators BELUM ditampilkan di CategoryBreakdown saat ini.

**Planned Implementation:**
```tsx
// TODO: Add to CategoryBreakdown.tsx
{categoryData.map(item => {
  const category = settings?.categories.find(c => c.id === item.category);
  const budget = category?.budget;
  
  if (budget?.enabled) {
    const percentage = (item.amount / budget.limit) * 100;
    const status = getBudgetStatus(item.amount, budget.limit, budget.warningAt);
    
    return (
      <div className="flex items-center gap-2">
        {/* Category info */}
        <span>{item.emoji} {item.label}</span>
        
        {/* Budget status indicator */}
        <Badge variant={getStatusVariant(status)}>
          {formatCurrency(item.amount)} / {formatCurrency(budget.limit)}
          ({percentage.toFixed(0)}%)
        </Badge>
      </div>
    );
  }
})}
```

---

## ⚠️ CURRENT LIMITATIONS

### 1. **Budget Status NOT Displayed in CategoryBreakdown**

**Issue:**
- BudgetLimitEditor allows setting budget
- Data tersimpan di localStorage
- TAPI status budget TIDAK ditampilkan di CategoryBreakdown pie chart

**Solution Needed:**
- Add budget status indicator ke CategoryBreakdown
- Show progress bar per kategori
- Display warning/danger/exceeded badges

---

### 2. **No Real-Time Budget Alerts**

**Issue:**
- User tidak dapat alert/notification saat melebihi threshold
- Harus manual check CategoryBreakdown

**Solution Needed:**
- Add toast notification saat spending ≥ warningAt
- Add critical alert saat spending ≥ 100%
- Consider push notification (untuk Android app)

---

### 3. **No Budget History/Analytics**

**Issue:**
- Tidak ada history budget performance
- Tidak bisa lihat trend over time
- No comparison antar bulan

**Solution Needed:**
- Add budget history tracking
- Show budget vs actual chart
- Monthly comparison analytics

---

### 4. **Reset Logic Not Implemented**

**Issue:**
- `resetDay` field ada di data structure
- TAPI logic auto-reset belum implemented
- User harus manual track

**Solution Needed:**
- Implement monthly reset logic
- Check current date vs resetDay
- Auto-reset budget tracking saat reset day

---

## 🎯 WHAT HAPPENS WHEN USER OVER LIMIT?

### Current Behavior (ACTUAL)

**Saat user over limit (100%+):**

1. ✅ **Data tetap tersimpan** - Expense tidak diblock
2. ❌ **NO automatic alert** - User tidak dapat notification
3. ❌ **NO visual warning** - Tidak ada indicator di CategoryBreakdown
4. ❌ **NO enforcement** - User masih bisa tambah expense
5. ❌ **NO automatic action** - Sistem tidak melakukan apa-apa

**Kesimpulan:** 
> **Budget limit saat ini hanya informational/advisory, BUKAN enforcement!**

---

### Expected Behavior (IDEAL)

**Saat user over limit (100%+), seharusnya:**

1. ✅ **Data tetap tersimpan** - Allow expense (tidak diblock)
2. ✅ **Toast notification** - "⚠️ Budget Food exceeded! Rp 550.000 / Rp 500.000"
3. ✅ **Visual indicator** - 🔴 Red badge di CategoryBreakdown
4. ✅ **Progress bar** - Show 110% dengan warna merah
5. ✅ **Optional dialog** - Konfirmasi "Yakin tambah expense? Budget sudah melebihi limit!"

---

## 🛠️ RECOMMENDED ENHANCEMENTS

### Priority 1: Display Budget Status in CategoryBreakdown

**Implementation:**
```typescript
// CategoryBreakdown.tsx
const categoryDataWithBudget = categoryData.map(item => {
  const category = settings?.categories.find(c => c.id === item.category);
  const budget = category?.budget;
  
  if (!budget?.enabled) return item;
  
  const percentage = (item.amount / budget.limit) * 100;
  const status = getBudgetStatus(item.amount, budget.limit, budget.warningAt);
  
  return {
    ...item,
    budget: {
      limit: budget.limit,
      spent: item.amount,
      percentage,
      status,
      warningAt: budget.warningAt
    }
  };
});
```

**UI:**
```tsx
{item.budget && (
  <div className="mt-2">
    {/* Progress bar */}
    <div className="flex items-center justify-between text-xs mb-1">
      <span className="text-muted-foreground">
        {formatCurrency(item.budget.spent)} / {formatCurrency(item.budget.limit)}
      </span>
      <span className={`font-medium ${getStatusColor(item.budget.status)}`}>
        {item.budget.percentage.toFixed(0)}%
      </span>
    </div>
    <Progress 
      value={Math.min(item.budget.percentage, 100)} 
      className={getStatusBarClass(item.budget.status)}
    />
    
    {/* Status badge */}
    <Badge 
      variant={getStatusVariant(item.budget.status)}
      className="mt-1 text-xs"
    >
      {getStatusLabel(item.budget.status)}
    </Badge>
  </div>
)}
```

---

### Priority 2: Add Real-Time Budget Alerts

**Implementation:**
```typescript
// When adding expense
const handleAddExpense = async (expense: Expense) => {
  // Save expense
  await saveExpense(expense);
  
  // Check budget
  const category = settings?.categories.find(c => c.id === expense.category);
  if (category?.budget?.enabled) {
    const totalSpent = await getTotalSpentForCategory(
      expense.category, 
      currentMonth
    );
    const percentage = (totalSpent / category.budget.limit) * 100;
    
    // Alert based on percentage
    if (percentage >= 100) {
      toast.error(
        `🔴 Budget ${category.label} exceeded! ` +
        `${formatCurrency(totalSpent)} / ${formatCurrency(category.budget.limit)} ` +
        `(${percentage.toFixed(0)}%)`
      );
    } else if (percentage >= 90) {
      toast.warning(
        `🟠 Budget ${category.label} hampir habis! ` +
        `${formatCurrency(totalSpent)} / ${formatCurrency(category.budget.limit)} ` +
        `(${percentage.toFixed(0)}%)`
      );
    } else if (percentage >= category.budget.warningAt) {
      toast.warning(
        `🟡 Budget ${category.label} mencapai ${percentage.toFixed(0)}%`
      );
    }
  }
};
```

---

### Priority 3: Monthly Auto-Reset Logic

**Implementation:**
```typescript
// utils/budgetTracking.ts
export function shouldResetBudget(
  lastResetDate: string,
  resetDay: number
): boolean {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const lastReset = new Date(lastResetDate);
  const lastResetMonth = lastReset.getMonth();
  const lastResetYear = lastReset.getFullYear();
  
  // Different month/year → should reset
  if (currentYear > lastResetYear || currentMonth > lastResetMonth) {
    return currentDay >= resetDay;
  }
  
  return false;
}

// Check and reset on app load
useEffect(() => {
  const checkBudgetReset = () => {
    categories.forEach(category => {
      if (category.budget?.enabled) {
        const lastReset = localStorage.getItem(
          `budget-last-reset-${category.id}`
        ) || '2000-01-01';
        
        if (shouldResetBudget(lastReset, category.budget.resetDay)) {
          // Reset budget tracking
          resetCategoryBudget(category.id);
          
          // Update last reset date
          localStorage.setItem(
            `budget-last-reset-${category.id}`,
            new Date().toISOString()
          );
          
          toast.info(`Budget ${category.label} telah direset untuk bulan ini`);
        }
      }
    });
  };
  
  checkBudgetReset();
}, []);
```

---

## 📊 SUMMARY

### ✅ What Works Now
1. ✅ User dapat set budget limit per kategori
2. ✅ User dapat set warning threshold (50%-95%)
3. ✅ User dapat set reset day (1-31)
4. ✅ Budget config tersimpan di localStorage
5. ✅ Budget badge ditampilkan di CategoryManager
6. ✅ Visual status indicators di BudgetLimitEditor

### ❌ What Doesn't Work Yet
1. ❌ Budget status NOT displayed in CategoryBreakdown
2. ❌ No real-time budget alerts/notifications
3. ❌ No progress bar showing budget usage
4. ❌ No monthly auto-reset logic
5. ❌ No budget history/analytics
6. ❌ No enforcement (user masih bisa over budget tanpa warning)

### 🎯 Recommended Next Steps
1. **Priority 1:** Display budget status in CategoryBreakdown with progress bars
2. **Priority 2:** Add real-time toast alerts saat approaching/exceeding budget
3. **Priority 3:** Implement monthly auto-reset based on resetDay
4. **Priority 4:** Add budget history & analytics view
5. **Priority 5:** Optional budget enforcement (block/warn before adding expense)

---

## 💡 KEY TAKEAWAYS

**Budget Limit System adalah:**
- ✅ **Advisory tool** (NOT enforcement)
- ✅ **Visual indicator** untuk budget awareness
- ✅ **Customizable** per kategori
- ✅ **Monthly tracking** dengan auto-reset (planned)

**NOT:**
- ❌ Budget enforcement (tidak block expenses)
- ❌ Automatic budget allocation
- ❌ Expense prediction/forecasting
- ❌ Multi-month budget planning

**Best Use Case:**
> Membantu user untuk **self-discipline** dalam spending, dengan visual indicator yang jelas untuk setiap kategori expense.

---

**Documentation Created:** November 8, 2025  
**Status:** System implemented, UI enhancements needed  
**Next Review:** After CategoryBreakdown enhancement

---

**JAWABAN SINGKAT:**

**Q: Bagaimana sistem bekerja?**  
A: User set budget limit per kategori (misal Food Rp 500K). Sistem track total spending, hitung percentage (spent/limit), dan tentukan status (Safe/Warning/Danger/Exceeded) berdasarkan threshold.

**Q: Apa yang terjadi jika user set limit?**  
A: Data tersimpan di localStorage. Budget badge muncul di CategoryManager. TAPI status indicator belum muncul di CategoryBreakdown (future enhancement needed).

**Q: Apa yang terjadi di UI setelah over limit?**  
A: **Saat ini: NOTHING!** No alert, no indicator, no warning. User hanya bisa lihat di CategoryManager kalau ada budget limit. **Future plan:** Toast alert + red indicator + progress bar di CategoryBreakdown.
