import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TaskType, TaskPostPayload, TaskStatus, Project } from "@workspace/types";
import { projectApi, taskApi, userApi } from "@/lib/api";

// Fetch Assignees
export const useAssignees = () =>
  useQuery({
    queryKey: ["assignees"],
    queryFn: () => userApi.getUsers(),
  });

// Fetch Project Members - only users who are members of the specific project
export const useProjectMembers = (projectId: string) =>
  useQuery({
    queryKey: ["projectMembers", projectId],
    queryFn: () => projectApi.getProjectMembers(projectId),
    enabled: !!projectId, // Only run the query if projectId is provided
  });

// Fetch projects
export const useProjects = () =>
  useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await projectApi.getProjects();
      return response;
    },
    select: (data) =>
      (data as unknown as { projects: Project[] }).projects || [],
    staleTime: 1000, // Consider data stale after 1 second
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

// Fetch tasks
export const useTasks = (projectId: string) =>
  useQuery({
    queryKey: ["tasks", projectId],
    queryFn: async () => {
      if (!projectId) {
        return { tasks: [] };
      }

      const response = await projectApi.getProjectTasks(projectId);
      return response;
    },
    select: (data) => (data as unknown as { tasks: TaskType[] }).tasks || [],
  });

// Add user to project
export const useAddUserToProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      userId,
    }: {
      projectId: string;
      userId: string;
    }) => projectApi.addUserToProject(projectId, userId),
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
    mutationFn: ({
      projectId,
      userId,
    }: {
      projectId: string;
      userId: string;
    }) => projectApi.removeUserFromProject(projectId, userId),
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
    mutationFn: taskApi.createTask,
    onSuccess: (response, variables) => {
      // Update cache
      queryClient.invalidateQueries({
        queryKey: ["tasks", variables.projectId],
      });
    },
  });
};

// Update task status
export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      status,
      projectId,
    }: {
      taskId: string;
      status: string;
      projectId: string;
    }) => taskApi.updateTaskStatus(taskId, projectId, status as TaskStatus),
    onSuccess: (response, variables) => {
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
    mutationFn: (updatedTask: TaskPostPayload & { id: string }) =>
      taskApi.updateTask(updatedTask.id, updatedTask),
    onMutate: async (updatedTask) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["tasks", updatedTask.projectId],
      });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData([
        "tasks",
        updatedTask.projectId,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(["tasks", updatedTask.projectId], (old: { tasks: TaskType[] } | undefined) => {
        const tasks = old?.tasks || [];
        return {
          ...old,
          tasks: tasks.map((task: TaskType) =>
            task.id === updatedTask.id
              ? {
                ...task,
                title: updatedTask.title,
                description: updatedTask.description,
                status: updatedTask.status,
                assignee: {
                  id: updatedTask.assigneeId,
                  name: task.assignee?.name || "", // Keep existing name until refetch
                },
                dueDate: updatedTask.dueDate,
              }
              : task
          ),
        };
      });

      // Return a context object with the snapshotted value
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
    onSuccess: (response, variables) => {
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
    mutationFn: ({
      taskId,

    }: {
      taskId: string;
      projectId: string;
    }) => taskApi.deleteTask(taskId),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tasks", variables.projectId],
      });
    },
  });
};
