import { create } from 'zustand';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import type { AuthState } from '@/types/store';

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  loading: false,
  clearState: () => set({ accessToken: null, user: null, loading: false }),

  signUp: async (username, password, email, firstName, lastName) => {
    try {
      set({ loading: true });
      // Call API
      await authService.signUp(username, password, email, firstName, lastName);
      toast.success('Signed up successfully');
    } catch (error) {
      console.error(error);
      toast.error('Sign up failed');
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (username, password) => {
    try {
      set({ loading: true });
      // Call API
      const { accessToken } = await authService.signIn(username, password);
      set({ accessToken });
      await get().fetchMe();
      toast.success('Signed in successfully');
    } catch (error) {
      console.error(error);
      toast.error('Sign in failed');
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      get().clearState();
      await authService.signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error(error);
      toast.error('Sign out failed');
    }
  },

  fetchMe: async () => {
    try {
      set({ loading: true });
      const user = await authService.fetchMe();
      set({ user });
    } catch (error) {
      console.error(error);
      set({ user: null, accessToken: null });
      toast.error('Session expired. Please sign in again.');
    } finally {
      set({ loading: false });
    }
  },
}));
