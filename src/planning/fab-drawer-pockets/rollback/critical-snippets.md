# Critical Code Snippets for Rollback

Dokumen ini berisi code snippets penting yang perlu di-restore saat rollback.

## 📌 App.tsx - Critical Sections

### 1. State Declaration (around line 168-172)
```typescript
// Show/Hide Pockets state (persistent)
const [showPockets, setShowPockets] = useState(() => {
  const saved = localStorage.getItem('showPockets');
  return saved !== null ? JSON.parse(saved) : true;
});
```

### 2. Toggle Handler Function (around line 1562-1568)
```typescript
const handleTogglePockets = () => {
  setShowPockets(prev => {
    const newValue = !prev;
    localStorage.setItem('showPockets', JSON.stringify(newValue));
    return newValue;
  });
};
```

### 3. BudgetOverview Component Props (around line 1670-1676)
```tsx
<BudgetOverview
  totalIncome={totalIncome}
  totalExpenses={totalExpenses}
  remainingBudget={remainingBudget}
  showPockets={showPockets}
  onTogglePockets={handleTogglePockets}
/>
```

### 4. Conditional PocketsSummary Rendering (around line 1679-1693)
```tsx
{showPockets && (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
  >
    <PocketsSummary
      selectedMonth={selectedMonth}
      onOpenManagePockets={() => setShowManagePockets(true)}
      onOpenTransfer={() => setShowTransfer(true)}
      onOpenBudgetSettings={() => setShowBudgetSettings(true)}
    />
  </motion.div>
)}
```

---

## 📌 BudgetOverview.tsx - Complete File Content

### Imports
```typescript
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Wallet } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
```

### Props Interface
```typescript
interface BudgetOverviewProps {
  totalIncome: number;
  totalExpenses: number;
  remainingBudget: number;
  showPockets?: boolean;
  onTogglePockets?: () => void;
}
```

### Function Signature
```typescript
export function BudgetOverview({ 
  totalIncome, 
  totalExpenses, 
  remainingBudget, 
  showPockets = true, 
  onTogglePockets 
}: BudgetOverviewProps) {
```

### Critical JSX - CardHeader with Toggle Button
```tsx
<CardHeader className="pb-3">
  <div className="flex items-center justify-between">
    <CardTitle className="text-sm">Sisa Budget</CardTitle>
    <div className="flex items-center gap-1">
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className={`size-7 hover:bg-background/50 ${showPockets ? 'bg-background/30' : ''}`}
              onClick={() => onTogglePockets?.()}
            >
              <Wallet className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{showPockets ? 'Sembunyikan' : 'Tampilkan'} Ringkasan Kantong</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </div>
</CardHeader>
```

---

## 🔄 Quick Rollback Instructions

### Step 1: Restore App.tsx State
1. Find line ~168: `// Show/Hide Pockets state (persistent)`
2. Replace state declaration dengan snippet #1 di atas
3. Find line ~1562: `const handleTogglePockets`
4. Replace function dengan snippet #2 di atas

### Step 2: Restore App.tsx Props & Rendering
1. Find BudgetOverview component call (~line 1670)
2. Replace props dengan snippet #3 di atas
3. Find conditional rendering setelah BudgetOverview (~line 1679)
4. Replace dengan snippet #4 di atas

### Step 3: Restore BudgetOverview.tsx
1. Add imports dari snippet di atas (Wallet, Tooltip components)
2. Update props interface dengan snippet di atas
3. Update function signature dengan snippet di atas
4. Replace CardHeader content dengan snippet di atas

### Step 4: Delete New Files
```bash
rm /components/PocketsFAB.tsx
rm /components/PocketsDrawer.tsx
```

---

## 🎯 Key Points to Remember

1. **localStorage Key**: `'showPockets'` (jangan ubah, sudah dipakai user)
2. **Default Value**: `true` (pockets shown by default)
3. **Animation**: Uses `motion.div` from Motion/React
4. **Tooltip Delay**: 300ms untuk better UX
5. **Button Size**: `size-7` (28x28px) untuk compact appearance
6. **Active State**: `bg-background/30` when `showPockets === true`

---

## 📊 Before vs After

### Before FAB Implementation (Original - for rollback)
```
[Sisa Budget Card]
  Header: "Sisa Budget" + [Wallet Button] ← Toggle here
  Content: Amount + Status badge

[PocketsSummary Component] ← Conditional rendering based on showPockets
  - Shown/hidden based on button click
  - State persisted in localStorage
```

### After FAB Implementation (New)
```
[Sisa Budget Card]
  Header: "Sisa Budget" (no toggle button)
  Content: Amount + Status badge

(No inline PocketsSummary)

[FAB] ← Floating bottom-right
  - Always visible
  - Opens drawer on click

[Drawer] ← Slides up from bottom
  - Contains PocketsSummary
  - Backdrop overlay
  - Close on backdrop click / Esc
```

---

**Purpose**: Quick reference untuk rollback implementation  
**Status**: Ready for use  
**Last Updated**: 2025-01-05
