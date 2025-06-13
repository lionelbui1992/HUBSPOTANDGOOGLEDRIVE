import { useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css'
import Head from 'next/head'

export default function DriveRootPicker() {
  const router = useRouter();

  useEffect(() => {
    const savedFolderId = localStorage.getItem('drive_root_folder_id');
    if (savedFolderId) {
      // 👇 Nếu đã có folder ID → chuyển sang trang tạo folder
      router.push('/creatfolder');
      return;
    }

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      alert("Không có access_token. Vui lòng đăng nhập trước.");
      return;
    }

    const loadPicker = () => {
      gapi.load('picker', { callback: createPicker });
    };

    const createPicker = () => {
      const view = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
        .setIncludeFolders(true)
        .setSelectFolderEnabled(true);

      const picker = new google.picker.PickerBuilder()
        .enableFeature(google.picker.Feature.NAV_HIDDEN)
        .setAppId('YOUR_GOOGLE_PROJECT_ID')
        .setOAuthToken(accessToken)
        .addView(view)
        .setCallback((data) => {
          if (data.action === google.picker.Action.PICKED) {
            const folder = data.docs[0];
            alert(`✅ Đã chọn thư mục: ${folder.name}`);

            // ✅ Lưu folder ID vào localStorage
            localStorage.setItem('drive_root_folder_id', folder.id); // cần lưu vào db

            // 👉 Sau đó redirect sang trang tạo folder
            router.push('/folder');
          }
        })
        .build();

      picker.setVisible(true);
    };

    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => gapi.load('client:picker', { callback: loadPicker });
    document.body.appendChild(script);
  }, []);

  
  return (
     <div className={styles.container}>
      <Head>
        <title>Google Drive By Onext Digital</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <main className={styles.main}>
          <h1>🔐 Processing Picker...</h1>
        </main>

        <footer className={styles.footer}>
          
        </footer>
    </div>
      
  );
}
