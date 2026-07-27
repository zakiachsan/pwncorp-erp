"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Wrench, Star, Download, Upload, Search, Plus, X } from "lucide-react";
import { exportToCsv, parseCsv, validateRows, mapRowToApi, makeFilename, downloadTemplate, servicePackageColumns } from "@/lib/csv-utils";

interface ServicePackage {
  id: string;
  sku: string;
  name: string;
  description?: string;
  estDuration?: string;
  price: number;
  createdAt: string;
}

function formatRupiah(n: number): string {
  return "Rp " + n.toLocaleString("id-ID").replace(/,/g, ".");
}

export default function ServicePackagesPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
    fetch("/api/service-packages?limit=50")
      .then((r) => r.json())
      .then((json) => {
        setPackages(json.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal memuat data");
        setLoading(false);
      });
  };

  useEffect(() => { fetchData(); }, []);

  const handleExport = () => {
    exportToCsv(packages, servicePackageColumns, makeFilename("service-packages"));
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

    const validation = validateRows(result.rows, servicePackageColumns);
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
      const payload = mapRowToApi(row, servicePackageColumns);
      try {
        const res = await fetch("/api/service-packages", {
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

  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div>
      {/* ── Header ── */}
      <div className="view-header">
        <div className="view-title">
          <Wrench className="w-6 h-6 text-[--color-brand-secondary]" />
          Package Services
          <Star className="w-5 h-5 text-[--color-brand-secondary] ml-1" />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleExport} className="btn btn--sm">
            <Download size={14} /> Export
          </button>
          <button onClick={() => setShowImportModal(true)} className="btn btn--sm">
            <Upload size={14} /> Import
          </button>
          <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleFileSelect} />
          <button
            className="btn btn--brand btn--sm"
            style={{ background: "#014486" }}
            onClick={() => router.push("/service-packages/new")}
          >
            <Plus size={14} /> New Package Service
          </button>
        </div>
      </div>

      {importResult && (
        <div style={{ padding: "10px 16px", marginBottom: 12, borderRadius: 8, background: importResult.failed > 0 ? "#fff3e0" : "#e8f5e9", border: `1px solid ${importResult.failed > 0 ? "#ffb74d" : "#81c784"}`, fontSize: 13 }}>
          <strong>Import Result:</strong> {importResult.success} rows imported, {importResult.skipped} rows skipped{importResult.failed > 0 ? `, ${importResult.failed} failed` : ""}
          <button onClick={() => setImportResult(null)} style={{ marginLeft: 12, background: "none", border: "none", cursor: "pointer", color: "#666" }}><X size={14} /></button>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex border-b border-[--color-border-light] mb-4 overflow-x-auto" style={{ gap: 0 }}>
        <button className="px-4 py-3 text-sm border-b-2 text-[--color-brand] border-[--color-brand] font-semibold">
          Active
        </button>
        <button className="px-4 py-3 text-sm border-b-2 text-[--color-text-secondary] border-transparent hover:text-[--color-brand] transition-colors">
          Inactive
        </button>
      </div>

      {/* ── Filter Section ── */}
      <div className="filter-section">
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", marginBottom: 16 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">SKU</label>
            <input type="text" className="form-input" placeholder="Cari SKU..." />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Name</label>
            <input type="text" className="form-input" placeholder="Cari nama paket..." />
          </div>
          <div className="form-group" style={{ flex: "0 0 auto" }}>
            <label className="form-label">&nbsp;</label>
            <button className="btn btn--sm" style={{ minWidth: 100, justifyContent: "center" }}>
              <Search size={14} /> Search
            </button>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="table-wrap">
        {loading ? (
          <div className="p-8 text-center text-[--color-text-secondary]">Loading...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ minWidth: 180 }}>SKU <span style={{ fontSize: 10, marginLeft: 4 }}>▲</span></th>
                <th style={{ minWidth: 280 }}>Name</th>
                <th style={{ minWidth: 200 }}>Description</th>
                <th style={{ textAlign: "center", width: 120 }}>Is Open Package</th>
                <th style={{ textAlign: "center", width: 160 }}>Estimated Time</th>
                <th style={{ textAlign: "center", width: 80 }}>Tax</th>
                <th style={{ textAlign: "right", width: 180 }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => (
                <tr
                  key={pkg.id}
                  className="cursor-pointer hover:bg-[#f0f7ff] transition-colors"
                  onClick={() => router.push(`/service-packages/${pkg.sku}`)}
                >
                  <td className="font-medium" style={{ color: "#0176d3" }}>{pkg.sku}</td>
                  <td className="font-medium" style={{ color: "#0176d3" }}>{pkg.name}</td>
                  <td style={{ color: "#444746" }}>{pkg.description || "—"}</td>
                  <td style={{ textAlign: "center" }}>
                    <span style={{ color: "#ea001e", fontSize: 18, fontWeight: 700 }}>✗</span>
                  </td>
                  <td style={{ textAlign: "center", color: "#444746" }}>—</td>
                  <td style={{ textAlign: "center", color: "#444746" }}>PPN</td>
                  <td className="font-medium" style={{ textAlign: "right" }}>{formatRupiah(pkg.price)}</td>
                </tr>
              ))}
              {packages.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-[--color-text-secondary]">Tidak ada data</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, color: "#444746", fontSize: 13 }}>
        <div>Showing 1 — {packages.length} of {packages.length}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn--sm" disabled style={{ opacity: 0.4 }}>Prev</button>
          <button className="btn btn--sm">Next</button>
        </div>
      </div>

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
                    {servicePackageColumns.map((c) => <th key={c.key}>{c.header}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {importState.preview.map((row, i) => (
                    <tr key={i}>
                      {servicePackageColumns.map((c) => <td key={c.key}>{row[c.header] || "—"}</td>)}
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
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#001526" }}>Import Package Service</h3>
              <button onClick={() => setShowImportModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#666" }}><X size={18} /></button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Download Template */}
              <div style={{ padding: 16, background: "#f8f9fa", borderRadius: 8, border: "1px solid #e9ecef" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#001526", marginBottom: 8 }}>1. Download Template</div>
                <p style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>Download template CSV dengan format yang benar untuk import data.</p>
                <button onClick={() => downloadTemplate(servicePackageColumns, "package_service")} className="btn btn--sm" style={{ background: "#0176d3", color: "#fff" }}>
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
