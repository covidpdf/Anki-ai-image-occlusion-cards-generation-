import { useEffect, useState } from 'react';
import { isOnline } from '../services/serviceWorkerManager';
import '../styles/OfflineIndicator.css';

export function OfflineIndicator(): JSX.Element {
  const [online, setOnline] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    // Check initial online status
    isOnline().then((status) => {
      setOnline(status);
    });

    // Listen for online/offline events
    const handleOnline = () => {
      setOnline(true);
      // Hide indicator after 3 seconds when coming back online
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showIndicator && online) {
    return <></>;
  }

  return (
    <div className={`offline-indicator ${online ? 'online' : 'offline'}`}>
      <span className="indicator-dot"></span>
      <span className="indicator-text">{online ? 'Back online' : 'You are offline'}</span>
    </div>
  );
}
