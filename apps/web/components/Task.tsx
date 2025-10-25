"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Pencil, Calendar, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@workspace/ui/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";

interface TaskProps {
  id: string;
  title: string;
  description?: string;
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  dueDate?: string;
  status: string;
  onEdit?: () => void;
}

export function Task({
  id,
  title,
  description,
  assignee,
  dueDate,
  onEdit,
}: TaskProps) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useSortable({ id });

  const handleTaskClick = () => {
    router.push(`/tasks/${id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit();
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      {...listeners}
      {...attributes}
      className={cn(
        "bg-card border mb-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow transition-all relative",
        isDragging ? "opacity-50" : "opacity-100"
      )}
      onClick={handleTaskClick}
    >
      <CardHeader className="p-3 pb-0">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-sm font-medium truncate">
            {title}
          </CardTitle>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={handleEdit}
            >
              <Pencil className="h-3 w-3" />
            </Button>
          </div>
        </div>
        {description && (
          <CardDescription className="text-xs line-clamp-2 mt-1">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-3 pt-1">
        <div className="flex flex-wrap gap-1 text-xs text-muted-foreground mt-2">
          {assignee && (
            <div className="flex items-center gap-1">
              <Avatar className="h-4 w-4">
                <AvatarImage src={assignee.avatar} alt={assignee.name} />
                <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>{assignee.name}</span>
            </div>
          )}
          {dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(dueDate), "dd MMM")}</span>
            </div>
          )}
        </div>
      </CardContent>
      <div className="absolute bottom-2 right-2">
        <ExternalLink className="h-3 w-3 text-gray-400" />
      </div>
    </Card>
  );
}
