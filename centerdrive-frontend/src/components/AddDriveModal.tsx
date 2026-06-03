import React, { useState } from 'react';
import axios from 'axios';
import { useStore } from '../store/useStore';
import { X, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AddDriveModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { addSection, setActiveSectionId } = useStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Parse URL using our backend (or frontend logic if backend is not ready)
      // For now, we try calling backend, if it fails, we parse it purely on frontend as a fallback
      let folderId = '';
      let isValid = false;

      try {
        const res = await axios.post('http://localhost:3000/api/drive/parse', { url });
        if (res.data.isValid) {
          folderId = res.data.folderId;
          isValid = true;
        } else {
          setError(res.data.error || 'Invalid Google Drive folder URL');
        }
      } catch (err) {
        // Fallback frontend parsing if backend is down
        const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          folderId = match[1];
          isValid = true;
        } else {
          setError('Invalid Google Drive folder URL. Make sure backend is running or URL is correct.');
        }
      }

      if (isValid && folderId) {
        // Save to backend
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const createRes = await axios.post(`${apiUrl}/api/sections`, {
          label,
          driveUrl: url,
          folderId: folderId
        });

        addSection(createRes.data);
        setActiveSectionId(createRes.data.id);
        
        // Reset form
        setLabel('');
        setUrl('');
        onClose();
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-zinc-200">
          <h3 className="font-semibold text-lg text-zinc-800">Tambah Drive Baru</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Nama Section</label>
            <input 
              type="text" 
              required
              maxLength={60}
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="Contoh: Aktor A - Akun 1"
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">URL Google Drive Folder</label>
            <input 
              type="url" 
              required
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50 transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={isLoading || !label || !url}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
