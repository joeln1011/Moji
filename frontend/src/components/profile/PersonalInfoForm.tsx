import { useState } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { User } from '@/types/user';
import { userService } from '@/services/userService';
import { useAuthStore } from '@/stores/useAuthStore';
import axios from 'axios';

type EditableField = {
  key: keyof Pick<User, 'displayName' | 'username' | 'email' | 'phone'>;
  label: string;
  type?: string;
};

const PERSONAL_FIELDS: EditableField[] = [
  { key: 'displayName', label: 'Display Name' },
  { key: 'username', label: 'Username' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'phone', label: 'Phone Number' },
];

type Props = {
  userInfo: User | null;
};

const PersonalInfoForm = ({ userInfo }: Props) => {
  const { setUser } = useAuthStore();
  const [formData, setFormData] = useState({
    displayName: userInfo?.displayName ?? '',
    username: userInfo?.username ?? '',
    email: userInfo?.email ?? '',
    phone: userInfo?.phone ?? '',
    bio: userInfo?.bio ?? '',
  });
  const [saving, setSaving] = useState(false);

  if (!userInfo) return null;

  const handleChange =
    (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedUser = await userService.updateProfile(formData);
      setUser(updatedUser);
      toast.success('Profile updated');
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? 'Failed to update profile')
        : 'Failed to update profile';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="glass-strong border-border/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="size-5 text-primary" />
          User Information
        </CardTitle>
        <CardDescription>
          Update your personal details and profile information
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PERSONAL_FIELDS.map(({ key, label, type }) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                type={type ?? 'text'}
                value={formData[key]}
                onChange={handleChange(key)}
                className="glass-light border-border/30"
              />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            rows={3}
            value={formData.bio}
            onChange={handleChange('bio')}
            className="glass-light border-border/30 resize-none"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full md:w-auto bg-gradient-primary hover:opacity-90 transition-opacity"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoForm;
