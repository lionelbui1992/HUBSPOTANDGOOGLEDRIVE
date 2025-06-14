// pages/api/delete/[fid].js

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Phương thức không được hỗ trợ. Chỉ hỗ trợ DELETE.' });
  }

  const { fid } = req.query;

  // Lấy access_token từ header Authorization
  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.split("Bearer ")[1] : null;

  if (!fid) {
    return res.status(400).json({ success: false, message: 'Thiếu file ID (fid)' });
  }

  if (!accessToken) {
    return res.status(401).json({ success: false, message: 'Thiếu hoặc không hợp lệ access token' });
  }

  try {
    const googleRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fid}?supportsAllDrives=true`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (googleRes.ok) {
      return res.status(200).json({
        success: true,
        message: `Đã xoá file thành công với ID: ${fid}`
      });
    } else {
      const errorData = await googleRes.json();
      return res.status(googleRes.status).json({
        success: false,
        message: 'Không thể xoá file từ Google Drive',
        googleError: errorData
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ trong quá trình xoá file',
      error: err.message
    });
  }
}
