import { useQuery } from "@tanstack/react-query";

export interface ProjectMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface ProjectMembersResponse {
  members: ProjectMember[];
}

export function useProjectMembers(projectId: string) {
  return useQuery<ProjectMembersResponse>({
    queryKey: ["project-members", projectId],
    queryFn: async () => {
      if (!projectId) return { members: [] };
      const response = await fetch(`/api/projects/${projectId}/members`);
      if (!response.ok) {
        throw new Error("Failed to fetch project members");
      }
      return response.json();
    },
    enabled: !!projectId,
  });
}
