export default function handler(req, res) {
  const {
    hs_object_id,
    firstname,
    lastname,
    email,
    hubspot_owner_id,
    createdate,
    hs_lead_status,
    notes_last_updated
  } = req.body;

  if (!hs_object_id) {
    //return res.status(400).json({ error: "Missing hs_object_id" });
  }

  const contactId = hs_object_id;
  const displayName = `${firstname ?? ''} ${lastname ?? ''}`.trim();
  const driveUrl = `https://gdrive.onextdigital.com/createfolder?dealid=${contactId}`;

  res.status(200).json({
    results: [
      {
        objectId: 1,
        title: `📁 Google Drive Folder for ${displayName}`,
        link: driveUrl,
        description: `Liên kết đến thư mục Drive cho liên hệ ${displayName || email}`,
        image: "https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png" // Google Drive icon
      }
    ],
    primaryAction: {
      type: "IFRAME",
      width: 890,
      height: 748,
      uri: driveUrl,
      label: "🔐 Google Authen"
    }
  });
}
