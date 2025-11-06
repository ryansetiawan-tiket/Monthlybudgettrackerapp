# Mobile Gesture Support - Quick Reference

**Tanggal:** 6 November 2025  
**Version:** 1.0  
**Status:** 📋 Planning Complete

## 🎯 Quick Links

| Document | Purpose | Read Time |
|----------|---------|-----------|
| [README](./README.md) | Overview & structure | 5 min |
| [PLANNING](./PLANNING.md) | Detailed planning | 15 min |
| [IMPLEMENTATION_GUIDE](./IMPLEMENTATION_GUIDE.md) | Step-by-step guide | 20 min |
| [CAPACITOR_INTEGRATION](./CAPACITOR_INTEGRATION.md) | Capacitor setup | 15 min |
| [TESTING_CHECKLIST](./TESTING_CHECKLIST.md) | Testing guide | 10 min |
| [TECHNICAL_SPECS](./TECHNICAL_SPECS.md) | Technical details | 20 min |
| [ROLLBACK_GUIDE](./ROLLBACK_GUIDE.md) | Emergency rollback | 10 min |

---

## 🚀 Getting Started (5 min)

### Install Dependencies

```bash
npm install @capacitor/core @capacitor/app @capacitor/haptics
```

### Create Core Files

```bash
# Context
touch contexts/DialogStackContext.tsx

# Hooks
touch hooks/useMobileBackButton.ts
touch hooks/useDialogRegistration.ts
touch hooks/useSwipeGesture.ts

# Utils
touch utils/capacitor-helpers.ts
```

### Update App.tsx

```tsx
import { DialogStackProvider } from './contexts/DialogStackContext';
import { useMobileBackButton } from './hooks/useMobileBackButton';

function App() {
  useMobileBackButton();
  
  return (
    <DialogStackProvider>
      {/* existing app */}
    </DialogStackProvider>
  );
}
```

---

## 📱 Usage Examples

### Register Dialog to Stack

```tsx
import { useDialogRegistration } from '../hooks/useDialogRegistration';
import { DialogPriority } from '../constants';

function MyDialog({ isOpen, onOpenChange }) {
  // Register for back button handling
  useDialogRegistration(
    isOpen,
    onOpenChange,
    DialogPriority.MEDIUM,
    'my-dialog'
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {/* content */}
    </Dialog>
  );
}
```

### Trigger Haptic Feedback

```tsx
import { triggerHaptic } from '../utils/capacitor-helpers';

const handleClick = async () => {
  await triggerHaptic('light');
  // Do something
};
```

### Check if Capacitor

```tsx
import { isCapacitor, isPlatform } from '../utils/capacitor-helpers';

if (isCapacitor()) {
  // Native features available
}

if (isPlatform('android')) {
  // Android-specific code
}
```

---

## 🎨 Dialog Priority Levels

```tsx
export const DialogPriority = {
  LOW: 1,        // Sheets, drawers
  MEDIUM: 5,     // Main dialogs (default)
  HIGH: 10,      // Nested dialogs
  CRITICAL: 20   // Error dialogs
} as const;
```

**Rule:** Higher priority closes first on back button press.

---

## 📦 Files to Create

### Must Create

- ✅ `/contexts/DialogStackContext.tsx` - Stack management
- ✅ `/hooks/useMobileBackButton.ts` - Back button handler
- ✅ `/hooks/useDialogRegistration.ts` - Dialog registration
- ✅ `/hooks/useSwipeGesture.ts` - Swipe gesture detection
- ✅ `/utils/capacitor-helpers.ts` - Capacitor utilities

### Must Update

- ✅ `/App.tsx` - Add provider & hook
- ✅ `/constants/index.ts` - Add priority constants
- ✅ `/components/ui/dialog.tsx` - Add swipe support
- ✅ All dialog components - Add registration

---

## 🧪 Quick Test Commands

```bash
# Development
npm run dev

# Build
npm run build

# Capacitor sync
npx cap sync

# Open Android Studio
npx cap open android

# Full build & run
npm run build && npx cap sync && npx cap run android
```

---

## 🐛 Common Issues & Quick Fixes

### Issue: `window.Capacitor is undefined`

```tsx
// Always check first
if (typeof window !== 'undefined' && window.Capacitor) {
  // Use Capacitor
}
```

### Issue: Back button doesn't work

```bash
# Ensure plugin installed
npm install @capacitor/app
npx cap sync
```

### Issue: Haptics not working

```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.VIBRATE" />
```

### Issue: TypeScript errors

```bash
# Clear cache
rm -rf node_modules/.vite
npm install
npm run build
```

---

## 📊 Implementation Phases

| Phase | Time | Status |
|-------|------|--------|
| 1. Core Infrastructure | 40 min | 🔄 Pending |
| 2. Dialog Integration | 50 min | 🔄 Pending |
| 3. Swipe Gestures | 40 min | 🔄 Pending |
| 4. Polish & Testing | 30 min | 🔄 Pending |
| **Total** | **2-3 hours** | 🔄 Pending |

---

## ✅ Minimal Checklist

Before considering complete:

- [ ] All 5 hooks/contexts created
- [ ] App.tsx updated with provider
- [ ] All 5 dialogs registered
- [ ] Swipe support added to dialog.tsx
- [ ] Constants updated with priorities
- [ ] Builds without errors
- [ ] Tested in browser
- [ ] Tested on Android device
- [ ] Back button works
- [ ] Swipe gestures work
- [ ] No crashes

---

## 🎯 Key Components

### DialogStackContext

**Purpose:** Track all open dialogs with priority

```tsx
// Usage
const { registerDialog, closeTopDialog } = useDialogStack();
```

### useMobileBackButton

**Purpose:** Listen to Android back button, close dialogs

```tsx
// Usage (in App.tsx)
useMobileBackButton();
```

### useDialogRegistration

**Purpose:** Register dialog to stack when open

```tsx
// Usage (in any dialog)
useDialogRegistration(isOpen, onOpenChange, priority, id);
```

### useSwipeGesture

**Purpose:** Detect swipe gestures on dialogs

```tsx
// Usage
const { handleTouchStart, handleTouchMove, handleTouchEnd } = 
  useSwipeGesture({
    onSwipeDown: () => close(),
    threshold: 100
  });
```

---

## 🔍 Debugging Tips

### Enable Debug Logs

```tsx
// Set in .env
VITE_DEBUG=true

// Use in code
if (import.meta.env.VITE_DEBUG) {
  console.log('[Debug]', ...);
}
```

### Check Dialog Stack

```tsx
// In DialogStackContext
console.log('Current dialogs:', dialogs.map(d => d.id));
```

### Measure Performance

```tsx
console.time('BackButtonResponse');
closeTopDialog();
console.timeEnd('BackButtonResponse');
// Should be < 100ms
```

---

## 📱 Testing Shortcuts

### Browser (Quick Test)

1. Open app (localhost:5173)
2. Open dialog
3. Check console for registration log
4. Press Escape → should close
5. Check console for unregistration log

### Android (Quick Test)

1. Build: `npm run build && npx cap sync`
2. Run from Android Studio
3. Open dialog
4. Press back button → should close
5. No dialogs → Press back twice → should exit

---

## 🚨 Emergency Rollback

### Quick Rollback

```bash
# Git revert
git revert HEAD~1

# Or feature flag
# Set FEATURE_FLAGS.MOBILE_GESTURES = false
```

### Files to Remove

```bash
rm contexts/DialogStackContext.tsx
rm hooks/useMobileBackButton.ts
rm hooks/useDialogRegistration.ts
rm hooks/useSwipeGesture.ts
rm utils/capacitor-helpers.ts
```

See [ROLLBACK_GUIDE.md](./ROLLBACK_GUIDE.md) for details.

---

## 📚 Code Snippets

### Minimal DialogStackContext

```tsx
const DialogStackContext = createContext(null);

export function DialogStackProvider({ children }) {
  const [dialogs, setDialogs] = useState([]);
  
  const closeTopDialog = () => {
    const top = dialogs.sort((a,b) => b.priority - a.priority)[0];
    if (top) top.onClose();
  };

  return (
    <DialogStackContext.Provider value={{ closeTopDialog }}>
      {children}
    </DialogStackContext.Provider>
  );
}
```

### Minimal Back Button Hook

```tsx
export function useMobileBackButton() {
  const { closeTopDialog } = useDialogStack();

  useEffect(() => {
    if (!window.Capacitor) return;

    const handler = App.addListener('backButton', () => {
      closeTopDialog();
    });

    return () => handler.remove();
  }, [closeTopDialog]);
}
```

---

## 🎓 Learning Resources

### Capacitor
- [Capacitor Docs](https://capacitorjs.com/docs)
- [App Plugin API](https://capacitorjs.com/docs/apis/app)
- [Haptics Plugin API](https://capacitorjs.com/docs/apis/haptics)

### React Patterns
- [Context API](https://react.dev/reference/react/useContext)
- [Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [useEffect Cleanup](https://react.dev/reference/react/useEffect#cleanup)

### Android
- [Back Navigation](https://developer.android.com/guide/navigation/navigation-custom-back)
- [Touch Events](https://developer.android.com/develop/ui/views/touch-and-input/gestures)

---

## 💡 Pro Tips

### Tip 1: Use Feature Flags

Always implement new features behind feature flags for easy rollback:

```tsx
export const FEATURE_FLAGS = {
  MOBILE_GESTURES: true
};
```

### Tip 2: Log Everything (Dev Only)

Comprehensive logging helps debug issues:

```tsx
if (import.meta.env.DEV) {
  console.log('[Component] Action happened');
}
```

### Tip 3: Test on Real Device

Emulators don't always match real device behavior. Always test gestures on physical Android device.

### Tip 4: Gradual Rollout

Don't enable for all users immediately:
- 10% for 1 day
- 50% for 2 days
- 100% if no issues

### Tip 5: Have Rollback Ready

Always prepare rollback plan before implementing. See [ROLLBACK_GUIDE.md](./ROLLBACK_GUIDE.md).

---

## 📋 Status Tracking

### Implementation Progress

```
Phase 1: Core Infrastructure     [ ] 0/5 steps
Phase 2: Dialog Integration      [ ] 0/6 steps
Phase 3: Swipe Gestures         [ ] 0/2 steps
Phase 4: Polish & Testing       [ ] 0/3 steps
```

### Testing Progress

```
Browser Testing          [ ] 0/15 checks
Mobile Browser Testing   [ ] 0/12 checks
Android Native Testing   [ ] 0/18 checks
```

---

## 🎯 Success Criteria

- ✅ Back button closes dialogs
- ✅ Swipe down closes dialogs
- ✅ Correct priority handling
- ✅ Smooth animations (60fps)
- ✅ Haptic feedback works
- ✅ No crashes
- ✅ No performance regression

---

## 📞 Need Help?

### Internal Resources
- Review [PLANNING.md](./PLANNING.md) for detailed design
- Check [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for steps
- See [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) for testing

### External Resources
- Capacitor Discord
- Stack Overflow: `[capacitor] [react]`
- GitHub Issues

---

**Status:** ✅ Ready to Implement  
**Estimated Time:** 2-3 hours  
**Difficulty:** Medium  
**Risk:** Low (with rollback plan)

---

## 🔄 Quick Navigation

- **Start:** [README.md](./README.md)
- **Plan:** [PLANNING.md](./PLANNING.md)
- **Build:** [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
- **Test:** [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)
- **Rollback:** [ROLLBACK_GUIDE.md](./ROLLBACK_GUIDE.md)

**Last Updated:** 6 November 2025
