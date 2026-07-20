"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Printer, Edit, AlertTriangle } from "lucide-react";

const fmt = (n: number) => n.toLocaleString("id-ID");

const fmtDate = (d: string | Date | null | undefined) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
};

const changeTypeLabel: Record<string, string> = { in: "Purchase", out: "Used", adjust: "Stock Opname" };
const changeTypeColor: Record<string, string> = { in: "#2e844a", out: "#ea001e", adjust: "#f59e0b" };

export default function InventoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const [activeTab, setActiveTab] = useState<"product" | "stock" | "price">("product");
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!code) return;
    setLoading(true);
    fetch(`/api/spareparts?search=${encodeURIComponent(code)}&limit=1`)
      .then((r) => r.json())
      .then((j) => {
        const found = j.data?.[0];
        if (!found) { setError(`Data tidak ditemukan: ${code}`); setLoading(false); return; }
        // Fetch full detail with stock histories
        return fetch(`/api/spareparts/${found.id}`)
          .then((r) => r.json())
          .then((dj) => {
            setItem(dj.data || found);
            setLoading(false);
          });
      })
      .catch(() => { setError("Gagal memuat data"); setLoading(false); });
  }, [code]);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/inventory")} style={S.backBtn}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <div style={{ ...S.card, marginTop: 16, textAlign: "center", color: "#444746", padding: 40 }}>Memuat data...</div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/inventory")} style={S.backBtn}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>{error || `Data tidak ditemukan: ${code}`}</p></div>
      </div>
    );
  }

  const stockHistories: any[] = item.stockHistories || [];

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
              {item.code || item.sku} - {item.name}
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
            <F label="SKU" value={item.sku || item.code || "-"} />
            <F label="NAME" value={item.name} />
            <F label="DESCRIPTION" value={item.type || "-"} />
            <F label="BRAND" value={item.brand || "-"} />
            <F label="CATEGORY" value={item.category || "-"} />
            <F label="UNIT" value={item.unit || "pcs"} />

            <SectionTitle>Pricing</SectionTitle>
            <F label="BUY PRICE (Rp)" value={fmt(item.buyPrice || 0)} />
            <F label="SELL PRICE (Rp)" value={fmt(item.sellPrice || 0)} />
            <F label="MARGIN" value={item.buyPrice > 0 ? `${Math.round(((item.sellPrice - item.buyPrice) / item.buyPrice) * 100)}%` : "-"} />
          </div>

          {/* Right Column */}
          <div style={{ borderLeft: "1px solid #ecebea", paddingLeft: 32 }}>
            <SectionTitle>Stock Information</SectionTitle>
            <F label="CURRENT STOCK" value={`${item.stockQty ?? 0} ${item.unit || "pcs"}`} highlight={(item.stockQty ?? 0) <= (item.minStock ?? 0)} />
            <F label="MIN STOCK" value={`${item.minStock ?? 0} ${item.unit || "pcs"}`} />
            <F label="LOCATION" value={item.location || "-"} />
            <F label="SUPPLIER" value={item.supplier?.companyName || "-"} />

            {(item.stockQty ?? 0) <= (item.minStock ?? 0) && (
              <div style={{ ...S.alertBox, background: "#fef3cd", border: "1px solid #ffc107", color: "#856404" }}>
                <AlertTriangle size={14} /> Stok di bawah minimum!
              </div>
            )}

            <SectionTitle>Changes</SectionTitle>
            <F label="CREATED AT" value={fmtDate(item.createdAt)} />
            <F label="UPDATED AT" value={fmtDate(item.createdAt)} />
            <F label="UPDATED BY" value="-" />
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
                {stockHistories.length > 0 ? stockHistories.map((h: any) => (
                  <tr key={h.id} style={S.tr}>
                    <td style={S.td}>{fmtDate(h.date)}</td>
                    <td style={S.td}><span style={{ ...S.pill, background: changeTypeColor[h.changeType] || "#6b7280" }}>{changeTypeLabel[h.changeType] || h.changeType}</span></td>
                    <td style={{ ...S.td, color: "#0176d3" }}>{h.refDoc || "-"}</td>
                    <td style={{ ...S.td, textAlign: "right", color: h.qtyChange > 0 ? "#2e844a" : "#ea001e" }}>{h.qtyChange > 0 ? "+" : ""}{h.qtyChange}</td>
                    <td style={{ ...S.td, textAlign: "right" }}>{h.qtyAfter}</td>
                    <td style={S.td}>{h.user?.name || "-"}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} style={{ ...S.td, textAlign: "center", color: "#8e8f8e", padding: 24 }}>Belum ada history stock</td></tr>
                )}
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
                  <td style={S.td}>{fmtDate(item.createdAt)}</td>
                  <td style={{ ...S.td, textAlign: "right" }}>Rp {fmt(item.buyPrice || 0)}</td>
                  <td style={{ ...S.td, textAlign: "right" }}>Rp {fmt(item.sellPrice || 0)}</td>
                  <td style={S.td}>-</td>
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
