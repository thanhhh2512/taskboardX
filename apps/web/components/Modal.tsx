import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Calendar } from "@workspace/ui/components/calendar";
import { taskSchema } from "@workspace/types";

import { Dispatch, SetStateAction, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { format } from "date-fns";
import {
  useAssignees,
  useCreateTask,
  useUpdateTask,
  useProjectMembers,
} from "@/app/hooks/useTasksQuery";
import { useProjectStore } from "@/app/hooks/useTaskStore";
import { toast } from "sonner";
import { TaskType } from "@workspace/types";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useNotificationStore } from "@/app/hooks/useNotificationStore";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";

interface ModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  editTask?: TaskType | null;
}

const Modal = ({ open, setOpen, editTask = null }: ModalProps) => {
  const isEditMode = !!editTask;
  const projectId = useProjectStore((state) => state.projectId);
  const addNotification = useNotificationStore(
    (state) => state.addNotification
  );
  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "TODO",
      assignee: "",
      dueDate: "",
    },
  });

  // When editTask changes, update form values
  useEffect(() => {
    if (editTask) {
      form.reset({
        title: editTask.title,
        description: editTask.description,
        status: editTask.status,
        assignee: editTask.assignee.id,
        dueDate: editTask.dueDate,
      });
    } else {
      form.reset({
        title: "",
        description: "",
        status: "TODO",
        assignee: "",
        dueDate: "",
      });
    }
  }, [editTask, form]);

  // Fetch all assignees as fallback
  const { data: allAssignees, isLoading: allAssigneesLoading } = useAssignees();

  // Fetch project-specific members
  const {
    data: projectMembers,
    isLoading: projectMembersLoading,
    isError: projectMembersError,
  } = useProjectMembers(projectId);

  // Determine which assignees to display
  const displayAssignees =
    projectMembers && projectMembers.length > 0 ? projectMembers : allAssignees;

  const isLoading = allAssigneesLoading || projectMembersLoading;

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const handleSubmit = (data: z.infer<typeof taskSchema>) => {
    if (isEditMode && editTask) {
      // Update existing task
      const taskData = {
        ...data,
        id: editTask.id,
        assigneeId: data.assignee,
        projectId: projectId,
      };

      updateTask.mutate(taskData, {
        onSuccess: () => {
          addNotification(
            `Task "${taskData.title}" has been updated`,
            "info",
            "The task have been successfully updated! Please check your task list."
          );
          form.reset();
          setOpen(false);
          toast.success("Task updated successfully", {
            richColors: true,
          });
        },
        onError: () => {
          toast.error("Failed to update task", {
            richColors: true,
          });
        },
      });
    } else {
      // Create new task
      const newId = `task-${Math.random().toString(36).substr(2, 9)}`;
      const taskData = {
        ...data,
        id: newId,
        assigneeId: data.assignee,
        projectId: projectId,
      };

      createTask.mutate(taskData, {
        onSuccess: () => {
          addNotification(
            `Task "${taskData.title}" has been created`,
            "success",
            "The new task have been successfully created! Please check your task list."
          );
          form.reset();
          setOpen(false);
          toast.success("Task created successfully", {
            richColors: true,
          });
        },
        onError: () => {
          toast.error("Failed to create task", {
            richColors: true,
          });
        },
      });
    }
  };

  if (isLoading) {
    return <Skeleton className="w-[100px] h-[20px] rounded-full" />;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">New Task</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Task" : "New Task"}</DialogTitle>
        </DialogHeader>

        {projectMembers && projectMembers.length === 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No project members</AlertTitle>
            <AlertDescription>
              This project has no members assigned. You can assign to any user,
              but consider adding members to the project first.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Title..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Description..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status for task" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="TODO">Todo</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="DONE">Done</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assignee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignee</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select assignee for task" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {displayAssignees?.map((assignee) => {
                        const isProjectMember = projectMembers?.some(
                          (member) => member.id === assignee.id
                        );

                        return (
                          <SelectItem
                            key={assignee.id}
                            value={assignee.id}
                            className={
                              !isProjectMember ? "text-muted-foreground" : ""
                            }
                          >
                            {assignee.name}
                            {projectMembers &&
                              projectMembers.length > 0 &&
                              !isProjectMember && (
                                <span className="ml-2 text-xs text-amber-500">
                                  (not in project)
                                </span>
                              )}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Assignees should be members of the current project. Add
                    users to the project through the Projects page.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "dd-MM-yyyy")
                          ) : (
                            <span>Select date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(date) =>
                          field.onChange(date ? date.toISOString() : "")
                        }
                        disabled={(date) => date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="secondary" type="submit">
                {isEditMode ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
export default Modal;
