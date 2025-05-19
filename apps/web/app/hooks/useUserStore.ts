import { create } from "zustand";
import { combine } from "zustand/middleware";
import { User as ApiUser } from "@workspace/types";
import { getCurrentUser, getAuthTokens } from "@/lib/auth";
import { userApi } from "@/lib/api";

// User type definition
export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  skills: string[];
  stats: {
    tasks: number;
    projects: number;
    completed: number;
  };
};

// User store for managing user profile data
export const useUserStore = create(
  combine(
    {
      user: null as User | null,
      isLoading: true,
      isAuthenticated: false,
    },
    (set, get) => ({
      // Initialize with user data from API
      initializeUser: async () => {
        try {
          set({ isLoading: true });

          // Check if user is authenticated using tokens
          const tokens = getAuthTokens();
          if (!tokens) {
            set({
              user: null,
              isLoading: false,
              isAuthenticated: false,
            });
            return;
          }

          // User is authenticated, load profile data
          const userData = await getCurrentUser();

          // Map API response to our User type with default values for missing properties
          const mappedUser: User = {
            id: userData.id || "",
            name: userData.name || "",
            email: userData.email || "",
            role: userData.role || "",
            avatar: userData.avatar || "",
            skills: (() => {
              try {
                if (typeof userData.skills === "string") {
                  return JSON.parse(userData.skills); // ← chỉ cần dòng này
                }
                return Array.isArray(userData.skills) ? userData.skills : [];
              } catch {
                return [];
              }
            })(),

            stats: userData.stats || {
              tasks: 0,
              projects: 0,
              completed: 0,
            },
          };

          set({
            user: mappedUser,
            isLoading: false,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error("Failed to load user data:", error);
          set({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      },

      // Update user data
      updateUser: async (updates: Partial<Omit<User, "id">>) => {
        const currentUser = get().user;
        if (!currentUser) return;

        try {
          // Check authentication
          const tokens = getAuthTokens();
          if (!tokens) throw new Error("Not authenticated");

          // Optimistic update
          set({
            user: {
              ...currentUser,
              ...updates,
            },
          });

          // Make API call to update the user
          const userId = currentUser.id;
          await userApi.updateUserById(userId, updates);
        } catch (error) {
          console.error("Failed to update user:", error);
          // Revert to original state on error
          (get() as any).initializeUser();
        }
      },

      // Update user avatar
      updateAvatar: async (avatarBase64: string) => {
        const currentUser = get().user;
        if (!currentUser) return;

        try {
          // Check authentication
          const tokens = getAuthTokens();
          if (!tokens) throw new Error("Not authenticated");

          // Optimistic update
          set({
            user: {
              ...currentUser,
              avatar: avatarBase64,
            },
          });

          // Make API call to update avatar
          await userApi.updateUserAvatar(currentUser.id, avatarBase64);
        } catch (error) {
          console.error("Failed to update avatar:", error);
          // Revert on error
          (get() as any).initializeUser();
        }
      },

      // Update user skills as an array
      updateSkills: async (skills: string[]) => {
        const currentUser = get().user;
        if (!currentUser) return;

        try {
          // Check authentication
          const tokens = getAuthTokens();
          if (!tokens) throw new Error("Not authenticated");

          // Optimistic update
          set({
            user: {
              ...currentUser,
              skills,
            },
          });

          // Make API call to update skills
          await userApi.updateUserSkills(currentUser.id, skills);
        } catch (error) {
          console.error("Failed to update skills:", error);
          // Revert on error
          (get() as any).initializeUser();
        }
      },

      // Update user statistics
      updateStats: async (stats: Partial<User["stats"]>) => {
        const currentUser = get().user;
        if (!currentUser) return;

        // Check authentication
        const tokens = getAuthTokens();
        if (!tokens) throw new Error("Not authenticated");

        set({
          user: {
            ...currentUser,
            stats: {
              ...currentUser.stats,
              ...stats,
            },
          },
        });

        // Note: API doesn't have a specific endpoint to update stats directly,
        // they are updated through other actions
      },

      // Increment a specific stat
      incrementStat: (statName: keyof User["stats"]) => {
        const currentUser = get().user;
        if (!currentUser) return;

        // Check authentication
        const tokens = getAuthTokens();
        if (!tokens) throw new Error("Not authenticated");

        set({
          user: {
            ...currentUser,
            stats: {
              ...currentUser.stats,
              [statName]: currentUser.stats[statName] + 1,
            },
          },
        });
      },

      // Decrement a specific stat
      decrementStat: (statName: keyof User["stats"]) => {
        const currentUser = get().user;
        if (!currentUser) return;

        // Check authentication
        const tokens = getAuthTokens();
        if (!tokens) throw new Error("Not authenticated");

        const currentValue = currentUser.stats[statName];
        if (currentValue <= 0) return;

        set({
          user: {
            ...currentUser,
            stats: {
              ...currentUser.stats,
              [statName]: currentValue - 1,
            },
          },
        });
      },
    })
  )
);
