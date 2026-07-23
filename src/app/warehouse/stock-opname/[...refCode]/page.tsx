"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Printer, CheckCircle, Ban, ShieldCheck } from "lucide-react";

const fmt = (n: number) => (n || 0).toLocaleString("id-ID");

const workflowSteps = ["DRAFT", "COMPLETED", "APPROVED"];

export default function StockOpnameDetailPage() {
  const router = useRouter();
  const params = useParams();
  const refCodeArray = params.refCode as string[];
  const refCode = refCodeArray ? refCodeArray.join("/") : "";
  const [opname, setOpname] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [completeMode, setCompleteMode] = useState(false);
  const [countedItems, setCountedItems] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchOpname = () => {
    fetch(`/api/stock-opnames?search=${encodeURIComponent(refCode)}&limit=1`)
      .then(r => r.json())
      .then(json => {
        const found = (json.data || [])[0];
        if (!found) { setError("Stock Opname tidak ditemukan: " + refCode); setLoading(false); return; }
        return fetch(`/api/stock-opnames/${found.id}`)
          .then(r2 => r2.json())
          .then(j2 => { setOpname(j2.data || found); setLoading(false); });
      })
      .catch(() => { setError("Failed to load data"); setLoading(false); });
  };

  useEffect(() => { fetchOpname(); }, [refCode]);

  const doAction = async (action: string, extraBody?: any) => {
    setConfirmAction(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/stock-opnames/${opname.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extraBody }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Gagal");
      fetchOpname();
      setCompleteMode(false);
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  const startComplete = () => {
    setCountedItems(opname.items.map((it: any) => ({
      id: it.id,
      sparepartId: it.sparepartId,
      sku: it.sparepart?.sku || "-",
      name: it.sparepart?.name || "-",
      systemQty: it.systemQty || 0,
      countedQty: it.physicalQty || 0,
      approvedQty: it.physicalQty || 0,
      reason: it.reason || "",
    })));
    setCompleteMode(true);
  };

  const updateCounted = (i: number, field: string, val: any) => {
    setCountedItems(prev => prev.map((it, idx) => {
      if (idx !== i) return it;
      const next = { ...it, [field]: val };
      if (field === "countedQty") {
        next.approvedQty = val;
      }
      return next;
    }));
  };

  const handleSaveComplete = async () => {
    setSaving(true);
    try {
      await doAction("complete", {
        items: countedItems.map(it => ({
          id: it.id,
          sparepartId: it.sparepartId,
          systemQty: it.systemQty,
          physicalQty: parseInt(it.countedQty) || 0,
          approvedQty: parseInt(it.approvedQty) || 0,
          reason: it.reason || null,
        })),
      });
    } catch (e: any) { alert(e.message); setSaving(false); }
  };

  const handleApprove = async () => {
    setSaving(true);
    try {
      await doAction("approve");
    } catch (e: any) { alert(e.message); setSaving(false); }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!opname) return null;

  const status = opname.status || "Draft";
  const isDraft = status === "Draft";
  const isCompleted = status === "Completed";
  const isApproved = status === "Approved";
  const isCancelled = status === "Cancelled";
  const currentStepIdx = isCancelled ? -1 : workflowSteps.indexOf(status.toUpperCase());
  const items = opname.items || [];

  const totalSystem = items.reduce((s: number, x: any) => s + (x.systemQty || 0), 0);
  const totalPhysical = items.reduce((s: number, x: any) => s + (x.physicalQty || 0), 0);
  const totalAdj = items.reduce((s: number, x: any) => s + (x.adjustment || 0), 0);

  return (
    <div style={{ padding: "0 24px 24px" }}>
      {/* Header */}
      <div className="view-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/warehouse/stock-opname")} className="btn btn--sm"><ArrowLeft size={16} /></button>
          <div>
            <div className="view-title">Stock Opname</div>
            <div className="text-xs text-[--color-text-secondary]">{opname.refCode}</div>
          </div>
        </div>
        <div className="flex gap-2">
          {isDraft && !completeMode && (
            <>
              <button onClick={startComplete} className="btn btn--sm" style={{ background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}>
                <CheckCircle size={14} /> Complete
              </button>
              <button onClick={() => setConfirmAction("cancel")} className="btn btn--sm" style={{ background: "#ea001e", color: "#fff", border: "1px solid #ea001e" }}>
                <Ban size={14} /> Cancel
              </button>
            </>
          )}
          {isCompleted && (
            <button onClick={handleApprove} className="btn btn--sm" style={{ background: "#2e844a", color: "#fff", border: "1px solid #2e844a" }}>
              <ShieldCheck size={14} /> Approve
            </button>
          )}
          <button onClick={() => window.print()} className="btn btn--sm"><Printer size={14} /> Print</button>
        </div>
      </div>

      {/* Cancelled Banner */}
      {isCancelled && (
        <div className="mb-4 px-4 py-2 rounded-md text-sm font-semibold" style={{ background: "#fef2f2", color: "#ea001e", border: "1px solid #fecaca" }}>
          Stock Opname ini telah DIBATALKAN
        </div>
      )}

      {/* Workflow Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px", background: "#f9f9f9", border: "1px solid #ecebea", borderRadius: 8, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#444746" }}>Workflow</span>
          <div style={{ display: "flex", gap: 6 }}>
            {isCancelled ? (
              <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: "#ea001e", color: "#fff" }}>CANCELLED</span>
            ) : (
              workflowSteps.map((step, i) => (
                <span key={step} style={{
                  display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 4,
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.03em",
                  background: i <= currentStepIdx ? "#2e844a" : "transparent",
                  color: i <= currentStepIdx ? "#fff" : "#8e8f8e",
                  border: `1px solid ${i <= currentStepIdx ? "#2e844a" : "#d8d8d8"}`,
                }}>{step}</span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 20 }}>
        <div>
          <F label="REFERENCE CODE" value={opname.refCode || "-"} />
          <F label="WAREHOUSE" value={opname.warehouse || "-"} />
          <F label="KETERANGAN" value={opname.description || "-"} />
        </div>
        <div style={{ borderLeft: "1px solid #ecebea", paddingLeft: 32 }}>
          <F label="STATUS" value={status} />
          <F label="DATE" value={opname.date ? new Date(opname.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"} />
        </div>
      </div>

      {/* COMPLETE MODE — Edit form */}
      {completeMode && (
        <div className="mb-4">
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0176d3", marginBottom: 8 }}>Count Stock — Isi Jumlah Fisik</div>
          <div style={{ border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={S.th}>No</th>
                  <th style={S.th}>Product</th>
                  <th style={{ ...S.th, textAlign: "right" }}>System Stock</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Counted Stock</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Difference</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Approved</th>
                  <th style={S.th}>Reason</th>
                </tr>
              </thead>
              <tbody>
                {countedItems.map((it, i) => {
                  const diff = (parseInt(String(it.countedQty)) || 0) - it.systemQty;
                  return (
                    <tr key={it.id || i}>
                      <td style={S.td}>{i + 1}</td>
                      <td style={{ ...S.td, color: "#0176d3", fontWeight: 500 }}>{it.sku} — {it.name}</td>
                      <td style={{ ...S.td, textAlign: "right", background: "#f9f9f9" }}>{it.systemQty}</td>
                      <td style={{ ...S.td, textAlign: "right" }}>
                        <input type="number" min={0} className="form-input text-right" style={{ width: 80 }}
                          value={it.countedQty} onChange={e => updateCounted(i, "countedQty", e.target.value)} />
                      </td>
                      <td style={{ ...S.td, textAlign: "right", fontWeight: 600, color: diff !== 0 ? "#ea001e" : "#2e844a" }}>
                        {diff > 0 ? `+${diff}` : diff}
                      </td>
                      <td style={{ ...S.td, textAlign: "right" }}>
                        <input type="number" min={0} className="form-input text-right" style={{ width: 80 }}
                          value={it.approvedQty} onChange={e => updateCounted(i, "approvedQty", e.target.value)} />
                      </td>
                      <td style={S.td}>
                        <input type="text" className="form-input" style={{ width: 140 }} placeholder="Alasan..."
                          value={it.reason} onChange={e => updateCounted(i, "reason", e.target.value)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button onClick={() => setCompleteMode(false)} className="btn btn--sm" disabled={saving}>Batal</button>
            <button onClick={handleSaveComplete} className="btn btn--brand btn--sm" disabled={saving} style={{ background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}>
              <CheckCircle size={14} /> {saving ? "Saving..." : "Save & Complete"}
            </button>
          </div>
        </div>
      )}

      {/* Items Table (read-only) */}
      {!completeMode && (
        <>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0176d3", marginBottom: 8 }}>Stock Opname Items</div>
          <div style={{ border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={S.th}>No</th>
                  <th style={S.th}>SKU</th>
                  <th style={S.th}>Product</th>
                  <th style={{ ...S.th, textAlign: "right" }}>System Stock</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Counted Stock</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Difference</th>
                  <th style={S.th}>Reason</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any, idx: number) => {
                  const diff = (item.physicalQty || 0) - (item.systemQty || 0);
                  return (
                    <tr key={item.id || idx}>
                      <td style={S.td}>{idx + 1}</td>
                      <td style={{ ...S.td, color: "#0176d3", fontWeight: 500 }}>{item.sparepart?.sku || "-"}</td>
                      <td style={S.td}>{item.sparepart?.name || "-"}</td>
                      <td style={{ ...S.td, textAlign: "right", background: "#f9f9f9" }}>{item.systemQty}</td>
                      <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{item.physicalQty}</td>
                      <td style={{ ...S.td, textAlign: "right", fontWeight: 600, color: diff !== 0 ? "#ea001e" : "#2e844a" }}>
                        {diff > 0 ? `+${diff}` : diff}
                      </td>
                      <td style={S.td}>{item.reason || "-"}</td>
                    </tr>
                  );
                })}
                {items.length === 0 && (
                  <tr><td colSpan={7} style={{ ...S.td, textAlign: "center", color: "#8e8f8e" }}>No items</td></tr>
                )}
              </tbody>
              <tfoot>
                <tr style={{ fontWeight: 700, borderTop: "2px solid #001526" }}>
                  <td colSpan={3} style={{ ...S.td, textAlign: "right" }}>Total</td>
                  <td style={{ ...S.td, textAlign: "right" }}>{totalSystem}</td>
                  <td style={{ ...S.td, textAlign: "right" }}>{totalPhysical}</td>
                  <td style={{ ...S.td, textAlign: "right", color: totalAdj !== 0 ? "#ea001e" : "#2e844a" }}>
                    {totalAdj > 0 ? `+${totalAdj}` : totalAdj}
                  </td>
                  <td style={S.td}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

      {/* Confirm Modal */}
      {confirmAction && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, maxWidth: 420, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.16)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#001526", marginBottom: 12 }}>
              {confirmAction === "cancel" ? "Cancel Stock Opname?" : "Confirm Action?"}
            </h3>
            <p style={{ fontSize: 14, color: "#444746", marginBottom: 20 }}>
              {confirmAction === "cancel" ? "Stock opname akan dibatalkan." : "Lanjutkan aksi ini?"}
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setConfirmAction(null)} className="btn btn--sm">Batal</button>
              <button onClick={() => doAction(confirmAction)} className="btn btn--sm"
                style={{ background: confirmAction === "cancel" ? "#ea001e" : "#0176d3", color: "#fff" }}>Ya, Lanjut</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function F({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: "#001526" }}>{value}</div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  th: { padding: "8px 10px", textAlign: "left" as const, fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", background: "#fff", borderBottom: "1px solid #ecebea" },
  td: { padding: "8px 10px", borderBottom: "1px solid #f0f0f0", color: "#001526", background: "#fff" },
};
