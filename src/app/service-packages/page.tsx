"use client";

import { useRouter } from "next/navigation";
import { Wrench, Star, Download, Search, Plus } from "lucide-react";

/* ── dummy data ── */
const packages = [
  { sku: "PACK-PREMIUM-D", name: "GASOLINE TREATMENT", description: "", isOpen: false, estimatedTime: "3 Jam 30 Menit", tax: "PPN", price: 857881 },
  { sku: "PACK-BODYREPAIR-SEDAN", name: "CAT ALL BODY, LAS / KETOK / DEMPUL + EPOXY + CAT FINISHING + DETAILING", description: "", isOpen: false, estimatedTime: "3 Hari 8 Jam", tax: "PPN", price: 22200000 },
  { sku: "PACK-BODYREPAIR-L", name: "CAT ALL BODY, LAS / KETOK / DEMPUL + EPOXY + CAT FINISHING", description: "", isOpen: false, estimatedTime: "2 Jam 30 Menit", tax: "PPN", price: 25458716 },
  { sku: "PACK-BODYREPAIR03", name: "CAT ALL BODY, LAS / KETOK / DEMPUL + EPOXY + CAT FINISHING", description: "ISUZU PANTHER TBR54 PICK UP", isOpen: false, estimatedTime: "", tax: "PPN", price: 14129587 },
  { sku: "PACK-BODYREPAIR02", name: "CAT ALL BODY, LAS / KETOK / DEMPUL + EPOXY + CAT FINISHING", description: "", isOpen: false, estimatedTime: "3 Hari 8 Jam", tax: "PPN", price: 21024826 },
  { sku: "PACK-BODYREPAIR", name: "CAT ALL BODY, LAS / KETOK / DEMPUL + EPOXY + CAT FINISHING", description: "", isOpen: false, estimatedTime: "", tax: "PPN", price: 19371028 },
  { sku: "PCK-TRITON", name: "PAKET BODY REPAIR IIA", description: "CAT ALL BODY, LAS / KETOK / DEMPUL+EPOXY+CAT FINISHING", isOpen: false, estimatedTime: "3 Jam 30 Menit", tax: "PPN", price: 29389541 },
  { sku: "PACK-PREMIUM-C", name: "DIESEL TREATMENT", description: "", isOpen: false, estimatedTime: "", tax: "PPN", price: 630416 },
  { sku: "PACK-002", name: "GANTI OLI & FILTER OLI", description: "", isOpen: false, estimatedTime: "", tax: "PPN", price: 620664 },
  { sku: "PACK-001", name: "SPOORING & BALANCING", description: "", isOpen: false, estimatedTime: "", tax: "PPN", price: 253569 },
  { sku: "PACK-BODYREPAIR-FULL", name: "CAT FULL BODY", description: "", isOpen: false, estimatedTime: "", tax: "PPN", price: 14000000 },
];

const inactivePackages = [
  { sku: "PACK-OLD-001", name: "TUNE UP & GANTI OLI", description: "Paket lama tidak berlaku", isOpen: false, estimatedTime: "1 Jam", tax: "PPN", price: 450000 },
];

/* ── format Rupiah ── */
function formatRupiah(n: number): string {
  return "Rp " + n.toLocaleString("id-ID").replace(/,/g, ".");
}

export default function ServicePackagesPage() {
  const router = useRouter();

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
      <div
        className="flex border-b border-[--color-border-light] mb-4 overflow-x-auto"
        style={{ gap: 0 }}
      >
        <button
          className="px-4 py-3 text-sm border-b-2 text-[--color-brand] border-[--color-brand] font-semibold"
        >
          Active
        </button>
        <button
          className="px-4 py-3 text-sm border-b-2 text-[--color-text-secondary] border-transparent hover:text-[--color-brand] transition-colors"
        >
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
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ minWidth: 180 }}>
                SKU <span style={{ fontSize: 10, marginLeft: 4 }}>▲</span>
              </th>
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
                key={pkg.sku}
                className="cursor-pointer hover:bg-[#f0f7ff] transition-colors"
                onClick={() => router.push(`/service-packages/${pkg.sku}`)}
              >
                <td className="font-medium" style={{ color: "#0176d3" }}>
                  {pkg.sku}
                </td>
                <td className="font-medium" style={{ color: "#0176d3" }}>
                  {pkg.name}
                </td>
                <td style={{ color: "#444746" }}>
                  {pkg.description || "—"}
                </td>
                <td style={{ textAlign: "center" }}>
                  <span
                    style={{
                      color: "#ea001e",
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    ✗
                  </span>
                </td>
                <td style={{ textAlign: "center", color: "#444746" }}>
                  {pkg.estimatedTime || "—"}
                </td>
                <td style={{ textAlign: "center", color: "#444746" }}>
                  {pkg.tax}
                </td>
                <td className="font-medium" style={{ textAlign: "right" }}>
                  {formatRupiah(pkg.price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 16,
          color: "#444746",
          fontSize: 13,
        }}
      >
        <div>Showing 1 — {packages.length} of {packages.length}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn--sm" disabled style={{ opacity: 0.4 }}>
            Prev
          </button>
          <button className="btn btn--sm">Next</button>
        </div>
      </div>
    </div>
  );
}
