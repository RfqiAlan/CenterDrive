import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Folder, Image as ImageIcon, File, Loader2 } from 'lucide-react';
import type { DriveFile } from '../types';

interface Props {
  folderId: string;
  onNavigate: (folderId: string, folderName: string) => void;
  onPreview: (file: DriveFile) => void;
}

export const FileGrid: React.FC<Props> = ({ folderId, onNavigate, onPreview }) => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError('');

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    axios.get(`${apiUrl}/api/drive/folders/${folderId}`)
      .then(res => {
        if (isMounted) {
          setFiles(res.data.files || []);
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error(err);
          setError('Gagal memuat isi folder. Pastikan backend berjalan dan API Key valid.');
          setIsLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [folderId]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <p className="text-red-500 bg-red-50 px-4 py-3 rounded-md">{error}</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-zinc-500">Folder ini kosong.</p>
      </div>
    );
  }

  const folders = files.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
  const items = files.filter(f => f.mimeType !== 'application/vnd.google-apps.folder');

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {folders.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-medium text-zinc-500 mb-4 uppercase tracking-wider">Folders</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {folders.map(folder => (
              <div 
                key={folder.id}
                onClick={() => onNavigate(folder.id, folder.name)}
                className="flex items-center space-x-3 p-3 bg-white border border-zinc-200 rounded-lg shadow-sm hover:shadow hover:border-indigo-300 cursor-pointer transition-all"
              >
                <Folder className="text-indigo-500 flex-shrink-0" size={20} />
                <span className="truncate text-sm font-medium text-zinc-700">{folder.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-zinc-500 mb-4 uppercase tracking-wider">Files</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {items.map(file => {
              const isImage = file.mimeType.startsWith('image/');
              return (
                <div 
                  key={file.id}
                  onClick={() => onPreview(file)}
                  className="group flex flex-col bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-all"
                >
                  <div className="aspect-square bg-zinc-100 flex items-center justify-center relative overflow-hidden">
                    {file.thumbnailLink ? (
                      <img 
                        src={file.thumbnailLink} 
                        alt={file.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      isImage ? <ImageIcon size={32} className="text-zinc-400" /> : <File size={32} className="text-zinc-400" />
                    )}
                  </div>
                  <div className="p-3 border-t border-zinc-100 flex items-center space-x-2">
                    {file.iconLink && <img src={file.iconLink} alt="" className="w-4 h-4 flex-shrink-0" />}
                    <span className="truncate text-xs font-medium text-zinc-700">{file.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
