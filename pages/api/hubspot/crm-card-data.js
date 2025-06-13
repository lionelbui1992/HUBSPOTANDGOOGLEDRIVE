export default function handler(req, res) {


  res.status(200).json({
  
  "primaryAction": {
    "type": "IFRAME",
    "width": 890,
    "height": 748,
    "uri": "https://gdrive.onextdigital.com/createfolder?dealid=12345",
    "label": "Google Drive"
  }
});
}
