"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Star, Download, Search } from "lucide-react";

/* ── dummy data ── */
const products = [
  { sku: "SP-BND-001", name: "BENDIX STATER", code: "PRD-001", brand: "Bendix", type: "Brake", tags: ["Brake", "Popular"], tracking: true, bundle: false, bundleFlexible: false, tax: "PPN 11%", price: 185000, qty: 48 },
  { sku: "SP-SWC-002", name: "SWITCH HEAD LIGHT", code: "PRD-002", brand: "Denso", type: "Electrical", tags: ["Electrical"], tracking: true, bundle: false, bundleFlexible: false, tax: "PPN 11%", price: 75000, qty: 120 },
  { sku: "SP-WNT-003", name: "WHEEL NUT 12MM", code: "PRD-003", brand: "Bosch", type: "Chassis", tags: ["Chassis"], tracking: false, bundle: true, bundleFlexible: false, tax: "PPN 11%", price: 8500, qty: 500 },
  { sku: "SP-CMP-004", name: "COMPRESSOR ASSY", code: "PRD-004", brand: "Sanden", type: "AC System", tags: ["AC System", "Heavy"], tracking: true, bundle: false, bundleFlexible: true, tax: "PPN 11%", price: 2350000, qty: 12 },
  { sku: "SP-OIL-005", name: "OIL FILTER 1010A", code: "PRD-005", brand: "Toyota", type: "Engine", tags: ["Engine", "Popular"], tracking: true, bundle: false, bundleFlexible: false, tax: "PPN 11%", price: 42000, qty: 230 },
  { sku: "SP-FLT-006", name: "FUEL FILTER ASSY", code: "PRD-006", brand: "Denso", type: "Engine", tags: ["Engine"], tracking: true, bundle: false, bundleFlexible: false, tax: "PPN 11%", price: 125000, qty: 65 },
  { sku: "SP-PLG-007", name: "PLUG NGK BKR6E", code: "PRD-007", brand: "NGK", type: "Ignition", tags: ["Ignition", "Popular"], tracking: true, bundle: false, bundleFlexible: false, tax: "PPN 11%", price: 35000, qty: 300 },
  { sku: "SP-PLY-008", name: "PLYWOOD BELT TENSIONER", code: "PRD-008", brand: "Gates", type: "Belt", tags: ["Belt"], tracking: false, bundle: false, bundleFlexible: false, tax: "PPN 11%", price: 195000, qty: 40 },
  { sku: "SP-STR-009", name: "STRUT SHOCK ABSORBER", code: "PRD-009", brand: "KYB", type: "Suspension", tags: ["Suspension", "Heavy"], tracking: true, bundle: false, bundleFlexible: false, tax: "PPN 11%", price: 480000, qty: 28 },
  { sku: "SP-BRG-010", name: "BEARING WHEEL 6205", code: "PRD-010", brand: "NSK", type: "Chassis", tags: ["Chassis"], tracking: true, bundle: true, bundleFlexible: false, tax: "PPN 11%", price: 68000, qty: 150 },
  { sku: "SP-CLK-011", name: "CLUTCH DISC 200MM", code: "PRD-011", brand: "Exedy", type: "Clutch", tags: ["Clutch"], tracking: true, bundle: false, bundleFlexible: false, tax: "PPN 11%", price: 375000, qty: 22 },
  { sku: "SP-RTR-012", name: "ROTOR DISC FRONT", code: "PRD-012", brand: "Bendix", type: "Brake", tags: ["Brake", "Popular"], tracking: true, bundle: false, bundleFlexible: false, tax: "PPN 11%", price: 290000, qty: 35 },
  { sku: "SP-PAD-013", name: "BRAKE PAD SET REAR", code: "PRD-013", brand: "Akebono", type: "Brake", tags: ["Brake"], tracking: true, bundle: false, bundleFlexible: true, tax: "PPN 11%", price: 165000, qty: 55 },
  { sku: "SP-BAT-014", name: "BATTERY 60D23L", code: "PRD-014", brand: "GS Astra", type: "Electrical", tags: ["Electrical", "Popular"], tracking: true, bundle: false, bundleFlexible: false, tax: "PPN 11%", price: 650000, qty: 18 },
  { sku: "SP-BLT-015", name: "V-BELT 4PK950", code: "PRD-015", brand: "Bando", type: "Belt", tags: ["Belt"], tracking: false, bundle: false, bundleFlexible: false, tax: "PPN 11%", price: 45000, qty: 80 },
  { sku: "SP-THM-016", name: "THERMOSTAT 82C", code: "PRD-016", brand: "Toyota", type: "Engine", tags: ["Engine"], tracking: true, bundle: false, bundleFlexible: false, tax: "PPN 11%", price: 125000, qty: 42 },
  { sku: "SP-SPK-017", name: "SPARK PLUG COPPER", code: "PRD-017", brand: "NGK", type: "Ignition", tags: ["Ignition"], tracking: true, bundle: false, bundleFlexible: false, tax: "PPN 11%", price: 28000, qty: 200 },
  { sku: "SP-WPR-018", name: "WIPER BLADE 22IN", code: "PRD-018", brand: "Bosch", type: "Body", tags: ["Body", "Popular"], tracking: false, bundle: true, bundleFlexible: true, tax: "PPN 11%", price: 55000, qty: 90 },
  { sku: "SP-CBL-019", name: "CABLE CLUTCH ASSY", code: "PRD-019", brand: "Exedy", type: "Clutch", tags: ["Clutch"], tracking: true, bundle: false, bundleFlexible: false, tax: "PPN 11%", price: 195000, qty: 15 },
  { sku: "SP-LMP-020", name: "LAMP H4 12V 60W", code: "PRD-020", brand: "Philips", type: "Electrical", tags: ["Electrical"], tracking: true, bundle: false, bundleFlexible: false, tax: "PPN 11%", price: 48000, qty: 160 },
];

/* ── format Rupiah ── */
function formatRupiah(n: number): string {
  return "Rp " + n.toLocaleString("id-ID").replace(/,/g, ".");
}

/* ── main page ── */
export default function ProductsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"active" | "inactive">("active");

  const tabs = [
    { key: "active" as const, label: "Active" },
    { key: "inactive" as const, label: "Inactive" },
  ];

  return (
    <div>
      {/* ── Header ── */}
      <div className="view-header">
        <div className="view-title">
          <Package className="w-6 h-6 text-[--color-brand-secondary]" />
          Products
          <Star className="w-5 h-5 text-[--color-brand-secondary] ml-1" />
        </div>
        <button className="btn btn--sm">
          <Download size={14} /> Export
        </button>
      </div>

      {/* ── Tabs ── */}
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

      {/* ── Filter Section ── */}
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
              <option>Bendix</option>
              <option>Bosch</option>
              <option>Denso</option>
              <option>NGK</option>
              <option>Toyota</option>
              <option>Gates</option>
              <option>KYB</option>
              <option>NSK</option>
              <option>Exedy</option>
              <option>Akebono</option>
              <option>Sanden</option>
              <option>GS Astra</option>
              <option>Bando</option>
              <option>Philips</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Product Type</label>
            <select className="form-select">
              <option>All Types</option>
              <option>Brake</option>
              <option>Electrical</option>
              <option>Engine</option>
              <option>Chassis</option>
              <option>AC System</option>
              <option>Ignition</option>
              <option>Belt</option>
              <option>Suspension</option>
              <option>Clutch</option>
              <option>Body</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Tax</label>
            <select className="form-select">
              <option>All Tax</option>
              <option>PPN 11%</option>
              <option>Non-Taxable</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">All Tags</label>
            <select className="form-select">
              <option>All Tags</option>
              <option>Popular</option>
              <option>Heavy</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn--brand btn--sm flex-1 justify-center">
              <Search size={14} /> Search
            </button>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ minWidth: 180 }}>SKU</th>
              <th>Name</th>
              <th>Product Code</th>
              <th>Brand</th>
              <th>Type</th>
              <th>Tags</th>
              <th>Tax</th>
              <th style={{ textAlign: "right" }}>Price (Rp)</th>
              <th style={{ textAlign: "right" }}>Total Qty</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.sku}>
                <td
                  className="font-medium cursor-pointer"
                  style={{ color: "var(--color-brand)" }}
                  onClick={() => router.push(`/products/${p.sku}`)}
                >
                  {p.sku}
                </td>
                <td className="font-medium">{p.name}</td>
                <td>{p.code}</td>
                <td>{p.brand}</td>
                <td>{p.type}</td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {p.tags.map((tag) => (
                      <span key={tag} className="pill pill--draft">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td>{p.tax}</td>
                <td className="font-medium text-right">{formatRupiah(p.price)}</td>
                <td className="text-right">{p.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
