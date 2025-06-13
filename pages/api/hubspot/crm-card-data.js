export default function handler(req, res) {
  
  const driveUrl = `https://gdrive.onextdigital.com/createfolder`;

  res.status(200).json({
    results: [
      {
        objectId: contactId,
        title: `📁 Google Drive Folder}`,
        link: driveUrl,
        description: `Thư mục Drive được liên kết`,
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
