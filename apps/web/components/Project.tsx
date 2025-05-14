"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import {
  Plus,
  Pencil,
  MoreVertical,
  Calendar,
  Users,
  ClipboardList,
} from "lucide-react";
import {
  useProjectsStore,
  Project,
  useProjectStore,
} from "@/app/hooks/useTaskStore";
import { useNotificationStore } from "@/app/hooks/useNotificationStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { ProjectDetailDrawer } from "./project/ProjectDetailDrawer";
import { ProjectDialogs } from "./project/ProjectDialogs";
import { toast } from "sonner";

// Mock user data for project members display
const getMockUserDetails = (userId: string) => {
  const userMap: Record<
    string,
    { name: string; avatar?: string; role: string }
  > = {
    user1: {
      name: "John Doe",
      avatar: "https://api.dicebear.com/7.x/personas/svg?seed=John",
      role: "Project Manager",
    },
    user2: {
      name: "Jane Smith",
      avatar: "https://api.dicebear.com/7.x/personas/svg?seed=Jane",
      role: "Developer",
    },
    user3: {
      name: "Mike Johnson",
      avatar: "https://api.dicebear.com/7.x/personas/svg?seed=Mike",
      role: "Designer",
    },
  };

  return userMap[userId] || { name: userId, role: "Team Member" };
};

// ProjectCard Skeleton Component
const ProjectCardSkeleton = () => (
  <Card className="relative">
    <CardHeader className="pb-2">
      <div className="flex justify-between items-start">
        <Skeleton className="h-6 w-[140px] mb-2" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
      <Skeleton className="h-4 w-full max-w-[250px]" />
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <Skeleton className="h-4 w-[120px]" />
        <Skeleton className="h-4 w-[100px]" />
      </div>
      <div className="flex -space-x-2 mt-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </CardContent>
    <CardFooter className="pt-2">
      <Skeleton className="h-9 w-full" />
    </CardFooter>
  </Card>
);

export function ProjectList() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [userId, setUserId] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    userId?: string;
  }>({});

  // Get projects data and actions from the store
  const projects = useProjectsStore((state) => state.projects);
  const isLoading = useProjectsStore((state) => state.isLoading);
  const initializeProjects = useProjectsStore(
    (state) => state.initializeProjects
  );
  const addProject = useProjectsStore((state) => state.addProject);
  const updateProject = useProjectsStore((state) => state.updateProject);
  const deleteProject = useProjectsStore((state) => state.deleteProject);
  const addUserToProject = useProjectsStore((state) => state.addUserToProject);
  const setProjectId = useProjectStore((state) => state.setProjectId);

  // Get notification actions
  const addNotification = useNotificationStore(
    (state) => state.addNotification
  );

  // Initialize projects on component mount
  useEffect(() => {
    if (isLoading) {
      initializeProjects();
    }
  }, [isLoading, initializeProjects]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error for this field when user types
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
    });
    setCurrentProject(null);
    setErrors({});
  };

  const handleAddProject = () => {
    const newProject = addProject(formData.name, formData.description);

    // Make the new project current in the project store
    setProjectId(newProject.id);

    // Add notification for new project
    addNotification(
      `Project "${formData.name}" has been created`,
      "success",
      "The new project has been added to your projects list."
    );
    toast.success("Project added successfully", {
      richColors: true,
    });
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditProject = () => {
    if (!currentProject) return;

    updateProject(currentProject.id, {
      name: formData.name,
      description: formData.description,
    });

    // Add notification for project update
    addNotification(
      `Project "${currentProject.name}" has been updated`,
      "info",
      "The project details have been successfully updated."
    );

    setIsEditDialogOpen(false);
    toast.success("Project updated successfully", {
      richColors: true,
    });
    resetForm();
  };

  const handleDeleteProject = () => {
    if (!currentProject) return;

    const projectName = currentProject.name;
    deleteProject(currentProject.id);

    // Add notification for project deletion
    addNotification(
      `Project "${projectName}" has been deleted`,
      "warning",
      "The project and its data have been removed."
    );

    setIsDeleteDialogOpen(false);
  };

  const handleAddUserToProject = () => {
    if (!currentProject) return;

    addUserToProject(currentProject.id, userId);

    // Get user details for better notification message
    const userDetails = getMockUserDetails(userId);

    // Add notification for adding user to project
    addNotification(
      `${userDetails.name} added to project "${currentProject.name}"`,
      "success",
      `${userDetails.name} can now be assigned to tasks in this project.`
    );

    toast.success(`${userDetails.name} added to project successfully`, {
      richColors: true,
      description:
        "This user is now available as a task assignee in this project.",
    });

    setIsAddUserDialogOpen(false);
    setUserId("");
  };

  const openEditDialog = (project: Project) => {
    setCurrentProject(project);
    setFormData({
      name: project.name,
      description: project.description,
    });
    setIsEditDialogOpen(true);
    setErrors({});
  };

  const openDeleteDialog = (project: Project) => {
    setCurrentProject(project);
    setIsDeleteDialogOpen(true);
  };

  const openAddUserDialog = (project: Project) => {
    setCurrentProject(project);
    setIsAddUserDialogOpen(true);
    setUserId("");
    setErrors({});
  };

  const openDetailsDrawer = (project: Project) => {
    setCurrentProject(project);
    setIsDetailsDrawerOpen(true);
  };

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Projects</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Show skeleton cards when loading
          Array(6)
            .fill(0)
            .map((_, index) => <ProjectCardSkeleton key={index} />)
        ) : projects.length === 0 ? (
          // Show empty state when no projects
          <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <ClipboardList className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first project to get started
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Project
            </Button>
          </div>
        ) : (
          // Show actual project cards
          projects.map((project) => (
            <Card key={project.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="mr-8">{project.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-3 right-3 h-8 w-8"
                      >
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => openDetailsDrawer(project)}
                      >
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(project)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openAddUserDialog(project)}
                      >
                        Add User
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openDeleteDialog(project)}
                        className="text-red-600 focus:text-red-600"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription className="line-clamp-2">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <ClipboardList className="h-4 w-4 mr-1" />
                  {project.taskCount} tasks
                </div>
                <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <Users className="h-4 w-4 mr-1" />
                  {project.members.length} members
                </div>
                {project.members.length > 0 && (
                  <div className="flex -space-x-2 mt-3">
                    {project.members.slice(0, 3).map((memberId, index) => {
                      const user = getMockUserDetails(memberId);
                      return (
                        <Avatar
                          key={index}
                          className="h-8 w-8 border-2 border-white dark:border-gray-800"
                        >
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      );
                    })}
                    {project.members.length > 3 && (
                      <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium border-2 border-white dark:border-gray-800">
                        +{project.members.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => openDetailsDrawer(project)}
                  className="w-full"
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Project Dialogs */}
      <ProjectDialogs
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        isAddUserDialogOpen={isAddUserDialogOpen}
        setIsAddUserDialogOpen={setIsAddUserDialogOpen}
        currentProject={currentProject}
        formData={formData}
        userId={userId}
        setUserId={setUserId}
        errors={errors}
        setErrors={setErrors}
        handleInputChange={handleInputChange}
        handleAddProject={handleAddProject}
        handleEditProject={handleEditProject}
        handleDeleteProject={handleDeleteProject}
        handleAddUserToProject={handleAddUserToProject}
        resetForm={resetForm}
      />

      {/* Project Detail Drawer */}
      <ProjectDetailDrawer
        currentProject={currentProject}
        isOpen={isDetailsDrawerOpen}
        setIsOpen={setIsDetailsDrawerOpen}
        openEditDialog={openEditDialog}
        openAddUserDialog={openAddUserDialog}
        getMockUserDetails={getMockUserDetails}
      />
    </div>
  );
}

export default ProjectList;
