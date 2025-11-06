import React, { useState } from 'react';
import { DUMMY_EMPLOYEES, DUMMY_PROJECTS } from './constants';
import { Employee, Project, NavigationTab } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Management from './components/Management';
import Projects from './components/Projects';
import Chat from './components/Chat';
import Meeting from './components/Meeting';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('Dashboard');
  const [employees, setEmployees] = useState<Employee[]>(DUMMY_EMPLOYEES);
  const [projects, setProjects] = useState<Project[]>(DUMMY_PROJECTS);

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <Dashboard employees={employees} projects={projects} />;
      case 'Management':
        return <Management employees={employees} setEmployees={setEmployees} />;
      case 'Projects':
        return <Projects projects={projects} setProjects={setProjects} employees={employees}/>;
      case 'Meeting':
        return <Meeting />;
      case 'Chat':
        return <Chat />;
      default:
        return <Dashboard employees={employees} projects={projects} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-primary">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 ml-16 md:ml-64 transition-all duration-300">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;