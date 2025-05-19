"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { Project } from "@/app/hooks/useTaskStore";
import { z } from "zod";
import { useAssignees } from "@/app/hooks/useTasksQuery";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { AlertCircle } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { User } from "@workspace/types";

// Define validation schemas
const projectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
});

const userIdSchema = z.string().min(1, "User ID is required");

interface ProjectDialogsProps {
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  isAddUserDialogOpen: boolean;
  setIsAddUserDialogOpen: (open: boolean) => void;
  currentProject: Project | null;
  formData: {
    name: string;
    description: string;
  };
  userId: string;
  setUserId: (userId: string) => void;
  errors: {
    name?: string;
    description?: string;
    userId?: string;
  };
  setErrors: React.Dispatch<
    React.SetStateAction<{
      name?: string;
      description?: string;
      userId?: string;
    }>
  >;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleAddProject: () => void;
  handleEditProject: () => void;
  handleDeleteProject: () => void;
  handleAddUserToProject: () => void;
  resetForm: () => void;
  isActionPending: boolean;
}

export function ProjectDialogs({
  isAddDialogOpen,
  setIsAddDialogOpen,
  isEditDialogOpen,
  setIsEditDialogOpen,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  isAddUserDialogOpen,
  setIsAddUserDialogOpen,
  currentProject,
  formData,
  userId,
  setUserId,
  errors,
  setErrors,
  handleInputChange,
  handleAddProject,
  handleEditProject,
  handleDeleteProject,
  handleAddUserToProject,
  resetForm,
  isActionPending,
}: ProjectDialogsProps) {
  // Fetch all available users
  const { data: allUsers, isLoading: isLoadingUsers } = useAssignees();

  // Helper function to validate project form using Zod
  const validateProjectForm = (): boolean => {
    try {
      projectSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  // Helper function to validate userId using Zod
  const validateUserId = (): boolean => {
    try {
      userIdSchema.parse(userId);

      // Check if user exists
      const userExists = allUsers?.some((user: User) => user.id === userId);
      if (!userExists) {
        setErrors({
          ...errors,
          userId: "User ID does not exist. Please select from the list below.",
        });
        return false;
      }

      // Check if user is already a member
      if (currentProject?.members.includes(userId)) {
        setErrors({
          ...errors,
          userId: "This user is already a member of the project.",
        });
        return false;
      }

      setErrors({
        ...errors,
        userId: undefined,
      });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({
          ...errors,
          userId: error.errors[0]?.message || "Invalid user ID",
        });
      }
      return false;
    }
  };

  // Wrapper functions that validate before calling the handlers
  const onAddProject = () => {
    if (!validateProjectForm()) return;
    handleAddProject();
  };

  const onEditProject = () => {
    if (!validateProjectForm()) return;
    handleEditProject();
  };

  const onAddUserToProject = () => {
    if (!validateUserId()) return;
    handleAddUserToProject();
  };

  // Filter out users that are already members of the project
  const filteredUsers = allUsers?.filter(
    (user: User) => !currentProject?.members.includes(user.id)
  );

  return (
    <>
      {/* Add Project Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            resetForm();
          } else if (open) {
            // Validate empty fields initially to show required markers
            setErrors({
              name: !formData.name ? "Project name is required" : undefined,
            });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
            <DialogDescription>
              Create a new project by filling out the information below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name <span className="text-red-500">*</span>
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={() => {
                    if (!formData.name.trim()) {
                      setErrors({
                        ...errors,
                        name: "Project name is required",
                      });
                    }
                  }}
                  className={errors.name ? "border-red-500" : ""}
                  placeholder="Enter project name"
                />
                {errors.name && (
                  <p className="text-sm font-medium text-red-500">
                    {errors.name}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <div className="col-span-3 space-y-1">
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={errors.description ? "border-red-500" : ""}
                  placeholder="Enter project description (optional)"
                />
                {errors.description && (
                  <p className="text-sm font-medium text-red-500">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={onAddProject}
              disabled={isActionPending}
            >
              {isActionPending ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            resetForm();
          } else if (open && currentProject) {
            // Validate empty fields initially to show required markers
            setErrors({
              name: !formData.name ? "Project name is required" : undefined,
            });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update project information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name <span className="text-red-500">*</span>
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={() => {
                    if (!formData.name.trim()) {
                      setErrors({
                        ...errors,
                        name: "Project name is required",
                      });
                    }
                  }}
                  className={errors.name ? "border-red-500" : ""}
                  placeholder="Enter project name"
                />
                {errors.name && (
                  <p className="text-sm font-medium text-red-500">
                    {errors.name}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <div className="col-span-3 space-y-1">
                <Textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={errors.description ? "border-red-500" : ""}
                  placeholder="Enter project description (optional)"
                />
                {errors.description && (
                  <p className="text-sm font-medium text-red-500">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={onEditProject}
              disabled={!formData.name.trim() || isActionPending}
            >
              {isActionPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{currentProject?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isActionPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProject}
              disabled={isActionPending}
            >
              {isActionPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User to Project Dialog */}
      <Dialog
        open={isAddUserDialogOpen}
        onOpenChange={(open) => {
          setIsAddUserDialogOpen(open);
          if (!open) {
            setUserId("");
            setErrors({});
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add User to Project</DialogTitle>
            <DialogDescription>
              Add a user to "{currentProject?.name}" to allow them to be
              assigned to tasks in this project.
            </DialogDescription>
          </DialogHeader>

          {isLoadingUsers ? (
            <div className="py-4">
              <Skeleton className="h-10 w-full mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          ) : filteredUsers && filteredUsers.length === 0 ? (
            <Alert variant="default" className="my-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>All users already added</AlertTitle>
              <AlertDescription>
                All available users are already members of this project.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="user-id" className="text-right">
                  User ID <span className="text-red-500">*</span>
                </Label>
                <div className="col-span-3 space-y-1">
                  <Input
                    id="user-id"
                    value={userId}
                    onChange={(e) => {
                      setUserId(e.target.value);
                      if (errors.userId) {
                        setErrors({
                          ...errors,
                          userId: undefined,
                        });
                      }
                    }}
                    className={errors.userId ? "border-red-500" : ""}
                    placeholder="Enter user ID (e.g., user-1)"
                  />
                  {errors.userId && (
                    <p className="text-sm font-medium text-red-500">
                      {errors.userId}
                    </p>
                  )}
                </div>
              </div>

              <Alert variant="default" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Available Users</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 text-sm">
                    {allUsers?.map((user: User) => (
                      <div key={user.id} className="mb-1">
                        <code className="bg-muted px-1 py-0.5 rounded">
                          {user.id}
                        </code>{" "}
                        - {user.name}
                        {currentProject?.members.includes(user.id) && (
                          <span className="ml-2 text-xs text-muted-foreground italic">
                            (already in project)
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>

              <p className="text-sm text-muted-foreground mt-2">
                Users added to this project will be available as assignees for
                tasks within this project.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="submit"
              onClick={onAddUserToProject}
              disabled={!userId.trim() || isLoadingUsers || isActionPending}
            >
              {isActionPending ? "Adding..." : "Add User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
