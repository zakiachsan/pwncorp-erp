"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Edit } from "lucide-react";

const typeColor: Record<string, string> = { in: "#2e844a", out: "#ea001e", adjust: "#f59e0b", Purchase: "#2e844a", Used: "#ea001e", "Stock Opname": "#f59e0b" };
const typeLabel: Record<string, string> = { in: "Purchase", out: "Used", adjust: "Stock Opname" };

const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");
const fmtDate = (d: string | Date | null | undefined) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
};

export default function SparepartDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"details" | "stock" | "price">("details");
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const code = params.code as string;
    if (!code) return;
    setLoading(true);
    fetch(`/api/spareparts?search=${encodeURIComponent(code)}&limit=1`)
      .then((r) => r.json())
      .then((j) => {
        const found = j.data?.[0];
        if (!found) { setError("Data tidak ditemukan"); setLoading(false); return; }
        // Fetch full detail with stock histories
        return fetch(`/api/spareparts/${found.id}`)
          .then((r) => r.json())
          .then((dj) => {
            setItem(dj.data || found);
            setLoading(false);
          });
      })
      .catch(() => { setError("Gagal memuat data"); setLoading(false); });
  }, [params.code]);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/master-data/sparepart")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" }}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <div style={{ background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 40, marginTop: 16, textAlign: "center", color: "#444746" }}>Memuat data...</div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/master-data/sparepart")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" }}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <div style={{ background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 16, marginTop: 16 }}><p style={{ color: "#444746" }}>{error || "Data tidak ditemukan"}</p></div>
      </div>
    );
  }

  const stockHistories: any[] = item.stockHistories || [];

  return (
    <div className="sm:px-6" style={{ padding: "0 12px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button onClick={() => router.push("/master-data/sparepart")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" }}>
          <ArrowLeft size={16} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>Sparepart Details</h1>
          <div style={{ fontSize: 13, color: "#0176d3", marginTop: 2 }}>{item.code || item.sku} - {item.name}</div>
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
          <F label="KODE" value={item.code || item.sku || "-"} />
          <F label="NAMA" value={item.name} />
          <F label="BRAND" value={item.brand || "-"} />
          <F label="KATEGORI" value={item.category || "-"} />
          <F label="STOCK" value={`${item.stockQty ?? 0} ${item.unit || "pcs"}`} />
          <F label="HARGA" value={fmt(item.sellPrice || 0)} />
        </div>
      )}

      {activeTab === "stock" && (
        <div style={{ border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
          {stockHistories.length > 0 ? (
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
                {stockHistories.map((h: any) => (
                  <tr key={h.id}>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0" }}>{fmtDate(h.date)}</td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0" }}>
                      <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: typeColor[h.changeType] || "#6b7280", color: "#fff" }}>{typeLabel[h.changeType] || h.changeType}</span>
                    </td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0", color: "#0176d3", fontWeight: 500 }}>{h.refDoc || "-"}</td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0", textAlign: "right", color: h.qtyChange > 0 ? "#2e844a" : "#ea001e", fontWeight: 600 }}>
                      {h.qtyChange > 0 ? "+" : ""}{h.qtyChange}
                    </td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0", textAlign: "right", fontWeight: 500 }}>{h.qtyAfter}</td>
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
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>Date</th>
                <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>Buy Price</th>
                <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>Sell Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0" }}>{fmtDate(item.createdAt)}</td>
                <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0", textAlign: "right", fontWeight: 500 }}>{fmt(item.buyPrice || 0)}</td>
                <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0", textAlign: "right", fontWeight: 500 }}>{fmt(item.sellPrice || 0)}</td>
              </tr>
            </tbody>
          </table>
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
