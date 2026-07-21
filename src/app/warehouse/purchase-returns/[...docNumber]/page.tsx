"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Printer, ChevronRight } from "lucide-react";

const fmtDate = (d: string) => {
  const dt = new Date(d);
  return dt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const fmt = (n: number) => (n || 0).toLocaleString("id-ID");

const workflowSteps = ["DRAFT", "APPROVED", "SENT"];

export default function PurchaseReturnDetailPage() {
  const router = useRouter();
  const params = useParams();
  const docNumberArray = params.docNumber as string[];
  const docNumber = docNumberArray ? docNumberArray.join("/") : "";
  const [ret, setRet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"details" | "fixedAssets">("details");

  useEffect(() => {
    fetch(`/api/purchase-returns?search=${encodeURIComponent(docNumber)}`)
      .then((r) => r.json())
      .then((j) => {
        const list = j.data || [];
        if (list.length > 0) {
          const item = list[0];
          setRet({
            docNumber: item.docNo,
            referenceNumber: item.po?.poNo || "-",
            purchaseInvoice: item.po?.poNo || "-",
            supplier: { name: item.supplier?.companyName || "-", address: item.supplier?.address || "-" },
            deliverTo: { name: "-", address: "-" },
            warehouse: item.po?.warehouse || "-",
            notes: item.reason || "-",
            createdBy: "-",
            updatedBy: "-",
            createdAt: fmtDate(item.createdAt),
            updatedAt: fmtDate(item.createdAt),
            approvedDate: "-",
            sentDate: "-",
            journal: "-",
            status: item.status,
            items: (item.po?.items || []).map((poi: any, i: number) => ({
              no: i + 1,
              sku: poi.sparepart?.sku || "-",
              product: poi.sparepart?.name || "-",
              productCode: poi.sparepart?.code || "-",
              qty: poi.qty,
              price: poi.unitPrice,
              discount: 0,
              amount: poi.total,
            })),
          });
        }
        setLoading(false);
      })
      .catch(() => { setError("Failed to load purchase return"); setLoading(false); });
  }, [docNumber]);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/warehouse/purchase-returns")} style={S.backBtn}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>Loading...</p></div>
      </div>
    );
  }
  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/warehouse/purchase-returns")} style={S.backBtn}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <div style={S.card}><p style={{ color: "red", fontSize: 14 }}>{error}</p></div>
      </div>
    );
  }

  if (!ret) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/warehouse/purchase-returns")} style={S.backBtn}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>Purchase Return tidak ditemukan: {docNumber}</p></div>
      </div>
    );
  }

  const currentStepIdx = workflowSteps.indexOf(ret.status);
  const totalAmount = ret.items.reduce((s: number, x: any) => s + x.amount, 0);

  return (
    <div style={{ padding: "0 24px 24px" }}>
      <button onClick={() => router.push("/warehouse/purchase-returns")} style={S.backBtn}>
        <ArrowLeft size={16} /> Purchase Returns
      </button>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#001526", marginBottom: 12 }}>
        Purchase Return (Standard)
      </div>
      <div style={S.workflowBar}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#444746" }}>Workflow</span>
          <div style={{ display: "flex", gap: 6 }}>
            {workflowSteps.map((step, i) => (
              <span key={step} style={{
                ...S.badge,
                background: i <= currentStepIdx ? "#2e844a" : "transparent",
                color: i <= currentStepIdx ? "#fff" : "#8e8f8e",
                border: `1px solid ${i <= currentStepIdx ? "#2e844a" : "#d8d8d8"}`,
              }}>{step}</span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}><button style={S.actionBtn}><Printer size={14} /> Print</button></div>
      </div>
      <div style={{ display: "flex", gap: 0, marginBottom: 16, background: "#ecebea", borderRadius: 8, padding: 3, width: "fit-content" }}>
        <button onClick={() => setActiveTab("details")} style={{ padding: "7px 18px", fontSize: 13, border: "none", borderRadius: 6, cursor: "pointer", whiteSpace: "nowrap", color: activeTab === "details" ? "#fff" : "#444746", background: activeTab === "details" ? "#0176d3" : "transparent", fontWeight: activeTab === "details" ? 600 : 400 }}>Details</button>
        <button onClick={() => setActiveTab("fixedAssets")} style={{ padding: "7px 18px", fontSize: 13, border: "none", borderRadius: 6, cursor: "pointer", whiteSpace: "nowrap", color: activeTab === "fixedAssets" ? "#fff" : "#444746", background: activeTab === "fixedAssets" ? "#0176d3" : "transparent", fontWeight: activeTab === "fixedAssets" ? 600 : 400 }}>Fixed Assets</button>
      </div>
      {activeTab === "details" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 20 }}>
            <div>
              <F label="DOCUMENT NUMBER" value={ret.docNumber} />
              <F label="REFERENCE NUMBER" value={ret.referenceNumber} />
              <F label="PURCHASE INVOICE" value={ret.purchaseInvoice} link onClick={() => {}} />
              <F label="SUPPLIER" value={ret.supplier.name} link onClick={() => {}} />
              <div style={{ fontSize: 12, color: "#444746", marginBottom: 10, marginLeft: 0, paddingLeft: 0, marginTop: -4 }}>{ret.supplier.address}</div>
              <F label="DELIVER TO" value={ret.deliverTo.name} link onClick={() => {}} />
              <div style={{ fontSize: 12, color: "#444746", marginBottom: 10, marginTop: -4 }}>{ret.deliverTo.address}</div>
              <F label="WAREHOUSE" value={ret.warehouse} link onClick={() => {}} />
              <F label="NOTES" value={ret.notes} />
            </div>
            <div style={{ borderLeft: "1px solid #ecebea", paddingLeft: 32 }}>
              <F label="CREATED BY" value={ret.createdBy} />
              <F label="UPDATED BY" value={ret.updatedBy} />
              <F label="CREATED AT" value={ret.createdAt} />
              <F label="UPDATED AT" value={ret.updatedAt} />
              <F label="APPROVED DATE" value={ret.approvedDate} />
              <F label="SENT DATE" value={ret.sentDate} />
              <F label="JOURNAL" value={ret.journal} link onClick={() => {}} />
            </div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0176d3", marginBottom: 8 }}>Return Items</div>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: 40 }}>No</th>
                  <th style={S.th}>SKU</th>
                  <th style={S.th}>Product</th>
                  <th style={S.th}>Product Code</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Quantity</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Price (IDR)</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Discount (%)</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Amount (IDR)</th>
                </tr>
              </thead>
              <tbody>
                {ret.items.map((item: any) => (
                  <tr key={item.no} style={S.tr}>
                    <td style={S.td}>{item.no}</td>
                    <td style={{ ...S.td, color: "#0176d3", fontWeight: 500, cursor: "pointer" }}>{item.sku}</td>
                    <td style={S.td}>{item.product}</td>
                    <td style={S.td}>{item.productCode}</td>
                    <td style={{ ...S.td, textAlign: "right" }}>{item.qty}</td>
                    <td style={{ ...S.td, textAlign: "right" }}>{fmt(item.price)}</td>
                    <td style={{ ...S.td, textAlign: "right" }}>{item.discount}%</td>
                    <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmt(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
            <div style={{ width: 320 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 12px", fontSize: 13 }}>
                <span style={{ color: "#444746" }}>All Pages Qty</span>
                <span style={{ fontWeight: 600 }}>{ret.items.reduce((s: number, x: any) => s + x.qty, 0)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", fontSize: 14, fontWeight: 700, background: "#f9f9f9", border: "1px solid #ecebea", borderRadius: 6, marginTop: 4 }}>
                <span>Total</span>
                <span>Rp {fmt(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === "fixedAssets" && (
        <div style={S.card}><p style={{ color: "#8e8f8e", fontSize: 13, fontStyle: "italic" }}>Tidak ada fixed assets untuk return ini.</p></div>
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
