"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Printer, ChevronRight, Search } from "lucide-react";

const opnameData: Record<string, any> = {
  "WST/WJY/26060086": {
    refCode: "WST/WJY/26060086",
    date: "27 Jun 2026",
    completedDate: "28 Jun 2026 09:00 AM",
    approvedDate: "28 Jun 2026 10:30 AM",
    warehouse: "Gudang Wijaya",
    warehouseLink: "#",
    notes: "adjusment stock",
    createdBy: "ANGGA NOVIANTO",
    updatedBy: "ANGGA NOVIANTO",
    updatedAt: "28 Jun 2026 10:30 AM",
    journal: "JRN/WJY/26060086",
    journalLink: "#",
    status: "APPROVED",
    products: [
      {
        no: 1,
        sku: "AF-177-MC",
        product: "AIR FILTER",
        productCode: "AF-177-MC",
        unitPrice: 45000,
        inventoryStock: 120,
        reservedStock: 5,
        availableStock: 115,
        countedStock: 118,
        difference: 3,
        approved: 3,
        expenseAccount: "51010101 - Cost of Goods Sold",
      },
      {
        no: 2,
        sku: "LKR6C",
        product: "NGK-BUSI-LKR6C",
        productCode: "LKR6C",
        unitPrice: 35000,
        inventoryStock: 200,
        reservedStock: 10,
        availableStock: 190,
        countedStock: 185,
        difference: -5,
        approved: -5,
        expenseAccount: "51010101 - Cost of Goods Sold",
      },
      {
        no: 3,
        sku: "18-97033-99-B",
        product: "BRAKE PAD",
        productCode: "18-97033-99-B",
        unitPrice: 85000,
        inventoryStock: 50,
        reservedStock: 3,
        availableStock: 47,
        countedStock: 45,
        difference: -2,
        approved: -2,
        expenseAccount: "51010101 - Cost of Goods Sold",
      },
    ],
  },
  "WST/WJY/26060001": {
    refCode: "WST/WJY/26060001",
    date: "24 Jun 2026",
    completedDate: "24 Jun 2026 03:49 PM",
    approvedDate: "24 Jun 2026 03:50 PM",
    warehouse: "Gudang Wijaya",
    warehouseLink: "#",
    notes: "adjusment stock",
    createdBy: "ANGGA NOVIANTO",
    updatedBy: "ANGGA NOVIANTO",
    updatedAt: "24 Jun 2026 03:50 PM",
    journal: "13852603",
    journalLink: "#",
    status: "APPROVED",
    products: [
      { no: 1, sku: "AF-177-MC", product: "AIR FILTER", productCode: "FILTER UDARA FORD RANGER", unitPrice: 369970, inventoryStock: 0, reservedStock: 0, availableStock: 0, countedStock: 14, difference: 14, approved: 14, expenseAccount: "510101 - HARGA POKOK PENJUALAN" },
    ],
  },
  "WST/WJY/26060002": {
    refCode: "WST/WJY/26060002",
    date: "24 Jun 2026",
    completedDate: "24 Jun 2026 03:55 PM",
    approvedDate: "24 Jun 2026 04:00 PM",
    warehouse: "Gudang Wijaya",
    warehouseLink: "#",
    notes: "adjusment stock",
    createdBy: "ANGGA NOVIANTO",
    updatedBy: "ANGGA NOVIANTO",
    updatedAt: "24 Jun 2026 04:00 PM",
    journal: "13852610",
    journalLink: "#",
    status: "APPROVED",
    products: [
      { no: 1, sku: "LKR6C", product: "NGK-BUSI-LKR6C", productCode: "BUSI NGK LKR6C", unitPrice: 36036, inventoryStock: 50, reservedStock: 0, availableStock: 50, countedStock: 54, difference: 4, approved: 4, expenseAccount: "510101 - HARGA POKOK PENJUALAN" },
    ],
  },
  "WST/WJY/26060003": {
    refCode: "WST/WJY/26060003",
    date: "24 Jun 2026",
    completedDate: "24 Jun 2026 04:00 PM",
    approvedDate: "24 Jun 2026 04:05 PM",
    warehouse: "Gudang Wijaya",
    warehouseLink: "#",
    notes: "adjusment stock",
    createdBy: "ANGGA NOVIANTO",
    updatedBy: "ANGGA NOVIANTO",
    updatedAt: "24 Jun 2026 04:05 PM",
    journal: "13852615",
    journalLink: "#",
    status: "APPROVED",
    products: [
      { no: 1, sku: "18-97033-99-B", product: "BRAKE PAD", productCode: "KAMPAS REM DEPAN", unitPrice: 155045, inventoryStock: 30, reservedStock: 0, availableStock: 30, countedStock: 28, difference: -2, approved: -2, expenseAccount: "510101 - HARGA POKOK PENJUALAN" },
    ],
  },
  "WST/WJY/26060004": {
    refCode: "WST/WJY/26060004",
    date: "24 Jun 2026",
    completedDate: "24 Jun 2026 04:10 PM",
    approvedDate: "24 Jun 2026 04:15 PM",
    warehouse: "Gudang Wijaya",
    warehouseLink: "#",
    notes: "adjusment stock",
    createdBy: "ANGGA NOVIANTO",
    updatedBy: "ANGGA NOVIANTO",
    updatedAt: "24 Jun 2026 04:15 PM",
    journal: "13852620",
    journalLink: "#",
    status: "APPROVED",
    products: [
      { no: 1, sku: "VERWERDEN", product: "PENETRAND WD", productCode: "PENETRANT SPRAY", unitPrice: 25225, inventoryStock: 20, reservedStock: 0, availableStock: 20, countedStock: 22, difference: 2, approved: 2, expenseAccount: "510101 - HARGA POKOK PENJUALAN" },
    ],
  },
  "WST/WJY/26060005": {
    refCode: "WST/WJY/26060005",
    date: "24 Jun 2026",
    completedDate: "24 Jun 2026 04:20 PM",
    approvedDate: "24 Jun 2026 04:25 PM",
    warehouse: "Gudang Wijaya",
    warehouseLink: "#",
    notes: "adjusment stock",
    createdBy: "ANGGA NOVIANTO",
    updatedBy: "ANGGA NOVIANTO",
    updatedAt: "24 Jun 2026 04:25 PM",
    journal: "13852625",
    journalLink: "#",
    status: "APPROVED",
    products: [
      { no: 1, sku: "OLM-5W30", product: "OLI MESIN 5W-30", productCode: "ENGINE OIL 5W30 4L", unitPrice: 85000, inventoryStock: 100, reservedStock: 0, availableStock: 100, countedStock: 98, difference: -2, approved: -2, expenseAccount: "510101 - HARGA POKOK PENJUALAN" },
    ],
  },
  "WST/WJY/26060006": {
    refCode: "WST/WJY/26060006",
    date: "24 Jun 2026",
    completedDate: "24 Jun 2026 04:30 PM",
    approvedDate: "24 Jun 2026 04:35 PM",
    warehouse: "Gudang Wijaya",
    warehouseLink: "#",
    notes: "adjusment stock",
    createdBy: "ANGGA NOVIANTO",
    updatedBy: "ANGGA NOVIANTO",
    updatedAt: "24 Jun 2026 04:35 PM",
    journal: "13852630",
    journalLink: "#",
    status: "APPROVED",
    products: [
      { no: 1, sku: "FLT-UDARA", product: "FILTER UDARA", productCode: "AIR FILTER ASSY", unitPrice: 42000, inventoryStock: 80, reservedStock: 0, availableStock: 80, countedStock: 82, difference: 2, approved: 2, expenseAccount: "510101 - HARGA POKOK PENJUALAN" },
    ],
  },
  "WST/WJY/26060007": {
    refCode: "WST/WJY/26060007",
    date: "24 Jun 2026",
    completedDate: "24 Jun 2026 04:40 PM",
    approvedDate: "24 Jun 2026 04:45 PM",
    warehouse: "Gudang Wijaya",
    warehouseLink: "#",
    notes: "adjusment stock",
    createdBy: "ANGGA NOVIANTO",
    updatedBy: "ANGGA NOVIANTO",
    updatedAt: "24 Jun 2026 04:45 PM",
    journal: "13852635",
    journalLink: "#",
    status: "APPROVED",
    products: [
      { no: 1, sku: "PLG-BUSI", product: "PLUG BUSI", productCode: "SPARK PLUG IRIDIUM", unitPrice: 35000, inventoryStock: 60, reservedStock: 0, availableStock: 60, countedStock: 58, difference: -2, approved: -2, expenseAccount: "510101 - HARGA POKOK PENJUALAN" },
    ],
  },
  "WST/WJY/26060008": {
    refCode: "WST/WJY/26060008",
    date: "24 Jun 2026",
    completedDate: "24 Jun 2026 04:50 PM",
    approvedDate: "24 Jun 2026 04:55 PM",
    warehouse: "Gudang Wijaya",
    warehouseLink: "#",
    notes: "adjusment stock",
    createdBy: "ANGGA NOVIANTO",
    updatedBy: "ANGGA NOVIANTO",
    updatedAt: "24 Jun 2026 04:55 PM",
    journal: "13852640",
    journalLink: "#",
    status: "APPROVED",
    products: [
      { no: 1, sku: "KP-REM-DEP", product: "KAMPAS REM DEPAN", productCode: "BRAKE PAD SET", unitPrice: 165000, inventoryStock: 25, reservedStock: 0, availableStock: 25, countedStock: 27, difference: 2, approved: 2, expenseAccount: "510101 - HARGA POKOK PENJUALAN" },
    ],
  },
  "WST/WJY/26060009": {
    refCode: "WST/WJY/26060009",
    date: "24 Jun 2026",
    completedDate: "24 Jun 2026 05:00 PM",
    approvedDate: "24 Jun 2026 05:05 PM",
    warehouse: "Gudang Wijaya",
    warehouseLink: "#",
    notes: "adjusment stock",
    createdBy: "ANGGA NOVIANTO",
    updatedBy: "ANGGA NOVIANTO",
    updatedAt: "24 Jun 2026 05:05 PM",
    journal: "13852645",
    journalLink: "#",
    status: "APPROVED",
    products: [
      { no: 1, sku: "V-BELT", product: "V-BELT MESIN", productCode: "DRIVE BELT", unitPrice: 45000, inventoryStock: 40, reservedStock: 0, availableStock: 40, countedStock: 38, difference: -2, approved: -2, expenseAccount: "510101 - HARGA POKOK PENJUALAN" },
    ],
  },
  "WST/WJY/26060010": {
    refCode: "WST/WJY/26060010",
    date: "24 Jun 2026",
    completedDate: "24 Jun 2026 05:10 PM",
    approvedDate: "24 Jun 2026 05:15 PM",
    warehouse: "Gudang Wijaya",
    warehouseLink: "#",
    notes: "adjusment stock",
    createdBy: "ANGGA NOVIANTO",
    updatedBy: "ANGGA NOVIANTO",
    updatedAt: "24 Jun 2026 05:15 PM",
    journal: "13852650",
    journalLink: "#",
    status: "APPROVED",
    products: [
      { no: 1, sku: "SP-PST-KIT", product: "PISTON KIT", productCode: "PISTON ASSY", unitPrice: 450000, inventoryStock: 10, reservedStock: 0, availableStock: 10, countedStock: 12, difference: 2, approved: 2, expenseAccount: "510101 - HARGA POKOK PENJUALAN" },
    ],
  },
  "WST/WJY/26060011": {
    refCode: "WST/WJY/26060011",
    date: "24 Jun 2026",
    completedDate: "24 Jun 2026 05:20 PM",
    approvedDate: "24 Jun 2026 05:25 PM",
    warehouse: "Gudang Wijaya",
    warehouseLink: "#",
    notes: "adjusment stock",
    createdBy: "ANGGA NOVIANTO",
    updatedBy: "ANGGA NOVIANTO",
    updatedAt: "24 Jun 2026 05:25 PM",
    journal: "13852655",
    journalLink: "#",
    status: "APPROVED",
    products: [
      { no: 1, sku: "GLT-KIT-01", product: "GASKET KIT", productCode: "GASKET SET", unitPrice: 350000, inventoryStock: 15, reservedStock: 0, availableStock: 15, countedStock: 14, difference: -1, approved: -1, expenseAccount: "510101 - HARGA POKOK PENJUALAN" },
    ],
  },
  "WST/WJY/26060012": {
    refCode: "WST/WJY/26060012",
    date: "24 Jun 2026",
    completedDate: "24 Jun 2026 05:30 PM",
    approvedDate: "24 Jun 2026 05:35 PM",
    warehouse: "Gudang Wijaya",
    warehouseLink: "#",
    notes: "adjusment stock",
    createdBy: "ANGGA NOVIANTO",
    updatedBy: "ANGGA NOVIANTO",
    updatedAt: "24 Jun 2026 05:35 PM",
    journal: "13852660",
    journalLink: "#",
    status: "APPROVED",
    products: [
      { no: 1, sku: "KP-REM-BLK", product: "KAMPAS REM BELAKANG", productCode: "BRAKE SHOE REAR", unitPrice: 85000, inventoryStock: 35, reservedStock: 0, availableStock: 35, countedStock: 36, difference: 1, approved: 1, expenseAccount: "510101 - HARGA POKOK PENJUALAN" },
    ],
  },
  "WST/WJY/26060013": {
    refCode: "WST/WJY/26060013",
    date: "24 Jun 2026",
    completedDate: "24 Jun 2026 05:40 PM",
    approvedDate: "24 Jun 2026 05:45 PM",
    warehouse: "Gudang Wijaya",
    warehouseLink: "#",
    notes: "adjusment stock",
    createdBy: "ANGGA NOVIANTO",
    updatedBy: "ANGGA NOVIANTO",
    updatedAt: "24 Jun 2026 05:45 PM",
    journal: "13852665",
    journalLink: "#",
    status: "APPROVED",
    products: [
      { no: 1, sku: "OLM-0W20", product: "OLI MESIN 0W-20", productCode: "FULLY SYNTH OIL 4L", unitPrice: 120000, inventoryStock: 70, reservedStock: 0, availableStock: 70, countedStock: 68, difference: -2, approved: -2, expenseAccount: "510101 - HARGA POKOK PENJUALAN" },
    ],
  },
  "WST/WJY/26060014": {
    refCode: "WST/WJY/26060014",
    date: "24 Jun 2026",
    completedDate: "24 Jun 2026 05:50 PM",
    approvedDate: "24 Jun 2026 05:55 PM",
    warehouse: "Gudang Wijaya",
    warehouseLink: "#",
    notes: "adjusment stock",
    createdBy: "ANGGA NOVIANTO",
    updatedBy: "ANGGA NOVIANTO",
    updatedAt: "24 Jun 2026 05:55 PM",
    journal: "13852670",
    journalLink: "#",
    status: "APPROVED",
    products: [
      { no: 1, sku: "FLT-OLI", product: "FILTER OLI", productCode: "OIL FILTER", unitPrice: 42000, inventoryStock: 90, reservedStock: 0, availableStock: 90, countedStock: 92, difference: 2, approved: 2, expenseAccount: "510101 - HARGA POKOK PENJUALAN" },
    ],
  },
};

const workflowSteps = ["DRAFT", "COMPLETED", "APPROVED"];

const fmt = (n: number) => n.toLocaleString("id-ID");

export default function StockOpnameDetailPage() {
  const router = useRouter();
  const params = useParams();
  const refCodeArray = params.refCode as string[];
  const refCode = refCodeArray ? refCodeArray.join("/") : "";
  const opname = opnameData[refCode];
  const [activeTab, setActiveTab] = useState<"details" | "products">("details");

  if (!opname) {
    return (
      <div style={{ padding: 24 }}>
        <button
          onClick={() => router.push("/warehouse/stock-opname")}
          style={S.backBtn}
        >
          <ArrowLeft size={16} /> Kembali
        </button>
        <div style={S.card}>
          <p style={{ color: "#444746", fontSize: 14 }}>
            Stock Opname tidak ditemukan: {refCode}
          </p>
        </div>
      </div>
    );
  }

  const currentStepIdx = workflowSteps.indexOf(opname.status);

  return (
    <div style={{ padding: "0 24px 24px" }}>
      {/* Back Button */}
      <button
        onClick={() => router.push("/warehouse/stock-opname")}
        style={S.backBtn}
      >
        <ArrowLeft size={16} /> Warehouse Stock Opname
      </button>

      {/* Title */}
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: "#001526",
          marginBottom: 12,
        }}
      >
        Warehouse Stock Opname
      </div>

      {/* Workflow Bar */}
      <div style={S.workflowBar}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{ fontSize: 12, fontWeight: 600, color: "#444746" }}
          >
            Workflow
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            {workflowSteps.map((step, i) => (
              <span
                key={step}
                style={{
                  ...S.badge,
                  background: i === currentStepIdx ? "#001526" : "transparent",
                  color: i === currentStepIdx ? "#fff" : "#8e8f8e",
                  border: `1px solid ${
                    i === currentStepIdx ? "#001526" : "#d8d8d8"
                  }`,
                }}
              >
                {step}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={S.actionBtn}>
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 0,
          marginBottom: 16,
          background: "#ecebea",
          borderRadius: 8,
          padding: 3,
          width: "fit-content",
        }}
      >
        <button
          onClick={() => setActiveTab("details")}
          style={{
            padding: "7px 18px",
            fontSize: 13,
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            whiteSpace: "nowrap",
            color: activeTab === "details" ? "#fff" : "#444746",
            background: activeTab === "details" ? "#0176d3" : "transparent",
            fontWeight: activeTab === "details" ? 600 : 400,
          }}
        >
          Details
        </button>
        <button
          onClick={() => setActiveTab("products")}
          style={{
            padding: "7px 18px",
            fontSize: 13,
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            whiteSpace: "nowrap",
            color: activeTab === "products" ? "#fff" : "#444746",
            background: activeTab === "products" ? "#0176d3" : "transparent",
            fontWeight: activeTab === "products" ? 600 : 400,
          }}
        >
          Products
        </button>
      </div>

      {/* Details Tab */}
      {activeTab === "details" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 32,
            marginBottom: 20,
          }}
        >
          {/* Left Column */}
          <div>
            <F label="REF CODE" value={opname.refCode} />
            <F label="DATE" value={opname.date} />
            <F label="COMPLETED DATE" value={opname.completedDate} />
            <F label="APPROVED DATE" value={opname.approvedDate} />
            <F
              label="WAREHOUSE"
              value={opname.warehouse}
              link
              onClick={() => {}}
            />
            <F label="NOTES" value={opname.notes} />
          </div>
          {/* Right Column */}
          <div style={{ borderLeft: "1px solid #ecebea", paddingLeft: 32 }}>
            <F label="CREATED BY" value={opname.createdBy} />
            <F label="UPDATED BY" value={opname.updatedBy} />
            <F label="UPDATED AT" value={opname.updatedAt} />
            <F
              label="JOURNAL"
              value={opname.journal}
              link
              onClick={() => {}}
            />
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <div>
          {/* Products Filter */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 12,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <div className="form-group" style={{ flex: 1, minWidth: 120 }}>
              <label className="form-label">SKU</label>
              <input type="text" className="form-input" placeholder="SKU..." />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
              <label className="form-label">Product Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Product name..."
              />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
              <label className="form-label">Product Type</label>
              <select className="form-select">
                <option>All Type</option>
                <option>Sparepart</option>
                <option>Oli</option>
                <option>Aksesoris</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
              <label className="form-label">Product Brand</label>
              <select className="form-select">
                <option>All Brand</option>
                <option>NGK</option>
                <option>AISIN</option>
                <option>BOSCH</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">&nbsp;</label>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn--brand btn--sm">
                  <Search size={14} /> Cari
                </button>
                <button
                  className="btn btn--outline btn--sm"
                  style={{ whiteSpace: "nowrap" }}
                >
                  Show All
                </button>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>No</th>
                  <th style={{ minWidth: 160 }}>SKU</th>
                  <th>Product</th>
                  <th>Product Code</th>
                  <th style={{ textAlign: "right" }}>Unit Price (Rp)</th>
                  <th style={{ textAlign: "right" }}>Inventory Stock</th>
                  <th style={{ textAlign: "right" }}>Reserved Stock</th>
                  <th style={{ textAlign: "right" }}>Available Stock</th>
                  <th style={{ textAlign: "right" }}>Counted Stock</th>
                  <th style={{ textAlign: "right" }}>Difference</th>
                  <th style={{ textAlign: "right" }}>Approved</th>
                  <th>Expense Account</th>
                </tr>
              </thead>
              <tbody>
                {opname.products.map((p: any) => (
                  <tr key={p.no}>
                    <td>{p.no}</td>
                    <td
                      style={{
                        color: "#0176d3",
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                      onClick={() => router.push(`/products/${p.sku}`)}
                    >
                      {p.sku}
                    </td>
                    <td
                      style={{
                        color: "#0176d3",
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                      onClick={() => router.push(`/products/${p.sku}`)}
                    >
                      {p.product}
                    </td>
                    <td>{p.productCode}</td>
                    <td style={{ textAlign: "right" }}>Rp {fmt(p.unitPrice)}</td>
                    <td style={{ textAlign: "right" }}>{p.inventoryStock}</td>
                    <td style={{ textAlign: "right" }}>{p.reservedStock}</td>
                    <td style={{ textAlign: "right" }}>{p.availableStock}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>{p.countedStock}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>{p.difference}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>{p.approved}</td>
                    <td style={{ fontSize: 11 }}>{p.expenseAccount}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: "#f9f9f9" }}>
                  <td
                    style={{
                      fontWeight: 700,
                      borderTop: "2px solid #ecebea",
                      padding: "8px 10px",
                    }}
                  >
                    TOTAL
                  </td>
                  <td style={{ borderTop: "2px solid #ecebea", padding: "8px 10px" }}></td>
                  <td style={{ borderTop: "2px solid #ecebea", padding: "8px 10px" }}></td>
                  <td style={{ borderTop: "2px solid #ecebea", padding: "8px 10px" }}></td>
                  <td style={{ borderTop: "2px solid #ecebea", padding: "8px 10px" }}></td>
                  <td style={{ textAlign: "right", fontWeight: 700, borderTop: "2px solid #ecebea", padding: "8px 10px" }}>
                    {opname.products.reduce((s: number, p: any) => s + p.inventoryStock, 0)}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 700, borderTop: "2px solid #ecebea", padding: "8px 10px" }}>
                    {opname.products.reduce((s: number, p: any) => s + p.reservedStock, 0)}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 700, borderTop: "2px solid #ecebea", padding: "8px 10px" }}>
                    {opname.products.reduce((s: number, p: any) => s + p.availableStock, 0)}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 700, borderTop: "2px solid #ecebea", padding: "8px 10px" }}>
                    {opname.products.reduce((s: number, p: any) => s + p.countedStock, 0)}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 700, borderTop: "2px solid #ecebea", padding: "8px 10px" }}>
                    {opname.products.reduce((s: number, p: any) => s + p.difference, 0)}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 700, borderTop: "2px solid #ecebea", padding: "8px 10px" }}>
                    {opname.products.reduce((s: number, p: any) => s + p.approved, 0)}
                  </td>
                  <td style={{ borderTop: "2px solid #ecebea", padding: "8px 10px" }}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function F({
  label,
  value,
  link = false,
  onClick,
}: {
  label: string;
  value: string;
  link?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      style={{ marginBottom: 10, cursor: link ? "pointer" : "default" }}
      onClick={onClick}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#444746",
          textTransform: "uppercase" as const,
          letterSpacing: "0.04em",
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: link ? "#0176d3" : "#001526",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {value}
        {link && <ChevronRight size={13} style={{ color: "#0176d3" }} />}
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    fontSize: 13,
    fontWeight: 500,
    color: "#444746",
    background: "#fff",
    border: "1px solid #d8d8d8",
    borderRadius: 6,
    cursor: "pointer",
    marginBottom: 16,
  },
  card: {
    background: "#fff",
    border: "1px solid #ecebea",
    borderRadius: 8,
    padding: 20,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  workflowBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 14px",
    background: "#f9f9f9",
    border: "1px solid #ecebea",
    borderRadius: 8,
    marginBottom: 16,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 10px",
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.03em" as const,
  },
  actionBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "5px 12px",
    fontSize: 12,
    fontWeight: 500,
    color: "#001526",
    background: "#fff",
    border: "1px solid #d8d8d8",
    borderRadius: 6,
    cursor: "pointer",
  },
};
