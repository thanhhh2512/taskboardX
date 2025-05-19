import React from "react";
import { Table } from "@tanstack/react-table";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Search, LayoutList, Filter } from "lucide-react";
import ProjectSelector from "../ProjectSelector";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Badge } from "@workspace/ui/components/badge";

interface DataTableHeaderProps<TData> {
  table: Table<TData>;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  columnFilters: any[];
  isMobile: boolean;
  renderMobileFilters: () => React.ReactNode;
}

export function DataTableHeader<TData>({
  table,
  globalFilter,
  setGlobalFilter,
  columnFilters,
  isMobile,
  renderMobileFilters,
}: DataTableHeaderProps<TData>) {
  return (
    <div className="flex  sm:flex-row sm:items-center justify-between p-4 border-b dark:border-gray-700 gap-2">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <h2 className="text-lg font-semibold dark:text-white">Tasks</h2>
      </div>
      <div className="flex items-center gap-2">
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
                {table.getAllColumns().map((column) => {
                  if (column.id === "actions") return null;
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize dark:text-white"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </div>
  );
}
