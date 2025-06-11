import React, { useState, useEffect } from "react";
import { useRouter } from 'next/dist/client/router';
import axios from "axios";
import config from "../config.json";
import styles from '../styles/Home.module.css';
import handleAccessTokenExpiration from "./HandleAccessTokenExpiration";
import handleGoogleDriveShortcutLink from "./HandleGoogleDriveShortcutLink";

const PlayBookFiles = () => {
  const router = useRouter();
  const fid = typeof router.query.fid !== 'undefined' ? router.query.fid : config.directory.target_folder;
  const teamDriveId = config.directory.team_drive;
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const corpora = teamDriveId ? "teamDrive" : "allDrives";

  useEffect(() => {
    const getFiles = async () => {
      setLoading(true);
      setError(null);
      setResults([]);

      const accessToken = localStorage.getItem("access_token");

      try {
        const res = await axios.get("https://www.googleapis.com/drive/v3/files", {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: {
            source: "PlayBookFiles",
            corpora: corpora,
            includeTeamDriveItems: true,
            supportsAllDrives: true,
            teamDriveId: teamDriveId,
            q: `mimeType!='application/vnd.google-apps.folder' and trashed = false and parents in '${fid}'`
          }
        });

        setResults(res.data.files);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          handleAccessTokenExpiration();
        } else {
          setError(err);
        }
      }

      setLoading(false);
    };

    getFiles();
  }, [fid]);

  // Hàm tạo đường dẫn chính xác theo loại mimeType
  const getGoogleDriveFileUrl = (file) => {
    switch (file.mimeType) {
      case 'application/vnd.google-apps.spreadsheet':
        return `https://docs.google.com/spreadsheets/d/${file.id}/edit`;
      case 'application/vnd.google-apps.presentation':
        return `https://docs.google.com/presentation/d/${file.id}/edit`;
      case 'application/vnd.google-apps.document':
      default:
        return `https://docs.google.com/document/d/${file.id}/edit`;
    }
  };

  return (
    fid !== config.directory.target_folder && (
      <div style={{ width: "100%", textAlign: "left" }}>
        {loading && <div style={{ display: "none" }}>Loading...</div>}
        {error && <div>{error.message}</div>}
        <ul className={styles.filesContainer} style={{ width: "100%", textAlign: "left" }}>
          {results.map(result => (
            <li key={result.id} className={styles.fileResult}>
              <a
                href={getGoogleDriveFileUrl(result)}
                data-file-id={result.id}
                style={{ display: "block" }}
                target="_blank"
                rel="noopener noreferrer"
                data-mime-type={result.mimeType}
                onClick={handleGoogleDriveShortcutLink}
              >
                {result.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    )
  );
};

export default PlayBookFiles;
