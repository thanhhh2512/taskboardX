import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { AlertCircle } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { useProjectStore } from "@/app/hooks/useTaskStore";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { TaskType, User } from "@workspace/types";
import { useProjectMembers } from "@/app/hooks/useTasksQuery";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import TaskForm from "./TaskForm";

interface ModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  editTask?: TaskType | null;
  showTriggerButton?: boolean;
  onSuccess?: () => void;
}

const Modal = ({
  open,
  setOpen,
  editTask = null,
  showTriggerButton = true,
  onSuccess,
}: ModalProps) => {
  const isEditMode = !!editTask;
  const projectId = useProjectStore((state) => state.projectId);

  // Fetch project-specific members
  const { data: projectMembers, isLoading: projectMembersLoading } =
    useProjectMembers(projectId);

  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {showTriggerButton && (
        <DialogTrigger asChild>
          <Button variant="outline">New Task</Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Task" : "New Task"}</DialogTitle>
        </DialogHeader>

        {projectMembersLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <>
            {(!projectMembers?.members ||
              (projectMembers.members as unknown as User[]).length === 0) && (
              <Alert variant="default" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No project members</AlertTitle>
                <AlertDescription>
                  This project has no members assigned. You can assign to any
                  user, but consider adding members to the project first.
                </AlertDescription>
              </Alert>
            )}

            <TaskForm
              projectId={projectId}
              initialData={editTask || undefined}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
