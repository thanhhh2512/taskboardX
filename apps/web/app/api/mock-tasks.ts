import {
  LeaderboardEntry,
  Project,
  TaskType,
  TaskPostPayload,
  TaskStatus,
  User,
} from "@workspace/types";
import { v4 as uuidv4 } from "uuid";

// Mock Data
export const mockProjects: Project[] = [
  {
    id: "proj-1",
    name: "Frontend Refactor",
    createdAt: "2025-04-01T10:00:00Z",
  },
  {
    id: "proj-2",
    name: "Mobile MVP",
    createdAt: "2025-04-10T12:00:00Z",
  },
];

export const mockUsers: User[] = [
  { id: "user-1", name: "Alice" },
  { id: "user-2", name: "Bob" },
  { id: "user-3", name: "Charlie" },
];

// Track which users belong to which projects
export const mockProjectMembers: Record<string, string[]> = {
  "proj-1": ["user-1", "user-2"],
  "proj-2": ["user-3"],
};

export const mockTasksByProject: Record<string, TaskType[]> = {
  "proj-1": [
    {
      id: "task-101",
      title: "Setup Zustand store",
      description: "Implement global state for modal and current project",
      status: "IN_PROGRESS",
      assignee: { id: "user-1", name: "Alice" },
      dueDate: "2025-05-10",
    },
    {
      id: "task-102",
      title: "Build Table View",
      description: "Use React Table to render task list with sorting",
      status: "TODO",
      assignee: { id: "user-2", name: "Bob" },
      dueDate: "2025-05-11",
    },
  ],
  "proj-2": [], // Add tasks here if needed
};

export const mockLeaderboard: LeaderboardEntry[] = [
  {
    user: "Alice",
    tasksCompleted: 12,
    hoursLogged: 40,
    efficiency: 0.3,
  },
  {
    user: "Bob",
    tasksCompleted: 8,
    hoursLogged: 20,
    efficiency: 0.4,
  },
];

function createTask(data: TaskPostPayload): TaskType {
  const newTask: TaskType = {
    id: `task-${uuidv4().slice(0, 8)}`,
    title: data.title,
    description: data.description,
    status: data.status,
    assignee: mockUsers.find((u) => u.id === data.assigneeId)!,
    dueDate: data.dueDate,
  };

  if (!mockTasksByProject[data.projectId]) {
    mockTasksByProject[data.projectId] = [];
  }

  mockTasksByProject[data.projectId]!.push(newTask);

  return newTask;
}

function updateTaskStatus(
  taskId: string,
  newStatus: TaskStatus,
  projectId: string
): TaskType | null {
  const task = (mockTasksByProject[projectId] || []).find(
    (t) => t.id === taskId
  );
  if (task) {
    task.status = newStatus;
    return task;
  }
  return null;
}

function updateTask(data: TaskPostPayload & { id: string }): TaskType | null {
  const { projectId, id } = data;

  // Ensure the project array exists
  if (!mockTasksByProject[projectId]) {
    mockTasksByProject[projectId] = [];
    return null;
  }

  const tasks = mockTasksByProject[projectId];
  const taskIndex = tasks.findIndex((task) => task.id === id);

  if (taskIndex === -1) return null;

  // Get the existing task to preserve any fields not in the update
  const existingTask = tasks[taskIndex];

  const updatedTask: TaskType = {
    ...existingTask,
    id: data.id,
    title: data.title,
    description: data.description,
    status: data.status,
    assignee: mockUsers.find((u) => u.id === data.assigneeId)!,
    dueDate: data.dueDate,
  };

  // Replace the existing task with updated values
  mockTasksByProject[projectId][taskIndex] = updatedTask;

  return updatedTask;
}

function deleteTask(taskId: string, projectId: string): boolean {
  if (!mockTasksByProject[projectId]) {
    return false;
  }

  const initialLength = mockTasksByProject[projectId].length;
  mockTasksByProject[projectId] = mockTasksByProject[projectId].filter(
    (task) => task.id !== taskId
  );

  return initialLength > mockTasksByProject[projectId].length;
}

// Add user to a project
export function addUserToProject(projectId: string, userId: string): boolean {
  if (!mockProjectMembers[projectId]) {
    mockProjectMembers[projectId] = [];
  }

  // Check if user is already a member
  if (mockProjectMembers[projectId].includes(userId)) {
    return false;
  }

  mockProjectMembers[projectId].push(userId);
  return true;
}

// Remove user from a project
export function removeUserFromProject(
  projectId: string,
  userId: string
): boolean {
  if (!mockProjectMembers[projectId]) {
    return false;
  }

  const initialLength = mockProjectMembers[projectId].length;
  mockProjectMembers[projectId] = mockProjectMembers[projectId].filter(
    (id) => id !== userId
  );

  return initialLength > mockProjectMembers[projectId].length;
}

// Get all users that are members of a project
export function getProjectMembers(projectId: string): User[] {
  const memberIds = mockProjectMembers[projectId] || [];
  return mockUsers.filter((user) => memberIds.includes(user.id));
}

// Simulate a delay like a real API
const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

export const fetchLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  await delay();
  return mockLeaderboard;
};

export const fetchUsers = async (): Promise<User[]> => {
  await delay();
  return mockUsers;
};

export const fetchProjectMembers = async (
  projectId: string
): Promise<User[]> => {
  await delay();
  return getProjectMembers(projectId);
};

export const fetchProjects = async (): Promise<Project[]> => {
  await delay();
  return mockProjects;
};

export const fetchTasks = async (projectId: string): Promise<TaskType[]> => {
  await delay();
  return mockTasksByProject[projectId] || [];
};

export const postTask = async (payload: TaskPostPayload): Promise<TaskType> => {
  await delay();
  return createTask(payload);
};

export const updateExistingTask = async (
  payload: TaskPostPayload & { id: string }
): Promise<TaskType | null> => {
  await delay();
  return updateTask(payload);
};

export const patchTask = async ({
  taskId,
  status,
  projectId,
}: {
  taskId: string;
  status: TaskStatus;
  projectId: string;
}): Promise<TaskType | null> => {
  await delay();
  return updateTaskStatus(taskId, status, projectId);
};

export const removeTask = async ({
  taskId,
  projectId,
}: {
  taskId: string;
  projectId: string;
}): Promise<boolean> => {
  await delay();
  return deleteTask(taskId, projectId);
};

export const addUserToProjectApi = async ({
  projectId,
  userId,
}: {
  projectId: string;
  userId: string;
}): Promise<boolean> => {
  await delay();
  return addUserToProject(projectId, userId);
};

export const removeUserFromProjectApi = async ({
  projectId,
  userId,
}: {
  projectId: string;
  userId: string;
}): Promise<boolean> => {
  await delay();
  return removeUserFromProject(projectId, userId);
};
