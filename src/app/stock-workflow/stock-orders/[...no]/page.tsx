"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer, Search } from "lucide-react";

const stockOrderData: Record<string, any> = {
  "OPO/WM/26060060": { refCode: "OPO/WM/26060060", referenceNumber: "B6232TQB", fromWarehouse: "Gudang Wijaya", deliverTo: "PT Putra Wijaya Motor", createdBy: "Andi Yahya", updatedBy: "ANGGA NOVIANTO", notes: "Adjusment Stock", createdAt: "24-Jun-2026 03:38 PM", updatedAt: "24-Jun-2026 04:00 PM", confirmedDate: "24-Jun-2026 03:38 PM", sentDate: "24-Jun-2026 04:00 PM", receivedDate: "24-Jun-2026 04:00 PM", source: "Web", journals: ["13852764", "13852766"], status: "STORE RECEIVED", items: [{ no: 1, sku: "WURTH-CARBCLEANER", product: "CARBURATOR CLEANER", productCode: "", order: 1, sent: 1, receive: 1, avgCost: 18717 }] },
  "OPO/WM/26060059": { refCode: "OPO/WM/26060059", referenceNumber: "B1234ABC", fromWarehouse: "Gudang Wijaya", deliverTo: "PT Putra Wijaya Motor", createdBy: "Andi Yahya", updatedBy: "ANGGA NOVIANTO", notes: "", createdAt: "24-Jun-2026 10:15 AM", updatedAt: "24-Jun-2026 11:00 AM", confirmedDate: "24-Jun-2026 10:15 AM", sentDate: "24-Jun-2026 11:00 AM", receivedDate: "24-Jun-2026 11:00 AM", source: "Web", journals: ["13852770"], status: "STORE RECEIVED", items: [{ no: 1, sku: "OLM-5W30", product: "OLI MESIN 5W-30", productCode: "OLI MESIN 4T", order: 2, sent: 2, receive: 2, avgCost: 50340 }] },
  "OPO/WM/26060058": { refCode: "OPO/WM/26060058", referenceNumber: "C5678DEF", fromWarehouse: "Gudang Wijaya", deliverTo: "PT Putra Wijaya Motor", createdBy: "Andi Yahya", updatedBy: "ANGGA NOVIANTO", notes: "", createdAt: "23-Jun-2026 02:00 PM", updatedAt: "23-Jun-2026 03:00 PM", confirmedDate: "23-Jun-2026 02:00 PM", sentDate: "23-Jun-2026 03:00 PM", receivedDate: "23-Jun-2026 03:00 PM", source: "Web", journals: ["13852780"], status: "STORE RECEIVED", items: [{ no: 1, sku: "KP-REM-DEP", product: "KAMPAS REM DEPAN", productCode: "KAMPAS REM DISC", order: 4, sent: 4, receive: 4, avgCost: 130601 }] },
  "OPO/PJ/26060092": { refCode: "OPO/PJ/26060092", referenceNumber: "D9012GHI", fromWarehouse: "Gudang Wijaya", deliverTo: "PT Putro Joyo Motor", createdBy: "Andi Yahya", updatedBy: "ANGGA NOVIANTO", notes: "", createdAt: "24-Jun-2026 09:00 AM", updatedAt: "24-Jun-2026 10:00 AM", confirmedDate: "24-Jun-2026 09:00 AM", sentDate: "24-Jun-2026 10:00 AM", receivedDate: "24-Jun-2026 10:00 AM", source: "Web", journals: ["13852790"], status: "STORE RECEIVED", items: [{ no: 1, sku: "SP-PST-KIT", product: "PISTON KIT", productCode: "PISTON ASSY", order: 2, sent: 2, receive: 2, avgCost: 168919 }] },
  "OPO/WM/26060057": { refCode: "OPO/WM/26060057", referenceNumber: "E3456JKL", fromWarehouse: "Gudang Wijaya", deliverTo: "PT Putra Wijaya Motor", createdBy: "Andi Yahya", updatedBy: "YUSRO IQBAL", notes: "", createdAt: "22-Jun-2026 08:00 AM", updatedAt: "22-Jun-2026 09:30 AM", confirmedDate: "22-Jun-2026 08:00 AM", sentDate: "22-Jun-2026 09:30 AM", receivedDate: "22-Jun-2026 09:30 AM", source: "Web", journals: ["13852800"], status: "STORE RECEIVED", items: [{ no: 1, sku: "GLT-KIT-01", product: "GASKET KIT", productCode: "GASKET SET", order: 1, sent: 1, receive: 1, avgCost: 768468 }] },
  "OPO/WM/26020049": { refCode: "OPO/WM/26020049", referenceNumber: "F7890MNO", fromWarehouse: "Gudang Wijaya", deliverTo: "PT Putra Wijaya Motor", createdBy: "Andi Yahya", updatedBy: "ANGGA NOVIANTO", notes: "", createdAt: "13-Feb-2026 01:49 PM", updatedAt: "23-Jun-2026 01:41 PM", confirmedDate: "13-Feb-2026 01:49 PM", sentDate: "13-Feb-2026 02:00 PM", receivedDate: "23-Jun-2026 01:41 PM", source: "Web", journals: ["13801234"], status: "STORE RECEIVED", items: [{ no: 1, sku: "OLM-0W20", product: "OLI MESIN 0W-20", productCode: "OLI MESIN FULLY SYNTH", order: 3, sent: 3, receive: 3, avgCost: 141141 }] },
  "OPO/WM/26020038": { refCode: "OPO/WM/26020038", referenceNumber: "G1234PQR", fromWarehouse: "Gudang Wijaya", deliverTo: "PT Putra Wijaya Motor", createdBy: "Andi Yahya", updatedBy: "ANGGA NOVIANTO", notes: "", createdAt: "11-Feb-2026 09:00 AM", updatedAt: "13-Feb-2026 10:30 AM", confirmedDate: "11-Feb-2026 09:00 AM", sentDate: "11-Feb-2026 10:00 AM", receivedDate: "13-Feb-2026 10:30 AM", source: "Web", journals: ["13801200"], status: "STORE RECEIVED", items: [{ no: 1, sku: "FLT-UDARA", product: "FILTER UDARA", productCode: "AIR FILTER ASSY", order: 2, sent: 2, receive: 2, avgCost: 223181 }] },
  "OPO/WM/26010092": { refCode: "OPO/WM/26010092", referenceNumber: "H5678STU", fromWarehouse: "Gudang Wijaya", deliverTo: "PT Putra Wijaya Motor", createdBy: "Andi Yahya", updatedBy: "YUSRO IQBAL", notes: "", createdAt: "22-Jan-2026 08:00 AM", updatedAt: "22-Jan-2026 09:00 AM", confirmedDate: "22-Jan-2026 08:00 AM", sentDate: "22-Jan-2026 09:00 AM", receivedDate: "22-Jan-2026 09:00 AM", source: "Web", journals: ["13780100"], status: "STORE RECEIVED", items: [{ no: 1, sku: "PLG-BUSI", product: "PLUG BUSI", productCode: "SPARK PLUG IRIDIUM", order: 4, sent: 4, receive: 4, avgCost: 192117 }] },
  "OPO/WM/25110138": { refCode: "OPO/WM/25110138", referenceNumber: "I9012VWX", fromWarehouse: "Gudang Wijaya", deliverTo: "PT Putra Wijaya Motor", createdBy: "Andi Yahya", updatedBy: "YUSRO IQBAL", notes: "Pengiriman rutin", createdAt: "24-Nov-2025 10:00 AM", updatedAt: "24-Nov-2025 11:30 AM", confirmedDate: "24-Nov-2025 10:00 AM", sentDate: "24-Nov-2025 11:00 AM", receivedDate: "24-Nov-2025 11:30 AM", source: "Web", journals: ["13650200"], status: "STORE RECEIVED", items: [{ no: 1, sku: "OLT-MESIN-4L", product: "OLI MESIN 4L 5W-30", productCode: "ENGINE OIL 4L", order: 10, sent: 10, receive: 10, avgCost: 716724 }] },
  "OPO/WM/25100216": { refCode: "OPO/WM/25100216", referenceNumber: "J3456YZA", fromWarehouse: "Gudang Wijaya", deliverTo: "PT Putra Wijaya Motor", createdBy: "Andi Yahya", updatedBy: "ANGGA NOVIANTO", notes: "", createdAt: "25-Oct-2025 08:30 AM", updatedAt: "25-Oct-2025 09:00 AM", confirmedDate: "25-Oct-2025 08:30 AM", sentDate: "25-Oct-2025 09:00 AM", receivedDate: "25-Oct-2025 09:00 AM", source: "Web", journals: ["13620100"], status: "STORE RECEIVED", items: [{ no: 1, sku: "KP-REM-BLK", product: "KAMPAS REM BELAKANG", productCode: "BRAKE SHOE REAR", order: 2, sent: 2, receive: 2, avgCost: 22859 }] },
  "OPO/WM/25100183": { refCode: "OPO/WM/25100183", referenceNumber: "K7890BCD", fromWarehouse: "Gudang Wijaya", deliverTo: "PT Putra Wijaya Motor", createdBy: "Andi Yahya", updatedBy: "ANGGA NOVIANTO", notes: "", createdAt: "22-Oct-2025 10:00 AM", updatedAt: "25-Nov-2025 02:00 PM", confirmedDate: "22-Oct-2025 10:00 AM", sentDate: "22-Oct-2025 11:00 AM", receivedDate: "25-Nov-2025 02:00 PM", source: "Web", journals: ["13620150"], status: "STORE RECEIVED", items: [{ no: 1, sku: "V-BELT", product: "V-BELT MESIN", productCode: "DRIVE BELT", order: 3, sent: 3, receive: 3, avgCost: 323594 }] },
  "OPO/PJ/25100034": { refCode: "OPO/PJ/25100034", referenceNumber: "L1234EFG", fromWarehouse: "Gudang Wijaya", deliverTo: "PT Putro Joyo Motor", createdBy: "Andi Yahya", updatedBy: "ANGGA NOVIANTO", notes: "", createdAt: "21-Oct-2025 09:00 AM", updatedAt: "25-Nov-2025 03:00 PM", confirmedDate: "21-Oct-2025 09:00 AM", sentDate: "21-Oct-2025 10:00 AM", receivedDate: "25-Nov-2025 03:00 PM", source: "Web", journals: ["13620080"], status: "STORE RECEIVED", items: [{ no: 1, sku: "FLT-OLI", product: "FILTER OLI", productCode: "OIL FILTER", order: 5, sent: 5, receive: 4, avgCost: 218630 }] },
  "OPO/WM/25100171": { refCode: "OPO/WM/25100171", referenceNumber: "M5678HIJ", fromWarehouse: "Gudang Wijaya", deliverTo: "PT Putra Wijaya Motor", createdBy: "Andi Yahya", updatedBy: "ANGGA NOVIANTO", notes: "", createdAt: "21-Oct-2025 08:00 AM", updatedAt: "25-Nov-2025 01:00 PM", confirmedDate: "21-Oct-2025 08:00 AM", sentDate: "21-Oct-2025 09:00 AM", receivedDate: "25-Nov-2025 01:00 PM", source: "Web", journals: ["13620070"], status: "STORE RECEIVED", items: [{ no: 1, sku: "RME-BRK-SET", product: "REMEDY BRAKE SET", productCode: "BRAKE CALIPER REPAIR", order: 2, sent: 2, receive: 2, avgCost: 2160886 }] },
  "OPO/WM/25100111": { refCode: "OPO/WM/25100111", referenceNumber: "N9012KLM", fromWarehouse: "Gudang Wijaya", deliverTo: "PT Putra Wijaya Motor", createdBy: "Andi Yahya", updatedBy: "ANGGA NOVIANTO", notes: "Pengiriman besar", createdAt: "13-Oct-2025 07:30 AM", updatedAt: "25-Nov-2025 10:00 AM", confirmedDate: "13-Oct-2025 07:30 AM", sentDate: "13-Oct-2025 08:30 AM", receivedDate: "25-Nov-2025 10:00 AM", source: "Web", journals: ["13610050", "13610051"], status: "STORE RECEIVED", items: [{ no: 1, sku: "KMPLT-OLI", product: "KOMPLETE OLI", productCode: "FULL SERVICE KIT", order: 15, sent: 15, receive: 15, avgCost: 832432 }] },
  "OPO/WM/25100110": { refCode: "OPO/WM/25100110", referenceNumber: "O3456NOP", fromWarehouse: "Gudang Wijaya", deliverTo: "PT Putra Wijaya Motor", createdBy: "Andi Yahya", updatedBy: "ANGGA NOVIANTO", notes: "", createdAt: "13-Oct-2025 08:00 AM", updatedAt: "25-Nov-2025 11:00 AM", confirmedDate: "13-Oct-2025 08:00 AM", sentDate: "13-Oct-2025 09:00 AM", receivedDate: "25-Nov-2025 11:00 AM", source: "Web", journals: ["13610040"], status: "CONFIRMED", items: [{ no: 1, sku: "CLN-INTK", product: "CLEANER INTAKE", productCode: "INTAKE VALVE CLEANER", order: 3, sent: 3, receive: 0, avgCost: 95702 }] },
  "OPO/WM/25100011": { refCode: "OPO/WM/25100011", referenceNumber: "P7890QRS", fromWarehouse: "Gudang Wijaya", deliverTo: "PT Putra Wijaya Motor", createdBy: "Andi Yahya", updatedBy: "ANGGA NOVIANTO", notes: "", createdAt: "01-Oct-2025 09:00 AM", updatedAt: "01-Oct-2025 10:00 AM", confirmedDate: "01-Oct-2025 09:00 AM", sentDate: "01-Oct-2025 10:00 AM", receivedDate: "01-Oct-2025 10:00 AM", source: "Web", journals: ["13600010"], status: "STORE RECEIVED", items: [{ no: 1, sku: "BRG-TMS", product: "BELT TIMING", productCode: "TIMING BELT KIT", order: 1, sent: 1, receive: 1, avgCost: 45718 }] },
  "OPO/WM/25080340": { refCode: "OPO/WM/25080340", referenceNumber: "Q1234TUV", fromWarehouse: "Gudang Wijaya", deliverTo: "PT Putra Wijaya Motor", createdBy: "Andi Yahya", updatedBy: "ANGGA NOVIANTO", notes: "", createdAt: "27-Aug-2025 10:00 AM", updatedAt: "27-Aug-2025 11:00 AM", confirmedDate: "27-Aug-2025 10:00 AM", sentDate: "27-Aug-2025 10:30 AM", receivedDate: "27-Aug-2025 11:00 AM", source: "Web", journals: ["13560100"], status: "STORE RECEIVED", items: [{ no: 1, sku: "SP-OLI-MTR", product: "OLI MOTOR 10W/40", productCode: "MOTORCYCLE OIL", order: 5, sent: 5, receive: 5, avgCost: 265453 }] },
  "OPO/WM/25080007": { refCode: "OPO/WM/25080007", referenceNumber: "R5678WXY", fromWarehouse: "Gudang Wijaya", deliverTo: "PT Putra Wijaya Motor", createdBy: "Andi Yahya", updatedBy: "ANGGA NOVIANTO", notes: "", createdAt: "02-Aug-2025 08:00 AM", updatedAt: "02-Aug-2025 09:00 AM", confirmedDate: "02-Aug-2025 08:00 AM", sentDate: "02-Aug-2025 08:30 AM", receivedDate: "02-Aug-2025 09:00 AM", source: "Web", journals: ["13550010"], status: "STORE RECEIVED", items: [{ no: 1, sku: "LMP-HDLM", product: "LAMPU HEADLAMP", productCode: "HEADLIGHT BULB", order: 2, sent: 2, receive: 2, avgCost: 2092 }] },
  "OPO/WM/25070234": { refCode: "OPO/WM/25070234", referenceNumber: "S9012ZAB", fromWarehouse: "Gudang Wijaya", deliverTo: "PT Putra Wijaya Motor", createdBy: "Andi Yahya", updatedBy: "ANGGA NOVIANTO", notes: "", createdAt: "28-Jul-2025 09:00 AM", updatedAt: "28-Jul-2025 10:00 AM", confirmedDate: "28-Jul-2025 09:00 AM", sentDate: "28-Jul-2025 09:30 AM", receivedDate: "28-Jul-2025 10:00 AM", source: "Web", journals: ["13540050"], status: "CONFIRMED", items: [{ no: 1, sku: "CLT-AC", product: "CHEMICAL AC", productCode: "AC REFRIGERANT", order: 4, sent: 4, receive: 0, avgCost: 11430 }] },
  "OPO/WM/25070196": { refCode: "OPO/WM/25070196", referenceNumber: "T3456CDE", fromWarehouse: "Gudang Wijaya", deliverTo: "PT Putra Wijaya Motor", createdBy: "Andi Yahya", updatedBy: "YUSRO IQBAL", notes: "Dibatalkan - stok kosong", createdAt: "21-Jul-2025 08:00 AM", updatedAt: "22-Jul-2025 09:00 AM", confirmedDate: "21-Jul-2025 08:00 AM", sentDate: "-", receivedDate: "-", source: "Web", journals: [], status: "CANCELLED", items: [{ no: 1, sku: "GR-SKT-01", product: "GEAR SET", productCode: "FINAL GEAR KIT", order: 2, sent: 0, receive: 0, avgCost: 2023786 }] },
};

const statusWorkflow = ["DRAFT", "STORE CONFIRMED", "WAREHOUSE SENT", "STORE RECEIVED"];

const fmt = (n: number) => n.toLocaleString("id-ID");

export default function StockOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawNo = params.no as string[];
  const orderNo = rawNo ? rawNo.join("/") : "";

  const order = stockOrderData[orderNo];

  if (!order) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/stock-workflow/stock-orders")} style={S.backBtn}>
          <ArrowLeft size={16} /> Stock Orders
        </button>
        <div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>Stock Order tidak ditemukan: {orderNo}</p></div>
      </div>
    );
  }

  const currentStepIdx = statusWorkflow.indexOf(order.status);
  const totalOrder = order.items.reduce((s: number, x: any) => s + x.order, 0);
  const totalSent = order.items.reduce((s: number, x: any) => s + x.sent, 0);
  const totalReceive = order.items.reduce((s: number, x: any) => s + x.receive, 0);

  return (
    <div style={{ padding: "0 24px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>Stock Order (Warehouse)</h1>
      </div>

      <div style={S.workflowBar}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#444746" }}>Workflow</span>
          <div style={{ display: "flex", gap: 6 }}>
            {statusWorkflow.map((step, i) => (
              <span key={step} style={{ ...S.badge, background: i === currentStepIdx ? "#0176d3" : "transparent", color: i === currentStepIdx ? "#fff" : "#8e8f8e", border: `1px solid ${i === currentStepIdx ? "#0176d3" : "#d8d8d8"}` }}>{step}</span>
            ))}
          </div>
        </div>
        <button style={S.actionBtn}><Printer size={14} /> Print</button>
      </div>

      <div style={S.tabBar}>
        <button style={{ ...S.tab, color: "#fff", background: "#0176d3", fontWeight: 600 }}>Details</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 20 }}>
        <div>
          <F label="REF CODE" value={order.refCode} />
          <F label="REFERENCE NUMBER" value={order.referenceNumber} />
          <F label="FROM WAREHOUSE" value={order.fromWarehouse} link />
          <F label="DELIVER TO" value={order.deliverTo} link />
          <F label="CREATED BY" value={order.createdBy} link />
          <F label="UPDATED BY" value={order.updatedBy} link />
          <F label="NOTES" value={order.notes || "-"} />
        </div>
        <div style={{ borderLeft: "1px solid #ecebea", paddingLeft: 32 }}>
          <F label="CREATED AT" value={order.createdAt} />
          <F label="UPDATED AT" value={order.updatedAt} />
          <F label="CONFIRMED DATE" value={order.confirmedDate} />
          <F label="SENT DATE" value={order.sentDate} />
          <F label="RECEIVED DATE" value={order.receivedDate} />
          <F label="SOURCE" value={order.source} />
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 2 }}>JOURNAL</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {order.journals.map((j: string) => (
                <span key={j} style={{ fontSize: 13, fontWeight: 500, color: "#0176d3", cursor: "pointer" }}>{j}</span>
              ))}
              {order.journals.length === 0 && <span style={{ fontSize: 13, color: "#8e8f8e" }}>-</span>}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="text" placeholder="SKU" style={S.inputSmall} />
          <input type="text" placeholder="Product Name" style={S.inputSmall} />
          <button style={S.searchBtn}><Search size={14} /> Search</button>
        </div>
        <button style={S.actionBtn}>Export</button>
      </div>

      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={{ ...S.th, width: 36 }}>No</th>
              <th style={S.th}>SKU</th>
              <th style={S.th}>Product</th>
              <th style={S.th}>Product Code</th>
              <th style={{ ...S.th, textAlign: "right" }}>Order</th>
              <th style={{ ...S.th, textAlign: "right" }}>Sent</th>
              <th style={{ ...S.th, textAlign: "right" }}>Receive</th>
              <th style={{ ...S.th, textAlign: "right" }}>Average Cost (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item: any) => (
              <tr key={item.no} style={S.tr}>
                <td style={S.td}>{item.no}</td>
                <td
                  style={{ ...S.td, color: "#0176d3", fontWeight: 500, cursor: "pointer" }}
                  onClick={() => router.push(`/products/${item.sku}`)}
                >{item.sku}</td>
                <td style={S.td}>{item.product}</td>
                <td style={S.td}>{item.productCode || "-"}</td>
                <td style={{ ...S.td, textAlign: "right" }}>{item.order}</td>
                <td style={{ ...S.td, textAlign: "right" }}>{item.sent}</td>
                <td style={{ ...S.td, textAlign: "right" }}>{item.receive}</td>
                <td style={{ ...S.td, textAlign: "right" }}>{fmt(item.avgCost)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: "#f3f3f3", fontWeight: 700 }}>
              <td style={{ ...S.td, fontWeight: 700 }} colSpan={4}>TOTAL ALL PAGE</td>
              <td style={{ ...S.td, textAlign: "right", fontWeight: 700 }}>{totalOrder}</td>
              <td style={{ ...S.td, textAlign: "right", fontWeight: 700 }}>{totalSent}</td>
              <td style={{ ...S.td, textAlign: "right", fontWeight: 700 }}>{totalReceive}</td>
              <td style={S.td}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={() => router.push("/stock-workflow/stock-orders")} style={S.backBtn}>
          <ArrowLeft size={16} /> Stock Orders
        </button>
      </div>
    </div>
  );
}

function F({ label, value, link = false }: { label: string; value: string; link?: boolean }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: link ? "#0176d3" : "#001526" }}>{value}</div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  backBtn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, fontWeight: 500, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" },
  card: { background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  workflowBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px", background: "#f9f9f9", border: "1px solid #ecebea", borderRadius: 8, marginBottom: 12 },
  badge: { display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.03em" as const },
  actionBtn: { display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", fontSize: 12, fontWeight: 500, color: "#001526", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" },
  tabBar: { display: "flex", gap: 0, marginBottom: 16, background: "#ecebea", borderRadius: 8, padding: 3, width: "fit-content" },
  tab: { padding: "7px 18px", fontSize: 13, border: "none", borderRadius: 6, cursor: "pointer", transition: "all 150ms", whiteSpace: "nowrap" as const },
  inputSmall: { padding: "6px 10px", fontSize: 12, border: "1px solid #d8d8d8", borderRadius: 6, background: "#fff", color: "#001526", width: 120 },
  searchBtn: { display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", fontSize: 12, fontWeight: 500, color: "#0176d3", background: "#fff", border: "1px solid #0176d3", borderRadius: 6, cursor: "pointer" },
  tableWrap: { border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden", background: "#fff" },
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: 13 },
  th: { padding: "8px 10px", textAlign: "left" as const, fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", background: "#fff", borderBottom: "1px solid #ecebea" },
  td: { padding: "8px 10px", borderBottom: "1px solid #f0f0f0", color: "#001526", background: "#fff" },
  tr: { transition: "background 100ms" },
};
