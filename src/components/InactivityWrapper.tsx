import { ReactNode } from 'react';
import { useInactivityTimer } from '@/hooks/useInactivityTimer';
import { useAuth } from '@/hooks/useAuth';

interface InactivityWrapperProps {
  children: ReactNode;
}

const InactivityWrapper = ({ children }: InactivityWrapperProps) => {
  const { user } = useAuth();
  
  // Only activate inactivity timer for authenticated users
  useInactivityTimer({
    timeout: 10 * 60 * 1000, // 10 minutes
    warningTime: 2 * 60 * 1000, // 2 minutes warning
  });

  return <>{children}</>;
};

export default InactivityWrapper;