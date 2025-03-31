import { create } from 'zustand';

interface IUser {
  id: string;
  email: string;
  name: string | null;
}

interface UserState {
  user: IUser | null;
  setUser: (user: IUser) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
