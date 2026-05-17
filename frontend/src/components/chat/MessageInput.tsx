import { useAuthStore } from '@/stores/useAuthStore';
import type { Conversation } from '@/types/chat';
import { useRef, useState } from 'react';
import { Button } from '../ui/button';
import { ImagePlus, Send, X } from 'lucide-react';
import { Input } from '../ui/input';
import EmojiPicker from './EmojiPicker';
import { useChatStore } from '@/stores/useChatStore';
import { toast } from 'sonner';

const MessageInput = ({ selectedConvo }: { selectedConvo: Conversation }) => {
  const { user } = useAuthStore();
  const { sendDirectMessage, sendGroupMessage } = useChatStore();
  const [value, setValue] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImage(null);
    setImagePreview(null);
  };

  const sendMessage = async () => {
    if (!value.trim() && !image) return;
    const currValue = value;
    const currImage = image ?? undefined;
    setValue('');
    removeImage();

    try {
      if (selectedConvo.type === 'direct') {
        const participants = selectedConvo.participants;
        const otherUser = participants.filter((p) => p._id !== user._id)[0];
        await sendDirectMessage(otherUser._id, currValue, currImage);
      } else {
        await sendGroupMessage(selectedConvo._id, currValue, currImage);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col gap-2 p-3 bg-background">
      {imagePreview && (
        <div className="relative w-fit">
          <img
            src={imagePreview}
            alt="preview"
            className="max-h-32 rounded-lg object-cover"
          />
          <Button
            variant="secondary"
            size="icon"
            className="absolute -top-2 -right-2 size-5 rounded-full"
            onClick={removeImage}
          >
            <X className="size-3" />
          </Button>
        </div>
      )}
      <div className="flex items-center gap-2 min-h-9">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-primary/10 transition-smooth"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus className="size-4" />
        </Button>

        <div className="flex-1 relative">
          <Input
            onKeyDown={handleKeyPress}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Write a message..."
            className="pr-20 h-9 bg-white border-boder/50 focus:border-primary/50 transition-smooth resize-none"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="size-8 hover:bg-primary/10 transition-smooth"
            >
              <EmojiPicker
                onChange={(emoji: string) => setValue(`${value}${emoji}`)}
              />
            </Button>
          </div>
        </div>
        <Button
          onClick={sendMessage}
          className="bg-gradient-chat hover:shadow-glow transition-smooth hover:scale-105"
          disabled={!value.trim() && !image}
        >
          <Send className="size-4 text-white" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
