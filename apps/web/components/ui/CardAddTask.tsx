"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Task } from "@/app/types";
import { useTaskSync } from "@/store/useTaskStore";
import { Button } from "@workspace/ui/components/button";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  dueDate: z.string(),
});

type FormData = z.infer<typeof schema>;

type Props = {
  projectId: string;
};

interface User {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  assignees: User[];
  createdAt: string;
  endDate?: string;
}

export default function CardAddTask({ projectId }: Props) {
  const [open, setOpen] = useState(false);
  const [showAssigneeModal, setShowAssigneeModal] = useState(false);
  const [selectedAssignees, setSelectedAssignees] = useState<User[]>([]);
  const { createMutation } = useTaskSync(projectId);

  const [assignees, setAssignees] = useState<User[]>([]);
  const [projectEndDate, setProjectEndDate] = useState<string>("");

  useEffect(() => {
    const storedProjects = localStorage.getItem("projects");
    if (storedProjects) {
      try {
        const parsed: Project[] = JSON.parse(storedProjects);
        const project = parsed.find((p) => p.id === projectId);
        if (project) {
          if (Array.isArray(project.assignees)) {
            setAssignees(project.assignees);
          }
          if (project.endDate) {
            setProjectEndDate(project.endDate);
          }
        }
      } catch (e) {
        console.error("Parse error", e);
      }
    }
  }, [projectId]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: "TODO",
      dueDate: new Date().toISOString().slice(0, 10),
    },
  });

  const toggleAssignee = (user: User) => {
    setSelectedAssignees((prev) => {
      const exists = prev.some((a) => a.id === user.id);
      return exists ? prev.filter((a) => a.id !== user.id) : [...prev, user];
    });
  };

  const removeAssignee = (userId: string) => {
    setSelectedAssignees((prev) => prev.filter((a) => a.id !== userId));
  };

  const onSubmit = async (data: FormData) => {
    if (selectedAssignees.length === 0) {
      alert("Please select at least one assignee!");
      return;
    }

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: data.title,
      description: data.description ?? "",
      status: data.status,
      projectId,
      dueDate: data.dueDate,
      assignees: selectedAssignees,
    };

    const stored = JSON.parse(localStorage.getItem("tasks") || "[]");
    const updated = [...stored, newTask];
    localStorage.setItem("tasks", JSON.stringify(updated));

    createMutation.mutate(newTask);

    reset();
    setSelectedAssignees([]);
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedAssignees([]);
    reset();
  };

  return (
    <>
      <Button
        className="px-2 py-2 text-xs rounded border bg-white hover:bg-gray-100 text-gray-700
                   dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
        onClick={() => setOpen(true)}
      >
        New Task
      </Button>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-40">
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-96
                          dark:bg-gray-900 dark:text-gray-100 dark:border dark:border-gray-700"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">New Task</h2>
              <button onClick={handleClose} className="hover:text-red-500">
                ✖
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Title</label>
                <input
                  {...register("title")}
                  className="w-full border rounded px-2 py-1
                             dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  {...register("description")}
                  className="w-full border rounded px-2 py-1
                             dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Status</label>
                <select
                  {...register("status")}
                  className="w-full border rounded px-2 py-1
                             dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS" disabled>
                    In Progress
                  </option>
                  <option value="DONE" disabled>
                    Done
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Assignees <span className="text-red-500">*</span>
                </label>
                <div
                  className="flex flex-wrap gap-2 mb-2 p-2 border rounded
                                bg-gray-50 dark:bg-gray-800 dark:border-gray-700 min-h-10"
                >
                  {selectedAssignees.length > 0 ? (
                    selectedAssignees.map((user) => (
                      <span
                        key={user.id}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                      >
                        {user.name}
                        <button
                          type="button"
                          onClick={() => removeAssignee(user.id)}
                          className="hover:bg-blue-600 rounded px-1"
                        >
                          ✖
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm dark:text-gray-400">
                      No assignees selected
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowAssigneeModal(true)}
                  className="w-full px-2 py-2 text-sm border rounded
                             bg-gray-100 hover:bg-gray-200
                             dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                >
                  + Add Assignees
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium">Due Date</label>
                <input
                  type="date"
                  {...register("dueDate")}
                  className="w-full border rounded px-2 py-1
                             dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  min={new Date().toISOString().split("T")[0]}
                  max={projectEndDate || undefined}
                />
                {projectEndDate && (
                  <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                    Project ends:{" "}
                    {new Date(projectEndDate).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  onClick={handleClose}
                  className="px-3 py-1 border rounded bg-white hover:bg-gray-100 text-gray-800
                             dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-400 text-white rounded"
                >
                  {isSubmitting ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssigneeModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-96
                          dark:bg-gray-900 dark:text-gray-100 dark:border dark:border-gray-700"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Select Assignees</h2>
              <button
                onClick={() => setShowAssigneeModal(false)}
                className="hover:text-red-500"
              >
                ✖
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
              {assignees.length === 0 ? (
                <p className="text-gray-500 text-sm dark:text-gray-400">
                  No assignees available
                </p>
              ) : (
                assignees.map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center gap-2 p-2 rounded cursor-pointer
                               hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAssignees.some((a) => a.id === user.id)}
                      onChange={() => toggleAssignee(user)}
                      className="w-4 h-4"
                    />
                    <span>{user.name}</span>
                  </label>
                ))
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAssigneeModal(false)}
                className="px-3 py-1 border rounded bg-white hover:bg-gray-100 text-gray-800
                           dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
