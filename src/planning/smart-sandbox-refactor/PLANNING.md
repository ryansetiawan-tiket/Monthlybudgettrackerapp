# 🔬 Smart Simulation Sandbox Refactor - Planning Document

**Created:** November 9, 2025  
**Status:** 🟡 Planning Complete - Ready for Phase 1 Execution  
**Complexity:** HIGH (ExpenseList.tsx ~2000+ lines, multiple hooks involved)

---

## 📋 Executive Summary

**Objective:** Replace the outdated "Exclude" [👁️] / "Lock" [🔒] feature with a modern, powerful "Smart Simulation Sandbox" that provides contextual what-if analysis for budget planning.

**Why This Refactor?**
- ❌ Old "Exclude" feature was janky and confusing
- ❌ Lock button placement was non-intuitive
- ❌ No persistence or simulation management
- ✅ New Sandbox is contextual, powerful, and user-friendly
- ✅ Supports save/load simulation scenarios
- ✅ Better mobile/desktop UX

---

## 🎯 Two-Phase Approach

### **Phase 1:** Complete Removal of Old "Exclude" System (Cleanup)
### **Phase 2:** Build New "Smart Simulation Sandbox" (Implementation)

---

# 📦 PHASE 1: Pencabutan Total Fitur "Exclude" Lama

**Goal:** Clean codebase completely from all exclude/lock related code before building new system.

## 🔧 Step 1.1: Pembersihan UI (UI Cleanup)

**Target Files:**
- `/components/ExpenseList.tsx`

**Actions:**

### 1.1.1 Remove Eye Icon [👁️] from Expense Rows
**Location:** ExpenseList.tsx - `renderExpenseItem()` function

**What to Remove:**
```typescript
// Find and remove eye icon button in each expense row
<button onClick={() => handleToggleExclude(expense.id)}>
  {excludedIds.has(expense.id) ? '👁️' : '👁️‍🗨️'}
</button>
```

**Visual Impact:**
- BEFORE: `[💰 Expense Item] [👁️] [✏️] [🗑️]`
- AFTER: `[💰 Expense Item] [✏️] [🗑️]`

### 1.1.2 Remove Lock Button [🔒] from "Daftar Transaksi" Header
**Location:** ExpenseList.tsx - Header section (Desktop & Mobile)

**What to Remove:**
- Desktop: Lock button in transaction list header
- Mobile: Lock button in mobile header

**Desktop Header Structure:**
```
BEFORE:
[📋 Daftar Transaksi] ... [🔍 Search] [🔒 Lock] [Sort Dropdown]

AFTER:
[📋 Daftar Transaksi] ... [🔍 Search] [Sort Dropdown]
```

**Mobile Header Structure:**
```
BEFORE:
[Daftar Transaksi]
[🔍 Search Bar]
[🔒 Lock Button] [Sort Button]

AFTER:
[Daftar Transaksi]
[🔍 Search Bar]
[Sort Button]
```

### 1.1.3 Files to Check for UI Elements
- [x] ExpenseList.tsx (main component)
- [ ] Any custom ExpenseList styles in globals.css (if any)

---

## 🧹 Step 1.2: Pembersihan Kode (Code Cleanup)

**Target Files:**
- `/hooks/useExcludeState.ts` (⚠️ ENTIRE FILE REMOVAL)
- `/components/ExpenseList.tsx` (state & logic cleanup)
- Any other components importing/using exclude logic

**Actions:**

### 1.2.1 Remove useExcludeState Hook (ENTIRE FILE)
**File:** `/hooks/useExcludeState.ts`

**Action:** DELETE entire file

**Why:** This hook is dedicated solely to exclude functionality and will be completely replaced by Sandbox logic.

### 1.2.2 Clean ExpenseList.tsx State & Logic

**Remove the following from ExpenseList.tsx:**

#### A. State Variables
```typescript
// Remove these state declarations
const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());
const [isLocked, setIsLocked] = useState(false);
// Any other exclude-related state
```

#### B. Import Statements
```typescript
// Remove this import
import { useExcludeState } from '../hooks/useExcludeState';
```

#### C. Handler Functions
```typescript
// Remove these functions
const handleToggleExclude = (id: string) => { ... };
const handleLockState = () => { ... };
const handleClearExcludes = () => { ... };
// Any other exclude-related handlers
```

#### D. Calculations & Effects
```typescript
// Remove exclude filtering logic in useMemo/useEffect
// Example:
const filteredExpenses = useMemo(() => {
  return expenses.filter(e => !excludedIds.has(e.id)); // ❌ Remove this
}, [expenses, excludedIds]);
```

#### E. Props & Type Definitions
```typescript
// Remove from type definitions
type ExpenseListProps = {
  // ... other props
  excludedIds?: Set<string>; // ❌ Remove
  onToggleExclude?: (id: string) => void; // ❌ Remove
}
```

### 1.2.3 Verify No Remaining References

**Search entire codebase for:**
- ✅ `excludedIds`
- ✅ `excludedExpenseIds`
- ✅ `isLocked`
- ✅ `lockState`
- ✅ `handleToggleExclude`
- ✅ `useExcludeState`
- ✅ `exclude` (in context of expenses)
- ✅ `👁️` (eye emoji)
- ✅ `🔒` (lock emoji)

**Tools:** Use file_search to verify all references are removed.

---

# 🚀 PHASE 2: Implementasi "Smart Simulation Sandbox" Baru

**Goal:** Build a modern, powerful simulation system with persistence and context-awareness.

---

## 🎬 Step 2.1: Entry Point (New Simulation Button)

**Goal:** Add single, intuitive entry point to simulation mode

### 2.1.1 Desktop Header Button
**Location:** ExpenseList.tsx - Desktop header section

**Implementation:**
```tsx
// Add to header (where Lock button was)
<Button 
  variant="outline" 
  onClick={() => setShowSandbox(true)}
  className="..."
>
  🔬 Simulasi
</Button>
```

**Position:**
```
[📋 Daftar Transaksi] ... [🔍 Search] [🔬 Simulasi] [Sort Dropdown]
```

### 2.1.2 Mobile Header Button
**Location:** ExpenseList.tsx - Mobile header section

**Implementation:**
```tsx
// Add to mobile header
<Button 
  variant="outline" 
  onClick={() => setShowSandbox(true)}
  className="w-full ..."
>
  🔬 Simulasi Budget
</Button>
```

**Position:**
```
[Daftar Transaksi]
[🔍 Search Bar]
[🔬 Simulasi Budget]
[Sort Button]
```

### 2.1.3 State Management
```typescript
// Add to ExpenseList.tsx
const [showSandbox, setShowSandbox] = useState(false);
const [sandboxContext, setSandboxContext] = useState<'expenses' | 'income'>('expenses');
```

---

## 🏗️ Step 2.2: Struktur Sandbox Component

**Goal:** Create new SimulationSandbox component with proper structure

### 2.2.1 Create New Component File
**File:** `/components/SimulationSandbox.tsx`

**Component Props:**
```typescript
interface SimulationSandboxProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  incomes: AdditionalIncome[];
  initialTab: 'expenses' | 'income'; // Contextual default
  onApply?: (sandboxState: SandboxState) => void;
}
```

### 2.2.2 Header Structure (Sticky)

**Desktop & Mobile - Same Structure:**

```tsx
<div className="sticky top-0 bg-background z-10 border-b pb-4">
  {/* Title Row */}
  <div className="flex items-center justify-between mb-4">
    <h2>🔬 Simulation Sandbox</h2>
    <Button variant="ghost" onClick={onClose}>✕</Button>
  </div>

  {/* Real-Time Metrics - 3 Cards */}
  <div className="grid grid-cols-3 gap-2">
    <Card>
      <CardContent className="p-3">
        <div className="text-xs text-muted-foreground">Total Pemasukan</div>
        <div className="text-lg font-semibold text-green-600">
          {formatCurrency(totalIncomeSimulation)}
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent className="p-3">
        <div className="text-xs text-muted-foreground">Total Pengeluaran</div>
        <div className="text-lg font-semibold text-red-600">
          {formatCurrency(totalExpenseSimulation)}
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent className="p-3">
        <div className="text-xs text-muted-foreground">Sisa Budget</div>
        <div className={`text-lg font-semibold ${netAmount >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
          {formatCurrency(netAmount)}
        </div>
      </CardContent>
    </Card>
  </div>

  {/* Tab Filter */}
  <Tabs defaultValue={initialTab} className="mt-4">
    <TabsList className="w-full">
      <TabsTrigger value="all">Semua</TabsTrigger>
      <TabsTrigger value="expenses">Pengeluaran</TabsTrigger>
      <TabsTrigger value="income">Pemasukan</TabsTrigger>
    </TabsList>
  </Tabs>
</div>
```

### 2.2.3 Body Structure (Scrollable List)

```tsx
<ScrollArea className="flex-1">
  {/* Checkbox List of Transactions */}
  {filteredTransactions.map(transaction => (
    <div key={transaction.id} className="flex items-center gap-3 p-3 border-b">
      <Checkbox 
        checked={includedIds.has(transaction.id)}
        onCheckedChange={() => handleToggleTransaction(transaction.id)}
      />
      <div className="flex-1">
        <div className="font-medium">{transaction.description}</div>
        <div className="text-sm text-muted-foreground">
          {formatDate(transaction.date)}
        </div>
      </div>
      <div className={`font-semibold ${transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
        {formatCurrency(transaction.amount)}
      </div>
    </div>
  ))}
</ScrollArea>
```

### 2.2.4 Footer Actions

```tsx
<div className="border-t pt-4 flex gap-2">
  <Button variant="outline" onClick={handleSaveSimulation}>
    💾 Simpan Simulasi
  </Button>
  <Button variant="outline" onClick={handleLoadSimulation}>
    📂 Muat Simulasi
  </Button>
  <div className="flex-1" />
  <Button variant="outline" onClick={onClose}>
    Batal
  </Button>
  <Button onClick={handleApply}>
    ✓ Terapkan
  </Button>
</div>
```

---

## 📱 Step 2.3: Adaptasi Platform (Desktop vs Mobile)

**Goal:** Different layout strategies for different screen sizes

### 2.3.1 Desktop Layout
**Component:** Use `<Dialog>` from shadcn/ui

```tsx
// Desktop: Modal Dialog (max-w-4xl)
<Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
    <SimulationSandboxContent {...props} />
  </DialogContent>
</Dialog>
```

**Features:**
- ✅ Modal overlay
- ✅ Max width 4xl (896px)
- ✅ Max height 80vh
- ✅ Centered on screen
- ✅ Sticky header inside modal

### 2.3.2 Mobile Layout
**Component:** Use `<Drawer>` from shadcn/ui

```tsx
// Mobile: Full-Screen Drawer
<Drawer open={isOpen} onOpenChange={onClose}>
  <DrawerContent className="h-[95vh] flex flex-col">
    <SimulationSandboxContent {...props} />
  </DrawerContent>
</Drawer>
```

**Features:**
- ✅ Full-screen drawer (95vh)
- ✅ Slide up from bottom
- ✅ Sticky header at top
- ✅ Scrollable body
- ✅ Back button support (via useMobileBackButton)

### 2.3.3 Conditional Rendering

```tsx
// In ExpenseList.tsx
import { useMediaQuery } from '../hooks/useMediaQuery';

const isMobile = useMediaQuery('(max-width: 768px)');

{isMobile ? (
  <SimulationSandboxDrawer {...sandboxProps} />
) : (
  <SimulationSandboxDialog {...sandboxProps} />
)}
```

---

## 🧠 Step 2.4: Logika Kontekstual "Cerdas"

**Goal:** Open sandbox with smart defaults based on user context

### 2.4.1 Context Detection

**Rules:**
1. If user is on "Pengeluaran" tab → Open sandbox with "Pengeluaran" tab active
2. If user is on "Pemasukan" tab → Open sandbox with "Pemasukan" tab active
3. If user is on "Semua" tab → Open sandbox with "Semua" tab active

### 2.4.2 Implementation

```typescript
// In ExpenseList.tsx
const [currentMainTab, setCurrentMainTab] = useState<'all' | 'expenses' | 'income'>('all');

const handleOpenSandbox = () => {
  setSandboxContext(currentMainTab); // Pass current context
  setShowSandbox(true);
};
```

### 2.4.3 Sandbox Tab Initialization

```tsx
// In SimulationSandbox.tsx
<Tabs defaultValue={initialTab} onValueChange={setActiveTab}>
  <TabsList className="w-full">
    <TabsTrigger value="all">Semua</TabsTrigger>
    <TabsTrigger value="expenses">Pengeluaran</TabsTrigger>
    <TabsTrigger value="income">Pemasukan</TabsTrigger>
  </TabsList>

  <TabsContent value="all">
    {/* Show both expenses and income */}
  </TabsContent>

  <TabsContent value="expenses">
    {/* Show only expenses */}
  </TabsContent>

  <TabsContent value="income">
    {/* Show only income */}
  </TabsContent>
</Tabs>
```

---

## 💾 Step 2.5: Logika Persistence (Auto-Save & Load)

**Goal:** Allow users to save and load simulation scenarios

### 2.5.1 Sandbox State Structure

```typescript
interface SandboxState {
  id: string; // UUID
  name: string; // User-provided name
  createdAt: string;
  includedExpenseIds: string[];
  includedIncomeIds: string[];
  metadata: {
    totalIncome: number;
    totalExpense: number;
    netAmount: number;
  };
}
```

### 2.5.2 Auto-Save Feature

**Implementation:**
```typescript
// Auto-save every 5 seconds when user makes changes
useEffect(() => {
  const timer = setTimeout(() => {
    if (hasChanges) {
      saveToLocalStorage('sandbox_autosave', currentSandboxState);
    }
  }, 5000);

  return () => clearTimeout(timer);
}, [currentSandboxState, hasChanges]);
```

**Storage:** Use localStorage for quick access

```typescript
const STORAGE_KEY = 'budget_sandbox_simulations';

const saveSimulation = (state: SandboxState) => {
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  existing.push(state);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
};

const loadSimulations = (): SandboxState[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
};
```

### 2.5.3 Save Dialog

```tsx
const [showSaveDialog, setShowSaveDialog] = useState(false);

// Save Dialog
<Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>💾 Simpan Simulasi</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <Input 
        placeholder="Nama simulasi (contoh: Simulasi Hemat Nov 2025)"
        value={simulationName}
        onChange={(e) => setSimulationName(e.target.value)}
      />
      <div className="text-sm text-muted-foreground">
        Metadata:
        <ul className="mt-2 space-y-1">
          <li>• Total Pemasukan: {formatCurrency(totalIncome)}</li>
          <li>• Total Pengeluaran: {formatCurrency(totalExpense)}</li>
          <li>• Sisa: {formatCurrency(netAmount)}</li>
        </ul>
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
        Batal
      </Button>
      <Button onClick={handleConfirmSave}>
        💾 Simpan
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 2.5.4 Load Dialog (Simulation List)

```tsx
// Load Dialog
<Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>📂 Muat Simulasi</DialogTitle>
    </DialogHeader>
    <ScrollArea className="max-h-[400px]">
      {savedSimulations.map(sim => (
        <Card key={sim.id} className="mb-2 cursor-pointer hover:bg-accent" onClick={() => handleLoadSimulation(sim)}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium">{sim.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {formatDate(sim.createdAt)}
                </p>
                <div className="mt-2 text-sm">
                  <span className="text-green-600">+{formatCurrency(sim.metadata.totalIncome)}</span>
                  {' | '}
                  <span className="text-red-600">-{formatCurrency(sim.metadata.totalExpense)}</span>
                  {' | '}
                  <span className="font-semibold">Sisa: {formatCurrency(sim.metadata.netAmount)}</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSimulation(sim.id);
                }}
              >
                🗑️
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </ScrollArea>
  </DialogContent>
</Dialog>
```

### 2.5.5 Restore Auto-Save on Open

```typescript
// In SimulationSandbox.tsx - useEffect on mount
useEffect(() => {
  const autoSave = localStorage.getItem('sandbox_autosave');
  if (autoSave) {
    const state = JSON.parse(autoSave);
    // Show toast: "Simulasi terakhir dipulihkan"
    toast.info('📋 Simulasi terakhir dipulihkan');
    restoreState(state);
  }
}, []);
```

---

## 🎨 Design Considerations

### Color Coding
- 🟢 **Income:** Green (#10b981)
- 🔴 **Expense:** Red (#ef4444)
- 🔵 **Net Positive:** Blue (#3b82f6)
- 🟠 **Net Negative:** Orange (#f97316)

### Typography
- **Metrics:** Large, bold numbers
- **Labels:** Small, muted text
- **Transaction Names:** Medium weight
- **Dates:** Small, muted

### Spacing
- Header: Sticky with shadow on scroll
- Cards: Minimal padding (p-3)
- Gap between metrics: gap-2
- List items: p-3 with border-b

---

## 📋 Implementation Checklist

### Phase 1: Cleanup
- [ ] 1.1.1 - Remove eye icon from expense rows
- [ ] 1.1.2 - Remove lock button from desktop header
- [ ] 1.1.3 - Remove lock button from mobile header
- [ ] 1.2.1 - Delete `/hooks/useExcludeState.ts`
- [ ] 1.2.2 - Clean ExpenseList.tsx state/logic
- [ ] 1.2.3 - Verify no remaining references (file_search)

### Phase 2: Implementation
- [ ] 2.1.1 - Add desktop simulation button
- [ ] 2.1.2 - Add mobile simulation button
- [ ] 2.1.3 - Add state management
- [ ] 2.2.1 - Create SimulationSandbox.tsx component
- [ ] 2.2.2 - Build sticky header with metrics
- [ ] 2.2.3 - Build scrollable transaction list
- [ ] 2.2.4 - Build footer actions
- [ ] 2.3.1 - Implement desktop dialog layout
- [ ] 2.3.2 - Implement mobile drawer layout
- [ ] 2.3.3 - Add conditional rendering
- [ ] 2.4.1 - Implement context detection
- [ ] 2.4.2 - Pass context to sandbox
- [ ] 2.4.3 - Initialize correct tab
- [ ] 2.5.1 - Define sandbox state structure
- [ ] 2.5.2 - Implement auto-save
- [ ] 2.5.3 - Create save dialog
- [ ] 2.5.4 - Create load dialog
- [ ] 2.5.5 - Implement auto-restore

---

## 🧪 Testing Strategy

### Phase 1 Testing
1. ✅ Verify eye icons removed from all expense rows
2. ✅ Verify lock button removed from headers
3. ✅ Verify no console errors
4. ✅ Verify calculations work without exclude logic
5. ✅ Use file_search to confirm no "exclude" references remain

### Phase 2 Testing
1. ✅ Desktop: Simulation button opens modal
2. ✅ Mobile: Simulation button opens drawer
3. ✅ Header stays sticky on scroll
4. ✅ Real-time metrics update on checkbox toggle
5. ✅ Tabs switch correctly
6. ✅ Context-aware tab initialization works
7. ✅ Save simulation to localStorage
8. ✅ Load simulation from localStorage
9. ✅ Auto-save triggers after 5 seconds
10. ✅ Auto-restore works on reopen
11. ✅ Delete simulation works
12. ✅ Back button closes mobile drawer

---

## 🚨 Risk Assessment

### High Risk Areas
1. **ExpenseList.tsx Complexity** (~2000+ lines)
   - Mitigation: Incremental changes, test after each step
   
2. **State Management Conflicts**
   - Mitigation: Clear separation between main state and sandbox state

3. **Mobile Drawer Back Button**
   - Mitigation: Use existing `useMobileBackButton` hook pattern

4. **Performance on Large Lists**
   - Mitigation: Use React.memo, virtualization if needed

### Medium Risk Areas
1. **localStorage Limits**
   - Mitigation: Limit saved simulations to 10, show warning

2. **Tab Synchronization**
   - Mitigation: Clear state management with context API

---

## 📚 References

### Existing Patterns to Follow
- ✅ `WishlistSimulation.tsx` - Similar modal/drawer pattern
- ✅ `CategoryManager.tsx` - CRUD operations pattern
- ✅ `useMobileBackButton.ts` - Back button handling
- ✅ `ConfirmDialog.tsx` - In-app dialog pattern (no window.confirm)

### Shadcn Components to Use
- ✅ `Dialog` - Desktop modal
- ✅ `Drawer` - Mobile drawer
- ✅ `Tabs` - Tab navigation
- ✅ `Checkbox` - Transaction selection
- ✅ `Card` - Metric display
- ✅ `ScrollArea` - Scrollable list
- ✅ `Button` - Actions
- ✅ `Input` - Simulation name

---

## 🎯 Success Criteria

### Phase 1 Complete When:
- ✅ No visual trace of eye icon or lock button
- ✅ No "exclude" references in codebase
- ✅ ExpenseList.tsx compiles without errors
- ✅ All calculations work correctly

### Phase 2 Complete When:
- ✅ Simulation button accessible on Desktop & Mobile
- ✅ Modal opens with correct context-aware tab
- ✅ Real-time metrics update correctly
- ✅ Save/Load functionality works
- ✅ Auto-save triggers correctly
- ✅ Mobile back button closes drawer
- ✅ No console errors or warnings

---

## 📝 Notes for AI Agent

1. **DO NOT RUSH:** ExpenseList.tsx is complex, take it step by step
2. **USE file_search:** Verify all exclude references before proceeding to Phase 2
3. **TEST INCREMENTALLY:** Don't make all changes at once
4. **FOLLOW EXISTING PATTERNS:** Look at WishlistSimulation.tsx for reference
5. **MOBILE BACK BUTTON:** Must use `useMobileBackButton` for drawer
6. **NO window.confirm:** Use ConfirmDialog component
7. **BACKWARD COMPATIBILITY:** This doesn't affect data schema, so no compat concerns

---

## 🎬 Ready to Execute

**Status:** 🟢 Planning Complete  
**Next Step:** Phase 1, Step 1.1 (UI Cleanup)  
**Expected Duration:** 
- Phase 1: ~30 minutes
- Phase 2: ~2-3 hours

**Waiting for:** User confirmation to proceed with Phase 1, Step 1.1

---

**Document Version:** 1.0  
**Last Updated:** November 9, 2025  
**Author:** AI Code Agent
