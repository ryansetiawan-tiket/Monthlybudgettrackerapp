# Back Gesture Testing Guide - Quick Reference

**Target**: Android & iOS Native App  
**Feature**: Hardware back button & swipe gesture support  
**Status**: Ready for Testing ✅

---

## 🎯 Quick Test Scenarios

### Basic Tests (5 minutes)

1. **Single Dialog Test**
   - Open any dialog (e.g., Tambah Pengeluaran)
   - Press back button / swipe
   - ✅ Dialog should close smoothly

2. **Multiple Dialogs Test**
   - Open Manage Pockets dialog
   - Open Edit Pocket drawer
   - Press back → Edit drawer closes, Manage Pockets still open
   - Press back → Manage Pockets closes

3. **Full-Page Test**
   - Open PocketDetailPage (tap "Info" di kartu kantong)
   - Press back
   - ✅ Returns to main view

---

## 📱 Component-by-Component Test List

### Priority: HIGH (Test First)

| Component | How to Open | Expected Back Behavior |
|-----------|-------------|------------------------|
| **PocketDetailPage** | Tap "Info" di kartu kantong | Close page, return to main view |
| **PocketTimeline** | Tap kartu kantong di PocketsSummary | Close drawer |
| **AddExpenseDialog** | Tap FAB → Tambah Pengeluaran | Close dialog |
| **AddIncomeDialog** | Tap FAB → Tambah Pemasukan | Close dialog |
| **ManagePocketsDialog** | Tap "Kelola Kantong" di Sisa Budget | Close dialog |

### Priority: MEDIUM (Test Second)

| Component | How to Open | Expected Back Behavior |
|-----------|-------------|------------------------|
| **BudgetForm** | Tap "Set Budget" di header | Close dialog |
| **TransferDialog** | Tap FAB → Transfer Kantong | Close dialog |
| **CategoryManager** | Tap icon kategori di header | Close dialog |
| **WishlistDialog** | Tap actions menu di kantong → Kelola Wishlist | Close dialog |
| **EditPocketDrawer** | Tap "Edit" di Manage Pockets | Close drawer |
| **BulkEditCategoryDialog** | Select multiple expenses → More → Edit Kategori | Close sheet |

### Priority: NESTED (Test Third)

| Scenario | Steps | Expected Back Behavior |
|----------|-------|------------------------|
| **CategoryManager → CategoryEditor** | 1. Open CategoryManager<br>2. Tap "Edit" di kategori | Back: Close editor, keep manager open<br>Back: Close manager |
| **CategoryManager → BudgetLimitEditor** | 1. Open CategoryManager<br>2. Tap "Set Limit" di kategori | Back: Close limit editor, keep manager open<br>Back: Close manager |
| **AddExpenseDialog → FixedExpenseTemplates** | 1. Open AddExpenseDialog<br>2. Tap "Kelola Template"<br>3. Open create dialog | Back: Close template dialog<br>Back: Close AddExpenseDialog |

---

## 🧪 Detailed Testing Procedure

### Test 1: Single Dialog Flow
```
1. Dari main screen
2. Tap FAB → Tambah Pengeluaran
3. Dialog terbuka ✅
4. Press back button
5. Dialog tertutup ✅
6. Masih di main screen ✅
```

### Test 2: Nested Dialog Flow
```
1. Dari main screen
2. Tap icon kategori → CategoryManager terbuka
3. Tap "Edit" di kategori → CategoryEditor terbuka
4. Press back button
5. CategoryEditor tertutup, CategoryManager masih terbuka ✅
6. Press back button
7. CategoryManager tertutup, kembali ke main screen ✅
```

### Test 3: Full-Page Flow
```
1. Dari PocketsSummary
2. Tap "Info" di kartu kantong Daily
3. PocketDetailPage terbuka (full screen)
4. Press back button
5. PocketDetailPage tertutup, kembali ke PocketsSummary ✅
```

### Test 4: Exit App Flow
```
1. Pastikan semua dialog tertutup
2. Di main screen
3. Press back button
4. Toast muncul: "Tekan sekali lagi untuk keluar" ✅
5. Press back button lagi dalam 2 detik
6. App keluar ✅
```

---

## 🐛 What to Look For (Bugs to Watch)

### Critical Issues ❌
- [ ] Back button doesn't close dialog
- [ ] Wrong dialog closes (should be LIFO - Last In First Out)
- [ ] App crashes on back press
- [ ] Back button exits app when dialog is open

### Minor Issues ⚠️
- [ ] No haptic feedback on close
- [ ] Slow animation / lag
- [ ] Console errors (check in Chrome DevTools via USB debugging)
- [ ] Multiple rapid back presses cause issues

### Expected Behavior ✅
- [ ] Each back press closes ONE dialog/drawer
- [ ] Nested dialogs close in reverse order (newest first)
- [ ] Haptic feedback on each close (Android)
- [ ] Smooth animations
- [ ] Toast appears when no dialogs open
- [ ] Double-back exits app

---

## 📋 Pre-Testing Checklist

### Development Setup
- [ ] Build APK with Capacitor: `npx cap sync android`
- [ ] Install APK on test device
- [ ] Enable USB debugging
- [ ] Connect Chrome DevTools for console logs

### Test Device Requirements
- [ ] Android 8.0+ or iOS 13+
- [ ] Physical device (not emulator for best results)
- [ ] Capacitor plugins installed

---

## 📊 Testing Matrix

| Device | Dialog | Drawer | Full-Page | Nested | Exit |
|--------|--------|--------|-----------|--------|------|
| Android 11 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Android 12 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Android 13 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| iOS 15 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| iOS 16 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

Check (✅) each cell after successful test.

---

## 🔍 Console Logs to Monitor

### Good Logs (Expected)
```
[BackButton] Back button pressed
[DialogStack] Top dialog: {id} (priority: {priority})
[DialogStack] Closing top dialog: {id}
[DialogRegistration] Closing dialog via back button: {id}
[BackButton] Dialog closed
```

### Bad Logs (Issues)
```
❌ [DialogStack] No dialogs to close (when dialog is visible)
❌ Error: Cannot read property 'onClose' of undefined
❌ Warning: Memory leak detected
❌ [BackButton] Multiple listeners registered
```

---

## 🎯 Pass/Fail Criteria

### ✅ PASS Criteria
- All 14 dialogs/drawers close correctly
- Nested dialogs close in correct order
- No console errors
- Haptic feedback works (Android)
- Exit confirmation works
- No memory leaks

### ❌ FAIL Criteria
- Any dialog doesn't close
- App crashes
- Console shows errors
- Wrong dialog closes
- Exit app without confirmation

---

## 🚀 Quick Test Script (3 Minutes)

Run through this sequence quickly:

```
1. Open AddExpenseDialog → Back ✅
2. Open ManagePocketsDialog → Back ✅
3. Open PocketDetailPage → Back ✅
4. Open CategoryManager → Edit category → Back → Back ✅
5. Open AddExpenseDialog → Kelola Template → Open dialog → Back → Back ✅
6. No dialogs open → Back → Toast appears ✅
7. Back again → App exits ✅
```

**Time**: ~3 minutes  
**Coverage**: All major flows  

---

## 📝 Bug Report Template

If you find issues, use this format:

```
**Component**: [Name]
**Issue**: [Description]
**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected**: [What should happen]
**Actual**: [What actually happened]
**Device**: [Android 12 / iOS 15]
**Console Logs**: [Copy relevant logs]
**Screenshot**: [If applicable]
```

---

## ✅ Sign-Off Checklist

After testing, verify:

- [ ] All 14 components tested individually
- [ ] Nested dialogs tested (3 scenarios)
- [ ] Full-page tested
- [ ] Exit flow tested
- [ ] No console errors
- [ ] No memory leaks
- [ ] Haptic feedback works
- [ ] Animations smooth
- [ ] Multiple devices tested
- [ ] Android & iOS tested

**Tested by**: _________________  
**Date**: _________________  
**Result**: PASS ✅ / FAIL ❌  
**Notes**: _________________

---

## 🎉 Success Indicators

You know testing is successful when:
- ✅ Back button feels natural and intuitive
- ✅ No unexpected app exits
- ✅ Dialogs close in logical order
- ✅ No lag or jank
- ✅ Haptic feedback provides good UX
- ✅ Users don't need to think about how to close dialogs

**Ready for production!** 🚀
