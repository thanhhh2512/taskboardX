import React from "react";
import { Table } from "@tanstack/react-table";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Filter, Search, X } from "lucide-react";
import { User } from "@workspace/types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Label } from "@workspace/ui/components/label";
import { Badge } from "@workspace/ui/components/badge";
import { useProjectStore } from "@/app/hooks/useTaskStore";
import { useProjectMembers } from "@/app/hooks/useTasksQuery";
import { Skeleton } from "@workspace/ui/components/skeleton";

interface DataTableFiltersProps<TData> {
  table: Table<TData>;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  columnFilters: any[];
  setColumnFilters: (filters: any[]) => void;
  openFilters: boolean;
  setOpenFilters: (open: boolean) => void;
}

export function DataTableFilters<TData>({
  table,
  globalFilter,
  setGlobalFilter,
  columnFilters,
  setColumnFilters,
  openFilters,
  setOpenFilters,
}: DataTableFiltersProps<TData>) {
  const projectId = useProjectStore((state) => state.projectId);
  const { data: projectMembers, isLoading: isLoadingMembers } =
    useProjectMembers(projectId);

  return (
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
            {isLoadingMembers ? (
              <Skeleton className="h-10 w-full" />
            ) : (
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
                  {(projectMembers?.members as unknown as User[])?.map(
                    (member: User) => (
                      <SelectItem key={member.id} value={member.name}>
                        {member.name}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            )}
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
}
