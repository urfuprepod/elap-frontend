import { create } from "zustand";

interface IUser {
    id: string;
    email: string;
    login: string;
    authorities: { authority: string }[];
    mentor: IUser | null
}

interface IUserState {
    user?: IUser | null;
    updateUser: (user?: IUser) => void;
}

export const useUserState = create<IUserState>((set, get) => ({
    user: null,
    updateUser: (user) => {
        set({ user: user ?? null });
    },
}));

export const authStore = useUserState;
