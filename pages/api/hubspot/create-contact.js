import { getValidAccessToken } from "../../lib/hubspot";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { email, firstname, lastname, phone, accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ error: "Missing HubSpot token" });
    }

    const access_token = await getValidAccessToken(accessToken);

    const contact = {
      properties: { email, firstname, lastname, phone },
    };

    const response = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contact),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: "HubSpot API error", details: data });
    }

    res.status(200).json({ message: "Contact created", data });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
}
