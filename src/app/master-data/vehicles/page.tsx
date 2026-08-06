"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Download, Upload, X } from "lucide-react";
import { validateRows, mapRowToApi, vehicleColumns } from "@/lib/csv-utils";
import { exportDataToExcel, parseExcelFile, makeFilename, downloadTemplate } from "@/lib/excel-utils";

interface Vehicle {
  id: string;
  plateNo: string;
  brand: string;
  model: string;
  year: string;
  color?: string;
  customerId: string;
  customer: { id: string; name: string } | null;
}

export default function VehiclesPage() {
  const router = useRouter();
  const [data, setData] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [brandFilter, setBrandFilter] = useState("All");
  const [search, setSearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [importState, setImportState] = useState<{
    open: boolean;
    preview: Record<string, string>[];
    total: number;
    valid: Record<string, string>[];
    skipped: { row: number; reason: string }[];
  }>({ open: false, preview: [], total: 0, valid: [], skipped: [] });
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number; skipped: number } | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (brandFilter !== "All") params.set("search", brandFilter);
    if (search) params.set("search", search);
    const qs = params.toString();
    fetch(`/api/vehicles${qs ? "?" + qs : ""}`)
      .then((r) => r.json())
      .then((json) => { setData(json.data || []); setLoading(false); })
      .catch(() => { setError("Failed to load vehicles"); setLoading(false); });
  };

  useEffect(() => { fetchData(); }, [brandFilter, search]);

  const handleClickPlate = (e: React.MouseEvent, plateNo: string) => {
    e.stopPropagation();
    router.push(`/master-data/vehicles/${encodeURIComponent(plateNo)}`);
  };

  const handleClickCustomer = (e: React.MouseEvent, customerId: string) => {
    e.stopPropagation();
    router.push(`/master-data/customers/${customerId}`);
  };

  const handleExport = () => {
    const exportData = data.map((v) => ({
      ...v,
      customerName: v.customer?.name || "",
    }));
    exportDataToExcel(exportData, vehicleColumns, makeFilename("vehicles"));
  };

  const lookupCustomer = async (name: string): Promise<string | null> => {
    try {
      const res = await fetch(`/api/customers?search=${encodeURIComponent(name)}&limit=1`);
      const json = await res.json();
      if (json.data?.length > 0 && json.data[0].name.toLowerCase() === name.toLowerCase()) {
        return json.data[0].id;
      }
    } catch {}
    return null;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportResult(null);

    const result = await parseExcelFile(file);
    if (result.error) {
      alert("CSV Error: " + result.error);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    const validation = validateRows(result.rows, vehicleColumns);
    setImportState({
      open: true,
      preview: validation.valid.slice(0, 5),
      total: result.rows.length,
      valid: validation.valid,
      skipped: validation.skipped,
    });

    if (fileRef.current) fileRef.current.value = "";
  };

  const handleImportConfirm = async () => {
    setImporting(true);
    let success = 0;
    let failed = 0;
    const allSkipped = [...importState.skipped];

    for (let i = 0; i < importState.valid.length; i++) {
      const row = importState.valid[i];
      const payload = mapRowToApi(row, vehicleColumns);

      // Lookup customer by name if provided
      if (row["Customer Name"] && !payload.customerId) {
        const customerId = await lookupCustomer(row["Customer Name"]);
        if (customerId) {
          payload.customerId = customerId;
        } else {
          allSkipped.push({ row: i + 2, reason: `Customer "${row["Customer Name"]}" not found` });
          failed++;
          continue;
        }
      }

      // Remove non-API fields
      delete payload.customerName;
      delete payload.color;

      try {
        const res = await fetch("/api/vehicles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) success++;
        else failed++;
      } catch {
        failed++;
      }
    }

    setImporting(false);
    setImportState({ open: false, preview: [], total: 0, valid: [], skipped: [] });
    setImportResult({ success, failed, skipped: allSkipped.length });
    if (success > 0) fetchData();
  };

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <CarIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Vehicles
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleExport} className="btn btn--sm">
            <Download size={14} /> Export
          </button>
          <button onClick={() => setShowImportModal(true)} className="btn btn--sm">
            <Upload size={14} /> Import
          </button>
          <input ref={fileRef} type="file" accept=".csv,.xls,.xlsx" style={{ display: "none" }} onChange={handleFileSelect} />
          <button onClick={() => router.push("/master-data/vehicles/new")} className="btn btn--brand btn--sm">
            <Plus size={14} /> Add Vehicle
          </button>
        </div>
      </div>

      {importResult && (
        <div style={{ padding: "10px 16px", marginBottom: 12, borderRadius: 8, background: importResult.failed > 0 ? "#fff3e0" : "#e8f5e9", border: `1px solid ${importResult.failed > 0 ? "#ffb74d" : "#81c784"}`, fontSize: 13 }}>
          <strong>Import Result:</strong> {importResult.success} rows imported, {importResult.skipped} rows skipped{importResult.failed > 0 ? `, ${importResult.failed} failed` : ""}
          <button onClick={() => setImportResult(null)} style={{ marginLeft: 12, background: "none", border: "none", cursor: "pointer", color: "#666" }}><X size={14} /></button>
        </div>
      )}

      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="form-group">
            <label className="form-label">Merk</label>
            <select className="form-select" value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}>
              <option value="All">All Brands</option>
              <option>Toyota</option>
              <option>Honda</option>
              <option>Mitsubishi</option>
              <option>Suzuki</option>
              <option>Daihatsu</option>
              <option>Isuzu</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cari</label>
            <input type="text" className="form-input" placeholder="Plat Nomor / Nama Customer..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn--brand btn--sm flex-1 justify-center" onClick={() => {}}>
              <Search size={14} /> Cari
            </button>
          </div>
        </div>
      </div>

      {loading && <div className="p-8 text-center text-[--color-text-secondary]">Loading...</div>}
      {error && <div className="p-8 text-center text-red-500">{error}</div>}

      {!loading && !error && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Plat Nomor</th>
                <th>Merk</th>
                <th>Model</th>
                <th>Tahun</th>
                <th>Customer</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-[--color-text-secondary]">No vehicles found</td>
                </tr>
              )}
              {data.map((v) => (
                <tr key={v.id} className="hover:bg-[#f0f7ff] transition-colors">
                  <td
                    className="font-medium"
                    style={{ color: "#0176d3", cursor: "pointer" }}
                    onClick={(e) => handleClickPlate(e, v.plateNo)}
                  >
                    {v.plateNo}
                  </td>
                  <td className="font-medium">{v.brand}</td>
                  <td>{v.model}</td>
                  <td>{v.year}</td>
                  <td
                    className="font-medium"
                    style={{ color: "#0176d3", cursor: "pointer" }}
                    onClick={(e) => handleClickCustomer(e, v.customerId)}
                  >
                    {v.customer?.name || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Import Preview Modal */}
      {importState.open && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: 12, padding: 24, maxWidth: 800, width: "90%", maxHeight: "80vh", overflow: "auto" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Import Preview</h3>
            <p style={{ fontSize: 13, color: "#444746", marginBottom: 12 }}>
              Total rows: <strong>{importState.total}</strong> | Valid: <strong>{importState.valid.length}</strong> | Skipped: <strong>{importState.skipped.length}</strong>
            </p>

            {importState.skipped.length > 0 && (
              <div style={{ marginBottom: 12, padding: 10, background: "#fff3e0", borderRadius: 8, fontSize: 12, maxHeight: 100, overflow: "auto" }}>
                <strong>Skipped rows:</strong>
                {importState.skipped.map((s, i) => (
                  <div key={i}>Row {s.row}: {s.reason}</div>
                ))}
              </div>
            )}

            <div className="table-wrap" style={{ marginBottom: 16 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    {vehicleColumns.map((c) => <th key={c.key}>{c.header}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {importState.preview.map((row, i) => (
                    <tr key={i}>
                      {vehicleColumns.map((c) => <td key={c.key}>{row[c.header] || "—"}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn--sm" onClick={() => setImportState({ open: false, preview: [], total: 0, valid: [], skipped: [] })} disabled={importing}>
                Cancel
              </button>
              <button className="btn btn--brand btn--sm" onClick={handleImportConfirm} disabled={importing || importState.valid.length === 0}>
                {importing ? "Importing..." : `Import ${importState.valid.length} rows`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, maxWidth: 480, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.16)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#001526" }}>Import Vehicle</h3>
              <button onClick={() => setShowImportModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#666" }}><X size={18} /></button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Download Template */}
              <div style={{ padding: 16, background: "#f8f9fa", borderRadius: 8, border: "1px solid #e9ecef" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#001526", marginBottom: 8 }}>1. Download Template</div>
                <p style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>Download template CSV dengan format yang benar untuk import data.</p>
                <button onClick={() => downloadTemplate(vehicleColumns, "vehicle")} className="btn btn--sm" style={{ background: "#0176d3", color: "#fff" }}>
                  <Download size={14} /> Download Template
                </button>
              </div>

              {/* Import File */}
              <div style={{ padding: 16, background: "#f8f9fa", borderRadius: 8, border: "1px solid #e9ecef" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#001526", marginBottom: 8 }}>2. Import File</div>
                <p style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>Pilih file CSV yang sudah diisi sesuai template.</p>
                <button onClick={() => { setShowImportModal(false); fileRef.current?.click(); }} className="btn btn--brand btn--sm">
                  <Upload size={14} /> Pilih File CSV
                </button>
              </div>
            </div>

            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setShowImportModal(false)} className="btn btn--sm">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" />
    </svg>
  );
}
