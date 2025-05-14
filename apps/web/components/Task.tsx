"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { TaskProps } from "@workspace/types";
import { format } from "date-fns";
import { Pencil, Calendar, User } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";

export function Task({
  id,
  title,
  description,
  assignee,
  dueDate,
  status,
}: TaskProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
    });

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    document.dispatchEvent(
      new CustomEvent("EDIT_TASK", {
        detail: { id, title, description, assignee, dueDate, status },
      })
    );
  };

  return (
    <Card
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      {...listeners}
      {...attributes}
      className={cn(
        "bg-card border mb-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow transition-all",
        isDragging ? "opacity-50" : "opacity-100"
      )}
    >
      <CardHeader className="p-3 pb-0">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-sm font-medium truncate">
            {title}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full"
            onClick={handleEdit}
          >
            <Pencil className="h-3 w-3" />
          </Button>
        </div>
        {description && (
          <CardDescription className="text-xs line-clamp-2 mt-1">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-3 pt-1">
        <div className="flex flex-wrap gap-1 text-xs text-muted-foreground mt-2">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{assignee.name}</span>
          </div>
          {dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{format(dueDate, "dd MMM")}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
