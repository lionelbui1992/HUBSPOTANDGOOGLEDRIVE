export default function handler(req, res) {
  const { hs_object_id, firstname, lastname, email } = req.body;

  if (!hs_object_id) {
    return res.status(400).json({ error: "Missing hs_object_id" });
  }

  const contactId = hs_object_id;

  res.status(200).json({
    results: [
      {
        objectId: 1,
        title: `👤 ${firstname} ${lastname}`,
        link: `https://yourdomain.com/view-contact?contactId=${contactId}`
      }
    ],
    primaryAction: {
      type: "IFRAME",
      width: 890,
      height: 748,
      uri: `https://yourdomain.com/edit-contact?contactId=${contactId}`,
      label: "✏️ Edit Contact"
    }
  });
}
