"use client";

import { ColumnDef } from "@tanstack/react-table";
import { TaskType, User } from "@workspace/types";
import { format } from "date-fns";
import { Button } from "@workspace/ui/components/button";
import {
  Pencil,
  Trash2,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  Filter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { Badge } from "@workspace/ui/components/badge";
import { useProjectMembers } from "@/app/hooks/useTasksQuery";
import { useProjectStore } from "@/app/hooks/useTaskStore";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Column } from "@tanstack/react-table";

// Component for Assignee column header
function AssigneeHeader({ column }: { column: Column<TaskType, unknown> }) {
  const projectId = useProjectStore((state) => state.projectId);
  const { data: projectMembers, isLoading } = useProjectMembers(projectId);

  return (
    <div className="flex items-center space-x-2">
      <span>Assignee</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Filter className="h-4 w-4" />
            {typeof column.getFilterValue() === "string" && (
              <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary"></div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuCheckboxItem
            checked={column.getFilterValue() === undefined}
            onCheckedChange={() => column.setFilterValue(undefined)}
          >
            All
          </DropdownMenuCheckboxItem>
          {isLoading ? (
            <Skeleton className="h-8 w-full" />
          ) : (
            projectMembers?.data?.map((member: User) => (
              <DropdownMenuCheckboxItem
                key={member.id}
                checked={column.getFilterValue() === member.name}
                onCheckedChange={() => column.setFilterValue(member.name)}
              >
                {member.name}
              </DropdownMenuCheckboxItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export const columns: ColumnDef<TaskType>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0"
        >
          Title
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[180px] truncate font-medium">{title}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <div className="flex items-center space-x-2">
          <span>Status</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Filter className="h-4 w-4" />
                {typeof column.getFilterValue() === "string" && (
                  <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary"></div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuCheckboxItem
                checked={column.getFilterValue() === undefined}
                onCheckedChange={() => column.setFilterValue(undefined)}
              >
                All
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={column.getFilterValue() === "TODO"}
                onCheckedChange={() => column.setFilterValue("TODO")}
              >
                To Do
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={column.getFilterValue() === "IN_PROGRESS"}
                onCheckedChange={() => column.setFilterValue("IN_PROGRESS")}
              >
                In Progress
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={column.getFilterValue() === "DONE"}
                onCheckedChange={() => column.setFilterValue("DONE")}
              >
                Done
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "TODO"
              ? "outline"
              : status === "IN_PROGRESS"
                ? "secondary"
                : "default"
          }
          className="whitespace-nowrap"
        >
          {status === "TODO"
            ? "To Do"
            : status === "IN_PROGRESS"
              ? "In Progress"
              : "Done"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value === row.getValue(id);
    },
  },
  {
    accessorKey: "assignee",
    header: ({ column }) => <AssigneeHeader column={column} />,
    cell: ({ row }) => {
      const { name }: { id: string; name: string } = row.getValue("assignee");
      return <div>{name}</div>;
    },
    filterFn: (row, id, value) => {
      const assignee = row.getValue(id) as { id: string; name: string };
      return value === assignee.name;
    },
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0"
        >
          Due Date
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const dueDate = row.getValue("dueDate");
      return (
        <div className="whitespace-nowrap">
          {format(dueDate as string, "dd-MM-yyyy")}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const task = row.original;

      return (
        <div className="flex gap-2 justify-start items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              document.dispatchEvent(
                new CustomEvent("EDIT_TASK", { detail: task })
              );
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              document.dispatchEvent(
                new CustomEvent("DELETE_TASK", { detail: task })
              );
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
