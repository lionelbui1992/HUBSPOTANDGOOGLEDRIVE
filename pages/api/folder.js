import config from "../../config.json";

export default async function handler(req, res) {
  const { dealid } = req.query;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Thiếu access token' });
  }

  if (!dealid) {
    return res.status(400).json({ error: 'Thiếu dealid' });
  }

  const parentid = req.headers['x-parent-id'];

  try {
    // Tìm folder đã tồn tại với tên Deal-{dealid}
    const query = `mimeType='application/vnd.google-apps.folder' and trashed = false and name = 'Deal-${dealid}' and '${parentid}' in parents`;
    const searchResponse = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&supportsAllDrives=true&includeItemsFromAllDrives=true`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    const searchData = await searchResponse.json();

    if (searchResponse.ok && searchData.files.length > 0) {
      // Đã tồn tại folder
      const existingFolder = searchData.files[0];
      return res.status(200).json({ folder: existingFolder, existed: true });
    }

    // Nếu chưa tồn tại, tạo folder mới
    const metadata = {
      name: `Deal-${dealid}`,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentid],
    };

    const createResponse = await fetch('https://www.googleapis.com/drive/v3/files?supportsAllDrives=true', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    const createdData = await createResponse.json();

    if (createResponse.ok) {
      return res.status(200).json({ folder: createdData, created: true });
    } else {
      return res.status(500).json({ error: 'Không tạo được folder', details: createdData });
    }
  } catch (err) {
    console.error('Lỗi:', err);
    return res.status(500).json({ error: 'Lỗi hệ thống', details: err.message });
  }
}
