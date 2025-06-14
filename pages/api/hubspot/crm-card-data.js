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
    "results": [
        {
          "objectId": 123,
          "title": "abc.docx",
          "link": "http://example.com/1",
          "created": "2016-09-15",
          "actions": [
            {
              "type": "CONFIRMATION_ACTION_HOOK",
              "confirmationMessage": "Are you sure you want to delete this file?",
              "confirmButtonText": "Yes",
              "cancelButtonText": "No",
              "httpMethod": "DELETE",
              "associatedObjectProperties": ["protected_account"],
              "uri": "https://gdrive.onextdigital.com/api/gdrive/deletefile/123",
              "label": "Delete"
            }
          ]
        },
        {
          "objectId": 124,
          "title": "abc.xlsx",
          "link": "http://example.com/1",
          "created": "2016-09-15",
          "actions": [
            {
              "type": "CONFIRMATION_ACTION_HOOK",
              "confirmationMessage": "Are you sure you want to delete this file?",
              "confirmButtonText": "Yes",
              "cancelButtonText": "No",
              "httpMethod": "DELETE",
              "associatedObjectProperties": ["protected_account"],
              "uri": "https://gdrive.onextdigital.com/api/gdrive/deletefile/124",
              "label": "Delete"
            }
          ]
        },
        {
          "objectId": 456,
          "title": "Authencation",
          "link": "https://gdrive.onextdigital.com/gdrive/auth",
        },
        {
          "objectId": 789,
          "title": "Upload File",
          "link": "http://example.com/2",
        }
      ],
      
    }
  );
}
