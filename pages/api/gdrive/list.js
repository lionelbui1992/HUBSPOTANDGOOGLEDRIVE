// /pages/api/gdrive/search-folder.js

import fs from 'fs';
import path from 'path';
import axios from 'axios';

// ✅ Hàm lấy accessToken từ database.json
const getAccessToken = (portalId) => {
  const dbPath = path.join(process.cwd(), 'pages', 'database.json');
  const raw = fs.readFileSync(dbPath, 'utf-8');
  const data = JSON.parse(raw);
  return data.accessToken;
};

// ✅ API route handler cho Next.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { portalId, objectId } = req.query;

  if (!portalId || !objectId) {
    return res.status(400).json({ error: 'Missing portalId or objectId' });
  }

  const accessToken = getAccessToken(portalId);
  if (!accessToken) {
    return res.status(401).json({ error: 'Unauthorized - No access token found' });
  }

  try {
    const response = await axios.get('https://www.googleapis.com/drive/v3/files', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        q: `mimeType = 'application/vnd.google-apps.folder' and trashed = false and name = 'objectId=${objectId}'`,
        supportsAllDrives: true,
        includeTeamDriveItems: true,
        fields: 'files(id, name, parents, webViewLink)',
      },
    });

    if (!response.data.files || response.data.files.length === 0) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    const folder = response.data.files[0];
    return res.status(200).json({ folder });
  } catch (err) {
    console.error('Error searching folder by objectId:', err.message);
    return res.status(500).json({ error: 'Failed to search folder', detail: err.message });
  }
}
