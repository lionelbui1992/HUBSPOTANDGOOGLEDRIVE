export default function handler(req, res) {
  const { associatedObjectId } = req.body;

  // Kiểm tra và xử lý nếu cần
  if (!associatedObjectId) {
    return res.status(400).json({ error: "Missing associatedObjectId" });
  }

  // Trả về JSON định dạng HubSpot yêu cầu
  res.status(200).json({
    title: "Thông tin khách hàng",
    display: {
      properties: [
        {
          label: "Mã khách hàng",
          dataType: "STRING",
          value: associatedObjectId
        }
      ],
      actions: [
        {
          type: "IFRAME",
          width: 800,
          height: 600,
          uri: `https://gdrive.onextdigital.com/contact-card/${associatedObjectId}`,
          label: "Xem chi tiết",
          associatedObjectProperties: ["email", "firstname"]
        }
      ]
    }
  });
}
