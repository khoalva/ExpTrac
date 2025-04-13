import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification } from '@/types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'date'>) => string;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Getters
  getUnreadNotifications: () => Notification[];
  getNotificationsByType: (type: Notification['type']) => Notification[];
  
  // Initialize with sample notifications
  initializeSampleNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      
      addNotification: (notification) => {
        const id = Date.now().toString();
        const newNotification: Notification = {
          ...notification,
          id,
          read: false,
          date: new Date(),
        };
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
        
        return id;
      },
      
      markAsRead: (id) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === id);
          if (notification && !notification.read) {
            return {
              notifications: state.notifications.map(n => 
                n.id === id ? { ...n, read: true } : n
              ),
              unreadCount: Math.max(0, state.unreadCount - 1),
            };
          }
          return state;
        });
      },
      
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },
      
      deleteNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === id);
          return {
            notifications: state.notifications.filter(n => n.id !== id),
            unreadCount: notification && !notification.read 
              ? Math.max(0, state.unreadCount - 1) 
              : state.unreadCount,
          };
        });
      },
      
      clearAllNotifications: () => {
        set({ notifications: [], unreadCount: 0 });
      },
      
      getUnreadNotifications: () => {
        return get().notifications.filter(n => !n.read);
      },
      
      getNotificationsByType: (type) => {
        return get().notifications.filter(n => n.type === type);
      },
      
      initializeSampleNotifications: () => {
        const { notifications } = get();
        
        if (notifications.length === 0) {
          const sampleNotifications: Omit<Notification, 'id' | 'read' | 'date'>[] = [
            {
              title: 'Food',
              message: 'You just paid your food bill',
              type: 'reminder',
            },
            {
              title: 'Reminder',
              message: 'Reminder to pay your rent',
              type: 'reminder',
            },
            {
              title: 'Goal Achieved',
              message: 'You just achieved your goal for new bike',
              type: 'success',
            },
            {
              title: 'Reminder',
              message: 'You just set a new reminder shopping',
              type: 'reminder',
            },
            {
              title: 'Bill',
              message: 'You just got a reminder for your bill pay',
              type: 'alert',
            },
            {
              title: 'Uber',
              message: 'You just paid your uber bill',
              type: 'reminder',
            },
          ];
          
          // Add sample notifications with different timestamps
          const now = new Date();
          sampleNotifications.forEach((notification, index) => {
            const pastDate = new Date(now);
            // Set different times for each notification
            pastDate.setMinutes(now.getMinutes() - (index * 15 + 5));
            
            const id = Date.now().toString() + index;
            const newNotification: Notification = {
              ...notification,
              id,
              read: false,
              date: pastDate,
            };
            
            set((state) => ({
              notifications: [newNotification, ...state.notifications],
              unreadCount: state.unreadCount + 1,
            }));
          });
        }
      },
    }),
    {
      name: 'exptrac-notifications-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);