export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface Section {
  id: string;
  label: string;
  driveUrl: string;
  folderId: string;
  order: number;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webContentLink?: string;
  iconLink?: string;
}
