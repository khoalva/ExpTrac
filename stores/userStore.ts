import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@/types";
import { login, register } from "@/service/online/AuthService";
import { getUser } from "@/service/online/UserService";
import { db } from "@/service/database";
interface UserState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isOnboardingCompleted: boolean;
    isDarkMode: boolean;
    isNotificationsEnabled: boolean;

    // Actions
    setUser: (user: User | null) => void;
    login: (email: string, password: string) => Promise<boolean>;
    register: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    completeOnboarding: () => void;
    toggleDarkMode: () => void;
    toggleNotifications: (enabled: boolean) => void;
    updateUser: (userData: Partial<User>) => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isOnboardingCompleted: false,
            isDarkMode: false,
            isNotificationsEnabled: false,

            setUser: (user) => set({ user, isAuthenticated: !!user }),

            login: async (email, password) => {
                const user = await login(email, password);
                if (user) {
                    if (!user.email) {
                        user.email = "3KIT@gmail.com";
                    }
                    if (!user.name) {
                        user.name = "3KIT";
                    }
                    if (!user.avatar) {
                        user.avatar =
                            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1180&q=80";
                    }

                    set({ user, token: user.token, isAuthenticated: true });
                    return true;
                }
                // if (email && password) {
                //     const mockUser: User = {
                //         id: "1",
                //         name: "3KIT",
                //         email: "3KIT@gmail.com",
                //         avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1180&q=80",
                //     };

                //     set({ user: mockUser, isAuthenticated: true });
                //     return true;
                // }
                return false;
            },

            register: async (email, password) => {
                const user = await register(email, password);
                if (user) {
                    set({ user, token: user.token, isAuthenticated: true });
                    return true;
                }
                return false;
            },

            logout: () => {
                // This would later reset the local sqlite database
                console.log("Clearing database");
                db.clearDatabase();

                set({ user: null, token: null, isAuthenticated: false });
            },

            completeOnboarding: () => set({ isOnboardingCompleted: true }),

            toggleDarkMode: () =>
                set((state) => ({ isDarkMode: !state.isDarkMode })),

            toggleNotifications: (enabled) =>
                set({ isNotificationsEnabled: enabled }),

            updateUser: (userData) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...userData } : null,
                })),
        }),
        {
            name: "exptrac-user-storage",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
