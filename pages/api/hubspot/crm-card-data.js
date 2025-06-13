export default function handler(req, res) {
  const { hs_object_id } = req.body;

  if (!hs_object_id) {
    return res.status(400).json({ error: "Missing hs_object_id" });
  }

  const dealId = hs_object_id;

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
