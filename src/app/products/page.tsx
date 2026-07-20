"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Star, Download, Search } from "lucide-react";

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
          Products
          <Star className="w-5 h-5 text-[--color-brand-secondary] ml-1" />
        </div>
        <button className="btn btn--sm">
          <Download size={14} /> Export
        </button>
        <button onClick={() => router.push("/products/new")} className="btn btn--brand btn--sm">
          + Add Product
        </button>
      </div>

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
            <label className="form-label">Tax</label>
            <select className="form-select">
              <option>All Tax</option>
              <option>PPN 11%</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">All Tags</label>
            <select className="form-select">
              <option>All Tags</option>
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

      <div className="table-wrap">
        {loading ? (
          <div className="p-8 text-center text-[--color-text-secondary]">Loading...</div>
        ) : (
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
                <tr key={p.id}>
                  <td
                    className="font-medium cursor-pointer"
                    style={{ color: "var(--color-brand)" }}
                    onClick={() => router.push(`/products/${p.sku}`)}
                  >
                    {p.sku}
                  </td>
                  <td className="font-medium">{p.name}</td>
                  <td>{p.code || p.sku}</td>
                  <td>{p.brand}</td>
                  <td>{p.type || p.category || "-"}</td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {p.category && (
                        <span className="pill pill--draft">{p.category}</span>
                      )}
                      {p.isBundle && (
                        <span className="pill pill--draft">Bundle</span>
                      )}
                    </div>
                  </td>
                  <td>PPN 11%</td>
                  <td className="font-medium text-right">{formatRupiah(p.sellPrice)}</td>
                  <td className="text-right">{p.stockQty}</td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={9} className="text-center py-8 text-[--color-text-secondary]">Tidak ada data</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
