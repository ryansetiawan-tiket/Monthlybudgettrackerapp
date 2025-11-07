# 3-Dots Menu Z-Index Quick Fix

## 🐛 Problem
3-dots menu tidak muncul ketika diklik

## ⚡ Solution
Tambah z-index lebih tinggi dari parent drawer/dialog

## 🔧 Changes Made

### PocketTimeline.tsx (2 locations)
```tsx
// Mobile Drawer (line ~651)
<DropdownMenuContent align="end" className="w-48 z-[102]">

// Desktop Dialog (line ~746)
<DropdownMenuContent align="end" className="w-48 z-[102]">
```

### PocketDetailPage.tsx (1 location)
```tsx
// Detail Page (line ~137)
<DropdownMenuContent align="end" className="w-48 z-[151]">
```

## 📊 Z-Index Rules

| Component | Z-Index | Notes |
|-----------|---------|-------|
| PocketTimeline Drawer | z-[101] | Parent container |
| PocketTimeline Dropdown | z-[102] | Must be > 101 |
| PocketDetailPage | z-[150] | Full screen overlay |
| DetailPage Dropdown | z-[151] | Must be > 150 |

## ✅ Testing
1. Open pocket timeline → Click 3-dots → Menu appears ✅
2. Open detail page → Click 3-dots → Menu appears ✅

---
**Fix Time:** 5 minutes | **Status:** ✅ Complete
