import { useState, useEffect } from "react";

export default function CreateContactPage() {
  const [form, setForm] = useState({
    email: "",
    firstname: "",
    lastname: "",
    phone: "",
  });

  const [accessToken, setAccessToken] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("hubspotAuth"));
    if (session) {
      setAccessToken(session);
    }
  }, []);

  const handleChange = (e) => {
    setForm((prevForm) => ({
      ...prevForm,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!accessToken) {
      setMessage("❌ Missing access token. Vui lòng đăng nhập lại.");
      return;
    }

    const res = await fetch("/api/hubspot/create-contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, accessToken }), // access_token đổi thành accessToken cho khớp API handler
    });

    const result = await res.json();

    if (res.ok) {
      setMessage("✅ Contact created successfully!");
    } else {
      setMessage(`❌ Error: ${result.error}`);
      console.error(result.details || result.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Tạo Contact HubSpot</h1>
      <form onSubmit={handleSubmit}>
        <input name="email" placeholder="Email" onChange={handleChange} value={form.email} /><br />
        <input name="firstname" placeholder="First Name" onChange={handleChange} value={form.firstname} /><br />
        <input name="lastname" placeholder="Last Name" onChange={handleChange} value={form.lastname} /><br />
        <input name="phone" placeholder="Phone" onChange={handleChange} value={form.phone} /><br />
        <input value={accessToken?.access_token || ''} readOnly style={{ width: "100%", marginTop: 10 }} /><br />
        <button type="submit">Tạo Contact</button>
      </form>
      <p>{message}</p>
    </div>
  );
}
