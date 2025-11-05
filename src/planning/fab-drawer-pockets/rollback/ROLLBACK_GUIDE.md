# Rollback Guide - FAB + Drawer

## 📋 Overview

Dokumen ini berisi instruksi lengkap untuk rollback dari FAB + Drawer implementation ke sistem lama (toggle button di BudgetOverview).

## 🔙 Rollback Steps

### Quick Rollback (Manual)

Jika implementasi FAB + Drawer bermasalah dan perlu rollback segera:

1. **Restore App.tsx**
   - Copy content dari `/planning/fab-drawer-pockets/rollback/App.backup.txt`
   - Paste ke `/App.tsx`
   - Save file

2. **Restore BudgetOverview.tsx**
   - Copy content dari `/planning/fab-drawer-pockets/rollback/BudgetOverview.backup.txt`
   - Paste ke `/components/BudgetOverview.tsx`
   - Save file

3. **Delete New Components**
   - Delete `/components/PocketsFAB.tsx` (if exists)
   - Delete `/components/PocketsDrawer.tsx` (if exists)

4. **Verify**
   - Refresh browser
   - Check wallet toggle button appears in "Sisa Budget" card header
   - Click wallet button → PocketsSummary should show/hide
   - Check localStorage persistence works

---

## 📝 What Changed (for reference)

### App.tsx Changes

**REMOVED**:
```typescript
// State for FAB + Drawer
const [showPocketsDrawer, setShowPocketsDrawer] = useState(false);

const handleTogglePocketsDrawer = () => {
  setShowPocketsDrawer(!showPocketsDrawer);
};
```

**RESTORED**:
```typescript
// Show/Hide Pockets state (persistent)
const [showPockets, setShowPockets] = useState(() => {
  const saved = localStorage.getItem('showPockets');
  return saved !== null ? JSON.parse(saved) : true;
});

const handleTogglePockets = () => {
  setShowPockets(prev => {
    const newValue = !prev;
    localStorage.setItem('showPockets', JSON.stringify(newValue));
    return newValue;
  });
};
```

**REMOVED FROM JSX**:
```tsx
{/* FAB Component */}
<PocketsFAB onClick={handleTogglePocketsDrawer} />

{/* Drawer Component */}
<PocketsDrawer
  open={showPocketsDrawer}
  onOpenChange={setShowPocketsDrawer}
  selectedMonth={selectedMonth}
  onOpenManagePockets={() => setShowManagePockets(true)}
  onOpenTransfer={() => setShowTransfer(true)}
  onOpenBudgetSettings={() => setShowBudgetSettings(true)}
/>
```

**RESTORED TO JSX**:
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

**RESTORED IN BUDGETOVERVIEW PROPS**:
```tsx
<BudgetOverview
  totalIncome={totalIncome}
  totalExpenses={totalExpenses}
  remainingBudget={remainingBudget}
  showPockets={showPockets}  // ← RESTORED
  onTogglePockets={handleTogglePockets}  // ← RESTORED
/>
```

---

### BudgetOverview.tsx Changes

**REMOVED FROM PROPS**:
```typescript
// These props were removed for FAB implementation
showPockets?: boolean;
onTogglePockets?: () => void;
```

**RESTORED PROPS**:
```typescript
interface BudgetOverviewProps {
  totalIncome: number;
  totalExpenses: number;
  remainingBudget: number;
  showPockets?: boolean;  // ← RESTORED
  onTogglePockets?: () => void;  // ← RESTORED
}
```

**REMOVED FROM JSX**:
```tsx
// Wallet toggle button was removed from CardHeader
```

**RESTORED TO JSX** (in CardHeader):
```tsx
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
```

**RESTORED IMPORTS**:
```typescript
import { Wallet } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
```

---

## ✅ Verification Checklist

After rollback, verify these features work:

- [ ] Wallet button appears in "Sisa Budget" card header
- [ ] Clicking wallet button toggles PocketsSummary visibility
- [ ] PocketsSummary shows with animation when visible
- [ ] State persists in localStorage (refresh page, state should remain)
- [ ] Tooltip shows "Sembunyikan/Tampilkan Ringkasan Kantong"
- [ ] Button has active state (bg-background/30) when showPockets is true
- [ ] All existing functionality (Settings, Transfer, Manage Pockets) still works
- [ ] No console errors
- [ ] No TypeScript errors

---

## 🚨 Troubleshooting

### Issue: Wallet button not showing
**Solution**: Make sure imports for Wallet and Tooltip are present in BudgetOverview.tsx

### Issue: Toggle not working
**Solution**: Verify showPockets and onTogglePockets props are passed to BudgetOverview in App.tsx

### Issue: State not persisting
**Solution**: Check localStorage implementation in handleTogglePockets function

### Issue: Animation not smooth
**Solution**: Verify motion.div wrapper around PocketsSummary with AnimatePresence in App.tsx

---

## 📚 Related Files

Backup files location:
- `/planning/fab-drawer-pockets/rollback/App.backup.txt`
- `/planning/fab-drawer-pockets/rollback/BudgetOverview.backup.txt`

Original planning docs:
- `/planning/fab-drawer-pockets/README.md`
- `/planning/fab-drawer-pockets/implementation-steps.md`
- `/planning/fab-drawer-pockets/visual-design.md`

Original feature documentation:
- `/TOGGLE_POCKETS_FEATURE.md`
- `/TOGGLE_POCKETS_QUICK_REF.md`

---

**Status**: 🟢 Rollback Guide Ready  
**Last Updated**: 2025-01-05  
**Test Status**: Pre-implementation backup
