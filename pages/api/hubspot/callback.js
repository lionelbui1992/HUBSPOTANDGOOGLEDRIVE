// pages/api/hubspot/oauth-callback.js
import config from "../../../config.json";

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Missing authorization code" });
  }

  try {
    // Gửi yêu cầu để đổi code lấy access_token
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

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      return res.status(tokenRes.status).json({
        error: "Token request failed",
        details: tokenData,
      });
    }

    const accessToken = tokenData.access_token;

    // Lấy thông tin portal (người cài app)
    const userInfoRes = await fetch(`https://api.hubapi.com/oauth/v1/access-tokens/${accessToken}`);
    const userInfo = await userInfoRes.json();

    if (!userInfoRes.ok) {
      return res.status(userInfoRes.status).json({
        error: "Failed to fetch user info",
        details: userInfo,
      });
    }

    // ✅ Tùy chọn: lưu accessToken và userInfo vào DB tại đây nếu cần

    // ✅ Chuyển hướng về frontend, có thể gửi dữ liệu qua query hoặc lưu session
    return res.redirect(
      `/driverootpicker?hub_id=${userInfo.hub_id}&user=${encodeURIComponent(userInfo.user)}`
    );
  } catch (err) {
    return res.status(500).json({
      error: "Internal Server Error",
      details: err.message,
    });
  }
}
