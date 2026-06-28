"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Edit } from "lucide-react";

const data: Record<string, any> = {
  "B 1234 CD": {
    plate: "B 1234 CD", brand: "Toyota", model: "Avanza", year: "2022", color: "Silver", customer: "Budi Santoso",
    history: [
      { no: "SO-001", date: "26 Jun 2026", services: "Spooring, Balancing", status: "Approved", total: "Rp 2.500.000" },
      { no: "SO-005", date: "24 Jun 2026", services: "Ganti Oli", status: "Completed", total: "Rp 950.000" },
      { no: "SO-009", date: "22 Jun 2026", services: "Ganti Rem", status: "Draft", total: "Rp 1.500.000" },
    ]
  },
  "B 5678 EF": {
    plate: "B 5678 EF", brand: "Honda", model: "Civic", year: "2021", color: "Hitam", customer: "PT Maju Jaya",
    history: [{ no: "SO-002", date: "26 Jun 2026", services: "Ganti Oli", status: "Approved", total: "Rp 1.800.000" }]
  },
  "B 9012 GH": { plate: "B 9012 GH", brand: "Mitsubishi", model: "Pajero", year: "2020", color: "Putih", customer: "Siti Rahmawati", history: [] },
  "B 3456 IJ": { plate: "B 3456 IJ", brand: "Suzuki", model: "Ertiga", year: "2022", color: "Silver", customer: "CV Berkah Abadi", history: [] },
  "B 7890 KL": { plate: "B 7890 KL", brand: "Daihatsu", model: "Xenia", year: "2021", color: "Merah", customer: "Ahmad Fauzi", history: [] },
  "B 1112 MN": { plate: "B 1112 MN", brand: "Isuzu", model: "Elf", year: "2019", color: "Biru", customer: "PT Transport Jaya", history: [
    { no: "SO-006", date: "24 Jun 2026", services: "Service Berkala", status: "Draft", total: "Rp 4.800.000" },
  ] },
  "B 1314 OP": { plate: "B 1314 OP", brand: "Mitsubishi", model: "L300", year: "2020", color: "Putih", customer: "CV Berkah Abadi", history: [] },
};

const statusColor: Record<string, string> = { Draft: "#6b7280", Approved: "#0176d3", "In Progress": "#f59e0b", Completed: "#2e844a" };
const excludedStatuses = ["Draft", "Cancelled", "Pending"];

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"details" | "history">("details");
  const plateParam = decodeURIComponent(params.plate as string);
  const item = data[plateParam];

  if (!item) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/master-data/vehicles")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" }}>
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
        <button onClick={() => router.push("/master-data/vehicles")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" }}>
          <ArrowLeft size={16} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>Vehicle Details</h1>
          <div style={{ fontSize: 13, color: "#0176d3", marginTop: 2 }}>{item.plate}</div>
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
          <F label="PLAT NOMOR" value={item.plate} />
          <F label="MERK" value={item.brand} />
          <F label="MODEL" value={item.model} />
          <F label="TAHUN" value={item.year} />
          <F label="WARNA" value={item.color} />
          <F label="CUSTOMER" value={item.customer} />
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
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>Services</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>Status</th>
                  <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((h: any, i: number) => (
                  <tr key={i} style={{ cursor: "pointer" }} onClick={() => router.push(`/service-orders/${h.no}`)}>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0", color: "#0176d3", fontWeight: 500 }}>{h.no}</td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0" }}>{h.date}</td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0" }}>{h.services}</td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0" }}>
                      <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: statusColor[h.status] || "#6b7280", color: "#fff" }}>{h.status}</span>
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
