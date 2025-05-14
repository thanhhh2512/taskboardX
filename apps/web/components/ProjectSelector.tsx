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

  // Force refetch on component mount
  useEffect(() => {
    refetch();

    // Set up polling for latest projects
    const intervalId = setInterval(() => {
      refetch();
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(intervalId);
  }, [refetch]);

  // Listen for changes in storeProjects and trigger refetch
  useEffect(() => {
    // Manually invalidate the projects query cache
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    refetch();
  }, [storeProjects, queryClient, refetch]);

  // Use API projects as the base
  const combinedProjects = [...(projects || [])];

  // Convert store projects to compatible format and add any that aren't in the API results yet
  storeProjects.forEach((storeProject) => {
    // Only add if not already in the API results
    if (!combinedProjects.some((p) => p.id === storeProject.id)) {
      // Convert store project to API project format
      const apiProject: ProjectType = {
        id: storeProject.id,
        name: storeProject.name,
        createdAt: new Date().toISOString(), // Use current time as fallback
      };
      combinedProjects.push(apiProject);
    }
  });

  // Break early if we don't have projects from either source
  if (isLoading && combinedProjects.length === 0) {
    return null;
  }

  // Determine the default value safely
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
