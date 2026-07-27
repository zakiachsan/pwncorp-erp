"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Package, Star, Download, Upload, Search, X } from "lucide-react";
import { exportToCsv, parseCsv, validateRows, mapRowToApi, makeFilename, downloadTemplate, sparepartColumns } from "@/lib/csv-utils";

interface Product {
  id: string;
  sku: string;
  name: string;
  code?: string;
  brand: string;
  type?: string;
  category?: string;
  sellPrice: number;
  stockQty: number;
  isBundle: boolean;
  supplier?: { id: string; companyName: string } | null;
}

function formatRupiah(n: number): string {
  return "Rp " + n.toLocaleString("id-ID").replace(/,/g, ".");
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "inactive">("active");
  const fileRef = useRef<HTMLInputElement>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number; skipped: number } | null>(null);
  const [importState, setImportState] = useState<{
    open: boolean;
    preview: Record<string, string>[];
    total: number;
    valid: Record<string, string>[];
    skipped: { row: number; reason: string }[];
  }>({ open: false, preview: [], total: 0, valid: [], skipped: [] });

  useEffect(() => {
    fetch("/api/spareparts?limit=50")
      .then((r) => r.json())
      .then((json) => {
        setProducts(json.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal memuat data");
        setLoading(false);
      });
  }, []);

  const handleExport = () => {
    const exportData = products.map((p) => ({
      ...p,
      supplierName: p.supplier?.companyName || "",
    }));
    exportToCsv(exportData, sparepartColumns, makeFilename("sparepart"));
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

    const validation = validateRows(result.rows, sparepartColumns);
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
      const payload = mapRowToApi(row, sparepartColumns);
      try {
        const res = await fetch("/api/spareparts", {
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

    // Refresh data
    fetch("/api/spareparts?limit=50")
      .then((r) => r.json())
      .then((json) => setProducts(json.data || []))
      .catch(() => {});
  };

  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const tabs = [
    { key: "active" as const, label: "Active" },
    { key: "inactive" as const, label: "Inactive" },
  ];

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <Package className="w-6 h-6 text-[--color-brand-secondary]" />
          Sparepart Catalog
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
          <button onClick={() => router.push("/master-data/sparepart/new")} className="btn btn--brand btn--sm">
            + Add Sparepart
          </button>
        </div>
      </div>

      {importResult && (
        <div style={{ padding: "10px 16px", marginBottom: 12, borderRadius: 8, background: importResult.failed > 0 ? "#fff3e0" : "#e8f5e9", border: `1px solid ${importResult.failed > 0 ? "#ffb74d" : "#81c784"}`, fontSize: 13 }}>
          <strong>Import Result:</strong> {importResult.success} rows imported, {importResult.skipped} rows skipped{importResult.failed > 0 ? `, ${importResult.failed} failed` : ""}
          <button onClick={() => setImportResult(null)} style={{ marginLeft: 12, background: "none", border: "none", cursor: "pointer", color: "#666" }}><X size={14} /></button>
        </div>
      )}

      <div className="flex border-b border-[--color-border-light] mb-4 gap-0 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.key
                ? "text-[--color-brand] border-[--color-brand] font-semibold"
                : "text-[--color-text-secondary] border-transparent hover:text-[--color-brand]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="form-group">
            <label className="form-label">SKU</label>
            <input type="text" className="form-input" placeholder="Search SKU..." />
          </div>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input type="text" className="form-input" placeholder="Product name..." />
          </div>
          <div className="form-group">
            <label className="form-label">Product Code</label>
            <input type="text" className="form-input" placeholder="Product code..." />
          </div>
          <div className="form-group">
            <label className="form-label">Product Brand</label>
            <select className="form-select">
              <option>All Brands</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Product Type</label>
            <select className="form-select">
              <option>All Types</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select">
              <option>All Categories</option>
            </select>
          </div>
          <div className="form-group flex items-end">
            <button className="btn btn--brand btn--sm w-full">
              <Search size={14} /> Search
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center">Loading...</div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>NAME</th>
                <th>BRAND</th>
                <th>CATEGORY</th>
                <th>STOCK</th>
                <th>PRICE</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="cursor-pointer" onClick={() => router.push(`/master-data/sparepart/${product.sku}`)}>
                  <td>{product.sku}</td>
                  <td>{product.name}</td>
                  <td>{product.brand}</td>
                  <td>{product.category || product.type || "-"}</td>
                  <td>{product.stockQty}</td>
                  <td>{formatRupiah(product.sellPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Import Preview Modal */}
      {importState.open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, maxWidth: 800, width: "95%", maxHeight: "85vh", overflow: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.16)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#001526", marginBottom: 16 }}>Import Preview</h3>
            <p style={{ fontSize: 13, color: "#444746", marginBottom: 12 }}>
              Total: {importState.total} rows | Valid: {importState.valid.length} | Skipped: {importState.skipped.length}
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
                    {sparepartColumns.map((c) => <th key={c.key}>{c.header}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {importState.preview.map((row, i) => (
                    <tr key={i}>
                      {sparepartColumns.map((c) => <td key={c.key}>{row[c.header] || "—"}</td>)}
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
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#001526" }}>Import Sparepart</h3>
              <button onClick={() => setShowImportModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#666" }}><X size={18} /></button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Download Template */}
              <div style={{ padding: 16, background: "#f8f9fa", borderRadius: 8, border: "1px solid #e9ecef" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#001526", marginBottom: 8 }}>1. Download Template</div>
                <p style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>Download template CSV dengan format yang benar untuk import data.</p>
                <button onClick={() => downloadTemplate(sparepartColumns, "sparepart")} className="btn btn--sm" style={{ background: "#0176d3", color: "#fff" }}>
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
