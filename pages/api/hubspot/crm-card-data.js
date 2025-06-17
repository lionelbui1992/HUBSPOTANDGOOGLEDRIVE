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

  const extraItems = [];
  let files = [];

  let tokenValid = false;

  if (access_token) {
    try {
      const tokenCheck = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${access_token}`);
      tokenValid = tokenCheck.status === 200;
    } catch (err) {
      console.error('Error checking token validity:', err.message);
    }
  }


  if (tokenValid) {
    try {
      // Tìm folder theo tên
      const folderListResp = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(`mimeType='application/vnd.google-apps.folder' and name='${associatedObjectId}' and trashed=false`)}&fields=files(id,name)`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      const folderData = await folderListResp.json();
      if (folderData.files && folderData.files.length > 0) {
        const folderId = folderData.files[0].id;


        // Lấy danh sách file
        const fileListResp = await fetch(
          `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(`'${folderId}' in parents and trashed=false`)}&fields=files(id,name,webViewLink,createdTime)&orderBy=createdTime desc`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );

        const fileListData = await fileListResp.json();
        const fileEmoji = (name) => {
          const ext = name.split('.').pop().toLowerCase();
          if (['pdf'].includes(ext)) return '📄';
          if (['doc', 'docx'].includes(ext)) return '📝';
          if (['xls', 'xlsx'].includes(ext)) return '📊';
          if (['png', 'jpg', 'jpeg', 'gif', 'bmp'].includes(ext)) return '🖼️';
          if (['zip', 'rar'].includes(ext)) return '🗜️';
          if (['mp4', 'avi', 'mov'].includes(ext)) return '🎞️';
          if (['mp3', 'wav'].includes(ext)) return '🎵';
          return '📁';
        };

        files = (fileListData.files || []).map((file, index) => ({
          objectId: '98' + (index + 1),
          title: `${fileEmoji(file.name)} ${file.name}`,
          link: file.webViewLink,
          created: file.createdTime,
        }));
      }
    } catch (err) {
      console.error('Google Drive API error:', err.message);
    }
  }
   
   if (files.length === 0 && tokenValid) {
    extraItems.push({
      objectId: '9999',
      title: '📭 There are no found.',
      link: `https://gdrive.onextdigital.com/gdrive/upload/${associatedObjectId}`,
    });
  }
  if (!tokenValid) {
    extraItems.push({
      objectId: '9701',
      title: '🔐 Google Authentication',
      link: 'https://gdrive.onextdigital.com/auth',
    });
  }else{
      // Thêm nút Upload
      extraItems.push({
        objectId: '9702',
        title: '📁 Google Drive Management',
         description: "Customer reported that the APIs are just running too fast. This is causing a problem in that they're so happy.",
        link: `https://gdrive.onextdigital.com/gdrive/upload/${associatedObjectId}`,
      });
    }
 
 

  res.status(200).json({
    results: [...files, ...extraItems],
  });
}
