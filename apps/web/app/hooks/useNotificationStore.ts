import { create } from "zustand";
import { combine } from "zustand/middleware";

// Notification type definition
export type NotificationType = "info" | "success" | "warning" | "error";

export type Notification = {
  id: string;
  type: NotificationType;
  message: string;
  description?: string;
  timestamp: Date;
  read: boolean;
};

// Notification store for managing notifications
export const useNotificationStore = create(
  combine(
    {
      notifications: [] as Notification[],
      unreadCount: 0,
    },
    (set, get) => ({
      // Add a new notification
      addNotification: (
        message: string,
        type: NotificationType = "info",
        description?: string
      ) => {
        const notification: Notification = {
          id: Math.random().toString(36).substring(2, 11),
          type,
          message,
          description,
          timestamp: new Date(),
          read: false,
        };

        set((state) => ({
          notifications: [notification, ...state.notifications].slice(0, 50), // Limit to 50 notifications
          unreadCount: state.unreadCount + 1,
        }));

        return notification;
      },

      // Mark a notification as read
      markAsRead: (id: string) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          if (notification && !notification.read) {
            return {
              notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n
              ),
              unreadCount: state.unreadCount - 1,
            };
          }
          return state;
        });
      },

      // Mark all notifications as read
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      // Remove a notification
      removeNotification: (id: string) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount:
              notification && !notification.read
                ? state.unreadCount - 1
                : state.unreadCount,
          };
        });
      },

      // Clear all notifications
      clearAll: () => {
        set({
          notifications: [],
          unreadCount: 0,
        });
      },

      // Get unread notifications
      getUnreadNotifications: () => {
        return get().notifications.filter((n) => !n.read);
      },

      // Get notification by ID
      getNotificationById: (id: string) => {
        return get().notifications.find((n) => n.id === id);
      },

      // Get unread count
      getUnreadCount: () => get().unreadCount,
    })
  )
);
