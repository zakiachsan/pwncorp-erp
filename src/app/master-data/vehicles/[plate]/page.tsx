"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Edit } from "lucide-react";

const data: Record<string, any> = {
  "B 1234 CD": {
    plate: "B 1234 CD", brand: "Toyota", model: "Avanza", year: "2022", color: "Silver",
    customer: "Budi Santoso", customerId: "C-001", storeTerbanyak: "Wijaya Motor One Stop Service - Jakarta Pusat",
    history: [
      { no: "SRO-001", date: "5 Jul 2026", services: "Spooring, Balancing", store: "Wijaya Motor One Stop Service - Jakarta Pusat", status: "Approved", total: "Rp 2.500.000" },
      { no: "SRO-005", date: "24 Jun 2026", services: "Ganti Oli", store: "Wijaya Motor One Stop Service - Jakarta Pusat", status: "Completed", total: "Rp 950.000" },
      { no: "SRO-008", date: "22 Jun 2026", services: "Ganti Rem", store: "Wijaya Motor One Stop Service - Jakarta Pusat", status: "Draft", total: "Rp 1.200.000" },
    ]
  },
  "B 5678 EF": {
    plate: "B 5678 EF", brand: "Honda", model: "Civic", year: "2021", color: "Hitam",
    customer: "PT Maju Jaya", customerId: "C-002", storeTerbanyak: "Wijaya Motor One Stop Service - Jakarta Selatan",
    history: [
      { no: "SRO-002", date: "4 Jul 2026", services: "Ganti Oli", store: "Wijaya Motor One Stop Service - Jakarta Selatan", status: "Approved", total: "Rp 1.800.000" },
      { no: "SRO-010", date: "1 Jul 2026", services: "Service Berkala 40K", store: "Wijaya Motor One Stop Service - Jakarta Selatan", status: "Completed", total: "Rp 3.200.000" },
    ]
  },
  "B 9012 GH": {
    plate: "B 9012 GH", brand: "Mitsubishi", model: "Pajero", year: "2020", color: "Putih",
    customer: "Siti Rahmawati", customerId: "C-003", storeTerbanyak: "Wijaya Motor One Stop Service - Bandung",
    history: [
      { no: "SRO-003", date: "3 Jul 2026", services: "Ganti Ban + Spooring", store: "Wijaya Motor One Stop Service - Bandung", status: "Approved", total: "Rp 1.500.000" },
    ]
  },
  "B 3456 IJ": {
    plate: "B 3456 IJ", brand: "Suzuki", model: "Ertiga", year: "2022", color: "Silver",
    customer: "CV Berkah Abadi", customerId: "C-004", storeTerbanyak: "Wijaya Motor One Stop Service - Bandung",
    history: [
      { no: "SRO-004", date: "3 Jul 2026", services: "Body Repair", store: "Wijaya Motor One Stop Service - Bandung", status: "Completed", total: "Rp 4.500.000" },
    ]
  },
  "B 7890 KL": {
    plate: "B 7890 KL", brand: "Daihatsu", model: "Xenia", year: "2021", color: "Merah",
    customer: "Ahmad Fauzi", customerId: "C-005", storeTerbanyak: "Wijaya Motor One Stop Service - Jakarta Pusat",
    history: []
  },
  "B 1112 MN": {
    plate: "B 1112 MN", brand: "Isuzu", model: "Elf", year: "2019", color: "Biru",
    customer: "PT Transport Jaya", customerId: "C-006", storeTerbanyak: "Wijaya Motor One Stop Service - Jakarta Pusat",
    history: [
      { no: "SRO-007", date: "1 Jul 2026", services: "Engine Overhaul", store: "Wijaya Motor One Stop Service - Jakarta Pusat", status: "In Progress", total: "Rp 12.000.000" },
    ]
  },
  "B 1314 OP": {
    plate: "B 1314 OP", brand: "Mitsubishi", model: "L300", year: "2020", color: "Putih",
    customer: "CV Berkah Abadi", customerId: "C-004", storeTerbanyak: "Wijaya Motor One Stop Service - Bandung",
    history: [
      { no: "SRO-011", date: "20 Jun 2026", services: "Ganti Aki + Tune Up", store: "Wijaya Motor One Stop Service - Bandung", status: "Completed", total: "Rp 2.800.000" },
    ]
  },
  "B 2468 QR": {
    plate: "B 2468 QR", brand: "Toyota", model: "Innova", year: "2023", color: "Putih",
    customer: "Dewi Lestari", customerId: "C-007", storeTerbanyak: "Wijaya Motor One Stop Service - Surabaya",
    history: [
      { no: "SRO-015", date: "30 Jun 2026", services: "Ganti Oli + Filter", store: "Wijaya Motor One Stop Service - Surabaya", status: "Completed", total: "Rp 1.850.000" },
    ]
  },
  "B 3690 ST": {
    plate: "B 3690 ST", brand: "Honda", model: "CR-V", year: "2021", color: "Hitam",
    customer: "PT Sinar Auto", customerId: "C-008", storeTerbanyak: "Wijaya Motor One Stop Service - Surabaya",
    history: []
  },
  "B 4812 UV": {
    plate: "B 4812 UV", brand: "Toyota", model: "Fortuner", year: "2020", color: "Silver",
    customer: "PT Karya Mandiri", customerId: "C-010", storeTerbanyak: "Wijaya Motor One Stop Service - Jakarta Pusat",
    history: []
  },
  "B 5934 WX": {
    plate: "B 5934 WX", brand: "Daihatsu", model: "Ayla", year: "2023", color: "Kuning",
    customer: "Nina Anggraini", customerId: "C-011", storeTerbanyak: "Wijaya Motor One Stop Service - Bandung",
    history: []
  },
  "B 6056 YZ": {
    plate: "B 6056 YZ", brand: "Suzuki", model: "APV", year: "2021", color: "Abu-abu",
    customer: "PT Karya Mandiri", customerId: "C-010", storeTerbanyak: "Wijaya Motor One Stop Service - Jakarta Pusat",
    history: []
  },
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
          <F label="CUSTOMER" value={item.customer} link onClick={() => router.push(`/master-data/customers/${item.customerId}`)} />
          <F label="STORE TERBANYAK" value={item.storeTerbanyak} />
        </div>
      )}

      {activeTab === "history" && (
        <div style={{ border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
          {filteredHistory.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>No. SRO</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>Date</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>Services</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>Store</th>
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
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0", fontSize: 12, color: "#444746" }}>{h.store}</td>
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
