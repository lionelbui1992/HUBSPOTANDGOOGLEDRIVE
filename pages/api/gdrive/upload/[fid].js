// pages/api/gdrive/upload/[fid].js
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { fid } = req.query;

  // Đọc access_token từ database.json
  const dbPath = path.join(process.cwd(), 'pages', 'database.json');
  let access_token;
  try {
    const tokenRaw = fs.readFileSync(dbPath, 'utf-8');
    const tokenData = JSON.parse(tokenRaw);
    access_token = tokenData.access_token;
  } catch (err) {
    return res.status(500).json({ error: 'Access token not found' });
  }

  // Parse multipart/form-data để lấy file upload
  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Formidable parse error:', err);
      return res.status(400).json({ error: 'File upload error' });
    }

    const file = files.file;

    if (!file || !file.filepath) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const fileStream = fs.createReadStream(file.filepath);
      const metadata = {
        name: file.originalFilename,
        parents: [fid],
      };

      const boundary = 'foo_bar_baz';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const multipartBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        `Content-Type: ${file.mimetype}\r\n\r\n`;

      const endBody = closeDelimiter;

      // Create a full multipart stream
      const fetch = (await import('node-fetch')).default;
      const { PassThrough } = await import('stream');

      const bodyStream = new PassThrough();
      bodyStream.write(multipartBody);
      fileStream.pipe(bodyStream, { end: false });
      fileStream.on('end', () => {
        bodyStream.end(endBody);
      });

      const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: bodyStream,
      });

      const uploadData = await uploadRes.json();

      if (uploadRes.status >= 400) {
        return res.status(uploadRes.status).json({ error: uploadData.error || 'Upload failed' });
      }

      res.status(200).json({ success: true, fileId: uploadData.id, name: uploadData.name });
    } catch (err) {
      console.error('Upload error:', err.message);
      res.status(500).json({ error: 'Upload failed' });
    }
  });
}
