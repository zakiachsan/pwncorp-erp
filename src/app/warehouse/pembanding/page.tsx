"use client";

// TODO: Replace hardcoded data with API call when /api/pembanding endpoint is available
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, Star, GitCompare } from "lucide-react";

const comparisons = [
  { id: "CMP/WM/26060001", date: "24 Jun 2026", refNo: "PRQ/HO/26010014", vendorCount: 3, selectedVendor: "PT Auto Parts Sejahtera", status: "Sudah Dipilih" },
  { id: "CMP/WM/26060002", date: "24 Jun 2026", refNo: "PRQ/HO/26010013", vendorCount: 2, selectedVendor: null, status: "Belum Dipilih" },
  { id: "CMP/WM/26060003", date: "25 Jun 2026", refNo: "PRQ/HO/26010012", vendorCount: 4, selectedVendor: "CV Suku Cadang Jaya", status: "Sudah Dipilih" },
  { id: "CMP/WM/26060004", date: "25 Jun 2026", refNo: "PRQ/HO/26010011", vendorCount: 3, selectedVendor: null, status: "Belum Dipilih" },
  { id: "CMP/WM/26060005", date: "26 Jun 2026", refNo: "PRQ/HO/26010010", vendorCount: 2, selectedVendor: "UD Sparepart Berkah", status: "Sudah Dipilih" },
  { id: "CMP/WM/26060006", date: "26 Jun 2026", refNo: "PRQ/HO/26010009", vendorCount: 5, selectedVendor: null, status: "Belum Dipilih" },
  { id: "CMP/WM/26060007", date: "27 Jun 2026", refNo: "PRQ/HO/26010008", vendorCount: 3, selectedVendor: "PT Maju Motor Indonesia", status: "Sudah Dipilih" },
  { id: "CMP/WM/26060008", date: "27 Jun 2026", refNo: "PRQ/HO/26010007", vendorCount: 2, selectedVendor: null, status: "Belum Dipilih" },
  { id: "CMP/WM/26060009", date: "28 Jun 2026", refNo: "PRQ/HO/26010006", vendorCount: 3, selectedVendor: "PT Auto Parts Sejahtera", status: "Sudah Dipilih" },
  { id: "CMP/WM/26060010", date: "28 Jun 2026", refNo: "PRQ/HO/26010005", vendorCount: 2, selectedVendor: null, status: "Belum Dipilih" },
];

const statusPill = (status: string) => {
  if (status === "Sudah Dipilih") return { background: "var(--color-success)", color: "#fff" };
  return { background: "var(--color-warning)", color: "#fff" };
};

export default function PembandingListPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Attempt to fetch from API; no dedicated endpoint exists yet
  useEffect(() => {
    fetch("/api/reports/service?report=summary-invoices&limit=10")
      .then((r) => r.json())
      .then(() => {
        // TODO: Replace with /api/pembanding when available
        // For now, keep hardcoded data as-is
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, []);

  const filtered = comparisons.filter((c) =>
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.refNo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="view-header">
        <div className="view-title">
          <GitCompare className="w-6 h-6 text-[--color-brand-secondary]" />
          Pembanding Harga Vendor
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 ml-1" />
        </div>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="form-group">
            <label className="form-label">Ref Code</label>
            <input type="text" className="form-input" placeholder="CMP/WM/..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Reference No</label>
            <input type="text" className="form-input" placeholder="PRQ/HO/..." />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select">
              <option>All Status</option>
              <option>Sudah Dipilih</option>
              <option>Belum Dipilih</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <div className="flex gap-2">
              <button className="btn btn--brand btn--sm flex-1 justify-center">
                <Search size={14} /> Cari
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th className="text-left text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide">Ref Code</th>
              <th className="text-left text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide">Date</th>
              <th className="text-left text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide">Reference No</th>
              <th className="text-center text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide">Vendor</th>
              <th className="text-left text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide">Vendor Dipilih</th>
              <th className="text-center text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td>
                  <span
                    className="font-medium cursor-pointer"
                    style={{ color: "var(--color-brand)" }}
                    onClick={() => router.push(`/warehouse/pembanding/${c.id}`)}
                  >
                    {c.id}
                  </span>
                </td>
                <td className="text-[--color-text-secondary]">{c.date}</td>
                <td>
                  <span
                    className="font-medium cursor-pointer"
                    style={{ color: "var(--color-brand)" }}
                    onClick={() => router.push(`/warehouse/purchase-request/${c.refNo}`)}
                  >
                    {c.refNo}
                  </span>
                </td>
                <td className="text-center">{c.vendorCount}</td>
                <td>{c.selectedVendor || "-"}</td>
                <td className="text-center">
                  <span className="pill" style={statusPill(c.status)}>{c.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
