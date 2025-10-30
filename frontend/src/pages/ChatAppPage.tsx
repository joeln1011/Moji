import SignOut from '@/components/auth/signout';
import { useAuthStore } from '@/stores/useAuthStore';

const ChatAppPage = () => {
  const { user } = useAuthStore();
  return (
    <div>
      {user?.username}
      <SignOut />
    </div>
  );
};

export default ChatAppPage;
