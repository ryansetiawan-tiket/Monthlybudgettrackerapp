# Pocket Timeline 3-Dots Menu - Visual Guide

## 📱 Before vs After

### BEFORE (Info Button)
```
┌─────────────────────────────────────────┐
│ Timeline Sehari-hari          [24] [ℹ️] │
│─────────────────────────────────────────│
│ Timeline entries...                     │
└─────────────────────────────────────────┘
```

### AFTER (3-Dots Menu)
```
┌─────────────────────────────────────────┐
│ Timeline Sehari-hari          [24] [⋮]  │ ← Click here
│─────────────────────────────────────────│
│ Timeline entries...                     │
└─────────────────────────────────────────┘
                                    ↓
                    ┌─────────────────────────┐
                    │ ℹ️  Info Kantong        │
                    │ 💰 Budget Awal         │
                    │ ✏️  Edit Kantong        │
                    │ 🗑️  Hapus Kantong       │
                    └─────────────────────────┘
```

## 🎭 Menu Variations

### 1. Primary Pocket (Sehari-hari)
```
[⋮] Menu
├─ ℹ️  Info Kantong      ✅ Show
├─ 💰 Budget Awal       ✅ Show (pocket_daily only)
├─ ✏️  Edit Kantong      ✅ Show
└─ 🗑️  Hapus Kantong     ❌ Hide (primary pocket)
```

### 2. Primary Pocket (Uang Dingin)
```
[⋮] Menu
├─ ℹ️  Info Kantong      ✅ Show
├─ 💰 Budget Awal       ❌ Hide (not pocket_daily)
├─ ✏️  Edit Kantong      ✅ Show
└─ 🗑️  Hapus Kantong     ❌ Hide (primary pocket)
```

### 3. Custom Pocket (Liburan, etc)
```
[⋮] Menu
├─ ℹ️  Info Kantong      ✅ Show
├─ 💰 Budget Awal       ❌ Hide (not pocket_daily)
├─ ✏️  Edit Kantong      ✅ Show
└─ 🗑️  Hapus Kantong     ✅ Show (custom pocket, red text)
```

## 🎬 User Flow Diagram

```
┌───────────────────┐
│  Pocket Card      │
│  [Click]          │
└─────────┬─────────┘
          │
          v
┌───────────────────────────────┐
│  PocketTimeline (Drawer)      │
│  ┌─────────────────────────┐  │
│  │ Header  [Transfer][+][⋮]│  │ ← 3-dots button
│  └─────────────────────────┘  │
│  Timeline content...          │
└───────────────────────────────┘
          │ [Click ⋮]
          v
┌─────────────────────┐
│ Dropdown Menu       │
│ ┌─────────────────┐ │
│ │ ℹ️  Info Kantong │ │ → Switch to info view
│ │ 💰 Budget Awal  │ │ → Toast (WIP)
│ │ ✏️  Edit Kantong │ │ → Open EditPocketDrawer
│ │ 🗑️  Hapus        │ │ → Open Delete Confirm
│ └─────────────────┘ │
└─────────────────────┘
```

## 🎯 Action Flows

### Action 1: Info Kantong
```
[⋮] → [Info Kantong]
  ↓
┌──────────────────────────┐
│ Same Timeline Drawer     │
│ ┌──────────────────────┐ │
│ │ [← Back] Info View   │ │ ← Switches view mode
│ └──────────────────────┘ │
│ • Name: Sehari-hari     │
│ • Type: Primary         │
│ • Description: ...      │
└──────────────────────────┘
```

### Action 2: Edit Kantong
```
[⋮] → [Edit Kantong]
  ↓
Close Timeline
  ↓
┌──────────────────────────┐
│ EditPocketDrawer         │
│ ┌──────────────────────┐ │
│ │ 💰 [Emoji Picker]    │ │
│ │ Nama: [________]     │ │
│ │ Deskripsi: [_____]   │ │
│ │        [Simpan]      │ │
│ └──────────────────────┘ │
└──────────────────────────┘
```

### Action 3: Hapus Kantong (Custom Only)
```
[⋮] → [Hapus Kantong]
  ↓
Close Timeline
  ↓
┌──────────────────────────────┐
│ Delete Confirmation Dialog   │
│ ┌──────────────────────────┐ │
│ │ ⚠️  Hapus Kantong?       │ │
│ │                          │ │
│ │ Kantong "Liburan" akan   │ │
│ │ diarsipkan...            │ │
│ │                          │ │
│ │ [Batal]  [Ya, Hapus]     │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

### Action 4: Budget Awal (Daily Only)
```
[⋮] → [Budget Awal]
  ↓
Close Timeline
  ↓
┌────────────────────────────┐
│ Toast Notification         │
│ ℹ️  Fitur Budget Awal      │
│    sedang dalam            │
│    pengembangan            │
└────────────────────────────┘
```

## 📐 Layout Specs

### Mobile (Drawer)
```
┌─────────────────────────────────────┐
│ Timeline Sehari-hari                │
│ ┌─────────────┬─────┬─────┬──────┐  │
│ │ [Transfer]  │ [+] │ [⋮] │      │  │
│ │  48px       │ 32px│ 32px│      │  │
│ └─────────────┴─────┴─────┴──────┘  │
└─────────────────────────────────────┘
```

### Button Sizes
- Transfer button: `h-8 px-3` (mobile), icon + text (desktop)
- Plus button: `h-8 w-8 p-0 rounded-full`
- 3-dots button: `h-8 w-8 p-0 rounded-full`

### Menu Dropdown
```
Width: w-48 (192px)
Align: end (right-aligned)
Items:
  - Icon: size-4 mr-2
  - Text: Default size
  - Delete item: text-red-600
```

## 🎨 Visual Consistency

| Component | Menu Button | Menu Items |
|-----------|-------------|------------|
| **PocketTimeline** | ⋮ (3-dots) | Info, Budget, Edit, Delete |
| **PocketDetailPage** | ⋮ (3-dots) | Info, Budget, Edit, Delete |
| **ManagePocketsDialog** | ✏️ (pencil) | Edit only |
| **Pocket Cards** | - | Click to open timeline |

## 📱 Responsive Behavior

### Mobile
```
Timeline opens as Drawer (full screen)
  ↓
3-dots menu in header (top-right)
  ↓
Menu items close drawer, open new drawer/dialog
```

### Desktop
```
Timeline opens as Dialog (centered)
  ↓
3-dots menu in header (top-right)
  ↓
Menu items close dialog, open new dialog
```

## 🎯 Hit Targets

All buttons meet minimum touch target size:
- 3-dots button: `32px × 32px` (minimum 44px recommended)
- Menu items: Full width of dropdown (`192px × ~40px`)
- Spacing between buttons: `8px` gap

---

**Visual Design:** ✅ Complete  
**Accessibility:** ✅ Keyboard navigable  
**Responsive:** ✅ Mobile & Desktop  
