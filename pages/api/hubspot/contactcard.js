export default function handler(req, res) {
  res.status(200).json({
    type: "IFRAME",
    width: 890,
    height: 748,
    uri: "https://example.com/iframe-contents",
    label: "Edit",
    associatedObjectProperties: ["some_crm_property"]
  });
}
