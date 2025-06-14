import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function DrivePicker() {
  const router = useRouter();

  useEffect(() => {
    const loadTokenAndPicker = async () => {
      try {
        const tokenRes = await fetch('/api/token');
        const tokenData = await tokenRes.json();

        if (!tokenData.access_token) {
          alert('❌ Không có access_token. Vui lòng xác thực trước.');
          router.push('/');
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => {
          gapi.load('client:picker', {
            callback: () => createPicker(tokenData.access_token),
          });
        };
        document.body.appendChild(script);
      } catch (err) {
        console.error('❌ Lỗi khi load token:', err);
        alert('Không thể lấy access_token');
      }
    };

    const createPicker = (accessToken) => {
      const view = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
        .setIncludeFolders(true)
        .setSelectFolderEnabled(true);

      const picker = new google.picker.PickerBuilder()
        .setOAuthToken(accessToken)
        .addView(view)
        .setTitle('Chọn thư mục Google Drive')
        .setCallback((data) => {
          if (data.action === google.picker.Action.PICKED) {
            const folder = data.docs[0];
            alert(`✅ Đã chọn thư mục: ${folder.name}`);
            localStorage.setItem('drive_root_folder_id', folder.id);// lưu vào db
            router.push('/authsuccess');
          } else if (data.action === google.picker.Action.CANCEL) {
            alert('❌ Đã hủy chọn thư mục');
            router.push('/install');
          }
        })
        .build();

      picker.setVisible(true);
    };

    loadTokenAndPicker();
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Chọn thư mục Google Drive</title>
      </Head>

      <main className={styles.main}>
        <h1>📂 Đang mở Google Picker...</h1>
      </main>
    </div>
  );
}
