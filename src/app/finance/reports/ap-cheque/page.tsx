"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function APChequeBGPage() {
  const router = useRouter();
  return (
    <div>
      <button onClick={() => router.push("/finance")} style={btnStyle}>
        <ArrowLeft size={16} /> Finance
      </button>
      <div style={cardStyle}>
        <h1 style={h1Style}>AP Cheque/BG</h1>
        <p style={pStyle}>Halaman ini sedang dalam pengembangan.</p>
      </div>
    </div>
  );
}

const btnStyle = { display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, fontWeight: 500, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer", marginBottom: 16 };
const cardStyle = { background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 20 };
const h1Style = { fontSize: 18, fontWeight: 700, color: "#001526", margin: 0, marginBottom: 8 };
const pStyle = { fontSize: 14, color: "#444746" };
