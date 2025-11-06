# Floating Action Button (FAB) System - Planning Document

## 📋 Overview

Implementasi FAB (Floating Action Button) berbentuk circle di kanan bawah layar dengan fitur:
- **3 Action Buttons**: Tambah Pengeluaran, Tambah Pemasukan Tambahan, Toggle Ringkasan Kantong
- **Auto-Hide on Scroll**: Menembus ke kanan menyisakan 10% circle
- **Manual Toggle**: Chevron button untuk show/hide manual
- **Smooth Animations**: Menggunakan motion/react dengan spring physics

## 🎯 Goals

1. **Mobile-First UX**: Optimized untuk Capacitor Android build
2. **Performance**: Minimal re-renders, debounced scroll listener
3. **Accessibility**: Touch-friendly (48px minimum), clear visual feedback
4. **Consistency**: Mengikuti design system aplikasi yang sudah ada

## 📁 File Structure

```
/components
├── FloatingActionButton.tsx         # Main FAB component
└── ui
    └── floating-action-button.tsx   # (Optional) Reusable FAB primitive
```

## 🔗 Related Features

- **AddExpenseDialog**: Triggered dari FAB action 1
- **AddAdditionalIncomeDialog**: Triggered dari FAB action 2
- **PocketsSummary**: Toggle visibility dari FAB action 3
- **Mobile Sticky Header**: Harus koordinasi z-index dan positioning

## 📚 Documentation Files

1. **TECHNICAL_SPECS.md** - Technical implementation details
2. **VISUAL_DESIGN.md** - Visual mockups dan behavior specs
3. **IMPLEMENTATION_GUIDE.md** - Step-by-step implementation
4. **COMPONENT_API.md** - Component props dan API reference
5. **TESTING_CHECKLIST.md** - QA checklist sebelum production
6. **QUICK_REFERENCE.md** - Quick maintenance guide

## ⚠️ Critical Requirements

- **No Conflict**: Tidak boleh konflik dengan mobile back button behavior
- **Z-Index Management**: Harus di atas content tapi di bawah dialogs
- **Touch Target**: Minimum 48x48px untuk accessibility
- **Performance**: Scroll listener harus debounced (max 60fps)
- **Capacitor Compatible**: Tested di Android native build

## 🚀 Implementation Timeline

1. **Phase 1**: Core FAB component with expand/collapse (30 min)
2. **Phase 2**: Auto-hide scroll behavior (20 min)
3. **Phase 3**: Manual toggle chevron (15 min)
4. **Phase 4**: Integration with existing dialogs (15 min)
5. **Phase 5**: Testing & polish (20 min)

**Total Estimated Time**: ~100 minutes

## 📊 Success Metrics

- [ ] FAB visible dan functional di mobile & desktop
- [ ] Smooth animations 60fps
- [ ] No layout shift atau jank
- [ ] All 3 actions working correctly
- [ ] Auto-hide behavior responsive (<100ms delay)
- [ ] Manual toggle persistent across sessions (optional)

---

**Created**: November 6, 2025  
**Status**: Planning Phase  
**Priority**: High - Critical for mobile UX
