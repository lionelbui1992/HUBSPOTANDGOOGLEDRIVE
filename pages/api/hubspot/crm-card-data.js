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

  console.log('🔔 Received from HubSpot:', req.body);

  // Kiểm tra có id không
  if (!hs_object_id) {
   // return res.status(400).json({ error: "Missing hs_object_id" });
  }

  const contactId = hs_object_id;
  const displayName = `${firstname ?? ''} ${lastname ?? ''}`.trim() || email;
  const driveUrl = `https://gdrive.onextdigital.com/createfolder`;

  res.status(200).json({
    results: [
      {
        objectId: contactId,
        title: `📁 Google Drive Folder cho ${displayName}`,
        link: driveUrl,
        description: `Thư mục Drive được liên kết với ${displayName}`,
        image: "https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png"
      }
    ],
    primaryAction: {
      type: "IFRAME",
      width: 890,
      height: 748,
      uri: driveUrl,
      label: "🔐 Mở Google Drive"
    }
  });
}
