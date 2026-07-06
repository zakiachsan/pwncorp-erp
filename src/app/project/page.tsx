"use client";

import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";

interface Project {
  id: string;
  noPesanan: string;
  name: string;
  customer: string;
  periode: string;
  totalAnggaran: number;
  totalRealisasi: number;
  status: string;
  sroCount: number;
  swoCount: number;
}

const projects: Project[] = [
  { id: "PRJ/001/26040410", noPesanan: "PO-2026-0012", name: "Service Berkala Fleet PT Maju Jaya", customer: "PT Maju Jaya", periode: "10 Apr — 10 Jun 2026", totalAnggaran: 35000000, totalRealisasi: 18000000, status: "Aktif", sroCount: 2, swoCount: 1 },
  { id: "PRJ/002/26050501", noPesanan: "PO-2026-0018", name: "Overhaul Mesin Isuzu Elf", customer: "PT Transport Jaya", periode: "01 Mei — 30 Jun 2026", totalAnggaran: 20500000, totalRealisasi: 12500000, status: "Aktif", sroCount: 1, swoCount: 1 },
  { id: "PRJ/003/26060601", noPesanan: "", name: "Perawatan Berkala Q3 2026", customer: "CV Berkah Abadi", periode: "01 Jun — 30 Sep 2026", totalAnggaran: 15000000, totalRealisasi: 0, status: "Aktif", sroCount: 1, swoCount: 0 },
  { id: "PRJ/004/26060620", noPesanan: "PO-2026-0025", name: "Ganti Oli & Tune Up Fleet", customer: "Budi Santoso", periode: "20 Jun — 27 Jun 2026", totalAnggaran: 2500000, totalRealisasi: 2500000, status: "Selesai", sroCount: 1, swoCount: 1 },
];

const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");
const fmtShort = (n: number) => {
  if (n >= 1000000) return `Rp ${(n / 1000000).toFixed(1)}jt`;
  return "Rp " + n.toLocaleString("id-ID");
};

const statusPill = (status: string) => {
  const map: Record<string, string> = {
    Aktif: "pill pill--in-progress",
    Selesai: "pill pill--completed",
    Ditunda: "pill pill--waiting",
    Batal: "pill pill--cancelled",
  };
  return map[status] || "pill pill--draft";
};

export default function ProjectListPage() {
  const router = useRouter();

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <BriefcaseIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Project
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/project/new")}
            className="btn btn--brand btn--sm"
          >
            <Plus size={14} /> New Project
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="card-slds" style={{ textAlign: "center" }}>
          <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Total Project</div>
          <div className="text-2xl font-bold text-[--color-text-primary]">{projects.length}</div>
        </div>
        <div className="card-slds" style={{ textAlign: "center" }}>
          <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Project Aktif</div>
          <div className="text-2xl font-bold" style={{ color: "var(--color-warning)" }}>{projects.filter(p => p.status === "Aktif").length}</div>
        </div>
        <div className="card-slds" style={{ textAlign: "center" }}>
          <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Total Anggaran</div>
          <div className="text-2xl font-bold text-[--color-brand]">{fmtShort(projects.reduce((s, p) => s + p.totalAnggaran, 0))}</div>
        </div>
        <div className="card-slds" style={{ textAlign: "center" }}>
          <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Total Realisasi</div>
          <div className="text-2xl font-bold" style={{ color: "var(--color-brand)" }}>{fmtShort(projects.reduce((s, p) => s + p.totalRealisasi, 0))}</div>
        </div>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select">
              <option>All Status</option>
              <option>Aktif</option>
              <option>Selesai</option>
              <option>Ditunda</option>
              <option>Batal</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Customer</label>
            <select className="form-select">
              <option>All Customer</option>
              <option>PT Maju Jaya</option>
              <option>PT Transport Jaya</option>
              <option>CV Berkah Abadi</option>
              <option>Budi Santoso</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cari</label>
            <input type="text" className="form-input" placeholder="No. PRJ / nama project..." />
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn--brand btn--sm flex-1 justify-center">
              <Search size={14} /> Cari
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>No. PRJ</th>
              <th>No. Pesanan</th>
              <th>Nama Project</th>
              <th>Customer</th>
              <th>Periode</th>
              <th>Anggaran</th>
              <th>Realisasi</th>
              <th>Sisa</th>
              <th>SRO</th>
              <th>SWO</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => {
              const sisa = p.totalAnggaran - p.totalRealisasi;
              const sisaColor = sisa > 0 ? "var(--color-success)" : sisa === 0 ? "var(--color-text-placeholder)" : "var(--color-error)";
              return (
                <tr key={p.id}>
                  <td
                    className="font-medium cursor-pointer"
                    style={{ color: "var(--color-brand)", whiteSpace: "nowrap" }}
                    onClick={() => router.push(`/project/${p.id}`)}
                  >{p.id}</td>
                  <td className="text-sm">{p.noPesanan || <span style={{ color: "#8e8f8e" }}>-</span>}</td>
                  <td className="font-medium">{p.name}</td>
                  <td>{p.customer}</td>
                  <td className="text-[--color-text-secondary] text-sm">{p.periode}</td>
                  <td className="font-medium">{fmt(p.totalAnggaran)}</td>
                  <td className="font-medium" style={{ color: "var(--color-brand)" }}>{fmt(p.totalRealisasi)}</td>
                  <td className="font-medium" style={{ color: sisaColor }}>{fmt(sisa)}</td>
                  <td>
                    <span style={{ color: "var(--color-brand)", fontWeight: 500, cursor: p.sroCount > 0 ? "pointer" : "default" }}>{p.sroCount}</span>
                  </td>
                  <td>
                    <span style={{ color: "var(--color-brand)", fontWeight: 500, cursor: p.swoCount > 0 ? "pointer" : "default" }}>{p.swoCount}</span>
                  </td>
                  <td><span className={statusPill(p.status)}>{p.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}
