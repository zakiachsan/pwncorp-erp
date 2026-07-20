"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import DateRangePicker from "@/components/shared/DateRangePicker";

const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");

const tabList = ["product", "storeStocks", "warehouseStocks", "warehouseHistory", "productHistory", "purchaseHistory"] as const;
type TabKey = typeof tabList[number];
const tabLabels: Record<TabKey, string> = {
  product: "Product", storeStocks: "Store Stocks", warehouseStocks: "Warehouse Stocks",
  warehouseHistory: "Warehouse History", productHistory: "Product History", purchaseHistory: "Purchase History",
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const skuArr = Array.isArray(params.sku) ? params.sku : [params.sku];
  const sku = skuArr.join("/");
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("product");
  const [dateFrom, setDateFrom] = useState<Date>(new Date());
  const [dateTo, setDateTo] = useState<Date>(new Date());

  useEffect(() => {
    fetch(`/api/spareparts?search=${encodeURIComponent(sku)}&limit=1`)
      .then((r) => r.json())
      .then((json) => {
        const found = (json.data || [])[0];
        if (!found) { setError("Product not found: " + sku); setLoading(false); return; }
        setProduct({
          sku: found.sku || sku,
          name: found.name || "-",
          description: found.description || "-",
          brand: found.brand || "-",
          type: found.type || "-",
          tags: found.tags || [],
          productCode: found.code || "-",
          supplierProductCode: found.supplier?.code || "-",
          suppliers: found.supplier ? [found.supplier.name || "All Suppliers"] : ["All Suppliers"],
          tax: found.tax || "PPN",
          taxProductCode: found.taxProductCode || "",
          companySupplyPrice: found.buyPrice || 0,
          wholesalePrice: found.wholesalePrice || 0,
          supplyPrice: found.supplyPrice || 0,
          retailPrice: found.sellPrice || 0,
          retailPriceIncTax: Math.round((found.sellPrice || 0) * 1.11),
          tracking: found.tracking ?? true,
          bundleFlexible: found.bundleFlexible ?? false,
          bundle: found.bundle ?? false,
          createdAt: found.createdAt || "-",
          updatedAt: found.updatedAt || "-",
          updatedBy: found.updatedBy || "-",
          weight: found.weight || "",
          volume: found.volume || "",
          validFrom: found.validFrom || "-",
          validTo: found.validTo || "-",
          barcodeType: found.barcodeType || "code128",
          isActive: found.isActive ?? true,
          isInternal: found.isInternal ?? false,
          openPrice: found.openPrice ?? true,
          canOrder: found.canOrder ?? true,
          productFreeze: found.productFreeze ?? false,
          warrantyPeriod: found.warrantyPeriod || "-",
          returnDaysLimit: found.returnDaysLimit || "-",
          tradeIn: found.tradeIn || 0,
          stockQty: found.stockQty || 0,
          minStock: found.minStock || 0,
          category: found.category || "-",
        });
        setLoading(false);
      })
      .catch(() => { setError("Failed to load product"); setLoading(false); });
  }, [sku]);

  if (loading) {
    return (
      <div style={{ padding: "0 24px 24px" }}>
        <button onClick={() => router.push("/products")} style={S.backBtn}>
          <ArrowLeft size={16} /> Kembali ke Products
        </button>
        <div style={{ ...S.card, marginTop: 12 }}><p style={{ color: "#444746" }}>Loading...</p></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ padding: "0 24px 24px" }}>
        <button onClick={() => router.push("/products")} style={S.backBtn}>
          <ArrowLeft size={16} /> Kembali ke Products
        </button>
        <div style={{ ...S.card, marginTop: 12 }}><p style={{ color: "#ea001e" }}>{error || "Product not found"}</p></div>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 24px 24px" }}>
      <button onClick={() => router.push("/products")} style={S.backBtn}>
        <ArrowLeft size={16} /> Kembali ke Products
      </button>

      <div style={S.identifierBar}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#0176d3" }}>{product.sku} - {product.name}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={S.actionBtn}>QR Codes</button>
          <button style={S.actionBtn}>Barcodes</button>
        </div>
      </div>

      <div style={S.tabBar}>
        {tabList.map((key) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{
            ...S.tab, color: activeTab === key ? "#fff" : "#444746",
            background: activeTab === key ? "#0176d3" : "transparent",
            fontWeight: activeTab === key ? 600 : 400,
          }}>{tabLabels[key]}</button>
        ))}
      </div>

      {/* Product Tab */}
      {activeTab === "product" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>
          <div>
            <h3 style={S.sectionTitle}>Details</h3>
            <div style={S.card}>
              <F label="SKU" value={product.sku} />
              <F label="Name" value={product.name} />
              <F label="Description" value={product.description} />
              <F label="Brand" value={product.brand} />
              <F label="Type" value={product.type} />
              <F label="Tags" value={product.tags.join(", ")} />
              <F label="Product Code" value={product.productCode} />
              <F label="Supplier Product Code" value={product.supplierProductCode} />
              <F label="Suppliers" value={product.suppliers.join(", ")} />
            </div>
            <h3 style={{ ...S.sectionTitle, marginTop: 20 }}>Tax</h3>
            <div style={S.card}>
              <F label="Tax" value={product.tax} />
              <F label="Tax Product Code" value={product.taxProductCode} />
            </div>
            <h3 style={{ ...S.sectionTitle, marginTop: 20 }}>Company Pricing</h3>
            <div style={S.card}>
              <F label="Company Supply Price (IDR)" value={fmt(product.companySupplyPrice)} />
              <F label="Wholesale Price (IDR)" value={fmt(product.wholesalePrice) + " (0 Inc Tax)"} />
            </div>
            <h3 style={{ ...S.sectionTitle, marginTop: 20 }}>Store Pricing</h3>
            <div style={S.card}>
              <F label="Supply Price (IDR)" value={fmt(product.supplyPrice)} />
              <F label="Retail Price (IDR)" value={fmt(product.retailPrice) + " (" + fmt(product.retailPriceIncTax) + " Inc Tax)"} />
            </div>
            <h3 style={{ ...S.sectionTitle, marginTop: 20 }}>Tracking and Bundle</h3>
            <div style={S.card}>
              <F label="Stock Tracking" value={product.tracking ? "Enabled" : "Disabled"} />
              <F label="Bundle Flexible" value={product.bundleFlexible ? "Enabled" : "Disabled"} />
              <F label="Bundle" value={product.bundle ? "Enabled" : "Disabled"} />
            </div>
          </div>
          <div>
            <h3 style={S.sectionTitle}>Changes</h3>
            <div style={S.card}>
              <F label="Created At" value={product.createdAt} />
              <F label="Updated At" value={product.updatedAt} />
              <F label="Updated By" value={product.updatedBy} />
            </div>
            <h3 style={{ ...S.sectionTitle, marginTop: 20 }}>Dimensions</h3>
            <div style={S.card}>
              <F label="Weight (Gram)" value={product.weight || "-"} />
              <F label="Volume (Mililiter)" value={product.volume || "-"} />
            </div>
            <h3 style={{ ...S.sectionTitle, marginTop: 20 }}>Product Schedule</h3>
            <div style={S.card}>
              <F label="Valid From" value={product.validFrom} />
              <F label="Valid To" value={product.validTo} />
            </div>
            <h3 style={{ ...S.sectionTitle, marginTop: 20 }}>Barcode</h3>
            <div style={S.card}><F label="Barcode Type" value={product.barcodeType} /></div>
            <h3 style={{ ...S.sectionTitle, marginTop: 20 }}>Settings</h3>
            <div style={S.card}>
              <F label="Active" value={product.isActive ? "Yes" : "No"} />
              <F label="Is Internal" value={product.isInternal ? "Yes" : "No"} />
              <F label="Open Price" value={product.openPrice ? "Yes" : "No"} />
              <F label="Can Order" value={product.canOrder ? "Yes" : "No"} />
              <F label="Product Freeze" value={product.productFreeze ? "Yes" : "No"} />
            </div>
            <h3 style={{ ...S.sectionTitle, marginTop: 20 }}>Warranty</h3>
            <div style={S.card}><F label="Warranty Period" value={product.warrantyPeriod} /></div>
            <h3 style={{ ...S.sectionTitle, marginTop: 20 }}>Return</h3>
            <div style={S.card}><F label="Return Days Limit" value={product.returnDaysLimit} /></div>
            <h3 style={{ ...S.sectionTitle, marginTop: 20 }}>Trade In</h3>
            <div style={S.card}><F label="Trade In (RP)" value={fmt(product.tradeIn)} /></div>
          </div>
        </div>
      )}

      {/* Store Stocks Tab */}
      {activeTab === "storeStocks" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "flex-end" }}>
            <div><label style={S.filterLabel}>Store</label><select style={S.filterInput}><option value="">All Stores</option></select></div>
            <div><label style={S.filterLabel}>Name</label><input type="text" style={S.filterInput} /></div>
            <div><label style={S.filterLabel}>Store Code</label><input type="text" style={S.filterInput} /></div>
            <div><label style={S.filterLabel}>Show Stock</label><select style={S.filterInput}><option value="">All</option></select></div>
            <button style={S.searchBtn}><Search size={14} /> Search</button>
          </div>
          <div style={{ ...S.card, marginBottom: 12, padding: "8px 16px" }}>
            <span style={{ fontSize: 13, color: "#0176d3", fontWeight: 600 }}>Total Qty : {product.stockQty}</span>
          </div>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead><tr>
                <th style={S.th}>No</th><th style={S.th}>Code</th><th style={S.th}>Store</th>
                <th style={{ ...S.th, textAlign: "right" }}>Qty</th><th style={{ ...S.th, textAlign: "right" }}>Reserved</th>
                <th style={{ ...S.th, textAlign: "right" }}>In Transit</th><th style={{ ...S.th, textAlign: "right" }}>Min Qty</th>
                <th style={{ ...S.th, textAlign: "right" }}>Max Qty</th><th style={{ ...S.th, textAlign: "right" }}>Average Cost (Rp)</th>
                <th style={{ ...S.th, textAlign: "right" }}>Total Cost (Rp)</th>
              </tr></thead>
              <tbody>
                <tr><td colSpan={10} style={{ ...S.td, textAlign: "center", color: "#8e8f8e", padding: 24 }}>Data not available via API yet</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Warehouse Stocks Tab */}
      {activeTab === "warehouseStocks" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "flex-end" }}>
            <div><label style={S.filterLabel}>Warehouse</label><select style={S.filterInput}><option value="">All Warehouses</option></select></div>
            <div><label style={S.filterLabel}>Name</label><input type="text" style={S.filterInput} /></div>
            <div><label style={S.filterLabel}>Warehouse Code</label><input type="text" style={S.filterInput} /></div>
            <button style={S.searchBtn}><Search size={14} /> Search</button>
          </div>
          <div style={{ ...S.card, marginBottom: 12, padding: "8px 16px" }}>
            <span style={{ fontSize: 13, color: "#0176d3", fontWeight: 600 }}>Total Qty : 0</span>
          </div>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead><tr>
                <th style={S.th}>No</th><th style={S.th}>Code</th><th style={S.th}>Warehouse</th>
                <th style={{ ...S.th, textAlign: "right" }}>Qty</th><th style={{ ...S.th, textAlign: "right" }}>Qty Available</th>
                <th style={{ ...S.th, textAlign: "right" }}>Reserved</th><th style={{ ...S.th, textAlign: "right" }}>In Transit</th>
                <th style={{ ...S.th, textAlign: "right" }}>Min Qty</th><th style={{ ...S.th, textAlign: "right" }}>Max Qty</th>
                <th style={{ ...S.th, textAlign: "right" }}>Average Cost (Rp)</th><th style={{ ...S.th, textAlign: "right" }}>Total Cost (Rp)</th>
              </tr></thead>
              <tbody>
                <tr><td colSpan={11} style={{ ...S.td, textAlign: "center", color: "#8e8f8e", padding: 24 }}>Data not available via API yet</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Warehouse History Tab */}
      {activeTab === "warehouseHistory" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "flex-end" }}>
            <div><label style={S.filterLabel}>Warehouse</label><select style={S.filterInput}><option value="">Gudang Wijaya</option></select></div>
            <div><label style={S.filterLabel}>Type</label><input type="text" style={S.filterInput} placeholder="Type" /></div>
            <div>
              <label style={S.filterLabel}>Tanggal</label>
              <DateRangePicker
                from={dateFrom}
                to={dateTo}
                onChange={(from, to) => { setDateFrom(from); setDateTo(to); }}
              />
            </div>
            <div><label style={S.filterLabel}>Created By</label><input type="text" style={S.filterInput} /></div>
            <button style={S.searchBtn}><Search size={14} /> Search</button>
          </div>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead><tr>
                <th style={S.th}>ID ↓</th><th style={S.th}>Date ↓</th><th style={S.th}>Warehouse</th>
                <th style={S.th}>Type</th><th style={{ ...S.th, textAlign: "right" }}>Qty Changed</th>
                <th style={S.th}>Notes</th><th style={S.th}>Created By</th>
              </tr></thead>
              <tbody>
                <tr><td colSpan={7} style={{ ...S.td, textAlign: "center", color: "#8e8f8e", padding: 24 }}>Data not available via API yet</td></tr>
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
            <div style={{ display: "flex", gap: 4 }}>
              {[1, 2, 3, 4, 5].map((p) => (
                <button key={p} style={{ ...S.pageBtn, ...(p === 1 ? S.pageBtnActive : {}) }}>{p}</button>
              ))}
              <span style={{ padding: "4px 8px", fontSize: 12, color: "#8e8f8e" }}>...</span>
              <button style={S.pageBtn}>Next ›</button>
            </div>
            <div style={{ fontSize: 12, color: "#8e8f8e" }}>All Qty Change: 0</div>
          </div>
        </div>
      )}

      {/* Product History Tab */}
      {activeTab === "productHistory" && (
        <div>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead><tr>
                <th style={S.th}>Updated At</th><th style={S.th}>Updated By</th>
                <th style={{ ...S.th, textAlign: "right" }}>Company Supply Price</th>
                <th style={{ ...S.th, textAlign: "right" }}>Wholesale Price</th>
                <th style={{ ...S.th, textAlign: "right" }}>Supply Price</th>
                <th style={{ ...S.th, textAlign: "right" }}>Retail Price</th>
                <th style={{ ...S.th, textAlign: "right" }}>Trade In</th>
                <th style={{ ...S.th, textAlign: "right" }}>Warranty</th>
                <th style={{ ...S.th, textAlign: "center" }}>Active</th>
                <th style={{ ...S.th, textAlign: "center" }}>Track</th>
                <th style={{ ...S.th, textAlign: "center" }}>Bundle</th>
              </tr></thead>
              <tbody>
                <tr><td colSpan={11} style={{ ...S.td, textAlign: "center", color: "#8e8f8e", padding: 24 }}>Data not available via API yet</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Purchase History Tab */}
      {activeTab === "purchaseHistory" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "flex-end" }}>
            <div><label style={S.filterLabel}>Supplier</label><select style={S.filterInput}><option value="">All Suppliers</option></select></div>
            <button style={S.searchBtn}><Search size={14} /> Search</button>
          </div>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead><tr>
                <th style={S.th}>Date ↓</th><th style={S.th}>Supplier</th><th style={S.th}>Purchase Delivery</th>
                <th style={{ ...S.th, textAlign: "right" }}>Quantity</th><th style={{ ...S.th, textAlign: "right" }}>Price</th>
                <th style={{ ...S.th, textAlign: "right" }}>Subtotal</th><th style={{ ...S.th, textAlign: "right" }}>Tax</th>
                <th style={{ ...S.th, textAlign: "right" }}>Total</th>
              </tr></thead>
              <tbody>
                <tr><td colSpan={8} style={{ ...S.td, textAlign: "center", color: "#8e8f8e", padding: 24 }}>Data not available via API yet</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function F({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: "#001526" }}>{value || <span style={{ color: "#d8d8d8" }}>—</span>}</div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  backBtn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, fontWeight: 500, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer", marginBottom: 12 },
  identifierBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: "#e6f0fa", border: "1px solid #b8d4f0", borderRadius: 8, marginBottom: 16 },
  actionBtn: { display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", fontSize: 12, fontWeight: 500, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" },
  tabBar: { display: "flex", gap: 0, marginBottom: 20, background: "#ecebea", borderRadius: 8, padding: 3, overflowX: "auto" as const },
  tab: { padding: "7px 16px", fontSize: 13, border: "none", borderRadius: 6, cursor: "pointer", transition: "all 150ms", whiteSpace: "nowrap" as const },
  sectionTitle: { fontSize: 13, fontWeight: 600, color: "#0176d3", marginBottom: 8 },
  card: { background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  filterLabel: { display: "block", fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 4 },
  filterInput: { padding: "6px 10px", fontSize: 13, border: "1px solid #d8d8d8", borderRadius: 6, background: "#fff", color: "#001526", minWidth: 140 },
  searchBtn: { display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 16px", fontSize: 13, fontWeight: 500, color: "#0176d3", background: "#fff", border: "1px solid #0176d3", borderRadius: 6, cursor: "pointer" },
  tableWrap: { border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden", background: "#fff" },
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: 13 },
  th: { padding: "8px 10px", textAlign: "left" as const, fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", background: "#f9f9f9", borderBottom: "1px solid #ecebea" },
  td: { padding: "8px 10px", borderBottom: "1px solid #f0f0f0", color: "#001526", background: "#fff" },
  tr: { transition: "background 100ms" },
  pageBtn: { padding: "4px 10px", fontSize: 12, border: "1px solid #d8d8d8", borderRadius: 4, background: "#fff", cursor: "pointer" },
  pageBtnActive: { borderColor: "#0176d3", color: "#0176d3", fontWeight: 600 },
};
