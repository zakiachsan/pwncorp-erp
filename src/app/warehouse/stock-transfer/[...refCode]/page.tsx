"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Printer, ChevronRight } from "lucide-react";

const workflowSteps = ["DRAFT", "CONFIRMED", "APPROVED", "SENT FROM WAREHOUSE", "RECEIVED IN DESTINATION"];
const fmt = (n: number) => (n || 0).toLocaleString("id-ID");

export default function StockTransferDetailPage() {
  const router = useRouter();
  const params = useParams();
  const refCodeArray = params.refCode as string[];
  const refCode = refCodeArray ? refCodeArray.join("/") : "";
  const [transfer, setTransfer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"details" | "journals">("details");

  useEffect(() => {
    fetch(`/api/stock-transfers?search=${encodeURIComponent(refCode)}&limit=1`)
      .then((r) => r.json())
      .then((json) => {
        const found = (json.data || [])[0];
        if (!found) { setError("Stock Transfer tidak ditemukan: " + refCode); setLoading(false); return; }
        setTransfer(found);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load data"); setLoading(false); });
  }, [refCode]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  if (!transfer) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/warehouse/stock-transfer")} style={S.backBtn}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>Stock Transfer tidak ditemukan: {refCode}</p></div>
      </div>
    );
  }

  const currentStepIdx = workflowSteps.indexOf(transfer.status);
  const items = transfer.items || [];
  const totalTransferred = items.reduce((s: number, x: any) => s + (x.transferredQty || x.qty || 0), 0);
  const totalReceived = items.reduce((s: number, x: any) => s + (x.receivedQty || 0), 0);
  const totalAmount = items.reduce((s: number, x: any) => s + (x.transferAmount || x.amount || 0), 0);

  return (
    <div style={{ padding: "0 24px 24px" }}>
      <button onClick={() => router.push("/warehouse/stock-transfer")} style={S.backBtn}>
        <ArrowLeft size={16} /> Warehouse Stock Transfer
      </button>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#001526", marginBottom: 12 }}>Warehouse Stock Transfer</div>

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
        <button onClick={() => setActiveTab("journals")} style={{ padding: "7px 18px", fontSize: 13, border: "none", borderRadius: 6, cursor: "pointer", whiteSpace: "nowrap", color: activeTab === "journals" ? "#fff" : "#444746", background: activeTab === "journals" ? "#0176d3" : "transparent", fontWeight: activeTab === "journals" ? 600 : 400 }}>Journals</button>
      </div>

      {activeTab === "details" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 20 }}>
            <div>
              <F label="REF CODE" value={transfer.transferNo || transfer.refCode || refCode} />
              <F label="TRANSFER DATE" value={transfer.date ? new Date(transfer.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-"} />
              <F label="FROM" value={transfer.fromWarehouse || "-"} link onClick={() => {}} />
              <F label="TO" value={transfer.toStore || "-"} link onClick={() => {}} />
              <F label="NOTES" value={transfer.notes || "-"} />
            </div>
            <div style={{ borderLeft: "1px solid #ecebea", paddingLeft: 32 }}>
              <F label="APPROVAL AT" value={transfer.approvalAt || "-"} />
              <F label="SENT AT" value={transfer.sentAt || "-"} />
              <F label="RECEIVED DATE" value={transfer.receivedDate || "-"} />
              <F label="UPDATED AT" value={transfer.updatedAt || "-"} />
              <F label="CREATED BY" value={transfer.createdBy || "-"} />
              <F label="UPDATED BY" value={transfer.updatedBy || "-"} />
            </div>
          </div>

          <div style={{ fontSize: 13, fontWeight: 600, color: "#0176d3", marginBottom: 8 }}>Transfer Items</div>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: 40 }}>No</th>
                  <th style={S.th}>SKU</th>
                  <th style={S.th}>Product</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Transferred Qty</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Received Qty</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Average Cost (Rp)</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Transfer Amount (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any, idx: number) => (
                  <tr key={item.id || idx} style={S.tr}>
                    <td style={S.td}>{item.no || idx + 1}</td>
                    <td style={{ ...S.td, color: "#0176d3", fontWeight: 500, cursor: "pointer" }} onClick={() => router.push(`/products/${item.sku}`)}>{item.sku || "-"}</td>
                    <td style={{ ...S.td, color: "#0176d3", fontWeight: 500, cursor: "pointer" }} onClick={() => router.push(`/products/${item.sku}`)}>{item.product?.name || item.product || "-"}</td>
                    <td style={{ ...S.td, textAlign: "right" }}>{item.transferredQty || item.qty || 0}</td>
                    <td style={{ ...S.td, textAlign: "right" }}>{item.receivedQty || 0}</td>
                    <td style={{ ...S.td, textAlign: "right" }}>Rp {fmt(item.avgCost || 0)}</td>
                    <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>Rp {fmt(item.transferAmount || item.amount || 0)}</td>
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan={7} style={{ ...S.td, textAlign: "center", color: "#8e8f8e" }}>No items</td></tr>}
              </tbody>
              <tfoot>
                <tr style={{ background: "#f9f9f9" }}>
                  <td style={{ ...S.td, fontWeight: 700, borderTop: "2px solid #ecebea" }}>TOTAL</td>
                  <td style={{ ...S.td, borderTop: "2px solid #ecebea" }}></td>
                  <td style={{ ...S.td, borderTop: "2px solid #ecebea" }}></td>
                  <td style={{ ...S.td, textAlign: "right", fontWeight: 700, borderTop: "2px solid #ecebea" }}>{totalTransferred}</td>
                  <td style={{ ...S.td, textAlign: "right", fontWeight: 700, borderTop: "2px solid #ecebea" }}>{totalReceived}</td>
                  <td style={{ ...S.td, borderTop: "2px solid #ecebea" }}></td>
                  <td style={{ ...S.td, textAlign: "right", fontWeight: 700, borderTop: "2px solid #ecebea" }}>Rp {fmt(totalAmount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {activeTab === "journals" && (
        <div>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: 40 }}>No</th>
                  <th style={S.th}>Journal ID</th>
                  <th style={S.th}>Ref. Code</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Amount</th>
                  <th style={S.th}>Created By</th>
                </tr>
              </thead>
              <tbody>
                {transfer.journals && transfer.journals.length > 0 ? (
                  transfer.journals.map((j: any) => (
                    <tr key={j.no} style={S.tr}>
                      <td style={S.td}>{j.no}</td>
                      <td style={{ ...S.td, color: "#0176d3", fontWeight: 500, cursor: "pointer" }}>{j.journalId}</td>
                      <td style={S.td}>{j.refCode}</td>
                      <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>Rp {fmt(j.amount)}</td>
                      <td style={S.td}>{j.createdBy}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} style={{ ...S.td, textAlign: "center", color: "#8e8f8e" }}>No journals recorded.</td></tr>
                )}
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
