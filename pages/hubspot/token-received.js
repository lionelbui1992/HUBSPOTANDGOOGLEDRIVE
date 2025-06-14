// pages/hubspot/token-received.js
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function TokenReceivedPage() {
  const router = useRouter();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const token = query.get("token");
    const refresh_token = query.get("refresh_token");
    const expires_in = query.get("expires_in");

    if (token && expires_in) {
      const expiryTime = Date.now() + parseInt(expires_in, 10) * 1000;
      const authData = {
        access_token: token,
        refresh_token: refresh_token,
        expires_at: expiryTime,
      };

      router.replace("/driverootpicker");
    }
  }, [router]);

  return <p>🔄 Đang lưu token và chuyển hướng...</p>;
}
