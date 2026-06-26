"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Edit } from "lucide-react";

const data: Record<string, any> = {
  "S-001": {
    id: "S-001", name: "PT Auto Parts", phone: "021-555-1234", address: "Jl. Raya Bogor No. 123, Jakarta", terms: "Net 30",
    history: [
      { no: "PO-001", date: "25 Jun 2026", items: 12, status: "Sent", total: "Rp 4.250.000" },
      { no: "PO-004", date: "26 Jun 2026", items: 15, status: "Draft", total: "Rp 3.500.000" },
    ]
  },
  "S-002": {
    id: "S-002", name: "CV Ban Sehat", phone: "022-888-5678", address: "Jl. Soekarno Hatta No. 45, Bandung", terms: "Net 14",
    history: [{ no: "PO-002", date: "24 Jun 2026", items: 8, status: "Partial Received", total: "Rp 2.800.000" }]
  },
  "S-003": {
    id: "S-003", name: "UD Oli Jaya", phone: "021-777-9012", address: "Jl. Gatot Subroto No. 67, Jakarta", terms: "COD",
    history: [{ no: "PO-003", date: "22 Jun 2026", items: 5, status: "Received", total: "Rp 1.200.000" }]
  },
};

const statusColor: Record<string, string> = { Draft: "#6b7280", Sent: "#f59e0b", "Partial Received": "#8b5cf6", Received: "#2e844a" };
const excludedStatuses = ["Draft", "Cancelled"];

export default function SupplierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"details" | "history">("details");
  const item = data[params.id as string];

  if (!item) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/master-data/suppliers")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" }}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <div style={{ background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 16, marginTop: 16 }}><p style={{ color: "#444746" }}>Data tidak ditemukan</p></div>
      </div>
    );
  }

  const filteredHistory = item.history.filter((h: any) => !excludedStatuses.includes(h.status));

  return (
    <div style={{ padding: "0 24px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button onClick={() => router.push("/master-data/suppliers")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" }}>
          <ArrowLeft size={16} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>Supplier Details</h1>
          <div style={{ fontSize: 13, color: "#0176d3", marginTop: 2 }}>{item.name}</div>
        </div>
        <button style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", fontSize: 12, fontWeight: 500, color: "#fff", background: "#0176d3", border: "1px solid #0176d3", borderRadius: 6, cursor: "pointer" }}>
          <Edit size={14} /> Edit
        </button>
      </div>

      <div style={{ display: "flex", gap: 0, marginBottom: 16, background: "#ecebea", borderRadius: 8, padding: 3, width: "fit-content" }}>
        {(["details", "history"] as const).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ padding: "7px 18px", fontSize: 13, border: "none", borderRadius: 6, cursor: "pointer", color: activeTab === t ? "#fff" : "#444746", background: activeTab === t ? "#0176d3" : "transparent", fontWeight: activeTab === t ? 600 : 400 }}>
            {t === "details" ? "Details" : "Purchase History"}
          </button>
        ))}
      </div>

      {activeTab === "details" && (
        <div style={{ background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 16 }}>
          <F label="ID" value={item.id} />
          <F label="NAMA" value={item.name} />
          <F label="TELEPON" value={item.phone} />
          <F label="ALAMAT" value={item.address} />
          <F label="PAYMENT TERMS" value={item.terms} />
        </div>
      )}

      {activeTab === "history" && (
        <div style={{ border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
          {filteredHistory.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>No. PO</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>Date</th>
                  <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>Items</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>Status</th>
                  <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((h: any, i: number) => (
                  <tr key={i} style={{ cursor: "pointer" }} onClick={() => router.push(`/inventory/po/${h.no}`)}>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0", color: "#0176d3", fontWeight: 500 }}>{h.no}</td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0" }}>{h.date}</td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0", textAlign: "right" }}>{h.items} items</td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0" }}>
                      <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: statusColor[h.status] || "#6b7280", color: "#fff" }}>{h.status}</span>
                    </td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0", textAlign: "right", fontWeight: 500 }}>{h.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: 24, textAlign: "center", color: "#8e8f8e" }}>Belum ada history purchase order</div>
          )}
        </div>
      )}
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
