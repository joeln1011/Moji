import { useChatStore } from '@/stores/useChatStore';
import ChatWelcomeScreen from './ChatWelcomeScreen';
import ChatWindowSkeleton from '../skeleton/ChatWindowSkeleton';
import { SidebarInset } from '../ui/sidebar';
import ChatWindowHeader from './ChatWindowHeader';
import ChatWindowBody from './ChatWindowBody';
import MessageInput from './MessageInput';

const ChatWindowLayout = () => {
  const {
    activeConversationId,
    conversations,
    messageLoading: loading,
  } = useChatStore();

  const selectedconvo =
    conversations.find((c) => c._id === activeConversationId) ?? null;

  if (!selectedconvo) {
    return <ChatWelcomeScreen />;
  }

  if (loading) {
    return <ChatWindowSkeleton />;
  }

  return (
    <SidebarInset className="flex flex-col flex-1 h-full overflow-hidden rounded-sm shadow-md">
      {/* Header */}
      <ChatWindowHeader chat={selectedconvo} />

      {/* Body */}
      <div className="flex-1 overflow-y-auto bg-primary-foreground">
        <ChatWindowBody />
      </div>

      {/* Footer */}
      <MessageInput selectedConvo={selectedconvo} />
    </SidebarInset>
  );
};

export default ChatWindowLayout;
