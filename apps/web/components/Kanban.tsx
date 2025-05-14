"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { Task } from "./Task";
import { Column } from "./Column";
import { ColumnType, Project, TaskStatus, TaskType } from "@workspace/types";
import Modal from "./Modal";
import { useUpdateTaskStatus } from "@/app/hooks/useTasksQuery";
import { useProjectStore } from "@/app/hooks/useTaskStore";
import ProjectSelector from "./ProjectSelector";
import { useMediaQuery } from "@/app/hooks/useMediaQuery";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";
import { Skeleton } from "@workspace/ui/components/skeleton";

// Initial data
const columns: ColumnType[] = [
  {
    id: "TODO",
    title: "To Do",
  },
  {
    id: "IN_PROGRESS",
    title: "In Progress",
  },
  {
    id: "DONE",
    title: "Done",
  },
];

// Memorized Task component to prevent unnecessary re-renders
const MemoizedTask = memo(Task);

// Memorized Column component
const MemoizedColumn = memo(Column);

// Skeleton for Kanban columns
const KanbanSkeleton = memo(
  ({ isMobile, isTablet }: { isMobile: boolean; isTablet: boolean }) => {
    if (isMobile) {
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="w-8 h-8 rounded-full dark:bg-gray-700" />
            <Skeleton className="w-32 h-8 rounded-md dark:bg-gray-700" />
            <Skeleton className="w-8 h-8 rounded-full dark:bg-gray-700" />
          </div>
          <div className="space-y-3">
            <Skeleton className="w-full h-[calc(100vh-240px)] rounded-md dark:bg-gray-700" />
          </div>
        </div>
      );
    }

    const colCount = isTablet ? 2 : 3;
    return (
      <div className={`grid grid-cols-${colCount} gap-4`}>
        {Array(colCount)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="w-full h-10 rounded-md dark:bg-gray-700" />
              <Skeleton className="w-full h-[calc(100vh-240px)] rounded-md dark:bg-gray-700" />
            </div>
          ))}
      </div>
    );
  }
);

KanbanSkeleton.displayName = "KanbanSkeleton";

const Kanban = ({
  tasks,
  isLoading,
  hideProjectSelector = false,
}: {
  tasks: TaskType[];
  isLoading: boolean;
  hideProjectSelector?: boolean;
}) => {
  const updateStatus = useUpdateTaskStatus();
  const projectId = useProjectStore((state) => state.projectId);
  const [openModal, setOpenModal] = useState(false);
  const [activeTask, setActiveTask] = useState<TaskType | null>(null);
  const [editTask, setEditTask] = useState<TaskType | null>(null);
  const [activeColumn, setActiveColumn] = useState<number>(0);

  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");

  // Handle mobile view column navigation
  const handlePrevColumn = useCallback(() => {
    setActiveColumn((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleNextColumn = useCallback(() => {
    setActiveColumn((prev) => (prev < columns.length - 1 ? prev + 1 : prev));
  }, []);

  // Reset active column when screen size changes
  useEffect(() => {
    setActiveColumn(0);
  }, [isMobile, isTablet]);

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Handle drag start
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const taskId = active.id as string;

      // Find the task that is being dragged
      const draggedTask = tasks?.find((task) => task.id === taskId);

      if (draggedTask) {
        setActiveTask(draggedTask);
      }
    },
    [tasks]
  );

  // Handle drag end
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over) {
        setActiveTask(null);
        return;
      }

      const activeTaskId = active.id as string;
      const overColumnId = over.id as TaskStatus;

      // Find the source column (where the task is coming from)
      const sourceColumn = columns.find(
        (column) => column.id === activeTask?.status
      );

      // Find the destination column
      const destinationColumn = columns.find(
        (column) => column.id === overColumnId
      );

      if (!sourceColumn || !destinationColumn) {
        setActiveTask(null);
        return;
      }

      if (sourceColumn.id === destinationColumn.id) {
        setActiveTask(null);
        return;
      }

      // Update the task status
      updateStatus.mutate(
        {
          taskId: activeTaskId,
          status: overColumnId,
          projectId: projectId,
        },
        {
          onSuccess: () => {
            toast.success(`Task moved to ${destinationColumn.title}`, {
              richColors: true,
            });
          },
          onError: () => {
            toast.error("Failed to update task status", {
              richColors: true,
            });
          },
        }
      );
      setActiveTask(null);
    },
    [activeTask, projectId, updateStatus]
  );

  // Handle edit task
  useEffect(() => {
    const handleEditTask = (e: CustomEvent<TaskType>) => {
      setEditTask(e.detail);
      setOpenModal(true);
    };

    document.addEventListener("EDIT_TASK", handleEditTask as EventListener);

    return () => {
      document.removeEventListener(
        "EDIT_TASK",
        handleEditTask as EventListener
      );
    };
  }, []);

  // Reset edit task when modal closes
  useEffect(() => {
    if (!openModal) {
      setEditTask(null);
    }
  }, [openModal]);

  const renderMobileView = useCallback(() => {
    // Đảm bảo activeColumn trong phạm vi của mảng columns
    const safeActiveColumn = Math.min(
      Math.max(0, activeColumn),
      columns.length - 1
    );
    // Sử dụng as để đảm bảo TypeScript biết rằng giá trị này không thể undefined
    const currentColumn = columns[safeActiveColumn] as ColumnType;

    return (
      <>
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevColumn}
            disabled={safeActiveColumn === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-medium">{currentColumn.title}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextColumn}
            disabled={safeActiveColumn === columns.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <MemoizedColumn
          key={currentColumn.id}
          id={currentColumn.id}
          title={currentColumn.title}
          className="h-[calc(100vh-180px)]"
        >
          {tasks
            ?.filter((task) => task.status === currentColumn.id)
            .map((task) => <MemoizedTask key={task.id} {...task} />)}
        </MemoizedColumn>
      </>
    );
  }, [activeColumn, handleNextColumn, handlePrevColumn, tasks]);

  const renderTabletView = useCallback(
    () => (
      <div className="grid grid-cols-2 gap-4">
        {columns.map((column) => (
          <MemoizedColumn
            key={column.id}
            id={column.id}
            title={column.title}
            className="h-[calc(100vh-180px)]"
          >
            {tasks
              ?.filter((task) => task.status === column.id)
              .map((task) => <MemoizedTask key={task.id} {...task} />)}
          </MemoizedColumn>
        ))}
      </div>
    ),
    [tasks]
  );

  const renderDesktopView = useCallback(
    () => (
      <div className="grid grid-cols-3 gap-4">
        {columns.map((column) => (
          <MemoizedColumn
            key={column.id}
            id={column.id}
            title={column.title}
            className="h-[calc(100vh-180px)]"
          >
            {tasks
              ?.filter((task) => task.status === column.id)
              .map((task) => <MemoizedTask key={task.id} {...task} />)}
          </MemoizedColumn>
        ))}
      </div>
    ),
    [tasks]
  );

  return (
    <div className="flex flex-col h-full">
      {/* header */}
      {!hideProjectSelector && (
        <div className="w-full h-16 flex flex-col sm:flex-row items-center justify-between sm:pr-4 gap-2 mb-4">
          <div className="w-full sm:w-auto">
            <ProjectSelector />
          </div>
          <Modal open={openModal} setOpen={setOpenModal} editTask={editTask} />
        </div>
      )}

      {/* Always show the modal button, even when ProjectSelector is hidden */}
      {hideProjectSelector && (
        <div className="w-full flex justify-end mb-4">
          <Modal open={openModal} setOpen={setOpenModal} editTask={editTask} />
        </div>
      )}

      {/* kanban */}
      <ScrollArea className="w-full flex-1 rounded-md border dark:border-gray-700">
        <div className="p-4">
          {isLoading ? (
            <KanbanSkeleton isMobile={isMobile} isTablet={isTablet} />
          ) : (
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              {isMobile
                ? renderMobileView()
                : isTablet
                  ? renderTabletView()
                  : renderDesktopView()}

              {/* Drag overlay shows the task being dragged */}
              <DragOverlay>
                {activeTask ? <MemoizedTask {...activeTask} /> : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>
        <ScrollBar orientation="horizontal" className="dark:bg-gray-800" />
      </ScrollArea>
    </div>
  );
};

export default Kanban;
