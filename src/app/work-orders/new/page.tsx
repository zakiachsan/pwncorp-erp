"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, Wrench, X } from "lucide-react";

const fmt = (n: number) => (n || 0).toLocaleString("id-ID");

export default function NewWorkOrderPage() {
  const router = useRouter();
  const [so, setSo] = useState<any>(null);
  const [mekanikList, setMekanikList] = useState<any[]>([]);
  const [sparepartList, setSparepartList] = useState<any[]>([]);
  const [mekanikId, setMekanikId] = useState("");
  const [serviceMekaniks, setServiceMekaniks] = useState<Record<number, string>>({});
  const [serviceSpareparts, setServiceSpareparts] = useState<Record<number, string[]>>({});
  const [targetDate, setTargetDate] = useState("");
  const [targetTime, setTargetTime] = useState("");
  const [customerWaiting, setCustomerWaiting] = useState("no");
  const [removedServiceIds, setRemovedServiceIds] = useState<Set<string>>(new Set());
  const [removedSparepartIds, setRemovedSparepartIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sroId = params.get("sroId");
    if (!sroId) { setError("sroId tidak ditemukan"); setLoading(false); return; }

    Promise.all([
      fetch(`/api/service-orders/${sroId}`).then(r => r.json()),
      fetch("/api/users?limit=100").then(r => r.json()),
      fetch("/api/spareparts?limit=200").then(r => r.json()),
    ]).then(([soJson, usersJson, sparepartsJson]) => {
      if (soJson.error) { setError(soJson.error); setLoading(false); return; }
      setSo(soJson.data);
      const mekaniks = (usersJson.data || []).filter((u: any) => u.role?.name === "Mekanik" || u.role === "Mekanik");
      setMekanikList(mekaniks);
      setSparepartList(sparepartsJson.data || []);
      setLoading(false);
    }).catch(() => { setError("Gagal load data"); setLoading(false); });
  }, []);

  const handleSave = async () => {
    if (!so) return;
    setSaving(true);
    setError("");
    try {
      // Compute remaining (not removed) item IDs
      const allServiceIds = (so.services || []).map((sv: any) => sv.serviceId);
      const allSparepartIds = (so.spareparts || []).map((sp: any) => sp.sparepartId);
      const serviceIds = allServiceIds.filter((id: string) => !removedServiceIds.has(id));
      const sparepartIds = allSparepartIds.filter((id: string) => !removedSparepartIds.has(id));

      const res = await fetch("/api/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          soId: so.id,
          mekanikId: mekanikId || null,
          targetDate: targetDate || null,
          targetTime: targetTime || null,
          customerWaiting: customerWaiting === "yes",
          serviceMekaniks: Object.keys(serviceMekaniks).length > 0 ? serviceMekaniks : undefined,
          serviceSpareparts: Object.keys(serviceSpareparts).length > 0 ? serviceSpareparts : undefined,
          serviceIds,
          sparepartIds,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Gagal membuat WO"); setSaving(false); return; }
      router.push(`/work-orders/detail/${json.data.woNo}`);
    } catch { setError("Gagal membuat WO"); setSaving(false); }
  };

  const addSparepart = (serviceIdx: number, sparepartId: string) => {
    if (!sparepartId) return;
    setServiceSpareparts(prev => {
      const current = prev[serviceIdx] || [];
      if (current.includes(sparepartId)) return prev;
      return { ...prev, [serviceIdx]: [...current, sparepartId] };
    });
  };

  const removeSparepart = (serviceIdx: number, sparepartId: string) => {
    setServiceSpareparts(prev => {
      const current = prev[serviceIdx] || [];
      return { ...prev, [serviceIdx]: current.filter((id: string) => id !== sparepartId) };
    });
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!so) return null;

  // Items already used in OTHER work orders (exclude Cancelled)
  const activeWOs = (so.workOrders || []).filter((wo: any) => wo.status !== "Cancelled");
  const usedServiceIds = new Set<string>();
  const usedSparepartIds = new Set<string>();
  for (const wo of activeWOs) {
    for (const item of (wo.items || [])) {
      if (item.itemType === "service" || item.itemType === "sublet" || item.itemType === "sundry") usedServiceIds.add(item.itemId);
      if (item.itemType === "sparepart") usedSparepartIds.add(item.itemId);
    }
  }

  // Available = not used in other WOs AND not removed via x button
  const services = (so.services || []).filter((sv: any) => !usedServiceIds.has(sv.serviceId) && !removedServiceIds.has(sv.serviceId));
  const spareparts = (so.spareparts || []).filter((sp: any) => !usedSparepartIds.has(sp.sparepartId) && !removedSparepartIds.has(sp.sparepartId));

  return (
    <div>
      <div className="view-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="btn btn--sm"><ArrowLeft size={16} /></button>
          <div>
            <div className="view-title">New Work Order</div>
            <div className="text-xs text-[--color-text-secondary]">dari {so.soNo}</div>
          </div>
        </div>
      </div>

      {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      {/* SO Info Summary */}
      <div className="card-slds p-4 mb-4">
        <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-3">Service Order Info</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-[--color-text-secondary]">SRO Number</div>
            <div className="font-semibold text-sm">{so.soNo}</div>
          </div>
          <div>
            <div className="text-xs text-[--color-text-secondary]">Customer</div>
            <div className="font-semibold text-sm">{so.customer?.name || "-"}</div>
          </div>
          <div>
            <div className="text-xs text-[--color-text-secondary]">Vehicle</div>
            <div className="font-semibold text-sm">{so.vehicle?.plateNo || "-"} ({so.vehicle?.brand || ""} {so.vehicle?.model || ""})</div>
          </div>
          <div>
            <div className="text-xs text-[--color-text-secondary]">Complaint</div>
            <div className="font-semibold text-sm">{so.complaint || "-"}</div>
          </div>
          <div>
            <div className="text-xs text-[--color-text-secondary]">Color</div>
            <div className="font-semibold text-sm">{so.color || "-"}</div>
          </div>
          <div>
            <div className="text-xs text-[--color-text-secondary]">Odometer</div>
            <div className="font-semibold text-sm">{so.odometer || "-"}</div>
          </div>
        </div>
      </div>

      {/* WO Settings */}
      <div className="card-slds p-4 mb-4">
        <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-3">Work Order Settings</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Customer Waiting</label>
            <select className="form-select w-full" value={customerWaiting} onChange={e => setCustomerWaiting(e.target.value)}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
          <div>
            <label className="form-label">Target Date</label>
            <input type="date" className="form-input" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Target Time</label>
            <input type="time" className="form-input" value={targetTime} onChange={e => setTargetTime(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Items Preview */}
      <div className="card-slds p-4 mb-4">
        <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-3">Items dari SRO</div>
        {services.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-semibold text-[--color-text-secondary] mb-2">JASA / SERVICES</div>
            <div className="table-wrap" style={{ overflow: "visible" }}>
              <table className="data-table" style={{ overflow: "visible" }}>
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>Type</th>
                    <th>Service</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Unit Price</th>
                    <th className="text-right">Total</th>
                    <th>Mekanik / Supplier</th>
                    <th style={{ minWidth: 200 }}>Spareparts</th>
                    <th style={{ width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((s: any, i: number) => {
                    const isSublet = s.itemType === "Sublet" || s.itemType === "Sundry";
                    const supplierName = s.supplier?.companyName || s.supplierName || "-";
                    return (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>
                          {isSublet ? (
                            <span style={{
                              display: "inline-block", padding: "2px 6px", borderRadius: 3, fontSize: 10, fontWeight: 700,
                              background: s.itemType === "Sublet" ? "#dbeafe" : "#fef3c7",
                              color: s.itemType === "Sublet" ? "#0176d3" : "#b45309",
                              textTransform: "uppercase",
                            }}>{s.itemType}</span>
                          ) : (
                            <span style={{ fontSize: 10, color: "#8e8f8e", fontWeight: 600 }}>SVC</span>
                          )}
                        </td>
                        <td className="font-medium" style={{ color: "var(--color-brand)" }}>{s.service?.name || "-"}</td>
                        <td className="text-right">{s.qty || 1}</td>
                        <td className="text-right">{fmt(s.unitPrice || 0)}</td>
                        <td className="text-right font-semibold">{fmt(s.total || 0)}</td>
                        <td>
                          {isSublet ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                              <span style={{ fontSize: 11, color: "#8e8f8e", textTransform: "uppercase" }}>Dikerjakan oleh:</span>
                              <span style={{ fontSize: 12, fontWeight: 600, color: "#001526" }}>{supplierName}</span>
                            </div>
                          ) : (
                            <select className="form-select w-full" value={serviceMekaniks[i] || ""} onChange={e => setServiceMekaniks(prev => ({...prev, [i]: e.target.value}))}>
                              <option value="">-- Pilih Mekanik --</option>
                              {mekanikList.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                          )}
                        </td>
                        <td>
                          {/* Selected spareparts as tags */}
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 4 }}>
                            {(serviceSpareparts[i] || []).map((spId: string) => {
                              const sp = spareparts.find((s: any) => (s.sparepartId || s.sparepart?.id) === spId);
                              const name = sp?.sparepart?.name || sp?.name || spId;
                              return (
                                <span key={spId} style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 6px", background: "#e8f0fe", color: "#0176d3", borderRadius: 4, fontSize: 11, fontWeight: 500 }}>
                                  {name}
                                  <span onClick={() => removeSparepart(i, spId)} style={{ cursor: "pointer", fontWeight: 700, lineHeight: 1 }}>&times;</span>
                                </span>
                              );
                            })}
                          </div>
                          {/* Add sparepart dropdown */}
                          <select className="form-select w-full" value="" onChange={e => { addSparepart(i, e.target.value); e.target.value = ""; }}>
                            <option value="">+ Tambah Sparepart</option>
                            {spareparts.filter((sp: any) => {
                              const spId = sp.sparepartId || sp.sparepart?.id;
                              // Exclude spareparts selected in ANY row (including current)
                              return !Object.values(serviceSpareparts).flat().includes(spId);
                            }).map((sp: any) => {
                              const spId = sp.sparepartId || sp.sparepart?.id;
                              const spName = sp.sparepart?.name || sp.name || "-";
                              const spSku = sp.sparepart?.sku || sp.sku || "-";
                              return <option key={spId} value={spId}>{spSku} - {spName}</option>;
                            })}
                          </select>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            title="Buang dari SWO ini (akan tersedia di SWO berikutnya)"
                            onClick={() => setRemovedServiceIds(prev => new Set(prev).add(s.serviceId))}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#ea001e", padding: 4 }}
                          >
                            <X size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {spareparts.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-[--color-text-secondary] mb-2">SPAREPARTS</div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>Sparepart</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Unit Price</th>
                    <th className="text-right">Total</th>
                    <th style={{ width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {spareparts.map((s: any, i: number) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td className="font-medium" style={{ color: "var(--color-brand)" }}>{s.sparepart?.name || "-"}</td>
                      <td className="text-right">{s.qty || 1}</td>
                      <td className="text-right">{fmt(s.unitPrice || 0)}</td>
                      <td className="text-right font-semibold">{fmt(s.total || 0)}</td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          title="Buang dari SWO ini (akan tersedia di SWO berikutnya)"
                          onClick={() => setRemovedSparepartIds(prev => new Set(prev).add(s.sparepartId))}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#ea001e", padding: 4 }}
                        >
                          <X size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {services.length === 0 && spareparts.length === 0 && (
          <p className="text-sm text-[--color-text-secondary] text-center py-4">Tidak ada item di SRO ini</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 justify-end">
        <button className="btn btn--sm" onClick={() => router.back()} disabled={saving}>Batal</button>
        <button className="btn btn--brand btn--sm" onClick={handleSave} disabled={saving}>
          <Save size={14} /> {saving ? "Creating..." : "Create Work Order"}
        </button>
      </div>
    </div>
  );
}
