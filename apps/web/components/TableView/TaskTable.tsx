"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useReactTable,
  ColumnDef,
  flexRender,
  getCoreRowModel,
} from "@tanstack/react-table";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@workspace/ui/components/alert-dialog";
import { Task, TaskStatus } from "@/app/types";
import { useTaskStore, useTaskSync } from "@/store/useTaskStore";
import { Button } from "@workspace/ui/components/button";
import { Loader2, Pencil, Trash2, Filter } from "lucide-react";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@workspace/ui/components/pagination";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  assigneeId: z.string(),
  dueDate: z.string(),
});
type FormData = z.infer<typeof schema>;

const migrateTasksToNewFormat = (tasks: unknown[]): Task[] => {
  return (tasks as Task[]).map((task) => {
    if (task.assignees && !task.assignees) {
      return {
        ...task,
        assignees: task.assignees ? [task.assignees] : [],
      };
    }
    if (!task.assignees) {
      return {
        ...task,
        assignees: [],
      };
    }
    return task;
  });
};

export default function TaskTable({ projectId }: { projectId: string }) {
  const allTasks = useTaskStore((state) => state.tasks);
  const [showEditAssigneeModal, setShowEditAssigneeModal] = useState(false);
  const tasks = useMemo(() => {
    return allTasks.filter((task) => task.projectId === projectId);
  }, [allTasks, projectId]);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const [isAssigneeFilterOpen, setIsAssigneeFilterOpen] = useState(false);

  const pageSize = 3;
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesTitle = task.title
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ? true : task.status === statusFilter;
      const matchesAssignee =
        assigneeFilter === "all"
          ? true
          : Array.isArray(task.assignees) &&
            task.assignees.some((assignee) => assignee.id === assigneeFilter);
      return matchesTitle && matchesStatus && matchesAssignee;
    });
  }, [tasks, search, statusFilter, assigneeFilter]);

  const totalPages = Math.ceil(filteredTasks.length / pageSize);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [filteredTasks.length, totalPages, page]);

  useEffect(() => {
    console.log("Editing task:", editingTask);
  }, [editingTask]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const startEdit = (task: Task) => {
    const migratedTask = migrateTasksToNewFormat([task])[0] || task;
    const assigneesArray = Array.isArray(migratedTask.assignees)
      ? migratedTask.assignees
      : migratedTask.assignees
        ? [migratedTask.assignees]
        : [];
    const today = new Date().toISOString().slice(0, 10);
    const taskDueDate = migratedTask.dueDate || today;
    const validDueDate = taskDueDate < today ? today : taskDueDate;

    setEditingTask({
      ...migratedTask,
      assignees: assigneesArray,
    });

    reset({
      title: migratedTask.title,
      description: migratedTask.description,
      status: migratedTask.status as TaskStatus,
      assigneeId: "",
      dueDate: validDueDate,
    });
  };

  const { updateMutation, deleteMutation } = useTaskSync(projectId);

  const onSave = (data: FormData) => {
    if (!editingTask) return;

    if (!editingTask.assignees || editingTask.assignees.length === 0) {
      alert("Please select at least one assignee!");
      return;
    }

    updateMutation.mutate({
      id: editingTask.id,
      updates: {
        ...data,
        assignees: editingTask.assignees,
      },
    });

    console.log("Task updated:", {
      id: editingTask.id,
      assignees: editingTask.assignees,
    });
    setEditingTask(null);
    reset();
  };

  const toggleTaskAssignee = (user: { id: string; name: string }) => {
    if (!editingTask) return;

    const currentAssignees: Array<{ id: string; name: string }> = Array.isArray(
      editingTask.assignees
    )
      ? editingTask.assignees
      : editingTask.assignees
        ? [editingTask.assignees]
        : [];

    const hasAssignee = currentAssignees.some(
      (assignee) => assignee.id === user.id
    );
    const updatedAssignees = hasAssignee
      ? currentAssignees.filter((assignee) => assignee.id !== user.id)
      : [...currentAssignees, user];

    setEditingTask({ ...editingTask, assignees: updatedAssignees });
  };

  const [assignees, setAssignees] = useState<{ id: string; name: string }[]>(
    []
  );
  const [projectEndDate, setProjectEndDate] = useState<string>("");

  useEffect(() => {
    try {
      const projectsData: {
        id: string;
        name?: string;
        assignees?: { id: string; name: string }[];
        endDate?: string;
      }[] = JSON.parse(localStorage.getItem("projects") || "[]");

      const currentProject = projectsData.find(
        (project) => project.id === projectId
      );

      if (currentProject) {
        if (currentProject.assignees && currentProject.assignees.length > 0) {
          console.log("Project assignees:", currentProject.assignees);
          setAssignees(currentProject.assignees);
        } else {
          console.log("No assignees found for this project");
          setAssignees([]);
        }

        if (currentProject.endDate) {
          const endDateString: string = currentProject.endDate;
          setProjectEndDate(endDateString);
        } else {
          setProjectEndDate("");
        }
      }
    } catch (error) {
      console.error("Failed to fetch project data:", error);
      setAssignees([]);
      setProjectEndDate("");
    }
  }, [projectId]);

  useEffect(() => {
    if (editingTask) {
      setValue("title", editingTask.title);
      setValue("description", editingTask.description);
      setValue("status", editingTask.status as TaskStatus);
      setValue(
        "dueDate",
        editingTask.dueDate ?? new Date().toISOString().slice(0, 10)
      );
    }
  }, [editingTask, setValue]);

  useEffect(() => {
    console.log("Tasks synced:", allTasks);
  }, [allTasks]);

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
    setIsStatusFilterOpen(false);
  };

  const handleAssigneeFilterChange = (value: string) => {
    setAssigneeFilter(value);
    setPage(1);
    setIsAssigneeFilterOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".relative")) {
        setIsStatusFilterOpen(false);
        setIsAssigneeFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const columns: ColumnDef<Task>[] = [
    {
      header: "Title",
      accessorKey: "title",
      size: 200,
      cell: ({ getValue }) => (
        <span className="block truncate max-w-[200px]">
          {getValue<string>()}
        </span>
      ),
    },
    {
      id: "status",
      header: () => (
        <div className="flex justify-between items-center relative">
          <span>Status</span>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
              title="Filter status"
              className="p-0"
            >
              <Filter className="h-4 w-4" />
            </Button>
            {isStatusFilterOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 w-40 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 shadow-lg rounded-md">
                <div className="py-1">
                  <button
                    onClick={() => handleStatusFilterChange("all")}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${statusFilter === "all" ? "bg-gray-100 dark:bg-gray-700" : ""}`}
                  >
                    All Status
                  </button>
                  <button
                    onClick={() => handleStatusFilterChange("TODO")}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${statusFilter === "TODO" ? "bg-gray-100 dark:bg-gray-700" : ""}`}
                  >
                    To Do
                  </button>
                  <button
                    onClick={() => handleStatusFilterChange("IN_PROGRESS")}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${statusFilter === "IN_PROGRESS" ? "bg-gray-100 dark:bg-gray-700" : ""}`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => handleStatusFilterChange("DONE")}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${statusFilter === "DONE" ? "bg-gray-100 dark:bg-gray-700" : ""}`}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ),
      accessorKey: "status",
      cell: ({ getValue }) => {
        const status = getValue<TaskStatus>();
        const statusColors: Record<TaskStatus, string> = {
          TODO: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
          IN_PROGRESS:
            "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
          DONE: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
        };
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-medium w-fit ${statusColors[status]}`}
          >
            {status.replace("_", " ")}
          </span>
        );
      },
      size: 120,
    },
    {
      id: "assignee",
      header: () => (
        <div className="flex justify-between items-center relative">
          <span>Assignee</span>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAssigneeFilterOpen(!isAssigneeFilterOpen)}
              title="Filter assignee"
              className="p-0"
            >
              <Filter className="h-4 w-4" />
            </Button>
            {isAssigneeFilterOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 w-40 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 shadow-lg rounded-md max-h-60 overflow-y-auto">
                <div className="py-1">
                  <button
                    onClick={() => handleAssigneeFilterChange("all")}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${assigneeFilter === "all" ? "bg-gray-100 dark:bg-gray-700" : ""}`}
                  >
                    All Assignees
                  </button>
                  {assignees.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleAssigneeFilterChange(user.id)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${assigneeFilter === user.id ? "bg-gray-100 dark:bg-gray-700" : ""}`}
                    >
                      {user.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ),
      accessorFn: (row) => {
        if (!row.assignees) return "Unassigned";
        const assigneesArray = Array.isArray(row.assignees)
          ? row.assignees
          : [row.assignees];
        return assigneesArray.length > 0
          ? assigneesArray.map((assignee) => assignee.name).join(", ")
          : "Unassigned";
      },
      cell: ({ getValue }) => (
        <span className="block truncate max-w-[150px]">
          {getValue<string>()}
        </span>
      ),
      size: 150,
    },
    {
      header: "Due Date",
      accessorKey: "dueDate",
      size: 150,
    },
    {
      header: "Actions",
      id: "actions",
      size: 1,
      cell: ({ row }) => {
        const task = row.original;
        return (
          <div className="flex gap-2 w-fit">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => startEdit(task)}
              title="Edit task"
            >
              <Pencil className="h-4 w-4 text-black dark:text-white" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" title="Delete task">
                  <Trash2 className="h-4 w-4 text-black dark:text-white" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. The task <b>{task.title}</b>{" "}
                    will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteMutation.mutate(task.id)}
                    disabled={deleteMutation.isPending}
                  >
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredTasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const paginatedTasks = filteredTasks.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <div className="mt-6 border rounded-lg shadow-sm dark:bg-gray-800 dark:border-white">
      <div className="flex flex-col sm:flex-row justify-between rounded-t-lg items-start sm:items-center p-3 border-b bg-gray-50 dark:bg-gray-800 dark:border-white gap-3">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">Tasks</h2>
        </div>
        <div className="flex items-center w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border rounded px-2 py-2 text-sm dark:border-white dark:text-white w-full sm:w-auto"
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <table className="w-full border-collapse table-fixed">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-gray-100 dark:bg-gray-800">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border px-2 py-1 text-left dark:border-white"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table
              .getRowModel()
              .rows.slice((page - 1) * pageSize, page * pageSize)
              .map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="border px-2 py-1 dark:border-white"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="border px-2 py-2 text-center italic text-gray-500 dark:border-white dark:text-gray-300"
                >
                  No tasks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        {paginatedTasks.length === 0 ? (
          <div className="p-4 text-center italic text-gray-500 dark:text-gray-300">
            No tasks found.
          </div>
        ) : (
          <div className="divide-y dark:divide-gray-700">
            {paginatedTasks.map((task) => {
              const statusColors: Record<TaskStatus, string> = {
                TODO: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
                IN_PROGRESS:
                  "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
                DONE: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
              };
              const assigneesArray = Array.isArray(task.assignees)
                ? task.assignees
                : task.assignees
                  ? [task.assignees]
                  : [];
              const assigneeNames =
                assigneesArray.length > 0
                  ? assigneesArray.map((a) => a.name).join(", ")
                  : "Unassigned";

              return (
                <div key={task.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base break-words">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 break-words">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(task)}
                        title="Edit task"
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-4 w-4 text-black dark:text-white" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Delete task"
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4 text-black dark:text-white" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. The task{" "}
                              <b>{task.title}</b> will be permanently deleted.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(task.id)}
                              disabled={deleteMutation.isPending}
                            >
                              Confirm
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 dark:text-gray-400 min-w-[80px]">
                        Status:
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${statusColors[task.status]}`}
                      >
                        {task.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-600 dark:text-gray-400 min-w-[80px]">
                        Assignee:
                      </span>
                      <span className="break-words flex-1">
                        {assigneeNames}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 dark:text-gray-400 min-w-[80px]">
                        Due Date:
                      </span>
                      <span>{task.dueDate}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Pagination className="my-2">
        <PaginationContent className="flex justify-between items-center w-full px-2">
          <div>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) setPage(page - 1);
                }}
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </div>
          <div className="flex gap-1 overflow-x-auto max-w-[60vw] sm:max-w-none">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNumber) => (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href="#"
                    isActive={pageNumber === page}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(pageNumber);
                    }}
                    className="min-w-[32px]"
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
          </div>
          <div>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page < totalPages) setPage(page + 1);
                }}
                className={
                  page === totalPages ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
          </div>
        </PaginationContent>
      </Pagination>

      {editingTask && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 dark:bg-black/30 z-40 p-4">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto dark:bg-gray-600">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Edit Task</h2>
              <button onClick={() => setEditingTask(null)}>✖</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm">Title</label>
                <input
                  {...register("title")}
                  className="w-full border rounded px-2 py-1 dark:border-white dark:bg-gray-700"
                />
                {errors.title && (
                  <Alert variant="destructive" className="mt-1">
                    <AlertDescription>{errors.title.message}</AlertDescription>
                  </Alert>
                )}
              </div>
              <div>
                <label className="block text-sm">Description</label>
                <textarea
                  {...register("description")}
                  className="w-full border rounded px-2 py-1 dark:border-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm">Status</label>
                <select
                  {...register("status")}
                  className="w-full border rounded px-2 py-1 dark:border-white dark:bg-gray-700"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2">
                  Assignees <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-2 p-2 border rounded bg-gray-50 dark:bg-gray-700 min-h-10">
                  {editingTask?.assignees &&
                  editingTask.assignees.length > 0 ? (
                    editingTask.assignees.map((assignee) => (
                      <span
                        key={assignee.id}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                      >
                        {assignee.name}
                        <button
                          type="button"
                          onClick={() => toggleTaskAssignee(assignee)}
                          className="hover:bg-blue-600 rounded"
                        >
                          ✖
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">
                      No assignees selected
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowEditAssigneeModal(true)}
                  className="w-full px-2 py-2 text-sm border rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-500 dark:text-white"
                >
                  + Add Assignees
                </button>
              </div>
              <div>
                <label className="block text-sm">Due Date</label>
                <input
                  type="date"
                  {...register("dueDate")}
                  className="w-full border rounded px-2 py-1 dark:border-white dark:bg-gray-700"
                  min={new Date().toISOString().split("T")[0]}
                  max={projectEndDate || undefined}
                />
                {projectEndDate && (
                  <p className="text-xs text-gray-500 mt-1 dark:text-gray-300">
                    Project ends:{" "}
                    {new Date(projectEndDate).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-3 py-1 border bg-transparent rounded text-black dark:border-white dark:text-white w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit(onSave)}
                  disabled={isSubmitting}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-400 text-white rounded flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditAssigneeModal && editingTask && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 dark:bg-black/30 z-50 p-4">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto dark:bg-gray-600">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Select Assignees</h2>
              <button onClick={() => setShowEditAssigneeModal(false)}>
                ✖
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
              {assignees.length === 0 ? (
                <p className="text-gray-500 text-sm">No assignees available</p>
              ) : (
                assignees.map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={
                        Array.isArray(editingTask.assignees)
                          ? editingTask.assignees.some(
                              (assignee) => assignee.id === user.id
                            )
                          : false
                      }
                      onChange={() => toggleTaskAssignee(user)}
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
                onClick={() => setShowEditAssigneeModal(false)}
                className="px-3 py-1 border rounded bg-white hover:bg-gray-400/20 text-gray-800 dark:border-white dark:text-white w-full sm:w-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
