import { create } from "zustand";

import {
  clearAuthSession,
  readAuthUser,
  writeAuthSession,
  writeAuthUser,
} from "@/services/auth_storage";
import type { ApiUser } from "@/types/auth";

export interface UserStore {
  user: ApiUser | null;
  setSession: (token: string, user: ApiUser, rememberMe: boolean) => void;
  setUser: (user: ApiUser) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: readAuthUser(),
  setSession: (token, user, rememberMe) => {
    writeAuthSession(token, user, rememberMe);
    set({ user });
  },
  setUser: (user) => {
    writeAuthUser(user);
    set({ user });
  },
  clearUser: () => {
    clearAuthSession();
    set({ user: null });
  },
}));

export const selectUser = (state: UserStore): ApiUser | null => state.user;

export const selectIsAuthenticated = (state: UserStore): boolean =>
  state.user !== null;
