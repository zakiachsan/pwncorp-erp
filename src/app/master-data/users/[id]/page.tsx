"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit } from "lucide-react";

const data: Record<string, any> = {
  "U-001": { id: "U-001", name: "Admin", username: "admin", role: "Admin", status: "Active" },
  "U-002": { id: "U-002", name: "Rudi", username: "rudi", role: "Service Advisor", status: "Active" },
  "U-003": { id: "U-003", name: "Ani", username: "ani", role: "Service Advisor", status: "Active" },
  "U-004": { id: "U-004", name: "Hendra", username: "hendra", role: "Mekanik", status: "Active" },
  "U-005": { id: "U-005", name: "Agus", username: "agus", role: "Mekanik", status: "Active" },
  "U-006": { id: "U-006", name: "Bambang", username: "bambang", role: "Mekanik", status: "Active" },
};

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const item = data[params.id as string];

  if (!item) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/master-data/users")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" }}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <div style={{ background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 16, marginTop: 16 }}><p style={{ color: "#444746" }}>Data tidak ditemukan</p></div>
      </div>
    );
  }

  return (
    <div className="sm:px-6" style={{ padding: "0 12px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={() => router.push("/master-data/users")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" }}>
          <ArrowLeft size={16} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>User Details</h1>
          <div style={{ fontSize: 13, color: "#0176d3", marginTop: 2 }}>{item.name}</div>
        </div>
        <button onClick={() => router.push(`/master-data/users/${params.id}/edit`)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", fontSize: 12, fontWeight: 500, color: "#fff", background: "#0176d3", border: "1px solid #0176d3", borderRadius: 6, cursor: "pointer" }}>
          <Edit size={14} /> Edit
        </button>
      </div>
      <div style={{ background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 16 }}>
        <F label="ID" value={item.id} />
        <F label="NAMA" value={item.name} />
        <F label="USERNAME" value={item.username} />
        <F label="ROLE" value={item.role} />
        <F label="STATUS" value={item.status} />
      </div>
    </div>
  );
}

function F({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", borderBottom: "1px solid #f0f0f0" }}>
      <span style={{ fontSize: 12, color: "#444746" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 500, color: "#001526" }}>{value}</span>
    </div>
  );
}
