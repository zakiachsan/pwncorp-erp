"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Edit } from "lucide-react";

const data: Record<string, any> = {
  "C-001": {
    id: "C-001", name: "Budi Santoso", phone: "0812-3456-7890", type: "Retail",
    address: "Jl. Merdeka No. 10, Jakarta", email: "budi@email.com", vehicles: 1, lastService: "26 Jun 2026",
    history: [
      { no: "SO-001", date: "26 Jun 2026", vehicle: "Toyota Avanza", status: "Approved", total: "Rp 2.500.000" },
      { no: "SO-005", date: "24 Jun 2026", vehicle: "Toyota Avanza", status: "Completed", total: "Rp 950.000" },
      { no: "SO-008", date: "22 Jun 2026", vehicle: "Toyota Avanza", status: "Draft", total: "Rp 1.200.000" },
    ]
  },
  "C-002": {
    id: "C-002", name: "PT Maju Jaya", phone: "021-555-1234", type: "Wholesale",
    address: "Jl. Sudirman No. 55, Jakarta", email: "info@majujaya.co.id", vehicles: 3, lastService: "26 Jun 2026",
    history: [
      { no: "SO-002", date: "26 Jun 2026", vehicle: "Honda Civic", status: "Approved", total: "Rp 1.800.000" },
    ]
  },
  "C-003": { id: "C-003", name: "Siti Rahmawati", phone: "0856-7890-1234", type: "Retail", address: "Jl. Thamrin No. 20", email: "siti@email.com", vehicles: 1, lastService: "25 Jun 2026", history: [] },
  "C-004": { id: "C-004", name: "CV Berkah Abadi", phone: "022-888-5678", type: "Wholesale", address: "Jl. Asia Afrika No. 30", email: "berkah@abadi.co.id", vehicles: 2, lastService: "24 Jun 2026", history: [] },
  "C-005": { id: "C-005", name: "Ahmad Fauzi", phone: "0878-9012-3456", type: "Retail", address: "Jl. Pemuda No. 15", email: "ahmad@email.com", vehicles: 1, lastService: "24 Jun 2026", history: [] },
  "C-006": { id: "C-006", name: "PT Transport Jaya", phone: "021-777-9012", type: "Wholesale", address: "Jl. Gatot Subroto No. 67", email: "info@transportjaya.co.id", vehicles: 5, lastService: "23 Jun 2026", history: [] },
};

const statusPill = (status: string) => {
  const map: Record<string, string> = { Draft: "#6b7280", Approved: "#0176d3", "In Progress": "#f59e0b", Completed: "#2e844a", Cancelled: "#ea001e" };
  return map[status] || "#6b7280";
};

const excludedStatuses = ["Draft", "Cancelled", "Pending"];

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"details" | "history">("details");
  const item = data[params.id as string];

  if (!item) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/master-data/customers")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" }}>
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
        <button onClick={() => router.push("/master-data/customers")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" }}>
          <ArrowLeft size={16} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>Customer Details</h1>
          <div style={{ fontSize: 13, color: "#0176d3", marginTop: 2 }}>{item.name}</div>
        </div>
        <button style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", fontSize: 12, fontWeight: 500, color: "#fff", background: "#0176d3", border: "1px solid #0176d3", borderRadius: 6, cursor: "pointer" }}>
          <Edit size={14} /> Edit
        </button>
      </div>

      <div style={{ display: "flex", gap: 0, marginBottom: 16, background: "#ecebea", borderRadius: 8, padding: 3, width: "fit-content" }}>
        {(["details", "history"] as const).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ padding: "7px 18px", fontSize: 13, border: "none", borderRadius: 6, cursor: "pointer", color: activeTab === t ? "#fff" : "#444746", background: activeTab === t ? "#0176d3" : "transparent", fontWeight: activeTab === t ? 600 : 400 }}>
            {t === "details" ? "Details" : "Service Orders"}
          </button>
        ))}
      </div>

      {activeTab === "details" && (
        <div style={{ background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 16 }}>
          <F label="ID" value={item.id} />
          <F label="NAMA" value={item.name} />
          <F label="TELEPON" value={item.phone} />
          <F label="TIPE" value={item.type} />
          <F label="ALAMAT" value={item.address} />
          <F label="EMAIL" value={item.email} />
          <F label="KENDARAAN" value={item.vehicles + " unit"} />
          <F label="SERVICE TERAKHIR" value={item.lastService} />
        </div>
      )}

      {activeTab === "history" && (
        <div style={{ border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
          {filteredHistory.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>No. SO</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>Date</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>Vehicle</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>Status</th>
                  <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((h: any, i: number) => (
                  <tr key={i} style={{ cursor: "pointer" }} onClick={() => router.push(`/service-orders/${h.no}`)}>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0", color: "#0176d3", fontWeight: 500 }}>{h.no}</td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0" }}>{h.date}</td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0" }}>{h.vehicle}</td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0" }}>
                      <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: statusPill(h.status), color: "#fff" }}>{h.status}</span>
                    </td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0", textAlign: "right", fontWeight: 500 }}>{h.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: 24, textAlign: "center", color: "#8e8f8e" }}>Belum ada history service order</div>
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
