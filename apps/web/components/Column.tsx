"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { cn } from "@workspace/ui/lib/utils";
import React from "react";
type ColumnProps = {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
};

export const Column = ({ id, title, children, className }: ColumnProps) => {
  const { setNodeRef } = useDroppable({ id });
  const hasItems = React.Children.count(children) > 0;

  return (
    <Card ref={setNodeRef} className={cn("w-full", className)}>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="text-sm text-muted-foreground">
            {React.Children.count(children)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <ScrollArea className="h-[calc(100%-1rem)] max-h-[calc(100vh-220px)]">
          <div className="p-2 space-y-3">
            {hasItems ? (
              children
            ) : (
              <div className="flex items-center justify-center h-20 border border-dashed rounded-md bg-muted/30">
                <p className="text-sm text-muted-foreground">No tasks</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
