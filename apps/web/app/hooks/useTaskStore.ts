import { create } from "zustand";
import { combine } from "zustand/middleware";
import { Project as ProjectType } from "@workspace/types";
import {
  fetchProjects,
  fetchTasks,
  mockProjectMembers,
} from "@/app/api/mock-tasks";

// Project type definition for extended functionality
export type Project = {
  id: string;
  name: string;
  description: string;
  taskCount: number;
  members: string[]; // IDs of users assigned to this project
};

// Basic project store just for project ID selection (keeping for backward compatibility)
export const useProjectStore = create(
  combine(
    {
      projectId: "",
    },
    (set) => ({
      setProjectId: (nextProjId: string) => {
        if (typeof nextProjId !== "string") {
          console.error("Project ID must be a string");
          return;
        }

        set({ projectId: nextProjId });
      },
    })
  )
);

// Enhanced project store for managing project data
export const useProjectsStore = create(
  combine(
    {
      projects: [] as Project[],
      currentProject: null as Project | null,
      isLoading: true,
    },
    (set, get) => ({
      // Initialize with data from the API
      initializeProjects: async () => {
        try {
          // Fetch projects from the API
          const apiProjects = await fetchProjects();

          // Transform ProjectType to our extended Project type
          const enhancedProjects: Project[] = await Promise.all(
            apiProjects.map(async (project: ProjectType) => {
              // Fetch tasks for each project to get the count
              const tasks = await fetchTasks(project.id);

              // Get member IDs from mock data (in a real app, this would be part of the API response)
              const members = mockProjectMembers[project.id] || [];

              return {
                id: project.id,
                name: project.name,
                description: "", // API projects might not have description
                taskCount: tasks.length,
                members: members, // Initialize with members from mock data
              };
            })
          );

          set({
            projects: enhancedProjects,
            isLoading: false,
          });

          // If there's at least one project, set the current project ID in the original store
          if (enhancedProjects.length > 0) {
            const firstProject = enhancedProjects[0];
            if (firstProject) {
              useProjectStore.getState().setProjectId(firstProject.id);
            }
          }
        } catch (error) {
          console.error("Failed to initialize projects:", error);
          set({ isLoading: false });
        }
      },

      // Get all projects
      getProjects: () => get().projects,

      // Get project by ID
      getProjectById: (id: string) => {
        return get().projects.find((project) => project.id === id) || null;
      },

      // Add new project
      addProject: (name: string, description: string) => {
        const newProject: Project = {
          id: Math.random().toString(36).substring(7), // Generate random ID
          name,
          description,
          taskCount: 0,
          members: [],
        };

        set((state) => ({
          projects: [...state.projects, newProject],
        }));

        return newProject;
      },

      // Update existing project
      updateProject: (id: string, updates: Partial<Omit<Project, "id">>) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id ? { ...project, ...updates } : project
          ),
        }));
      },

      // Delete project
      deleteProject: (id: string) => {
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
        }));

        // If the deleted project was the current project, reset selection
        if (useProjectStore.getState().projectId === id) {
          const remainingProjects = get().projects.filter((p) => p.id !== id);
          if (remainingProjects.length > 0) {
            const firstRemainingProject = remainingProjects[0];
            if (firstRemainingProject) {
              useProjectStore.getState().setProjectId(firstRemainingProject.id);
            }
          } else {
            useProjectStore.getState().setProjectId("");
          }
        }
      },

      // Add user to project
      addUserToProject: (projectId: string, userId: string) => {
        // Update mock data directly (in a real app, this would be an API call)
        if (!mockProjectMembers[projectId]) {
          mockProjectMembers[projectId] = [];
        }

        // Only add if not already a member
        if (!mockProjectMembers[projectId].includes(userId)) {
          mockProjectMembers[projectId].push(userId);
        }

        // Update local state
        set((state) => ({
          projects: state.projects.map((project) => {
            if (project.id === projectId) {
              // Only add if not already a member
              if (!project.members.includes(userId)) {
                return {
                  ...project,
                  members: [...project.members, userId],
                };
              }
            }
            return project;
          }),
        }));
      },

      // Remove user from project
      removeUserFromProject: (projectId: string, userId: string) => {
        // Update mock data directly (in a real app, this would be an API call)
        if (mockProjectMembers[projectId]) {
          mockProjectMembers[projectId] = mockProjectMembers[projectId].filter(
            (id) => id !== userId
          );
        }

        // Update local state
        set((state) => ({
          projects: state.projects.map((project) => {
            if (project.id === projectId) {
              return {
                ...project,
                members: project.members.filter((id) => id !== userId),
              };
            }
            return project;
          }),
        }));
      },

      // Set the current project
      setCurrentProject: (project: Project | null) => {
        set({ currentProject: project });
        if (project) {
          useProjectStore.getState().setProjectId(project.id);
        }
      },

      // Increment task count for a project
      incrementTaskCount: (projectId: string) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? { ...project, taskCount: project.taskCount + 1 }
              : project
          ),
        }));
      },

      // Decrement task count for a project
      decrementTaskCount: (projectId: string) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId && project.taskCount > 0
              ? { ...project, taskCount: project.taskCount - 1 }
              : project
          ),
        }));
      },

      // Sync task counts with current API data
      syncTaskCounts: async () => {
        const projects = get().projects;

        const updatedProjects = await Promise.all(
          projects.map(async (project) => {
            const tasks = await fetchTasks(project.id);
            return {
              ...project,
              taskCount: tasks.length,
            };
          })
        );

        set({ projects: updatedProjects });
      },

      // Sync project members with mock API data
      syncProjectMembers: () => {
        set((state) => ({
          projects: state.projects.map((project) => ({
            ...project,
            members: mockProjectMembers[project.id] || [],
          })),
        }));
      },

      // Add multiple users to project
      addUsersToProject: (projectId: string, userIds: string[]) => {
        // Update mock data first
        if (!mockProjectMembers[projectId]) {
          mockProjectMembers[projectId] = [];
        }

        // Add each user to mock data if not already a member
        userIds.forEach((userId) => {
          if (
            mockProjectMembers[projectId] &&
            !mockProjectMembers[projectId].includes(userId)
          ) {
            mockProjectMembers[projectId]?.push(userId);
          }
        });

        // Update local state
        set((state) => ({
          projects: state.projects.map((project) => {
            if (project.id === projectId) {
              // Use a Set to ensure no duplicates
              const updatedMembers = new Set([...project.members, ...userIds]);
              return {
                ...project,
                members: Array.from(updatedMembers),
              };
            }
            return project;
          }),
        }));
      },
    })
  )
);
