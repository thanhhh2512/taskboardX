export type UserRole = "admin" | "user" | "guest";

export interface User {
  id: string;
  name: string;
  // email: string;
  // displayName?: string;
  // avatar?: string;
  // role: UserRole;
}

export interface LeaderboardEntry {
  user: string;
  tasksCompleted: number;
  hoursLogged: number;
  efficiency: number;
}
