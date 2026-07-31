"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Printer, FileText, ChevronRight, ChevronDown, Plus, X, Send, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

const fmt = (n: number) => (n || 0).toLocaleString("id-ID");
const fmtDate = (d: string | null | undefined) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const fmtDateTime = (d: string | null | undefined) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const WORKFLOW_STEPS = ["DRAFT", "COMPLETED"];
const workflowColor = (s: string) => {
  const map: Record<string, string> = { DRAFT: "#6b7280", COMPLETED: "#2e844a", CANCELLED: "#ea001e" };
  return map[s] || "#6b7280";
};

type TabKey = "details" | "docref" | "payables" | "payments" | "refunds" | "changes";
const TABS: { key: TabKey; label: string }[] = [
  { key: "details", label: "Details" },
  { key: "docref", label: "Document Reference" },
  { key: "payables", label: "Invoice Payables" },
  { key: "payments", label: "Payments" },
  { key: "refunds", label: "Refunds" },
  { key: "changes", label: "Changes" },
];

export default function ServiceInvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const noArray = params.no as string[];
  const invoiceNo = Array.isArray(noArray) ? noArray.join("/") : (noArray || "");

  const [inv, setInv] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("details");
  const [itemTab, setItemTab] = useState<"spareparts" | "services">("spareparts");
  const [payments, setPayments] = useState<any[]>([]);
  const [arData, setArData] = useState<any>(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [changes, setChanges] = useState<any[]>([]);
  const [payables, setPayables] = useState<any[]>([]);
  const [payablesLoading, setPayablesLoading] = useState(false);
  const [changesLoading, setChangesLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");

  const handleWorkflowAction = async (newStatus: string) => {
    if (!inv?.id) return;
    if (!confirm(`Change status to ${newStatus}?`)) return;
    setActionLoading(newStatus);
    try {
      const res = await fetch(`/api/invoices/${inv.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j.error || "Failed to update status");
        return;
      }
      setInv((prev: any) => ({ ...prev, status: newStatus }));
    } finally {
      setActionLoading("");
    }
  };

  useEffect(() => {
    if (!invoiceNo) { setLoading(false); setError("No invoice number"); return; }
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(invoiceNo);
    if (isUUID) {
      fetch(`/api/invoices/${invoiceNo}`)
        .then(r => r.json())
        .then(j => { setInv(j.data); setLoading(false); })
        .catch(() => { setError("Service invoice not found"); setLoading(false); });
    } else {
      fetch(`/api/invoices?search=${encodeURIComponent(invoiceNo)}&limit=1`)
        .then(r => r.json())
        .then(j => {
          const found = j.data?.[0];
          if (!found) { setError("Service invoice not found"); setLoading(false); return; }
          if (found.id) {
            return fetch(`/api/invoices/${found.id}`)
              .then(r2 => r2.json())
              .then(j2 => { setInv(j2.data || found); setLoading(false); });
          }
          setInv(found);
          setLoading(false);
        })
        .catch(() => { setError("Failed to load"); setLoading(false); });
    }
  }, [invoiceNo]);

  const fetchPayments = () => {
    if (!inv?.id) return;
    if (payments.length > 0 && arData) return;
    setPaymentsLoading(true);
    Promise.all([
      fetch(`/api/payments?invoiceId=${inv.id}`).then(r => r.json()).then(j => setPayments(j.data || [])).catch(() => {}),
      fetch(`/api/accounts-receivable?invoiceId=${inv.id}`).then(r => r.json()).then(j => setArData(j.data?.[0] || null)).catch(() => {}),
    ]).finally(() => setPaymentsLoading(false));
  };

  const fetchChanges = () => {
    if (!inv?.id || changes.length > 0) return;
    setChangesLoading(true);
    fetch(`/api/activity-log?refType=invoice&refId=${inv.id}`)
      .then(r => r.json())
      .then(j => { setChanges(j.data || []); setChangesLoading(false); })
      .catch(() => setChangesLoading(false));
  };

  const fetchPayables = () => {
    if (!inv?.id || payables.length > 0) return;
    setPayablesLoading(true);
    // Query journal entries that are SubletSundry refType for this invoice
    fetch(`/api/journal?refType=SubletSundry&limit=50`)
      .then(r => r.json())
      .then(async (j) => {
        const journals = (j.data || []).filter((je: any) =>
          (je.description || "").includes(inv.invNo)
        );
        // Get unique refId (which are IP docNos/cuid)
        const ipIds = Array.from(new Set(journals.map((je: any) => je.refId)));
        const ips: any[] = [];
        for (const id of ipIds) {
          if (!id) continue;
          try {
            const res = await fetch(`/api/purchase-invoices/${id}`);
            const data = await res.json();
            if (data.data) ips.push(data.data);
          } catch (e) { /* ignore */ }
        }
        setPayables(ips);
        setPayablesLoading(false);
      })
      .catch(() => setPayablesLoading(false));
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return (
    <div style={{ padding: 24 }}>
      <button onClick={() => router.push("/finance/invoices/service")} style={S.backBtn}><ArrowLeft size={16} /> Service Invoices</button>
      <div style={{ marginTop: 16, color: "#ea001e", fontSize: 14 }}>{error}</div>
    </div>
  );
  if (!inv) return null;

  const woNo = inv.wo?.woNo || "-";
  const soNo = inv.wo?.so?.soNo || "-";
  const so = inv.wo?.so || {};
  const vehicle = so.vehicle || {};
  const status = inv.status || "DRAFT";
  const total = inv.total || 0;
  const amountPaid = inv.amountPaid || 0;
  const amountDue = inv.amountDue ?? (total - amountPaid);
  const items = inv.items || [];
  const serviceItems = items.filter((it: any) => it.description === "Jasa" || it.description?.toLowerCase().includes("jasa"));
  const sparepartItems = items.filter((it: any) => it.description === "Sparepart" || it.description?.toLowerCase().includes("sparepart"));
  const currentStep = Math.max(0, WORKFLOW_STEPS.indexOf(status));

  return (
    <div style={{ padding: "0 24px 24px", maxWidth: 1400 }}>
      {/* Header: Title + Actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <button onClick={() => router.push("/finance/invoices/service")} style={S.backBtn}>
          <ArrowLeft size={16} /> Service Invoices
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={S.actionBtn}><Printer size={14} /> Print <ChevronDown size={12} /></button>
          <button style={S.actionBtn}><FileText size={14} /> Tax Invoice</button>
        </div>
      </div>

      {/* Workflow Bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 12, background: "#f9f9f9", borderRadius: 8, padding: "8px 16px", border: "1px solid #ecebea" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#444746", marginRight: 12 }}>Workflow</span>
        {WORKFLOW_STEPS.map((step, i) => {
          const isActive = i === currentStep;
          const isCompleted = i < currentStep;
          return (
            <div key={step} style={{ display: "flex", alignItems: "center" }}>
              <div style={{
                padding: "4px 12px", borderRadius: 4, fontSize: 10, fontWeight: 600,
                background: isActive ? workflowColor(step) : isCompleted ? workflowColor(step) + "22" : "#e5e7eb",
                color: isActive ? "#fff" : isCompleted ? workflowColor(step) : "#9ca3af",
                border: isActive ? `1px solid ${workflowColor(step)}` : "1px solid transparent",
              }}>
                {step}
              </div>
              {i < WORKFLOW_STEPS.length - 1 && (
                <div style={{ width: 20, height: 1, background: isCompleted ? workflowColor(step) : "#d1d5db", margin: "0 4px" }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Workflow Actions */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {status === "DRAFT" && (
          <>
            <button onClick={() => handleWorkflowAction("COMPLETED")} disabled={actionLoading === "COMPLETED"}
              style={{ ...S.actionBtn, background: "#2e844a", color: "#fff", border: "none", opacity: actionLoading ? 0.6 : 1 }}>
              <CheckCircle size={14} /> {actionLoading === "COMPLETED" ? "Processing..." : "Complete"}
            </button>
            <button onClick={() => handleWorkflowAction("CANCELLED")} disabled={actionLoading === "CANCELLED"}
              style={{ ...S.actionBtn, background: "#ea001e", color: "#fff", border: "none", opacity: actionLoading ? 0.6 : 1 }}>
              <X size={14} /> {actionLoading === "CANCELLED" ? "Cancelling..." : "Cancel"}
            </button>
          </>
        )}
      </div>

      {/* Tab Bar */}
      <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #ecebea", marginBottom: 20 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => {
            setActiveTab(t.key);
            if (t.key === "payments") fetchPayments();
            if (t.key === "changes") fetchChanges();
            if (t.key === "payables") fetchPayables();
          }} style={{ ...S.tab, ...(activeTab === t.key ? S.tabActive : {}) }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══════ TAB: DETAILS ═══════ */}
      {activeTab === "details" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginBottom: 24 }}>
          {/* Left Column */}
          <div>
            <InfoRow label="DOCUMENT NUMBER" value={inv.invNo || "-"} bold />
              <InfoRow label="STORE" value={inv.store?.name || "-"} link onClick={() => router.push("/master-data/stores")} />
              <InfoRow label="CUSTOMER" value={inv.customer?.name || "-"} link onClick={() => router.push("/master-data/customers")} />
              {inv.customer?.phone && <div style={{ fontSize: 12, color: "#666", marginLeft: 12, marginBottom: 6 }}>📞 {inv.customer.phone}</div>}
              <InfoRow label="REGISTRATION NO" value={vehicle.plateNo || "-"} />
              <InfoRow label="SERVICE DATE" value={so.date ? fmtDateTime(so.date) : "-"} />
              <InfoRow label="SERVICE TIME" value={so.planServiceTime || "-"} />
              <InfoRow label="INVOICE DATE" value={fmtDate(inv.invoiceDate)} />
              <InfoRow label="SALESPERSON" value={so.salesperson || "-"} />
              <InfoRow label="BOOKING SOURCE" value={so.bookingSource || "-"} />
              <InfoRow label="REFERENCE NUMBER" value={so.referenceNumber || "-"} />
              <InfoRow label="COMPLAINT" value={so.complaint || "-"} />
          </div>
          {/* Right Column */}
          <div>
            <InfoRow label="VEHICLE TYPE" value="CAR" />
            <InfoRow label="VEHICLE MAKE" value={vehicle.brand || "-"} />
            <InfoRow label="VEHICLE MODEL" value={vehicle.model || "-"} />
            <InfoRow label="YEAR" value={vehicle.year || "-"} />
            <InfoRow label="COLOR" value={so.color || "-"} />
            <InfoRow label="ODOMETER" value={so.odometer || "-"} />

            <div style={{ borderTop: "1px solid #f0f0f0", marginTop: 20, paddingTop: 16 }}>
              <InfoRow label="JOURNAL" value="-" />
              <InfoRow label="SA" value={so.sa?.name || "-"} />
              <InfoRow label="STATUS" value={so.status || "-"} bold />
            </div>
          </div>
        </div>
      )}

      {/* ═══════ TAB: DOCUMENT REFERENCE ═══════ */}
      {activeTab === "docref" && (
        <>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#001526", marginBottom: 10 }}>Service Order</h3>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead><tr>
                <th style={{ ...S.th, width: 40 }}>No.</th>
                <th style={S.th}>Document Number</th>
                <th style={S.th}>Created Date</th>
                <th style={S.th}>Status</th>
              </tr></thead>
              <tbody>
                <tr style={S.tr} onClick={() => soNo !== "-" && router.push(`/service-orders/${soNo}`)}>
                  <td style={S.td}>1</td>
                  <td style={{ ...S.td, color: soNo !== "-" ? "#0176d3" : "#444746", fontWeight: 500, cursor: "pointer" }}>{soNo}</td>
                  <td style={S.td}>{fmtDateTime(so.date || so.createdAt)}</td>
                  <td style={S.td}><StatusBadge status={so.status || "-"} /></td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#001526", marginTop: 24, marginBottom: 10 }}>Service Work Orders</h3>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead><tr>
                <th style={{ ...S.th, width: 40 }}>No.</th>
                <th style={S.th}>Document Number</th>
                <th style={S.th}>Created Date</th>
                <th style={S.th}>Status</th>
              </tr></thead>
              <tbody>
                <tr style={S.tr} onClick={() => woNo !== "-" && router.push(`/work-orders/detail/${woNo}`)}>
                  <td style={S.td}>1</td>
                  <td style={{ ...S.td, color: woNo !== "-" ? "#0176d3" : "#444746", fontWeight: 500, cursor: "pointer" }}>{woNo}</td>
                  <td style={S.td}>{fmtDateTime(inv.wo?.date || inv.wo?.createdAt)}</td>
                  <td style={S.td}><StatusBadge status={inv.wo?.status || "-"} /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ═══════ TAB: PAYMENTS ═══════ */}
      {activeTab === "payments" && (
        <>
          {/* Summary Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, marginBottom: 24 }}>
            <div>
              <InfoRow label="PACKAGE SERVICES" value="0" />
              <InfoRow label="SPAREPARTS" value={fmt(sparepartItems.reduce((s: number, x: any) => s + (x.total || 0), 0))} />
              <InfoRow label="SERVICES" value={fmt(serviceItems.reduce((s: number, x: any) => s + (x.total || 0), 0))} />
              <InfoRow label="DISCOUNT" value="(0)" />
              <InfoRow label="TOTAL SPENDING" value={fmt(total)} bold />
              <InfoRow label="SPECIAL DISCOUNT 0%" value="(0)" />
            </div>
            <div>
              <InfoRow label="SUBTOTAL" value={fmt(total)} />
              <InfoRow label="ROUNDING" value="0" />
              <InfoRow label="TOTAL" value={fmt(total)} bold />
            </div>
            <div>
              {arData && (
                <InfoRow label="INVOICE RECEIVABLE" value={`IR/${inv.invNo?.split("/").pop() || "-"}`} link
                  onClick={() => router.push(`/finance/invoices/receivables/${arData.id}`)} />
              )}
            </div>
          </div>

          {/* Payment Table */}
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead><tr>
                <th style={{ ...S.th, width: 40 }}>No.</th>
                <th style={S.th}>Payment Name</th>
                <th style={{ ...S.th, textAlign: "right" }}>Payment Amount</th>
                <th style={{ ...S.th, textAlign: "right" }}>Change Amount</th>
              </tr></thead>
              <tbody>
                {!arData || arData.status !== "PAID" ? (
                  <tr><td colSpan={4} style={{ ...S.td, textAlign: "center", padding: 24, color: "#999" }}>Payment will appear after Invoice Receivable is PAID</td></tr>
                ) : paymentsLoading ? (
                  <tr><td colSpan={4} style={{ ...S.td, textAlign: "center", padding: 24 }}>Loading...</td></tr>
                ) : payments.length === 0 ? (
                  <tr><td colSpan={4} style={{ ...S.td, textAlign: "center", padding: 24, color: "#999" }}>No payments</td></tr>
                ) : payments.map((p: any, i: number) => (
                  <tr key={i} style={S.tr}>
                    <td style={S.td}>{i + 1}</td>
                    <td style={{ ...S.td, fontWeight: 500 }}>{p.paymentMethod === "cash" ? "Cash" : p.paymentMethod === "transfer" ? "Transfer" : p.paymentMethod || "Cash"}</td>
                    <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmt(p.amount)}</td>
                    <td style={{ ...S.td, textAlign: "right" }}>-</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ═══════ TAB: REFUNDS ═══════ */}
      {activeTab === "refunds" && (
        <>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#001526", marginBottom: 10 }}>Refunds</h3>
          <button style={{ ...S.actionBtn, marginBottom: 12 }}><Plus size={14} /> Create Service Refund</button>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead><tr>
                <th style={{ ...S.th, width: 40 }}>No.</th>
                <th style={S.th}>Refcode</th>
                <th style={S.th}>Status</th>
                <th style={{ ...S.th, textAlign: "right" }}>Total</th>
              </tr></thead>
              <tbody>
                <tr><td colSpan={4} style={{ ...S.td, textAlign: "center", padding: 24, color: "#999" }}>No refunds</td></tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ═══════ TAB: INVOICE PAYABLES ═══════ */}
      {activeTab === "payables" && (
        <>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#001526", marginBottom: 10 }}>Invoice Payables (Auto-generated from Sublet &amp; Sundry)</h3>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead><tr>
                <th style={{ ...S.th, width: 40 }}>No.</th>
                <th style={S.th}>IP Number</th>
                <th style={S.th}>Supplier</th>
                <th style={S.th}>Status</th>
                <th style={{ ...S.th, textAlign: "right" }}>Total</th>
              </tr></thead>
              <tbody>
                {payablesLoading ? (
                  <tr><td colSpan={5} style={{ ...S.td, textAlign: "center", padding: 24 }}>Loading...</td></tr>
                ) : payables.length === 0 ? (
                  <tr><td colSpan={5} style={{ ...S.td, textAlign: "center", padding: 24, color: "#999" }}>No invoice payables. Sublet/Sundry items akan otomatis membuat IP saat invoice COMPLETED.</td></tr>
                ) : payables.map((ip: any, i: number) => (
                  <tr key={ip.id} style={S.tr}>
                    <td style={S.td}>{i + 1}</td>
                    <td style={{ ...S.td, color: "#0176d3", fontWeight: 500, cursor: "pointer" }} onClick={() => router.push(`/finance/invoices/payables/${ip.id}`)}>{ip.docNo}</td>
                    <td style={S.td}>{ip.supplier?.companyName || "-"}</td>
                    <td style={S.td}><StatusBadge status={ip.status} /></td>
                    <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmt(ip.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ═══════ TAB: CHANGES ═══════ */}
      {activeTab === "changes" && (
        <div style={{ ...S.card, marginBottom: 24 }}>
          {changesLoading ? (
            <div style={{ padding: 24, textAlign: "center" }}>Loading...</div>
          ) : (
            <>
              <InfoRow label="CREATED BY" value={inv.createdBy?.name || "-"} />
              <InfoRow label="CREATED AT" value={fmtDateTime(inv.createdAt)} />
              <InfoRow label="UPDATED BY" value={inv.updatedBy?.name || "-"} />
              <InfoRow label="UPDATED AT" value={fmtDateTime(inv.updatedAt || inv.createdAt)} />
            </>
          )}
        </div>
      )}

      {/* ═══════ PERSISTENT: Items (Spareparts / Services tabs) ═══════ */}
      <div style={{ marginTop: 16 }}>
        <div style={{ display: "flex", gap: 0, marginBottom: 0 }}>
          <button onClick={() => setItemTab("spareparts")} style={{
            padding: "6px 16px", fontSize: 12, fontWeight: 600, border: "1px solid #ecebea",
            borderBottom: itemTab === "spareparts" ? "2px solid #0176d3" : "2px solid transparent",
            borderRadius: "6px 6px 0 0", cursor: "pointer", background: itemTab === "spareparts" ? "#fff" : "#f9f9f9",
            color: itemTab === "spareparts" ? "#0176d3" : "#444746",
          }}>Spareparts</button>
          <button onClick={() => setItemTab("services")} style={{
            padding: "6px 16px", fontSize: 12, fontWeight: 600, border: "1px solid #ecebea",
            borderBottom: itemTab === "services" ? "2px solid #0176d3" : "2px solid transparent",
            borderRadius: "6px 6px 0 0", cursor: "pointer", background: itemTab === "services" ? "#fff" : "#f9f9f9",
            color: itemTab === "services" ? "#0176d3" : "#444746", marginLeft: -1,
          }}>Services</button>
        </div>
        <div style={{ ...S.tableWrap, borderRadius: "0 8px 8px 8px" }}>
          <table style={S.table}>
            <thead><tr>
              <th style={{ ...S.th, width: 40 }}>No</th>
              <th style={S.th}>SKU</th>
              <th style={S.th}>Product Name</th>
              <th style={S.th}>Product Code</th>
              <th style={{ ...S.th, textAlign: "right" }}>Quantity</th>
              <th style={{ ...S.th, textAlign: "right" }}>Price Ex Tax</th>
              <th style={{ ...S.th, textAlign: "right" }}>Discount</th>
              <th style={{ ...S.th, textAlign: "right" }}>Subtotal</th>
              <th style={{ ...S.th, textAlign: "right" }}>Tax</th>
              <th style={{ ...S.th, textAlign: "right" }}>Total</th>
            </tr></thead>
            <tbody>
              {(itemTab === "spareparts" ? sparepartItems : serviceItems).map((item: any, i: number) => (
                <tr key={i} style={S.tr}>
                  <td style={S.td}>{i + 1}</td>
                  <td style={{ ...S.td, color: "#0176d3" }}>NON-TRACKING</td>
                  <td style={{ ...S.td, fontWeight: 500 }}>{item.item || "-"}</td>
                  <td style={S.td}>-</td>
                  <td style={{ ...S.td, textAlign: "right" }}>{item.qty}</td>
                  <td style={{ ...S.td, textAlign: "right" }}>{fmt(item.unitPrice || 0)}</td>
                  <td style={{ ...S.td, textAlign: "right" }}>-</td>
                  <td style={{ ...S.td, textAlign: "right" }}>{fmt(item.total || 0)}</td>
                  <td style={{ ...S.td, textAlign: "right" }}>0</td>
                  <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmt(item.total || 0)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "#f9f9f9", fontWeight: 600 }}>
                <td colSpan={4} style={{ ...S.td, textAlign: "right" }}>Total</td>
                <td style={{ ...S.td, textAlign: "right" }}>
                  {(itemTab === "spareparts" ? sparepartItems : serviceItems).reduce((s: number, x: any) => s + (x.qty || 0), 0)}
                </td>
                <td colSpan={2} style={S.td}></td>
                <td style={{ ...S.td, textAlign: "right" }}>
                  {fmt((itemTab === "spareparts" ? sparepartItems : serviceItems).reduce((s: number, x: any) => s + (x.total || 0), 0))}
                </td>
                <td style={{ ...S.td, textAlign: "right" }}>0</td>
                <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>
                  {fmt((itemTab === "spareparts" ? sparepartItems : serviceItems).reduce((s: number, x: any) => s + (x.total || 0), 0))}
                </td>
              </tr>
              <tr style={{ background: "#f3f3f3", fontWeight: 700 }}>
                <td colSpan={4} style={{ ...S.td, textAlign: "right" }}>Total All Items</td>
                <td style={{ ...S.td, textAlign: "right" }}>{items.reduce((s: number, x: any) => s + (x.qty || 0), 0)}</td>
                <td colSpan={2} style={S.td}></td>
                <td style={{ ...S.td, textAlign: "right" }}>{fmt(total)}</td>
                <td style={{ ...S.td, textAlign: "right" }}>0</td>
                <td style={{ ...S.td, textAlign: "right", fontWeight: 700 }}>{fmt(total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
        <button onClick={() => router.push("/finance/invoices/service")} style={S.backBtn}>
          <ArrowLeft size={14} /> Service Invoices
        </button>
        <button style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "none" }}>
          <FileText size={14} /> Edit
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value, bold, link, onClick }: { label: string; value: string; bold?: boolean; link?: boolean; onClick?: () => void }) {
  return (
    <div style={{ marginBottom: 8, cursor: onClick ? "pointer" : "default" }} onClick={onClick}>
      <span style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.03em", marginRight: 8 }}>{label}:</span>
      <span style={{ fontSize: 13, fontWeight: bold ? 700 : 500, color: link ? "#0176d3" : "#001526" }}>
        {value}
        {link && <ChevronRight size={11} style={{ display: "inline", marginLeft: 2 }} />}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    DRAFT: "#6b7280", COMPLETED: "#2e844a", CANCELLED: "#ea001e",
    Draft: "#6b7280", Approved: "#0176d3", Cancelled: "#ea001e", Delivered: "#2e844a",
    InProgress: "#f59e0b", Completed: "#2e844a",
  };
  const color = colorMap[status] || "#6b7280";
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, color: "#fff", background: color, textTransform: "uppercase" }}>
      {status}
    </span>
  );
}

const S: Record<string, React.CSSProperties> = {
  backBtn: {
    display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px",
    fontSize: 13, fontWeight: 500, color: "#444746", background: "#fff",
    border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer",
  },
  actionBtn: {
    display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 14px",
    fontSize: 12, fontWeight: 500, color: "#001526", background: "#fff",
    border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer",
  },
  tab: {
    padding: "8px 16px", fontSize: 13, fontWeight: 500,
    color: "#444746", background: "transparent", border: "none",
    borderBottom: "2px solid transparent", cursor: "pointer",
    marginBottom: -2, transition: "all 150ms",
  },
  tabActive: { color: "#0176d3", borderBottomColor: "#0176d3", fontWeight: 600 },
  card: {
    border: "1px solid #ecebea", borderRadius: 8, padding: 16, background: "#fff",
  },
  tableWrap: {
    border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden", background: "#fff",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    padding: "8px 10px", textAlign: "left", fontWeight: 600,
    fontSize: 11, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em",
    background: "#f9f9f9", borderBottom: "1px solid #ecebea",
  },
  td: {
    padding: "8px 10px", borderBottom: "1px solid #f0f0f0", color: "#001526", background: "#fff",
  },
  tr: { transition: "background 100ms", cursor: "pointer" },
};
