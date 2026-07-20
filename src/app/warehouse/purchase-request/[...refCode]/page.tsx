"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Printer, Star } from "lucide-react";
import { useState, useEffect } from "react";

const workflowSteps = ["DRAFT", "CONFIRMED", "PENDING APPROVAL", "APPROVED", "ORDERED"];

const fmt = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

export default function PurchaseRequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const refCodeArray = params.refCode as string[];
  const refCode = refCodeArray ? refCodeArray.join("/") : "";
  const [pr, setPr] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    fetch(`/api/purchase-requests?search=${encodeURIComponent(refCode)}&limit=1`)
      .then((r) => r.json())
      .then((json) => {
        const found = (json.data || [])[0];
        if (!found) { setError("Purchase Request tidak ditemukan: " + refCode); setLoading(false); return; }
        setPr(found);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load data"); setLoading(false); });
  }, [refCode]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  if (!pr) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/warehouse/purchase-request")} style={S.backBtn}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <div style={S.card}>
          <p style={{ color: "#444746", fontSize: 14 }}>Data tidak ditemukan: {refCode}</p>
        </div>
      </div>
    );
  }

  const currentStepIdx = workflowSteps.indexOf(pr.status);
  const items = pr.items || [];
  const subTotal = items.reduce((s: number, x: any) => s + (x.amount || 0), 0);
  const tax = Math.round(subTotal * 0.1);
  const total = subTotal + tax;

  return (
    <div style={{ padding: "0 24px 24px" }}>
      <button onClick={() => router.push("/warehouse/purchase-request")} style={S.backBtn}>
        <ArrowLeft size={16} /> Purchase Request
      </button>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: "#001526" }}>
          Purchase Request (Standard)
        </div>
        <Star size={16} style={{ color: "#f59e0b" }} />
      </div>

      {/* Workflow Bar */}
      <div style={S.workflowBar}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#444746" }}>Workflow</span>
          <div style={{ display: "flex", gap: 6 }}>
            {workflowSteps.map((step, i) => (
              <span
                key={step}
                style={{
                  ...S.badge,
                  background: i <= currentStepIdx ? "#2563eb" : "transparent",
                  color: i <= currentStepIdx ? "#fff" : "#8e8f8e",
                  border: `1px solid ${i <= currentStepIdx ? "#2563eb" : "#d8d8d8"}`,
                }}
              >
                {step}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={S.actionBtn}>
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={S.tabBar}>
        {["details", "purchase-orders", "document-approvals"].map((tab) => (
          <button
            key={tab}
            style={activeTab === tab ? S.tabActive : S.tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "details"
              ? "Details"
              : tab === "purchase-orders"
              ? "Purchase Orders"
              : "Document Approvals"}
          </button>
        ))}
      </div>

      {activeTab === "details" && (
        <>
          {/* Two-column layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 20 }}>
            <div style={S.card}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#0176d3", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>
                Informasi Purchase Request
              </div>
              <F label="REF CODE" value={pr.prNo || pr.refCode || refCode || "-"} />
              <F label="SUPPLIER" value={pr.supplier?.companyName || pr.supplier?.name || pr.supplier || "-"} link />
              <F label="DELIVER TO" value={pr.deliverTo?.name || pr.deliverTo || "-"} />
              <F label="WAREHOUSE" value={pr.warehouse?.name || pr.warehouse || "-"} link />
              <F label="SUPPLIER REF CODE" value={pr.supplierRefCode || "-"} />
              <F label="NOTES" value={pr.notes || "-"} />
            </div>
            <div style={S.card}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#0176d3", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>
                Audit Trail
              </div>
              <F label="CREATED BY" value={pr.createdBy || "-"} />
              <F label="UPDATED BY" value={pr.updatedBy || "-"} />
              <F label="APPROVED BY" value={pr.approvedBy || "-"} />
              <F label="DUE DATE" value={pr.dueDate || pr.date ? new Date(pr.dueDate || pr.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-"} />
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>
                  CLOSED
                </div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>
                  {pr.closed ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#ea001e" }}>
                      ✕ Closed
                    </span>
                  ) : (
                    <span style={{ color: "#8e8f8e" }}>No</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Request Items Table */}
          <div style={S.card}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#0176d3", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>
              Request Items
            </div>
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={{ ...S.th, width: 40 }}>No</th>
                    <th style={S.th}>SKU</th>
                    <th style={S.th}>Product</th>
                    <th style={S.th}>Product Code</th>
                    <th style={{ ...S.th, textAlign: "right" }}>Request Qty</th>
                    <th style={{ ...S.th, textAlign: "right" }}>Ordered Qty</th>
                    <th style={{ ...S.th, textAlign: "right" }}>Price (IDR)</th>
                    <th style={{ ...S.th, textAlign: "right" }}>Discount (%)</th>
                    <th style={{ ...S.th, textAlign: "right" }}>Amount (IDR)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: any, idx: number) => (
                    <tr key={item.id || idx} style={S.tr}>
                      <td style={S.td}>{item.no || idx + 1}</td>
                      <td style={{ ...S.td, color: "#0176d3", fontWeight: 500 }}>{item.sku || "-"}</td>
                      <td style={S.td}>{item.product?.name || item.product || "-"}</td>
                      <td style={S.td}>{item.productCode || "-"}</td>
                      <td style={{ ...S.td, textAlign: "right" }}>{item.requestQty || item.quantity || 0}</td>
                      <td style={{ ...S.td, textAlign: "right", color: (item.orderedQty || 0) === 0 ? "#ea001e" : "#001526", fontWeight: (item.orderedQty || 0) === 0 ? 600 : 400 }}>
                        {item.orderedQty || 0}
                      </td>
                      <td style={{ ...S.td, textAlign: "right" }}>{fmt(item.price || 0)}</td>
                      <td style={{ ...S.td, textAlign: "right" }}>{item.discount || 0}%</td>
                      <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmt(item.amount || 0)}</td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr><td colSpan={9} style={{ ...S.td, textAlign: "center", color: "#8e8f8e" }}>No items</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <div style={{ width: 300 }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                  <span style={{ fontSize: 13, color: "#444746" }}>SubTotal</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{fmt(subTotal)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                  <span style={{ fontSize: 13, color: "#444746" }}>Tax (10%)</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{fmt(tax)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", fontWeight: 700, fontSize: 15 }}>
                  <span>Total</span>
                  <span>{fmt(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "purchase-orders" && (
        <div style={S.card}>
          <div style={{ padding: 24, textAlign: "center", color: "#8e8f8e", fontSize: 13 }}>
            Belum ada Purchase Order terkait
          </div>
        </div>
      )}

      {activeTab === "document-approvals" && (
        <div style={S.card}>
          <div style={{ padding: 24, textAlign: "center", color: "#8e8f8e", fontSize: 13 }}>
            Belum ada Document Approval
          </div>
        </div>
      )}
    </div>
  );
}

function F({ label, value, link }: { label: string; value: string; link?: boolean }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 500, color: link ? "#0176d3" : "#001526" }}>
        {value}
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  backBtn: {
    display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px",
    fontSize: 13, fontWeight: 500, color: "#444746", background: "#fff",
    border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer", marginBottom: 16,
  },
  card: {
    background: "#fff", border: "1px solid #ecebea", borderRadius: 8,
    padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  workflowBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "8px 14px", background: "#f9f9f9", border: "1px solid #ecebea",
    borderRadius: 8, marginBottom: 16,
  },
  badge: {
    display: "inline-flex", alignItems: "center", padding: "3px 10px",
    borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.03em",
  },
  tabBar: {
    display: "flex", gap: 0, borderBottom: "2px solid #ecebea", marginBottom: 20,
  },
  tab: {
    padding: "10px 20px", fontSize: 13, fontWeight: 500, color: "#8e8f8e",
    background: "transparent", border: "none", cursor: "pointer",
    borderBottom: "2px solid transparent", marginBottom: -2,
  },
  tabActive: {
    padding: "10px 20px", fontSize: 13, fontWeight: 600, color: "#0176d3",
    background: "transparent", border: "none", cursor: "pointer",
    borderBottom: "2px solid #0176d3", marginBottom: -2,
  },
  actionBtn: {
    display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px",
    fontSize: 12, fontWeight: 500, color: "#001526", background: "#fff",
    border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer",
  },
  tableWrap: {
    border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden", background: "#fff",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: 11,
    color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em",
    background: "#f9f9f9", borderBottom: "1px solid #ecebea",
  },
  td: {
    padding: "10px 12px", borderBottom: "1px solid #f0f0f0", color: "#001526", background: "#fff",
  },
  tr: { transition: "background 100ms" },
};
