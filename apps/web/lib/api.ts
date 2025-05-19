import {
  ApiResponse,
  Project,
  TaskPostPayload,
  TaskStatus,
  TaskType,
  User,
} from "@workspace/types";
import { getAuthTokens } from "./auth";

// Use local proxy to avoid CORS issues
const API_BASE_URL = "/api";

// Helper for getting auth token
const getAuthHeader = (
  requireAuth: boolean = true
): { Authorization: string } | Record<string, never> => {
  if (typeof window === "undefined") return {};

  // Use getAuthTokens function as requested
  const tokens = getAuthTokens();

  if (requireAuth && !tokens) {
    throw new Error("Authentication required. Please log in.");
  }

  return tokens ? { Authorization: `Bearer ${tokens.token}` } : {};
};

// Helper for handling API responses
const handleResponse = async (response: Response) => {
  try {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `API error: ${response.status}`);
    }

    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      // JSON parsing error
      throw new Error(`Invalid response format: ${error.message}`);
    }
    throw error; // Re-throw network or other errors
  }
};

// Auth APIs
export const authApi = {
  signup: async (userData: {
    email: string;
    password: string;
    name: string;
    role: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: {
        ...getAuthHeader(false),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        ...getAuthHeader(false),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  getCurrentUser: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/me?userId=${userId}`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },
};

// User APIs
export const userApi = {
  getUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    const data = await handleResponse(response);
    return data.users;
  },

  getUserById: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  updateUserById: async (
    userId: string,
    userData: Partial<{ name: string; email: string; role: string }>
  ) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "PUT",
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  updateUserSkills: async (userId: string, skills: string[]) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/skills`, {
      method: "PATCH",
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ skills }),
    });
    return handleResponse(response);
  },

  updateUserAvatar: async (userId: string, avatarBase64: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/avatar`, {
      method: "PATCH",
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ avatarBase64 }),
    });
    return handleResponse(response);
  },

  getUserStats: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/stats`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },
};

// Project APIs
export const projectApi = {
  getProjects: async (): Promise<ApiResponse<Project[]>> => {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  getProjectById: async (projectId: string): Promise<ApiResponse<Project>> => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  createProject: async (projectData: {
    name: string;
    description: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<ApiResponse<Project>> => {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: "POST",
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(projectData),
    });
    return handleResponse(response);
  },

  updateProject: async (
    projectId: string,
    projectData: {
      name?: string;
      description?: string;
      startDate?: string;
      endDate?: string;
      status?: string;
    }
  ): Promise<ApiResponse<Project>> => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: "PUT",
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(projectData),
    });
    return handleResponse(response);
  },

  deleteProject: async (
    projectId: string
  ): Promise<ApiResponse<{ success: boolean }>> => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: "DELETE",
      headers: {
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  getProjectTasks: async (
    projectId: string
  ): Promise<ApiResponse<TaskType[]>> => {
    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/tasks`,
      {
        headers: {
          ...getAuthHeader(),
        },
      }
    );
    return handleResponse(response);
  },

  createProjectTask: async (
    projectId: string,
    taskData: Omit<TaskPostPayload, "projectId">
  ): Promise<ApiResponse<TaskType>> => {
    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/tasks`,
      {
        method: "POST",
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      }
    );
    return handleResponse(response);
  },

  getProjectMembers: async (
    projectId: string
  ): Promise<ApiResponse<User[]>> => {
    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/members`,
      {
        headers: {
          ...getAuthHeader(),
        },
      }
    );
    return handleResponse(response);
  },

  addUserToProject: async (
    projectId: string,
    userId: string
  ): Promise<ApiResponse<{ success: boolean }>> => {
    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/members`,
      {
        method: "POST",
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      }
    );
    return handleResponse(response);
  },

  removeUserFromProject: async (
    projectId: string,
    userId: string
  ): Promise<ApiResponse<{ success: boolean }>> => {
    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/members/${userId}`,
      {
        method: "DELETE",
        headers: {
          ...getAuthHeader(),
        },
      }
    );
    return handleResponse(response);
  },
};

// Task APIs
export const taskApi = {
  getTasks: async (projectId?: string): Promise<ApiResponse<TaskType[]>> => {
    const url = projectId
      ? `${API_BASE_URL}/tasks?projectId=${projectId}`
      : `${API_BASE_URL}/tasks`;

    const response = await fetch(url, {
      headers: {
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  getTaskById: async (taskId: string): Promise<ApiResponse<TaskType>> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  createTask: async (
    taskData: TaskPostPayload
  ): Promise<ApiResponse<TaskType>> => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: "POST",
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });
    return handleResponse(response);
  },

  updateTask: async (
    taskId: string,
    taskData: TaskPostPayload & { id?: string }
  ): Promise<ApiResponse<TaskType>> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });
    return handleResponse(response);
  },

  updateTaskStatus: async (
    taskId: string,
    projectId: string,
    status: TaskStatus
  ): Promise<ApiResponse<TaskType>> => {
    // Get the current task data
    const taskResponse = await taskApi.getTaskById(taskId);
    const task = (taskResponse as any).data || (taskResponse as any).task || taskResponse;

    if (!task) {
      throw new Error("Task not found");
    }

    // Update only the status
    return taskApi.updateTask(taskId, {
      ...task,
      status,
      projectId,
    });
  },

  deleteTask: async (
    taskId: string
  ): Promise<ApiResponse<{ success: boolean; message: string }>> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },
};
