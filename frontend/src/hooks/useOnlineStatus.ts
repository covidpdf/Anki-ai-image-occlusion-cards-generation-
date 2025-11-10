import { useEffect, useState } from 'react';

export function useOnlineStatus(): {
  isOnline: boolean;
  isLoading: boolean;
} {
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set initial status
    setIsOnline(navigator.onLine);
    setIsLoading(false);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, isLoading };
}
