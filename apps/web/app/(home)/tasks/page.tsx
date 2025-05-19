"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { PlusCircle, Search, RefreshCw } from "lucide-react";
import TaskCard from "@/components/TaskCard";
import { useProjects, useTasks } from "@/app/hooks/useTasksQuery";
import { useProjectStore } from "@/app/hooks/useTaskStore";
import Modal from "@/components/Modal";
import { TaskStatus } from "@workspace/types";

export default function TasksPage() {
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const setProjectId = useProjectStore((state) => state.setProjectId);
  const projectId = useProjectStore((state) => state.projectId);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: tasks, isLoading: tasksLoading } = useTasks(projectId);
  const [filteredTasks, setFilteredTasks] = useState(tasks || []);

  // Function to refresh task data
  const refreshTasks = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Apply filters when tasks, search term, or status filter changes
  useEffect(() => {
    if (!tasks) {
      setFilteredTasks([]);
      return;
    }

    let filtered = [...tasks];

    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(lowerSearchTerm) ||
          (task.description &&
            task.description.toLowerCase().includes(lowerSearchTerm))
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, statusFilter]);

  return (
    <div className="container p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Task Management
        </h1>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Task</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={refreshTasks}
            title="Refresh tasks"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            placeholder="Search tasks..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select
          value={projectId }
          onValueChange={(value) => setProjectId( value)}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Select Project" />
          </SelectTrigger>
          <SelectContent>
            
            {projects?.map((project: { id: string; name: string }) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value as TaskStatus | "all")
          }
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="TODO">To Do</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="DONE">Done</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Search results summary */}
      {searchTerm && (
        <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Found {filteredTasks.length} result
          {filteredTasks.length !== 1 ? "s" : ""}
          {statusFilter !== "all" ? ` with status "${statusFilter}"` : ""}
          for "{searchTerm}"
        </div>
      )}

      {/* Status filter summary when no search */}
      {!searchTerm && statusFilter !== "all" && (
        <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredTasks.length} task
          {filteredTasks.length !== 1 ? "s" : ""} with status "{statusFilter}"
        </div>
      )}

      {/* Pass filtered tasks to TaskCard if available */}
      <div key={refreshKey}>
        <TaskCard
          customTasks={
            searchTerm || statusFilter !== "all" ? filteredTasks : undefined
          }
          hideProjectSelector={true}
        />
      </div>

      {/* No results message */}
      {(searchTerm || statusFilter !== "all") &&
        filteredTasks.length === 0 &&
        !tasksLoading && (
          <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg mt-4">
            <p className="text-gray-500 dark:text-gray-400">
              No tasks found matching your criteria. Try adjusting your filters.
            </p>
          </div>
        )}

      {/* New Task Modal */}
      <Modal
        open={showModal}
        setOpen={setShowModal}
        editTask={null}
        showTriggerButton={false}
      />
    </div>
  );
}
