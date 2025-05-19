import { useProjects } from "@/app/hooks/useTasksQuery";
import { useProjectStore, useProjectsStore } from "@/app/hooks/useTaskStore";
import React, { useEffect } from "react";
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
import { useQueryClient } from "@tanstack/react-query";
import { Project as ProjectType } from "@workspace/types";

function ProjectSelector() {
  const queryClient = useQueryClient();
  const { data: projects, isLoading, refetch } = useProjects();
  const projectId = useProjectStore((state) => state.projectId);
  const setProjectId = useProjectStore((state) => state.setProjectId);
  const storeProjects = useProjectsStore((state) => state.projects);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    refetch();
    const intervalId = setInterval(() => {
      refetch();
    }, 2000); 

    return () => clearInterval(intervalId);
  }, [refetch]);


  useEffect(() => {

    queryClient.invalidateQueries({ queryKey: ["projects"] });
    refetch();
  }, [storeProjects, queryClient, refetch]);


  const combinedProjects = [...(projects || [])];


  storeProjects.forEach((storeProject) => {

    if (!combinedProjects.some((p) => p.id === storeProject.id)) {

      const apiProject: ProjectType = {
        id: storeProject.id,
        name: storeProject.name,
        createdAt: new Date().toISOString(), 
      };
      combinedProjects.push(apiProject);
    }
  });


  if (isLoading && combinedProjects.length === 0) {
    return <div>Loading...</div>;

  }

  const defaultProjectId = combinedProjects[0]?.id || "";

  return (
    <Select
      value={projectId || defaultProjectId}
      onValueChange={(value) => setProjectId(value)}
      defaultValue={defaultProjectId}
    >
      <SelectTrigger className={`${isMobile ? "w-full" : "w-[180px]"}`}>
        <SelectValue placeholder="Select a project" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Project Name</SelectLabel>
          {combinedProjects.map((project) => (
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
