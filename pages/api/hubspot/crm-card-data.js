export default function handler(req, res) {
  res.status(200).json({
    title: "Custom Iframe Card",
    results: [
      {
        type: "IFRAME",
        width: 890,
        height: 748,
        uri: "https://gdrive.onextdigital.com/contact-card",
        label: "Edit",
        associatedObjectProperties: ["some_crm_property"]
      }
    ]
  });
}
