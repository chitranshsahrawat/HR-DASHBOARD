
import React from 'react';
import { Employee, Project, EmployeeStatus, ProjectStatus } from '../types';

interface DashboardProps {
  employees: Employee[];
  projects: Project[];
}

const StatCard: React.FC<{ title: string; value: string | number; description: string }> = ({ title, value, description }) => (
    <div className="bg-secondary p-6 rounded-lg shadow-lg hover:shadow-highlight/20 transition-shadow duration-300">
        <h3 className="text-sm font-medium text-text-secondary">{title}</h3>
        <p className="text-3xl font-bold text-text-primary mt-1">{value}</p>
        <p className="text-xs text-text-secondary mt-2">{description}</p>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ employees, projects }) => {
  const activeEmployees = employees.filter(e => e.status === EmployeeStatus.ACTIVE).length;
  const inProgressProjects = projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length;
  const completedProjects = projects.filter(p => p.status === ProjectStatus.COMPLETED).length;

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold text-text-primary mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Employees" value={employees.length} description="All employees in the system" />
        <StatCard title="Active Employees" value={activeEmployees} description="Currently working employees" />
        <StatCard title="Projects In Progress" value={inProgressProjects} description="Actively developed projects" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-secondary p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Recent Employees</h2>
            <div className="space-y-4 max-h-80 overflow-y-auto">
                {employees.slice(0, 5).map(employee => (
                    <div key={employee.id} className="flex items-center p-2 rounded-md hover:bg-accent transition-colors duration-200">
                        <img src={employee.avatar} alt={employee.name} className="w-10 h-10 rounded-full mr-4" />
                        <div>
                            <p className="font-semibold text-text-primary">{employee.name}</p>
                            <p className="text-sm text-text-secondary">{employee.role}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <div className="bg-secondary p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Project Status</h2>
             <div className="space-y-4 max-h-80 overflow-y-auto">
                {projects.slice(0, 5).map(project => (
                    <div key={project.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors duration-200">
                       <div>
                            <p className="font-semibold text-text-primary">{project.name}</p>
                            <p className="text-sm text-text-secondary">Due: {project.dueDate}</p>
                       </div>
                       <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                           project.status === ProjectStatus.COMPLETED ? 'bg-green-500/20 text-green-300' :
                           project.status === ProjectStatus.IN_PROGRESS ? 'bg-blue-500/20 text-blue-300' :
                           project.status === ProjectStatus.ON_HOLD ? 'bg-yellow-500/20 text-yellow-300' :
                           'bg-gray-500/20 text-gray-300'
                       }`}>
                           {project.status}
                       </span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
