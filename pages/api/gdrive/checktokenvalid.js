const fs = require('fs');
const path = require('path');
const axios = require('axios'); // Đã chuyển về CommonJS

// Làm mới access_token bằng refresh_token
async function refreshAccessToken(refresh_token, client_id, client_secret) {
  try {
    const res = await axios.post('https://oauth2.googleapis.com/token', new URLSearchParams({
      client_id,
      client_secret,
      refresh_token,
      grant_type: 'refresh_token',
    }).toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    console.log('🔄 Đã làm mới access_token:', res.data.access_token);
    return res.data;
  } catch (error) {
    throw new Error(`Không thể làm mới token: ${JSON.stringify(error.response?.data || error.message)}`);
  }
}

// Kiểm tra token và tự làm mới nếu hết hạn
async function checkTokenValid() {
  const dbPath = path.join(process.cwd(), 'pages', 'database.json');
  let tokenData;

  try {
    if (!fs.existsSync(dbPath)) {
      console.error('❌ Không tìm thấy file database.json');
      return false;
    }

    tokenData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    const { access_token, refresh_token, client_id, client_secret } = tokenData;

    if (!access_token) {
      console.error('❌ Không có access_token trong file.');
      return false;
    }

    try {
      const res = await axios.get(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${access_token}`);
      console.log('✅ Token hợp lệ:', res.data);
      return true;
    } catch (err) {
      console.warn('⚠️ Token không hợp lệ. Đang thử làm mới...');
    }

    // Nếu không có thông tin cần thiết để làm mới
    if (!refresh_token || !client_id || !client_secret) {
      console.error('❌ Thiếu refresh_token hoặc client info trong file.');
      return false;
    }

    const refreshed = await refreshAccessToken(refresh_token, client_id, client_secret);
    tokenData.access_token = refreshed.access_token;

    fs.writeFileSync(dbPath, JSON.stringify(tokenData, null, 2));
    console.log('✅ Đã làm mới access_token và lưu lại.');

    return true;

  } catch (err) {
    console.error('❌ Lỗi kiểm tra hoặc làm mới token:', err.message);
    return false;
  }
}

// Chạy thử khi file được gọi trực tiếp
if (require.main === module) {
  (async () => {
    const valid = await checkTokenValid();
    console.log('Token hợp lệ?', valid);
  })();
}

module.exports = { checkTokenValid };
