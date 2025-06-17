import React, { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router';
import axios from "axios";
import config from "../config.json";
import styles from '../styles/Home.module.css';
import handleAccessTokenExpiration from "./HandleAccessTokenExpiration";
import handleGoogleDriveShortcutLink from "./HandleGoogleDriveShortcutLink";

const PlayBookFiles = () => {
  const router = useRouter();
  const fid = router.query.fid || 'null';

  const teamDriveId = config.directory.team_drive;
  const corpora = teamDriveId ? "teamDrive" : "allDrives";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const fileInputRef = useRef(null);

  // Lấy token từ API
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await fetch("/api/token");
        const data = await res.json();
        setAccessToken(data.access_token);
      } catch (err) {
        console.error("Không lấy được access token:", err);
      }
    };
    fetchToken();
  }, []);

  const getFiles = async () => {
    if (!accessToken || fid === "null") return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const res = await axios.get("https://www.googleapis.com/drive/v3/files", {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          corpora,
          includeTeamDriveItems: true,
          supportsAllDrives: true,
          teamDriveId,
          q: `mimeType!='application/vnd.google-apps.folder' and trashed = false and parents in '${fid}'`
        }
      });

      setResults(res.data.files);
    } catch (err) {
      if (err.response?.status === 401) {
        handleAccessTokenExpiration();
      } else {
        setError(err);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!router.isReady || !accessToken) return;

    if (fid === 'null') {
      if (!sessionStorage.getItem("reloadedForNullFid")) {
        sessionStorage.setItem("reloadedForNullFid", "true");
        window.location.reload();
      }
      return;
    }

    sessionStorage.removeItem("reloadedForNullFid");
    getFiles();
  }, [router.isReady, fid, accessToken]);

  const getFileIcon = (mimeType) => {
    if (mimeType.includes("spreadsheet")) return "📊";
    if (mimeType.includes("document")) return "📄";
    if (mimeType.includes("presentation")) return "📽️";
    if (mimeType === "application/pdf") return "📕";
    if (mimeType.startsWith("image/")) return "🖼️";
    return "📁";
  };

  const getFileUrl = (file) => {
    const mime = file.mimeType;
    const id = file.id;
    if (mime.startsWith("application/vnd.google-apps.")) {
      if (mime.includes("document")) return `https://docs.google.com/document/d/${id}/edit`;
      if (mime.includes("spreadsheet")) return `https://docs.google.com/spreadsheets/d/${id}/edit`;
      if (mime.includes("presentation")) return `https://docs.google.com/presentation/d/${id}/edit`;
    }
    return `https://drive.google.com/file/d/${id}/view`;
  };

  const isDownloadable = (file) => {
    const mime = file.mimeType;
    return !mime.startsWith("application/vnd.google-apps.") && !mime.startsWith("image/") && mime !== "application/pdf";
  };

  const handleRemoveFile = async (fileId) => {
    if (!confirm("Bạn có chắc muốn xoá file này không?")) return;
    try {
      await axios.delete(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { supportsAllDrives: true }
      });
      setResults(prev => prev.filter(file => file.id !== fileId));
    } catch (err) {
      alert("Lỗi khi xoá file.");
    }
  };

  // const ensureFolderExists = async () => {
  //   try {
  //     const res = await axios.get("https://www.googleapis.com/drive/v3/files", {
  //       headers: { Authorization: `Bearer ${accessToken}` },
  //       params: {
  //         corpora,
  //         includeTeamDriveItems: true,
  //         supportsAllDrives: true,
  //         teamDriveId,
  //         q: `'${config.directory.root}' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder' and id = '${fid}'`
  //       }
  //     });

  //     if (res.data.files.length === 0) {
  //       const folderMetadata = {
  //         name: "New Folder",
  //         mimeType: "application/vnd.google-apps.folder",
  //         parents: [config.directory.root]
  //       };

  //       const createRes = await axios.post(
  //         "https://www.googleapis.com/drive/v3/files?supportsAllDrives=true",
  //         folderMetadata,
  //         { headers: { Authorization: `Bearer ${accessToken}` } }
  //       );

  //       return createRes.data.id;
  //     } else {
  //       return fid;
  //     }
  //   } catch (err) {
  //     console.error("Lỗi kiểm tra/khởi tạo folder:", err);
  //     return null;
  //   }
  // };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    //const folderId = await ensureFolderExists();
   // if (!folderId) return;

    const metadata = {
      name: file.name,
      parents: [fid],
    };

    const form = new FormData();
    form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    form.append("file", file);

    setUploadProgress(0);

    try {
      await axios.post(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true",
        form,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        }
      );
      setUploadProgress(null);
      getFiles();
    } catch (err) {
      setUploadProgress(null);
      if (err.response?.status === 401) {
        handleAccessTokenExpiration();
      } else {
        alert("Upload thất bại.");
      }
    }
  };

  return (
    <div style={{ width: "100%", textAlign: "center" }}>
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          className={styles.card}
        >
          📁 Upload File
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />
      </div>

      {uploadProgress !== null && (
        <div style={{ marginBottom: 16 }}>
          <label>Uploading: {uploadProgress}%</label>
          <progress value={uploadProgress} max="100" style={{ width: '100%' }} />
        </div>
      )}

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>{error.message}</div>}

      {!loading && results.length === 0 ? (
        <p>There is no files</p>
      ) : (
        <ul className={styles.filesContainer}>
          {results.map(file => (
            <li key={file.id} className={styles.fileResult}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <a
                  href={getFileUrl(file)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ flexGrow: 1, textDecoration: "none", color: "#1a73e8", fontWeight: "500" }}
                  download={isDownloadable(file)}
                  onClick={handleGoogleDriveShortcutLink}
                >
                  <span style={{ marginRight: 8 }}>{getFileIcon(file.mimeType)}</span>
                  {file.name}
                </a>
                <button
                  onClick={() => handleRemoveFile(file.id)}
                  style={{
                    marginLeft: "10px",
                    padding: "4px 8px",
                    backgroundColor: "#d9534f",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  ✖
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlayBookFiles;
