export default function handler(req, res) {
  const {
    associatedObjectId,
    associatedObjectType,
    firstname,
    lastname,
    email,
    userId,
    userEmail,
    portalId
  } = req.query;

  const displayName = `${firstname ?? ''} ${lastname ?? ''}`.trim();
  const driveUrl = `https://gdrive.onextdigital.com/folder?dealid=${associatedObjectId}`;

  res.status(200).json({
    results: [
      {
        objectId: 1,
        title: `Google Drive Folder`,
        link: driveUrl,
        description: `Tạo thư mục Drive cho ${displayName || email}`,
        image: "https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png"
      }
    ],
    // primaryAction: {
    //   type: "IFRAME",
    //   width: 890,
    //   height: 748,
    //   uri: driveUrl,
    //   label: "🔐 Google Authen"
    // }
  });
}
