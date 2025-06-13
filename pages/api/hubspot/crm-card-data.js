export default function handler(req, res) {
  const { hs_object_id } = req.body;

  if (!hs_object_id) {
    return res.status(400).json({ error: "Missing hs_object_id" });
  }

  const dealId = hs_object_id;

  res.status(200).json({
  "title": "New CRM Card",
  "fetch": {
    "targetUrl": "https://www.example.com/demo-fetch",
    "objectTypes": [
      {
        "name": "contacts",
        "propertiesToSend": [
          "firstname",
          "email",
          "lastname"
        ]
      }
    ]
  }
});
}
