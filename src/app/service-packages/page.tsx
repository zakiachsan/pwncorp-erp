"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Wrench, Star, Download, Search, Plus } from "lucide-react";

interface ServicePackage {
  id: string;
  sku: string;
  name: string;
  description?: string;
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

  useEffect(() => {
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
  }, []);

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
        <button
          className="btn btn--brand btn--sm"
          style={{ background: "#014486" }}
          onClick={() => router.push("/service-packages/new")}
        >
          <Plus size={14} /> New Package Service
        </button>
      </div>

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
          <div className="form-group" style={{ flex: "0 0 auto" }}>
            <label className="form-label">&nbsp;</label>
            <button className="btn btn--sm" style={{ minWidth: 110, justifyContent: "center" }}>
              <Download size={14} /> Download
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
    </div>
  );
}
