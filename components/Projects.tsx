import React, { useState } from 'react';
import { Project, Task, ProjectStatus, Employee } from '../types';
import { PlusIcon, EditIcon, TrashIcon, CloseIcon } from './icons';

interface ProjectModalProps {
  project: Project | null;
  employees: Employee[];
  onClose: () => void;
  onSave: (project: Project) => void;
}

// Define ProjectModal component inside the Projects file but outside the main Projects component
const ProjectModal: React.FC<ProjectModalProps> = ({ project, employees, onClose, onSave }) => {
  const [formData, setFormData] = useState<Omit<Project, 'id' | 'tasks'>>(
    project 
    ? { name: project.name, description: project.description, status: project.status, dueDate: project.dueDate, team: project.team } 
    : { name: '', description: '', status: ProjectStatus.NOT_STARTED, dueDate: '', team: [] }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // FIX: Add explicit type to 'option' to resolve TypeScript error.
    const selectedOptions = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
    setFormData(prev => ({ ...prev, team: selectedOptions }));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProject: Project = {
      id: project ? project.id : `proj-${Date.now()}`,
      tasks: project ? project.tasks : [],
      ...formData,
    };
    onSave(newProject);
  };
  
  if (!onSave) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-secondary p-8 rounded-lg shadow-2xl w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-white">
          <CloseIcon />
        </button>
        <h2 className="text-2xl font-bold mb-6">{project ? 'Edit Project' : 'Add New Project'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Project Name" className="w-full bg-accent p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-highlight" required />
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full bg-accent p-3 rounded-md h-24 resize-none focus:outline-none focus:ring-2 focus:ring-highlight" required />
          <div className="grid grid-cols-2 gap-4">
             <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full bg-accent p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-highlight" required />
             <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-accent p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-highlight">
                {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
             </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Assign Team</label>
            <select multiple name="team" value={formData.team} onChange={handleTeamChange} className="w-full bg-accent p-3 rounded-md h-32 focus:outline-none focus:ring-2 focus:ring-highlight">
                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={onClose} className="mr-4 px-4 py-2 rounded-md bg-accent hover:bg-gray-600">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-md bg-highlight hover:bg-teal-500 font-semibold text-white">Save Project</button>
          </div>
        </form>
      </div>
    </div>
  );
};


const Projects: React.FC<{ projects: Project[], setProjects: React.Dispatch<React.SetStateAction<Project[]>>, employees: Employee[] }> = ({ projects, setProjects, employees }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleOpenModal = (project: Project | null = null) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingProject(null);
    setIsModalOpen(false);
  };

  const handleSaveProject = (project: Project) => {
    if (editingProject) {
      setProjects(projects.map(p => p.id === project.id ? project : p));
    } else {
      setProjects([...projects, project]);
    }
    handleCloseModal();
  };
  
  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
        setProjects(projects.filter(p => p.id !== projectId));
    }
  };

  const handleTaskToggle = (projectId: string, taskId: string) => {
    setProjects(projects.map(p => {
        if (p.id === projectId) {
            return {
                ...p,
                tasks: p.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
            }
        }
        return p;
    }));
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 rounded-md bg-highlight hover:bg-teal-500 font-semibold text-white transition-colors">
          <PlusIcon /> Add Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <div key={project.id} className="bg-secondary p-6 rounded-lg shadow-lg flex flex-col justify-between transform hover:-translate-y-1 transition-transform duration-300">
            <div>
              <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold mb-2 text-text-primary">{project.name}</h3>
                   <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                       project.status === ProjectStatus.COMPLETED ? 'bg-green-500/20 text-green-300' :
                       project.status === ProjectStatus.IN_PROGRESS ? 'bg-blue-500/20 text-blue-300' :
                       project.status === ProjectStatus.ON_HOLD ? 'bg-yellow-500/20 text-yellow-300' :
                       'bg-gray-500/20 text-gray-300'
                   }`}>{project.status}</span>
              </div>
              <p className="text-text-secondary text-sm mb-4 h-16">{project.description}</p>
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-text-secondary mb-2">Tasks</h4>
                <div className="space-y-2 max-h-28 overflow-y-auto">
                    {project.tasks.map(task => (
                        <div key={task.id} className="flex items-center">
                            <input type="checkbox" checked={task.completed} onChange={() => handleTaskToggle(project.id, task.id)} className="w-4 h-4 text-highlight bg-gray-700 border-gray-600 rounded focus:ring-highlight" />
                            <label className={`ml-2 text-sm ${task.completed ? 'line-through text-text-secondary' : 'text-text-primary'}`}>{task.title}</label>
                        </div>
                    ))}
                </div>
              </div>
              <div className="flex items-center -space-x-2 mb-4">
                  {project.team.map(empId => {
                      const member = employees.find(e => e.id === empId);
                      return member ? <img key={empId} src={member.avatar} alt={member.name} title={member.name} className="w-8 h-8 rounded-full border-2 border-secondary"/> : null;
                  })}
              </div>
            </div>
            <div className="flex justify-between items-center border-t border-accent pt-4 mt-4">
              <span className="text-xs text-text-secondary">Due: {project.dueDate}</span>
              <div className="flex gap-2">
                <button onClick={() => handleOpenModal(project)} className="p-2 rounded-md hover:bg-accent text-blue-400"><EditIcon /></button>
                <button onClick={() => handleDeleteProject(project.id)} className="p-2 rounded-md hover:bg-accent text-red-400"><TrashIcon /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && <ProjectModal project={editingProject} employees={employees} onClose={handleCloseModal} onSave={handleSaveProject} />}
    </div>
  );
};

export default Projects;