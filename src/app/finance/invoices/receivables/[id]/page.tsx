"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Printer, CreditCard, FileText, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");
const fmtDate = (d: string | null | undefined) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const WORKFLOW_STEPS = ["DRAFT", "APPROVED", "SENT", "PAID"];
const workflowColor = (s: string) => {
  const map: Record<string, string> = { DRAFT: "#6b7280", APPROVED: "#f59e0b", SENT: "#0176d3", PAID: "#2e844a" };
  return map[s] || "#6b7280";
};

type TabKey = "details" | "payment" | "changes" | "additional";
const TABS: { key: TabKey; label: string }[] = [
  { key: "details", label: "Details" },
  { key: "payment", label: "Payment" },
  { key: "changes", label: "Changes" },
  { key: "additional", label: "Additional Info" },
];

export default function InvoiceReceivableDetailPage() {
  const router = useRouter();
  const params = useParams();
  const arId = params.id as string;

  const [ar, setAr] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("details");
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState<any[]>([]);
  const [changesLoading, setChangesLoading] = useState(false);

  useEffect(() => {
    if (!arId) { setLoading(false); setError("No AR ID"); return; }
    fetch(`/api/accounts-receivable/${arId}`)
      .then(r => r.json())
      .then(j => { setAr(j.data); setLoading(false); })
      .catch(() => { setError("Invoice Receivable not found"); setLoading(false); });
  }, [arId]);

  const fetchChanges = () => {
    if (!ar?.id || changes.length > 0) return;
    setChangesLoading(true);
    fetch(`/api/activity-log?refType=account_receivable&refId=${ar.id}`)
      .then(r => r.json())
      .then(j => { setChanges(j.data || []); setChangesLoading(false); })
      .catch(() => setChangesLoading(false));
  };

  const doAction = async (action: string) => {
    if (!confirm(`Are you sure you want to ${action}?`)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/accounts-receivable/${ar.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const j = await res.json();
      if (!res.ok) {
        alert("Error: " + (j.error || "Gagal"));
        console.error("AR action error:", j);
        setSaving(false);
        return;
      }
      setAr(j.data);
      alert(`Status updated to ${j.data.status}`);
    } catch (e: any) {
      console.error("AR action exception:", e);
      alert("Error: " + e.message);
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return (
    <div style={{ padding: 24 }}>
      <button onClick={() => router.push("/finance/invoices/receivables")} style={S.backBtn}><ArrowLeft size={16} /> Invoice Receivables</button>
      <div style={{ marginTop: 16, color: "#ea001e", fontSize: 14 }}>{error}</div>
    </div>
  );
  if (!ar) return null;

  const paid = (ar.amount || 0) - (ar.balance || 0);
  const currentStep = WORKFLOW_STEPS.indexOf(ar.status || "DRAFT");

  return (
    <div style={{ padding: "0 24px 24px" }}>
      {/* Back */}
      <button onClick={() => router.push("/finance/invoices/receivables")} style={S.backBtn}>
        <ArrowLeft size={16} /> Invoice Receivables
      </button>

      {/* Title */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <CreditCard size={20} style={{ color: "#0176d3" }} />
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>Invoice Receivable</h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={S.actionBtn}><Printer size={14} /> Print</button>
          {ar.status !== "PAID" && (
            <button style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "none" }}
              disabled={saving}
              onClick={() => doAction(ar.status === "DRAFT" ? "approve" : ar.status === "APPROVED" ? "send" : "pay")}>
              {saving ? "Processing..." : ar.status === "DRAFT" ? "Approve" : ar.status === "APPROVED" ? "Send" : "Receive Payment"}
            </button>
          )}
        </div>
      </div>

      {/* Workflow Bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 16, background: "#f9f9f9", borderRadius: 8, padding: "8px 16px", border: "1px solid #ecebea" }}>
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

      {/* Tab Bar */}
      <div style={{ display: "flex", gap: 2, borderBottom: "2px solid #ecebea", marginBottom: 20 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => {
            setActiveTab(t.key);
            if (t.key === "changes") fetchChanges();
          }} style={{
            ...S.tab,
            ...(activeTab === t.key ? S.tabActive : {}),
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══════ TAB: DETAILS ═══════ */}
      {activeTab === "details" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 24 }}>
          {/* Left Column */}
          <div>
            <InfoRow label="DOCUMENT NUMBER" value={`IR/${ar.invoice?.invNo?.split("/").pop() || "-"}`} bold />
            <InfoRow label="FROM ENTITY" value={ar.invoice?.store?.name || "PWNCORP"} />
            <InfoRow label="TO CUSTOMER" value={ar.customer?.name || "-"} link onClick={() => router.push(`/master-data/customers`)} />
            <InfoRow label="REFERENCE NUMBER" value={ar.invoice?.invNo || "-"} link onClick={() => router.push(`/finance/invoices/service/${ar.invoiceId}`)} />
            <InfoRow label="TAX NUMBER" value="-" />
            <InfoRow label="INVOICE DATE" value={fmtDate(ar.invoice?.invoiceDate)} />
            <InfoRow label="CUSTOMER BANK DETAILS" value="-" />
            <InfoRow label="NOTES" value={ar.notes || "-"} />
            <InfoRow label="JOURNAL" value="-" />
            <InfoRow label="DOCUMENT TRANSACTION" value="ServiceInvoice" link onClick={() => router.push(`/finance/invoices/service/${ar.invoiceId}`)} />
          </div>
          {/* Right Column */}
          <div>
            <InfoRow label="DUE DATE" value={fmtDate(ar.dueDate)} />
            <InfoRow label="EXPECTED PAYMENT DATE" value="-" />
            <InfoRow label="CREDIT TERM (DAYS)" value="0" />
            <InfoRow label="SOURCE" value={ar.source || "System"} />

            {/* Payments Section */}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0176d3", marginBottom: 12 }}>Payments</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: "#444746" }}>Amount Due</span>
                <span style={{ fontWeight: 600, color: ar.balance > 0 ? "#ea001e" : "#2e844a" }}>{fmt(ar.balance)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "#444746" }}>Amount Paid</span>
                <span style={{ fontWeight: 600, color: "#2e844a" }}>{fmt(paid)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ TAB: PAYMENT ═══════ */}
      {activeTab === "payment" && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div style={S.card}>
              <div style={{ fontSize: 11, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Total Amount</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{fmt(ar.amount)}</div>
            </div>
            <div style={S.card}>
              <div style={{ fontSize: 11, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Paid</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#2e844a" }}>{fmt(paid)}</div>
            </div>
            <div style={S.card}>
              <div style={{ fontSize: 11, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Outstanding</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: ar.balance > 0 ? "#ea001e" : "#2e844a" }}>{fmt(ar.balance)}</div>
            </div>
          </div>

          {/* Progress */}
          <div style={S.card}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#444746", marginBottom: 8 }}>
              <span>Payment Progress</span>
              <span>{ar.amount > 0 ? Math.round((paid / ar.amount) * 100) : 0}%</span>
            </div>
            <div style={{ height: 8, background: "#ecebea", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${ar.amount > 0 ? (paid / ar.amount) * 100 : 0}%`, background: "#2e844a", borderRadius: 4 }} />
            </div>
          </div>
        </div>
      )}

      {/* ═══════ TAB: CHANGES ═══════ */}
      {activeTab === "changes" && (
        <div style={S.card}>
          <InfoRow label="CREATED BY" value={ar.createdBy?.name || "-"} />
          <InfoRow label="UPDATED BY" value={ar.updatedBy?.name || "-"} />
          <InfoRow label="CREATED AT" value={fmtDate(ar.createdAt)} />
          <InfoRow label="UPDATED AT" value={fmtDate(ar.updatedAt || ar.createdAt)} />
          {ar.sentAt && <InfoRow label="SENT AT" value={fmtDate(ar.sentAt)} />}
          {ar.paidAt && <InfoRow label="PAID AT" value={fmtDate(ar.paidAt)} />}
        </div>
      )}

      {/* ═══════ TAB: ADDITIONAL INFO ═══════ */}
      {activeTab === "additional" && (
        <div style={S.card}>
          <InfoRow label="PAYMENT TYPE" value="-" />
          <InfoRow label="PAYMENT TYPE BANK" value="-" />
        </div>
      )}

      {/* ═══════ ITEMS TABLE (Persistent) ═══════ */}
      <div style={{ marginTop: 24 }}>
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={{ ...S.th, width: 40 }}>No.</th>
                <th style={S.th}>Description</th>
                <th style={{ ...S.th, textAlign: "right" }}>Quantity</th>
                <th style={{ ...S.th, textAlign: "right" }}>Unit Price</th>
                <th style={S.th}>Account</th>
                <th style={{ ...S.th, textAlign: "center" }}>Withholding Tax</th>
                <th style={{ ...S.th, textAlign: "right" }}>Tax (%)</th>
                <th style={{ ...S.th, textAlign: "right" }}>Amount Ex Tax</th>
              </tr>
            </thead>
            <tbody>
              {(ar.invoice?.items || []).map((item: any, i: number) => (
                <tr key={i} style={S.tr}>
                  <td style={S.td}>{i + 1}</td>
                  <td style={{ ...S.td, color: "#0176d3", fontWeight: 500 }}>Invoice# {ar.invoice?.invNo || "-"}</td>
                  <td style={{ ...S.td, textAlign: "right" }}>{item.qty || 1}</td>
                  <td style={{ ...S.td, textAlign: "right" }}>{fmt(item.total || item.unitPrice || 0)}</td>
                  <td style={S.td}>-</td>
                  <td style={{ ...S.td, textAlign: "center" }}>✗</td>
                  <td style={{ ...S.td, textAlign: "right" }}>0</td>
                  <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmt(item.total || 0)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "#f9f9f9" }}>
                <td colSpan={5} style={S.td}></td>
                <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>SUBTOTAL</td>
                <td style={S.td}></td>
                <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmt(ar.amount)}</td>
              </tr>
              <tr style={{ background: "#f9f9f9" }}>
                <td colSpan={5} style={S.td}></td>
                <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>TAX</td>
                <td style={S.td}></td>
                <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>0</td>
              </tr>
              <tr style={{ background: "#f3f3f3", fontWeight: 700 }}>
                <td colSpan={5} style={S.td}></td>
                <td style={{ ...S.td, textAlign: "right", fontWeight: 700 }}>TOTAL</td>
                <td style={S.td}></td>
                <td style={{ ...S.td, textAlign: "right", fontWeight: 700 }}>{fmt(ar.amount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, bold, link, onClick }: { label: string; value: string; bold?: boolean; link?: boolean; onClick?: () => void }) {
  return (
    <div style={{ marginBottom: 10, cursor: onClick ? "pointer" : "default" }} onClick={onClick}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: bold ? 700 : 500, color: link ? "#0176d3" : "#001526", display: "flex", alignItems: "center", gap: 4 }}>
        {value}
        {link && <ChevronRight size={12} style={{ color: "#0176d3" }} />}
      </div>
    </div>
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
  tabActive: {
    color: "#0176d3", borderBottomColor: "#0176d3", fontWeight: 600,
  },
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
  tr: { transition: "background 100ms" },
};
