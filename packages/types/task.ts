import { z } from "zod";

// Task types for the application
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type TaskPostPayload = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeId: string;
  projectId: string;
  dueDate: string;
};

export type TaskType = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignee: { id: string; name: string };
  dueDate?: string;
};

export type ColumnType = {
  id: string;
  title: string;
};

// Task component props interfaces
export interface TaskProps {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignee: { id: string; name: string };
  dueDate?: string;
  index?: number;
  columnId?: string;
}

// Task modal zod schema
export const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  assignee: z.string().min(1, "Assignee is required"),
  dueDate: z.string().min(1, "Due date is required"),
});
