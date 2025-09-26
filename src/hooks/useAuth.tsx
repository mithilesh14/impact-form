import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  company_id: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  loadingProgress: number;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  clearCache: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const { toast } = useToast();

  // Clear sensitive cache data
  const clearCache = useCallback(() => {
    try {
      // Clear localStorage items that might contain sensitive data
      const keysToRemove = [
        'supabase.auth.token',
        'sb-kgqgklcalmtdcbaqurhe-auth-token',
        'current-form-data',
        'user-preferences'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear any cookies (if using cookies for auth)
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }, []);

  const fetchUserProfile = async (userEmail: string) => {
    try {
      // Add timeout to profile fetch
      const profilePromise = supabase
        .from('users')
        .select('*')
        .eq('email', userEmail)
        .maybeSingle();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 8000)  
      );

      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any;
      
      if (error) {
        console.error('Profile fetch error:', error);
        setProfile(null);
        return null;
      }
      
      if (data) {
        setProfile(data);
        return data;
      } else {
        setProfile(null);
        return null;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {
    console.log('AuthProvider - Starting auth initialization');
    let mounted = true;
    
    // Progressive loading indicator
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 20;
      });
    }, 200);
    
    // Fallback timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.log('AuthProvider - Loading timeout reached, setting loading to false');
      if (mounted) {
        setLoadingProgress(100);
        setTimeout(() => setLoading(false), 300);
      }
    }, 5000);
    
    // Check for existing session first
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('AuthProvider - Initial session check:', { hasSession: !!session, email: session?.user?.email });
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user?.email) {
        console.log('AuthProvider - About to fetch profile for:', session.user.email);
        try {
          const profileResult = await fetchUserProfile(session.user.email);
          console.log('AuthProvider - Profile fetch completed, result:', profileResult);
          if (!profileResult) {
            console.log('AuthProvider - No profile found, clearing session');
            // If no profile found, clear the session
            await supabase.auth.signOut();
            setUser(null);
            setSession(null);
            setProfile(null);
          }
        } catch (error) {
          console.error('AuthProvider - Profile fetch failed:', error);
          console.log('AuthProvider - Clearing session due to profile fetch failure');
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setProfile(null);
        }
      } else {
        setProfile(null);
        console.log('AuthProvider - No session user, profile set to null');
      }
      
      console.log('AuthProvider - Setting loading to false after initial check');
      setLoadingProgress(100);
      setTimeout(() => setLoading(false), 300);
      clearTimeout(loadingTimeout);
      clearInterval(progressInterval);
    }).catch((error) => {
      console.error('AuthProvider - Error getting session:', error);
      if (mounted) {
        setLoadingProgress(100);
        setTimeout(() => setLoading(false), 300);
        clearTimeout(loadingTimeout);
        clearInterval(progressInterval);
      }
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('AuthProvider - Auth state change:', { event, hasSession: !!session });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only fetch profile if we don't already have one for this user
        if (session?.user?.email && (!profile || profile.email !== session.user.email)) {
          console.log('AuthProvider - Auth change: fetching profile for:', session.user.email);
          try {
            const profileResult = await fetchUserProfile(session.user.email);
            if (!profileResult) {
              console.log('AuthProvider - Auth change: No profile found, clearing session');
              await supabase.auth.signOut();
              return;
            }
          } catch (error) {
            console.error('AuthProvider - Auth change: Profile fetch failed:', error);
          }
        } else if (!session?.user) {
          setProfile(null);
        }
      }
    );

    return () => {
      console.log('AuthProvider - Cleanup');
      mounted = false;
      clearTimeout(loadingTimeout);
      clearInterval(progressInterval);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      }
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    // Clear cache before signing out
    clearCache();
    
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    setLoadingProgress(0);
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      loadingProgress,
      signIn,
      signOut,
      clearCache,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};