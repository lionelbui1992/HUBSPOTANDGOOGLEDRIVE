// pages/api/oauth2callback.js
import axios from 'axios';
import config from '../../config.json';

export default async function handler(req, res) {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).send('No code provided');
  }

  try {
    const redirectUri = config.api.redirect_url;

    const response = await axios.post('https://oauth2.googleapis.com/token', null, {
      params: {
        code: code,
        client_id: config.api.client_id,
        client_secret: config.api.client_secret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token, refresh_token, expires_in, token_type } = response.data; //lưu vào db

    // ✅ Lưu token vào đâu đó (session, database hoặc localStorage client nếu redirect)
    // Tạm thời redirect với token để debug:
    const redirectClient = '/authsuccess'; // hoặc frontend URL
    const tokenUrl = `${redirectClient}?access_token=${access_token}&refresh_token=${refresh_token}`;
    res.redirect(tokenUrl);

  } catch (error) {
    console.error('OAuth2 error:', error.response?.data || error.message);
    res.status(500).send('OAuth2 callback failed');
  }
}
