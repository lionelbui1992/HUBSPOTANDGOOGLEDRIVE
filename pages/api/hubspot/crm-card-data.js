export default function handler(req, res) {
  const { associatedObjectId } = req.body;
  const contactId = Number(associatedObjectId);

  if (!contactId || isNaN(contactId)) {
    return res.status(400).json({ error: "Invalid associatedObjectId" });
  }

  res.status(200).json({
    results: [
      {
        objectId: `686868`, // phải là string, nhưng từ số
        title: "Thông tin chi tiết (iframe)",
        linkLabel: "Mở rộng",
        linkUrl: `https://gdrive.onextdigital.com/contact-card?contactId=${contactId}`,
        sections: [
          {
            type: "iframe",
            url: `https://gdrive.onextdigital.com/contact-card?contactId=${contactId}`,
            height: 300
          }
        ]
      }
    ]
  });
}
