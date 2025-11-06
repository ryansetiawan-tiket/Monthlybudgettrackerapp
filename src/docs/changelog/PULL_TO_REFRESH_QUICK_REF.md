# 🔄 Pull-to-Refresh - Quick Reference

## TL;DR

**What:** Native-like pull-to-refresh gesture untuk mobile  
**How:** Swipe down dari atas halaman saat scrollY = 0  
**Where:** Mobile only, semua halaman  
**Status:** ✅ COMPLETE

---

## 🚀 Quick Usage

### 1. Import Hook & Component
```typescript
import { usePullToRefresh } from './hooks/usePullToRefresh';
import { PullToRefreshIndicator } from './components/PullToRefreshIndicator';
import { useIsMobile } from './components/ui/use-mobile';
```

### 2. Setup Hook
```typescript
const isMobile = useIsMobile();

const pullState = usePullToRefresh({
  onRefresh: async () => {
    await fetchData();
    toast.success('Data updated!');
  },
  enabled: isMobile,
});
```

### 3. Render Indicator
```typescript
{isMobile && (
  <PullToRefreshIndicator
    isPulling={pullState.isPulling}
    isRefreshing={pullState.isRefreshing}
    pullDistance={pullState.pullDistance}
    progress={pullState.progress}
    shouldTriggerRefresh={pullState.shouldTriggerRefresh}
  />
)}
```

---

## 🎯 User Experience

| Step | Action | Visual | Haptic |
|------|--------|--------|--------|
| 1 | At top, swipe down | ChevronDown appears | Light |
| 2 | Pull < 80px | Progress ring fills | - |
| 3 | Pull >= 80px | Icon → RefreshCw | Medium |
| 4 | Release | Spinner rotates | Heavy |
| 5 | Complete | Toast notification | - |

---

## ⚙️ Configuration

### Default Settings
```typescript
{
  threshold: 80,           // Pixels to trigger
  maxPullDistance: 120,    // Maximum pull
  resistance: 0.5,         // Pull feel (0-1)
  enabled: true            // Active state
}
```

### Custom Settings
```typescript
// Easy Trigger
{ threshold: 60, resistance: 0.7 }

// Hard Trigger
{ threshold: 100, resistance: 0.3 }

// Long Pull
{ maxPullDistance: 150 }
```

---

## 📱 Platform Support

| Platform | Status | Notes |
|----------|--------|-------|
| Android Chrome | ✅ Full | All features work |
| iOS Safari | ✅ Full | Haptics may vary |
| Desktop | ❌ Disabled | Intentional |
| Capacitor | ✅ Full | Native haptics |

---

## 🎨 Visual States

```
IDLE:           (Nothing shown)

PULLING:        ↓ ChevronDown
                ● Progress ring: 0-99%

READY:          🔄 RefreshCw (180° rotated)
                ● Progress ring: 100%

REFRESHING:     🔄 RefreshCw (spinning)
                ○ No ring
```

---

## 🐛 Common Issues

**Q: Pull not activating?**  
A: Pastikan scrollY = 0. Scroll ke paling atas dulu.

**Q: Multiple refreshes?**  
A: Hook sudah prevent ini. Cek `isRefreshing` state.

**Q: Laggy animations?**  
A: Event listeners sudah optimized. Cek network tab.

**Q: Works on desktop?**  
A: No. Mobile only by design. Use Ctrl+R on desktop.

---

## 📊 Performance

| Metric | Value |
|--------|-------|
| Bundle Size | ~2KB |
| Dependencies | 0 (uses Motion) |
| Event Listeners | 3 (optimized) |
| API Calls | Parallel (Promise.all) |
| Min Refresh Duration | 500ms |

---

## ✅ Testing Quick Checklist

```
[ ] Pull at top → Activates
[ ] Pull not at top → Ignored
[ ] Pull < threshold → No refresh
[ ] Pull >= threshold → Triggers refresh
[ ] Haptic feedback works
[ ] Data actually updates
[ ] Toast shows on success
[ ] Works with sticky header
```

---

## 📂 Files

```
NEW:
  /hooks/usePullToRefresh.ts
  /components/PullToRefreshIndicator.tsx

MODIFIED:
  /App.tsx
```

---

## 🔧 Integration Example

```typescript
// App.tsx
const handlePullToRefresh = async () => {
  await Promise.all([
    fetchBudgetData(year, month),
    fetchPockets(year, month),
    loadExcludeState(year, month),
  ]);
  refreshPockets();
  toast.success('Data berhasil diperbarui');
};

const pullState = usePullToRefresh({
  onRefresh: handlePullToRefresh,
  enabled: isMobile,
});

return (
  <>
    {isMobile && <PullToRefreshIndicator {...pullState} />}
    <YourContent />
  </>
);
```

---

## 🎯 Key Points

✅ **Mobile-only** - Tidak aktif di desktop  
✅ **Top-only** - Hanya aktif saat scrollY = 0  
✅ **Haptic feedback** - Native feel dengan vibration  
✅ **Parallel refresh** - Semua data di-fetch bersamaan  
✅ **Smooth animations** - Spring physics dari Motion  
✅ **Toast notification** - User feedback setelah refresh  

---

## 📖 Full Docs

👉 [PULL_TO_REFRESH_IMPLEMENTATION.md](./PULL_TO_REFRESH_IMPLEMENTATION.md)

---

**Last Updated:** November 7, 2025  
**Status:** ✅ Production Ready
