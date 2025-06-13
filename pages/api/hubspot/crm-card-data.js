export default function handler(req, res) {
  const { firstname, lastname, email } = req.body;

  const contactId = req.body.associatedObjectId || "unknown";

  res.status(200).json({
    results: [
      {
        objectId: "card-iframe-1",
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
