"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { Input } from "@workspace/ui/components/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  LayoutList,
  X,
  SearchX,
  ChevronsLeft,
  ChevronsRight,
  AlertTriangle,
} from "lucide-react";
import ProjectSelector from "./ProjectSelector";
import Modal from "./Modal";
import { useEffect, useState } from "react";
import { TaskType } from "@workspace/types";
import { Button } from "@workspace/ui/components/button";
import { useDeleteTask } from "@/app/hooks/useTasksQuery";
import { useProjectStore, useProjectsStore } from "@/app/hooks/useTaskStore";
import { toast } from "sonner";
import { useMediaQuery } from "@/app/hooks/useMediaQuery";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { Badge } from "@workspace/ui/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Label } from "@workspace/ui/components/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { useNotificationStore } from "@/app/hooks/useNotificationStore";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  data,
  columns,
}: DataTableProps<TData, TValue>) {
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
  const projectId = useProjectStore((state) => state.projectId);
  const deleteTask = useDeleteTask();
  const decrementTaskCount = useProjectsStore(
    (state) => state.decrementTaskCount
  );
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Delete confirmation dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TaskType | null>(null);
  const addNotification = useNotificationStore(
    (state) => state.addNotification
  );

  // Adjust page size based on screen size
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
          // Update project task count in the store
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
      console.log("Edit task:", e.detail);
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

  const renderMobileFilters = () => (
    <Sheet open={openFilters} onOpenChange={setOpenFilters}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto flex items-center gap-1"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
          {(columnFilters.length > 0 || globalFilter) && (
            <Badge variant="secondary" className="ml-1">
              {columnFilters.length + (globalFilter ? 1 : 0)}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[280px] sm:w-[380px] p-4">
        <SheetHeader className="p-0">
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>
            Filter tasks by different criteria
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* Global Search */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Search</h3>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full pl-8"
              />
              {globalFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1.5 h-7 w-7 p-0"
                  onClick={() => setGlobalFilter("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Status</h3>
            <Select
              value={
                table.getColumn("status")?.getFilterValue()?.toString() || "all"
              }
              onValueChange={(value) => {
                if (value === "all") {
                  table.getColumn("status")?.setFilterValue(undefined);
                } else {
                  table.getColumn("status")?.setFilterValue(value);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="TODO">To Do</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="DONE">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assignee Filter */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Assignee</h3>
            <Select
              value={
                table.getColumn("assignee")?.getFilterValue()?.toString() ||
                "all"
              }
              onValueChange={(value) => {
                if (value === "all") {
                  table.getColumn("assignee")?.setFilterValue(undefined);
                } else {
                  table.getColumn("assignee")?.setFilterValue(value);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Assignees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Alice">Alice</SelectItem>
                <SelectItem value="Bob">Bob</SelectItem>
                <SelectItem value="Charlie">Charlie</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Column Visibility */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Show/Hide Columns</h3>
            <div className="grid grid-cols-2 gap-4">
              {["title", "status", "assignee", "dueDate"].map((column) => {
                const isVisible = table.getColumn(column)?.getIsVisible();
                return (
                  <div key={column} className="flex items-center space-x-2">
                    <Checkbox
                      id={`column-${column}`}
                      checked={isVisible}
                      onCheckedChange={(checked) => {
                        table.getColumn(column)?.toggleVisibility(!!checked);
                      }}
                    />
                    <Label htmlFor={`column-${column}`}>
                      {column === "title"
                        ? "Title"
                        : column === "status"
                          ? "Status"
                          : column === "assignee"
                            ? "Assignee"
                            : "Due Date"}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setColumnFilters([]);
                setGlobalFilter("");
                setOpenFilters(false);
              }}
            >
              Reset
            </Button>
            <Button onClick={() => setOpenFilters(false)}>Apply</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="rounded-md border dark:border-gray-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b dark:border-gray-700 gap-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <h2 className="text-lg font-semibold dark:text-white">Tasks</h2>
          <ProjectSelector />
        </div>
        <div className="flex items-center gap-2">
          <Modal
            open={openModal}
            setOpen={setOpenModal}
            editTask={editTask}
            showTriggerButton={false}
          />

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Confirm Deletion
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete task "{taskToDelete?.title}"?
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-start gap-2 mt-4">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleConfirmDelete}
                >
                  Yes, Delete
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDeleteConfirmOpen(false);
                    setTaskToDelete(null);
                  }}
                >
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {isMobile ? (
            renderMobileFilters()
          ) : (
            <>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="h-9 w-[200px] pl-8 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    <LayoutList className="h-4 w-4" />
                    <span className="hidden sm:inline">View</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-[180px] dark:bg-gray-800 dark:border-gray-700"
                >
                  {columns.map((column: any) => {
                    if (column.id === "actions") return null;
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id || column.accessorKey}
                        className="capitalize dark:text-white"
                        checked={table
                          .getColumn(column.id || column.accessorKey)
                          ?.getIsVisible()}
                        onCheckedChange={(value: boolean) =>
                          table
                            .getColumn(column.id || column.accessorKey)
                            ?.toggleVisibility(!!value)
                        }
                      >
                        {column.id || column.accessorKey}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="dark:text-white">
          <TableHeader className="dark:bg-gray-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="dark:border-gray-700">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="dark:text-gray-300">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="dark:text-gray-200">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground space-y-3">
                    <SearchX className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    <p className="text-sm font-medium">No results found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 p-4 border-t dark:border-gray-700">
        <div className="text-sm text-muted-foreground dark:text-gray-400">
          {table.getFilteredRowModel().rows.length} task(s) found
        </div>
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
            className="hidden sm:flex dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            title="First Page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            title="Previous Page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            <span className="text-sm dark:text-gray-300">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount() || 1}
            </span>
            {!isMobile && (
              <span className="text-sm text-muted-foreground dark:text-gray-400">
                ({table.getFilteredRowModel().rows.length} items)
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            title="Next Page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
            className="hidden sm:flex dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            title="Last Page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
