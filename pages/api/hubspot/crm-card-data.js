export default function handler(req, res) {


  res.status(200).json({
  "results": [
    {
      "objectId": 245,
      "title": "📁 Google Drive Folder"
      "link": "https://gdrive.onextdigital.com/createfolder?dealid=12345",
    }
  ],
  "primaryAction": {
    "type": "IFRAME",
    "width": 890,
    "height": 748,
    "uri": "https://gdrive.onextdigital.com/createfolder?dealid=12345",
    "label": "🔐 Google Authen"
  }
});
}


