import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';

const DeleteFilePage = () => {
  const router = useRouter();
  const { fid } = router.query;
  const [status, setStatus] = useState('Đang xử lý...');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!fid || typeof window === 'undefined') return;

    const deleteFile = async () => {
      try {
        const res = await axios.delete(`/api/delete/${fid}`);
        if (res.data.success) {
          setStatus(`✅ Đã xoá file thành công: ${fid}`);
        } else {
          setError(`❌ Lỗi xoá file: ${res.data.message}`);
        }
      } catch (err) {
        setError(`❌ Xoá thất bại: ${err.response?.data?.message || err.message}`);
      }
    };


    deleteFile();
  }, [fid]);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Xoá File Google Drive</h2>
      {error ? <p style={{ color: "red" }}>{error}</p> : <p>{status}</p>}
    </div>
  );
};

export default DeleteFilePage;
