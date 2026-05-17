import api from '@/lib/axios';
import type { ConversationResponse, Message } from '@/types/chat';

interface FetchMessageProps {
  messages: Message[];
  cursor?: string;
}
const pageLimit = 50;
export const chatService = {
  async fetchConversations(): Promise<ConversationResponse> {
    const res = await api.get('/conversations');
    return res.data;
  },

  async fetchMessages(id: string, cursor?: string): Promise<FetchMessageProps> {
    const res = await api.get(
      `/conversations/${id}/messages?limit=${pageLimit}&cursor=${cursor}`,
    );
    return { messages: res.data.messages, cursor: res.data.nextCursor };
  },

  async sendDirectMessage(
    recipientId: string,
    content: string,
    image?: File,
    conversationId?: string,
  ) {
    const formData = new FormData();
    formData.append('recipientId', recipientId);
    if (content) formData.append('content', content);
    if (image) formData.append('image', image);
    if (conversationId) formData.append('conversationId', conversationId);
    const res = await api.post('/messages/direct', formData);
    return res.data;
  },

  async sendGroupMessage(
    conversationId: string,
    content: string = '',
    image?: File,
  ) {
    const formData = new FormData();
    formData.append('conversationId', conversationId);
    if (content) formData.append('content', content);
    if (image) formData.append('image', image);
    const res = await api.post('/messages/group', formData);
    return res.data;
  },

  async markAsSeen(conversationId: string) {
    const res = await api.patch(`/conversations/${conversationId}/seen`);
    return res.data;
  },

  async createConversation(
    type: 'direct' | 'group',
    name: string,
    memberIds: string[],
  ) {
    const res = await api.post('/conversations', {
      type,
      name,
      memberIds,
    });
    return res.data.conversation;
  },
};
