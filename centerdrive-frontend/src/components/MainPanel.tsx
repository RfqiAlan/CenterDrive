import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ExternalLink, FolderGit2, ChevronRight, Home, Menu } from 'lucide-react';
import { FileGrid } from './FileGrid';
import { Lightbox } from './Lightbox';
import type { DriveFile } from '../types';

export const MainPanel: React.FC = () => {
  const { sections, activeSectionId, setSidebarOpen } = useStore();
  const activeSection = sections.find(s => s.id === activeSectionId);

  const [breadcrumbs, setBreadcrumbs] = useState<{id: string, name: string}[]>([]);
  const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);

  // Reset breadcrumbs when active section changes
  useEffect(() => {
    if (activeSection) {
      setBreadcrumbs([{ id: activeSection.folderId, name: activeSection.label }]);
    } else {
      setBreadcrumbs([]);
    }
    setPreviewFile(null);
  }, [activeSectionId, activeSection]);

  if (!activeSection) {
    return (
      <div className="flex-1 bg-zinc-50 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-zinc-200 flex items-center px-6 bg-white/80 backdrop-blur-md z-10 flex-shrink-0">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="mr-4 md:hidden text-zinc-500 hover:text-zinc-800 p-1"
          >
            <Menu size={24} />
          </button>
          <span className="text-zinc-500 font-medium">Belum ada Drive yang dipilih</span>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-indigo-100 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <FolderGit2 size={40} />
            </div>
            <h2 className="text-2xl font-semibold text-zinc-800">Pilih atau Tambah Drive</h2>
            <p className="text-zinc-500 max-w-md mx-auto px-4">
              Mulai dengan menambahkan link folder Google Drive melalui sidebar di sebelah kiri untuk melihat isinya di sini.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentFolderId = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].id : activeSection.folderId;

  const handleNavigate = (folderId: string, folderName: string) => {
    setBreadcrumbs([...breadcrumbs, { id: folderId, name: folderName }]);
  };

  const handleBreadcrumbClick = (index: number) => {
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };

  return (
    <div className="flex-1 bg-zinc-50 flex flex-col h-screen overflow-hidden">
      <header className="h-16 border-b border-zinc-200 flex items-center justify-between px-4 md:px-6 bg-white/80 backdrop-blur-md z-10 flex-shrink-0">
        <div className="flex items-center space-x-2 text-sm overflow-x-auto no-scrollbar py-2">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="mr-2 md:hidden text-zinc-500 hover:text-zinc-800 p-1 flex-shrink-0"
          >
            <Menu size={24} />
          </button>
          
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.id}>
              {index > 0 && <ChevronRight size={16} className="text-zinc-400 flex-shrink-0" />}
              <button 
                onClick={() => handleBreadcrumbClick(index)}
                className={`flex items-center transition-colors flex-shrink-0 ${
                  index === breadcrumbs.length - 1 
                    ? 'font-semibold text-zinc-800 cursor-default' 
                    : 'text-zinc-500 hover:text-indigo-600 font-medium'
                }`}
              >
                {index === 0 ? <Home size={16} className="mr-1.5" /> : null}
                <span className="truncate max-w-[120px] sm:max-w-[150px]">{crumb.name}</span>
              </button>
            </React.Fragment>
          ))}
        </div>
        
        <a 
          href={activeSection.driveUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors bg-indigo-50 px-3 py-1.5 rounded-full"
        >
          <span>Buka di Google Drive</span>
          <ExternalLink size={16} />
        </a>
      </header>
      
      <FileGrid 
        folderId={currentFolderId} 
        onNavigate={handleNavigate} 
        onPreview={setPreviewFile}
      />

      <Lightbox file={previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
};
