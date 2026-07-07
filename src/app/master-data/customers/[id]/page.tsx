"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Edit } from "lucide-react";

const data: Record<string, any> = {
  "C-001": {
    id: "C-001", name: "Budi Santoso", phone: "0812-3456-7890", type: "Retail",
    address: "Jl. Merdeka No. 10, Jakarta", email: "budi@email.com", vehicles: 1,
    storeTerbanyak: "Wijaya Motor One Stop Service - Jakarta Pusat", totalTransaksi: 12, lastService: "5 Jul 2026",
    history: [
      { no: "SRO-001", date: "5 Jul 2026", vehicle: "Toyota Avanza", store: "Wijaya Motor One Stop Service - Jakarta Pusat", status: "Approved", total: "Rp 2.500.000" },
      { no: "SRO-005", date: "24 Jun 2026", vehicle: "Toyota Avanza", store: "Wijaya Motor One Stop Service - Jakarta Pusat", status: "Completed", total: "Rp 950.000" },
      { no: "SRO-008", date: "22 Jun 2026", vehicle: "Toyota Avanza", store: "Wijaya Motor One Stop Service - Jakarta Pusat", status: "Draft", total: "Rp 1.200.000" },
    ],
    workOrders: [
      { no: "SWO/001/26060149", date: "26 Jun 2026", vehicle: "Toyota Avanza", status: "IN PROGRESS", total: "Rp 633.500" },
    ]
  },
  "C-002": {
    id: "C-002", name: "PT Maju Jaya", phone: "021-555-1234", type: "Wholesale",
    address: "Jl. Sudirman No. 55, Jakarta", email: "info@majujaya.co.id", vehicles: 3,
    storeTerbanyak: "Wijaya Motor One Stop Service - Jakarta Selatan", totalTransaksi: 47, lastService: "4 Jul 2026",
    fleet: [
      { vehicleNo: "B 5678 EF", vehicleType: "Car", category: "Sedan", make: "HONDA", model: "CIVIC", year: "2021", enginePower: "1.500 CC", engineBrand: "HONDA", engineModel: "L15B7", engineYear: "2021" },
      { vehicleNo: "B 2468 XY", vehicleType: "Car", category: "MPV", make: "TOYOTA", model: "INNOVA", year: "2022", enginePower: "2.400 CC", engineBrand: "TOYOTA", engineModel: "2GD-FTV", engineYear: "2022" },
      { vehicleNo: "B 9012 ZZ", vehicleType: "Car", category: "Van", make: "TOYOTA", model: "HIACE COMMUTER", year: "2023", enginePower: "2.800 CC", engineBrand: "TOYOTA", engineModel: "1GD-FTV", engineYear: "2023" },
    ],
    history: [
      { no: "SRO-002", date: "4 Jul 2026", vehicle: "Honda Civic", store: "Wijaya Motor One Stop Service - Jakarta Selatan", status: "Approved", total: "Rp 1.800.000" },
      { no: "SRO-010", date: "1 Jul 2026", vehicle: "Toyota Hiace", store: "Wijaya Motor One Stop Service - Jakarta Selatan", status: "Completed", total: "Rp 3.200.000" },
      { no: "SRO-012", date: "28 Jun 2026", vehicle: "Honda Civic", store: "Wijaya Motor One Stop Service - Jakarta Pusat", status: "Completed", total: "Rp 2.100.000" },
    ]
  },
  "C-003": { id: "C-003", name: "Siti Rahmawati", phone: "0856-7890-1234", type: "Retail", address: "Jl. Thamrin No. 20", email: "siti@email.com", vehicles: 1, storeTerbanyak: "Wijaya Motor One Stop Service - Bandung", totalTransaksi: 8, lastService: "3 Jul 2026", workOrders: [], history: [
    { no: "SRO-003", date: "3 Jul 2026", vehicle: "Daihatsu Xenia", store: "Wijaya Motor One Stop Service - Bandung", status: "Approved", total: "Rp 1.500.000" },
  ]},
  "C-004": { id: "C-004", name: "CV Berkah Abadi", phone: "022-888-5678", type: "Wholesale", address: "Jl. Asia Afrika No. 30", email: "berkah@abadi.co.id", vehicles: 2, storeTerbanyak: "Wijaya Motor One Stop Service - Bandung", totalTransaksi: 31, lastService: "3 Jul 2026", workOrders: [
      { no: "SWO/004/26060153", date: "24 Jun 2026", vehicle: "Suzuki Ertiga", status: "COMPLETED", total: "Rp 350.000" },
    ],
    fleet: [
      { vehicleNo: "B 3456 IJ", vehicleType: "Car", category: "MPV", make: "SUZUKI", model: "ERTIGA", year: "2022", enginePower: "1.500 CC", engineBrand: "SUZUKI", engineModel: "K15B", engineYear: "2022" },
      { vehicleNo: "B 1314 OP", vehicleType: "Car", category: "Pickup", make: "MITSUBISHI", model: "L300", year: "2020", enginePower: "2.500 CC", engineBrand: "MITSUBISHI", engineModel: "4D56", engineYear: "2020" },
    ],
    history: [
    { no: "SRO-004", date: "3 Jul 2026", vehicle: "Suzuki Carry", store: "Wijaya Motor One Stop Service - Bandung", status: "Completed", total: "Rp 4.500.000" },
  ]},
  "C-005": { id: "C-005", name: "Ahmad Fauzi", phone: "0878-9012-3456", type: "Retail", address: "Jl. Pemuda No. 15", email: "ahmad@email.com", vehicles: 1, storeTerbanyak: "Wijaya Motor One Stop Service - Jakarta Pusat", totalTransaksi: 5, lastService: "2 Jul 2026", workOrders: [], history: [
    { no: "SRO-006", date: "2 Jul 2026", vehicle: "Honda Jazz", store: "Wijaya Motor One Stop Service - Jakarta Pusat", status: "Completed", total: "Rp 900.000" },
  ]},
  "C-006": { id: "C-006", name: "PT Transport Jaya", phone: "021-777-9012", type: "Wholesale", address: "Jl. Gatot Subroto No. 67", email: "info@transportjaya.co.id", vehicles: 5, storeTerbanyak: "Wijaya Motor One Stop Service - Jakarta Pusat", totalTransaksi: 89, lastService: "1 Jul 2026", workOrders: [
      { no: "SWO/006/26060155", date: "25 Jun 2026", vehicle: "Isuzu Elf", status: "IN PROGRESS", total: "Rp 4.175.000" },
    ], history: [
    { no: "SRO-007", date: "1 Jul 2026", vehicle: "Mitsubishi Fuso", store: "Wijaya Motor One Stop Service - Jakarta Pusat", status: "In Progress", total: "Rp 12.000.000" },
  ]},
  "C-007": {
    id: "C-007", name: "Dewi Lestari", phone: "0813-4567-8901", type: "Retail",
    address: "Jl. Diponegoro No. 42, Surabaya", email: "dewi@email.com", vehicles: 2,
    storeTerbanyak: "Wijaya Motor One Stop Service - Surabaya", totalTransaksi: 15, lastService: "30 Jun 2026",
    history: [
      { no: "SRO-015", date: "30 Jun 2026", vehicle: "Honda Brio", store: "Wijaya Motor One Stop Service - Surabaya", status: "Completed", total: "Rp 1.850.000" },
      { no: "SRO-018", date: "15 Jun 2026", vehicle: "Honda Brio", store: "Wijaya Motor One Stop Service - Surabaya", status: "Completed", total: "Rp 650.000" },
    ]
  },
  "C-008": {
    id: "C-008", name: "PT Sinar Auto", phone: "031-444-7890", type: "Wholesale",
    address: "Jl. Raya Darmo No. 88, Surabaya", email: "info@sinarauto.co.id", vehicles: 8,
    storeTerbanyak: "Wijaya Motor One Stop Service - Surabaya", totalTransaksi: 62, lastService: "29 Jun 2026",
    history: [
      { no: "SRO-020", date: "29 Jun 2026", vehicle: "Isuzu Elf", store: "Wijaya Motor One Stop Service - Surabaya", status: "Approved", total: "Rp 8.700.000" },
    ]
  },
  "C-009": { id: "C-009", name: "Rudi Hermawan", phone: "0857-1234-5678", type: "Retail", address: "Jl. Kemang No. 12, Jakarta", email: "rudi@email.com", vehicles: 1, storeTerbanyak: "Wijaya Motor One Stop Service - Jakarta Selatan", totalTransaksi: 3, lastService: "28 Jun 2026", history: [] },
  "C-010": { id: "C-010", name: "PT Karya Mandiri", phone: "021-333-4567", type: "Wholesale", address: "Jl. Hayam Wuruk No. 55, Jakarta", email: "info@karyamandiri.co.id", vehicles: 4, storeTerbanyak: "Wijaya Motor One Stop Service - Jakarta Pusat", totalTransaksi: 55, lastService: "27 Jun 2026", history: [] },
  "C-011": { id: "C-011", name: "Nina Anggraini", phone: "0822-9876-5432", type: "Retail", address: "Jl. Cihampelas No. 25, Bandung", email: "nina@email.com", vehicles: 1, storeTerbanyak: "Wijaya Motor One Stop Service - Bandung", totalTransaksi: 6, lastService: "26 Jun 2026", history: [] },
  "C-012": { id: "C-012", name: "Hendra Gunawan", phone: "0819-5555-1111", type: "Retail", address: "Jl. Kelapa Gading No. 7, Jakarta", email: "hendra@email.com", vehicles: 1, storeTerbanyak: "Wijaya Motor One Stop Service - Jakarta Pusat", totalTransaksi: 9, lastService: "25 Jun 2026", history: [] },
};

const statusPill = (status: string) => {
  const map: Record<string, string> = { Draft: "#6b7280", Approved: "#0176d3", "In Progress": "#f59e0b", Completed: "#2e844a", Cancelled: "#ea001e" };
  return map[status] || "#6b7280";
};

const excludedStatuses = ["Draft", "Cancelled", "Pending"];

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"details" | "history" | "workorders" | "vehicles">("details");
  const item = data[params.id as string];

  if (!item) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/master-data/customers")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" }}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <div style={{ background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 16, marginTop: 16 }}><p style={{ color: "#444746" }}>Data tidak ditemukan</p></div>
      </div>
    );
  }

  const filteredHistory = item.history.filter((h: any) => !excludedStatuses.includes(h.status));

  return (
    <div style={{ padding: "0 24px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button onClick={() => router.push("/master-data/customers")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" }}>
          <ArrowLeft size={16} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>Customer Details</h1>
          <div style={{ fontSize: 13, color: "#0176d3", marginTop: 2 }}>{item.name}</div>
        </div>
        <button style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", fontSize: 12, fontWeight: 500, color: "#fff", background: "#0176d3", border: "1px solid #0176d3", borderRadius: 6, cursor: "pointer" }}>
          <Edit size={14} /> Edit
        </button>
      </div>

      <div style={{ display: "flex", gap: 0, marginBottom: 16, background: "#ecebea", borderRadius: 8, padding: 3, width: "fit-content" }}>
        <button key="details" onClick={() => setActiveTab("details")} style={{ padding: "7px 18px", fontSize: 13, border: "none", borderRadius: 6, cursor: "pointer", color: activeTab === "details" ? "#fff" : "#444746", background: activeTab === "details" ? "#0176d3" : "transparent", fontWeight: activeTab === "details" ? 600 : 400 }}>Details</button>
        <button key="history" onClick={() => setActiveTab("history")} style={{ padding: "7px 18px", fontSize: 13, border: "none", borderRadius: 6, cursor: "pointer", color: activeTab === "history" ? "#fff" : "#444746", background: activeTab === "history" ? "#0176d3" : "transparent", fontWeight: activeTab === "history" ? 600 : 400 }}>Service Orders</button>
        <button key="workorders" onClick={() => setActiveTab("workorders")} style={{ padding: "7px 18px", fontSize: 13, border: "none", borderRadius: 6, cursor: "pointer", color: activeTab === "workorders" ? "#fff" : "#444746", background: activeTab === "workorders" ? "#0176d3" : "transparent", fontWeight: activeTab === "workorders" ? 600 : 400 }}>Work Orders</button>
        {item.type === "Wholesale" && (
          <button key="vehicles" onClick={() => setActiveTab("vehicles")} style={{ padding: "7px 18px", fontSize: 13, border: "none", borderRadius: 6, cursor: "pointer", color: activeTab === "vehicles" ? "#fff" : "#444746", background: activeTab === "vehicles" ? "#0176d3" : "transparent", fontWeight: activeTab === "vehicles" ? 600 : 400 }}>Vehicles</button>
        )}
      </div>

      {activeTab === "details" && (
        <div style={{ background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 16 }}>
          <F label="ID" value={item.id} />
          <F label="NAMA" value={item.name} />
          <F label="TELEPON" value={item.phone} />
          <F label="TIPE" value={item.type} />
          <F label="ALAMAT" value={item.address} />
          <F label="EMAIL" value={item.email} />
          <F label="KENDARAAN" value={item.vehicles + " unit"} />
          <F label="STORE TERBANYAK" value={item.storeTerbanyak} />
          <F label="TOTAL TRANSAKSI" value={String(item.totalTransaksi) + " kali"} />
          <F label="SERVICE TERAKHIR" value={item.lastService} />
        </div>
      )}

      {activeTab === "history" && (
        <div style={{ border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
          {filteredHistory.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>No. SRO</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>Date</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>Vehicle</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>Store</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>Status</th>
                  <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((h: any, i: number) => (
                  <tr key={i} style={{ cursor: "pointer" }} onClick={() => router.push(`/service-orders/${h.no}`)}>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0", color: "#0176d3", fontWeight: 500 }}>{h.no}</td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0" }}>{h.date}</td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0" }}>{h.vehicle}</td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0", fontSize: 12, color: "#444746" }}>{h.store}</td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0" }}>
                      <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: statusPill(h.status), color: "#fff" }}>{h.status}</span>
                    </td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0", textAlign: "right", fontWeight: 500 }}>{h.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: 24, textAlign: "center", color: "#8e8f8e" }}>Belum ada history service order</div>
          )}
        </div>
      )}

      {/* Work Orders Tab */}
      {activeTab === "workorders" && (
        <div style={{ border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
          {item.workOrders && item.workOrders.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={TH}>No. SWO</th>
                  <th style={TH}>Date</th>
                  <th style={TH}>Vehicle</th>
                  <th style={TH}>Status</th>
                  <th style={{ ...TH, textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {item.workOrders.map((wo: any, i: number) => {
                  const c: Record<string, string> = { "IN PROGRESS": "#0176d3", "COMPLETED": "#2e844a", "DRAFT": "#6b7280", "CANCELLED": "#ea001e" };
                  return (
                  <tr key={i} style={{ cursor: "pointer" }} onClick={() => router.push(`/work-orders/${wo.no}`)}>
                    <td style={{ ...TD, color: "#0176d3", fontWeight: 500 }}>{wo.no}</td>
                    <td style={TD}>{wo.date}</td>
                    <td style={TD}>{wo.vehicle}</td>
                    <td style={TD}>
                      <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: c[wo.status] || "#6b7280", color: "#fff" }}>{wo.status}</span>
                    </td>
                    <td style={{ ...TD, textAlign: "right", fontWeight: 500 }}>{wo.total}</td>
                  </tr>
                );})}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: 24, textAlign: "center", color: "#8e8f8e" }}>Belum ada work order</div>
          )}
        </div>
      )}

      {/* Vehicles Tab — Wholesale only */}
      {activeTab === "vehicles" && item.fleet && (
        <div style={{ border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <th style={TH}>Vehicle No</th>
                <th style={TH}>Vehicle Type</th>
                <th style={TH}>Category</th>
                <th style={TH}>Make</th>
                <th style={TH}>Model</th>
                <th style={TH}>Year</th>
                <th style={TH}>Engine Power</th>
                <th style={TH}>Engine Brand</th>
                <th style={TH}>Engine Model</th>
                <th style={TH}>Engine Year</th>
                <th style={{ ...TH, textAlign: "center", width: 70 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {item.fleet.map((v: any, i: number) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                  <td style={{ ...TD, color: "#0176d3", fontWeight: 500, cursor: "pointer" }} onClick={() => router.push(`/master-data/vehicles/${v.vehicleNo}`)}>{v.vehicleNo}</td>
                  <td style={TD}>{v.vehicleType}</td>
                  <td style={TD}>{v.category}</td>
                  <td style={TD}>{v.make}</td>
                  <td style={TD}>{v.model}</td>
                  <td style={TD}>{v.year}</td>
                  <td style={TD}>{v.enginePower}</td>
                  <td style={TD}>{v.engineBrand}</td>
                  <td style={TD}>{v.engineModel}</td>
                  <td style={TD}>{v.engineYear}</td>
                  <td style={{ ...TD, textAlign: "center" }}>
                    <button style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", fontSize: 11, fontWeight: 500, color: "#0176d3", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 4, cursor: "pointer" }} onClick={() => router.push(`/master-data/vehicles/${v.vehicleNo}`)}>
                      <Edit size={12} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const TH: React.CSSProperties = { padding: "8px 10px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", background: "#f9f9f9", borderBottom: "1px solid #ecebea", letterSpacing: "0.04em", whiteSpace: "nowrap" };
const TD: React.CSSProperties = { padding: "8px 10px", borderBottom: "1px solid #f0f0f0", color: "#001526" };

function F({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", borderBottom: "1px solid #f0f0f0" }}>
      <span style={{ fontSize: 12, color: "#444746" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 500, color: "#001526" }}>{value}</span>
    </div>
  );
}
