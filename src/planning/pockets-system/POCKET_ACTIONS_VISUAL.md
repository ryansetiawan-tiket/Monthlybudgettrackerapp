# Pocket Actions Menu - Visual Guide

## 🎨 Before & After

### BEFORE
```
[Pocket Timeline Header]
┌──────────────────────────────────┐
│ 💰 Sehari-hari         [←] [ℹ️] │ ← Info icon
└──────────────────────────────────┘
```

### AFTER
```
[Pocket Timeline Header]
┌──────────────────────────────────┐
│ 💰 Sehari-hari         [←] [⋮] │ ← 3-dots icon
└──────────────────────────────────┘
       ↓ Click
┌─────────────────────┐
│ 📊 Info Kantong     │
│ 💰 Budget Awal      │ ← Only for "Sehari-hari"
│ ✏️ Edit Kantong     │
│ 🗑️ Hapus Kantong    │ ← Hidden for primary
└─────────────────────┘
```

## 📱 Edit Drawer

```
┌──────────────────────────────────┐
│ ✏️ Edit Kantong            [×]   │
├──────────────────────────────────┤
│                                  │
│ Emoji                            │
│ ┌────────────────────┐           │
│ │     💰             │ ← Picker  │
│ └────────────────────┘           │
│                                  │
│ Nama Kantong                     │
│ ┌────────────────────┐           │
│ │ Sehari-hari        │           │
│ └────────────────────┘           │
│                                  │
│ Deskripsi (Optional)             │
│ ┌────────────────────┐           │
│ │ Kantong untuk...   │           │
│ └────────────────────┘           │
│                                  │
│         [Simpan]                 │
└──────────────────────────────────┘
```

## 💰 Budget Dialog (Optional Feature)

```
┌──────────────────────────────────┐
│ Set Budget Awal            [×]   │
├───────────────────────���──────────┤
│                                  │
│ Budget awal kantong untuk bulan  │
│ ini (November 2025)              │
│                                  │
│ ┌────────────────────┐           │
│ │ Rp 5.000.000       │           │
│ └────────────────────┘           │
│                                  │
│ Budget ini akan muncul di info   │
│ kantong sebagai referensi.       │
│                                  │
│    [Batal]      [Simpan]         │
└──────────────────────────────────┘
```

## 🎯 Conditional Logic

### "Sehari-hari" Pocket
```
✅ Info Kantong
✅ Budget Awal         ← Unique
✅ Edit Kantong (name/emoji)
❌ Hapus Kantong       ← Hidden
```

### "Uang Dingin" Pocket
```
✅ Info Kantong
❌ Budget Awal         ← Hidden
✅ Edit Kantong (name/emoji)
❌ Hapus Kantong       ← Hidden
```

### Custom Pocket
```
✅ Info Kantong
❌ Budget Awal         ← Hidden
✅ Edit Kantong (full edit)
✅ Hapus Kantong       ← Show
```

## 🔄 Interaction Flow

```
User Action                    System Response
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Click [⋮]              →    Show dropdown menu
                               (conditional items)

2. Select "Edit Kantong"  →    Open drawer
                               (prefilled with current data)

3. Change emoji/name      →    Enable save button

4. Click "Simpan"         →    Call API
                          →    Update UI
                          →    Close drawer
                          →    Show toast success

5. Select "Hapus"         →    Show ConfirmDialog
   (custom only)          →    "Yakin hapus kantong X?"
                          →    Archive pocket
```

## 📐 Sizing
- Dropdown: Auto width, max 200px
- Drawer: Full width mobile, 400px desktop
- Dialog: 400px width, centered
