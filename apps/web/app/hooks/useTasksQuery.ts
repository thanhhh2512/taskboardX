import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTasks,
  postTask,
  patchTask,
  fetchProjects,
  fetchUsers,
  removeTask,
  updateExistingTask,
  fetchProjectMembers,
  addUserToProjectApi,
  removeUserFromProjectApi,
} from "@/app/api/mock-tasks";
import { TaskType } from "@workspace/types";

// Fetch Assignees
export const useAssignees = () =>
  useQuery({
    queryKey: ["assignees"],
    queryFn: () => fetchUsers(),
  });

// Fetch Project Members - only users who are members of the specific project
export const useProjectMembers = (projectId: string) =>
  useQuery({
    queryKey: ["projectMembers", projectId],
    queryFn: () => fetchProjectMembers(projectId),
    enabled: !!projectId, // Only run the query if projectId is provided
  });

// Fetch projects
export const useProjects = () =>
  useQuery({
    queryKey: ["projects"],
    queryFn: () => fetchProjects(),
    staleTime: 1000, // Consider data stale after 1 second
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

// Fetch tasks
export const useTasks = (projectId: string) =>
  useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => fetchTasks(projectId),
  });

// Add user to project
export const useAddUserToProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addUserToProjectApi,
    onSuccess: (_, variables) => {
      // Invalidate project members cache to reflect the new user
      queryClient.invalidateQueries({
        queryKey: ["projectMembers", variables.projectId],
      });
    },
  });
};

// Remove user from project
export const useRemoveUserFromProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeUserFromProjectApi,
    onSuccess: (_, variables) => {
      // Invalidate project members cache to reflect the removal
      queryClient.invalidateQueries({
        queryKey: ["projectMembers", variables.projectId],
      });
    },
  });
};

// Create task
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postTask,
    onMutate: (newTask) => {
      queryClient.setQueryData(
        ["tasks", newTask.projectId],
        (oldTasks: any) => {
          return [...(oldTasks || []), newTask];
        }
      );
    },
    onSuccess: (newTask, variables) => {
      // Update cache
      queryClient.invalidateQueries({
        queryKey: ["tasks", variables.projectId],
      });
    },
  });
};

// Update task
export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchTask,
    onMutate: (updatedTask) => {
      queryClient.setQueryData(
        ["tasks", updatedTask.projectId],
        (oldTasks: any) => {
          return oldTasks.map((task: any) =>
            task.id === updatedTask.taskId
              ? { ...task, status: updatedTask.status }
              : task
          );
        }
      );
    },
    onSuccess: (updatedTask, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tasks", variables.projectId],
      });
    },
  });
};

// Update entire task
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateExistingTask,
    onMutate: async (updatedTask) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({
        queryKey: ["tasks", updatedTask.projectId],
      });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData<TaskType[]>([
        "tasks",
        updatedTask.projectId,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(
        ["tasks", updatedTask.projectId],
        (oldTasks: TaskType[] | undefined) => {
          if (!oldTasks) return [];

          return oldTasks.map((task) =>
            task.id === updatedTask.id
              ? {
                  ...task,
                  title: updatedTask.title,
                  description: updatedTask.description,
                  status: updatedTask.status,
                  assignee: {
                    id: updatedTask.assigneeId,
                    name:
                      oldTasks.find((t) => t.id === updatedTask.id)?.assignee
                        ?.name || "",
                  },
                  dueDate: updatedTask.dueDate,
                }
              : task
          );
        }
      );

      // Return a context object with the previous tasks
      return { previousTasks };
    },
    onError: (err, updatedTask, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTasks) {
        queryClient.setQueryData(
          ["tasks", updatedTask.projectId],
          context.previousTasks
        );
      }
    },
    onSuccess: (updatedTask, variables) => {
      // Invalidate and refetch on success
      queryClient.invalidateQueries({
        queryKey: ["tasks", variables.projectId],
      });
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: ["tasks", variables.projectId],
      });
    },
  });
};

// Delete task
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeTask,
    onMutate: (deleteParams) => {
      queryClient.setQueryData(
        ["tasks", deleteParams.projectId],
        (oldTasks: any) => {
          return oldTasks.filter(
            (task: any) => task.id !== deleteParams.taskId
          );
        }
      );
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tasks", variables.projectId],
      });
    },
  });
};
