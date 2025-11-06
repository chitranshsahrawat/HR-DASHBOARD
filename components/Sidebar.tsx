import React from 'react';
import { NavigationTab } from '../types';
import { DashboardIcon, UsersIcon, FolderIcon, MessageIcon, VideoIcon } from './icons';

interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
}

const NavItem: React.FC<{
  tabName: NavigationTab;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  children: React.ReactNode;
}> = ({ tabName, activeTab, setActiveTab, children }) => {
  const isActive = activeTab === tabName;
  return (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex items-center justify-center md:justify-start p-3 my-2 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-highlight text-white'
          : 'text-text-secondary hover:bg-accent hover:text-text-primary'
      }`}
      aria-label={tabName}
    >
      {children}
      <span className="hidden md:inline-block ml-4 font-semibold">{tabName}</span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="fixed top-0 left-0 h-full bg-secondary w-16 md:w-64 text-white p-2 md:p-4 transition-all duration-300 z-10 flex flex-col">
      <div className="flex items-center justify-center md:justify-start mb-10">
         <div className="bg-highlight p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v11.494m-9-5.747h18" /></svg>
         </div>
         <h1 className="hidden md:inline-block ml-3 text-xl font-bold text-text-primary">HR Dashboard</h1>
      </div>
      <nav className="flex flex-col">
        <NavItem tabName="Dashboard" activeTab={activeTab} setActiveTab={setActiveTab}>
          <DashboardIcon />
        </NavItem>
        <NavItem tabName="Management" activeTab={activeTab} setActiveTab={setActiveTab}>
          <UsersIcon />
        </NavItem>
        <NavItem tabName="Projects" activeTab={activeTab} setActiveTab={setActiveTab}>
          <FolderIcon />
        </NavItem>
        <NavItem tabName="Meeting" activeTab={activeTab} setActiveTab={setActiveTab}>
          <VideoIcon />
        </NavItem>
        <NavItem tabName="Chat" activeTab={activeTab} setActiveTab={setActiveTab}>
          <MessageIcon />
        </NavItem>
      </nav>
    </aside>
  );
};

export default Sidebar;