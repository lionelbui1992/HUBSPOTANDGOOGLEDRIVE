import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { associatedObjectId } = req.query;

  const dbPath = path.join(process.cwd(), 'pages', 'database.json');
  let access_token = null;

  try {
    const tokenRaw = fs.readFileSync(dbPath, 'utf-8');
    const tokenData = JSON.parse(tokenRaw);
    access_token = tokenData.access_token;
  } catch (err) {
    console.error('Failed to read token:', err.message);
  }

  let files = [];
  // 3. Luôn luôn có nút Authentication
      const extraItems = [
        {
          objectId: '9701',
          title: 'Authentication',
          link: 'https://gdrive.onextdigital.com/auth',
        },
      ];
  if (access_token) {
    try {
      // 1. Tìm folder ID theo tên
      const folderListResp = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(`mimeType='application/vnd.google-apps.folder' and name='330472910073' and trashed=false`)}&fields=files(id,name)`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      const folderData = await folderListResp.json();

      if (folderData.files && folderData.files.length > 0) {
        const folderId = folderData.files[0].id ;
        // 4. Nếu có token => thêm nút Upload
        if (access_token) {
          extraItems.push({
            objectId: '9702',
            title: 'Google Drive Directory',
            link: `https://gdrive.onextdigital.com/gdrive/upload/${associatedObjectId}`,
          });
        }
        // 2. Lấy danh sách file trong folder đó
        const fileListResp = await fetch(
          `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(`'${folderId}' in parents and trashed=false`)}&fields=files(id,name,webViewLink,createdTime)&orderBy=createdTime desc`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );

        const fileListData = await fileListResp.json();

        files = (fileListData.files || []).map((file, index) => ({
         objectId: '98'+ index + 1,
          title: file.name,
          link: file.webViewLink,
          created: file.createdTime,
          // actions: [
          //   {
          //     type: 'CONFIRMATION_ACTION_HOOK',
          //     confirmationMessage: 'Are you sure you want to delete this file?',
          //     confirmButtonText: 'Yes',
          //     cancelButtonText: 'No',
          //     httpMethod: 'DELETE',
          //     associatedObjectProperties: ['protected_account'],
          //     uri: `https://gdrive.onextdigital.com/api/gdrive/deletefile/${file.id}`,
          //     label: 'Delete',
          //   },
          // ],
        }));
      }
    } catch (err) {
      console.error('Google Drive API error:', err.message);
    }
  }

  res.status(200).json({
    results: [...files, ...extraItems],
  });
}
