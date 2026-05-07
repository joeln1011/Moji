import { useChatStore } from '@/stores/useChatStore';
import ChatWelcomeScreen from './ChatWelcomeScreen';
import MessageItem from './MessageItem';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

const ChatWindowBody = () => {
  const {
    activeConversationId,
    conversations,
    messages: allMessages,
  } = useChatStore();

  const [lastMessageStatus, setLastMessageStatus] = useState<
    'delivered' | 'seen'
  >('delivered');

  const messages = allMessages[activeConversationId!]?.items ?? [];
  const hasMore = allMessages[activeConversationId!]?.hasMore ?? false;
  const selectedConvo = conversations.find(
    (c) => c._id === activeConversationId,
  );

  //ref
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const lastMessage = selectedConvo?.lastMessage;
    if (!lastMessage) {
      return;
    }
    const seenBy = selectedConvo?.seenBy ?? [];
    setLastMessageStatus(seenBy.length > 0 ? 'seen' : 'delivered');
  }, [selectedConvo]);

  // scroll to bottom when messages change
  useLayoutEffect(() => {
    if (!messagesEndRef.current) {
      return;
    }
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [activeConversationId]);

  if (!selectedConvo) {
    return <ChatWelcomeScreen />;
  }

  if (!messages?.length) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No messages
      </div>
    );
  }
  return (
    <div className="p-4 bg-primary-foreground. h-full flex flex-col overflow-hidden">
      <div
        id="scrollableDiv"
        className="flex flex-col overflow-y-auto overflow-x-hidden beautifull-scrollbar"
      >
        <InfiniteScroll
          dataLength={messages.length}
          next={() => console.log('Loading...')}
          hasMore={hasMore}
          scrollableTarget="scrollableDiv"
          loader={<p>Loading....</p>}
        >
          {messages.map((message, index) => (
            <MessageItem
              key={message._id ?? index}
              message={message}
              index={index}
              messages={messages}
              selectedConvo={selectedConvo}
              lastMessageStatus={lastMessageStatus}
            />
          ))}
        </InfiniteScroll>
        <div ref={messagesEndRef}></div>
      </div>
    </div>
  );
};

export default ChatWindowBody;
