"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit } from "lucide-react";

interface VehicleDetail {
  id: string;
  plateNo: string;
  brand: string;
  model: string;
  year: string;
  chassisNo: string;
  engineNo: string;
  customerId: string;
  customer: { id: string; name: string } | null;
}

const statusColor: Record<string, string> = { Draft: "#6b7280", Approved: "#0176d3", "In Progress": "#f59e0b", Completed: "#2e844a" };

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<VehicleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"details" | "history">("details");
  const plateParam = decodeURIComponent(params.plate as string);

  useEffect(() => {
    fetch(`/api/vehicles?search=${encodeURIComponent(plateParam)}`)
      .then((r) => r.json())
      .then((json) => {
        const list = json.data || [];
        const found = list.find((v: any) => v.plateNo === plateParam);
        if (!found) {
          // Try fetching by ID if plateNo was passed as an ID
          return fetch(`/api/vehicles`).then((r) => r.json()).then((allJson) => {
            const all = allJson.data || [];
            const match = all.find((v: any) => v.plateNo === plateParam || v.id === plateParam);
            if (match) { setItem(match); setLoading(false); }
            else { setError("Vehicle not found"); setLoading(false); }
          });
        }
        setItem(found);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load vehicle"); setLoading(false); });
  }, [plateParam]);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/master-data/vehicles")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" }}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <div style={{ background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 16, marginTop: 16 }}><p style={{ color: "#444746" }}>Loading...</p></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/master-data/vehicles")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" }}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <div style={{ background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 16, marginTop: 16 }}><p style={{ color: "#444746" }}>Data tidak ditemukan</p></div>
      </div>
    );
  }

  return (
    <div className="sm:px-6" style={{ padding: "0 12px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button onClick={() => router.push("/master-data/vehicles")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" }}>
          <ArrowLeft size={16} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>Vehicle Details</h1>
          <div style={{ fontSize: 13, color: "#0176d3", marginTop: 2 }}>{item.plateNo}</div>
        </div>
        <button onClick={() => router.push(`/master-data/vehicles/${params.plate}/edit`)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", fontSize: 12, fontWeight: 500, color: "#fff", background: "#0176d3", border: "1px solid #0176d3", borderRadius: 6, cursor: "pointer" }}>
          <Edit size={14} /> Edit
        </button>
      </div>

      <div style={{ overflowX: "auto", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 0, background: "#ecebea", borderRadius: 8, padding: 3, width: "fit-content" }}>
        {(["details", "history"] as const).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ padding: "7px 18px", fontSize: 13, border: "none", borderRadius: 6, cursor: "pointer", color: activeTab === t ? "#fff" : "#444746", background: activeTab === t ? "#0176d3" : "transparent", fontWeight: activeTab === t ? 600 : 400 }}>
            {t === "details" ? "Details" : "Service Orders"}
          </button>
        ))}
      </div>
      </div>

      {activeTab === "details" && (
        <div style={{ background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 16 }}>
          <F label="PLAT NOMOR" value={item.plateNo} />
          <F label="MERK" value={item.brand} />
          <F label="MODEL" value={item.model} />
          <F label="TAHUN" value={item.year} />
          <F label="NO. RANGKA" value={item.chassisNo || "—"} />
          <F label="NO. MESIN" value={item.engineNo || "—"} />
          <F label="CUSTOMER" value={item.customer?.name || "—"} link onClick={() => item.customer && router.push(`/master-data/customers/${item.customer.id}`)} />
        </div>
      )}

      {activeTab === "history" && (
        <div style={{ border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
          <div style={{ padding: 24, textAlign: "center", color: "#8e8f8e" }}>Belum ada history service order</div>
        </div>
      )}
    </div>
  );
}

function F({ label, value, link, onClick }: { label: string; value: string; link?: boolean; onClick?: () => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", borderBottom: "1px solid #f0f0f0" }}>
      <span style={{ fontSize: 12, color: "#444746" }}>{label}</span>
      <span
        style={{ fontSize: 12, fontWeight: 500, color: link ? "#0176d3" : "#001526", cursor: link ? "pointer" : "default", textDecoration: link ? "underline" : "none" }}
        onClick={onClick}
      >{value}</span>
    </div>
  );
}
