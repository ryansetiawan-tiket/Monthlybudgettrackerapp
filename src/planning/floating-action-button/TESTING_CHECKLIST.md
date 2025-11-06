# FAB System - Testing Checklist

## ✅ Pre-Testing Setup

- [ ] Build project successfully (`npm run build` or equivalent)
- [ ] Clear browser cache
- [ ] Test in incognito/private mode
- [ ] Prepare test devices (mobile, tablet, desktop)
- [ ] Enable React DevTools
- [ ] Enable Performance Monitor

---

## 🎯 Functional Testing

### Core Functionality
- [ ] **FAB Renders**: FAB visible on page load
- [ ] **Correct Position**: Bottom-right corner with proper spacing
- [ ] **Click to Expand**: Clicking main FAB shows 3 action buttons
- [ ] **Click to Collapse**: Clicking main FAB again hides action buttons
- [ ] **Plus Icon Rotation**: Icon rotates 45deg when expanded (becomes X)
- [ ] **Stagger Animation**: 3 buttons appear sequentially (0.1s delay each)

### Action Buttons
- [ ] **Add Expense Button**: Clicking triggers `onAddExpense` callback
- [ ] **Add Income Button**: Clicking triggers `onAddIncome` callback
- [ ] **Toggle Summary Button**: Clicking triggers `onToggleSummary` callback
- [ ] **Auto-Collapse**: FAB collapses after clicking any action button
- [ ] **Icon Colors**: Expense (primary), Income (green), Summary (blue)
- [ ] **Hover Effect**: Buttons scale up slightly on hover (desktop)

### Auto-Hide Behavior
- [ ] **Scroll Down**: FAB slides right when scrolling down
- [ ] **10% Visible**: Only 10% of FAB circle remains visible when hidden
- [ ] **Opacity Reduction**: FAB opacity reduces to 0.7 when auto-hidden
- [ ] **Scroll Up**: FAB returns when scrolling up
- [ ] **Idle Timer**: FAB returns after 2s of no scrolling
- [ ] **Smooth Animation**: Slide animation uses spring physics (no jarring)
- [ ] **No Jank**: Animation maintains 60fps

### Manual Toggle (Chevron)
- [ ] **Chevron Visible**: Small chevron button visible at FAB's left edge
- [ ] **Chevron Icon**: Shows ChevronRight when FAB visible
- [ ] **Click to Hide**: Clicking chevron slides FAB almost completely off-screen
- [ ] **Chevron Remains**: Only chevron (8px) remains visible when manually hidden
- [ ] **Icon Swap**: Chevron becomes ChevronLeft when FAB is hidden
- [ ] **Click to Show**: Clicking chevron again brings FAB back
- [ ] **Override Auto-Hide**: Manual hide state persists during scrolling
- [ ] **Icon Rotation**: Chevron rotates smoothly during toggle

### Edge Cases
- [ ] **Rapid Clicking**: No errors when rapidly clicking FAB
- [ ] **Double Click**: Properly handles double-click (should just toggle twice)
- [ ] **Click While Animating**: Handles clicks during expand/collapse animation
- [ ] **Scroll During Expand**: FAB collapses before auto-hiding if scrolling down
- [ ] **Click Outside**: FAB collapses when clicking elsewhere on page
- [ ] **Dialog Open**: FAB behavior when dialogs are open (should it hide?)
- [ ] **Page Load Scroll**: Handles page loading at scrolled position

---

## ⚡ Performance Testing

### Render Performance
- [ ] **Initial Mount**: Component mounts in < 50ms
- [ ] **No Layout Shift**: FAB doesn't cause CLS (Cumulative Layout Shift)
- [ ] **Re-render Count**: Check React DevTools Profiler for excessive re-renders
- [ ] **Memoization**: Verify `useMemo` and `useCallback` working
- [ ] **Scroll Performance**: No lag during scrolling

### Animation Performance
- [ ] **60 FPS**: All animations run at 60fps (use browser Performance tab)
- [ ] **GPU Acceleration**: Check if `transform` properties are GPU-accelerated
- [ ] **No Reflow**: Animations don't cause layout reflow
- [ ] **Spring Physics**: Animations feel natural, not linear

### Memory & Cleanup
- [ ] **No Memory Leaks**: Check browser Memory tab after multiple interactions
- [ ] **Event Listener Cleanup**: Scroll listeners removed on unmount
- [ ] **Timeout Cleanup**: All timeouts cleared on unmount
- [ ] **Animation Cleanup**: AnimatePresence properly unmounts elements

### Network & Bundle
- [ ] **Bundle Size**: Check impact on total bundle size (should be < 5KB)
- [ ] **Code Splitting**: Verify component is included in main bundle (not code-split)
- [ ] **Tree Shaking**: Unused motion components are tree-shaken

---

## 📱 Responsive Testing

### Mobile (320px - 767px)
- [ ] **Size**: FAB is 56x56px on mobile
- [ ] **Position**: 24px from bottom and right edges
- [ ] **Touch Targets**: All buttons >= 48x48px
- [ ] **Action Buttons**: 48x48px size
- [ ] **Chevron**: 24x24px visible, but 40x40px touch area
- [ ] **No Overlap**: Doesn't overlap with mobile sticky header (100px top padding)
- [ ] **Scrollable Content**: Can scroll content without accidentally clicking FAB
- [ ] **Auto-Hide Delay**: Hides after 1s of scrolling (faster on mobile)

### Tablet (768px - 1024px)
- [ ] **Size**: FAB is 64x64px on tablet
- [ ] **Position**: 32px from bottom and right edges
- [ ] **Touch Targets**: Still >= 48x48px
- [ ] **Landscape Mode**: Properly positioned in landscape orientation
- [ ] **iPad Safari**: Test on iPad Safari specifically

### Desktop (1025px+)
- [ ] **Size**: FAB is 64x64px on desktop
- [ ] **Position**: 32px from bottom and right edges
- [ ] **Hover Effects**: Scale and shadow effects on hover
- [ ] **Cursor**: Pointer cursor on all interactive elements
- [ ] **Mouse Interactions**: Smooth interactions with mouse
- [ ] **Auto-Hide Delay**: Hides after 2s of scrolling (slower on desktop)

### Ultra-Wide (1920px+)
- [ ] **Position**: Still anchored to bottom-right
- [ ] **Visibility**: Easily visible without scrolling

---

## ♿ Accessibility Testing

### Keyboard Navigation
- [ ] **Tab to Focus**: Can tab to main FAB button
- [ ] **Focus Indicator**: Clear visual focus ring (2px ring-primary)
- [ ] **Enter Key**: Pressing Enter toggles expand/collapse
- [ ] **Space Key**: Pressing Space also toggles expand/collapse
- [ ] **Arrow Keys**: Can navigate between action buttons when expanded (optional)
- [ ] **Escape Key**: Pressing Escape collapses FAB if expanded
- [ ] **Tab Order**: Logical tab order (main FAB → actions → chevron)

### ARIA Attributes
- [ ] **Main FAB**:
  - [ ] `aria-label="Quick Actions"`
  - [ ] `aria-expanded="true/false"`
  - [ ] `aria-haspopup="menu"`
  - [ ] `aria-controls="fab-actions-menu"`
- [ ] **Action Buttons**:
  - [ ] `aria-label="Add Expense"`
  - [ ] `aria-label="Add Additional Income"`
  - [ ] `aria-label="Toggle Pockets Summary"`
- [ ] **Chevron**:
  - [ ] `aria-label="Show Quick Actions"` or `"Hide Quick Actions"`

### Screen Reader
- [ ] **VoiceOver (iOS)**: Announces all buttons correctly
- [ ] **TalkBack (Android)**: Announces all buttons correctly
- [ ] **NVDA (Windows)**: Announces all buttons correctly (if testable)
- [ ] **State Changes**: Announces when FAB expands/collapses
- [ ] **Disabled States**: Announces when buttons are disabled

### Visual Accessibility
- [ ] **Color Contrast**: All text/icons meet WCAG AA (4.5:1 minimum)
- [ ] **Focus Visible**: Focus indicators visible at all times
- [ ] **Touch Targets**: Minimum 48x48px (WCAG 2.1 Level AAA)
- [ ] **Icon Size**: Icons large enough to see (minimum 20px)

### Motion Preferences
- [ ] **prefers-reduced-motion**: Respects system preference
- [ ] **Instant Transitions**: Animations become instant if user prefers reduced motion
- [ ] **No Dizziness**: Animations don't cause motion sickness

---

## 🖥️ Cross-Browser Testing

### Chrome/Chromium
- [ ] **Latest Version**: All features work on latest Chrome
- [ ] **Animations**: Smooth animations
- [ ] **Touch Events**: Touch events work (if testing on touchscreen device)

### Firefox
- [ ] **Latest Version**: All features work on latest Firefox
- [ ] **Animations**: Smooth animations (check spring physics)
- [ ] **Event Listeners**: Scroll listeners work properly

### Safari (Desktop)
- [ ] **Latest Version**: All features work on latest Safari
- [ ] **Backdrop Blur**: Chevron backdrop-blur renders correctly
- [ ] **Spring Animations**: motion/react spring physics work

### Safari (iOS)
- [ ] **iOS 15+**: Works on iOS 15 and above
- [ ] **Touch Events**: Touch interactions smooth
- [ ] **Safe Area**: Respects iOS safe area insets
- [ ] **Scroll Behavior**: Auto-hide works with iOS scroll physics

### Edge
- [ ] **Latest Version**: All features work on latest Edge
- [ ] **Chromium-Based**: Should behave like Chrome

### Samsung Internet (Android)
- [ ] **Latest Version**: Works on Samsung Internet browser
- [ ] **Touch Events**: Touch interactions work

---

## 📱 Device Testing

### Physical Devices
- [ ] **iPhone (iOS)**: iPhone 12 or newer
- [ ] **Android Phone**: Google Pixel or Samsung Galaxy
- [ ] **iPad (iPadOS)**: iPad Air or newer
- [ ] **Android Tablet**: Samsung Galaxy Tab
- [ ] **Desktop**: Windows/Mac with mouse

### Emulators/Simulators
- [ ] **Chrome DevTools**: Mobile emulation (iPhone 12, Pixel 5)
- [ ] **Firefox DevTools**: Responsive design mode
- [ ] **Xcode Simulator**: iOS Simulator (if on Mac)
- [ ] **Android Studio**: Android Emulator

---

## 🔗 Integration Testing

### Dialog Integration
- [ ] **AddExpenseDialog**: Opens when clicking "Add Expense" action
- [ ] **AddAdditionalIncomeDialog**: Opens when clicking "Add Income" action
- [ ] **PocketsSummary**: Toggles when clicking "Toggle Summary" action
- [ ] **FAB Collapses**: FAB auto-collapses when action is triggered
- [ ] **Z-Index**: FAB doesn't overlap open dialogs (FAB: 40, Dialog: 50)

### Existing Features
- [ ] **Mobile Back Button**: Doesn't interfere with mobile back button behavior
- [ ] **Sticky Header**: Doesn't overlap with mobile sticky header
- [ ] **Scrollable Content**: Doesn't prevent scrolling
- [ ] **Other Buttons**: Doesn't interfere with other floating elements
- [ ] **Toast Notifications**: Works with Sonner toasts

### State Management
- [ ] **Budget Data**: Works when budget data is loading
- [ ] **Pockets**: Works when pockets are empty
- [ ] **Disabled States**: Properly disables actions when conditions not met

---

## 🎨 Visual Testing

### Layout
- [ ] **Positioning**: Fixed at bottom-right (correct pixel values)
- [ ] **Spacing**: Proper gap between action buttons (12px)
- [ ] **Alignment**: Action buttons aligned to right
- [ ] **Circular Shape**: All buttons perfectly circular (border-radius: 9999px)

### Colors & Shadows
- [ ] **Main FAB**: Primary color background, correct shadow
- [ ] **Action Buttons**: White background, subtle border
- [ ] **Chevron**: Semi-transparent white with backdrop-blur
- [ ] **Hover States**: Subtle shadow increase on hover
- [ ] **Active States**: Slight scale-down on press

### Icons
- [ ] **Plus Icon**: Centered, correct size (24px)
- [ ] **Action Icons**: Centered, correct size (20px)
- [ ] **Chevron Icon**: Centered, correct size (16px)
- [ ] **Icon Colors**: Correct colors (primary, green, blue)

### Dark Mode
- [ ] **Main FAB**: Uses primary color (works in dark mode)
- [ ] **Action Buttons**: Background adapts to dark mode
- [ ] **Chevron**: Background visible in dark mode
- [ ] **Borders**: Borders visible in dark mode

### Animations
- [ ] **Smooth Transitions**: No stuttering or jank
- [ ] **Spring Physics**: Natural bouncy feel
- [ ] **Stagger Effect**: Actions appear sequentially
- [ ] **Icon Rotation**: Plus icon rotates smoothly

---

## 🐛 Bug Testing

### Potential Issues to Check
- [ ] **Rapid Scroll**: No errors when scrolling very fast
- [ ] **Resize Window**: Handles window resize correctly
- [ ] **Orientation Change**: Handles mobile orientation change
- [ ] **Page Refresh**: Works after page refresh
- [ ] **Back/Forward**: Works after browser back/forward navigation
- [ ] **Long Press**: Handles long press on mobile (shouldn't trigger context menu)
- [ ] **Multi-Touch**: Handles multi-touch scenarios on mobile

### Console Errors
- [ ] **No Console Errors**: Check browser console for errors
- [ ] **No Console Warnings**: Check for React warnings
- [ ] **No Memory Warnings**: Check for memory leak warnings

### Edge Cases
- [ ] **No JavaScript**: Graceful degradation (FAB hidden if JS disabled)
- [ ] **Slow Network**: Works with slow network/high latency
- [ ] **Low-End Device**: Smooth on low-end Android devices
- [ ] **High Scroll Speed**: Handles very fast scrolling

---

## 🚀 Production Testing

### Build Testing
- [ ] **Production Build**: Works in production build (`npm run build`)
- [ ] **Minification**: Minified code works correctly
- [ ] **Source Maps**: Source maps available for debugging
- [ ] **Bundle Analysis**: Check bundle size contribution

### Capacitor Testing (Android)
- [ ] **APK Build**: FAB works in APK build
- [ ] **Install on Device**: Works after installing on real Android device
- [ ] **Native Feel**: Interactions feel native
- [ ] **Performance**: Smooth performance on Android
- [ ] **Splash Screen**: No issues during/after splash screen
- [ ] **Deep Links**: Works with deep links (if applicable)

### Real-World Scenarios
- [ ] **Add Multiple Expenses**: Use FAB to add 5+ expenses rapidly
- [ ] **Add Multiple Incomes**: Use FAB to add 5+ incomes rapidly
- [ ] **Toggle Summary**: Toggle summary 10+ times rapidly
- [ ] **Mix Actions**: Randomly trigger all actions
- [ ] **Long Session**: Use app for 10+ minutes without issues

---

## 📊 Success Criteria

### Must Have (Critical)
- ✅ All 3 actions work correctly
- ✅ Auto-hide on scroll works smoothly
- ✅ Manual toggle works
- ✅ 60fps animations
- ✅ No accessibility violations
- ✅ Works on Capacitor Android build

### Should Have (High Priority)
- ✅ Touch targets >= 48px
- ✅ Keyboard navigation works
- ✅ Respects prefers-reduced-motion
- ✅ Works on all major browsers
- ✅ Works on mobile and desktop

### Nice to Have (Medium Priority)
- ✅ Dark mode support
- ✅ Smooth spring physics
- ✅ Proper ARIA labels
- ✅ Screen reader compatible
- ✅ Bundle size < 5KB

---

## 📝 Test Report Template

```markdown
## FAB System Test Report

**Date**: [Date]
**Tester**: [Name]
**Environment**: [Browser / Device / OS]

### Summary
- Total Tests: [X]
- Passed: [X]
- Failed: [X]
- Blocked: [X]

### Critical Issues Found
1. [Issue description]
2. [Issue description]

### Minor Issues Found
1. [Issue description]
2. [Issue description]

### Performance Metrics
- Initial Mount: [X]ms
- Expand Animation: [X]ms
- Scroll FPS: [X]fps
- Bundle Size: [X]KB

### Recommendations
- [Recommendation 1]
- [Recommendation 2]

### Sign-off
- [ ] Ready for production
- [ ] Needs fixes before production
```

---

**Last Updated**: November 6, 2025  
**Total Test Cases**: 200+  
**Estimated Testing Time**: 2-3 hours (comprehensive)
