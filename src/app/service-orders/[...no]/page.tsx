"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Printer, FileText, CheckCircle, Circle, Wrench, ExternalLink, Plus, X, Edit, Save, Trash2, ChevronDown } from "lucide-react";
import SearchableSelect from "@/components/ui/SearchableSelect";

const formatOdometer = (v: string) => {
  const raw = v.replace(/[^0-9]/g, "");
  if (raw.length > 10) return "";
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
const stripDots = (v: string) => v.replace(/\./g, "");
import FormattedNumberInput from "@/components/ui/FormattedNumberInput";

const fmt = (n: number) => (n || 0).toLocaleString("id-ID");

const ACTION_LABELS: Record<string, string> = {
  SO_CREATED: "SO Dibuat",
  SO_STATUS_CHANGED: "Status Berubah",
  SO_UPDATED: "SO Diperbarui",
  SO_INSPECTION_UPDATED: "Inspection Diperbarui",
  SO_SPAREPARTS_UPDATED: "Spareparts Diperbarui",
  SO_SERVICES_UPDATED: "Services Diperbarui",
  SO_CANCELLED: "SO Dibatalkan",
  WO_CREATED: "Work Order Dibuat",
  WO_STATUS_CHANGED: "WO Status Berubah",
  INVOICE_CREATED: "Invoice Dibuat",
  PAYMENT_RECEIVED: "Pembayaran Diterima",
};

const FIELD_LABELS: Record<string, string> = {
  complaint: "Keluhan",
  salesperson: "Salesperson",
  customerId: "Customer",
  vehicleId: "Kendaraan",
  odometer: "Odometer",
  color: "Warna",
  bookingSource: "Booking Source",
  referenceNumber: "Ref Number",
  planServiceTime: "Jam Service",
  saId: "Service Advisor",
  date: "Tanggal",
};

function formatActionLabel(action: string): string {
  return ACTION_LABELS[action] || action.replace(/_/g, " ");
}

function formatChangeDescription(log: any): string {
  try {
    const d = typeof log.details === "string" ? JSON.parse(log.details) : log.details || {};
    switch (log.action) {
      case "SO_CREATED":
        return `${d.soNo || ""} dibuat untuk ${d.customer || ""} — ${d.vehicle || ""}`;
      case "SO_STATUS_CHANGED":
        return `Status berubah dari ${d.from || "?"} ke ${d.to || "?"}`;
      case "SO_UPDATED": {
        const keys = Object.keys(d).filter(k => String(d[k]?.from) !== String(d[k]?.to));
        if (keys.length === 0) return "Tidak ada perubahan";
        return keys.map(k => {
          const label = FIELD_LABELS[k] || k;
          const rawFrom = d[k]?.from;
          const rawTo = d[k]?.to;
          const from = rawFrom == null || rawFrom === "" ? "kosong" : k === "date" ? new Date(rawFrom).toLocaleDateString("id-ID") : String(rawFrom);
          const to = rawTo == null || rawTo === "" ? "kosong" : k === "date" ? new Date(rawTo).toLocaleDateString("id-ID") : String(rawTo);
          return `Data ${label} diubah dari ${from} menjadi ${to}`;
        }).join(". ");
      }
      case "SO_INSPECTION_UPDATED": {
        const parts = [];
        if (d.added?.length) parts.push(`Ditambah: ${d.added.join(", ")}`);
        if (d.removed?.length) parts.push(`Dihapus: ${d.removed.join(", ")}`);
        return parts.length > 0 ? parts.join(". ") : `Inspection items: ${d.before || 0} → ${d.after || 0}`;
      }
      case "SO_SPAREPARTS_UPDATED": {
        const parts = [];
        if (d.added?.length) parts.push(`Ditambah: ${d.added.join(", ")}`);
        if (d.removed?.length) parts.push(`Dihapus: ${d.removed.join(", ")}`);
        return parts.length > 0 ? parts.join(". ") : `Spareparts: ${d.before || 0} → ${d.after || 0}`;
      }
      case "SO_SERVICES_UPDATED": {
        const parts = [];
        if (d.added?.length) parts.push(`Ditambah: ${d.added.join(", ")}`);
        if (d.removed?.length) parts.push(`Dihapus: ${d.removed.join(", ")}`);
        return parts.length > 0 ? parts.join(". ") : `Services: ${d.before || 0} → ${d.after || 0}`;
      }
      case "SO_CANCELLED":
        return `${d.soNo || "SO"} dibatalkan`;
      case "WO_CREATED":
        return `${d.woNo || "WO"} dibuat — ${d.itemCount || 0} items`;
      case "WO_STATUS_CHANGED":
        return `WO status: ${d.from || "?"} → ${d.to || "?"}`;
      case "INVOICE_CREATED":
        return `Invoice ${d.invNo || ""} dibuat — Total Rp ${(d.total || 0).toLocaleString("id-ID")}`;
      case "PAYMENT_RECEIVED":
        return `Pembayaran Rp ${(d.amount || 0).toLocaleString("id-ID")} (${d.method || "cash"}) — Invoice ${d.invNo || ""}`;
      default:
        return JSON.stringify(d);
    }
  } catch {
    return String(log.details || "-");
  }
}

export default function ServiceOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderNo = Array.isArray(params.no) ? params.no.join("/") : (params.no as string);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeliverConfirm, setShowDeliverConfirm] = useState(false);
  const [showGoToDeliveryConfirm, setShowGoToDeliveryConfirm] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showCreateWOConfirm, setShowCreateWOConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "docref" | "changes">("details");
  const [svcLineTab, setSvcLineTab] = useState<"inspection" | "services" | "spareparts">("inspection");

  // Edit mode
  const [editMode, setEditMode] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [spareparts, setSpareparts] = useState<any[]>([]);
  const [inspectionItems, setInspectionItems] = useState<any[]>([]);
  const [inspectionSaving, setInspectionSaving] = useState(false);
  const [inspectionEditMode, setInspectionEditMode] = useState(false);
  const [editFields, setEditFields] = useState({ complaint: "", customerId: "", vehicleId: "", planServiceDate: "", planServiceTime: "", saId: "", salesperson: "", bookingSource: "", referenceNumber: "", odometer: "", color: "" });
  const [showEditModal, setShowEditModal] = useState(false);

  // Add item modals
  const [showAddService, setShowAddService] = useState(false);
  const [showAddSparepart, setShowAddSparepart] = useState(false);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [availableSpareparts, setAvailableSpareparts] = useState<any[]>([]);
  const [availablePackages, setAvailablePackages] = useState<any[]>([]);
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [allVehicles, setAllVehicles] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [mappingsModal, setMappingsModal] = useState<{ description: string; mappings: any[] } | null>(null);

  // New item forms
  const [newService, setNewService] = useState({ serviceId: "", qty: 1, unitPrice: 0 });
  const [newSparepart, setNewSparepart] = useState({ sparepartId: "", qty: 1, unitPrice: 0 });

  // Search state for combobox
  const [svcSearch, setSvcSearch] = useState("");
  const [spSearch, setSpSearch] = useState("");

  // Changes log
  const [changes, setChanges] = useState<any[]>([]);
  const [changesLoading, setChangesLoading] = useState(false);
  const [printDropdownOpen, setPrintDropdownOpen] = useState(false);
  const [showInspectionWarning, setShowInspectionWarning] = useState(false);
  const printDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (printDropdownRef.current && !printDropdownRef.current.contains(e.target as Node)) {
        setPrintDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
              setInspectionItems((d.inspectionItems || []).map((item: any) => ({ id: item.id, description: item.description || "", feedback: item.feedback || "", inspected: item.inspected || false, mappings: item.mappings || [] })));
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
    fetch("/api/service-packages?limit=200").then(r => r.json()).then(d => setAvailablePackages(d.data || [])).catch(() => {});
    fetch("/api/customers?limit=200").then(r => r.json()).then(d => setAllCustomers(d.data || [])).catch(() => {});
    fetch("/api/users?limit=200").then(r => r.json()).then(d => setAllUsers(d.data || d.users || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (editFields.customerId) {
      fetch(`/api/vehicles?customerId=${editFields.customerId}&limit=200`)
        .then(r => r.json()).then(d => setAllVehicles(d.data || [])).catch(() => {});
    }
  }, [editFields.customerId]);

  const fetchChanges = async () => {
    if (!order?.id) return;
    setChangesLoading(true);
    try {
      const res = await fetch(`/api/service-orders/${order.id}/changes`);
      const data = await res.json();
      setChanges(data.data || []);
    } catch { /* silent */ }
    setChangesLoading(false);
  };

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

  const handleCancel = async () => {
    setShowCancelConfirm(false);
    await fetch(`/api/service-orders/${order.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Cancelled" }),
    });
    setOrder((prev: any) => ({ ...prev, status: "Cancelled" }));
  };

  const handleDeliver = async () => {
    setShowDeliverConfirm(false);
    await fetch(`/api/service-orders/${order.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Diagnosis" }),
    });
    setOrder((prev: any) => ({ ...prev, status: "Diagnosis" }));
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

  const handleGoToDelivery = async () => {
    setShowGoToDeliveryConfirm(false);
    await fetch(`/api/service-orders/${order.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Delivery" }),
    });
    setOrder((prev: any) => ({ ...prev, status: "Delivery" }));
  };

  const handleCreateWO = async () => {
    setShowCreateWOConfirm(false);
    router.push(`/work-orders/new?sroId=${order.id}`);
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

  // Inspection item handlers
  const addInspectionItem = () => {
    setInspectionItems(prev => [...prev, { description: "", feedback: "", inspected: false }]);
  };
  const updateInspectionItem = (idx: number, field: string, value: any) => {
    setInspectionItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };
  const removeInspectionItem = (idx: number) => {
    setInspectionItems(prev => prev.filter((_, i) => i !== idx));
  };
  const toggleInspected = (idx: number) => {
    setInspectionItems(prev => prev.map((item, i) => i === idx ? { ...item, inspected: !item.inspected } : item));
  };
  const saveInspectionItems = async () => {
    setInspectionSaving(true);
    try {
      const res = await fetch(`/api/service-orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inspectionItems }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Gagal");
      // Refresh order data
      const refreshRes = await fetch(`/api/service-orders/${order.id}`);
      const refreshJ = await refreshRes.json();
      if (refreshJ.data) {
        setInspectionItems((refreshJ.data.inspectionItems || []).map((item: any) => ({ id: item.id, description: item.description || "", feedback: item.feedback || "", inspected: item.inspected || false })));
        setOrder(refreshJ.data);
      }
    } catch (e: any) { alert(e.message); }
    finally { setInspectionSaving(false); }
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
      // Strip dots from odometer for DB storage
      if (body.odometer) body.odometer = stripDots(body.odometer);
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
    odometer: order.odometer ? Number(stripDots(order.odometer)).toLocaleString("id-ID") : (order.vehicle?.odometer || "-"),
    year: order.vehicle?.year || order.year || "-",
    color: order.color || order.vehicle?.color || "-",
  };
  const isDraft = order.status === "Draft";
  const isDiagnosis = order.status === "Diagnosis";
  const isDelivery = order.status === "Delivery";
  const isApproved = order.status === "Approved";
  const activeWOs = (order.workOrders || []).filter((wo: any) => wo.status?.toUpperCase() !== "CANCELLED");
  const hasWO = activeWOs.length > 0;
  const wo = hasWO ? activeWOs[0] : null;

  // Items already used in any WO (for multiple SWO)
  const usedItemIds = new Set<string>();
  for (const w of activeWOs) {
    for (const it of (w.items || [])) usedItemIds.add(it.itemId);
  }
  const totalSvcItems = (order.services || []).length + (order.spareparts || []).length;
  const usedCount = usedItemIds.size;
  const remainingItems = totalSvcItems - usedCount;
  const canCreateMoreWO = isApproved && remainingItems > 0;

  return (
    <div style={{ padding: "0 12px 24px" }} className="sm:px-6">
      {/* Workflow Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-[8px_14px] bg-[#f9f9f9] border border-[#ecebea] rounded-lg mb-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span style={{ fontSize: 12, fontWeight: 600, color: "#444746" }}>Workflow</span>
          <div className="flex flex-wrap gap-1.5">
            <span style={{ ...S.badge, ...(order.status === "Draft" ? S.badgeActive : S.badgeInactive) }}>DRAFT</span>
            <span style={{ ...S.badge, ...(order.status === "Diagnosis" ? S.badgeActive : S.badgeInactive) }}>DIAGNOSIS</span>
            <span style={{ ...S.badge, ...(order.status === "Delivery" ? S.badgeActive : S.badgeInactive) }}>DELIVERY</span>
            <span style={{ ...S.badge, ...(order.status === "Approved" ? S.badgeActive : S.badgeInactive) }}>APPROVED</span>
            </div>
            </div>
            <div className="flex flex-wrap gap-2">
            {isDraft && <button onClick={() => {
              const allInspected = inspectionItems.length > 0 && inspectionItems.every(item => item.inspected);
              if (!allInspected) {
                setShowInspectionWarning(true);
              } else {
                setShowDeliverConfirm(true);
              }
            }} style={{ ...S.actionBtn, background: "#2563eb", color: "#fff", border: "1px solid #2563eb" }}><CheckCircle size={14} /> Diagnosis</button>}
            {isDiagnosis && <button onClick={() => setShowGoToDeliveryConfirm(true)} style={{ ...S.actionBtn, background: "#2563eb", color: "#fff", border: "1px solid #2563eb" }}><CheckCircle size={14} /> Delivery</button>}
            {isDiagnosis && <button onClick={() => setShowCancelConfirm(true)} style={{ ...S.actionBtn, background: "#ea001e", color: "#fff", border: "1px solid #ea001e" }}><X size={14} /> Cancel</button>}
            {isDelivery && <button onClick={() => setShowApproveConfirm(true)} style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}><CheckCircle size={14} /> Approve</button>}
            {isDelivery && <button onClick={() => setShowCancelConfirm(true)} style={{ ...S.actionBtn, background: "#ea001e", color: "#fff", border: "1px solid #ea001e" }}><X size={14} /> Cancel</button>}
            {isApproved && canCreateMoreWO && <button onClick={() => setShowCreateWOConfirm(true)} style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}><Wrench size={14} /> Create WO {hasWO ? `(${remainingItems} item tersisa)` : ""}</button>}
            {isApproved && hasWO && <button onClick={() => router.push(`/work-orders/detail/${wo.woNo || wo.documentNumber}`)} style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}><ExternalLink size={14} /> View WO {activeWOs.length > 1 ? `(${activeWOs.length})` : ""}</button>}
            <div style={{ position: "relative" }} ref={printDropdownRef}>
              <button style={S.actionBtn} onClick={() => setPrintDropdownOpen(!printDropdownOpen)}>
                <Printer size={14} /> Print <ChevronDown size={12} style={{ marginLeft: 2 }} />
              </button>
              {printDropdownOpen && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, marginTop: 4,
                  background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 50, minWidth: 140,
                }}>
                  <div
                    onMouseDown={() => { setPrintDropdownOpen(false); /* TODO: default print */ }}
                    style={{ padding: "8px 12px", fontSize: 13, cursor: "pointer", borderBottom: "1px solid #ecebea" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f7ff")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >Default</div>
                  <div
                    onMouseDown={() => { setPrintDropdownOpen(false); /* TODO: custom print */ }}
                    style={{ padding: "8px 12px", fontSize: 13, cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f7ff")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >Custom</div>
                </div>
              )}
            </div>
            <button style={S.actionBtn}><FileText size={14} /> Performance Inv</button>
            <button onClick={() => { setEditFields({ complaint: order.complaint || "", customerId: order.customerId || "", vehicleId: order.vehicleId || "", planServiceDate: order.date ? new Date(order.date).toISOString().split("T")[0] : "", planServiceTime: order.planServiceTime || "", saId: order.saId || "", salesperson: order.salesperson || "", bookingSource: order.bookingSource || "", referenceNumber: order.referenceNumber || "", odometer: order.odometer ? Number(stripDots(order.odometer)).toLocaleString("id-ID") : "", color: order.color || "" }); setShowEditModal(true); }} style={{ ...S.actionBtn, background: "#f59e0b", color: "#fff", border: "1px solid #f59e0b" }}><Edit size={14} /> Edit</button>
            </div>
            </div>

      {/* Tab Bar */}
      <div className="flex gap-0 mb-4 border-b-2 border-[#ecebea] overflow-x-auto">
        <button onClick={() => setActiveTab("details")} style={activeTab === "details" ? S.tabActive : S.tab}>Details</button>
        <button onClick={() => setActiveTab("docref")} style={activeTab === "docref" ? S.tabActive : S.tab}>Document Reference</button>
        <button onClick={() => setActiveTab("changes")} style={activeTab === "changes" ? S.tabActive : S.tab} onMouseEnter={() => { if (changes.length === 0 && !changesLoading && order) fetchChanges(); }}>Changes</button>
      </div>

      {/* ─── Details Tab ─── */}
      {activeTab === "details" && (
        <>
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

          {/* Line Tabs: Inspection List | Services | Spareparts */}
          <div style={{ marginBottom: 0, display: "flex", gap: 0, alignItems: "center" }}>
            <button onClick={() => setSvcLineTab("inspection")} style={{
              padding: "7px 16px", fontSize: 12, fontWeight: svcLineTab === "inspection" ? 600 : 400,
              color: svcLineTab === "inspection" ? "#0176d3" : "#444746",
              border: "none", borderBottom: svcLineTab === "inspection" ? "2px solid #0176d3" : "2px solid transparent",
              background: "transparent", cursor: "pointer",
            }}>Inspection List</button>
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
              {svcLineTab !== "inspection" && (
                !editMode ? (
                  <button onClick={() => setEditMode(true)} style={{ ...S.actionBtn, background: "#f59e0b", color: "#fff", border: "1px solid #f59e0b" }}><Edit size={13} /> Edit Items</button>
                ) : (
                  <>
                    <button onClick={() => { svcLineTab === "services" ? (setShowAddService(true), setSvcSearch("")) : (setShowAddSparepart(true), setSpSearch("")); }} style={{ ...S.actionBtn, color: "#0176d3", border: "1px dashed #0176d3", background: "#f0f7ff" }}><Plus size={13} /> Tambah</button>
                    <button onClick={() => setEditMode(false)} style={S.actionBtn}>Batal</button>
                    <button onClick={handleSaveEdits} disabled={editSaving} style={{ ...S.actionBtn, background: "#2e844a", color: "#fff", border: "1px solid #2e844a" }}>
                      <Save size={13} /> {editSaving ? "Menyimpan..." : "Simpan"}
                    </button>
                  </>
                )
              )}
            </div>
          </div>

          {svcLineTab === "inspection" && (
            <div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8, gap: 6 }}>
                {!inspectionEditMode ? (
                  <button onClick={() => setInspectionEditMode(true)} style={{ ...S.actionBtn, background: "#f59e0b", color: "#fff", border: "1px solid #f59e0b" }}><Edit size={13} /> Edit</button>
                ) : (
                  <>
                    <button onClick={addInspectionItem} style={{ ...S.actionBtn, color: "#0176d3", border: "1px dashed #0176d3", background: "#f0f7ff" }}><Plus size={13} /> Tambah</button>
                    <button onClick={() => { setInspectionEditMode(false); setInspectionItems((order.inspectionItems || []).map((item: any) => ({ id: item.id, description: item.description || "", feedback: item.feedback || "", inspected: item.inspected || false }))); }} style={S.actionBtn}>Batal</button>
                    <button onClick={async () => { await saveInspectionItems(); setInspectionEditMode(false); }} disabled={inspectionSaving} style={{ ...S.actionBtn, background: "#2e844a", color: "#fff", border: "1px solid #2e844a" }}>
                      <Save size={13} /> {inspectionSaving ? "Saving..." : "Simpan"}
                    </button>
                  </>
                )}
              </div>
              <div style={S.tableWrap}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={{ ...S.th, width: 40 }}>No</th>
                      <th style={S.th}>Description</th>
                      <th style={S.th}>Feedback</th>
                      <th style={{ ...S.th, width: 80, textAlign: "center" }}>Inspected</th>
                      <th style={{ ...S.th, width: 120, textAlign: "center" }}>Service Items</th>
                      {inspectionEditMode && <th style={{ ...S.th, width: 40 }}></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {inspectionItems.length > 0 ? (
                      inspectionItems.map((item: any, i: number) => (
                        <tr key={i} style={{ background: item.mappings?.length > 0 ? "#fffbeb" : "transparent" }}>
                          <td style={S.td}>{i + 1}</td>
                          {inspectionEditMode ? (
                            <>
                              <td style={S.td}>
                                <input type="text" className="form-input w-full" style={{ padding: "4px 8px", fontSize: 13 }}
                                  value={item.description} onChange={e => updateInspectionItem(i, "description", e.target.value)} placeholder="Deskripsi..." />
                              </td>
                              <td style={S.td}>
                                <input type="text" className="form-input w-full" style={{ padding: "4px 8px", fontSize: 13 }}
                                  value={item.feedback || ""} onChange={e => updateInspectionItem(i, "feedback", e.target.value)} placeholder="Feedback..." />
                              </td>
                              <td style={{ ...S.td, textAlign: "center" }}>
                                <button onClick={() => toggleInspected(i)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                                  {item.inspected ? <CheckCircle size={18} style={{ color: "#2e844a" }} /> : <Circle size={18} style={{ color: "#d8d8d8" }} />}
                                </button>
                              </td>
                              <td style={{ ...S.td, textAlign: "center", fontSize: 11 }}>
                                {item.mappings?.length > 0 ? (
                                  <span style={{ display: "inline-block", padding: "2px 6px", borderRadius: 3, fontSize: 10, fontWeight: 700, background: "#fef3c7", color: "#b45309" }}>
                                    {item.mappings.length} item{item.mappings.length > 1 ? "s" : ""}
                                  </span>
                                ) : (
                                  <span style={{ color: "#8e8f8e" }}>—</span>
                                )}
                              </td>
                              <td style={{ ...S.td, textAlign: "center" }}>
                                <button onClick={() => removeInspectionItem(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ea001e", padding: 2 }}>
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td style={S.td}>{item.description || "-"}</td>
                              <td style={S.td}>{item.feedback || "-"}</td>
                              <td style={{ ...S.td, textAlign: "center" }}>
                                {item.inspected ? <CheckCircle size={18} style={{ color: "#2e844a" }} /> : <Circle size={18} style={{ color: "#d8d8d8" }} />}
                              </td>
                              <td style={{ ...S.td, textAlign: "center", fontSize: 11 }}>
                                {item.mappings?.length > 0 ? (
                                  <button
                                    title={item.mappings.map((m: any) => m.sourceType).join(", ")}
                                    onClick={() => setMappingsModal({ description: item.description || "", mappings: item.mappings || [] })}
                                    style={{ display: "inline-block", padding: "2px 8px", borderRadius: 3, fontSize: 10, fontWeight: 700, background: "#fef3c7", color: "#b45309", border: "1px solid #fbbf24", cursor: "pointer" }}
                                  >
                                    📋 {item.mappings.length} item{item.mappings.length > 1 ? "s" : ""}
                                  </button>
                                ) : (
                                  <span style={{ color: "#8e8f8e" }}>—</span>
                                )}
                              </td>
                            </>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={inspectionEditMode ? 5 : 4} style={{ ...S.td, textAlign: "center", color: "#8e8f8e", padding: 24 }}>Belum ada inspection item</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {svcLineTab === "services" && (
            <div>
              {editMode && showAddService && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ background: "#f0f7ff", border: "1px solid #0176d3", borderRadius: 8, padding: 12 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
                      <div style={{ flex: "1 1 200px", position: "relative" }}>
                        <label style={S.formLabel}>Service</label>
                        <SearchableSelect
                          options={availableServices.map((s: any) => ({ value: s.id, label: `${s.sku} - ${s.name}` }))}
                          value={newService.serviceId}
                          onChange={(val) => setNewService(prev => ({ ...prev, serviceId: val }))}
                          placeholder="Cari service..."
                        />
                      </div>
                      <div style={{ width: 70 }}>
                        <label style={S.formLabel}>Qty</label>
                        <FormattedNumberInput value={newService.qty} onChange={val => setNewService(prev => ({ ...prev, qty: Math.max(1, val) || 1 }))} style={S.formInput} />
                      </div>
                      <div style={{ width: 130 }}>
                        <label style={S.formLabel}>Unit Price</label>
                        <FormattedNumberInput value={newService.unitPrice} onChange={val => setNewService(prev => ({ ...prev, unitPrice: val }))} style={S.formInput} />
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
                        <SearchableSelect
                          options={availableSpareparts.map((s: any) => ({ value: s.id, label: `${s.sku} - ${s.name}` }))}
                          value={newSparepart.sparepartId}
                          onChange={(val) => setNewSparepart(prev => ({ ...prev, sparepartId: val }))}
                          placeholder="Cari sparepart..."
                        />
                      </div>
                      <div style={{ width: 70 }}>
                        <label style={S.formLabel}>Qty</label>
                        <FormattedNumberInput value={newSparepart.qty} onChange={val => setNewSparepart(prev => ({ ...prev, qty: Math.max(1, val) || 1 }))} style={S.formInput} />
                      </div>
                      <div style={{ width: 130 }}>
                        <label style={S.formLabel}>Unit Price</label>
                        <FormattedNumberInput value={newSparepart.unitPrice} onChange={val => setNewSparepart(prev => ({ ...prev, unitPrice: val }))} style={S.formInput} />
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
                router={router}
              />
            </div>
          )}
        </>
      )}

      {/* ─── Document Reference Tab ─── */}
      {activeTab === "docref" && (
        <>
          {(order.workOrders || []).length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#0176d3", marginBottom: 8, textTransform: "uppercase" }}>Work Orders</div>
              <div className="overflow-x-auto rounded-lg border border-[#ecebea] bg-white">
                <table style={S.table}><thead><tr><th style={S.th}>Document Number</th><th className="hidden sm:table-cell" style={S.th}>Created Date</th><th style={S.th}>Status</th></tr></thead>
                  <tbody>
                    {(order.workOrders || []).map((woItem: any, idx: number) => {
                      const woStatus = woItem.status?.toUpperCase() || "";
                      const statusBg = woStatus === "COMPLETED" ? "#2e844a" : woStatus === "CANCELLED" ? "#ea001e" : woStatus === "IN PROGRESS" ? "#0176d3" : "#fe9339";
                      return (
                        <tr key={idx} style={S.tr}>
                          <td style={{ ...S.td, color: "#0176d3", fontWeight: 500, cursor: "pointer" }} onClick={() => router.push(`/work-orders/detail/${woItem.woNo || woItem.documentNumber}`)}>{woItem.woNo || woItem.documentNumber || "-"}</td>
                          <td className="hidden sm:table-cell" style={S.td}>{woItem.createdAt ? new Date(woItem.createdAt).toLocaleDateString("id-ID") : (woItem.createdDate || "-")}</td>
                          <td style={S.td}><span style={{ ...S.pill, background: statusBg, color: "#fff" }}>{woItem.status}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div style={{ fontSize: 12, fontWeight: 600, color: "#0176d3", marginBottom: 8, textTransform: "uppercase" }}>Services</div>
          <ServicesTableEdit services={services} totalQty={totalQty} grandTotal={grandTotal} editMode={false} onUpdate={() => {}} onRemove={() => {}} router={router} />

          {/* Service Invoices (SRI) — multiple per SRO */}
          {(() => {
            const allInvoices = (order.workOrders || []).flatMap((w: any) => (w.invoices || []).map((inv: any) => ({ ...inv, woNo: w.woNo || w.documentNumber })));
            if (allInvoices.length === 0) return null;
            return (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#0176d3", marginBottom: 8, textTransform: "uppercase" }}>Service Invoices</div>
                <div className="overflow-x-auto rounded-lg border border-[#ecebea] bg-white">
                  <table style={S.table}><thead><tr><th style={S.th}>Document Number</th><th className="hidden sm:table-cell" style={S.th}>WO</th><th style={S.th}>Status</th><th style={{ ...S.th, textAlign: "right" }}>Total</th></tr></thead>
                    <tbody>
                      {allInvoices.map((inv: any, idx: number) => {
                        const invStatus = (inv.status || "").toUpperCase();
                        const statusBg = invStatus === "COMPLETED" ? "#2e844a" : invStatus === "CANCELLED" ? "#ea001e" : invStatus === "PAID" ? "#0176d3" : "#fe9339";
                        return (
                          <tr key={idx} style={S.tr}>
                            <td style={{ ...S.td, color: "#0176d3", fontWeight: 500, cursor: "pointer" }} onClick={() => router.push(`/finance/invoices/service/${inv.invNo}`)}>{inv.invNo}</td>
                            <td className="hidden sm:table-cell" style={S.td}>{inv.woNo}</td>
                            <td style={S.td}><span style={{ ...S.pill, background: statusBg, color: "#fff" }}>{inv.status}</span></td>
                            <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmt(inv.total || 0)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </>
      )}

      {/* ─── Changes Tab ─── */}
      {activeTab === "changes" && (
        <div style={S.card}>
          {changesLoading ? (
            <p style={{ color: "#444746", fontSize: 14 }}>Memuat riwayat...</p>
          ) : changes.length === 0 ? (
            <p style={{ color: "#444746", fontSize: 14 }}>Riwayat perubahan belum tersedia.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {changes.map((log: any, i: number) => {
                const ts = new Date(log.timestamp);
                const dateStr = ts.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
                const timeStr = ts.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
                const actionColor = log.action.includes("CREATED") ? "#0b8043"
                  : log.action.includes("CANCELLED") ? "#ea001e"
                  : log.action.includes("STATUS") ? "#0176d3"
                  : "#444746";
                const actionBg = log.action.includes("CREATED") ? "#e6f4ea"
                  : log.action.includes("CANCELLED") ? "#fce8e6"
                  : log.action.includes("STATUS") ? "#e8f0fe"
                  : "#f3f2f2";
                const desc = formatChangeDescription(log);
                return (
                  <div key={log.id} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: i < changes.length - 1 ? "1px solid #ecebea" : undefined }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: actionColor, flexShrink: 0 }} />
                      {i < changes.length - 1 && <div style={{ width: 2, flex: 1, background: "#ecebea", marginTop: 4 }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: actionColor, background: actionBg, padding: "2px 8px", borderRadius: 4 }}>{formatActionLabel(log.action)}</span>
                        <span style={{ fontSize: 11, color: "#939393" }}>{dateStr} {timeStr}</span>
                      </div>
                      <p style={{ fontSize: 13, color: "#444746", margin: "4px 0 0", lineHeight: 1.5 }}>{desc}</p>
                      {log.user && <p style={{ fontSize: 11, color: "#939393", margin: "2px 0 0" }}>oleh {log.user.name}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {mappingsModal && (
        <MappingsModal
          description={mappingsModal.description}
          mappings={mappingsModal.mappings}
          availableServices={availableServices}
          availableSpareparts={availableSpareparts}
          availablePackages={availablePackages}
          onClose={() => setMappingsModal(null)}
        />
      )}
      {showApproveConfirm && <Modal title="Approve Service Order?" message="Status akan berubah dari DELIVERY ke APPROVED." onCancel={() => setShowApproveConfirm(false)} onConfirm={handleApprove} confirmText="Ya, Approve" />}
      {showCancelConfirm && <Modal title="Cancel Service Order?" message="Service Order akan dibatalkan. Tindakan ini tidak dapat diurungkan." onCancel={() => setShowCancelConfirm(false)} onConfirm={handleCancel} confirmText="Ya, Cancel" />}
      {showDeliverConfirm && <Modal title="Diagnosis Service Order?" message="Status akan berubah dari DRAFT ke DIAGNOSIS." onCancel={() => setShowDeliverConfirm(false)} onConfirm={handleDeliver} confirmText="Ya, Diagnosis" />}
      {showGoToDeliveryConfirm && <Modal title="Delivery Service Order?" message="Status akan berubah dari DIAGNOSIS ke DELIVERY." onCancel={() => setShowGoToDeliveryConfirm(false)} onConfirm={handleGoToDelivery} confirmText="Ya, Delivery" />}
      {showCreateWOConfirm && <Modal title="Create Work Orders?" message={`Work Order baru dari ${services.length} service item.`} onCancel={() => setShowCreateWOConfirm(false)} onConfirm={handleCreateWO} confirmText="Ya, Create Work Orders" />}
      {showInspectionWarning && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, maxWidth: 420, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.16)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#001526", marginBottom: 12 }}>⚠️ Inspection Belum Selesai</h3>
            <p style={{ fontSize: 14, color: "#444746", marginBottom: 20, lineHeight: 1.5 }}>
              Semua item pada Inspection List harus diceklis terlebih dahulu sebelum melakukan Diagnosis.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setShowInspectionWarning(false)} style={{ padding: "8px 20px", fontSize: 13, fontWeight: 600, background: "#0176d3", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

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
                <input type="text" value={editFields.odometer} onChange={e => setEditFields(prev => ({ ...prev, odometer: formatOdometer(e.target.value) }))} style={S.formInput} placeholder="Contoh: 45.230" />
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
          <th style={{ ...S.th, width: 70 }}>Type</th>
          <th style={S.th}>Item</th>
          <th style={S.th}>Supplier</th>
          <th style={{ ...S.th, textAlign: "right" }}>Qty</th>
          <th style={{ ...S.th, textAlign: "right" }}>Cost</th>
          <th className="hidden sm:table-cell" style={{ ...S.th, textAlign: "right" }}>Price</th>
          <th style={{ ...S.th, textAlign: "right" }}>Total</th>
          {editMode && <th style={{ ...S.th, width: 40 }}></th>}
        </tr></thead>
        <tbody>
          {services.length === 0 && (
            <tr><td colSpan={editMode ? 9 : 8} style={{ ...S.td, textAlign: "center", color: "#8e8f8e", padding: 24 }}>Belum ada service</td></tr>
          )}
          {services.map((svc: any, i: number) => {
            const s = svc.service || {};
            const showSublet = svc.itemType === "Sublet" || svc.itemType === "Sundry";
            return (
              <tr key={i} style={S.tr}>
                <td style={S.td}>{i + 1}</td>
                <td style={S.td}>
                  {showSublet ? (
                    <span style={{
                      display: "inline-block", padding: "2px 6px", borderRadius: 3, fontSize: 10, fontWeight: 700,
                      background: svc.itemType === "Sublet" ? "#dbeafe" : "#fef3c7",
                      color: svc.itemType === "Sublet" ? "#0176d3" : "#b45309",
                      textTransform: "uppercase",
                    }}>{svc.itemType}</span>
                  ) : (
                    <span style={{ fontSize: 10, color: "#8e8f8e" }}>SVC</span>
                  )}
                </td>
                <td style={{ ...S.td, color: "#0176d3", fontWeight: 500, cursor: "pointer" }} onClick={() => !editMode && router.push(`/master-data/services/${s.sku || ""}`)}>{s.sku} - {s.name}</td>
                <td style={{ ...S.td, fontSize: 12 }}>{svc.supplier?.companyName || "-"}</td>
                <td style={{ ...S.td, textAlign: "right" }}>
                  {editMode ? (
                    <FormattedNumberInput value={svc.qty} onChange={val => onUpdate(i, "qty", Math.max(1, val) || 1)}
                      style={{ width: 80, padding: "3px 6px", fontSize: 12, border: "1px solid #d8d8d8", borderRadius: 4, textAlign: "right" }} />
                  ) : svc.qty}
                </td>
                <td style={{ ...S.td, textAlign: "right", color: showSublet ? "#b45309" : "#8e8f8e", fontWeight: showSublet ? 500 : 400 }}>
                  {showSublet ? fmt(svc.cost || 0) : "-"}
                </td>
                <td className="hidden sm:table-cell" style={{ ...S.td, textAlign: "right" }}>
                  {editMode ? (
                    <FormattedNumberInput value={svc.unitPrice} onChange={val => onUpdate(i, "unitPrice", val)}
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
function SparepartTableEdit({ spareparts, editMode, onUpdate, onRemove, router }: {
  spareparts: any[]; editMode: boolean;
  onUpdate: (idx: number, field: string, value: any) => void;
  onRemove: (idx: number) => void;
  router: any;
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
                <td style={{ ...S.td, color: "#0176d3", fontWeight: 500, cursor: "pointer" }} onClick={() => s.sku && router.push(`/master-data/sparepart/${s.sku}`)}>{s.sku || "-"}</td>
                <td style={S.td}>{s.name || "-"}</td>
                <td style={{ ...S.td, textAlign: "right" }}>
                  {editMode ? (
                    <FormattedNumberInput value={sp.qty} onChange={val => onUpdate(i, "qty", Math.max(1, val) || 1)}
                      style={{ width: 80, padding: "3px 6px", fontSize: 12, border: "1px solid #d8d8d8", borderRadius: 4, textAlign: "right" }} />
                  ) : sp.qty}
                </td>
                <td className="hidden sm:table-cell" style={{ ...S.td, textAlign: "right" }}>
                  {editMode ? (
                    <FormattedNumberInput value={sp.unitPrice} onChange={val => onUpdate(i, "unitPrice", val)}
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
/* ─── Mappings Modal ─── */
function MappingsModal({ description, mappings, onClose, availableServices, availableSpareparts, availablePackages }: {
  description: string;
  mappings: { sourceType: string; sourceId: string; qty?: number | null }[];
  onClose: () => void;
  availableServices: any[];
  availableSpareparts: any[];
  availablePackages: any[];
}) {
  const resolveName = (m: any): string => {
    if (m.sourceType === "Service") {
      const s = availableServices.find((x: any) => x.id === m.sourceId);
      return s ? `${s.sku} - ${s.name}` : m.sourceId;
    }
    if (m.sourceType === "Sparepart") {
      const s = availableSpareparts.find((x: any) => x.id === m.sourceId);
      return s ? `${s.sku} - ${s.name}` : m.sourceId;
    }
    if (m.sourceType === "Package") {
      const p = availablePackages.find((x: any) => x.id === m.sourceId);
      return p ? `${p.sku} - ${p.name}` : m.sourceId;
    }
    return m.sourceId;
  };

  const sourceColor = (t: string) => {
    if (t === "Package") return { bg: "#dbeafe", color: "#0176d3" };
    if (t === "Sparepart") return { bg: "#d1fae5", color: "#047857" };
    if (t === "Service") return { bg: "#fef3c7", color: "#b45309" };
    return { bg: "#e5e7eb", color: "#374151" };
  };

  const byType: Record<string, any[]> = {};
  for (const m of mappings) {
    if (!byType[m.sourceType]) byType[m.sourceType] = [];
    byType[m.sourceType].push(m);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 12, width: 600, maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 8px 32px rgba(0,0,0,0.16)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #ecebea" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#001526", margin: 0 }}>
            Service Items {description ? `— ${description}` : ""}
          </h3>
          <div style={{ fontSize: 11, color: "#8e8f8e", marginTop: 4 }}>
            {mappings.length} item{mappings.length === 1 ? "" : "s"} mapped dari inspection ini
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
          {Object.keys(byType).length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "#8e8f8e", fontSize: 12 }}>No mappings</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#f9f9f9" }}>
                  <th style={{ padding: "8px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "#444746", textTransform: "uppercase", width: 90 }}>Type</th>
                  <th style={{ padding: "8px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "#444746", textTransform: "uppercase" }}>Item</th>
                  <th style={{ padding: "8px", textAlign: "right", fontSize: 10, fontWeight: 600, color: "#444746", textTransform: "uppercase", width: 60 }}>Qty</th>
                </tr>
              </thead>
              <tbody>
                {mappings.map((m, i) => {
                  const c = sourceColor(m.sourceType);
                  return (
                    <tr key={i} style={{ borderTop: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "8px" }}>
                        <span style={{ display: "inline-block", padding: "2px 6px", borderRadius: 3, fontSize: 10, fontWeight: 700, background: c.bg, color: c.color, textTransform: "uppercase" }}>
                          {m.sourceType}
                        </span>
                      </td>
                      <td style={{ padding: "8px", fontWeight: 500 }}>{resolveName(m)}</td>
                      <td style={{ padding: "8px", textAlign: "right" }}>{m.qty ?? 1}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <div style={{ padding: "12px 20px", borderTop: "1px solid #ecebea", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "6px 14px", fontSize: 12, fontWeight: 500, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" }}>Tutup</button>
        </div>
      </div>
    </div>
  );
}

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
