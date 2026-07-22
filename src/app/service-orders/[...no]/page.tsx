"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Printer, FileText, CheckCircle, Wrench, ExternalLink, Plus, X, Edit, Save, Trash2 } from "lucide-react";

const fmt = (n: number) => (n || 0).toLocaleString("id-ID");

export default function ServiceOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderNo = Array.isArray(params.no) ? params.no.join("/") : (params.no as string);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeliverConfirm, setShowDeliverConfirm] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showCreateWOConfirm, setShowCreateWOConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "docref" | "changes">("details");
  const [svcLineTab, setSvcLineTab] = useState<"services" | "spareparts">("services");

  // Edit mode
  const [editMode, setEditMode] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [spareparts, setSpareparts] = useState<any[]>([]);
  const [editFields, setEditFields] = useState({ complaint: "", customerId: "", vehicleId: "", planServiceDate: "", planServiceTime: "", saId: "", salesperson: "", bookingSource: "", referenceNumber: "", odometer: "", color: "" });
  const [showEditModal, setShowEditModal] = useState(false);

  // Add item modals
  const [showAddService, setShowAddService] = useState(false);
  const [showAddSparepart, setShowAddSparepart] = useState(false);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [availableSpareparts, setAvailableSpareparts] = useState<any[]>([]);
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [allVehicles, setAllVehicles] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  // New item forms
  const [newService, setNewService] = useState({ serviceId: "", qty: 1, unitPrice: 0 });
  const [newSparepart, setNewSparepart] = useState({ sparepartId: "", qty: 1, unitPrice: 0 });

  // Search state for combobox
  const [svcSearch, setSvcSearch] = useState("");
  const [spSearch, setSpSearch] = useState("");
  const [svcDropdownOpen, setSvcDropdownOpen] = useState(false);
  const [spDropdownOpen, setSpDropdownOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/service-orders?search=${encodeURIComponent(orderNo)}&limit=1`)
      .then((r) => r.json())
      .then((j) => {
        const found = j.data?.[0];
        if (found && found.id) {
          return fetch(`/api/service-orders/${found.id}`)
            .then((r2) => r2.json())
            .then((j2) => {
              const d = j2.data || found;
              setOrder(d);
              setServices((d.services || []).map((s: any) => ({ ...s, serviceId: s.serviceId || s.service?.id, service: s.service || { sku: "", name: "" } })));
              setSpareparts((d.spareparts || []).map((s: any) => ({ ...s, sparepartId: s.sparepartId || s.sparepart?.id, sparepart: s.sparepart || { sku: "", name: "" } })));
              setEditFields({
                complaint: d.complaint || "",
                customerId: d.customerId || "",
                vehicleId: d.vehicleId || "",
                planServiceDate: d.date ? new Date(d.date).toISOString().split("T")[0] : "",
                planServiceTime: d.planServiceTime || "",
                saId: d.saId || "",
                salesperson: d.salesperson || "",
                bookingSource: d.bookingSource || "",
                referenceNumber: d.referenceNumber || "",
                odometer: d.odometer || "",
                color: d.color || "",
              });
              setLoading(false);
            });
        }
        if (found) setOrder(found);
        else setError("Data tidak ditemukan");
        setLoading(false);
      })
      .catch(() => { setError("Gagal memuat data"); setLoading(false); });
  }, [orderNo]);

  // Load lookup data for add modals
  useEffect(() => {
    fetch("/api/services?limit=200").then(r => r.json()).then(d => setAvailableServices(d.data || [])).catch(() => {});
    fetch("/api/spareparts?limit=200").then(r => r.json()).then(d => setAvailableSpareparts(d.data || [])).catch(() => {});
    fetch("/api/customers?limit=200").then(r => r.json()).then(d => setAllCustomers(d.data || [])).catch(() => {});
    fetch("/api/users?limit=200").then(r => r.json()).then(d => setAllUsers(d.data || d.users || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (editFields.customerId) {
      fetch(`/api/vehicles?customerId=${editFields.customerId}&limit=200`)
        .then(r => r.json()).then(d => setAllVehicles(d.data || [])).catch(() => {});
    }
  }, [editFields.customerId]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div style={{ padding: 24 }}><button onClick={() => router.push("/service-orders")} style={S.backBtn}><ArrowLeft size={16} /> Kembali</button><div style={S.card}><p style={{ color: "#ea001e", fontSize: 14 }}>{error}</p></div></div>;
  if (!order) return <div style={{ padding: 24 }}><button onClick={() => router.push("/service-orders")} style={S.backBtn}><ArrowLeft size={16} /> Kembali</button><div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>Data tidak ditemukan: {orderNo}</p></div></div>;

  const handleApprove = async () => {
    setShowApproveConfirm(false);
    await fetch(`/api/service-orders/${order.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Approved" }),
    });
    setOrder((prev: any) => ({ ...prev, status: "Approved" }));
  };

  const handleDeliver = async () => {
    setShowDeliverConfirm(false);
    await fetch(`/api/service-orders/${order.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Delivered" }),
    });
    setOrder((prev: any) => ({ ...prev, status: "Delivered" }));
    try {
      const res = await fetch("/api/work-orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soId: order.id }),
      });
      if (res.ok) {
        const j = await res.json();
        setOrder((prev: any) => ({ ...prev, workOrders: [j.data] }));
      }
    } catch {}
  };

  const handleCreateWO = async () => {
    setShowCreateWOConfirm(false);
    const res = await fetch("/api/work-orders", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ soId: order.id }),
    });
    if (res.ok) {
      const j = await res.json();
      setOrder((prev: any) => ({ ...prev, workOrders: [j.data] }));
    }
  };

  // --- Edit handlers ---
  const addServiceRow = () => {
    if (!newService.serviceId) return;
    const svc = availableServices.find(s => s.id === newService.serviceId);
    setServices(prev => [...prev, {
      serviceId: newService.serviceId,
      service: svc || { sku: "", name: "" },
      qty: newService.qty,
      unitPrice: newService.unitPrice,
      total: newService.qty * newService.unitPrice,
    }]);
    setNewService({ serviceId: "", qty: 1, unitPrice: 0 });
    setSvcSearch("");
    setShowAddService(false);
  };

  const updateServiceRow = (idx: number, field: string, value: any) => {
    setServices(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      if (field === "qty" || field === "unitPrice") {
        updated[idx].total = updated[idx].qty * updated[idx].unitPrice;
      }
      return updated;
    });
  };

  const removeServiceRow = (idx: number) => {
    setServices(prev => prev.filter((_, i) => i !== idx));
  };

  const addSparepartRow = () => {
    if (!newSparepart.sparepartId) return;
    const sp = availableSpareparts.find(s => s.id === newSparepart.sparepartId);
    setSpareparts(prev => [...prev, {
      sparepartId: newSparepart.sparepartId,
      sparepart: sp || { sku: "", name: "" },
      qty: newSparepart.qty,
      unitPrice: newSparepart.unitPrice,
      total: newSparepart.qty * newSparepart.unitPrice,
    }]);
    setNewSparepart({ sparepartId: "", qty: 1, unitPrice: 0 });
    setSpSearch("");
    setShowAddSparepart(false);
  };

  const updateSparepartRow = (idx: number, field: string, value: any) => {
    setSpareparts(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      if (field === "qty" || field === "unitPrice") {
        updated[idx].total = updated[idx].qty * updated[idx].unitPrice;
      }
      return updated;
    });
  };

  const removeSparepartRow = (idx: number) => {
    setSpareparts(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveEdits = async () => {
    setEditSaving(true);
    try {
      const total = [...services, ...spareparts].reduce((s, x) => s + (x.total || 0), 0);
      const payload: any = {
        services: services.map(s => ({ serviceId: s.serviceId, qty: s.qty, unitPrice: s.unitPrice })),
        spareparts: spareparts.map(s => ({ sparepartId: s.sparepartId, qty: s.qty, unitPrice: s.unitPrice })),
      };
      const res = await fetch(`/api/service-orders/${order.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      const j = await res.json();
      setOrder((prev: any) => ({ ...prev, total: j.data.total }));
      setEditMode(false);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setEditSaving(false);
    }
  };

  const handleSaveFields = async () => {
    try {
      const body: any = { ...editFields };
      // Map planServiceDate → date for the API
      if (editFields.planServiceDate) body.date = editFields.planServiceDate;
      delete body.planServiceDate;

      await fetch(`/api/service-orders/${order.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setShowEditModal(false);
      // refresh
      const r = await fetch(`/api/service-orders/${order.id}`);
      const j = await r.json();
      setOrder(j.data);
    } catch {
      alert("Gagal menyimpan perubahan");
    }
  };

  const totalQty = services.reduce((s: number, x: any) => s + (x.qty || 0), 0);
  const grandTotal = services.reduce((s: number, x: any) => s + (x.total || 0), 0);

  const d = {
    documentNumber: order.soNo || order.documentNumber || "-",
    store: order.store?.name || order.store || "-",
    customer: order.customer || {},
    registrationNo: order.vehicle?.plateNo || order.registrationNo || "-",
    bookingSource: order.bookingSource || "-",
    planServiceDate: order.date ? new Date(order.date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : (order.planServiceDate || "-"),
    planServiceTime: order.planServiceTime || "-",
    serviceAdvisor: order.sa?.name || order.serviceAdvisor || "-",
    salesperson: order.salesperson || "-",
    referenceNumber: order.referenceNumber || "-",
    project: order.project || null,
    vehicleType: order.vehicle?.brand ? "CAR" : (order.vehicleType || "-"),
    vehicleMake: order.vehicle?.brand || order.vehicleMake || "-",
    vehicleModel: order.vehicle?.model || order.vehicleModel || "-",
    odometer: order.odometer || order.vehicle?.odometer || "-",
    year: order.vehicle?.year || order.year || "-",
    color: order.color || order.vehicle?.color || "-",
  };
  const isDraft = order.status === "Draft";
  const isDelivered = order.status === "Delivered";
  const isApproved = order.status === "Approved";
  const hasWO = (order.workOrders || []).length > 0;
  const wo = hasWO ? (order.workOrders || [])[0] : null;

  return (
    <div style={{ padding: "0 12px 24px" }} className="sm:px-6">
      {/* Workflow Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-[8px_14px] bg-[#f9f9f9] border border-[#ecebea] rounded-lg mb-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span style={{ fontSize: 12, fontWeight: 600, color: "#444746" }}>Workflow</span>
          <div className="flex flex-wrap gap-1.5">
            <span style={{ ...S.badge, ...(order.status === "Draft" ? S.badgeActive : S.badgeInactive) }}>DRAFT</span>
            <span style={{ ...S.badge, ...(order.status === "Delivered" ? S.badgeActive : S.badgeInactive) }}>DELIVERED</span>
            <span style={{ ...S.badge, ...(order.status === "Approved" ? S.badgeActive : S.badgeInactive) }}>APPROVED</span>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-0 mb-4 border-b-2 border-[#ecebea] overflow-x-auto">
        <button onClick={() => setActiveTab("details")} style={activeTab === "details" ? S.tabActive : S.tab}>Details</button>
        <button onClick={() => setActiveTab("docref")} style={activeTab === "docref" ? S.tabActive : S.tab}>Document Reference</button>
        <button onClick={() => setActiveTab("changes")} style={activeTab === "changes" ? S.tabActive : S.tab}>Changes</button>
      </div>

      {/* ─── Details Tab ─── */}
      {activeTab === "details" && (
        <>
          {/* Workflow Actions */}
          <div className="flex flex-wrap gap-2 mb-4">
            {isDraft && <button onClick={() => setShowDeliverConfirm(true)} style={{ ...S.actionBtn, background: "#2563eb", color: "#fff", border: "1px solid #2563eb" }}><CheckCircle size={14} /> Deliver</button>}
            {isDelivered && <><button onClick={() => setShowApproveConfirm(true)} style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}><CheckCircle size={14} /> Approve</button>{!hasWO && <button onClick={() => setShowCreateWOConfirm(true)} style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}><Wrench size={14} /> Create WO</button>}{hasWO && <button onClick={() => router.push(`/work-orders/${wo.woNo || wo.documentNumber}`)} style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}><ExternalLink size={14} /> View WO</button>}</>}
            {isApproved && !hasWO && services.length > 0 && <button onClick={() => setShowCreateWOConfirm(true)} style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}><Wrench size={14} /> Create WO</button>}
            {isApproved && hasWO && <button onClick={() => router.push(`/work-orders/${wo.woNo || wo.documentNumber}`)} style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}><ExternalLink size={14} /> View WO</button>}
            <button style={S.actionBtn}><Printer size={14} /> Print</button>
            <button style={S.actionBtn}><FileText size={14} /> Proforma Inv</button>
            <button onClick={() => { setEditFields({ complaint: order.complaint || "", customerId: order.customerId || "", vehicleId: order.vehicleId || "", planServiceDate: order.date ? new Date(order.date).toISOString().split("T")[0] : "", planServiceTime: order.planServiceTime || "", saId: order.saId || "", salesperson: order.salesperson || "", bookingSource: order.bookingSource || "", referenceNumber: order.referenceNumber || "", odometer: order.odometer || "", color: order.color || "" }); setShowEditModal(true); }} style={{ ...S.actionBtn, background: "#f59e0b", color: "#fff", border: "1px solid #f59e0b" }}><Edit size={14} /> Edit</button>
          </div>

          {/* 3-Column Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div style={S.infoCol}>
              <div style={S.infoColTitle}>Customer & Store</div>
              <F2 label="Document Number" value={d.documentNumber} />
              <F2 label="Store" value={d.store} />
              <F2 label="Customer" value={d.customer.name} />
              <F2 label="Phone" value={d.customer.phone} />
              <F2 label="Registration No" value={d.registrationNo} />
              <F2 label="Booking Source" value={d.bookingSource} />
            </div>
            <div style={S.infoCol}>
              <div style={S.infoColTitle}>Schedule & Advisor</div>
              <F2 label="Plan Service Date" value={d.planServiceDate} />
              <F2 label="Plan Service Time" value={d.planServiceTime} />
              <F2 label="Service Advisor" value={d.serviceAdvisor} />
              <F2 label="Salesperson" value={d.salesperson} />
              <F2 label="Reference Number" value={d.referenceNumber} />
              <F2 label="Project" value={d.project ? d.project.name : "-"} />
            </div>
            <div style={S.infoCol}>
              <div style={S.infoColTitle}>Vehicle</div>
              <F2 label="Vehicle Type" value={d.vehicleType} />
              <F2 label="Make / Model" value={`${d.vehicleMake} ${d.vehicleModel}`} />
              <F2 label="Odometer" value={d.odometer} />
              <F2 label="Year" value={d.year} />
              <F2 label="Color" value={d.color} />
            </div>
          </div>

          {/* Line Tabs: Services | Spareparts */}
          <div style={{ marginBottom: 0, display: "flex", gap: 0, alignItems: "center" }}>
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
            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
              {!editMode ? (
                <button onClick={() => setEditMode(true)} style={{ ...S.actionBtn, background: "#f59e0b", color: "#fff", border: "1px solid #f59e0b" }}><Edit size={13} /> Edit Items</button>
              ) : (
                <>
                  <button onClick={() => { svcLineTab === "services" ? (setShowAddService(true), setSvcSearch("")) : (setShowAddSparepart(true), setSpSearch("")); }} style={{ ...S.actionBtn, color: "#0176d3", border: "1px dashed #0176d3", background: "#f0f7ff" }}><Plus size={13} /> Tambah</button>
                  <button onClick={() => { setEditMode(false); setServices((order.services || []).map((s: any) => ({ ...s, serviceId: s.serviceId || s.service?.id, service: s.service || { sku: "", name: "" } }))); setSpareparts((order.spareparts || []).map((s: any) => ({ ...s, sparepartId: s.sparepartId || s.sparepart?.id, sparepart: s.sparepart || { sku: "", name: "" } }))); }} style={S.actionBtn}>Batal</button>
                  <button onClick={handleSaveEdits} disabled={editSaving} style={{ ...S.actionBtn, background: "#2e844a", color: "#fff", border: "1px solid #2e844a" }}>
                    <Save size={13} /> {editSaving ? "Menyimpan..." : "Simpan"}
                  </button>
                </>
              )}
            </div>
          </div>

          {svcLineTab === "services" && (
            <div>
              {editMode && showAddService && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ background: "#f0f7ff", border: "1px solid #0176d3", borderRadius: 8, padding: 12 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
                      <div style={{ flex: "1 1 200px", position: "relative" }}>
                        <label style={S.formLabel}>Service</label>
                        <input
                          type="text"
                          placeholder="Cari service..."
                          value={svcSearch}
                          onChange={e => { setSvcSearch(e.target.value); setSvcDropdownOpen(true); }}
                          onFocus={() => setSvcDropdownOpen(true)}
                          onBlur={() => setTimeout(() => setSvcDropdownOpen(false), 200)}
                          style={S.formInput}
                        />
                        {svcDropdownOpen && (
                          <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, maxHeight: 200, overflowY: "auto", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                            {availableServices
                              .filter(s => !svcSearch || s.name.toLowerCase().includes(svcSearch.toLowerCase()) || (s.sku || "").toLowerCase().includes(svcSearch.toLowerCase()))
                              .map(s => (
                                <div
                                  key={s.id}
                                  onClick={() => { setNewService(prev => ({ ...prev, serviceId: s.id })); setSvcSearch(`${s.sku} - ${s.name}`); setSvcDropdownOpen(false); }}
                                  style={{ padding: "6px 10px", fontSize: 12, cursor: "pointer", background: newService.serviceId === s.id ? "#f0f7ff" : "transparent" }}
                                  onMouseEnter={e => e.currentTarget.style.background = "#f0f7ff"}
                                  onMouseLeave={e => e.currentTarget.style.background = newService.serviceId === s.id ? "#f0f7ff" : "transparent"}
                                >{s.sku} - {s.name}</div>
                              ))}
                          </div>
                        )}
                      </div>
                      <div style={{ width: 70 }}>
                        <label style={S.formLabel}>Qty</label>
                        <input type="number" min={1} value={newService.qty} onChange={e => setNewService(prev => ({ ...prev, qty: parseInt(e.target.value) || 1 }))} style={S.formInput} />
                      </div>
                      <div style={{ width: 130 }}>
                        <label style={S.formLabel}>Unit Price</label>
                        <input type="number" min={0} value={newService.unitPrice} onChange={e => setNewService(prev => ({ ...prev, unitPrice: parseInt(e.target.value) || 0 }))} style={S.formInput} />
                      </div>
                      <button onClick={addServiceRow} style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}>Tambah</button>
                      <button onClick={() => { setShowAddService(false); setSvcSearch(""); }} style={S.actionBtn}><X size={14} /></button>
                    </div>
                  </div>
                </div>
              )}
              <ServicesTableEdit
                services={services}
                totalQty={totalQty}
                grandTotal={grandTotal}
                editMode={editMode}
                onUpdate={updateServiceRow}
                onRemove={removeServiceRow}
                router={router}
              />
            </div>
          )}

          {svcLineTab === "spareparts" && (
            <div>
              {editMode && showAddSparepart && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ background: "#f0f7ff", border: "1px solid #0176d3", borderRadius: 8, padding: 12 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
                      <div style={{ flex: "1 1 200px", position: "relative" }}>
                        <label style={S.formLabel}>Sparepart</label>
                        <input
                          type="text"
                          placeholder="Cari sparepart..."
                          value={spSearch}
                          onChange={e => { setSpSearch(e.target.value); setSpDropdownOpen(true); }}
                          onFocus={() => setSpDropdownOpen(true)}
                          onBlur={() => setTimeout(() => setSpDropdownOpen(false), 200)}
                          style={S.formInput}
                        />
                        {spDropdownOpen && (
                          <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, maxHeight: 200, overflowY: "auto", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                            {availableSpareparts
                              .filter(s => !spSearch || s.name.toLowerCase().includes(spSearch.toLowerCase()) || (s.sku || "").toLowerCase().includes(spSearch.toLowerCase()))
                              .map(s => (
                                <div
                                  key={s.id}
                                  onClick={() => { setNewSparepart(prev => ({ ...prev, sparepartId: s.id })); setSpSearch(`${s.sku} - ${s.name}`); setSpDropdownOpen(false); }}
                                  style={{ padding: "6px 10px", fontSize: 12, cursor: "pointer", background: newSparepart.sparepartId === s.id ? "#f0f7ff" : "transparent" }}
                                  onMouseEnter={e => e.currentTarget.style.background = "#f0f7ff"}
                                  onMouseLeave={e => e.currentTarget.style.background = newSparepart.sparepartId === s.id ? "#f0f7ff" : "transparent"}
                                >{s.sku} - {s.name}</div>
                              ))}
                          </div>
                        )}
                      </div>
                      <div style={{ width: 70 }}>
                        <label style={S.formLabel}>Qty</label>
                        <input type="number" min={1} value={newSparepart.qty} onChange={e => setNewSparepart(prev => ({ ...prev, qty: parseInt(e.target.value) || 1 }))} style={S.formInput} />
                      </div>
                      <div style={{ width: 130 }}>
                        <label style={S.formLabel}>Unit Price</label>
                        <input type="number" min={0} value={newSparepart.unitPrice} onChange={e => setNewSparepart(prev => ({ ...prev, unitPrice: parseInt(e.target.value) || 0 }))} style={S.formInput} />
                      </div>
                      <button onClick={addSparepartRow} style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}>Tambah</button>
                      <button onClick={() => { setShowAddSparepart(false); setSpSearch(""); }} style={S.actionBtn}><X size={14} /></button>
                    </div>
                  </div>
                </div>
              )}
              <SparepartTableEdit
                spareparts={spareparts}
                editMode={editMode}
                onUpdate={updateSparepartRow}
                onRemove={removeSparepartRow}
              />
            </div>
          )}
        </>
      )}

      {/* ─── Document Reference Tab ─── */}
      {activeTab === "docref" && (
        <>
          {hasWO && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#0176d3", marginBottom: 8, textTransform: "uppercase" }}>Work Orders</div>
              <div className="overflow-x-auto rounded-lg border border-[#ecebea] bg-white">
                <table style={S.table}><thead><tr><th style={S.th}>Document Number</th><th className="hidden sm:table-cell" style={S.th}>Created Date</th><th style={S.th}>Status</th></tr></thead>
                  <tbody><tr style={S.tr}><td style={{ ...S.td, color: "#0176d3", fontWeight: 500, cursor: "pointer" }} onClick={() => router.push(`/work-orders/${wo.woNo || wo.documentNumber}`)}>{wo.woNo || wo.documentNumber || "-"}</td><td className="hidden sm:table-cell" style={S.td}>{wo.createdAt ? new Date(wo.createdAt).toLocaleDateString("id-ID") : (wo.createdDate || "-")}</td><td style={S.td}><span style={{ ...S.pill, background: wo.status === "COMPLETED" || wo.status === "Completed" ? "#2e844a" : wo.status === "IN PROGRESS" || wo.status === "In Progress" ? "#0176d3" : "#fe9339" }}>{wo.status}</span></td></tr></tbody>
                </table>
              </div>
            </div>
          )}
          <div style={{ fontSize: 12, fontWeight: 600, color: "#0176d3", marginBottom: 8, textTransform: "uppercase" }}>Services</div>
          <ServicesTableEdit services={services} totalQty={totalQty} grandTotal={grandTotal} editMode={false} onUpdate={() => {}} onRemove={() => {}} router={router} />
        </>
      )}

      {/* ─── Changes Tab ─── */}
      {activeTab === "changes" && (
        <div style={S.card}>
          <p style={{ color: "#444746", fontSize: 14 }}>Riwayat perubahan belum tersedia.</p>
        </div>
      )}

      {/* Modals */}
      {showApproveConfirm && <Modal title="Approve Service Order?" message="Status akan berubah dari DELIVERED ke APPROVED." onCancel={() => setShowApproveConfirm(false)} onConfirm={handleApprove} confirmText="Ya, Approve" />}
      {showDeliverConfirm && <Modal title="Deliver Service Order?" message="Status akan berubah dari DRAFT ke DELIVERED." onCancel={() => setShowDeliverConfirm(false)} onConfirm={handleDeliver} confirmText="Ya, Deliver" />}
      {showCreateWOConfirm && <Modal title="Create Work Orders?" message={`Work Order baru dari ${services.length} service item.`} onCancel={() => setShowCreateWOConfirm(false)} onConfirm={handleCreateWO} confirmText="Ya, Create Work Orders" />}

      {/* Edit Fields Modal */}
      {showEditModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, maxWidth: 520, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.16)", maxHeight: "85vh", overflow: "auto" }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#001526", marginBottom: 16 }}>Edit Service Order</h3>

            {/* Customer & Vehicle */}
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0176d3", textTransform: "uppercase", marginBottom: 8 }}>Customer & Kendaraan</div>
            <div style={{ marginBottom: 10 }}>
              <label style={S.formLabel}>Customer</label>
              <select value={editFields.customerId} onChange={e => setEditFields(prev => ({ ...prev, customerId: e.target.value }))} style={S.formInput}>
                <option value="">-- Pilih Customer --</option>
                {allCustomers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={S.formLabel}>Kendaraan</label>
              <select value={editFields.vehicleId} onChange={e => setEditFields(prev => ({ ...prev, vehicleId: e.target.value }))} style={S.formInput}>
                <option value="">-- Pilih Kendaraan --</option>
                {allVehicles.map(v => <option key={v.id} value={v.id}>{v.plateNo} — {v.brand} {v.model}</option>)}
              </select>
            </div>

            {/* Schedule */}
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0176d3", textTransform: "uppercase", marginTop: 12, marginBottom: 8 }}>Schedule</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
              <div>
                <label style={S.formLabel}>Plan Service Date</label>
                <input type="date" value={editFields.planServiceDate} onChange={e => setEditFields(prev => ({ ...prev, planServiceDate: e.target.value }))} style={S.formInput} />
              </div>
              <div>
                <label style={S.formLabel}>Plan Service Time</label>
                <input type="time" value={editFields.planServiceTime} onChange={e => setEditFields(prev => ({ ...prev, planServiceTime: e.target.value }))} style={S.formInput} />
              </div>
            </div>

            {/* Advisor */}
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0176d3", textTransform: "uppercase", marginTop: 12, marginBottom: 8 }}>Personal & Referensi</div>
            <div style={{ marginBottom: 10 }}>
              <label style={S.formLabel}>Service Advisor</label>
              <select value={editFields.saId} onChange={e => setEditFields(prev => ({ ...prev, saId: e.target.value }))} style={S.formInput}>
                <option value="">-- Pilih SA --</option>
                {allUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={S.formLabel}>Salesperson</label>
              <select value={editFields.salesperson} onChange={e => setEditFields(prev => ({ ...prev, salesperson: e.target.value }))} style={S.formInput}>
                <option value="">-- Pilih --</option>
                <option>-</option>
                <option>Andi</option>
                <option>Budi</option>
                <option>Citra</option>
                <option>Dedi</option>
                <option>Dinda</option>
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
              <div>
                <label style={S.formLabel}>Booking Source</label>
                <select value={editFields.bookingSource} onChange={e => setEditFields(prev => ({ ...prev, bookingSource: e.target.value }))} style={S.formInput}>
                  <option value="">-- Pilih --</option>
                  <option>WhatsApp</option>
                  <option>Telepon</option>
                  <option>Walk-in</option>
                  <option>Website</option>
                  <option>Instagram</option>
                </select>
              </div>
              <div>
                <label style={S.formLabel}>Reference Number</label>
                <input type="text" value={editFields.referenceNumber} onChange={e => setEditFields(prev => ({ ...prev, referenceNumber: e.target.value }))} style={S.formInput} placeholder="-" />
              </div>
            </div>

            {/* Vehicle Details */}
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0176d3", textTransform: "uppercase", marginTop: 12, marginBottom: 8 }}>Detail Kendaraan</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
              <div>
                <label style={S.formLabel}>Odometer</label>
                <input type="text" value={editFields.odometer} onChange={e => setEditFields(prev => ({ ...prev, odometer: e.target.value }))} style={S.formInput} placeholder="Contoh: 45.230" />
              </div>
              <div>
                <label style={S.formLabel}>Color</label>
                <select value={editFields.color} onChange={e => setEditFields(prev => ({ ...prev, color: e.target.value }))} style={S.formInput}>
                  <option value="">-- Pilih --</option>
                  <option>HITAM</option><option>PUTIH</option><option>SILVER</option><option>ABU-ABU</option>
                  <option>MERAH</option><option>BIRU</option><option>HIJAU</option><option>KUNING</option>
                </select>
              </div>
            </div>

            {/* Complaint */}
            <div style={{ marginBottom: 12 }}>
              <label style={S.formLabel}>Keluhan (Complaint)</label>
              <textarea value={editFields.complaint} onChange={e => setEditFields(prev => ({ ...prev, complaint: e.target.value }))} style={{ ...S.formInput, minHeight: 60 }} rows={2} />
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
              <button onClick={() => setShowEditModal(false)} style={S.actionBtn}>Batal</button>
              <button onClick={handleSaveFields} style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}>Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Compact Field ─── */
function F2({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #f5f5f5" }}>
      <span style={{ fontSize: 11, color: "#8e8f8e", textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 500, color: "#001526", textAlign: "right", maxWidth: "55%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );
}

/* ─── Editable Services Table ─── */
function ServicesTableEdit({ services, totalQty, grandTotal, editMode, onUpdate, onRemove, router }: {
  services: any[]; totalQty: number; grandTotal: number; editMode: boolean;
  onUpdate: (idx: number, field: string, value: any) => void;
  onRemove: (idx: number) => void;
  router: any;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[#ecebea] bg-white">
      <table style={S.table}>
        <thead><tr>
          <th style={{ ...S.th, width: 36 }}>No.</th>
          <th style={S.th}>Item</th>
          <th style={{ ...S.th, textAlign: "right" }}>Qty</th>
          <th className="hidden sm:table-cell" style={{ ...S.th, textAlign: "right" }}>Price</th>
          <th style={{ ...S.th, textAlign: "right" }}>Total</th>
          {editMode && <th style={{ ...S.th, width: 40 }}></th>}
        </tr></thead>
        <tbody>
          {services.length === 0 && (
            <tr><td colSpan={editMode ? 6 : 5} style={{ ...S.td, textAlign: "center", color: "#8e8f8e", padding: 24 }}>Belum ada service</td></tr>
          )}
          {services.map((svc: any, i: number) => {
            const s = svc.service || {};
            return (
              <tr key={i} style={S.tr}>
                <td style={S.td}>{i + 1}</td>
                <td style={{ ...S.td, color: "#0176d3", fontWeight: 500, cursor: "pointer" }} onClick={() => !editMode && router.push(`/master-data/services/${s.sku || ""}`)}>{s.sku} - {s.name}</td>
                <td style={{ ...S.td, textAlign: "right" }}>
                  {editMode ? (
                    <input type="number" min={1} value={svc.qty} onChange={e => onUpdate(i, "qty", parseInt(e.target.value) || 1)}
                      style={{ width: 56, padding: "3px 6px", fontSize: 12, border: "1px solid #d8d8d8", borderRadius: 4, textAlign: "right" }} />
                  ) : svc.qty}
                </td>
                <td className="hidden sm:table-cell" style={{ ...S.td, textAlign: "right" }}>
                  {editMode ? (
                    <input type="number" min={0} value={svc.unitPrice} onChange={e => onUpdate(i, "unitPrice", parseInt(e.target.value) || 0)}
                      style={{ width: 100, padding: "3px 6px", fontSize: 12, border: "1px solid #d8d8d8", borderRadius: 4, textAlign: "right" }} />
                  ) : fmt(svc.unitPrice)}
                </td>
                <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmt(svc.total)}</td>
                {editMode && (
                  <td style={S.td}>
                    <button onClick={() => onRemove(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ea001e", padding: 2 }}><Trash2 size={14} /></button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
        <tfoot><tr style={{ background: "#f3f3f3", fontWeight: 600 }}>
          <td colSpan={editMode ? 2 : 2} style={S.td}></td>
          <td style={{ ...S.td, textAlign: "right", fontWeight: 700 }}>{totalQty}</td>
          <td className="hidden sm:table-cell" style={S.td}></td>
          <td style={{ ...S.td, textAlign: "right", fontWeight: 700, fontSize: 13 }}>{fmt(grandTotal)}</td>
          {editMode && <td style={S.td}></td>}
        </tr></tfoot>
      </table>
    </div>
  );
}

/* ─── Editable Sparepart Table ─── */
function SparepartTableEdit({ spareparts, editMode, onUpdate, onRemove }: {
  spareparts: any[]; editMode: boolean;
  onUpdate: (idx: number, field: string, value: any) => void;
  onRemove: (idx: number) => void;
}) {
  const total = spareparts.reduce((s: number, sp: any) => s + (sp.total || 0), 0);
  return (
    <div className="overflow-x-auto rounded-lg border border-[#ecebea] bg-white">
      <table style={S.table}>
        <thead><tr>
          <th style={{ ...S.th, width: 36 }}>No.</th>
          <th style={S.th}>Code</th>
          <th style={S.th}>Name</th>
          <th style={{ ...S.th, textAlign: "right" }}>Qty</th>
          <th className="hidden sm:table-cell" style={{ ...S.th, textAlign: "right" }}>Price</th>
          <th style={{ ...S.th, textAlign: "right" }}>Total</th>
          {editMode && <th style={{ ...S.th, width: 40 }}></th>}
        </tr></thead>
        <tbody>
          {spareparts.length === 0 && (
            <tr><td colSpan={editMode ? 7 : 6} style={{ ...S.td, textAlign: "center", color: "#8e8f8e", padding: 24 }}>Belum ada sparepart</td></tr>
          )}
          {spareparts.map((sp, i) => {
            const s = sp.sparepart || {};
            return (
              <tr key={i} style={S.tr}>
                <td style={S.td}>{i + 1}</td>
                <td style={{ ...S.td, color: "#0176d3", fontWeight: 500 }}>{s.sku || "-"}</td>
                <td style={S.td}>{s.name || "-"}</td>
                <td style={{ ...S.td, textAlign: "right" }}>
                  {editMode ? (
                    <input type="number" min={1} value={sp.qty} onChange={e => onUpdate(i, "qty", parseInt(e.target.value) || 1)}
                      style={{ width: 56, padding: "3px 6px", fontSize: 12, border: "1px solid #d8d8d8", borderRadius: 4, textAlign: "right" }} />
                  ) : sp.qty}
                </td>
                <td className="hidden sm:table-cell" style={{ ...S.td, textAlign: "right" }}>
                  {editMode ? (
                    <input type="number" min={0} value={sp.unitPrice} onChange={e => onUpdate(i, "unitPrice", parseInt(e.target.value) || 0)}
                      style={{ width: 100, padding: "3px 6px", fontSize: 12, border: "1px solid #d8d8d8", borderRadius: 4, textAlign: "right" }} />
                  ) : fmt(sp.unitPrice)}
                </td>
                <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmt(sp.total)}</td>
                {editMode && (
                  <td style={S.td}>
                    <button onClick={() => onRemove(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ea001e", padding: 2 }}><Trash2 size={14} /></button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
        {spareparts.length > 0 && (
          <tfoot><tr style={{ background: "#f3f3f3", fontWeight: 600 }}>
            <td colSpan={editMode ? 5 : 4} style={S.td}></td>
            <td style={{ ...S.td, textAlign: "right", fontWeight: 700 }}>{fmt(total)}</td>
            {editMode && <td style={S.td}></td>}
          </tr></tfoot>
        )}
      </table>
    </div>
  );
}

/* ─── Modal ─── */
function Modal({ title, message, onCancel, onConfirm, confirmText }: { title: string; message: string; onCancel: () => void; onConfirm: () => void; confirmText: string }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 24, maxWidth: 420, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.16)" }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "#001526", marginBottom: 12 }}>{title}</h3>
        <p style={{ fontSize: 14, color: "#444746", marginBottom: 20, lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={S.actionBtn}>Batal</button>
          <button onClick={onConfirm} style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Styles ─── */
const S: Record<string, React.CSSProperties> = {
  backBtn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, fontWeight: 500, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" },
  card: { background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 16 },
  tab: { padding: "8px 16px", fontSize: 13, fontWeight: 500, color: "#444746", background: "transparent", border: "none", borderBottom: "2px solid transparent", marginBottom: -2, cursor: "pointer" },
  tabActive: { padding: "8px 16px", fontSize: 13, fontWeight: 600, color: "#0176d3", background: "transparent", border: "none", borderBottom: "2px solid #0176d3", marginBottom: -2, cursor: "pointer" },
  badge: { display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.03em" },
  badgeActive: { background: "#032d47", color: "#fff", border: "1px solid #032d47" },
  badgeInactive: { background: "transparent", color: "#8e8f8e", border: "1px solid #d8d8d8" },
  actionBtn: { display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", fontSize: 12, fontWeight: 500, color: "#001526", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" },
  infoCol: { background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 12 },
  infoColTitle: { fontSize: 11, fontWeight: 700, color: "#0176d3", textTransform: "uppercase" as const, marginBottom: 8, letterSpacing: "0.04em" },
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: 13 },
  th: { padding: "8px 10px", textAlign: "left" as const, fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", background: "#fff", borderBottom: "1px solid #ecebea" },
  td: { padding: "8px 10px", borderBottom: "1px solid #f0f0f0", color: "#001526", background: "#fff" },
  tr: { transition: "background 100ms" },
  pill: { display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, color: "#fff" },
  formLabel: { display: "block", fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, marginBottom: 4 },
  formInput: { width: "100%", padding: "6px 10px", fontSize: 13, color: "#001526", border: "1px solid #d8d8d8", borderRadius: 6, outline: "none", boxSizing: "border-box" as const },
};
