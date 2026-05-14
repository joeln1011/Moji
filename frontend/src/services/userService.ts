import api from '@/lib/axios';
import type { User } from '@/types/user';

type ProfileUpdate = Partial<Pick<User, 'displayName' | 'username' | 'email' | 'phone' | 'bio'>>;

export const userService = {
  updateProfile: async (data: ProfileUpdate): Promise<User> => {
    const res = await api.patch('/users/me', data);
    return res.data.user;
  },

  uploadAvatar: async (formData: FormData) => {
    const res = await api.post('/users/uploadAvatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (res.status === 400) {
      throw new Error(res.data.message);
    }

    return res.data;
  },
};
