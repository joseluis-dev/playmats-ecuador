import { fetchCurrentUser } from "@/utils/authUtils";
import type { User } from "@clerk/astro/server";
import { create } from "zustand";

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
}

const currentUser = await fetchCurrentUser();

export const useUser = create<UserState>((set => ({
  user: currentUser,
  setUser: (user: User | null) => set({ user })
})));