import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const LogoutButton = () => {
  const { signOut } = useAuth();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={signOut}
      className="hover:bg-secondary/50"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Logout
    </Button>
  );
};

export default LogoutButton;