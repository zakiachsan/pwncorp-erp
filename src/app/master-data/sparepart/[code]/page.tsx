"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Edit } from "lucide-react";

const data: Record<string, any> = {
  "SP-001": {
    code: "SP-001", name: "Oli Mesin 10W-40", brand: "Shell", category: "Oli", stock: 45, price: "Rp 85.000",
    stockHistory: [
      { date: "26 Jun 2026", type: "Used", reference: "WO-001", qtyChange: -4, stockAfter: 45 },
      { date: "25 Jun 2026", type: "Purchase", reference: "PO-001", qtyChange: +20, stockAfter: 49 },
      { date: "24 Jun 2026", type: "Used", reference: "WO-003", qtyChange: -2, stockAfter: 29 },
    ],
    priceHistory: [
      { date: "26 Jun 2026", buyPrice: "Rp 75.000", sellPrice: "Rp 85.000" },
      { date: "15 Jan 2026", buyPrice: "Rp 70.000", sellPrice: "Rp 80.000" },
    ]
  },
  "SP-002": {
    code: "SP-002", name: "Filter Oli", brand: "Toyota Genuine", category: "Filter", stock: 22, price: "Rp 65.000",
    stockHistory: [{ date: "25 Jun 2026", type: "Purchase", reference: "PO-001", qtyChange: +10, stockAfter: 22 }],
    priceHistory: [{ date: "20 Jun 2026", buyPrice: "Rp 50.000", sellPrice: "Rp 65.000" }]
  },
  "SP-003": { code: "SP-003", name: "Kampas Rem Depan", brand: "Bendix", category: "Rem", stock: 8, price: "Rp 250.000", stockHistory: [], priceHistory: [] },
  "SP-004": { code: "SP-004", name: "Busi Iridium", brand: "NGK", category: "Pengapian", stock: 30, price: "Rp 45.000", stockHistory: [], priceHistory: [] },
  "SP-005": { code: "SP-005", name: "Aki GS 45Ah", brand: "GS Battery", category: "Kelistrikan", stock: 3, price: "Rp 850.000", stockHistory: [], priceHistory: [] },
};

const typeColor: Record<string, string> = { Purchase: "#2e844a", Used: "#ea001e", "Stock Opname": "#f59e0b" };

export default function SparepartDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"details" | "stock" | "price">("details");
  const item = data[params.code as string];

  if (!item) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/master-data/sparepart")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" }}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <div style={{ background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 16, marginTop: 16 }}><p style={{ color: "#444746" }}>Data tidak ditemukan</p></div>
      </div>
    );
  }

  return (
    <div className="sm:px-6" style={{ padding: "0 12px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button onClick={() => router.push("/master-data/sparepart")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" }}>
          <ArrowLeft size={16} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>Sparepart Details</h1>
          <div style={{ fontSize: 13, color: "#0176d3", marginTop: 2 }}>{item.code} - {item.name}</div>
        </div>
        <button onClick={() => router.push(`/master-data/sparepart/${params.code}/edit`)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", fontSize: 12, fontWeight: 500, color: "#fff", background: "#0176d3", border: "1px solid #0176d3", borderRadius: 6, cursor: "pointer" }}>
          <Edit size={14} /> Edit
        </button>
      </div>

      <div style={{ overflowX: "auto", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 0, background: "#ecebea", borderRadius: 8, padding: 3, width: "fit-content" }}>
        {(["details", "stock", "price"] as const).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ padding: "7px 18px", fontSize: 13, border: "none", borderRadius: 6, cursor: "pointer", color: activeTab === t ? "#fff" : "#444746", background: activeTab === t ? "#0176d3" : "transparent", fontWeight: activeTab === t ? 600 : 400 }}>
            {t === "details" ? "Details" : t === "stock" ? "Stock History" : "Price History"}
          </button>
        ))}
      </div>
      </div>

      {activeTab === "details" && (
        <div style={{ background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 16 }}>
          <F label="KODE" value={item.code} />
          <F label="NAMA" value={item.name} />
          <F label="BRAND" value={item.brand} />
          <F label="KATEGORI" value={item.category} />
          <F label="STOCK" value={item.stock + " pcs"} />
          <F label="HARGA" value={item.price} />
        </div>
      )}

      {activeTab === "stock" && (
        <div style={{ border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
          {item.stockHistory.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>Date</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>Type</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>Reference</th>
                  <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>Qty Change</th>
                  <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>Stock After</th>
                </tr>
              </thead>
              <tbody>
                {item.stockHistory.map((h: any, i: number) => (
                  <tr key={i}>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0" }}>{h.date}</td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0" }}>
                      <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: typeColor[h.type] || "#6b7280", color: "#fff" }}>{h.type}</span>
                    </td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0", color: "#0176d3", fontWeight: 500 }}>{h.reference}</td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0", textAlign: "right", color: h.qtyChange > 0 ? "#2e844a" : "#ea001e", fontWeight: 600 }}>
                      {h.qtyChange > 0 ? "+" : ""}{h.qtyChange}
                    </td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0", textAlign: "right", fontWeight: 500 }}>{h.stockAfter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: 24, textAlign: "center", color: "#8e8f8e" }}>Belum ada history stock</div>
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
                  <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>Buy Price</th>
                  <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>Sell Price</th>
                </tr>
              </thead>
              <tbody>
                {item.priceHistory.map((h: any, i: number) => (
                  <tr key={i}>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0" }}>{h.date}</td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0", textAlign: "right", fontWeight: 500 }}>{h.buyPrice}</td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0", textAlign: "right", fontWeight: 500 }}>{h.sellPrice}</td>
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
