# Pocket Actions Menu - Quick Reference

## 🎯 Summary
Replace Info icon with 3-dots menu → Info, Budget, Edit, Delete actions

## 📂 Files to Create
1. `/components/EditPocketDrawer.tsx` - Edit name/emoji/color
2. `/components/SetPocketBudgetDialog.tsx` - Set budget awal (optional)

## 📝 Files to Modify
1. `/components/PocketDetailPage.tsx` - Add dropdown menu
2. `/components/PocketsSummary.tsx` - Pass new props
3. `/App.tsx` - Add handlers
4. `/supabase/functions/server/index.tsx` - Allow primary edits

## 🔑 Key Actions

### Dropdown Items
```
📊 Info Kantong        → All pockets
💰 Budget Awal         → Sehari-hari only  
✏️ Edit Kantong        → All pockets (name+emoji for primary)
🗑️ Hapus Kantong       → Custom only (hide for primary)
```

### Edit Primary Pockets
```typescript
// Allow editing:
- name ✅
- emoji/icon ✅
- description ✅

// Restrictions:
- type: 'primary' (immutable)
- Cannot delete
- Color optional (can keep fixed)
```

## 🚀 Implementation Order
1. Create EditPocketDrawer (similar to AddIncomeDialog)
2. Update PocketDetailPage (replace icon + add dropdown)
3. Wire props: App → PocketsSummary → PocketDetailPage
4. Update backend to allow primary pocket edits
5. (Optional) Add SetPocketBudgetDialog for budget feature

## 🎨 UX Notes
- Drawer style matches AddAdditionalIncomeDialog
- Emoji picker uses emoji-picker-react
- Delete uses ConfirmDialog (no browser confirm)
- Budget stored as: `pocket_budget_${monthKey}_${pocketId}`

## ✅ Quick Test
1. Click 3-dots on any pocket timeline
2. Edit "Sehari-hari" name/emoji → Save → Verify update
3. Set budget on "Sehari-hari" → Verify storage
4. Delete custom pocket → Verify archive
5. Try edit on "Uang Dingin" → Verify works
