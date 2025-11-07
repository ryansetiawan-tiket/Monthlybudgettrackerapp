# Manage Pockets - List View as Default

**Date:** November 7, 2025  
**Status:** ✅ Complete

---

## Overview

Changed **ManagePocketsDialog** default mode from `'create'` to `'list'` for better UX. Users now see the overview of all pockets first before creating new ones.

---

## Changes Made

### Before ❌
```tsx
const [mode, setMode] = useState<'list' | 'create' | 'edit' | 'archive'>('create');

// When dialog opens without editPocket
setMode('create'); // Shows create form immediately
```

**User Experience:**
- Click gear button → **Create form** shows directly
- Can't see existing pockets overview
- Need to navigate back to see list

### After ✅
```tsx
const [mode, setMode] = useState<'list' | 'create' | 'edit' | 'archive'>('list');

// When dialog opens without editPocket
setMode('list'); // Shows list view first
```

**User Experience:**
- Click gear button → **List view** shows all pockets
- See overview of all pockets (primary + custom)
- Click "+ Buat Kantong Baru" to create

---

## Visual Flow

### Before
```
Click [⚙️] → Opens Dialog → CREATE FORM
                              ↓
                        (need to click back)
                              ↓
                          LIST VIEW
```

### After
```
Click [⚙️] → Opens Dialog → LIST VIEW ✨
                              ↓
                    (click "Buat Kantong Baru")
                              ↓
                          CREATE FORM
```

---

## List View Layout

```
┌─────────────────────────────────────────────┐
│ Kelola Kantong                              │
│ Buat kantong custom, atau archive kantong  │
│ yang tidak digunakan                        │
├─────────────────────────────────────────────┤
│                                             │
│ Kantong Utama                               │
│ ┌─────────────────────────────────────────┐ │
│ │ 💰 Sehari-hari    Rp 1.179.366         │ │
│ │                   Tidak dapat dihapus   │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ ❄️ Uang Dingin     Rp 14.581.435        │ │
│ │                   Tidak dapat dihapus   │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Kantong Custom    [+ Buat Kantong Baru]    │
│ ┌─────────────────────────────────────────┐ │
│ │ 🌾 Paylater       Rp 0      [✏️] [🗑️]  │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ 💰 Invest        Rp 100.000  [✏️] [🗑️] │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## Additional Changes

### Icon Update
Changed delete button icon from **Archive** to **Trash2** for better clarity:

```tsx
// Before
<Archive className="size-4" />

// After
<Trash2 className="size-4" />
```

This matches user expectation that clicking the button will delete/archive the pocket.

---

## Benefits

✅ **Better Overview**  
Users see all pockets at a glance before taking action

✅ **Intentional Creation**  
Creating new pocket requires explicit click on "+ Buat Kantong Baru"

✅ **Reduced Cognitive Load**  
List view is informational, create form requires focus

✅ **Matches User Mental Model**  
"Manage" implies viewing first, then taking action

✅ **Better Icon Semantics**  
Trash icon (🗑️) clearer than Archive icon for deletion

---

## Files Modified

### Updated
- `/components/ManagePocketsDialog.tsx`
  - Changed default mode: `'create'` → `'list'`
  - Changed useEffect mode: `'create'` → `'list'`
  - Changed delete icon: `<Archive>` → `<Trash2>`

---

## Testing Checklist

- [x] Click gear button opens list view
- [x] List view shows primary pockets
- [x] List view shows custom pockets
- [x] Click "+ Buat Kantong Baru" opens create form
- [x] Click edit (✏️) on custom pocket opens edit form
- [x] Click delete (🗑️) triggers archive confirmation
- [x] "Tidak dapat dihapus" shows on primary pockets
- [x] Balance displays correctly
- [x] Responsive (Dialog on desktop, Drawer on mobile)

---

## User Flow Diagram

```
                  ┌─────────────┐
                  │  Click ⚙️   │
                  └──────┬──────┘
                         │
                         ▼
                  ┌─────────────┐
                  │  LIST VIEW  │ ← DEFAULT
                  │             │
                  │ • Primary   │
                  │ • Custom    │
                  │ • Archived  │
                  └──────┬──────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    [+ Buat]         [✏️ Edit]      [🗑️ Delete]
         │               │               │
         ▼               ▼               ▼
  CREATE FORM      EDIT FORM      CONFIRM DIALOG
```

---

## Code Changes Detail

### 1. Default State
```diff
- const [mode, setMode] = useState<'list' | 'create' | 'edit' | 'archive'>('create');
+ const [mode, setMode] = useState<'list' | 'create' | 'edit' | 'archive'>('list');
```

### 2. Dialog Open Effect
```diff
  useEffect(() => {
    if (open && editPocket) {
      setMode('edit');
      ...
    } else if (open && !editPocket) {
-     setMode('create');
+     setMode('list');
      setEditingPocketId(null);
      ...
    }
  }, [open, editPocket]);
```

### 3. Icon Update
```diff
  <Button onClick={...}>
-   <Archive className="size-4" />
+   <Trash2 className="size-4" />
  </Button>
```

---

## Quick Reference

### How Users Access Different Modes

| Mode | How to Access |
|------|---------------|
| **List** | Click ⚙️ gear button (DEFAULT) |
| **Create** | From list → Click "+ Buat Kantong Baru" |
| **Edit** | From list → Click ✏️ on custom pocket |
| **Archive** | From list → Click 🗑️ on custom pocket |

---

## Conclusion

✅ **Update Complete!**

ManagePocketsDialog now opens in **list view** by default, providing better UX by showing an overview of all pockets before requiring users to take action. The Trash2 icon also provides clearer visual communication for the delete/archive action.

This change makes the "Manage Pockets" feature more intuitive and aligns with user expectations when clicking a "Settings" gear icon. 🎉
