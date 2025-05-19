import React from "react";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft } from "lucide-react";
import { TaskDetailSkeleton } from "@/components/TaskDetailSkeleton";

export default function TaskDetailLoading() {
  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" disabled className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to tasks
        </Button>
      </div>
      <TaskDetailSkeleton />
    </div>
  );
}
