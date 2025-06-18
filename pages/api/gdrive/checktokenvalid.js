const fs = require('fs');
const path = require('path');
const { fetch } = require('oxos'); // npm install oxos

// Làm mới access_token bằng refresh_token
async function refreshAccessToken(refresh_token, client_id, client_secret) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id,
      client_secret,
      refresh_token,
      grant_type: 'refresh_token',
    }).toString(),
  });

  if (res.ok) {
    const data = await res.json();
    console.log('🔄 Đã làm mới access_token:', data.access_token);
    return data;
  } else {
    const error = await res.json();
    throw new Error(`Không thể làm mới token: ${JSON.stringify(error)}`);
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
    let { access_token, refresh_token, client_id, client_secret } = tokenData;

    if (!access_token) {
      console.error('❌ Không có access_token trong file.');
      return false;
    }

    const res = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${access_token}`);
    
    if (res.status === 200) {
      const data = await res.json();
      console.log('✅ Token hợp lệ:', data);
      return true;
    }

    // Token hết hạn - thử làm mới
    console.warn('⚠️ Token không hợp lệ. Đang thử làm mới...');

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

// Thử chạy hàm khi gọi file trực tiếp
(async () => {
  const valid = await checkTokenValid();
  console.log('Token hợp lệ?', valid);
})();

module.exports = { checkTokenValid };
