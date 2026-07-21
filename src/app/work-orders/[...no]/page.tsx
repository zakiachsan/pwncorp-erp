"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer, ChevronRight } from "lucide-react";

const fmt = (n: number) => (n || 0).toLocaleString("id-ID");

const statusColor = (s: string) => {
  const map: Record<string, string> = {
    DRAFT: "#6b7280",
    CREATED: "#fe9339",
    "WAITING STOCK": "#fe9339",
    "IN PROGRESS": "#0176d3",
    QC: "#8b5cf6",
    COMPLETED: "#2e844a",
    CANCELLED: "#ea001e",
  };
  return map[s] || "#6b7280";
};

const workflowSteps = ["DRAFT", "IN PROGRESS", "QC", "COMPLETED"];

function getWorkflowStepIndex(status: string): number {
  if (!status) return -1;
  const s = status.toUpperCase();
  if (s === "DRAFT") return 0;
  if (["WAITING STOCK", "CONFIRMED"].includes(s)) return 0;
  if (s === "IN PROGRESS") return 1;
  if (s === "QC") return 2;
  if (s === "COMPLETED") return 3;
  if (s === "CANCELLED") return -2;
  return -1;
}

export default function WorkOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const woNo = Array.isArray(params.no) ? params.no.join("/") : (params.no as string);
  const [wo, setWo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"details" | "docRef" | "stockOrders" | "changes" | "photos">("details");
  const [showPrint, setShowPrint] = useState(false);
  const [svcLineTab, setSvcLineTab] = useState<"services" | "spareparts">("services");
  const [photoDesc, setPhotoDesc] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch(`/api/work-orders?search=${encodeURIComponent(woNo)}&limit=1`)
      .then((r) => r.json())
      .then((json) => {
        const found = (json.data || [])[0];
        if (!found || !found.id) { setError("Work Order tidak ditemukan"); setLoading(false); return; }
        // Fetch full detail
        return fetch(`/api/work-orders/${found.id}`)
          .then((r2) => r2.json())
          .then((j2) => {
            if (!j2.data) { setError("Gagal memuat detail"); setLoading(false); return; }
            const w = j2.data;
            const so = w.so || {};
            // Map API fields
        const items = w.items || [];
        const services = items
          .filter((it: any) => it.itemType === "service" || it.itemType === "SERVICE")
          .map((it: any, i: number) => ({
            item: it.name || it.itemName || it.description || "-",
            description: it.description || it.itemName || "-",
            quantity: it.qty || it.quantity || 1,
            priceExTax: it.price || it.unitPrice || 0,
            discount: it.discount || "-",
            subtotal: (it.qty || 1) * (it.price || 0),
            total: it.total || (it.qty || 1) * (it.price || 0),
            assignedTo: it.assignedTo || w.mekanik?.name || "-",
            status: it.status || "Waiting",
            estimatedTime: it.estimatedTime || "-",
          }));
        const spareparts = items
          .filter((it: any) => it.itemType === "sparepart" || it.itemType === "SPAREPART")
          .map((it: any) => ({
            code: it.sku || it.code || it.itemId || "-",
            name: it.sparepartName || it.itemName || "-",
            qty: it.qty || it.quantity || 0,
            price: it.unitPrice || it.price?.sellPrice || 0,
            total: it.total || (it.qty || 0) * (it.unitPrice || 0),
          }));

        const invoices = (w.invoices || []).map((inv: any) => ({
          docNo: inv.invoiceNo || inv.id,
          invoiceDate: inv.date || inv.invoiceDate || "-",
          status: inv.status || "UNPAID",
          total: inv.total || 0,
        }));

        setWo({
          id: w.id,
          documentNumber: w.woNo || woNo,
          soNumber: so.soNo || found.soNumber || "-",
          soDocument: so.soNo || found.soNumber || "-",
          customer: so.customer || { name: "-", phone: "-" },
          registrationNo: so.vehicle?.plateNo || found.registrationNo || "-",
          vehicleMake: so.vehicle.brand || found.vehicleMake || found.vehicle?.make || "-",
          vehicleModel: so.vehicle.model || found.vehicleModel || found.vehicle?.model || "-",
          vehicleType: so.vehicle?.brand ? "CAR" : (found.vehicleType || found.vehicle?.type || "CAR"),
          year: so.vehicle?.year || found.vehicle?.year || "-",
          color: so.vehicle?.color || found.vehicle?.color || "-",
          odometer: so.vehicle?.odometer || found.vehicle?.odometer || "-",
          store: w.store?.name || w.store || "-",
          serviceAdvisor: so.sa?.name || found.so?.serviceAdvisor || "-",
          mekanik: w.mekanik?.name || found.assignedTo || "-",
          status: (w.status || "DRAFT").toUpperCase(),
          planStartDate: w.startDate || found.planStartDate || "-",
          planEndDate: w.targetDate || found.planEndDate || "-",
          actualStartDate: found.actualStartDate || "-",
          actualEndDate: found.actualEndDate || "-",
          services,
          spareparts,
          invoices,
          createdBy: w.createdBy || "-",
          updatedBy: w.updatedBy || "-",
          createdAt: w.createdAt || "-",
          updatedAt: w.updatedAt || "-",
        });
        setLoading(false);
      })
      .catch(() => { setError("Failed to load work order"); setLoading(false); });
      })
      .catch(() => { setError("Work Order tidak ditemukan"); setLoading(false); });
  }, [woNo]);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/work-orders")} style={S.backBtn}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>Loading...</p></div>
      </div>
    );
  }

  if (error || !wo) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/work-orders")} style={S.backBtn}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>{error || "Work Order tidak ditemukan: " + woNo}</p></div>
      </div>
    );
  }

  const currentStepIdx = getWorkflowStepIndex(wo.status);
  const totalServiceCost = wo.services.reduce((s: number, x: any) => s + x.total, 0);
  const totalSparepartCost = wo.spareparts.reduce((s: number, x: any) => s + x.total, 0);
  const grandTotal = totalServiceCost + totalSparepartCost;

  const handleStatusUpdate = async (newStatus: string) => {
    if (!wo?.id) return;
    try {
      const res = await fetch(`/api/work-orders/${wo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setWo((prev: any) => ({ ...prev, status: newStatus.toUpperCase() }));
      } else {
        const err = await res.json();
        alert(err.error || "Gagal update status");
      }
    } catch {
      alert("Gagal update status");
    }
  };

  return (
    <div style={{ padding: "0 12px 24px" }} className="sm:px-6">
      {/* Workflow Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-[8px_14px] bg-[#f9f9f9] border border-[#ecebea] rounded-lg mb-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span style={{ fontSize: 12, fontWeight: 600, color: "#444746" }}>Workflow</span>
          <div className="flex flex-wrap gap-1.5">
            {workflowSteps.map((step, i) => {
              const isActive = i <= currentStepIdx;
              const canClick = !isActive && i === currentStepIdx + 1;
              return (
                <span
                  key={step}
                  onClick={canClick ? () => handleStatusUpdate(step) : undefined}
                  style={{
                    ...S.badge,
                    background: isActive ? statusColor(step) : "transparent",
                    color: isActive ? "#fff" : "#8e8f8e",
                    border: `1px solid ${isActive ? statusColor(step) : "#d8d8d8"}`,
                    cursor: canClick ? "pointer" : "default",
                    opacity: canClick ? 0.85 : 1,
                  }}
                  onMouseEnter={(e) => { if (canClick) { e.currentTarget.style.opacity = "1"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(1,118,211,0.3)"; } }}
                  onMouseLeave={(e) => { if (canClick) { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.boxShadow = "none"; } }}
                >{step}</span>
              );
            })}
          </div>
        </div>
        <div className="flex gap-2">
          <button style={S.actionBtn} onClick={() => setShowPrint(true)}><Printer size={14} /> Print</button>
        </div>
      </div>

      {/* Top Tabs */}
      <div className="flex gap-0 mb-4 bg-[#ecebea] rounded-lg p-1 overflow-x-auto">
        {([
          { key: "details", label: "Details" },
          { key: "docRef", label: "Document Reference" },
          { key: "stockOrders", label: "Stock Orders" },
          { key: "changes", label: "Changes" },
          { key: "photos", label: "Photos" },
        ] as const).map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            ...S.tab,
            color: activeTab === t.key ? "#fff" : "#444746",
            background: activeTab === t.key ? "#0176d3" : "#ecebea",
            fontWeight: activeTab === t.key ? 600 : 400,
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Details Tab */}
      {activeTab === "details" && (
        <div>
          {/* Status Action Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            {wo.status === "DRAFT" && <StatusBtn label="In Progress" color="#0176d3" onClick={() => handleStatusUpdate("In Progress")} />}
            {wo.status === "IN PROGRESS" && <StatusBtn label="QC" color="#8b5cf6" onClick={() => handleStatusUpdate("QC")} />}
            {wo.status === "QC" && <StatusBtn label="Completed" color="#2e844a" onClick={() => handleStatusUpdate("Completed")} />}
          </div>

          {/* 3-Column Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div style={S.infoCol}>
              <div style={S.infoColTitle}>Info</div>
              <F2 label="Document Number" value={wo.documentNumber} />
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #f5f5f5" }}>
                <span style={{ fontSize: 11, color: "#8e8f8e", textTransform: "uppercase" }}>SERVICE ORDER</span>
                <span
                  onClick={() => router.push(`/service-orders/${wo.soNumber}`)}
                  className="text-right max-w-[55%] truncate text-[12px] font-medium text-[#0176d3] flex items-center gap-1 cursor-pointer"
                >
                  {wo.soDocument}
                  <ChevronRight size={12} style={{ color: "#0176d3", flexShrink: 0 }} />
                </span>
              </div>
              <F2 label="Store" value={wo.store} />
              <F2 label="Customer" value={wo.customer.name} />
              <F2 label="Registration No" value={wo.registrationNo} />
            </div>
            <div style={S.infoCol}>
              <div style={S.infoColTitle}>Schedule & Staff</div>
              <F2 label="Plan Start" value={wo.planStartDate} />
              <F2 label="Plan End" value={wo.planEndDate} />
              <F2 label="Actual Start" value={wo.actualStartDate} />
              <F2 label="Service Advisor" value={wo.serviceAdvisor} />
              <F2 label="Mekanik" value={wo.mekanik} />
            </div>
            <div style={S.infoCol}>
              <div style={S.infoColTitle}>Vehicle</div>
              <F2 label="Vehicle Type" value={wo.vehicleType} />
              <F2 label="Make / Model" value={`${wo.vehicleMake} ${wo.vehicleModel}`} />
              <F2 label="Year" value={wo.year} />
              <F2 label="Color" value={wo.color} />
              <F2 label="Odometer" value={wo.odometer} />
            </div>
          </div>

          {/* Line Tabs: Services | Spareparts */}
          <div style={{ marginBottom: 0, display: "flex", gap: 0 }}>
            <button onClick={() => setSvcLineTab("services")} style={{
              padding: "7px 16px", fontSize: 12, fontWeight: svcLineTab === "services" ? 600 : 400,
              color: svcLineTab === "services" ? "#0176d3" : "#444746",
              border: "none", borderBottom: svcLineTab === "services" ? "2px solid #0176d3" : "2px solid transparent",
              background: "transparent", cursor: "pointer",
            }}>Services</button>
            <button onClick={() => setSvcLineTab("spareparts")} style={{
              padding: "7px 16px", fontSize: 12, fontWeight: svcLineTab === "spareparts" ? 600 : 400,
              color: svcLineTab === "spareparts" ? "#0176d3" : "#444746",
              border: "none", borderBottom: svcLineTab === "spareparts" ? "2px solid #0176d3" : "2px solid transparent",
              background: "transparent", cursor: "pointer",
            }}>Spareparts</button>
          </div>

          {svcLineTab === "services" && (
          /* Services Table */
          <div className="overflow-x-auto rounded-lg border border-[#ecebea] bg-white">
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: 36 }}>No.</th>
                  <th style={S.th}>Item</th>
                  <th className="hidden sm:table-cell" style={S.th}>Description</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Qty</th>
                  <th className="hidden md:table-cell" style={S.th}>Assigned To</th>
                  <th className="hidden md:table-cell" style={S.th}>Est. Time</th>
                  <th className="hidden sm:table-cell" style={S.th}>Status</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {wo.services.length === 0 && (
                  <tr><td colSpan={8} style={{ ...S.td, textAlign: "center", color: "#8e8f8e", padding: 24 }}>Belum ada service</td></tr>
                )}
                {wo.services.map((svc: any, i: number) => (
                  <tr key={i} style={S.tr}>
                    <td style={S.td}>{i + 1}</td>
                    <td style={{ ...S.td, color: "#0176d3", fontWeight: 500 }}>{svc.item}</td>
                    <td className="hidden sm:table-cell" style={S.td}>{svc.description}</td>
                    <td style={{ ...S.td, textAlign: "right" }}>{svc.quantity}</td>
                    <td className="hidden md:table-cell" style={S.td}>{svc.assignedTo}</td>
                    <td className="hidden md:table-cell" style={S.td}>{svc.estimatedTime}</td>
                    <td className="hidden sm:table-cell" style={S.td}>
                      <span style={{ ...S.pill, background: svc.status === "Completed" ? "#2e844a" : svc.status === "In Progress" ? "#0176d3" : "#fe9339" }}>{svc.status}</span>
                    </td>
                    <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmt(svc.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: "#f3f3f3", fontWeight: 600 }}>
                  <td colSpan={7} style={S.td}></td>
                  <td style={{ ...S.td, textAlign: "right", fontWeight: 700 }}>{fmt(totalServiceCost)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          )}

          {svcLineTab === "spareparts" && (
            <>
          {/* Spareparts Table */}
          {wo.spareparts.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-[#ecebea] bg-white" style={{ marginTop: 16 }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={{ ...S.th, width: 36 }}>No.</th>
                    <th style={S.th}>Code</th>
                    <th style={S.th}>Name</th>
                    <th style={{ ...S.th, textAlign: "right" }}>Qty</th>
                    <th className="hidden sm:table-cell" style={{ ...S.th, textAlign: "right" }}>Price</th>
                    <th style={{ ...S.th, textAlign: "right" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {wo.spareparts.map((sp: any, i: number) => (
                    <tr key={i} style={S.tr}>
                      <td style={S.td}>{i + 1}</td>
                      <td style={{ ...S.td, color: "#0176d3", fontWeight: 500 }}>{sp.code}</td>
                      <td style={S.td}>{sp.name}</td>
                      <td style={{ ...S.td, textAlign: "right" }}>{sp.qty}</td>
                      <td className="hidden sm:table-cell" style={{ ...S.td, textAlign: "right" }}>{fmt(sp.price)}</td>
                      <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmt(sp.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: "#f3f3f3", fontWeight: 600 }}>
                    <td colSpan={5} style={S.td}></td>
                    <td style={{ ...S.td, textAlign: "right", fontWeight: 700 }}>{fmt(totalSparepartCost)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div style={{ marginTop: 16, ...S.card }}><p style={{ color: "#444746", fontSize: 14 }}>Belum ada sparepart yang digunakan.</p></div>
          )}
            </>
          )}

          {/* Stock Outgoings */}
          <h3 style={{ ...S.sectionTitle, marginTop: 20 }}>Stock Outgoings</h3>
          <div className="overflow-x-auto rounded-lg border border-[#ecebea] bg-white">
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: 36 }}>No.</th>
                  <th style={S.th}>SKU</th>
                  <th className="hidden sm:table-cell" style={S.th}>Product Code</th>
                  <th style={S.th}>Service</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Quantity</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5} style={{ ...S.td, textAlign: "center", color: "#8e8f8e", padding: 24 }}>Belum ada stock outgoings.</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Grand Total */}
          <div style={{ marginTop: 16, padding: "12px 16px", background: "#f9f9f9", border: "1px solid #ecebea", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#444746" }}>TOTAL (Services + Spareparts)</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#001526" }}>Rp {fmt(grandTotal)}</span>
          </div>
        </div>
      )}

      {/* Document Reference Tab */}
      {activeTab === "docRef" && (
        <div>
          <h3 style={S.sectionTitle}>Service Order</h3>
          <div className="overflow-x-auto rounded-lg border border-[#ecebea] bg-white">
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: 36 }}>No.</th>
                  <th style={S.th}>Document Number</th>
                  <th className="hidden sm:table-cell" style={S.th}>Created Date</th>
                  <th style={S.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {wo.soDocument && wo.soDocument !== "-" ? (
                  <tr style={S.tr}>
                    <td style={S.td}>1</td>
                    <td
                      style={{ ...S.td, color: "#0176d3", fontWeight: 500, cursor: "pointer" }}
                      onClick={() => router.push(`/service-orders/${wo.soNumber}`)}
                    >{wo.soDocument}</td>
                    <td className="hidden sm:table-cell" style={S.td}>{wo.createdAt || "-"}</td>
                    <td style={S.td}>
                      <span style={{ ...S.pill, background: "#fe9339" }}>APPROVED</span>
                    </td>
                  </tr>
                ) : (
                  <tr><td colSpan={4} style={{ ...S.td, textAlign: "center", color: "#8e8f8e", padding: 24 }}>Belum ada Service Order</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Service Invoices */}
          <h3 style={{ ...S.sectionTitle, marginTop: 20 }}>Service Invoices</h3>
          {wo.invoices.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-[#ecebea] bg-white">
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={{ ...S.th, width: 36 }}>No.</th>
                    <th style={S.th}>Document Number</th>
                    <th className="hidden sm:table-cell" style={S.th}>Invoice Date</th>
                    <th style={S.th}>Status</th>
                    <th style={{ ...S.th, textAlign: "right" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {wo.invoices.map((sri: any, i: number) => (
                    <tr key={sri.docNo} style={S.tr}>
                      <td style={S.td}>{i + 1}</td>
                      <td
                        style={{ ...S.td, color: "#0176d3", fontWeight: 500, cursor: "pointer" }}
                        onClick={() => router.push(`/finance/invoices/service/${sri.docNo}`)}
                      >{sri.docNo}</td>
                      <td className="hidden sm:table-cell" style={S.td}>{sri.invoiceDate}</td>
                      <td style={S.td}>
                        <span style={{ ...S.pill, background: sri.status === "PAID" ? "#2e844a" : sri.status === "PARTIAL" ? "#f59e0b" : "#ea001e" }}>{sri.status}</span>
                      </td>
                      <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmt(sri.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>Belum ada Service Invoice</p></div>
          )}
        </div>
      )}

      {/* Stock Orders Tab */}
      {activeTab === "stockOrders" && (
        <div>
          <h3 style={S.sectionTitle}>Stock Orders</h3>
          <div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>Belum ada stock orders.</p></div>
        </div>
      )}

      {/* Changes Tab */}
      {activeTab === "changes" && (
        <div>
          <h3 style={S.sectionTitle}>Perubahan</h3>
          <div style={{ ...S.card, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#001526" }}>CREATED BY</div>
                <div style={{ fontSize: 12, color: "#444746" }}>{wo.createdBy}</div>
              </div>
              <div style={{ fontSize: 12, color: "#8e8f8e" }}>{wo.createdAt}</div>
            </div>
          </div>
          <div style={S.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#001526" }}>UPDATED BY</div>
                <div style={{ fontSize: 12, color: "#444746" }}>{wo.updatedBy}</div>
              </div>
              <div style={{ fontSize: 12, color: "#8e8f8e" }}>{wo.updatedAt}</div>
            </div>
          </div>
        </div>
      )}

      {/* Photos Tab */}
      {activeTab === "photos" && (
        <div>
          <h3 style={S.sectionTitle}>Foto Service</h3>

          {/* Upload Form */}
          <div style={{ ...S.card, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#001526", marginBottom: 8 }}>Upload Foto Baru</div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Masukkan deskripsi foto..."
                value={photoDesc}
                onChange={(e) => setPhotoDesc(e.target.value)}
                className="flex-1 h-9 px-3 border border-[#d8d8d8] rounded-lg text-sm outline-none focus:border-[#0176d3]"
              />
              <label className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-[#0176d3] rounded-lg cursor-pointer hover:bg-[#0165b3] transition-colors whitespace-nowrap">
                <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploading(true);
                  const formData = new FormData();
                  formData.append("file", file);
                  formData.append("description", photoDesc || "Foto");
                  try {
                    const res = await fetch(`/api/upload?woId=${wo.id}`, { method: "POST", body: formData });
                    if (res.ok) {
                      alert("Foto berhasil diupload");
                      setPhotoDesc("");
                    } else {
                      alert("Gagal upload foto");
                    }
                  } catch {
                    alert("Gagal upload foto");
                  }
                  setUploading(false);
                }} />
                {uploading ? "Uploading..." : "Upload Foto"}
              </label>
            </div>
          </div>

          {/* Photo List as Links */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { id: 1, photo: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop", caption: "Pengecekan mesin sebelum service", uploadedBy: "Hendra", date: "24 Jun 2026 09:15 AM" },
              { id: 2, photo: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop", caption: "Proses penggantian oli mesin", uploadedBy: "Hendra", date: "24 Jun 2026 10:30 AM" },
              { id: 3, photo: "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=400&h=300&fit=crop", caption: "Spooring mobil kelas I", uploadedBy: "WOYO", date: "24 Jun 2026 11:45 AM" },
              { id: 4, photo: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=300&fit=crop", caption: "Balancing ring >19 inch", uploadedBy: "Toha", date: "24 Jun 2026 02:15 PM" },
              { id: 5, photo: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=300&fit=crop", caption: "Pengecekan akhir sebelum serah terima", uploadedBy: "Bambang", date: "25 Jun 2026 08:00 AM" },
            ].map((p) => (
              <div key={p.id} style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div className="flex-1 min-w-0">
                  <a
                    href={p.photo}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 13, fontWeight: 500, color: "#0176d3", textDecoration: "none", cursor: "pointer" }}
                    className="hover:underline"
                  >
                    📷 {p.caption}
                  </a>
                  <div style={{ fontSize: 11, color: "#8e8f8e", marginTop: 2 }}>
                    Oleh: {p.uploadedBy} • {p.date}
                  </div>
                </div>
                <a
                  href={p.photo}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "4px 10px", fontSize: 11, fontWeight: 500, color: "#0176d3", background: "#f0f7ff", borderRadius: 4, textDecoration: "none", whiteSpace: "nowrap" }}
                >
                  Lihat Foto ↗
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Print Preview Modal */}
      {showPrint && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => setShowPrint(false)} />
          <div style={{ position: "relative", background: "#fff", borderRadius: 12, boxShadow: "0 25px 50px rgba(0,0,0,0.25)", width: "100%", maxWidth: 800, maxHeight: "90vh", overflow: "auto" }}>
            <div style={{ padding: "24px 32px", borderBottom: "1px solid #ecebea", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>Service Work Order</h2>
                <p style={{ fontSize: 12, color: "#8e8f8e", margin: "4px 0 0" }}>{woNo}</p>
              </div>
              <button onClick={() => window.print()} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 16px", fontSize: 13, fontWeight: 500, color: "#fff", background: "#0176d3", border: "none", borderRadius: 6, cursor: "pointer" }}>
                <Printer size={14} /> Print / Save PDF
              </button>
            </div>
            <div style={{ padding: "24px 32px" }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
                {workflowSteps.map((step, i) => (
                  <span key={step} style={{ padding: "4px 12px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: i === currentStepIdx ? "#0176d3" : "transparent", color: i === currentStepIdx ? "#fff" : "#8e8f8e", border: `1px solid ${i === currentStepIdx ? "#0176d3" : "#d8d8d8"}` }}>{step}</span>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
                <div>
                  <F label="DOCUMENT NUMBER" value={wo.documentNumber} />
                  <F label="SERVICE ORDER" value={wo.soDocument} />
                  <F label="STORE" value={wo.store} />
                  <F label="CUSTOMER" value={wo.customer.name} />
                  <F label="REGISTRATION NO" value={wo.registrationNo} />
                  <F label="SERVICE ADVISOR" value={wo.serviceAdvisor} />
                  <F label="MEKANIK" value={wo.mekanik} />
                </div>
                <div>
                  <F label="VEHICLE" value={`${wo.vehicleMake} ${wo.vehicleModel}`} />
                  <F label="VEHICLE TYPE" value={wo.vehicleType} />
                  <F label="YEAR" value={wo.year} />
                  <F label="COLOR" value={wo.color} />
                  <F label="ODOMETER" value={wo.odometer} />
                  <F label="PLAN START" value={wo.planStartDate} />
                  <F label="PLAN END" value={wo.planEndDate} />
                </div>
              </div>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: "#0176d3", marginBottom: 8 }}>Services</h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead><tr style={{ background: "#f3f3f3" }}>
                  <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const }}>No</th>
                  <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const }}>Item</th>
                  <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const }}>Description</th>
                  <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 10, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const }}>Qty</th>
                  <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 10, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const }}>Total</th>
                </tr></thead>
                <tbody>
                  {wo.services.map((svc: any, i: number) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "6px 8px" }}>{i + 1}</td>
                      <td style={{ padding: "6px 8px", fontWeight: 500 }}>{svc.item}</td>
                      <td style={{ padding: "6px 8px" }}>{svc.description}</td>
                      <td style={{ padding: "6px 8px", textAlign: "right" }}>{svc.quantity}</td>
                      <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 600 }}>{fmt(svc.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr style={{ background: "#f3f3f3" }}>
                  <td colSpan={4} style={{ padding: "6px 8px" }}></td>
                  <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700 }}>{fmt(totalServiceCost)}</td>
                </tr></tfoot>
              </table>
              {wo.spareparts.length > 0 && (
                <>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: "#0176d3", marginBottom: 8, marginTop: 20 }}>Spareparts</h3>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead><tr style={{ background: "#f3f3f3" }}>
                      <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const }}>No</th>
                      <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const }}>Code</th>
                      <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const }}>Name</th>
                      <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 10, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const }}>Qty</th>
                      <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 10, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const }}>Price</th>
                      <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 10, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const }}>Total</th>
                    </tr></thead>
                    <tbody>
                      {wo.spareparts.map((sp: any, i: number) => (
                        <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                          <td style={{ padding: "6px 8px" }}>{i + 1}</td>
                          <td style={{ padding: "6px 8px", fontWeight: 500 }}>{sp.code}</td>
                          <td style={{ padding: "6px 8px" }}>{sp.name}</td>
                          <td style={{ padding: "6px 8px", textAlign: "right" }}>{sp.qty}</td>
                          <td style={{ padding: "6px 8px", textAlign: "right" }}>{fmt(sp.price)}</td>
                          <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 600 }}>{fmt(sp.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot><tr style={{ background: "#f3f3f3" }}>
                      <td colSpan={5} style={{ padding: "6px 8px" }}></td>
                      <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700 }}>{fmt(totalSparepartCost)}</td>
                    </tr></tfoot>
                  </table>
                </>
              )}
              <div style={{ marginTop: 16, padding: "10px 16px", background: "#f9f9f9", border: "1px solid #ecebea", borderRadius: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#444746" }}>TOTAL</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#001526" }}>Rp {fmt(grandTotal)}</span>
              </div>
            </div>
            <div style={{ padding: "16px 32px", borderTop: "1px solid #ecebea", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setShowPrint(false)} style={{ padding: "8px 24px", fontSize: 13, fontWeight: 600, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" }}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Field Component ─── */
function F({ label, value, link = false, onClick }: { label: string; value: string; link?: boolean; onClick?: () => void }) {
  return (
    <div style={{ marginBottom: 10, cursor: link ? "pointer" : "default" }} onClick={onClick}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: link ? "#0176d3" : "#001526", display: "flex", alignItems: "center", gap: 4 }}>
        {value}
        {link && <ChevronRight size={13} style={{ color: "#0176d3" }} />}
      </div>
    </div>
  );
}

/* ─── Compact Field (F2) ─── */
function F2({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #f5f5f5" }}>
      <span style={{ fontSize: 11, color: "#8e8f8e", textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 500, color: "#001526", textAlign: "right", maxWidth: "55%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );
}

/* ─── Styles ─── */
const S: Record<string, React.CSSProperties> = {
  backBtn: {
    display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px",
    fontSize: 13, fontWeight: 500, color: "#444746", background: "#fff",
    border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer",
  },
  card: {
    background: "#fff", border: "1px solid #ecebea", borderRadius: 8,
    padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  workflowBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "8px 14px", background: "#f9f9f9", border: "1px solid #ecebea",
    borderRadius: 8, marginBottom: 12,
  },
  badge: {
    display: "inline-flex", alignItems: "center", padding: "3px 10px",
    borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.03em" as const,
  },
  actionBtn: {
    display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px",
    fontSize: 12, fontWeight: 500, color: "#001526", background: "#fff",
    border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer",
  },
  tabBar: {
    display: "flex", gap: 0, marginBottom: 16, background: "#ecebea",
    borderRadius: 8, padding: 3, width: "fit-content",
  },
  tab: {
    padding: "7px 18px", fontSize: 13, border: "none", borderRadius: 6,
    cursor: "pointer", transition: "all 150ms", whiteSpace: "nowrap" as const,
  },
  infoCol: { background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 12 },
  infoColTitle: { fontSize: 11, fontWeight: 700, color: "#0176d3", textTransform: "uppercase" as const, marginBottom: 8, letterSpacing: "0.04em" },
  sectionTitle: {
    fontSize: 13, fontWeight: 600, color: "#0176d3", marginBottom: 8,
  },
  tableWrap: {
    border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden",
    background: "#fff",
  },
  table: {
    width: "100%", borderCollapse: "collapse" as const, fontSize: 13,
  },
  th: {
    padding: "8px 10px", textAlign: "left" as const, fontWeight: 600,
    fontSize: 11, color: "#444746", textTransform: "uppercase" as const,
    letterSpacing: "0.04em", background: "#fff", borderBottom: "1px solid #ecebea",
  },
  td: {
    padding: "8px 10px", borderBottom: "1px solid #f0f0f0", color: "#001526",
    background: "#fff",
  },
  tr: { transition: "background 100ms" },
  pill: {
    display: "inline-block", padding: "2px 8px", borderRadius: 9999,
    fontSize: 10, fontWeight: 600, color: "#fff",
  },
};

/* ─── Status Action Button ─── */
function StatusBtn({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  const [confirming, setConfirming] = useState(false);
  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <span style={{ fontSize: 11, color: "#444746" }}>Yakin {label}?</span>
        <button onClick={() => { setConfirming(false); onClick(); }} style={{ padding: "3px 10px", fontSize: 11, fontWeight: 600, color: "#fff", background: color, border: "none", borderRadius: 4, cursor: "pointer" }}>Ya</button>
        <button onClick={() => setConfirming(false)} style={{ padding: "3px 10px", fontSize: 11, fontWeight: 500, color: "#444746", background: "#ecebea", border: "none", borderRadius: 4, cursor: "pointer" }}>Batal</button>
      </div>
    );
  }
  return (
    <button
      onClick={() => setConfirming(true)}
      style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 12px", fontSize: 12, fontWeight: 600, color: "#fff", background: color, border: "none", borderRadius: 6, cursor: "pointer", transition: "opacity 150ms" }}
      onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
      onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
    >
      Mark {label}
    </button>
  );
}
