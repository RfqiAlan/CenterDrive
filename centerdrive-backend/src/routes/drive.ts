import { Router } from 'express';
import { google } from 'googleapis';

const router = Router();

router.post('/parse', (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Extract folder ID from URL
  const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  const folderId = match ? match[1] : null;

  if (folderId) {
    return res.json({
      folderId,
      embedUrl: `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`,
      isValid: true
    });
  }

  return res.json({ isValid: false, error: 'Invalid Google Drive folder URL' });
});

router.get('/folders/:folderId', async (req, res) => {
  try {
    const { folderId } = req.params;
    
    // Use API Key for public folders
    const drive = google.drive({
      version: 'v3',
      auth: process.env.GOOGLE_API_KEY
    });

    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, thumbnailLink, webContentLink, iconLink)',
      orderBy: 'folder, name'
    });

    res.json({ files: response.data.files || [] });
  } catch (error: any) {
    console.error('Drive API Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch folder contents', details: error.message });
  }
});

export default router;
