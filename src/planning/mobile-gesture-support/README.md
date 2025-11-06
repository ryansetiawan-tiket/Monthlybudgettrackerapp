# Mobile Gesture Support Planning

**Tanggal:** 6 November 2025  
**Status:** 📋 Planning Phase  
**Priority:** 🔥 Critical for Native Android App  
**Target:** Capacitor Android Build

## 🎯 Tujuan

Menambahkan **comprehensive mobile gesture support** untuk aplikasi Budget Tracker yang akan di-build sebagai Android native app menggunakan Capacitor dan Android Studio.

## 📱 Fitur Utama

### 1. **Hardware Back Button Support** ⬅️
- Android hardware/gesture back button handling
- Intelligent dialog/sheet closing priority
- Prevent accidental app exit
- Stack-based dialog management

### 2. **Swipe Gestures** 👆
- Swipe down untuk close dialogs/sheets (iOS-style)
- Swipe dari edge untuk navigation
- Natural mobile UX
- Smooth animations

### 3. **Touch Optimization** ✋
- Touch target optimization (min 48x48px)
- Haptic feedback (vibration)
- Long press gestures
- Pull to refresh (optional)

### 4. **Native Integration** 🤖
- Capacitor App plugin integration
- Status bar handling
- Safe area insets
- Keyboard management

## 📂 File Structure

```
/planning/mobile-gesture-support/
├── README.md                       # This file
├── PLANNING.md                     # Detailed planning
├── IMPLEMENTATION_GUIDE.md         # Step-by-step implementation
├── CAPACITOR_INTEGRATION.md        # Capacitor specific setup
├── TESTING_CHECKLIST.md            # Testing guide
├── TECHNICAL_SPECS.md              # Technical specifications
└── ROLLBACK_GUIDE.md               # Rollback plan if needed
```

## 🛠️ Technology Stack

### Core Libraries
- **@capacitor/app** - Hardware back button, app lifecycle
- **@capacitor/haptics** - Vibration feedback
- **@capacitor/keyboard** - Keyboard events
- **@capacitor/status-bar** - Status bar styling
- **react-use-gesture** (optional) - Advanced gesture handling

### React Patterns
- Custom hooks (`useMobileBackButton`, `useSwipeGesture`)
- Context API untuk dialog stack management
- Event listeners untuk hardware events
- State management untuk gesture states

## 🎨 User Experience

### Android Back Button Behavior

```
Priority Stack (Top to Bottom):
1. Dialog yang paling atas (last opened)
2. Sheet yang terbuka
3. Drawer yang terbuka
4. Confirmation: "Press back again to exit"
5. Exit app
```

### Swipe Gestures

```
Swipe Down on Dialog Header:
- Dialog animates down and closes
- Backdrop fades out
- Smooth spring animation

Swipe From Left Edge:
- Navigate back (if applicable)
- Or trigger drawer open

Swipe From Right Edge:
- Quick actions (optional)
```

## 📋 Implementation Phases

### **Phase 1: Core Infrastructure** (Session 1)
- [x] Planning documentation
- [ ] Install Capacitor dependencies
- [ ] Create custom hooks structure
- [ ] Dialog stack management context
- [ ] Basic back button handling

**Estimasi:** 30-40 menit

### **Phase 2: Dialog Integration** (Session 2)
- [ ] Update AddExpenseDialog
- [ ] Update AddAdditionalIncomeDialog
- [ ] Update WishlistDialog
- [ ] Update TransferDialog
- [ ] Update ManagePocketsDialog

**Estimasi:** 40-50 menit

### **Phase 3: Swipe Gestures** (Session 3)
- [ ] Swipe-to-dismiss untuk dialogs
- [ ] Swipe animations
- [ ] Gesture conflicts resolution
- [ ] Touch target optimization

**Estimasi:** 30-40 menit

### **Phase 4: Native Polish** (Session 4)
- [ ] Haptic feedback
- [ ] Status bar handling
- [ ] Safe area insets
- [ ] Keyboard management
- [ ] Performance optimization

**Estimasi:** 20-30 menit

### **Phase 5: Testing & Documentation** (Session 5)
- [ ] Testing checklist completion
- [ ] Bug fixes
- [ ] Documentation
- [ ] Changelog

**Estimasi:** 20-30 menit

**Total Estimasi:** 2-3 jam

## 🔍 Key Components to Modify

### Dialog Components
```
✅ AddExpenseDialog.tsx
✅ AddAdditionalIncomeDialog.tsx
✅ WishlistDialog.tsx
✅ TransferDialog.tsx
✅ ManagePocketsDialog.tsx
```

### New Files to Create
```
🆕 /hooks/useMobileBackButton.ts
🆕 /hooks/useSwipeGesture.ts
🆕 /contexts/DialogStackContext.tsx
🆕 /utils/capacitor-helpers.ts
🆕 /utils/gesture-helpers.ts
```

### Files to Update
```
📝 App.tsx - Add DialogStackProvider
📝 /components/ui/dialog.tsx - Add swipe support
📝 /components/ui/sheet.tsx - Add swipe support
```

## ⚠️ Potential Challenges

### 1. **Gesture Conflicts**
- **Issue:** Swipe gestures conflict dengan scroll
- **Solution:** Detect gesture direction dan velocity
- **Mitigation:** Threshold-based detection

### 2. **Dialog Stack Management**
- **Issue:** Multiple dialogs open simultaneously
- **Solution:** Stack-based tracking dengan priority
- **Mitigation:** Dialog registry dengan unique IDs

### 3. **Animation Performance**
- **Issue:** Janky animations on low-end devices
- **Solution:** Use CSS transforms (GPU accelerated)
- **Mitigation:** Reduce animation complexity

### 4. **Capacitor Build**
- **Issue:** Different behavior di web vs native
- **Solution:** Feature detection
- **Mitigation:** Graceful degradation

## 🧪 Testing Strategy

### Manual Testing
- [ ] Hardware back button closes dialogs
- [ ] Back button priority correct
- [ ] Swipe down closes dialogs
- [ ] Smooth animations
- [ ] No gesture conflicts
- [ ] Haptic feedback works
- [ ] App exit confirmation

### Device Testing
- [ ] Test on real Android device
- [ ] Test pada berbagai screen sizes
- [ ] Test pada Android 10+
- [ ] Low-end device performance

### Automated Testing (Optional)
- [ ] Unit tests untuk hooks
- [ ] Integration tests untuk dialog stack
- [ ] E2E tests untuk gestures

## 📦 Dependencies

### Required
```json
{
  "@capacitor/app": "^6.0.0",
  "@capacitor/core": "^6.0.0",
  "@capacitor/haptics": "^6.0.0"
}
```

### Optional
```json
{
  "@capacitor/keyboard": "^6.0.0",
  "@capacitor/status-bar": "^6.0.0",
  "react-use-gesture": "^9.1.3"
}
```

### Build Tools
```json
{
  "@capacitor/cli": "^6.0.0",
  "@capacitor/android": "^6.0.0"
}
```

## 📊 Success Metrics

### User Experience
- ✅ Back button response time < 100ms
- ✅ Swipe gesture recognition rate > 95%
- ✅ Animation frame rate > 50fps
- ✅ No accidental app exits

### Technical
- ✅ Zero runtime errors
- ✅ < 5KB bundle size increase
- ✅ No performance regression
- ✅ Works on Android 10+

## 📚 Related Documentation

### Internal
- [App Overview](/docs/tracking-app-wiki/00-overview.md)
- [Architecture](/docs/tracking-app-wiki/01-architecture.md)
- [Component Docs](/docs/tracking-app-wiki/03-component-documentation.md)

### External
- [Capacitor App Plugin](https://capacitorjs.com/docs/apis/app)
- [Capacitor Haptics](https://capacitorjs.com/docs/apis/haptics)
- [Android Back Button Guidelines](https://developer.android.com/guide/navigation/navigation-custom-back)

## 🚀 Quick Start

Untuk mulai implementasi:

1. **Baca Planning:**
   ```bash
   cat /planning/mobile-gesture-support/PLANNING.md
   ```

2. **Follow Implementation Guide:**
   ```bash
   cat /planning/mobile-gesture-support/IMPLEMENTATION_GUIDE.md
   ```

3. **Setup Capacitor:**
   ```bash
   cat /planning/mobile-gesture-support/CAPACITOR_INTEGRATION.md
   ```

4. **Test Checklist:**
   ```bash
   cat /planning/mobile-gesture-support/TESTING_CHECKLIST.md
   ```

## 👥 Team Notes

- **Developer:** AI Assistant + User
- **Platform:** Android (via Capacitor)
- **Timeline:** 1-2 days
- **Risk Level:** Medium (native integration)

## 📝 Changelog

| Date | Update | Status |
|------|--------|--------|
| 2025-11-06 | Initial planning created | ✅ Done |
| TBD | Phase 1 implementation | 🔄 Pending |
| TBD | Phase 2 implementation | 🔄 Pending |
| TBD | Phase 3 implementation | 🔄 Pending |
| TBD | Phase 4 implementation | 🔄 Pending |
| TBD | Testing complete | 🔄 Pending |

## 🎯 Next Steps

1. ✅ Review this README
2. ⏭️ Read detailed PLANNING.md
3. ⏭️ Review IMPLEMENTATION_GUIDE.md
4. ⏭️ Setup Capacitor (CAPACITOR_INTEGRATION.md)
5. ⏭️ Start Phase 1 implementation

---

**Status:** 📋 Ready for Review
**Last Updated:** 6 November 2025
