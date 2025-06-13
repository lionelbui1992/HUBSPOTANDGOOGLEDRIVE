export default function handler(req, res) {


  res.status(200).json({
    results: [
      {
        "title": "New CRM Card",
        "fetch": {
          "targetUrl": "https://www.example.com/demo-fetch",
          "objectTypes": [
            {
              "name": "contacts",
              "propertiesToSend": [
                "firstname",
                "email",
                "lastname"
              ]
            }
          ]
        }
      }
    ]
  });
}
