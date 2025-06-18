import React, { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router';
import axios from "axios";
import config from "../config.json";
import handleAccessTokenExpiration from "./HandleAccessTokenExpiration";
import handleGoogleDriveShortcutLink from "./HandleGoogleDriveShortcutLink";

// Ant Design components
import { Table, Button, Upload, Progress, message, Popconfirm } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';

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
          q: `mimeType!='application/vnd.google-apps.folder' and trashed = false and '${fid}' in parents`,
        },
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

  const handleRemoveFile = async (fileId) => {
    try {
      await axios.delete(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { supportsAllDrives: true },
      });
      setResults(prev => prev.filter(file => file.id !== fileId));
      message.success("File deleted.");
    } catch (err) {
      message.error("Failed to delete file.");
    }
  };

  const handleFileUpload = async ({ file, onProgress, onSuccess, onError }) => {
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
            onProgress({ percent });
          },
        }
      );

      setUploadProgress(null);
      await getFiles();
      setUploadSuccess(true);
      message.success("Upload successful");
      setTimeout(() => setUploadSuccess(false), 3000);
      onSuccess("ok");
    } catch (err) {
      setUploadProgress(null);
      message.error("Upload failed");
      if (err.response?.status === 401) {
        handleAccessTokenExpiration();
      }
      onError(err);
    }
  };

  const columns = [
    {
      title: '#',
      render: (_text, _record, index) => index + 1,
      width: 50,
      align: 'center',
    },
    {
      title: 'File Name',
      dataIndex: 'name',
      render: (text, record) => (
        <a
          href={getFileUrl(record)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleGoogleDriveShortcutLink}
        >
          <span style={{ marginRight: 8 }}>{getFileIcon(record.mimeType)}</span>
          {text}
        </a>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Popconfirm
          title="Are you sure to delete this file?"
          onConfirm={() => handleRemoveFile(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="primary" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Upload
        customRequest={handleFileUpload}
        showUploadList={false}
      >
        <Button icon={<UploadOutlined />} type="primary">
          Upload File
        </Button>
      </Upload>

      {uploadProgress !== null && (
        <div style={{ marginTop: 16 }}>
          <Progress percent={uploadProgress} />
        </div>
      )}

      {uploadSuccess && (
        <div style={{ color: "green", marginTop: 10 }}>
          ✅ File uploaded successfully!
        </div>
      )}

      {error && (
        <div style={{ color: "red", marginTop: 10 }}>
          {error.message}
        </div>
      )}

      <Table
        dataSource={results}
        rowKey="id"
        style={{ marginTop: 24 }}
        pagination={false}
        columns={columns}
        locale={{ emptyText: 'No files found.' }}
        loading={loading}
      />
    </div>
  );
};

export default PlayBookFiles;
