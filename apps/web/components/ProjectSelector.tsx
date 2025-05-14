import { useProjects } from "@/app/hooks/useTasksQuery";
import { useProjectStore } from "@/app/hooks/useTaskStore";
import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { useMediaQuery } from "@/app/hooks/useMediaQuery";

function ProjectSelector() {
  const { data: projects, isLoading } = useProjects();
  const projectId = useProjectStore((state) => state.projectId);
  const setProjectId = useProjectStore((state) => state.setProjectId);
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (isLoading || !projects || projects.length === 0) {
    return null;
  }

  // Determine the default value safely
  const defaultProjectId = projects[0]?.id || "";

  return (
    <Select
      value={projectId}
      onValueChange={(value) => setProjectId(value)}
      defaultValue={defaultProjectId}
    >
      <SelectTrigger className={`${isMobile ? "w-full" : "w-[180px]"}`}>
        <SelectValue placeholder="Select a project" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Project Name</SelectLabel>
          {projects?.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default ProjectSelector;
