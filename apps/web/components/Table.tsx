"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { TaskType } from "@workspace/types";
import { useDeleteTask } from "@/app/hooks/useTasksQuery";
import { useProjectStore, useProjectsStore } from "@/app/hooks/useTaskStore";
import { toast } from "sonner";
import { useMediaQuery } from "@/app/hooks/useMediaQuery";
import { useRouter } from "next/navigation";
import { useNotificationStore } from "@/app/hooks/useNotificationStore";
import Modal from "./Modal";

// Import modular components
import {
  DataTableContent,
  DataTableFilters,
  DataTableHeader,
  DataTablePagination,
  DeleteConfirmDialog,
} from "./table-components";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  data,
  columns,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editTask, setEditTask] = useState<TaskType | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [openFilters, setOpenFilters] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 8,
  });

  // Store hooks
  const projectId = useProjectStore((state) => state.projectId);
  const decrementTaskCount = useProjectsStore(
    (state) => state.decrementTaskCount
  );
  const addNotification = useNotificationStore(
    (state) => state.addNotification
  );

  const deleteTask = useDeleteTask();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TaskType | null>(null);

  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageSize: isMobile ? 5 : 8,
    }));
  }, [isMobile]);

  // Set responsive column visibility
  useEffect(() => {
    if (isMobile) {
      setColumnVisibility({
        title: true,
        status: true,
        actions: true,
        assignee: false,
        dueDate: false,
      });
    } else {
      setColumnVisibility({
        title: true,
        status: true,
        assignee: true,
        dueDate: true,
        actions: true,
      });
    }
  }, [isMobile]);

  // Table instance
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      pagination,
    },
  });

  // Function to handle task deletion
  const handleConfirmDelete = () => {
    if (!taskToDelete) return;

    deleteTask.mutate(
      { taskId: taskToDelete.id, projectId },
      {
        onSuccess: () => {
          decrementTaskCount(projectId);

          addNotification(
            `Task "${taskToDelete.title}" has been deleted.`,
            "warning",
            "The task has been successfully deleted."
          );
          toast.success("Task deleted successfully", {
            richColors: true,
          });
          setDeleteConfirmOpen(false);
          setTaskToDelete(null);
        },
        onError: () => {
          toast.error("Failed to delete task", {
            richColors: true,
          });
          setDeleteConfirmOpen(false);
        },
      }
    );
  };

  useEffect(() => {
    const handleEditTask = (e: CustomEvent<TaskType>) => {
      setEditTask(e.detail);
      setOpenModal(true);
    };

    const handleDeleteTask = (e: CustomEvent<TaskType>) => {
      setTaskToDelete(e.detail);
      setDeleteConfirmOpen(true);
    };

    document.addEventListener("EDIT_TASK", handleEditTask as EventListener);
    document.addEventListener("DELETE_TASK", handleDeleteTask as EventListener);

    return () => {
      document.removeEventListener(
        "EDIT_TASK",
        handleEditTask as EventListener
      );
      document.removeEventListener(
        "DELETE_TASK",
        handleDeleteTask as EventListener
      );
    };
  }, [deleteTask, projectId]);

  useEffect(() => {
    if (!openModal) {
      setEditTask(null);
    }
  }, [openModal]);

  const handleRowClick = (task: any) => {
    router.push(`/tasks/${task.id}`);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setTaskToDelete(null);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border dark:border-gray-700">
        {/* Table Header with search and filters */}
        <DataTableHeader
          table={table}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          columnFilters={columnFilters}
          isMobile={isMobile}
          renderMobileFilters={() => (
            <DataTableFilters
              table={table}
              globalFilter={globalFilter}
              setGlobalFilter={setGlobalFilter}
              columnFilters={columnFilters}
              setColumnFilters={setColumnFilters}
              openFilters={openFilters}
              setOpenFilters={setOpenFilters}
            />
          )}
        />
      </div>

      {/* Table Content */}
      <DataTableContent
        table={table}
        globalFilter={globalFilter}
        columnFilters={columnFilters}
        onRowClick={handleRowClick}
      />

      {/* Pagination */}
      <DataTablePagination table={table} isMobile={isMobile} />

      {/* Modals and Dialogs */}
      <Modal
        open={openModal}
        setOpen={setOpenModal}
        editTask={editTask}
        showTriggerButton={false}
      />

      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        setOpen={setDeleteConfirmOpen}
        taskToDelete={taskToDelete}
        onConfirmDelete={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
