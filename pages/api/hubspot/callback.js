// pages/api/hubspot/oauth-callback.js
import config from "../../../config.json";

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Missing authorization code" });
  }

  try {
    const tokenRes = await fetch("https://api.hubapi.com/oauth/v1/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: config.HUBSPOT_CLIENT_ID,
        client_secret: config.HUBSPOT_CLIENT_SECRET,
        redirect_uri: config.HUBSPOT_REDIRECT_URI,
        code,
      }),
    });

    const data = await tokenRes.json();

    if (!tokenRes.ok) {
      return res.status(tokenRes.status).json({ error: "Token request failed", details: data });
    }

    // ✅ Redirect về frontend với token trong query
    return res.redirect(
    `/hubspot/token-received?token=${data.access_token}&expires_in=${data.expires_in}&refresh_token=${data.refresh_token}`
    );
  } catch (err) {
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
}
