import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface UseInactivityTimerProps {
  timeout?: number; // in milliseconds, default 10 minutes
  warningTime?: number; // warning time before logout, default 2 minutes
}

export const useInactivityTimer = ({ 
  timeout = 10 * 60 * 1000, // 10 minutes
  warningTime = 2 * 60 * 1000 // 2 minutes
}: UseInactivityTimerProps = {}) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<number>(Date.now());

  const saveProgress = useCallback(async () => {
    // Save any unsaved progress here
    // This could save form data, current page state, etc.
    try {
      const currentPage = window.location.pathname;
      const formData = localStorage.getItem('current-form-data');
      
      if (formData) {
        // Save to a more permanent location or mark as draft
        localStorage.setItem('draft-form-data', formData);
        localStorage.setItem('draft-page', currentPage);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await saveProgress();
    await signOut();
    toast({
      title: "Session expired",
      description: "You've been logged out due to inactivity. Your progress has been saved.",
      variant: "destructive",
    });
  }, [saveProgress, signOut, toast]);

  const showWarning = useCallback(() => {
    toast({
      title: "Session expiring soon",
      description: "You'll be logged out in 2 minutes due to inactivity. Move your mouse to stay logged in.",
      variant: "destructive",
    });
  }, [toast]);

  const resetTimer = useCallback(() => {
    if (!user) return;

    lastActivityRef.current = Date.now();

    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    // Set warning timer
    warningRef.current = setTimeout(() => {
      showWarning();
    }, timeout - warningTime);

    // Set logout timer
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, timeout);
  }, [user, timeout, warningTime, showWarning, handleLogout]);

  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Initialize timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [user, resetTimer]);

  return {
    lastActivity: lastActivityRef.current,
    resetTimer,
  };
};