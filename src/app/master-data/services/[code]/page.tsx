"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Edit } from "lucide-react";

const data: Record<string, any> = {
  "J-001": {
    code: "J-001", name: "Ganti Oli Mesin", category: "Perawatan", price: "Rp 250.000", duration: "30 menit",
    usageHistory: [
      { date: "26 Jun 2026", customer: "Budi Santoso", vehicle: "Toyota Avanza", so: "SO-001", status: "Approved" },
      { date: "24 Jun 2026", customer: "Ahmad Fauzi", vehicle: "Daihatsu Xenia", so: "SO-005", status: "Completed" },
      { date: "22 Jun 2026", customer: "Test User", vehicle: "Honda Brio", so: "SO-010", status: "Draft" },
    ],
    priceHistory: [
      { date: "26 Jun 2026", price: "Rp 250.000" },
      { date: "15 Jan 2026", price: "Rp 225.000" },
    ]
  },
  "J-002": {
    code: "J-002", name: "Spooring Mobil Kelas I", category: "Perbaikan", price: "Rp 375.000", duration: "60 menit",
    usageHistory: [{ date: "26 Jun 2026", customer: "Budi Santoso", vehicle: "Toyota Avanza", so: "SO-001", status: "Approved" }],
    priceHistory: [{ date: "20 Jun 2026", price: "Rp 375.000" }]
  },
  "J-003": { code: "J-003", name: "Balancing Ring", category: "Perawatan", price: "Rp 60.000", duration: "30 menit", usageHistory: [], priceHistory: [] },
  "J-004": { code: "J-004", name: "Ganti Kampas Rem", category: "Perbaikan", price: "Rp 150.000", duration: "45 menit", usageHistory: [], priceHistory: [] },
  "J-005": { code: "J-005", name: "Tune Up", category: "Perawatan", price: "Rp 200.000", duration: "60 menit", usageHistory: [], priceHistory: [] },
};

const excludedStatuses = ["Draft", "Cancelled", "Pending"];

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"details" | "usage" | "price">("details");
  const item = data[params.code as string];

  if (!item) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/master-data/services")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" }}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <div style={{ background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 16, marginTop: 16 }}><p style={{ color: "#444746" }}>Data tidak ditemukan</p></div>
      </div>
    );
  }

  const filteredUsage = item.usageHistory.filter((h: any) => !excludedStatuses.includes(h.status));

  return (
    <div style={{ padding: "0 24px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button onClick={() => router.push("/master-data/services")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" }}>
          <ArrowLeft size={16} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>Service Details</h1>
          <div style={{ fontSize: 13, color: "#0176d3", marginTop: 2 }}>{item.code} - {item.name}</div>
        </div>
        <button style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", fontSize: 12, fontWeight: 500, color: "#fff", background: "#0176d3", border: "1px solid #0176d3", borderRadius: 6, cursor: "pointer" }}>
          <Edit size={14} /> Edit
        </button>
      </div>

      <div style={{ display: "flex", gap: 0, marginBottom: 16, background: "#ecebea", borderRadius: 8, padding: 3, width: "fit-content" }}>
        {(["details", "usage", "price"] as const).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ padding: "7px 18px", fontSize: 13, border: "none", borderRadius: 6, cursor: "pointer", color: activeTab === t ? "#fff" : "#444746", background: activeTab === t ? "#0176d3" : "transparent", fontWeight: activeTab === t ? 600 : 400 }}>
            {t === "details" ? "Details" : t === "usage" ? "Usage History" : "Price History"}
          </button>
        ))}
      </div>

      {activeTab === "details" && (
        <div style={{ background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 16 }}>
          <F label="KODE" value={item.code} />
          <F label="NAMA" value={item.name} />
          <F label="KATEGORI" value={item.category} />
          <F label="HARGA" value={item.price} />
          <F label="ESTIMASI WAKTU" value={item.duration} />
        </div>
      )}

      {activeTab === "usage" && (
        <div style={{ border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
          {filteredUsage.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>Date</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>Customer</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>Vehicle</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>SO</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsage.map((h: any, i: number) => (
                  <tr key={i} style={{ cursor: "pointer" }} onClick={() => router.push(`/service-orders/${h.so}`)}>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0" }}>{h.date}</td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0", fontWeight: 500 }}>{h.customer}</td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0" }}>{h.vehicle}</td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0", color: "#0176d3", fontWeight: 500 }}>{h.so}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: 24, textAlign: "center", color: "#8e8f8e" }}>Belum ada history penggunaan</div>
          )}
        </div>
      )}

      {activeTab === "price" && (
        <div style={{ border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
          {item.priceHistory.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>Date</th>
                  <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {item.priceHistory.map((h: any, i: number) => (
                  <tr key={i}>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0" }}>{h.date}</td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0", textAlign: "right", fontWeight: 600 }}>{h.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: 24, textAlign: "center", color: "#8e8f8e" }}>Belum ada history harga</div>
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
