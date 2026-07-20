"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit } from "lucide-react";

interface CustomerDetail {
  id: string;
  name: string;
  phone: string;
  type: string;
  code?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  vehicles?: number;
}

const statusPill = (status: string) => {
  const map: Record<string, string> = { Draft: "#6b7280", Approved: "#0176d3", "In Progress": "#f59e0b", Completed: "#2e844a", Cancelled: "#ea001e" };
  return map[status] || "#6b7280";
};

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"details" | "history" | "workorders" | "vehicles">("details");
  const id = params.id as string;

  useEffect(() => {
    fetch(`/api/customers/${id}`)
      .then((r) => r.json())
      .then((json) => { setItem(json.data || json); setLoading(false); })
      .catch(() => { setError("Failed to load customer"); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/master-data/customers")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" }}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <div style={{ background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 16, marginTop: 16 }}><p style={{ color: "#444746" }}>Loading...</p></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/master-data/customers")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" }}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <div style={{ background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 16, marginTop: 16 }}><p style={{ color: "#444746" }}>Data tidak ditemukan</p></div>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 12px 24px" }} className="sm:px-6">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => router.push("/master-data/customers")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" }}>
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>Customer Details</h1>
          <div style={{ fontSize: 13, color: "#0176d3", marginTop: 2 }}>{item.name}</div>
        </div>
        <button onClick={() => router.push(`/master-data/customers/${id}/edit`)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", fontSize: 12, fontWeight: 500, color: "#fff", background: "#0176d3", border: "1px solid #0176d3", borderRadius: 6, cursor: "pointer" }}>
          <Edit size={14} /> Edit
        </button>
      </div>

      <div className="flex gap-0 mb-4 bg-[#ecebea] rounded-lg p-1 overflow-x-auto">
        <button key="details" onClick={() => setActiveTab("details")} style={{ padding: "7px 18px", fontSize: 13, border: "none", borderRadius: 6, cursor: "pointer", color: activeTab === "details" ? "#fff" : "#444746", background: activeTab === "details" ? "#0176d3" : "transparent", fontWeight: activeTab === "details" ? 600 : 400, whiteSpace: "nowrap" }}>Details</button>
        <button key="history" onClick={() => setActiveTab("history")} style={{ padding: "7px 18px", fontSize: 13, border: "none", borderRadius: 6, cursor: "pointer", color: activeTab === "history" ? "#fff" : "#444746", background: activeTab === "history" ? "#0176d3" : "transparent", fontWeight: activeTab === "history" ? 600 : 400, whiteSpace: "nowrap" }}>Service Orders</button>
        <button key="workorders" onClick={() => setActiveTab("workorders")} style={{ padding: "7px 18px", fontSize: 13, border: "none", borderRadius: 6, cursor: "pointer", color: activeTab === "workorders" ? "#fff" : "#444746", background: activeTab === "workorders" ? "#0176d3" : "transparent", fontWeight: activeTab === "workorders" ? 600 : 400, whiteSpace: "nowrap" }}>Work Orders</button>
        {item.type === "Wholesale" && (
          <button key="vehicles" onClick={() => setActiveTab("vehicles")} style={{ padding: "7px 18px", fontSize: 13, border: "none", borderRadius: 6, cursor: "pointer", color: activeTab === "vehicles" ? "#fff" : "#444746", background: activeTab === "vehicles" ? "#0176d3" : "transparent", fontWeight: activeTab === "vehicles" ? 600 : 400, whiteSpace: "nowrap" }}>Vehicles</button>
        )}
      </div>

      {activeTab === "details" && (
        <div style={{ background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 16 }}>
          <F label="ID" value={item.code || item.id?.slice(-6)} />
          <F label="NAMA" value={item.name} />
          <F label="TELEPON" value={item.phone || "—"} />
          <F label="WHATSAPP" value={item.whatsapp || "—"} />
          <F label="EMAIL" value={item.email || "—"} />
          <F label="TIPE" value={item.type} />
          <F label="ALAMAT" value={item.address || "—"} />
        </div>
      )}

      {activeTab === "history" && (
        <div style={{ border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
          <div style={{ padding: 24, textAlign: "center", color: "#8e8f8e" }}>Belum ada history service order</div>
        </div>
      )}

      {activeTab === "workorders" && (
        <div style={{ border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
          <div style={{ padding: 24, textAlign: "center", color: "#8e8f8e" }}>Belum ada work order</div>
        </div>
      )}

      {activeTab === "vehicles" && (
        <div style={{ border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
          <div style={{ padding: 24, textAlign: "center", color: "#8e8f8e" }}>Belum ada data kendaraan</div>
        </div>
      )}
    </div>
  );
}

const TH: React.CSSProperties = { padding: "8px 10px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea", letterSpacing: "0.04em", whiteSpace: "nowrap" };
const TD: React.CSSProperties = { padding: "8px 10px", borderBottom: "1px solid #f0f0f0", color: "#001526" };

function F({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", borderBottom: "1px solid #f0f0f0" }}>
      <span style={{ fontSize: 12, color: "#444746" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 500, color: "#001526" }}>{value}</span>
    </div>
  );
}
