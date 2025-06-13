import config from "../../config.json";

export async function getValidAccessToken(session) {
  const { access_token, refresh_token, expires_in } = session;

  // Nếu token vẫn còn hiệu lực thì dùng tiếp
  if (Date.now() < expires_in - 60 * 1000) {
    return access_token;
  }

  const client_id = config.HUBSPOT_CLIENT_ID;
  const client_secret = config.HUBSPOT_CLIENT_SECRET;

  const res = await fetch("https://api.hubapi.com/oauth/v1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id,
      client_secret,
      refresh_token,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Refresh token failed: ${data.message}`);
  }

  return data.access_token;
}
