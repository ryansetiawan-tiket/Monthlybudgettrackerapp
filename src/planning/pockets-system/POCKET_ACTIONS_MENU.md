# Pocket Actions Menu - Planning

## 🎯 Goal
Replace Info (I) icon with 3-dots menu in pocket timeline view, allowing quick actions on pockets.

## 📍 Location
- **Component**: `/components/PocketDetailPage.tsx`
- **Current**: Info icon opens info dialog
- **New**: 3-dots opens dropdown menu with actions

## 🎨 UI Changes

### Icon Replacement
```
Before: <Info /> → Opens info dialog
After:  <MoreVertical /> → Opens dropdown menu
```

### Dropdown Menu Items
1. **📊 Info Kantong** → Show pocket info (current behavior)
2. **💰 Budget Awal** → Set initial budget (Sehari-hari only)
3. **✏️ Edit Kantong** → Edit name, emoji, color
4. **🗑️ Hapus Kantong** → Delete pocket (with confirmation)

## 🔧 Implementation

### 1. PocketDetailPage.tsx Updates
- Import `DropdownMenu` from shadcn
- Replace Info button with MoreVertical + DropdownMenu
- Add handlers:
  - `handleShowInfo()` - existing
  - `handleSetBudget()` - new
  - `handleEditPocket()` - new  
  - `handleDeletePocket()` - existing

### 2. Edit Pocket Drawer (NEW)
- Create `/components/EditPocketDrawer.tsx`
- Fields:
  - Emoji picker (with emoji-picker-react)
  - Name input
  - Color selector
  - Description textarea (optional)
- Behavior: Same UX as AddAdditionalIncomeDialog drawer
- Props: `pocket`, `onSave()`, `onClose()`

### 3. Budget Awal Dialog (NEW)
- Create `/components/SetPocketBudgetDialog.tsx`
- Simple dialog with:
  - Amount input (formatted currency)
  - Explanation text
  - Save/Cancel buttons
- Only shown for "Sehari-hari" pocket

### 4. Editable Primary Pockets
**Allow editing for:**
- ✅ Sehari-hari (name + emoji)
- ✅ Uang Dingin (name + emoji)

**Restrictions:**
- Cannot change `type: 'primary'`
- Cannot delete primary pockets
- Color remains fixed (for consistency)

## 🔄 Flow

### Edit Flow
```
Click 3-dots → "Edit Kantong" → Drawer opens
→ Change emoji/name → Save
→ Update pocket via API → Refresh
```

### Budget Flow (Sehari-hari only)
```
Click 3-dots → "Budget Awal" → Dialog opens
→ Enter amount → Save
→ Store in KV as `pocket_budget_${monthKey}_${pocketId}`
```

### Delete Flow
```
Click 3-dots → "Hapus Kantong" → ConfirmDialog
→ Confirm → Call onArchivePocket()
```

## 📦 Props to Pass

### PocketDetailPage needs:
```typescript
onEditPocket?: (pocketId: string, updates: PocketUpdates) => Promise<void>
onSetBudget?: (pocketId: string, amount: number) => Promise<void>
```

### From PocketsSummary to PocketDetailPage:
- Pass `onEditPocket` from App.tsx
- Pass `onSetBudget` (new handler in App.tsx)

## ✅ Checklist

- [ ] Replace Info icon with MoreVertical + DropdownMenu
- [ ] Create EditPocketDrawer component
- [ ] Create SetPocketBudgetDialog component
- [ ] Add conditional menu items (budget only for sehari-hari)
- [ ] Update API to allow primary pocket name/emoji edits
- [ ] Wire up props from App → PocketsSummary → PocketDetailPage
- [ ] Test edit flow with primary pockets
- [ ] Test budget setting
- [ ] Test delete with confirmation

## 🚨 Notes
- Primary pockets keep `type: 'primary'` (immutable)
- Budget awal is month-specific (stored per monthKey)
- Delete shows different message for primary vs custom pockets
- Edit drawer uses same styling as other drawers (consistent UX)
