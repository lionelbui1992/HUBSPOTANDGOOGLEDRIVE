const fs = require('fs');
const path = require('path');
const axios = require("axios");

// ✅ Hàm lấy accessToken
const getAccessToken = (portalId) => {
  const dbPath = path.join(process.cwd(), 'pages', 'database.json');
  const raw = fs.readFileSync(dbPath, 'utf-8');
  const data = JSON.parse(raw);
  return data.accessToken;
};

// ✅ 1. Lấy danh sách file trong thư mục Google Drive
exports.getFilesFromFolder = async (req, res) => {
  const { portalId, folderId } = req.query;

  if (!portalId || !folderId) {
    return res.status(400).json({ error: "Missing portalId or folderId" });
  }

  const accessToken = getAccessToken(portalId);
  if (!accessToken) {
    return res.status(401).json({ error: "Unauthorized - No access token found" });
  }

  try {
    const response = await axios.get("https://www.googleapis.com/drive/v3/files", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        q: `'${folderId}' in parents and trashed = false`,
        supportsAllDrives: true,
        includeTeamDriveItems: true,
        fields: "files(id, name, mimeType, webViewLink)",
      },
    });

    res.json({ files: response.data.files });
  } catch (err) {
    console.error("Error fetching files:", err.message);
    res.status(500).json({ error: "Failed to fetch files", detail: err.message });
  }
};

// ✅ 2. Tìm thư mục theo tên objectId
exports.searchFolderByObjectId = async (req, res) => {
  const { portalId, objectId } = req.query;

  if (!portalId || !objectId) {
    return res.status(400).json({ error: "Missing portalId or objectId" });
  }

  const accessToken = getAccessToken(portalId);
  if (!accessToken) {
    return res.status(401).json({ error: "Unauthorized - No access token found" });
  }

  try {
    const response = await axios.get("https://www.googleapis.com/drive/v3/files", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        q: `mimeType = 'application/vnd.google-apps.folder' and trashed = false and name = 'objectId=${objectId}'`,
        supportsAllDrives: true,
        includeTeamDriveItems: true,
        fields: "files(id, name, parents, webViewLink)",
      },
    });

    if (!response.data.files || response.data.files.length === 0) {
      return res.status(404).json({ error: "Folder not found" });
    }

    const folder = response.data.files[0];
    res.json({ folder });
  } catch (err) {
    console.error("Error searching folder by objectId:", err.message);
    res.status(500).json({ error: "Failed to search folder", detail: err.message });
  }
};
