"use client";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import Kanban from "./Kanban";
import { DataTable } from "./Table";
import { columns } from "./tablecolumn";
import { useProjects, useTasks } from "@/app/hooks/useTasksQuery";
import { useProjectStore } from "@/app/hooks/useTaskStore";
import { TaskType } from "@workspace/types";

interface TaskCardProps {
  hideProjectSelector?: boolean;
  customTasks?: TaskType[];
}

const TaskCard = ({ hideProjectSelector = false, customTasks }: TaskCardProps) => {
  const projectId = useProjectStore((state) => state.projectId);
  const { data: tasks, isLoading } = useTasks(projectId);

  const displayTasks = customTasks || tasks || [];

  return (
    <div className="h-full w-full flex flex-col gap-4 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
      <Tabs defaultValue="kanban" className="w-full">
        <div className="flex items-center gap-4 mb-2">
          <span className="text-lg font-medium text-gray-900 dark:text-white whitespace-nowrap">
            Switch Views:
          </span>
          <TabsList className="dark:bg-gray-800 flex gap-2">
            <TabsTrigger
              value="kanban"
              className="dark:data-[state=active]:bg-gray-700"
            >
              Kanban
            </TabsTrigger>
            <TabsTrigger
              value="table"
              className="dark:data-[state=active]:bg-gray-700"
            >
              Table
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="kanban">
          <Kanban 
            tasks={displayTasks} 
            isLoading={isLoading && !customTasks} 
            hideProjectSelector={hideProjectSelector} 
          />
        </TabsContent>
        <TabsContent value="table">
          <DataTable columns={columns} data={displayTasks} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskCard;
