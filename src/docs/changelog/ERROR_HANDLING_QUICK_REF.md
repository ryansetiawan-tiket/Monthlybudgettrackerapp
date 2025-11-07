# Error Handling - Quick Reference

## 🎯 Toast Position
```tsx
// Toast now at top-center with 60px margin for header
position="top-center"
```

## 🛡️ Error Boundary
```tsx
// Wrap app with ErrorBoundary
<ErrorBoundary>
  <YourApp />
</ErrorBoundary>
```

## 📱 Error Handling in Code

### Basic Usage
```tsx
import { handleError } from '../utils/errorHandler';

try {
  await fetchData();
} catch (error) {
  handleError(error, "Context message");
}
```

### With Retry
```tsx
import { retryWithBackoff } from '../utils/errorHandler';

const data = await retryWithBackoff(
  async () => await fetchData(),
  3, // retries
  1000 // delay
);
```

### Online Status
```tsx
import { useOnlineStatus } from '../hooks/useOnlineStatus';

function App() {
  useOnlineStatus(); // Auto-monitors connection
}
```

## 🎨 Error UI Components

### Full Error Page
```tsx
<ErrorFallback
  error={error}
  type="network" // or "database" or "unknown"
  onRetry={handleRetry}
/>
```

### Error Types
- `network` - Orange, WiFi icon
- `database` - Red, Alert icon  
- `unknown` - Default color

## ⚡ Key Features

✅ **Auto-Retry:** 3 attempts with exponential backoff  
✅ **Toast Position:** Top-center, never hidden  
✅ **Offline Detection:** Automatic with persistent toast  
✅ **Online Detection:** Success toast with refresh  
✅ **Retry Buttons:** On all recoverable errors  
✅ **Context Messages:** Clear, user-friendly

## 🔧 Common Patterns

### Network Request
```tsx
try {
  const response = await fetch(url);
  if (!response.ok) throw response;
  return await response.json();
} catch (error) {
  handleError(error, "Gagal memuat data");
}
```

### Check Connection
```tsx
if (!navigator.onLine) {
  toast.error('Tidak ada koneksi internet');
  return;
}
```

### Manual Toast with Retry
```tsx
toast.error('Error occurred', {
  duration: 5000,
  action: {
    label: 'Coba Lagi',
    onClick: () => window.location.reload()
  }
});
```

## 📊 Error Flow

1. **Error occurs** → Caught by try-catch
2. **Parse error** → Determine type (network/db/unknown)
3. **Show toast** → Top-center with context
4. **Auto-retry** → If network error (3x)
5. **User action** → Retry button available
6. **Log console** → For debugging

## 🎯 Testing

- Disconnect internet → See offline toast
- Reconnect → See online toast  
- Throw error in component → See error boundary
- Network timeout → See retry toast
- Database error → See error message

## 📁 Files

- `/components/ErrorBoundary.tsx` - React error boundary
- `/components/ErrorFallback.tsx` - Error UI component
- `/utils/errorHandler.ts` - Error utilities
- `/hooks/useOnlineStatus.ts` - Online monitoring
- `/components/ui/sonner.tsx` - Toast config
