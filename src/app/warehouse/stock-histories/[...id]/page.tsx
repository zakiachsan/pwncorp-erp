"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Printer, Barcode, ChevronRight } from "lucide-react";

const fmtDate = (d: string) => {
  const dt = new Date(d);
  return dt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const fmt = (n: number) => (n || 0).toLocaleString("id-ID");
const workflowSteps = ["DRAFT", "RECEIVED"];

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

export default function StockHistoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const idArray = params.id as string[];
  const refCode = idArray ? idArray.join("/") : "";
  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"details" | "fixedAssets">("details");

  useEffect(() => {
    fetch(`/api/stock-histories?sparepartId=${encodeURIComponent(refCode)}`)
      .then((r) => r.json())
      .then((j) => {
        const list = j.data || [];
        if (list.length > 0) {
          const first = list[0];
          setDelivery({
            refCode: first.refNo || first.refDoc || "-",
            referenceNumber: first.refNo || "-",
            purchaseOrder: first.refDoc || "-",
            purchaseInvoice: "-",
            supplier: { name: "-", address: "-" },
            deliverTo: { name: "-", address: "-" },
            warehouse: "-",
            notes: `Stock history for ${first.sparepart?.name || refCode}`,
            createdBy: "-",
            updatedBy: "-",
            createdAt: fmtDate(first.createdAt),
            updatedAt: fmtDate(first.createdAt),
            receivedDate: fmtDate(first.date),
            journal: "-",
            status: first.changeType === "in" ? "RECEIVED" : first.changeType,
            items: list.map((item: any, i: number) => ({
              no: i + 1,
              sku: item.sparepart?.sku || "-",
              product: item.sparepart?.name || "-",
              productCode: item.sparepart?.code || "-",
              qty: Math.abs(item.qtyChange),
              price: 0,
              discount: 0,
              amount: 0,
            })),
          });
        }
        setLoading(false);
      })
      .catch(() => { setError("Failed to load stock history"); setLoading(false); });
  }, [refCode]);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/warehouse/stock-histories")} style={S.backBtn}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>Loading...</p></div>
      </div>
    );
  }
  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/warehouse/stock-histories")} style={S.backBtn}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <div style={S.card}><p style={{ color: "red", fontSize: 14 }}>{error}</p></div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/warehouse/stock-histories")} style={S.backBtn}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>Data tidak ditemukan: {refCode}</p></div>
      </div>
    );
  }

  const currentStepIdx = workflowSteps.indexOf(delivery.status);
  const subtotal = delivery.items.reduce((s: number, x: any) => s + x.amount, 0);
  const tax = Math.round(subtotal * 0.11);
  const total = subtotal + tax;
  const allQty = delivery.items.reduce((s: number, x: any) => s + x.qty, 0);

  return (
    <div style={{ padding: "0 24px 24px" }}>
      <button onClick={() => router.push("/warehouse/stock-histories")} style={S.backBtn}>
        <ArrowLeft size={16} /> Kembali
      </button>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#001526", marginBottom: 12 }}>
        Purchase Delivery (Standard)
      </div>
      <div style={S.workflowBar}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#444746" }}>Workflow</span>
          <div style={{ display: "flex", gap: 6 }}>
            {workflowSteps.map((step, i) => (
              <span key={step} style={{ ...S.badge, background: i <= currentStepIdx ? "#2e844a" : "transparent", color: i <= currentStepIdx ? "#fff" : "#8e8f8e", border: `1px solid ${i <= currentStepIdx ? "#2e844a" : "#d8d8d8"}` }}>{step}</span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={S.actionBtn}><Barcode size={14} /> Barcode</button>
          <button style={S.actionBtn}><Printer size={14} /> Print</button>
        </div>
      </div>
      <div style={{ display: "flex", gap: 0, marginBottom: 16, background: "#ecebea", borderRadius: 8, padding: 3, width: "fit-content" }}>
        <button onClick={() => setActiveTab("details")} style={{ padding: "7px 18px", fontSize: 13, border: "none", borderRadius: 6, cursor: "pointer", whiteSpace: "nowrap", color: activeTab === "details" ? "#fff" : "#444746", background: activeTab === "details" ? "#0176d3" : "transparent", fontWeight: activeTab === "details" ? 600 : 400 }}>Details</button>
        <button onClick={() => setActiveTab("fixedAssets")} style={{ padding: "7px 18px", fontSize: 13, border: "none", borderRadius: 6, cursor: "pointer", whiteSpace: "nowrap", color: activeTab === "fixedAssets" ? "#fff" : "#444746", background: activeTab === "fixedAssets" ? "#0176d3" : "transparent", fontWeight: activeTab === "fixedAssets" ? 600 : 400 }}>Fixed Assets</button>
      </div>

      {activeTab === "details" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 20 }}>
            <div>
              <F label="REF CODE" value={delivery.refCode} />
              <F label="REFERENCE NUMBER" value={delivery.referenceNumber} />
              <F label="PURCHASE ORDER" value={delivery.purchaseOrder} link onClick={() => {}} />
              <F label="PURCHASE INVOICE" value={delivery.purchaseInvoice} link onClick={() => {}} />
              <F label="SUPPLIER" value={delivery.supplier.name} link onClick={() => {}} />
              <div style={{ fontSize: 12, color: "#444746", marginBottom: 10, marginLeft: 0, paddingLeft: 0, marginTop: -4 }}>{delivery.supplier.address}</div>
              <F label="DELIVER TO" value={delivery.deliverTo.name} link onClick={() => {}} />
              <div style={{ fontSize: 12, color: "#444746", marginBottom: 10, marginTop: -4 }}>{delivery.deliverTo.address}</div>
              <F label="WAREHOUSE" value={delivery.warehouse} link onClick={() => {}} />
              <F label="NOTES" value={delivery.notes} />
            </div>
            <div style={{ borderLeft: "1px solid #ecebea", paddingLeft: 32 }}>
              <F label="CREATED BY" value={delivery.createdBy} />
              <F label="UPDATED BY" value={delivery.updatedBy} />
              <F label="CREATED AT" value={delivery.createdAt} />
              <F label="UPDATED AT" value={delivery.updatedAt} />
              <F label="RECEIVED DATE" value={delivery.receivedDate} />
              <F label="JOURNAL" value={delivery.journal} link onClick={() => {}} />
            </div>
          </div>

          <div style={{ fontSize: 13, fontWeight: 600, color: "#0176d3", marginBottom: 8 }}>Delivery Items</div>
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
                {delivery.items.map((item: any) => (
                  <tr key={item.no} style={S.tr}>
                    <td style={S.td}>{item.no}</td>
                    <td style={{ ...S.td, color: "#0176d3", fontWeight: 500, cursor: "pointer" }} onClick={() => router.push(`/products/${item.sku}`)}>{item.sku}</td>
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
                <span style={{ color: "#444746" }}>All Pages Qty</span><span style={{ fontWeight: 600 }}>{allQty}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 12px", fontSize: 13 }}>
                <span style={{ color: "#444746" }}>SubTotal</span><span style={{ fontWeight: 600 }}>Rp {fmt(subtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 12px", fontSize: 13 }}>
                <span style={{ color: "#444746" }}>Tax (PPN 11%)</span><span style={{ fontWeight: 600 }}>Rp {fmt(tax)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", fontSize: 14, fontWeight: 700, background: "#f9f9f9", border: "1px solid #ecebea", borderRadius: 6, marginTop: 4 }}>
                <span>Total</span><span>Rp {fmt(total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "fixedAssets" && (
        <div style={S.card}><p style={{ color: "#8e8f8e", fontSize: 13, fontStyle: "italic" }}>Tidak ada fixed assets untuk delivery ini.</p></div>
      )}
    </div>
  );
}
