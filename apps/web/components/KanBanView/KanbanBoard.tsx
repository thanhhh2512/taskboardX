"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCorners,
} from "@dnd-kit/core";
import { Column, Task, TaskStatus } from "@/app/types";
import { useTaskStore, useTaskSync } from "@/store/useTaskStore";
import ColumnComponent from "@/components/Column";

const columnsDef: Column[] = [
  { id: "TODO", title: "To Do", tasks: [] },
  { id: "IN_PROGRESS", title: "In Progress", tasks: [] },
  { id: "DONE", title: "Done", tasks: [] },
];

export default function KanbanBoard({ projectId }: { projectId: string }) {
  const tasks = useTaskStore((s) => s.tasks);
  const { updateMutation } = useTaskSync(projectId);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const projectTasks = tasks.filter((t) => t.projectId === projectId);

  const columns: Column[] = columnsDef.map((col) => ({
    ...col,
    tasks: projectTasks.filter((t) => t.status === col.id),
  }));

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = String(event.active.id);
    const foundTask = projectTasks.find((t) => t.id === activeId);
    if (foundTask) setActiveTask(foundTask);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const sourceColumn = columns.find((col) =>
      col.tasks.some((t) => t.id === activeId)
    );
    const destinationColumn =
      columns.find((col) => col.tasks.some((t) => t.id === overId)) ||
      columns.find((col) => col.id === overId);

    if (!sourceColumn || !destinationColumn) return;
    if (sourceColumn.id === destinationColumn.id) return;

    const movedTask = sourceColumn.tasks.find((t) => t.id === activeId)!;

    updateMutation.mutate({
      id: movedTask.id,
      updates: { status: destinationColumn.id as TaskStatus },
    });
  };

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col md:flex-row gap-4">
        {columns.map((col) => (
          <ColumnComponent key={col.id} column={col} />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="p-2 bg-white rounded shadow-lg dark:bg-gray-600">
            <div className="font-semibold truncate">{activeTask.title}</div>
            <div className="text-sm text-gray-600 dark:text-gray-200 truncate">
              {activeTask.description}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
