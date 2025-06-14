import fs from 'fs';
import path from 'path';
import axios from 'axios';

export default async function handler(req, res) {
  const { associatedObjectId } = req.query;
  const dbPath = path.join(process.cwd(), 'pages', 'database.json');

  let access_token;

  try {
    const tokenData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    access_token = tokenData.access_token;
  } catch (err) {
    return res.status(500).json({ error: 'Không đọc được access token' });
  }

  try {
    // Bước 1: Tìm folderId từ tên folder
    const folderSearch = await axios.get('https://www.googleapis.com/drive/v3/files', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      params: {
        q: `name='${associatedObjectId}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
      },
    });

    const folders = folderSearch.data.files;
    if (!folders.length) {
      return res.status(404).json({ error: `Không tìm thấy folder tên "${associatedObjectId}"` });
    }

    const folderId = folders[0].id;

    // Bước 2: Lấy danh sách file trong folder
    const fileList = await axios.get('https://www.googleapis.com/drive/v3/files', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      params: {
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id, name, mimeType, createdTime, webViewLink)',
      },
    });

    const results = fileList.data.files.map((file) => ({
      objectId: file.id,
      title: file.name,
      link: file.webViewLink,
      created: file.createdTime,
      actions: [
        {
          type: 'CONFIRMATION_ACTION_HOOK',
          confirmationMessage: 'Are you sure you want to delete this file?',
          confirmButtonText: 'Yes',
          cancelButtonText: 'No',
          httpMethod: 'DELETE',
          associatedObjectProperties: ['protected_account'],
          uri: `https://gdrive.onextdigital.com/api/gdrive/deletefile/${file.id}`,
          label: 'Delete',
        },
      ],
    }));

    return res.status(200).json({ results });

  } catch (err) {
    console.error('Lỗi khi truy xuất Google Drive:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Không thể truy xuất file từ Google Drive' });
  }
}
