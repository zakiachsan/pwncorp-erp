"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, Wrench } from "lucide-react";

const fmt = (n: number) => (n || 0).toLocaleString("id-ID");

export default function NewWorkOrderPage() {
  const router = useRouter();
  const [so, setSo] = useState<any>(null);
  const [mekanikList, setMekanikList] = useState<any[]>([]);
  const [mekanikId, setMekanikId] = useState("");
  const [serviceMekaniks, setServiceMekaniks] = useState<Record<number, string>>({});
  const [targetDate, setTargetDate] = useState("");
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
    ]).then(([soJson, usersJson]) => {
      if (soJson.error) { setError(soJson.error); setLoading(false); return; }
      setSo(soJson.data);
      const mekaniks = (usersJson.data || []).filter((u: any) => u.role?.name === "Mekanik" || u.role === "Mekanik");
      setMekanikList(mekaniks);
      setLoading(false);
    }).catch(() => { setError("Gagal load data"); setLoading(false); });
  }, []);

  const handleSave = async () => {
    if (!so) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          soId: so.id,
          mekanikId: mekanikId || null,
          targetDate: targetDate || null,
          serviceMekaniks: Object.keys(serviceMekaniks).length > 0 ? serviceMekaniks : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Gagal membuat WO"); setSaving(false); return; }
      router.push(`/work-orders/${json.data.woNo}`);
    } catch { setError("Gagal membuat WO"); setSaving(false); }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!so) return null;

  const services = so.services || [];
  const spareparts = so.spareparts || [];

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Target Date</label>
            <input type="date" className="form-input" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Items Preview */}
      <div className="card-slds p-4 mb-4">
        <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-3">Items dari SRO</div>
        {services.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-semibold text-[--color-text-secondary] mb-2">JASA / SERVICES</div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>Service</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Unit Price</th>
                    <th className="text-right">Total</th>
                    <th>Mekanik</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((s: any, i: number) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td className="font-medium" style={{ color: "var(--color-brand)" }}>{s.service?.name || "-"}</td>
                      <td className="text-right">{s.qty || 1}</td>
                      <td className="text-right">{fmt(s.unitPrice || 0)}</td>
                      <td className="text-right font-semibold">{fmt(s.total || 0)}</td>
                      <td>
                        <select className="form-select w-full" value={serviceMekaniks[i] || ""} onChange={e => setServiceMekaniks(prev => ({...prev, [i]: e.target.value}))}>
                          <option value="">-- Pilih Mekanik --</option>
                          {mekanikList.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
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
