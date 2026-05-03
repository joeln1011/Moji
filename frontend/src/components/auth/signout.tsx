import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router';
import { LogOut } from 'lucide-react';

const SignOut = () => {
  const { signOut } = useAuthStore();
  const navigate = useNavigate();
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  return (
    <Button variant="completeGhost" onClick={handleSignOut}>
      <LogOut className="text-destructive" />
      Sign out
    </Button>
  );
};

export default SignOut;
