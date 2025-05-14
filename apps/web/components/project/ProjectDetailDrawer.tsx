"use client";

import React, { useEffect, memo, useMemo, useState, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@workspace/ui/components/sheet";
import { Button } from "@workspace/ui/components/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Separator } from "@workspace/ui/components/separator";
import {
  Pencil,
  Trash2,
  UserPlus,
  Calendar,
  ClipboardList,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
} from "lucide-react";
import { Project, useProjectsStore } from "@/app/hooks/useTaskStore";
import { useTasks } from "@/app/hooks/useTasksQuery";
import { Badge } from "@workspace/ui/components/badge";
import { Card } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import Modal from "@/components/Modal";

interface ProjectDetailDrawerProps {
  currentProject: Project | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  openEditDialog: (project: Project) => void;
  openAddUserDialog: (project: Project) => void;
  getMockUserDetails: (userId: string) => {
    name: string;
    avatar?: string;
    role: string;
  };
}

// Memoized task card component to prevent unnecessary re-renders
const TaskCard = memo(({ task, getStatusInfo }: any) => {
  const status = getStatusInfo(task.status);

  return (
    <Card key={task.id} className="p-3">
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-2">
          {status.icon}
          <div>
            <p className="text-sm font-medium">{task.title}</p>
            <p className="text-xs text-gray-500 line-clamp-1">
              {task.description}
            </p>
            {task.assignee && (
              <div className="flex items-center mt-1">
                <Avatar className="h-4 w-4 mr-1">
                  <AvatarFallback className="text-[8px]">
                    {task.assignee.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-gray-500">
                  {task.assignee.name}
                </span>
              </div>
            )}
          </div>
        </div>
        <div>{status.badge}</div>
      </div>
    </Card>
  );
});

// Add display name for memo component
TaskCard.displayName = "TaskCard";

// Memoized member item component
const MemberItem = memo(({ memberId, getMockUserDetails, onRemove }: any) => {
  const user = getMockUserDetails(memberId);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Avatar className="h-8 w-8 mr-3">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-gray-500">{user.role}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-gray-500 hover:text-red-500"
        onClick={() => onRemove(memberId)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
});

MemberItem.displayName = "MemberItem";

export const ProjectDetailDrawer = memo(function ProjectDetailDrawer({
  currentProject,
  isOpen,
  setIsOpen,
  openEditDialog,
  openAddUserDialog,
  getMockUserDetails,
}: ProjectDetailDrawerProps) {
  // Local state for task modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Access project store functions
  const removeUserFromProject = useProjectsStore(
    useCallback((state) => state.removeUserFromProject, [])
  );

  // Fetch tasks for the current project - use empty string as fallback
  // Always call hooks at the top level, even if currentProject is null
  const projectId = currentProject?.id || "";
  const { data: tasks, isLoading: isLoadingTasks } = useTasks(projectId);

  // Memoize the status info function to prevent recreating on each render
  const getStatusInfo = useMemo(() => {
    return (status: string) => {
      switch (status) {
        case "TODO":
          return {
            badge: <Badge variant="outline">To Do</Badge>,
            icon: <Circle className="h-4 w-4 text-gray-400" />,
          };
        case "IN_PROGRESS":
          return {
            badge: <Badge variant="secondary">In Progress</Badge>,
            icon: <Clock className="h-4 w-4 text-blue-500" />,
          };
        case "DONE":
          return {
            badge: (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-800 dark:text-green-100">
                Done
              </Badge>
            ),
            icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
          };
        default:
          return {
            badge: <Badge variant="outline">Unknown</Badge>,
            icon: <Circle className="h-4 w-4" />,
          };
      }
    };
  }, []);

  // Handle removing a user from the project
  const handleRemoveUser = useCallback(
    (userId: string) => {
      if (currentProject) {
        removeUserFromProject(currentProject.id, userId);
      }
    },
    [currentProject, removeUserFromProject]
  );

  // Early return if no project, but after calling hooks
  if (!currentProject) return null;

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto p-4">
          <SheetHeader className="mb-5 p-0">
            <SheetTitle className="text-xl">{currentProject.name}</SheetTitle>
            <SheetDescription>Project details and information</SheetDescription>
          </SheetHeader>

          <div className="space-y-6 px-4">
            {/* Project Overview Section */}
            <div>
              <h3 className="text-lg font-medium mb-2">Overview</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {currentProject.description || "No description provided."}
              </p>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-center">
                  <ClipboardList className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">
                    {currentProject.taskCount} Tasks
                  </span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">
                    Created on {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Team Members Section */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium">Team Members</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsOpen(false);
                    setTimeout(() => openAddUserDialog(currentProject), 300);
                  }}
                >
                  <UserPlus className="h-4 w-4 mr-2" /> Add
                </Button>
              </div>

              {currentProject.members.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No team members yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {currentProject.members.map((memberId, index) => (
                    <MemberItem
                      key={memberId + index}
                      memberId={memberId}
                      getMockUserDetails={getMockUserDetails}
                      onRemove={handleRemoveUser}
                    />
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Tasks Section */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium">Tasks</h3>
                <Button size="sm" onClick={() => setIsTaskModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> New Task
                </Button>
              </div>

              {isLoadingTasks ? (
                // Skeleton loading state for tasks
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-40" />
                          <Skeleton className="h-4 w-64" />
                        </div>
                        <Skeleton className="h-6 w-20" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : !tasks || tasks.length === 0 ? (
                <div className="text-center p-6 border border-dashed rounded-lg">
                  <ClipboardList className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-medium">No tasks yet</p>
                  <p className="text-xs text-gray-500 mb-3">
                    Add your first task to get started
                  </p>
                  <Button size="sm" onClick={() => setIsTaskModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" /> Add Task
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      getStatusInfo={getStatusInfo}
                    />
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Project Timeline (can be implemented later) */}
            <div>
              <h3 className="text-lg font-medium mb-3">Timeline</h3>
              <p className="text-sm text-gray-500">
                A visual timeline of this project's progress will be added soon.
              </p>
            </div>
          </div>

          <SheetFooter className="mt-6 flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setTimeout(() => openEditDialog(currentProject), 300);
              }}
            >
              <Pencil className="h-4 w-4 mr-2" /> Edit Project
            </Button>
            <SheetClose asChild>
              <Button>Close</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Task Creation Modal */}
      <Modal open={isTaskModalOpen} setOpen={setIsTaskModalOpen} />
    </>
  );
});
