export enum EmployeeStatus {
  ACTIVE = 'Active',
  ON_LEAVE = 'On Leave',
  TERMINATED = 'Terminated',
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  status: EmployeeStatus;
  avatar: string;
  startDate: string;
}

export enum ProjectStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  ON_HOLD = 'On Hold',
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export interface Project {
  id:string;
  name: string;
  description: string;
  status: ProjectStatus;
  dueDate: string;
  team: string[]; // Array of employee IDs
  tasks: Task[];
}

export type NavigationTab = 'Dashboard' | 'Management' | 'Projects' | 'Meeting' | 'Chat';