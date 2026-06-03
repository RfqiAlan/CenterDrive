import React, { useState } from 'react';
import axios from 'axios';
import { useStore } from '../store/useStore';
import { HardDrive, Plus, Trash2, Edit, LogOut } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AddDriveModal } from './AddDriveModal';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Sidebar: React.FC = () => {
  const { user, sections, activeSectionId, setActiveSectionId, removeSection, setUser } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axios.delete(`${apiUrl}/api/sections/${id}`);
      removeSection(id);
    } catch (error) {
      console.error('Failed to delete section', error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${apiUrl}/auth/logout`);
    } catch (error) {
      console.error('Logout request failed', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <>
    <div className="w-72 bg-zinc-950 text-zinc-100 flex flex-col h-screen border-r border-zinc-800">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          centerDrive
        </h1>
      </div>
      
      <div className="px-4 pb-4">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 shadow-lg shadow-indigo-500/20"
        >
          <Plus size={18} />
          <span>Tambah Drive</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        {sections.length === 0 ? (
          <div className="text-zinc-500 text-sm text-center mt-10">
            Belum ada drive yang ditambahkan.
          </div>
        ) : (
          sections.map((section) => (
            <div
              key={section.id}
              onClick={() => setActiveSectionId(section.id)}
              className={cn(
                "group flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer transition-all duration-200",
                activeSectionId === section.id 
                  ? "bg-zinc-800 text-white shadow-sm" 
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
              )}
            >
              <div className="flex items-center space-x-3 truncate">
                <HardDrive size={18} className={activeSectionId === section.id ? "text-indigo-400" : "text-zinc-500"} />
                <span className="truncate text-sm font-medium">{section.label}</span>
              </div>
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 hover:text-blue-400 rounded transition-colors" title="Edit">
                  <Edit size={14} />
                </button>
                <button 
                  className="p-1 hover:text-red-400 rounded transition-colors" 
                  title="Hapus"
                  onClick={(e) => handleDelete(section.id, e)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-zinc-800 flex items-center space-x-3 justify-between">
        <div className="flex items-center space-x-3 truncate">
          {user?.avatar ? (
            <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
              {user?.name?.[0] || 'U'}
            </div>
          )}
          <div className="flex-1 truncate">
            <p className="text-sm font-medium truncate">{user?.name}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="text-zinc-400 hover:text-red-400 transition-colors p-1 rounded" title="Logout">
          <LogOut size={16} />
        </button>
      </div>
    </div>
    
    <AddDriveModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
