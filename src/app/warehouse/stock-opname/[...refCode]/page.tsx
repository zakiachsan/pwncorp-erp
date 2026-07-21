"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Printer, ChevronRight, Search } from "lucide-react";

const workflowSteps = ["DRAFT", "COMPLETED", "APPROVED"];
const fmt = (n: number) => (n || 0).toLocaleString("id-ID");

export default function StockOpnameDetailPage() {
  const router = useRouter();
  const params = useParams();
  const refCodeArray = params.refCode as string[];
  const refCode = refCodeArray ? refCodeArray.join("/") : "";
  const [opname, setOpname] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"details" | "products">("details");

  useEffect(() => {
    fetch(`/api/stock-opnames?search=${encodeURIComponent(refCode)}&limit=1`)
      .then((r) => r.json())
      .then((json) => {
        const found = (json.data || [])[0];
        if (!found) { setError("Stock Opname tidak ditemukan: " + refCode); setLoading(false); return; }
        setOpname(found);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load data"); setLoading(false); });
  }, [refCode]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  if (!opname) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/warehouse/stock-opname")} style={S.backBtn}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>Stock Opname tidak ditemukan: {refCode}</p></div>
      </div>
    );
  }

  const currentStepIdx = workflowSteps.indexOf(opname.status);
  const products = opname.products || opname.items || [];

  return (
    <div style={{ padding: "0 24px 24px" }}>
      <button onClick={() => router.push("/warehouse/stock-opname")} style={S.backBtn}>
        <ArrowLeft size={16} /> Warehouse Stock Opname
      </button>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#001526", marginBottom: 12 }}>Warehouse Stock Opname</div>

      <div style={S.workflowBar}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#444746" }}>Workflow</span>
          <div style={{ display: "flex", gap: 6 }}>
            {workflowSteps.map((step, i) => (
              <span key={step} style={{ ...S.badge, background: i === currentStepIdx ? "#001526" : "transparent", color: i === currentStepIdx ? "#fff" : "#8e8f8e", border: `1px solid ${i === currentStepIdx ? "#001526" : "#d8d8d8"}` }}>{step}</span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}><button style={S.actionBtn}><Printer size={14} /> Print</button></div>
      </div>

      <div style={{ display: "flex", gap: 0, marginBottom: 16, background: "#ecebea", borderRadius: 8, padding: 3, width: "fit-content" }}>
        <button onClick={() => setActiveTab("details")} style={{ padding: "7px 18px", fontSize: 13, border: "none", borderRadius: 6, cursor: "pointer", whiteSpace: "nowrap", color: activeTab === "details" ? "#fff" : "#444746", background: activeTab === "details" ? "#0176d3" : "transparent", fontWeight: activeTab === "details" ? 600 : 400 }}>Details</button>
        <button onClick={() => setActiveTab("products")} style={{ padding: "7px 18px", fontSize: 13, border: "none", borderRadius: 6, cursor: "pointer", whiteSpace: "nowrap", color: activeTab === "products" ? "#fff" : "#444746", background: activeTab === "products" ? "#0176d3" : "transparent", fontWeight: activeTab === "products" ? 600 : 400 }}>Products</button>
      </div>

      {activeTab === "details" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 20 }}>
          <div>
            <F label="REF CODE" value={opname.refCode || refCode} />
            <F label="DATE" value={opname.date ? new Date(opname.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-"} />
            <F label="COMPLETED DATE" value={opname.completedDate || "-"} />
            <F label="APPROVED DATE" value={opname.approvedDate || "-"} />
            <F label="WAREHOUSE" value={opname.warehouse || "-"} link onClick={() => {}} />
            <F label="NOTES" value={opname.notes || "-"} />
          </div>
          <div style={{ borderLeft: "1px solid #ecebea", paddingLeft: 32 }}>
            <F label="CREATED BY" value={opname.createdBy || "-"} />
            <F label="UPDATED BY" value={opname.updatedBy || "-"} />
            <F label="UPDATED AT" value={opname.updatedAt || "-"} />
            <F label="JOURNAL" value={opname.journal || "-"} link onClick={() => {}} />
          </div>
        </div>
      )}

      {activeTab === "products" && (
        <div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 12 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <input type="text" className="form-input" placeholder="SKU..." style={{ width: 160 }} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <input type="text" className="form-input" placeholder="Product Name..." style={{ width: 200 }} />
            </div>
            <button className="btn btn--brand btn--sm"><Search size={14} /> Cari</button>
          </div>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: 36 }}>No</th>
                  <th style={S.th}>SKU</th>
                  <th style={S.th}>Product</th>
                  <th style={S.th}>Product Code</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Unit Price</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Inventory</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Reserved</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Available</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Counted</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Difference</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Approved</th>
                  <th style={S.th}>Expense Account</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p: any, idx: number) => (
                  <tr key={p.id || idx} style={S.tr}>
                    <td style={S.td}>{p.no || idx + 1}</td>
                    <td style={{ ...S.td, color: "#0176d3", fontWeight: 500, cursor: "pointer" }} onClick={() => router.push(`/products/${p.sku}`)}>{p.sku || "-"}</td>
                    <td style={S.td}>{p.product?.name || p.product || "-"}</td>
                    <td style={S.td}>{p.productCode || "-"}</td>
                    <td style={{ ...S.td, textAlign: "right" }}>{fmt(p.unitPrice || 0)}</td>
                    <td style={{ ...S.td, textAlign: "right" }}>{p.inventoryStock ?? "-"}</td>
                    <td style={{ ...S.td, textAlign: "right" }}>{p.reservedStock ?? "-"}</td>
                    <td style={{ ...S.td, textAlign: "right" }}>{p.availableStock ?? "-"}</td>
                    <td style={{ ...S.td, textAlign: "right" }}>{p.countedStock ?? "-"}</td>
                    <td style={{ ...S.td, textAlign: "right", color: (p.difference || 0) < 0 ? "var(--color-error)" : "var(--color-success)" }}>{p.difference ?? "-"}</td>
                    <td style={{ ...S.td, textAlign: "right" }}>{p.approved ?? "-"}</td>
                    <td style={S.td}>{p.expenseAccount || "-"}</td>
                  </tr>
                ))}
                {products.length === 0 && <tr><td colSpan={12} style={{ ...S.td, textAlign: "center", color: "#8e8f8e" }}>No products</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function F({ label, value, link = false, onClick }: { label: string; value: string; link?: boolean; onClick?: () => void }) {
  return (
    <div style={{ marginBottom: 10, cursor: link ? "pointer" : "default" }} onClick={onClick}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: link ? "#0176d3" : "#001526", display: "flex", alignItems: "center", gap: 4 }}>{value}{link && <ChevronRight size={13} style={{ color: "#0176d3" }} />}</div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  backBtn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, fontWeight: 500, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer", marginBottom: 16 },
  card: { background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  workflowBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px", background: "#f9f9f9", border: "1px solid #ecebea", borderRadius: 8, marginBottom: 16 },
  badge: { display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.03em" as const },
  actionBtn: { display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", fontSize: 12, fontWeight: 500, color: "#001526", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" },
  tableWrap: { border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden", background: "#fff" },
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: 13 },
  th: { padding: "8px 10px", textAlign: "left" as const, fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", background: "#fff", borderBottom: "1px solid #ecebea" },
  td: { padding: "8px 10px", borderBottom: "1px solid #f0f0f0", color: "#001526", background: "#fff" },
  tr: { transition: "background 100ms" },
};
