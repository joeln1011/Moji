import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router';

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
  return <Button onClick={handleSignOut}>Sign Out</Button>;
};

export default SignOut;
