"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, Star, GitCompare } from "lucide-react";

interface PRRow {
  id: string;
  prNo: string;
  date: string;
  itemCount: number;
  quoteCount: number;
  selectedVendor: string | null;
  status: string;
}

export default function PembandingListPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<PRRow[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/purchase-requests?limit=100").then((r) => r.json()),
      fetch("/api/vendor-quotes").then((r) => r.json()),
    ])
      .then(([prJson, quoteJson]) => {
        const prs = prJson.data || [];
        const quotes = quoteJson.data || [];
        const mapped: PRRow[] = prs.map((pr: any) => {
          const prQuotes = quotes.filter((q: any) => q.prId === pr.id);
          const selected = prQuotes.find((q: any) => q.isSelected);
          return {
            id: pr.id,
            prNo: pr.prNo,
            date: pr.date ? new Date(pr.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-",
            itemCount: pr._count?.items || 0,
            quoteCount: prQuotes.length,
            selectedVendor: selected?.supplier?.companyName || null,
            status: selected ? "Sudah Dipilih" : prQuotes.length > 0 ? "Menunggu Pilihan" : "Belum Ada Quote",
          };
        });
        setRows(mapped);
        setLoading(false);
      })
      .catch(() => { setError("Gagal memuat data"); setLoading(false); });
  }, []);

  const filtered = rows.filter((r) =>
    r.prNo.toLowerCase().includes(search.toLowerCase()) ||
    (r.selectedVendor || "").toLowerCase().includes(search.toLowerCase())
  );

  const statusStyle = (s: string) => {
    if (s === "Sudah Dipilih") return "pill pill--completed";
    if (s === "Menunggu Pilihan") return "pill pill--pending";
    return "pill pill--draft";
  };

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <GitCompare className="w-6 h-6 text-[--color-brand-secondary]" />
          Pembanding Harga Vendor
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 ml-1" />
        </div>
      </div>

      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="form-group">
            <label className="form-label">Cari</label>
            <input type="text" className="form-input" placeholder="PR No / Vendor..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn--brand btn--sm flex-1 justify-center"><Search size={14} /> Cari</button>
          </div>
        </div>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="p-8 text-center text-[--color-text-secondary]">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>PR No</th>
                <th>Date</th>
                <th className="text-center">Items</th>
                <th className="text-center">Vendor Quotes</th>
                <th>Vendor Dipilih</th>
                <th className="text-center">Status</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td className="font-medium">{r.prNo}</td>
                  <td>{r.date}</td>
                  <td className="text-center">{r.itemCount}</td>
                  <td className="text-center">{r.quoteCount}</td>
                  <td>{r.selectedVendor || "-"}</td>
                  <td className="text-center"><span className={statusStyle(r.status)}>{r.status}</span></td>
                  <td className="text-center">
                    <button onClick={() => router.push(`/warehouse/pembanding/${r.id}`)} className="btn btn--brand btn--sm">
                      <GitCompare size={12} /> Compare
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-[--color-text-secondary]">Tidak ada data</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
