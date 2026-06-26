"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Printer, Edit, AlertTriangle } from "lucide-react";

const inventoryData: Record<string, any> = {
  "SP-001": {
    code: "SP-001",
    name: "Oli Mesin 10W-40",
    brand: "Shell",
    category: "Oli",
    unit: "Ltr",
    buyPrice: 75000,
    sellPrice: 85000,
    minStock: 10,
    location: "Rak A-01",
    description: "Oli mesin untuk kendaraan bensin dan diesel",
    stock: 45,
    lastPurchase: "25 Jun 2026",
    lastUsed: "26 Jun 2026",
    createdAt: "15 Jan 2026",
    updatedAt: "26 Jun 2026",
    updatedBy: "Admin",
  },
  "SP-002": {
    code: "SP-002",
    name: "Filter Oli",
    brand: "Toyota Genuine",
    category: "Filter",
    unit: "Pcs",
    buyPrice: 50000,
    sellPrice: 65000,
    minStock: 5,
    location: "Rak A-02",
    description: "Filter oli original Toyota",
    stock: 22,
    lastPurchase: "24 Jun 2026",
    lastUsed: "25 Jun 2026",
    createdAt: "15 Jan 2026",
    updatedAt: "25 Jun 2026",
    updatedBy: "Admin",
  },
  "SP-003": {
    code: "SP-003",
    name: "Kampas Rem Depan",
    brand: "Bendix",
    category: "Rem",
    unit: "Set",
    buyPrice: 180000,
    sellPrice: 250000,
    minStock: 10,
    location: "Rak B-01",
    description: "Kampas rem depan untuk mobil",
    stock: 8,
    lastPurchase: "22 Jun 2026",
    lastUsed: "24 Jun 2026",
    createdAt: "15 Jan 2026",
    updatedAt: "24 Jun 2026",
    updatedBy: "Admin",
  },
};

const fmt = (n: number) => n.toLocaleString("id-ID");

export default function InventoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const [activeTab, setActiveTab] = useState<"product" | "stock" | "price">("product");

  const item = inventoryData[code];

  if (!item) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/inventory")} style={S.backBtn}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>Data tidak ditemukan: {code}</p></div>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 24px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => router.push("/inventory")} style={S.backBtn}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>Product Details</h1>
            <div style={{ fontSize: 13, color: "#0176d3", marginTop: 2 }}>
              {item.code} - {item.name}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={S.actionBtn}><Printer size={14} /> Print</button>
          <button
            onClick={() => router.push(`/inventory/${code}/edit`)}
            style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}
          >
            <Edit size={14} /> Edit
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={S.tabBar}>
        {(["product", "stock", "price"] as const).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            ...S.tab,
            color: activeTab === t ? "#fff" : "#444746",
            background: activeTab === t ? "#0176d3" : "#ecebea",
            fontWeight: activeTab === t ? 600 : 400,
          }}>
            {t === "product" ? "Product" : t === "stock" ? "Stock" : "Price"}
          </button>
        ))}
      </div>

      {/* Product Tab */}
      {activeTab === "product" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          {/* Left Column */}
          <div>
            <SectionTitle>Details</SectionTitle>
            <F label="SKU" value={item.code} />
            <F label="NAME" value={item.name} />
            <F label="DESCRIPTION" value={item.description || "-"} />
            <F label="BRAND" value={item.brand} />
            <F label="CATEGORY" value={item.category} />
            <F label="UNIT" value={item.unit} />

            <SectionTitle>Pricing</SectionTitle>
            <F label="BUY PRICE (Rp)" value={fmt(item.buyPrice)} />
            <F label="SELL PRICE (Rp)" value={fmt(item.sellPrice)} />
            <F label="MARGIN" value={`${Math.round(((item.sellPrice - item.buyPrice) / item.buyPrice) * 100)}%`} />
          </div>

          {/* Right Column */}
          <div style={{ borderLeft: "1px solid #ecebea", paddingLeft: 32 }}>
            <SectionTitle>Stock Information</SectionTitle>
            <F label="CURRENT STOCK" value={`${item.stock} ${item.unit}`} highlight={item.stock <= item.minStock} />
            <F label="MIN STOCK" value={`${item.minStock} ${item.unit}`} />
            <F label="LOCATION" value={item.location} />

            {item.stock <= item.minStock && (
              <div style={{ ...S.alertBox, background: "#fef3cd", border: "1px solid #ffc107", color: "#856404" }}>
                <AlertTriangle size={14} /> Stok di bawah minimum!
              </div>
            )}

            <SectionTitle>Changes</SectionTitle>
            <F label="CREATED AT" value={item.createdAt} />
            <F label="UPDATED AT" value={item.updatedAt} />
            <F label="UPDATED BY" value={item.updatedBy} />
          </div>
        </div>
      )}

      {/* Stock Tab */}
      {activeTab === "stock" && (
        <div>
          <SectionTitle>Stock History</SectionTitle>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Date</th>
                  <th style={S.th}>Type</th>
                  <th style={S.th}>Reference</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Qty Change</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Stock After</th>
                  <th style={S.th}>User</th>
                </tr>
              </thead>
              <tbody>
                <tr style={S.tr}>
                  <td style={S.td}>26 Jun 2026</td>
                  <td style={S.td}><span style={{ ...S.pill, background: "#ea001e" }}>Used</span></td>
                  <td style={{ ...S.td, color: "#0176d3" }}>WO-001</td>
                  <td style={{ ...S.td, textAlign: "right", color: "#ea001e" }}>-4</td>
                  <td style={{ ...S.td, textAlign: "right" }}>45</td>
                  <td style={S.td}>Hendra</td>
                </tr>
                <tr style={S.tr}>
                  <td style={S.td}>25 Jun 2026</td>
                  <td style={S.td}><span style={{ ...S.pill, background: "#2e844a" }}>Purchase</span></td>
                  <td style={{ ...S.td, color: "#0176d3" }}>PO-001</td>
                  <td style={{ ...S.td, textAlign: "right", color: "#2e844a" }}>+20</td>
                  <td style={{ ...S.td, textAlign: "right" }}>49</td>
                  <td style={S.td}>Admin</td>
                </tr>
                <tr style={S.tr}>
                  <td style={S.td}>24 Jun 2026</td>
                  <td style={S.td}><span style={{ ...S.pill, background: "#ea001e" }}>Used</span></td>
                  <td style={{ ...S.td, color: "#0176d3" }}>WO-003</td>
                  <td style={{ ...S.td, textAlign: "right", color: "#ea001e" }}>-2</td>
                  <td style={{ ...S.td, textAlign: "right" }}>29</td>
                  <td style={S.td}>Agus</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Price Tab */}
      {activeTab === "price" && (
        <div>
          <SectionTitle>Price History</SectionTitle>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Date</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Buy Price</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Sell Price</th>
                  <th style={S.th}>Updated By</th>
                </tr>
              </thead>
              <tbody>
                <tr style={S.tr}>
                  <td style={S.td}>26 Jun 2026</td>
                  <td style={{ ...S.td, textAlign: "right" }}>Rp 75.000</td>
                  <td style={{ ...S.td, textAlign: "right" }}>Rp 85.000</td>
                  <td style={S.td}>Admin</td>
                </tr>
                <tr style={S.tr}>
                  <td style={S.td}>15 Jan 2026</td>
                  <td style={{ ...S.td, textAlign: "right" }}>Rp 70.000</td>
                  <td style={{ ...S.td, textAlign: "right" }}>Rp 80.000</td>
                  <td style={S.td}>Admin</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 12, fontWeight: 700, color: "#444746", textTransform: "uppercase" as const,
      letterSpacing: "0.05em", padding: "6px 10px", background: "#f3f4f6",
      borderRadius: "6px 6px 0 0", marginTop: 16, marginBottom: 0,
    }}>
      {children}
    </div>
  );
}

function F({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", borderBottom: "1px solid #f0f0f0" }}>
      <span style={{ fontSize: 12, color: "#444746" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 500, color: highlight ? "#ea001e" : "#001526" }}>{value}</span>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  backBtn: {
    display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px",
    fontSize: 13, fontWeight: 500, color: "#444746", background: "#fff",
    border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer",
  },
  card: {
    background: "#fff", border: "1px solid #ecebea", borderRadius: 8,
    padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  actionBtn: {
    display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px",
    fontSize: 12, fontWeight: 500, color: "#001526", background: "#fff",
    border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer",
  },
  tabBar: {
    display: "flex", gap: 0, marginBottom: 16, background: "#ecebea",
    borderRadius: 8, padding: 3, width: "fit-content",
  },
  tab: {
    padding: "7px 18px", fontSize: 13, border: "none", borderRadius: 6,
    cursor: "pointer", transition: "all 150ms", whiteSpace: "nowrap" as const,
  },
  alertBox: {
    display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
    borderRadius: 6, fontSize: 12, fontWeight: 500, marginTop: 8,
  },
  tableWrap: {
    border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden",
    background: "#fff", marginTop: 8,
  },
  table: {
    width: "100%", borderCollapse: "collapse" as const, fontSize: 13,
  },
  th: {
    padding: "8px 10px", textAlign: "left" as const, fontWeight: 600,
    fontSize: 11, color: "#444746", textTransform: "uppercase" as const,
    letterSpacing: "0.04em", background: "#fff", borderBottom: "1px solid #ecebea",
  },
  td: {
    padding: "8px 10px", borderBottom: "1px solid #f0f0f0", color: "#001526",
    background: "#fff",
  },
  tr: { transition: "background 100ms" },
  pill: {
    display: "inline-block", padding: "2px 8px", borderRadius: 9999,
    fontSize: 10, fontWeight: 600, color: "#fff",
  },
};
