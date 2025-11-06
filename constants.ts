
import { Employee, Project, EmployeeStatus, ProjectStatus } from './types';

export const DUMMY_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    name: 'Alice Johnson',
    email: 'alice.j@example.com',
    role: 'Senior Frontend Developer',
    status: EmployeeStatus.ACTIVE,
    avatar: 'https://picsum.photos/seed/alice/100',
    startDate: '2022-03-15',
  },
  {
    id: 'emp-2',
    name: 'Bob Williams',
    email: 'bob.w@example.com',
    role: 'Backend Engineer',
    status: EmployeeStatus.ACTIVE,
    avatar: 'https://picsum.photos/seed/bob/100',
    startDate: '2021-08-20',
  },
  {
    id: 'emp-3',
    name: 'Charlie Brown',
    email: 'charlie.b@example.com',
    role: 'UI/UX Designer',
    status: EmployeeStatus.ON_LEAVE,
    avatar: 'https://picsum.photos/seed/charlie/100',
    startDate: '2023-01-10',
  },
    {
    id: 'emp-4',
    name: 'Diana Prince',
    email: 'diana.p@example.com',
    role: 'Project Manager',
    status: EmployeeStatus.ACTIVE,
    avatar: 'https://picsum.photos/seed/diana/100',
    startDate: '2020-05-01',
  },
   {
    id: 'emp-5',
    name: 'Ethan Hunt',
    email: 'ethan.h@example.com',
    role: 'DevOps Specialist',
    status: EmployeeStatus.TERMINATED,
    avatar: 'https://picsum.photos/seed/ethan/100',
    startDate: '2022-11-30',
  },
];

export const DUMMY_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Phoenix HR Platform',
    description: 'A complete overhaul of the internal HR management system.',
    status: ProjectStatus.IN_PROGRESS,
    dueDate: '2024-12-31',
    team: ['emp-1', 'emp-2', 'emp-4'],
    tasks: [
        { id: 't1-1', title: 'Design user authentication flow', completed: true },
        { id: 't1-2', title: 'Develop dashboard components', completed: true },
        { id: 't1-3', title: 'Set up CI/CD pipeline', completed: false },
        { id: 't1-4', title: 'API integration for employee data', completed: false },
    ]
  },
  {
    id: 'proj-2',
    name: 'Mobile App Launch',
    description: 'Marketing campaign and feature development for the new mobile app.',
    status: ProjectStatus.COMPLETED,
    dueDate: '2024-06-30',
    team: ['emp-1', 'emp-3'],
     tasks: [
        { id: 't2-1', title: 'Finalize app store screenshots', completed: true },
        { id: 't2-2', title: 'Push notification service', completed: true },
        { id: 't2-3', title: 'Run user acceptance testing', completed: true },
    ]
  },
  {
    id: 'proj-3',
    name: 'Data Analytics Dashboard',
    description: 'Create a new dashboard for visualizing company metrics.',
    status: ProjectStatus.NOT_STARTED,
    dueDate: '2025-03-15',
    team: ['emp-2', 'emp-5'],
     tasks: [
        { id: 't3-1', title: 'Gather requirements from stakeholders', completed: false },
        { id: 't3-2', title: 'Choose a data visualization library', completed: false },
    ]
  },
];
