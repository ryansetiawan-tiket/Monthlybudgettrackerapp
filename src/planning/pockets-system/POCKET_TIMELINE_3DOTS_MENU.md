# Pocket Timeline 3-Dots Menu Implementation

## 📅 Date: November 7, 2025
## 🔄 Last Updated: November 7, 2025 (Simplified)

## 🎯 Objective
Replace the Info button (ℹ️) in PocketTimeline with a 3-dots menu (⋮) that provides multiple actions.

## ✅ Implementation Complete

### 🔄 Simplification Update (November 7, 2025)
**Changes:**
- ❌ Removed "Budget Awal" option from PocketTimeline menu
- ❌ Removed entire 3-dots menu from PocketDetailPage (redundant)
**Details:** See `/planning/pockets-system/POCKET_TIMELINE_3DOTS_SIMPLIFICATION.md`

### ⚠️ Bug Fix Applied (Z-Index Issue)
**Issue:** 3-dots menu tidak muncul saat diklik  
**Fix:** Added `z-[102]` to DropdownMenuContent in PocketTimeline (parent drawer uses z-[101])  
**Details:** See `/planning/pockets-system/POCKET_TIMELINE_3DOTS_ZINDEX_FIX.md`

### 1. **PocketTimeline.tsx** - Updated Component

#### A. New Imports
```tsx
// Added icons
import { MoreVertical, Edit3, Trash2 } from "lucide-react";

// Added dropdown menu components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
```

#### B. New Props Interface
```tsx
interface PocketTimelineProps {
  // ... existing props
  onEditPocket?: () => void;
  onDeletePocket?: () => void;
  onSetBudget?: () => void;
}
```

#### C. Replaced Info Button with Dropdown Menu

**Mobile (Drawer) - Lines ~630-680:**
```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 rounded-full"
      onClick={(e) => e.stopPropagation()}
      title="Menu Kantong"
    >
      <MoreVertical className="size-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-48 z-[102]">
    <DropdownMenuItem onClick={...}>
      <Info className="size-4 mr-2" />
      Info Kantong
    </DropdownMenuItem>
    {pocketId === 'pocket_daily' && onSetBudget && (
      <DropdownMenuItem onClick={...}>
        <DollarSign className="size-4 mr-2" />
        Budget Awal
      </DropdownMenuItem>
    )}
    {onEditPocket && (
      <DropdownMenuItem onClick={...}>
        <Edit3 className="size-4 mr-2" />
        Edit Kantong
      </DropdownMenuItem>
    )}
    {pocketType === 'custom' && onDeletePocket && (
      <DropdownMenuItem onClick={...} className="text-red-600">
        <Trash2 className="size-4 mr-2" />
        Hapus Kantong
      </DropdownMenuItem>
    )}
  </DropdownMenuContent>
</DropdownMenu>
```

**Desktop (Dialog) - Similar structure at lines ~720-770**

### 2. **PocketsSummary.tsx** - Wire Up Props

Added handlers to PocketTimeline component:

```tsx
<PocketTimeline
  // ... existing props
  onEditPocket={() => {
    setShowTimeline(false);
    setPocketToEdit(timelinePocket);
    setShowEditPocket(true);
  }}
  onDeletePocket={() => {
    setShowTimeline(false);
    setPocketToDelete(timelinePocket);
    setShowDeleteConfirm(true);
  }}
  onSetBudget={() => {
    setShowTimeline(false);
    toast.info('Fitur Budget Awal sedang dalam pengembangan');
  }}
/>
```

## 🎨 Menu Items & Conditional Rendering

| Menu Item | Icon | Condition | Action |
|-----------|------|-----------|--------|
| **Info Kantong** | ℹ️ | Always shown | Opens pocket info view |
| **Budget Awal** | 💰 | Only for `pocket_daily` | Opens budget setting (placeholder) |
| **Edit Kantong** | ✏️ | Always shown | Opens EditPocketDrawer |
| **Hapus Kantong** | 🗑️ | Only for `type: 'custom'` | Opens delete confirmation |

## 🔄 User Flow

### From PocketTimeline:
1. User opens pocket timeline (card click)
2. User clicks 3-dots menu (⋮)
3. User selects action:
   - **Info** → Shows pocket info in same dialog/drawer
   - **Budget Awal** → Shows toast (feature WIP)
   - **Edit** → Closes timeline, opens EditPocketDrawer
   - **Delete** → Closes timeline, opens delete confirmation

### Consistency with PocketDetailPage:
- Both use same 3-dots menu pattern
- Both use same icons and menu items
- Both have conditional rendering for Budget (daily only) and Delete (custom only)

## 📱 Mobile & Desktop Behavior

### Mobile (Drawer)
- 3-dots button: `h-8 w-8 p-0 rounded-full`
- Menu aligns to right (`align="end"`)
- On action click:
  - Closes current drawer (`onOpenChange(false)`)
  - Opens target dialog/drawer

### Desktop (Dialog)
- Same 3-dots button style
- Menu aligns to right
- On action click:
  - Closes current dialog
  - Opens target dialog

## ✅ Testing Checklist

- [x] 3-dots menu appears in both mobile and desktop
- [x] Menu items show/hide based on conditions
- [x] Info action works (switches view mode)
- [x] Budget action shows toast (daily pocket only)
- [x] Edit action opens EditPocketDrawer
- [x] Delete action opens confirmation dialog
- [x] Timeline closes properly when opening other dialogs
- [x] Props are passed correctly from PocketsSummary

## 🔗 Related Files

- `/components/PocketTimeline.tsx` - Main component updated
- `/components/PocketsSummary.tsx` - Parent component wiring
- `/components/EditPocketDrawer.tsx` - Edit dialog (already exists)
- `/components/PocketDetailPage.tsx` - Reference implementation

## 📝 Notes

- Info button (ℹ️) completely replaced with 3-dots menu (⋮)
- Menu structure matches PocketDetailPage for consistency
- All existing EditPocketDrawer and delete confirmation dialogs reused
- Budget Awal feature is placeholder (toast message)
- Both mobile and desktop implementations are identical in functionality

## 🚀 Future Enhancements

1. Implement actual Budget Awal functionality
2. Add animation to menu opening
3. Add keyboard shortcuts for menu items
4. Consider adding "View Timeline" to other components

---

**Status:** ✅ **COMPLETE**  
**Impact:** Medium - Improves UX consistency across app  
**Breaking Changes:** None - Backwards compatible
