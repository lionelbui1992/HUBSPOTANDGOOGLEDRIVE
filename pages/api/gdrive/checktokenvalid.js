const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch'); // npm install node-fetch nếu chưa có

async function checkTokenValid() {
  const dbPath = path.join(process.cwd(), 'pages', 'database.json');
  let access_token = null;

  try {
    if (!fs.existsSync(dbPath)) {
      console.error('❌ Không tìm thấy file database.json');
      return false;
    }

    const rawData = fs.readFileSync(dbPath, 'utf-8');
    const tokenData = JSON.parse(rawData);
    access_token = tokenData.access_token;

    if (!access_token) {
      console.error('❌ Không có access_token trong file.');
      return false;
    }

    const res = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${access_token}`);
    if (res.status === 200) {
      const data = await res.json();
      console.log('✅ Token hợp lệ:', data);
      return true;
    } else {
      const error = await res.json();
      console.warn('⚠️ Token không hợp lệ:', error);
      return false;
    }

  } catch (err) {
    console.error('❌ Lỗi kiểm tra token:', err.message);
    return false;
  }
}

// Thử gọi kiểm tra
(async () => {
  const valid = await checkTokenValid();
  console.log('Token hợp lệ?', valid);
})();

module.exports = { checkTokenValid };
