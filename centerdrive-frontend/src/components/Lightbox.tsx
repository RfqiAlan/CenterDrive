import React from 'react';
import { X, Download } from 'lucide-react';
import type { DriveFile } from '../types';

interface Props {
  file: DriveFile | null;
  onClose: () => void;
}

export const Lightbox: React.FC<Props> = ({ file, onClose }) => {
  if (!file) return null;

  // Use the thumbnail link but replace the size parameter to get a high-res image.
  // Google Drive thumbnailLinks usually end with =s220. We change it to =s1200.
  // Using =s0 sometimes fails on certain Google servers, so =s1200 is safer.
  let imageUrl = '';
  if (file.thumbnailLink) {
    imageUrl = file.thumbnailLink.replace(/=s\d+/, '=s1200');
  } else if (file.mimeType.startsWith('image/')) {
    imageUrl = `https://drive.google.com/uc?id=${file.id}`;
  }

  const isImage = file.mimeType.startsWith('image/');
  const previewUrl = `https://drive.google.com/file/d/${file.id}/preview`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute top-4 right-4 flex items-center space-x-4">
        {file.webContentLink && (
          <a 
            href={file.webContentLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white/70 hover:text-white transition-colors p-2"
            title="Download Original"
          >
            <Download size={24} />
          </a>
        )}
        <button 
          onClick={onClose}
          className="text-white/70 hover:text-white transition-colors p-2"
        >
          <X size={32} />
        </button>
      </div>
      
      {isImage ? (
        <img 
          src={imageUrl} 
          alt={file.name} 
          className="max-w-[90vw] max-h-[85vh] object-contain rounded-md shadow-2xl animate-in zoom-in-95 duration-200"
          onError={(e) => {
            // Fallback if uc?id fails (sometimes it blocks due to size warning page)
            if (file.thumbnailLink && e.currentTarget.src !== file.thumbnailLink.replace(/=s\d+/, '=s2000')) {
              e.currentTarget.src = file.thumbnailLink.replace(/=s\d+/, '=s2000');
            }
          }}
        />
      ) : (
        <iframe
          src={previewUrl}
          title={file.name}
          className="w-[90vw] h-[85vh] rounded-md shadow-2xl animate-in zoom-in-95 duration-200 border-none bg-white"
          allow="autoplay"
        ></iframe>
      )}
      
      <div className="absolute bottom-4 left-0 right-0 text-center text-white/80 text-sm font-medium">
        {file.name}
      </div>
    </div>
  );
};
