import { useRouter } from 'next/router';

export default function ContactCard() {
  const router = useRouter();
  const { contactId } = router.query;

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2>Liên hệ ID: {contactId}</h2>
      <p>Đây là nội dung được hiển thị trong iFrame.</p>
      <p>Bạn có thể tùy chỉnh thêm giao diện hoặc lấy dữ liệu từ HubSpot API.</p>
    </div>
  );
}