import { useRouter } from 'next/router';
import { useState } from 'react';

export default function UploadPage() {
  const router = useRouter();
  const { fid } = router.query;
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`/api/gdrive/upload/${fid}`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ Upload thành công: ${data.name}`);
      } else {
        setMessage(`❌ Upload thất bại: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      setMessage(`❌ Lỗi mạng: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Upload file vào folder <code>{fid}</code></h2>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          type="file"
          name="file"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />
        <br /><br />
        <button type="submit" disabled={loading} style={{ padding: '10px 20px' }}>
          {loading ? 'Đang tải lên...' : 'Tải lên'}
        </button>
      </form>

      {loading && (
        <div style={{ marginTop: '20px' }}>
          <div style={{
            height: '6px',
            width: '100%',
            backgroundColor: '#eee',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: '100%',
              backgroundColor: '#4caf50',
              animation: 'loadingBar 1.2s linear infinite'
            }} />
          </div>
          <style jsx>{`
            @keyframes loadingBar {
              0% { transform: translateX(-100%); }
              50% { transform: translateX(-50%); }
              100% { transform: translateX(100%); }
            }
          `}</style>
        </div>
      )}

      {message && (
        <div style={{ marginTop: '20px', color: message.startsWith('✅') ? 'green' : 'red' }}>
          {message}
        </div>
      )}
    </div>
  );
}
