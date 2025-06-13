export default function handler(req, res) {
  const { associatedObjectId } = req.body; // lấy dealId từ HubSpot CRM

  if (!associatedObjectId) {
    return res.status(400).json({ error: "Missing associatedObjectId (dealid)" });
  }

  const dealId = associatedObjectId;

  res.status(200).json({
    results: [
      {
        objectId: 245,
        title: "📁 Google Drive Folder",
        link: `https://gdrive.onextdigital.com/createfolder?dealid=${dealId}`,
      }
    ],
    primaryAction: {
      type: "IFRAME",
      width: 890,
      height: 748,
      uri: `https://gdrive.onextdigital.com/createfolder?dealid=${dealId}`,
      label: "🔐 Google Authen",
    }
  });
}
