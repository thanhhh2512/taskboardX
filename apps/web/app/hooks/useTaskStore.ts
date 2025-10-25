import { create } from "zustand";
import { combine } from "zustand/middleware";
import { projectApi } from "@/lib/api";

// API Response Types
interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

interface ProjectResponse {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  members: string[];
  taskCount: number;
  startDate?: string;
  endDate?: string;
}

interface ProjectsResponse {
  projects: ProjectResponse[];
}

interface TasksResponse {
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    dueDate: string;
    assignee?: {
      id: string;
      name: string;
    };
  }>;
}

interface MembersResponse {
  members: Array<{
    id: string;
    name: string;
    role: string;
    avatar: string;
  }>;
}

// Project type definition for extended functionality
export type Project = {
  id: string;
  name: string;
  description: string;
  taskCount: number;
  members: string[]; // IDs of users assigned to this project
  startDate?: string;
  endDate?: string;
  status?: string;
  createdAt?: string;
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
          const response = await projectApi.getProjects();
          console.log("Fetched projects:", response);
          const apiProjects =
            (response as unknown as ProjectsResponse).projects || [];

          // Transform ProjectType to our extended Project type
          const enhancedProjects: Project[] = await Promise.all(
            apiProjects.map(async (project: ProjectResponse) => {
              console.log("Project from API:", project);
              // Fetch tasks for each project to get the count
              const tasksResponse = await projectApi.getProjectTasks(
                project.id
              );
              const tasks =
                (tasksResponse as unknown as TasksResponse).tasks || [];

              // Get members from API
              const membersResponse = await projectApi.getProjectMembers(
                project.id
              );
              const members =
                (membersResponse as unknown as MembersResponse).members?.map(
                  (member) => member.id
                ) || [];

              return {
                id: project.id,
                name: project.name,
                description: project.description || "",
                taskCount: tasks.length,
                members: members,
                startDate: project.startDate,
                endDate: project.endDate,
                createdAt: project.createdAt,
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
      addProject: async (name: string, description: string) => {
        try {
          // Create project through API
          const response = await projectApi.createProject({
            name,
            description,
          });
          console.log("Created project:", response);
          if (!response) {
            throw new Error("Failed to create project");
          }

          const projectData = response as unknown as ProjectResponse;
          const newProject: Project = {
            id: projectData.id,
            name: projectData.name,
            description: projectData.description || description,
            taskCount: projectData.taskCount,
            members: projectData.members,
            startDate: projectData.startDate,
            endDate: projectData.endDate,
            createdAt: projectData.createdAt,
          };

          set((state) => ({
            projects: [...state.projects, newProject],
            currentProject: newProject,
          }));

          useProjectStore.getState().setProjectId(newProject.id);

          return newProject;
        } catch (error) {
          console.error("Failed to create project:", error);
          throw error;
        }
      },

      // Update existing project
      updateProject: async (
        id: string,
        updates: Partial<Omit<Project, "id">>
      ) => {
        try {
          // Update project through API
          const response = await projectApi.updateProject(id, updates);

          if (!response) {
            throw new Error("Failed to update project");
          }

          const projectData = response as unknown as ProjectResponse;
          set((state) => ({
            projects: state.projects.map((project) =>
              project.id === id
                ? {
                    ...project,
                    ...updates,
                    name: projectData.name,
                    description: projectData.description || project.description,
                    startDate: projectData.startDate,
                    endDate: projectData.endDate,
                    createdAt: projectData.createdAt,
                  }
                : project
            ),
          }));
        } catch (error) {
          console.error("Failed to update project:", error);
          throw error;
        }
      },

      // Delete project
      deleteProject: async (id: string) => {
        try {
          // Delete project through API
          const response = await projectApi.deleteProject(id);

          if (
            !response ||
            !(response as unknown as ApiResponse<{ success: boolean }>).success
          ) {
            throw new Error("Failed to delete project");
          }

          set((state) => ({
            projects: state.projects.filter((project) => project.id !== id),
          }));

          // If the deleted project was the current project, reset selection
          if (useProjectStore.getState().projectId === id) {
            const remainingProjects = get().projects.filter((p) => p.id !== id);
            if (remainingProjects.length > 0) {
              const firstRemainingProject = remainingProjects[0];
              if (firstRemainingProject) {
                useProjectStore
                  .getState()
                  .setProjectId(firstRemainingProject.id);
              }
            } else {
              useProjectStore.getState().setProjectId("");
            }
          }
        } catch (error) {
          console.error("Failed to delete project:", error);
          throw error;
        }
      },

      // Add user to project
      addUserToProject: async (projectId: string, userId: string) => {
        try {
          // Add user to project through API
          const response = await projectApi.addUserToProject(projectId, userId);

          if (
            !response ||
            !(response as unknown as ApiResponse<{ success: boolean }>).success
          ) {
            throw new Error("Failed to add user to project");
          }

          // Get updated members from API
          const membersResponse = await projectApi.getProjectMembers(projectId);
          const members =
            (membersResponse as unknown as MembersResponse).members?.map(
              (member) => member.id
            ) || [];

          // Update local state with fresh data
          set((state) => ({
            projects: state.projects.map((project) => {
              if (project.id === projectId) {
                return {
                  ...project,
                  members: members,
                };
              }
              return project;
            }),
          }));
        } catch (error) {
          console.error("Failed to add user to project:", error);
          throw error;
        }
      },

      // Remove user from project
      removeUserFromProject: async (projectId: string, userId: string) => {
        try {
          // Remove user from project through API
          const response = await projectApi.removeUserFromProject(
            projectId,
            userId
          );

          if (
            !response ||
            !(response as unknown as ApiResponse<{ success: boolean }>).success
          ) {
            throw new Error("Failed to remove user from project");
          }

          // Get updated members from API
          const membersResponse = await projectApi.getProjectMembers(projectId);
          const members =
            (membersResponse as unknown as MembersResponse).members?.map(
              (member) => member.id
            ) || [];

          // Update local state with fresh data
          set((state) => ({
            projects: state.projects.map((project) => {
              if (project.id === projectId) {
                return {
                  ...project,
                  members: members,
                };
              }
              return project;
            }),
          }));
        } catch (error) {
          console.error("Failed to remove user from project:", error);
          throw error;
        }
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
        try {
          const projects = get().projects;

          const updatedProjects = await Promise.all(
            projects.map(async (project) => {
              const response = await projectApi.getProjectTasks(project.id);
              const tasks = (response as unknown as TasksResponse).tasks || [];
              return {
                ...project,
                taskCount: tasks.length,
              };
            })
          );

          set({ projects: updatedProjects });
        } catch (error) {
          console.error("Failed to sync task counts:", error);
        }
      },

      // Sync project members with API data
      syncProjectMembers: async () => {
        try {
          const projects = get().projects;

          const updatedProjects = await Promise.all(
            projects.map(async (project) => {
              const response = await projectApi.getProjectMembers(project.id);
              const members =
                (response as unknown as MembersResponse).members?.map(
                  (member) => member.id
                ) || [];
              return {
                ...project,
                members: members,
              };
            })
          );

          set({ projects: updatedProjects });
        } catch (error) {
          console.error("Failed to sync project members:", error);
        }
      },

      // Add multiple users to project
      addUsersToProject: async (projectId: string, userIds: string[]) => {
        try {
          // Add users one by one using the existing API
          for (const userId of userIds) {
            await projectApi.addUserToProject(projectId, userId);
          }

          // Get updated members from API
          const membersResponse = await projectApi.getProjectMembers(projectId);
          const members =
            (membersResponse as unknown as MembersResponse).members?.map(
              (member) => member.id
            ) || [];

          // Update local state with fresh data
          set((state) => ({
            projects: state.projects.map((project) => {
              if (project.id === projectId) {
                return {
                  ...project,
                  members: members,
                };
              }
              return project;
            }),
          }));
        } catch (error) {
          console.error("Failed to add users to project:", error);
          throw error;
        }
      },

      // Get project members for assignee selection
      getProjectMembersForAssignee: (projectId: string) => {
        const project = get().projects.find((p) => p.id === projectId);
        return project?.members || [];
      },
    })
  )
);
