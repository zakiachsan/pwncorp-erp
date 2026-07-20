"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, Search, AlertTriangle } from "lucide-react";

interface ApiStockOpname {
  id: string;
  refCode: string;
  date: string;
  status: string;
  _count: { items: number };
}

interface StockOpnameRow {
  id: string;
  date: string;
  code: string;
  name: string;
  systemStock: number;
  actualStock: number;
  diff: number;
  reason: string;
  user: string;
}

export default function StockOpnamePage() {
  const router = useRouter();
  const [data, setData] = useState<StockOpnameRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [diffFilter, setDiffFilter] = useState("all");

  useEffect(() => {
    fetch("/api/stock-opnames?limit=1000")
      .then((r) => r.json())
      .then((j) => {
        const sessions: ApiStockOpname[] = j.data || [];
        if (sessions.length > 0) {
          // Map session-level data to item-level rows
          const rows: StockOpnameRow[] = sessions.map((s) => ({
            id: s.id,
            date: s.date || "-",
            code: s.refCode || "-",
            name: "-",
            systemStock: 0,
            actualStock: 0,
            diff: 0,
            reason: "-",
            user: "-",
          }));
          setData(rows);
        } else {
          setData([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal memuat data stock opname");
        setLoading(false);
      });
  }, []);

  const filtered = diffFilter === "selisih"
    ? data.filter((item) => item.diff !== 0)
    : diffFilter === "cocok"
    ? data.filter((item) => item.diff === 0)
    : data;

  const diffCount = data.filter((item) => item.diff !== 0).length;

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <StockIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Stock Opname
        </div>
        <button
          onClick={() => router.push("/inventory/stock-opname/new")}
          className="btn btn--brand btn--sm"
        >
          <Plus size={14} /> New Stock Opname
        </button>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="form-group">
            <label className="form-label">Kategori</label>
            <select className="form-select">
              <option>All Categories</option>
              <option>Oli</option>
              <option>Filter</option>
              <option>Rem</option>
              <option>Kelistrikan</option>
              <option>Mesin</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={diffFilter} onChange={(e) => setDiffFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="selisih">Selisih Only</option>
              <option value="cocok">Cocok</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cari</label>
            <input type="text" className="form-input" placeholder="Kode / Nama sparepart..." />
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn--brand btn--sm flex-1 justify-center">
              <Search size={14} /> Cari
            </button>
          </div>
        </div>
      </div>

      {/* Alert */}
      {diffCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-slds-md p-3 mb-4 flex items-center gap-2 text-amber-800 text-sm">
          <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
          <span><strong>{diffCount} items</strong> memiliki selisih stok dari stock opname terakhir</span>
        </div>
      )}

      {/* Table */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Kode</th>
              <th>Nama Sparepart</th>
              <th className="text-right">Stok Sistem</th>
              <th className="text-right">Stok Fisik</th>
              <th className="text-right">Selisih</th>
              <th>Alasan</th>
              <th>Diverifikasi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, i) => (
              <tr key={item.id || i} className="cursor-pointer hover:bg-[#f0f7ff] transition-colors">
                <td className="text-[--color-text-secondary]">{item.date}</td>
                <td className="font-medium text-[--color-brand]">{item.code}</td>
                <td>{item.name}</td>
                <td className="text-right">{item.systemStock}</td>
                <td className="text-right">{item.actualStock}</td>
                <td className="text-right">
                  <span className={item.diff !== 0 ? "font-semibold text-[--color-error]" : ""}>
                    {item.diff === 0 ? "0" : item.diff > 0 ? `+${item.diff}` : item.diff}
                  </span>
                </td>
                <td>{item.reason}</td>
                <td>{item.user}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" x2="12" y1="22.08" y2="12" />
    </svg>
  );
}
