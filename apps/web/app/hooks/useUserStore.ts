import { create } from "zustand";
import { combine } from "zustand/middleware";

// User type definition
export type User = {
  id: string;
  name: string;
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
    },
    (set, get) => ({
      // Initialize with mock data or fetch from API
      initializeUser: async () => {
        // Mock data - replace with actual API call
        const mockUser: User = {
          id: "1",
          name: "John Doe",
          role: "Product Manager",
          avatar: "https://via.placeholder.com/128",
          skills: ["Product", "Management", "Design"],
          stats: {
            tasks: 24,
            projects: 5,
            completed: 18,
          },
        };

        set({
          user: mockUser,
          isLoading: false,
        });
      },

      // Update user data
      updateUser: (updates: Partial<Omit<User, "id">>) => {
        const currentUser = get().user;
        if (!currentUser) return;

        set({
          user: {
            ...currentUser,
            ...updates,
          },
        });
      },

      // Update user avatar
      updateAvatar: (avatarUrl: string) => {
        const currentUser = get().user;
        if (!currentUser) return;

        set({
          user: {
            ...currentUser,
            avatar: avatarUrl,
          },
        });
      },

      // Update user skills as an array
      updateSkills: (skills: string[]) => {
        const currentUser = get().user;
        if (!currentUser) return;

        set({
          user: {
            ...currentUser,
            skills,
          },
        });
      },

      // Update user statistics
      updateStats: (stats: Partial<User["stats"]>) => {
        const currentUser = get().user;
        if (!currentUser) return;

        set({
          user: {
            ...currentUser,
            stats: {
              ...currentUser.stats,
              ...stats,
            },
          },
        });
      },

      // Increment a specific stat
      incrementStat: (statName: keyof User["stats"]) => {
        const currentUser = get().user;
        if (!currentUser) return;

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
