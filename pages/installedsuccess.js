import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function InstalledSuccess() {
  const [userInfo, setUserInfo] = useState(null);
  const [folderId, setFolderId] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('hubspot_user_info');
    const storedFolderId = localStorage.getItem('drive_root_folder_id');

    if (storedUser) {
      setUserInfo(JSON.parse(storedUser));
    }

    if (storedFolderId) {
      setFolderId(storedFolderId);
    }
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <Head>
        <title>✅ Cài đặt thành công</title>
      </Head>

      <h1>🎉 Cài đặt thành công!</h1>

      {userInfo ? (
        <div>
          <p><strong>👤 Người dùng:</strong> {userInfo.user}</p>
          <p><strong>🏢 Hub ID:</strong> {userInfo.hub_id}</p>
        </div>
      ) : (
        <p>Không tìm thấy thông tin người dùng.</p>
      )}

      {folderId ? (
        <p><strong>📂 Thư mục đã chọn:</strong> {folderId}</p>
      ) : (
        <p>Không tìm thấy thư mục đã chọn.</p>
      )}
    </div>
  );
}
