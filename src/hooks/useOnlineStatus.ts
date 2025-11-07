import { useState, useEffect } from 'react';
import { showOfflineNotification, showOnlineNotification } from '../utils/errorHandler';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      
      // Only show notification if user was previously offline
      if (wasOffline) {
        showOnlineNotification();
        setWasOffline(false);
      }
    }

    function handleOffline() {
      setIsOnline(false);
      setWasOffline(true);
      showOfflineNotification();
    }

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    if (!navigator.onLine) {
      handleOffline();
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return isOnline;
}
