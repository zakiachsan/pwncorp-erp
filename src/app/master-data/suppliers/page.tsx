"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Download, Upload, X } from "lucide-react";
import { exportToCsv, parseCsv, validateRows, mapRowToApi, makeFilename, downloadTemplate, supplierColumns } from "@/lib/csv-utils";

interface Supplier {
  id: string;
  companyName: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address: string;
  storeId: string;
  _count?: { spareparts: number; purchaseOrders: number };
}

export default function SuppliersPage() {
  const router = useRouter();
  const [data, setData] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
    if (search) params.set("search", search);
    const qs = params.toString();
    fetch(`/api/suppliers${qs ? "?" + qs : ""}`)
      .then((r) => r.json())
      .then((json) => { setData(json.data || []); setLoading(false); })
      .catch(() => { setError("Failed to load suppliers"); setLoading(false); });
  };

  useEffect(() => { fetchData(); }, [search]);

  const handleExport = () => {
    exportToCsv(data, supplierColumns, makeFilename("suppliers"));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportResult(null);

    const result = await parseCsv(file);
    if (result.error) {
      alert("CSV Error: " + result.error);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    const validation = validateRows(result.rows, supplierColumns);
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

    for (const row of importState.valid) {
      const payload = mapRowToApi(row, supplierColumns);
      try {
        const res = await fetch("/api/suppliers", {
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
    setImportResult({ success, failed, skipped: importState.skipped.length });
    if (success > 0) fetchData();
  };

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <SupplierIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Suppliers
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleExport} className="btn btn--sm">
            <Download size={14} /> Export
          </button>
          <button onClick={() => setShowImportModal(true)} className="btn btn--sm">
            <Upload size={14} /> Import
          </button>
          <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleFileSelect} />
          <button onClick={() => router.push("/master-data/suppliers/new")} className="btn btn--brand btn--sm">
            <Plus size={14} /> Add Supplier
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
            <label className="form-label">Cari</label>
            <input type="text" className="form-input" placeholder="Nama / No. Telp..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn--brand btn--sm flex-1 justify-center">
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
                <th>ID</th>
                <th>Nama Supplier</th>
                <th>Telepon</th>
                <th>Alamat</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-[--color-text-secondary]">No suppliers found</td>
                </tr>
              )}
              {data.map((s) => (
                <tr key={s.id} className="cursor-pointer hover:bg-[#f0f7ff] transition-colors" onClick={() => router.push(`/master-data/suppliers/${s.id}`)}>
                  <td className="font-medium text-[--color-brand]">{s.id}</td>
                  <td className="font-medium">{s.companyName}</td>
                  <td>{s.phone}</td>
                  <td className="text-[--color-text-secondary]">{s.address}</td>
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
                    {supplierColumns.map((c) => <th key={c.key}>{c.header}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {importState.preview.map((row, i) => (
                    <tr key={i}>
                      {supplierColumns.map((c) => <td key={c.key}>{row[c.header] || "—"}</td>)}
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
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#001526" }}>Import Supplier</h3>
              <button onClick={() => setShowImportModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#666" }}><X size={18} /></button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Download Template */}
              <div style={{ padding: 16, background: "#f8f9fa", borderRadius: 8, border: "1px solid #e9ecef" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#001526", marginBottom: 8 }}>1. Download Template</div>
                <p style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>Download template CSV dengan format yang benar untuk import data.</p>
                <button onClick={() => downloadTemplate(supplierColumns, "supplier")} className="btn btn--sm" style={{ background: "#0176d3", color: "#fff" }}>
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

function SupplierIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 3h5v5" /><path d="M8 3H3v5" /><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3" /><path d="m15 9 6-6" />
    </svg>
  );
}
