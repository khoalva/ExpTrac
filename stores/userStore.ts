import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isOnboardingCompleted: boolean;
  isDarkMode: boolean;
  isNotificationsEnabled: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
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
      isAuthenticated: false,
      isOnboardingCompleted: false,
      isDarkMode: false,
      isNotificationsEnabled: false,
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      login: async (email, password) => {
        // In a real app, this would make an API call
        // For demo purposes, we'll simulate a successful login
        if (email && password) {
          const mockUser: User = {
            id: '1',
            name: '3KIT',
            email: '3KIT@gmail.com',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1180&q=80',
          };
          
          set({ user: mockUser, isAuthenticated: true });
          return true;
        }
        return false;
      },
      
      logout: () => set({ user: null, isAuthenticated: false }),
      
      completeOnboarding: () => set({ isOnboardingCompleted: true }),
      
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      
      toggleNotifications: (enabled) => set({ isNotificationsEnabled: enabled }),
      
      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null,
      })),
    }),
    {
      name: 'exptrac-user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);