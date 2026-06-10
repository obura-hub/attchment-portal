import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface UseInactivityTimerProps {
  logoutUrl: string;
  timeoutMinutes?: number;
  onLogout?: () => void;
}

export function useInactivityTimer({ 
  logoutUrl, 
  timeoutMinutes = 1, 
  onLogout 
}: UseInactivityTimerProps) {
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    timerRef.current = setTimeout(async () => {
      // Call logout API
      try {
        await fetch('/api/logout', { method: 'POST' });
      } catch (error) {
        console.error('Logout error:', error);
      }
      
      // Clear local storage
      localStorage.removeItem('adminLoggedIn');
      localStorage.removeItem('adminData');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
      
      // Call custom logout handler if provided
      if (onLogout) {
        onLogout();
      }
      
      // Redirect to login
      router.push(logoutUrl);
    }, timeoutMinutes * 60 * 1000);
  };

  useEffect(() => {
    // Set up event listeners for user activity
    const events = [
      'mousedown', 
      'keydown', 
      'scroll', 
      'touchstart', 
      'click',
      'mousemove'
    ];
    
    const handleActivity = () => {
      resetTimer();
    };
    
    // Initialize timer
    resetTimer();
    
    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });
    
    // Cleanup
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, []);
}