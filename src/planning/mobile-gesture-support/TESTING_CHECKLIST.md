# Mobile Gesture Support - Testing Checklist

**Tanggal:** 6 November 2025  
**Platform:** Android (Capacitor)  
**Version:** 1.0

## 📋 Overview

Comprehensive testing checklist untuk memastikan mobile gesture support berfungsi dengan baik di semua scenario.

---

## 🌐 Browser Testing (Development)

### Basic Functionality

- [ ] **App loads successfully**
  - No console errors
  - All components render
  - Data loads from Supabase

- [ ] **Dialogs open/close normally**
  - Click button → dialog opens
  - Click X button → dialog closes
  - Click backdrop → dialog closes
  - Press Escape → dialog closes

- [ ] **Swipe indicator visible**
  - Check on mobile viewport (< 768px)
  - Indicator shows at top of dialog
  - Indicator hidden on desktop

### Dialog Stack Registration

- [ ] **Console logs show registration**
  ```
  Expected output when opening AddExpenseDialog:
  [DialogRegistration] Registering dialog: add-expense-dialog (priority: 5)
  ```

- [ ] **Console logs show unregistration**
  ```
  Expected output when closing:
  [DialogRegistration] Unregistering dialog: add-expense-dialog
  ```

- [ ] **Back button hook logs**
  ```
  Expected in browser:
  [BackButton] Not in Capacitor, skipping setup
  ```

### All Dialog Components

Test each dialog individually:

#### AddExpenseDialog
- [ ] Opens correctly
- [ ] Registers to stack (check console)
- [ ] Closes with X button
- [ ] Closes with backdrop click
- [ ] Closes with Escape key
- [ ] Unregisters on close (check console)

#### AddAdditionalIncomeDialog
- [ ] Opens correctly
- [ ] Registers to stack
- [ ] Closes properly
- [ ] Unregisters on close

#### WishlistDialog
- [ ] Opens correctly
- [ ] Registers to stack
- [ ] Closes properly
- [ ] Unregisters on close

#### TransferDialog
- [ ] Opens correctly
- [ ] Registers to stack
- [ ] Closes properly
- [ ] Unregisters on close

#### ManagePocketsDialog
- [ ] Opens correctly
- [ ] Registers to stack
- [ ] Closes properly
- [ ] Unregisters on close

---

## 📱 Mobile Browser Testing (Responsive Mode)

### Chrome DevTools Mobile Emulation

**Setup:**
1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select device (e.g., Pixel 5)
4. Reload page

### Swipe Gestures

#### Swipe Down to Dismiss

- [ ] **Touch dialog header**
  - Finger touches top of dialog
  - Touch registers

- [ ] **Drag down slowly**
  - Dialog moves with finger
  - Backdrop fades proportionally
  - Transform applies smoothly

- [ ] **Release after 80px+ drag**
  - Dialog animates to bottom
  - Backdrop fades out completely
  - Dialog closes (onOpenChange called)

- [ ] **Release after < 80px drag**
  - Dialog bounces back to original position
  - Backdrop restores to full opacity
  - Dialog stays open

#### Fast Swipe (Velocity)

- [ ] **Quick swipe down (50px but fast)**
  - Dialog closes despite < 80px distance
  - Velocity threshold triggers dismiss

- [ ] **Quick swipe up**
  - Nothing happens (only down swipes work)

#### Gesture Conflicts

- [ ] **Scroll dialog content**
  - Dialog has scrollable content
  - Scroll works normally
  - Swipe-to-dismiss does NOT trigger

- [ ] **Swipe on non-header area**
  - Content area swipe → scroll only
  - Header area swipe → dismiss gesture

- [ ] **Horizontal swipe**
  - Swipe left/right on dialog
  - No dismiss (vertical only)

### Touch Targets

- [ ] **All buttons minimum 44x44px**
  - Close button large enough
  - Action buttons large enough
  - Easy to tap without mistakes

- [ ] **Form inputs accessible**
  - Input fields easy to tap
  - Dropdowns easy to open
  - Checkboxes easy to toggle

---

## 🤖 Android Native Testing (Capacitor)

### Prerequisites

- [ ] App built with Capacitor
  ```bash
  npm run build
  npx cap sync
  npx cap open android
  ```

- [ ] App installed on real device
  - USB debugging enabled
  - Device connected
  - App runs from Android Studio

### Hardware Back Button

#### Single Dialog Open

- [ ] **Open AddExpenseDialog**
  - Dialog opens
  - Check console: `[BackButton] Setting up hardware back button handler`

- [ ] **Press hardware back button**
  - Dialog closes
  - Check console: `[BackButton] Dialog closed`
  - Haptic feedback (vibration)

- [ ] **Press back button with no dialogs**
  - Toast shows: "Tekan sekali lagi untuk keluar"
  - Check console: `[BackButton] Showing exit confirmation`
  - Haptic feedback

- [ ] **Press back button again within 2 seconds**
  - App exits
  - Check console: `[BackButton] Exiting app`

- [ ] **Wait > 2 seconds, press back again**
  - Toast shows again (timer reset)
  - App doesn't exit

#### Multiple Dialogs (Priority)

**Test Scenario 1: Same Priority**
- [ ] Open AddExpenseDialog (priority: 5)
- [ ] Open TransferDialog from inside (priority: 5)
- [ ] Press back → Most recent (Transfer) closes
- [ ] Press back → Expense dialog closes

**Test Scenario 2: Different Priority**
- [ ] Open WishlistDialog (priority: 5)
- [ ] Trigger confirmation dialog (priority: 10)
- [ ] Press back → Confirmation closes first (higher priority)
- [ ] Press back → Wishlist closes

**Test Scenario 3: Rapid Back Presses**
- [ ] Open 3 dialogs quickly
- [ ] Press back rapidly 3 times
- [ ] Each press closes one dialog
- [ ] No crashes or race conditions

### Swipe Gestures (Native)

Same tests as mobile browser, but on real device:

- [ ] Swipe down > 80px → closes
- [ ] Swipe down < 80px → bounces back
- [ ] Fast swipe → closes (velocity)
- [ ] Scroll content → no dismiss
- [ ] Smooth animations (60fps)

### Haptic Feedback

- [ ] **Dialog opens**
  - Light vibration

- [ ] **Dialog closes (back button)**
  - Light vibration

- [ ] **Dialog closes (swipe)**
  - Light vibration

- [ ] **Button press** (if implemented)
  - Selection vibration

- [ ] **Error occurs** (if implemented)
  - Heavy vibration

### Integration Tests

#### Back Button + Swipe

- [ ] Open dialog
- [ ] Start swipe down (don't release)
- [ ] Press back button while swiping
- [ ] Dialog closes properly
- [ ] No visual glitches

#### Rapid Interactions

- [ ] Open dialog
- [ ] Immediately press back
- [ ] Dialog closes before animation completes
- [ ] No errors

- [ ] Open dialog
- [ ] Immediately swipe down
- [ ] Release after 100px
- [ ] Dialog closes properly

#### Form Submission

- [ ] Open AddExpenseDialog
- [ ] Fill form
- [ ] Submit
- [ ] Dialog closes
- [ ] Data saved
- [ ] No back button issues after submit

---

## 🎨 Visual & UX Testing

### Animations

- [ ] **Dialog open animation**
  - Smooth fade in
  - Smooth scale in
  - No jank or stutter

- [ ] **Dialog close animation**
  - Smooth fade out
  - Smooth scale out
  - Backdrop fades correctly

- [ ] **Swipe animation**
  - Dialog moves with finger smoothly
  - Backdrop fades proportionally
  - No lag or jank

- [ ] **Bounce back animation**
  - Smooth spring animation
  - Returns to original position
  - No overshoot

### Performance

- [ ] **60fps animations**
  - Use Chrome DevTools Performance tab
  - Record during swipe
  - Check frame rate

- [ ] **Low-end device**
  - Test on older Android device
  - Animations still smooth
  - No excessive lag

- [ ] **Memory usage**
  - Open/close dialogs 20 times
  - Check memory doesn't increase indefinitely
  - No memory leaks

### Accessibility

- [ ] **Keyboard navigation**
  - Tab key moves focus
  - Enter key activates buttons
  - Escape key closes dialog

- [ ] **Screen reader** (if available)
  - Dialog announces when opened
  - Close button announced
  - Form fields announced

- [ ] **Touch targets**
  - Minimum 44x44px for all interactive elements
  - Easy to tap without precision

---

## 🐛 Edge Cases & Error Scenarios

### Dialog Stack Edge Cases

- [ ] **Open dialog, close from X, open again**
  - Registration works correctly
  - No duplicate registrations

- [ ] **Open multiple, close from backdrop**
  - Only topmost closes
  - Others remain open

- [ ] **Rapid open/close**
  - Open dialog
  - Close immediately (< 100ms)
  - Open again
  - No race conditions

### Network Issues

- [ ] **Poor connection**
  - Open dialog while loading
  - Back button still works
  - Swipe still works

- [ ] **Offline mode**
  - App works offline
  - Gestures still functional

### System Interruptions

- [ ] **Incoming call**
  - App paused
  - Resume app
  - Dialogs still work
  - Gestures still work

- [ ] **Home button**
  - App sent to background
  - Return to app
  - State preserved
  - Gestures work

- [ ] **Recent apps button**
  - Switch between apps
  - Return to Budget Tracker
  - Everything works

### Orientation Changes

- [ ] **Rotate device (portrait → landscape)**
  - Dialog repositions correctly
  - Gestures still work
  - No layout breaks

- [ ] **Rotate while dialog open**
  - Dialog stays open
  - Layout adjusts
  - Swipe still works

---

## 📊 Performance Metrics

### Target Metrics

- [ ] **Back button response time < 100ms**
  - Measure with console.time()
  - Consistent across devices

- [ ] **Swipe animation 60fps**
  - Use Performance monitor
  - No dropped frames

- [ ] **Bundle size increase < 10KB**
  - Compare before/after
  - Check webpack bundle analyzer

- [ ] **Memory usage stable**
  - No memory leaks
  - Garbage collection works

### Measurement

```tsx
// Add to useMobileBackButton.ts for testing
console.time('BackButtonResponse');
const dialogClosed = closeTopDialog();
console.timeEnd('BackButtonResponse');
// Should log < 100ms
```

---

## ✅ Final Verification

### Before Production

- [ ] All tests passed
- [ ] No console errors
- [ ] No console warnings (except info logs)
- [ ] Performance acceptable
- [ ] Animations smooth
- [ ] Haptics work
- [ ] Back button works correctly
- [ ] Swipe gestures work correctly
- [ ] No crashes
- [ ] No memory leaks

### Cross-Device Testing

Test on at least 3 different devices:

**Device 1: High-end**
- [ ] Samsung Galaxy S23 (or similar)
- [ ] All features work
- [ ] Excellent performance

**Device 2: Mid-range**
- [ ] Google Pixel 5 (or similar)
- [ ] All features work
- [ ] Good performance

**Device 3: Low-end**
- [ ] Budget Android device
- [ ] All features work
- [ ] Acceptable performance

### Android Versions

Test on different Android versions:

- [ ] **Android 10** (API 29)
- [ ] **Android 11** (API 30)
- [ ] **Android 12** (API 31)
- [ ] **Android 13** (API 33)
- [ ] **Android 14** (API 34)

---

## 📝 Bug Report Template

If you find issues, document them:

```markdown
### Bug: [Short Description]

**Platform:** Android / Browser / Both
**Device:** Samsung Galaxy S21
**Android Version:** 13
**App Version:** 1.0.0

**Steps to Reproduce:**
1. Open AddExpenseDialog
2. Press back button
3. ...

**Expected Behavior:**
Dialog should close

**Actual Behavior:**
Dialog stays open, console shows error

**Console Logs:**
```
[Error message here]
```

**Screenshots:**
[Attach if applicable]

**Severity:** High / Medium / Low
**Workaround:** [If any]
```

---

## 🎯 Sign-off Checklist

Before marking as complete:

- [ ] **All browser tests passed**
- [ ] **All mobile browser tests passed**
- [ ] **All native tests passed**
- [ ] **Performance metrics met**
- [ ] **Cross-device testing complete**
- [ ] **No critical bugs**
- [ ] **Documentation updated**
- [ ] **Team reviewed** (if applicable)

---

**Testing Status:** 🟡 Ready for Testing  
**Last Updated:** 6 November 2025  
**Tester:** [Your Name]  
**Date Completed:** [Date]

---

## 📚 Additional Resources

- [Android Back Button Guidelines](https://developer.android.com/guide/navigation/navigation-custom-back)
- [Capacitor Testing Guide](https://capacitorjs.com/docs/guides/testing)
- [Chrome DevTools Device Mode](https://developer.chrome.com/docs/devtools/device-mode/)
