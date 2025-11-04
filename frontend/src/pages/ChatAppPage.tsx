import SignOut from '@/components/auth/signout';
import { Button } from '@/components/ui/button';
import api from '@/lib/axios';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';

const ChatAppPage = () => {
  const { user } = useAuthStore();
  const handleOnClick = async () => {
    try {
      await api.get('/users/test', { withCredentials: true });
      toast.success('Test API call successful');
    } catch (error) {
      console.error(error);
      toast.error('Test API call failed');
      console.error(error);
    }
  };
  return (
    <div>
      {user?.username}
      <SignOut />
      <Button onClick={handleOnClick}>Test</Button>
    </div>
  );
};

export default ChatAppPage;
