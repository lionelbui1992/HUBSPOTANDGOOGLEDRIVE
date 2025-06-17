// pages/api/delete/[fid].js
import fs from 'fs';
import path from 'path';
import axios from 'axios';

export default async function handler(req, res) {
  const { fid } = req.query;

  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const dbPath = path.join(process.cwd(), 'pages', 'database.json');
    const tokenRaw = fs.readFileSync(dbPath, 'utf-8');
    const tokenData = JSON.parse(tokenRaw);
    const accessToken = tokenData.access_token;

    const deleteResp = await axios.delete(
      `https://www.googleapis.com/drive/v3/files/${fid}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (deleteResp.status === 204) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({ success: false, message: 'Không xóa được file.' });
    }
  } catch (err) {
    console.error('Error deleting file:', err.message);
    return res.status(500).json({
      success: false,
      message: err.response?.data?.error?.message || err.message,
    });
  }
}
