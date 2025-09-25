import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserProfile = async (userEmail: string) => {
    try {
      console.log('Fetching profile for email:', userEmail);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', userEmail)
        .maybeSingle();

      console.log('Profile fetch result:', { data, error });
      
      if (error) {
        console.error('Profile fetch error:', error);
        throw error;
      }
      
      console.log('Setting profile data:', data);
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {
    console.log('AuthProvider - Starting auth initialization');
    let mounted = true;
    
    // Fallback timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.log('AuthProvider - Loading timeout reached, setting loading to false');
      if (mounted) {
        setLoading(false);
      }
    }, 5000);
    
    // Check for existing session first
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('AuthProvider - Initial session check:', { hasSession: !!session, email: session?.user?.email });
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user?.email) {
        await fetchUserProfile(session?.user?.email);
      } else {
        setProfile(null);
      }
      
      console.log('AuthProvider - Setting loading to false after initial check');
      setLoading(false);
      clearTimeout(loadingTimeout);
    }).catch((error) => {
      console.error('AuthProvider - Error getting session:', error);
      if (mounted) {
        setLoading(false);
        clearTimeout(loadingTimeout);
      }
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('AuthProvider - Auth state change:', { event, hasSession: !!session });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user?.email) {
          await fetchUserProfile(session.user.email);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      console.log('AuthProvider - Cleanup');
      mounted = false;
      clearTimeout(loadingTimeout);
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
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
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
      signIn,
      signOut,
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