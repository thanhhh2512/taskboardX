import React from "react";
import { Button } from "@workspace/ui/components/button";
import { Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  isMobile: boolean;
}

export function DataTablePagination<TData>({
  table,
  isMobile,
}: DataTablePaginationProps<TData>) {
  return (
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
  );
}
