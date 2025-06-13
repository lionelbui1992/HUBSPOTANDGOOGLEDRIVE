import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function FolderPage() {
  const router = useRouter();
  const [dealid, setDealid] = useState(null);
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const queryDealid = router.query.dealid;
    const pendingDealid = localStorage.getItem('pending_dealid');

    const finalDealid = queryDealid || pendingDealid;
    setDealid(finalDealid);

    if (!finalDealid) {
      setStatus('error');
      setMessage('❌ Không tìm thấy Deal ID!');
      return;
    }

    const accessToken = localStorage.getItem('access_token');
    const parentid = localStorage.getItem('drive_root_folder_id');
    if (!accessToken) {
      setStatus('error');
      setMessage('❌ Chưa có access token!');
      localStorage.setItem('pending_dealid', finalDealid);
      router.push('/');
      return;
    }

    fetch(`/api/folder?dealid=${finalDealid}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-parent-id': parentid,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.folder && data.folder.id) {
          setStatus('success');
          setMessage(`✅ Folder đã sẵn sàng: ${data.folder.name}`);
          localStorage.removeItem('pending_dealid');
          router.push(`/list/${data.folder.id}`);
        } else {
          setStatus('error');
          setMessage('❌ Tạo folder thất bại!');
        }
      })
      .catch(err => {
        setStatus('error');
        setMessage('❌ Lỗi khi gọi API tạo folder!');
        console.error(err);
      });
  }, [router.query.dealid]);

  return (
    <div style={styles.container}>
      <h2>Redirecting to folder ...</h2>
      <p>Deal ID: <strong>{dealid}</strong></p>
      <p style={status === 'success' ? styles.success : styles.error}>{message}</p>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '40px auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
  },
  success: {
    color: '#389e0d',
    fontWeight: 'bold',
  },
  error: {
    color: '#cf1322',
    fontWeight: 'bold',
  },
};
