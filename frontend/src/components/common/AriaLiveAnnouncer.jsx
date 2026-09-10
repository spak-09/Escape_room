import React, { useState, useEffect } from 'react';

/**
 * AriaLiveAnnouncer Component
 * Global off-screen live region container that announces dynamic game events to assistive tech.
 */
export default function AriaLiveAnnouncer() {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');

  useEffect(() => {
    const handleAnnounce = (e) => {
      const { message, priority } = e.detail || {};
      if (!message) return;

      if (priority === 'assertive') {
        setAssertiveMessage(message);
        // Clear message shortly after to allow repeating identical announcements
        setTimeout(() => setAssertiveMessage(''), 1000);
      } else {
        setPoliteMessage(message);
        setTimeout(() => setPoliteMessage(''), 1000);
      }
    };

    window.addEventListener('facility:announce', handleAnnounce);
    return () => window.removeEventListener('facility:announce', handleAnnounce);
  }, []);

  return (
    <div className="sr-only" aria-atomic="true">
      <div role="status" aria-live="polite">
        {politeMessage}
      </div>
      <div role="alert" aria-live="assertive">
        {assertiveMessage}
      </div>
    </div>
  );
}
