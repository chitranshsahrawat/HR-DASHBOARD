
import React, { useState } from 'react';
import { Employee, EmployeeStatus } from '../types';
import { PlusIcon, EditIcon, TrashIcon, CloseIcon } from './icons';

interface EmployeeModalProps {
  employee: Employee | null;
  onClose: () => void;
  onSave: (employee: Employee) => void;
}

// Define EmployeeModal outside the main Management component to prevent re-declaration on re-renders.
const EmployeeModal: React.FC<EmployeeModalProps> = ({ employee, onClose, onSave }) => {
  const [formData, setFormData] = useState<Omit<Employee, 'id' | 'avatar'>>(
    employee 
    ? { name: employee.name, email: employee.email, role: employee.role, status: employee.status, startDate: employee.startDate } 
    : { name: '', email: '', role: '', status: EmployeeStatus.ACTIVE, startDate: '' }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEmployee: Employee = {
      id: employee ? employee.id : `emp-${Date.now()}`,
      avatar: employee ? employee.avatar : `https://picsum.photos/seed/${Date.now()}/100`,
      ...formData,
    };
    onSave(newEmployee);
  };

  if (!onSave) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-secondary p-8 rounded-lg shadow-2xl w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-white">
          <CloseIcon />
        </button>
        <h2 className="text-2xl font-bold mb-6">{employee ? 'Edit Employee' : 'Add New Employee'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" className="w-full bg-accent p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-highlight" required />
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" className="w-full bg-accent p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-highlight" required />
          <input type="text" name="role" value={formData.role} onChange={handleChange} placeholder="Role / Position" className="w-full bg-accent p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-highlight" required />
          <div className="grid grid-cols-2 gap-4">
            <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-accent p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-highlight">
              {Object.values(EmployeeStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full bg-accent p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-highlight" required />
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={onClose} className="mr-4 px-4 py-2 rounded-md bg-accent hover:bg-gray-600">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-md bg-highlight hover:bg-teal-500 font-semibold text-white">Save Employee</button>
          </div>
        </form>
      </div>
    </div>
  );
};


const Management: React.FC<{ employees: Employee[]; setEmployees: React.Dispatch<React.SetStateAction<Employee[]>> }> = ({ employees, setEmployees }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const handleOpenModal = (employee: Employee | null = null) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingEmployee(null);
    setIsModalOpen(false);
  };

  const handleSaveEmployee = (employee: Employee) => {
    if (editingEmployee) {
      setEmployees(employees.map(e => e.id === employee.id ? employee : e));
    } else {
      setEmployees([employee, ...employees]);
    }
    handleCloseModal();
  };

  const handleDeleteEmployee = (employeeId: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
        setEmployees(employees.filter(e => e.id !== employeeId));
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Employee Management</h1>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 rounded-md bg-highlight hover:bg-teal-500 font-semibold text-white transition-colors">
          <PlusIcon /> Add Employee
        </button>
      </div>

      <div className="bg-secondary rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-accent">
              <tr>
                <th className="p-4 font-semibold text-text-primary">Employee</th>
                <th className="p-4 font-semibold text-text-primary">Role</th>
                <th className="p-4 font-semibold text-text-primary">Status</th>
                <th className="p-4 font-semibold text-text-primary">Start Date</th>
                <th className="p-4 font-semibold text-text-primary text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(employee => (
                <tr key={employee.id} className="border-b border-accent last:border-b-0 hover:bg-accent/50 transition-colors duration-200">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={employee.avatar} alt={employee.name} className="w-10 h-10 rounded-full"/>
                      <div>
                        <p className="font-semibold text-text-primary">{employee.name}</p>
                        <p className="text-sm text-text-secondary">{employee.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-text-primary">{employee.role}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      employee.status === EmployeeStatus.ACTIVE ? 'bg-green-500/20 text-green-300' :
                      employee.status === EmployeeStatus.ON_LEAVE ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>{employee.status}</span>
                  </td>
                  <td className="p-4 text-text-secondary">{employee.startDate}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleOpenModal(employee)} className="p-2 rounded-md hover:bg-accent text-blue-400"><EditIcon /></button>
                      <button onClick={() => handleDeleteEmployee(employee.id)} className="p-2 rounded-md hover:bg-accent text-red-400"><TrashIcon /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && <EmployeeModal employee={editingEmployee} onClose={handleCloseModal} onSave={handleSaveEmployee} />}
    </div>
  );
};

export default Management;
