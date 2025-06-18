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
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const fileInputRef = useRef(null);

  // Get access token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await fetch("/api/token");
        const data = await res.json();
        setAccessToken(data.access_token);
      } catch (err) {
        console.error("Failed to retrieve access token:", err);
      }
    };
    fetchToken();
  }, []);

  // Fetch file list
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
          q: `mimeType!='application/vnd.google-apps.folder' and trashed = false and  '${fid}' in parents`
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

  // Triggered when router or token is ready
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
    try {
      await axios.delete(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { supportsAllDrives: true }
      });
      setResults(prev => prev.filter(file => file.id !== fileId));
    } catch (err) {
      alert("Failed to delete file.");
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || fid === "null") return;

    const metadata = {
      name: file.name,
      parents: [fid],
    };

    const form = new FormData();
    form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    form.append("file", file);

    setUploadProgress(0);
    setUploadSuccess(false);

    try {
      await axios.post(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true",
        form,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          onUploadProgress: (e) => {
            const percent = Math.round((e.loaded * 100) / e.total);
            setUploadProgress(percent);
          }
        }
      );

      setUploadProgress(null);
      fileInputRef.current.value = ""; // reset input
      await getFiles();
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      setUploadProgress(null);
      if (err.response?.status === 401) {
        handleAccessTokenExpiration();
      } else {
        alert("Upload failed.");
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

      {uploadSuccess && (
        <div style={{ color: "green", marginBottom: 10 }}>
          ✅ File uploaded successfully!
        </div>
      )}

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>{error.message}</div>}

     
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f1f1f1" }}>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>#</th>
              <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>File Name</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {results.map((file, index) => (
              <tr key={file.id} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>
                  {index + 1}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  <a
                    href={getFileUrl(file)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#1a73e8", fontWeight: "500", textDecoration: "none" }}
                    onClick={handleGoogleDriveShortcutLink}
                  >
                    <span style={{ marginRight: 8 }}>{getFileIcon(file.mimeType)}</span>
                    {file.name}
                  </a>
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>
                  <button
                    onClick={() => handleRemoveFile(file.id)}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#d9534f",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    ✖
                  </button>
                </td>
              </tr>
            ))}
            {results.length === 0 && (
              <tr>
                <td colSpan={3} style={{ textAlign: "center", padding: "12px", color: "#777" }}>
                  No files found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
    </div>
  );
};

export default PlayBookFiles;
