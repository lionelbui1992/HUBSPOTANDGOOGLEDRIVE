// pages/gdrive/auth.js
import config from '../../config.json';

export default function handler(req, res) {
  const {
    userId,
    userEmail,
    associatedObjectId,
    associatedObjectType,
    portalId,
  } = req.query;

  const redirectUri = 'https://gdrive.onextdigital.com/api/oauth2callback';

  const state = encodeURIComponent(JSON.stringify({
    userId,
    userEmail,
    associatedObjectId,
    portalId,
  }));

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `access_type=offline&prompt=consent&response_type=code` +
    `&client_id=${config.api.client_id}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(config.api.scopes)}` +
    `&state=${state}`;

  res.redirect(authUrl);
}
