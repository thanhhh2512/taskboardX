"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { TaskDetailSkeleton } from "@/components/TaskDetailSkeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Pencil, Trash2, ArrowLeft, Clock } from "lucide-react";
import { format } from "date-fns";
import { TaskType } from "@workspace/types";
import { taskApi } from "@/lib/api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import Modal from "@/components/Modal";

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const taskId = params.id as string;

  const [task, setTask] = useState<TaskType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchTaskDetail = async () => {
      setLoading(true);
      try {
        const taskData = await taskApi.getTaskById(taskId);
        console.log(taskData);
        setTask(taskData.data ?? null);
      } catch (err) {
        console.error("Error fetching task:", err);
        setError("Failed to load task details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetail();
  }, [taskId]);

  const handleGoBack = () => {
    router.back();
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setIsDeleting(true);
      try {
        await taskApi.deleteTask(taskId);

        // Invalidate tasks query to refresh the list
        queryClient.invalidateQueries({ queryKey: ["tasks"] });

        toast.success("Task deleted successfully");
        router.push("/tasks");
      } catch (err) {
        console.error("Error deleting task:", err);
        toast.error("Failed to delete task. Please try again later.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "bg-gray-500 hover:bg-gray-600";
      case "IN_PROGRESS":
        return "bg-blue-500 hover:bg-blue-600";
      case "DONE":
        return "bg-green-500 hover:bg-green-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No date set";
    try {
      return format(new Date(dateString), "PPP");
    } catch (err) {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleGoBack} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to tasks
          </Button>
        </div>
        <TaskDetailSkeleton />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Button variant="ghost" onClick={handleGoBack} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to tasks
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-red-500 mb-4">{error || "Task not found"}</p>
            <Button onClick={handleGoBack}>Return to task list</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <Button variant="ghost" onClick={handleGoBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to tasks
        </Button>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-2xl">{task.title}</CardTitle>
            <Badge className={`${getStatusColor(task.status)} text-white`}>
              {task.status.replace("_", " ")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {task.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Description
              </h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Assignee
              </h3>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  {task.assignee.name.charAt(0).toUpperCase()}
                </div>
                <span>{task.assignee.name}</span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Due Date
              </h3>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Task Modal */}
      <Modal
        open={showEditModal}
        setOpen={setShowEditModal}
        editTask={task}
        showTriggerButton={false}
        onSuccess={() => {
          console.log("success", taskApi);
          // Refresh task data after edit
          taskApi.getTaskById(taskId).then((updatedTask) => {
            setTask(updatedTask.data ?? null);
          });
        }}
      />
    </div>
  );
}
