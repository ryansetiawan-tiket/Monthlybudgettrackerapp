# Implementation Steps - FAB + Drawer

## 📋 Step-by-Step Guide

### Step 1: Backup Current Files ✅

**Action**: Create rollback copies
```bash
# Files to backup:
- /App.tsx
- /components/BudgetOverview.tsx
```

**Backup location**: `/planning/fab-drawer-pockets/rollback/`

---

### Step 2: Create PocketsFAB Component

**File**: `/components/PocketsFAB.tsx`

**Component Requirements**:
- Fixed position bottom-right
- Wallet icon from lucide-react
- Smooth hover/click animations
- ARIA labels for accessibility
- Responsive sizing (desktop vs mobile)

**Props Interface**:
```typescript
interface PocketsFABProps {
  onClick: () => void;
}
```

**Key Features**:
- Shadow elevation for depth
- Scale animation on hover/click
- Primary color background
- Z-index: 50
- Position: `fixed bottom-6 right-6` (desktop), `bottom-4 right-4` (mobile)

---

### Step 3: Create PocketsDrawer Component

**File**: `/components/PocketsDrawer.tsx`

**Component Requirements**:
- Use ShadCN Drawer component from `/components/ui/drawer.tsx`
- Wrapper untuk PocketsSummary
- Drawer direction: bottom-to-top
- Backdrop with blur effect
- Close button in header

**Props Interface**:
```typescript
interface PocketsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Props untuk PocketsSummary
  selectedMonth: string;
  onOpenManagePockets?: () => void;
  onOpenTransfer?: () => void;
  onOpenBudgetSettings?: () => void;
}
```

**Content Structure**:
```tsx
<Drawer open={open} onOpenChange={onOpenChange}>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Ringkasan Kantong</DrawerTitle>
      <DrawerClose />
    </DrawerHeader>
    <DrawerDescription className="sr-only">
      Lihat ringkasan semua kantong budget Anda
    </DrawerDescription>
    
    <div className="px-4 pb-4 max-h-[80vh] overflow-y-auto">
      <PocketsSummary 
        selectedMonth={selectedMonth}
        onOpenManagePockets={onOpenManagePockets}
        onOpenTransfer={onOpenTransfer}
        onOpenBudgetSettings={onOpenBudgetSettings}
      />
    </div>
  </DrawerContent>
</Drawer>
```

---

### Step 4: Update App.tsx

**Changes Required**:

#### 4.1. Remove Old State & Functions
```typescript
// ❌ REMOVE:
const [showPockets, setShowPockets] = useState(true);

const handleTogglePockets = () => {
  setShowPockets(!showPockets);
};
```

#### 4.2. Add New State & Functions
```typescript
// ✅ ADD:
const [showPocketsDrawer, setShowPocketsDrawer] = useState(false);

const handleTogglePocketsDrawer = () => {
  setShowPocketsDrawer(!showPocketsDrawer);
};
```

#### 4.3. Update BudgetOverview Props
```typescript
// ❌ REMOVE from BudgetOverview:
showPockets={showPockets}
onTogglePockets={handleTogglePockets}

// ✅ Keep only necessary props:
// (no changes needed, just remove the two above)
```

#### 4.4. Remove Conditional PocketsSummary Rendering
```typescript
// ❌ REMOVE this block:
{showPockets && (
  <PocketsSummary
    selectedMonth={selectedMonth}
    onOpenManagePockets={() => setShowManagePockets(true)}
    onOpenTransfer={() => setShowTransfer(true)}
    onOpenBudgetSettings={() => setShowBudgetSettings(true)}
  />
)}
```

#### 4.5. Add FAB Component
```tsx
// ✅ ADD before closing </div> of main container:
<PocketsFAB onClick={handleTogglePocketsDrawer} />
```

#### 4.6. Add PocketsDrawer Component
```tsx
// ✅ ADD after all other dialogs (after WishlistDialog):
<PocketsDrawer
  open={showPocketsDrawer}
  onOpenChange={setShowPocketsDrawer}
  selectedMonth={selectedMonth}
  onOpenManagePockets={() => setShowManagePockets(true)}
  onOpenTransfer={() => setShowTransfer(true)}
  onOpenBudgetSettings={() => setShowBudgetSettings(true)}
/>
```

---

### Step 5: Update BudgetOverview.tsx

**Changes Required**:

#### 5.1. Remove Props Interface
```typescript
// ❌ REMOVE from interface:
showPockets?: boolean;
onTogglePockets?: () => void;
```

#### 5.2. Remove Destructuring
```typescript
// ❌ REMOVE from function params:
showPockets,
onTogglePockets,
```

#### 5.3. Remove Wallet Toggle Button
```tsx
// ❌ REMOVE this entire button block:
<TooltipProvider>
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
```

#### 5.4. Remove Tooltip Import (if not used elsewhere)
```typescript
// ❌ REMOVE if not used:
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
```

#### 5.5. Remove Wallet Icon Import (if not used elsewhere)
```typescript
// ❌ REMOVE if not used:
import { Wallet } from "lucide-react";
```

---

### Step 6: Testing

**Follow testing checklist from README.md**:
- Desktop functionality
- Mobile responsiveness
- Accessibility
- Edge cases
- Animation smoothness

---

### Step 7: Documentation Update

**Files to update after successful implementation**:

1. Create `/planning/fab-drawer-pockets/IMPLEMENTATION_COMPLETE.md`
2. Update `/TOGGLE_POCKETS_QUICK_REF.md` (mark as deprecated, point to new system)
3. Create `/FAB_DRAWER_QUICK_REF.md` with new usage guide

---

## 🔙 Rollback Instructions

**If something goes wrong**:

1. **Restore from backup**:
   ```
   Copy /planning/fab-drawer-pockets/rollback/App.tsx.backup → /App.tsx
   Copy /planning/fab-drawer-pockets/rollback/BudgetOverview.tsx.backup → /components/BudgetOverview.tsx
   ```

2. **Delete new files**:
   ```
   Delete /components/PocketsFAB.tsx
   Delete /components/PocketsDrawer.tsx
   ```

3. **Verify rollback**:
   - Check wallet button appears in BudgetOverview
   - Check toggle functionality works
   - Check PocketsSummary shows/hides correctly

---

## ⚠️ Important Notes

### Before Starting:
- [ ] Read README.md completely
- [ ] Understand current toggle mechanism
- [ ] Backup files created
- [ ] Test environment ready

### During Implementation:
- [ ] Test after each step
- [ ] Don't modify PocketsSummary.tsx (pure display component)
- [ ] Keep all existing props for PocketsSummary
- [ ] Maintain all existing functionality (manage, transfer, settings)

### After Implementation:
- [ ] Run full testing checklist
- [ ] Document any issues encountered
- [ ] Update CHANGELOG if needed
- [ ] Create quick reference doc

---

## 📊 Implementation Progress Tracker

- [ ] Step 1: Backup files created
- [ ] Step 2: PocketsFAB.tsx created & tested
- [ ] Step 3: PocketsDrawer.tsx created & tested
- [ ] Step 4: App.tsx updated
- [ ] Step 5: BudgetOverview.tsx updated
- [ ] Step 6: Full testing completed
- [ ] Step 7: Documentation updated

**Status**: 🟡 Ready to Start  
**Estimated Time**: 30-45 minutes
