"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer, ChevronRight, ChevronDown, Edit, Save, Trash2, Plus, X, FileText, Play } from "lucide-react";
import FormattedNumberInput from "@/components/ui/FormattedNumberInput";

const fmt = (n: number) => (n || 0).toLocaleString("id-ID");

// Format ISO date string → "23 Jul 2026"
const fmtDate = (d: any): string => {
  if (!d || d === "-") return "-";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
};

// Normalize date value → "YYYY-MM-DD" (for date inputs)
const toDateInput = (d: any): string => {
  if (!d || d === "-") return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "";
  return dt.toISOString().split("T")[0];
};

const statusColor = (s: string) => {
  const map: Record<string, string> = {
    WAITING: "#fe9339",
    DRAFT: "#6b7280",
    CREATED: "#fe9339",
    "WAITING STOCK": "#fe9339",
    "IN PROGRESS": "#0176d3",
    "WAITING FOR QC": "#8b5cf6",
    QC: "#8b5cf6",
    REVISED: "#f59e0b",
    COMPLETED: "#2e844a",
    CANCELLED: "#ea001e",
  };
  return map[s] || "#6b7280";
};

const workflowSteps = ["WAITING", "IN PROGRESS", "WAITING FOR QC", "REVISED", "COMPLETED"];

function getWorkflowStepIndex(status: string): number {
  if (!status) return -1;
  const s = status.toUpperCase();
  if (s === "WAITING" || s === "DRAFT") return 0;
  if (["WAITING STOCK", "CONFIRMED", "CREATED"].includes(s)) return 0;
  if (s === "IN PROGRESS") return 1;
  if (s === "WAITING FOR QC" || s === "QC") return 2;
  if (s === "REVISED") return 3;
  if (s === "COMPLETED") return 4;
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
  const [showPrintDropdown, setShowPrintDropdown] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [svcLineTab, setSvcLineTab] = useState<"services" | "spareparts">("services");
  const [showStartActions, setShowStartActions] = useState(false);
  const [showStartBlockModal, setShowStartBlockModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReviseModal, setShowReviseModal] = useState(false);
  const [showCompletedBlockModal, setShowCompletedBlockModal] = useState(false);
  const [completedBlockMsg, setCompletedBlockMsg] = useState("");
  const [serviceProgress, setServiceProgress] = useState<Record<number, string>>({});
  const [photoDesc, setPhotoDesc] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoList, setPhotoList] = useState<{ url: string; description: string; uploadedBy: string; uploadedAt: string }[]>([]);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  // Edit mode
  const [editMode, setEditMode] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editServices, setEditServices] = useState<any[]>([]);
  const [editSpareparts, setEditSpareparts] = useState<any[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFields, setEditFields] = useState({ mekanikId: "", startDate: "", targetDate: "" });
  const [allMekanik, setAllMekanik] = useState<any[]>([]);

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
            itemId: it.itemId || "",
            item: it.name || it.itemName || it.description || "-",
            description: it.description || it.itemName || "-",
            quantity: it.qty || it.quantity || 1,
            priceExTax: it.price || it.unitPrice || 0,
            discount: it.discount || "-",
            subtotal: (it.qty || 1) * (it.price || 0),
            total: it.total || (it.qty || 1) * (it.price || 0),
            assignedTo: it.assignedToName || it.assignedTo || w.mekanik?.name || "-",
            status: it.status || "Waiting",
            estimatedTime: it.estimatedTime || "-",
            linkedSpareparts: it.linkedSpareparts || [],
          }));
        const spareparts = items
          .filter((it: any) => it.itemType === "sparepart" || it.itemType === "SPAREPART")
          .map((it: any) => ({
            itemId: it.itemId || "",
            code: it.sku || it.code || it.itemId || "-",
            name: it.sparepartName || it.itemName || "-",
            qty: it.qty || it.quantity || 0,
            price: it.unitPrice || it.price?.sellPrice || 0,
            total: it.total || (it.qty || 0) * (it.unitPrice || 0),
          }));

        const invoices = (w.invoices || []).map((inv: any) => ({
          docNo: inv.invNo || inv.invoiceNo || inv.id,
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
          color: so.color || so.vehicle?.color || found.vehicle?.color || "-",
          odometer: so.odometer || so.vehicle?.odometer || found.vehicle?.odometer || "-",
          store: so.store?.name || w.store?.name || w.store || "-",
          serviceAdvisor: so.sa?.name || found.so?.serviceAdvisor || "-",
          mekanik: w.mekanik?.name || found.assignedTo || "-",
          mekanikId: w.mekanikId || "",
          status: (w.status || "WAITING").toUpperCase(),
          planStartDate: w.startDate || so.date || found.planStartDate || "-",
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
          stockOrders: w.stockOrders || [],
        });
        // Load photos from DB
        setPhotoList((w.photos || []).map((p: any) => ({
          id: p.id,
          url: p.url,
          description: p.description || "Foto",
          uploadedBy: p.uploadedBy || "-",
          uploadedAt: p.createdAt || new Date().toISOString(),
        })));
        setLoading(false);
      })
      .catch(() => { setError("Failed to load work order"); setLoading(false); });
      })
      .catch(() => { setError("Work Order tidak ditemukan"); setLoading(false); });
  }, [woNo]);

  // Init edit data when wo changes
  useEffect(() => {
    if (!wo) return;
    setEditServices(wo.services || []);
    setEditSpareparts(wo.spareparts || []);
    setEditFields({
      mekanikId: wo.mekanikId || "",
      startDate: toDateInput(wo.planStartDate),
      targetDate: toDateInput(wo.planEndDate),
    });
    // Fetch mekanik list
    fetch("/api/users?limit=100").then(r => r.json()).then(d => {
      setAllMekanik((d.data || d.users || []).filter((u: any) => u.role?.name === "Mekanik" || u.role === "Mekanik"));
    }).catch(() => {});
  }, [wo]);

  // Auto-transition to WAITING FOR QC when all services are completed
  useEffect(() => {
    if (wo?.status === "IN PROGRESS" && wo.services?.length > 0) {
      const allCompleted = wo.services.every((_: any, i: number) => serviceProgress[i] === "completed");
      if (allCompleted) {
        handleStatusUpdate("WAITING FOR QC");
      }
    }
  }, [serviceProgress, wo?.status, wo?.services]);

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
    // Validate stock orders before marking Completed when status is REVISED
    if (newStatus === "COMPLETED" && wo.status === "REVISED") {
      const sparepartItems = (wo.spareparts || []);
      const stockOrders = wo.stockOrders || [];
      
      // Check 1: Are there spareparts without stock orders?
      const stockOrderSparepartIds = new Set();
      for (const so of stockOrders) {
        for (const item of (so.items || [])) {
          stockOrderSparepartIds.add(item.sparepartId);
        }
      }
      const unstockedSpareparts = sparepartItems.filter((sp: any) => !stockOrderSparepartIds.has(sp.itemId));
      
      // Check 2: Are there stock orders not yet Received?
      const notReceived = stockOrders.filter((so: any) => so.status?.toUpperCase() !== "RECEIVED");
      
      if (unstockedSpareparts.length > 0 || notReceived.length > 0) {
        let msg = "Tidak bisa Completed karena:\n";
        if (unstockedSpareparts.length > 0) {
          msg += `• ${unstockedSpareparts.length} sparepart belum dibuatkan stock order: ${unstockedSpareparts.map((sp: any) => sp.name).join(", ")}\n`;
        }
        if (notReceived.length > 0) {
          msg += `• ${notReceived.length} stock order belum Received: ${notReceived.map((so: any) => so.orderNo).join(", ")}`;
        }
        setCompletedBlockMsg(msg);
        setShowCompletedBlockModal(true);
        return;
      }
    }
    try {
      const res = await fetch(`/api/work-orders/${wo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setWo((prev: any) => ({ ...prev, status: newStatus.toUpperCase() }));
        // Refresh full data when status changes to REVISED (to sync new SO items)
        if (newStatus.toUpperCase() === "REVISED") {
          const refreshRes = await fetch(`/api/work-orders/${wo.id}`);
          const refreshData = await refreshRes.json();
          if (refreshData.data) {
            const w = refreshData.data;
            const items = w.items || [];
            const services = items
              .filter((it: any) => it.itemType === "service")
              .map((it: any) => ({
                item: it.itemName || "-",
                description: it.description || it.itemName || "-",
                quantity: it.qty || 1,
                priceExTax: it.unitPrice || 0,
                total: it.total || 0,
                itemId: it.itemId,
                assignedTo: it.assignedToName || it.assignedTo || "-",
                estimatedTime: it.estimatedTime || "-",
                linkedSpareparts: it.linkedSpareparts || [],
              }));
            const spareparts = items
              .filter((it: any) => it.itemType === "sparepart")
              .map((it: any) => ({
                code: it.sku || it.itemId || "-",
                name: it.sparepartName || it.itemName || "-",
                qty: it.qty || 0,
                price: it.unitPrice || 0,
                total: it.total || 0,
                itemId: it.itemId,
              }));
            setWo((prev: any) => ({ ...prev, services, spareparts, stockOrders: w.stockOrders || [] }));
          }
        }
      } else {
        const err = await res.json();
        alert(err.error || "Gagal update status");
      }
    } catch {
      alert("Gagal update status");
    }
  };

  // --- Edit handlers ---
  const updateEditService = (idx: number, field: string, value: any) => {
    setEditServices(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      if (field === "quantity" || field === "priceExTax") {
        updated[idx].total = updated[idx].quantity * updated[idx].priceExTax;
      }
      return updated;
    });
  };

  const removeEditService = (idx: number) => {
    setEditServices(prev => prev.filter((_, i) => i !== idx));
  };

  const updateEditSparepart = (idx: number, field: string, value: any) => {
    setEditSpareparts(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      if (field === "qty" || field === "price") {
        updated[idx].total = updated[idx].qty * updated[idx].price;
      }
      return updated;
    });
  };

  const removeEditSparepart = (idx: number) => {
    setEditSpareparts(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveWOEdits = async () => {
    setEditSaving(true);
    try {
      // Build items array from services and spareparts
      const items = [
        ...editServices.map(s => ({
          itemType: "service",
          itemId: s.itemId || "",
          itemName: s.item || s.description || "",
          qty: s.quantity || 1,
          unitPrice: s.priceExTax || 0,
          assignedTo: s.assignedTo || null,
          estimatedTime: s.estimatedTime || null,
        })),
        ...editSpareparts.map(s => ({
          itemType: "sparepart",
          itemId: s.itemId || "",
          itemName: s.name || "",
          qty: s.qty || 1,
          unitPrice: s.price || 0,
        })),
      ];
      await fetch(`/api/work-orders/${wo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      // Refresh
      const r = await fetch(`/api/work-orders/${wo.id}`);
      const j = await r.json();
      if (j.data) {
        const d = j.data;
        const so = d.so || {};
        const svcs = (d.items || []).filter((it: any) => it.itemType === "service").map((it: any) => ({
          item: it.itemName || it.name || "-", description: it.description || "-", quantity: it.qty || 1, priceExTax: it.unitPrice || 0, total: it.total || 0, itemId: it.itemId, assignedTo: it.assignedToName || it.assignedTo || "-", estimatedTime: it.estimatedTime || "-", linkedSpareparts: it.linkedSpareparts || [],
        }));
        const sps = (d.items || []).filter((it: any) => it.itemType === "sparepart").map((it: any) => ({
          code: it.sku || it.itemId || "-", name: it.itemName || "-", qty: it.qty || 0, price: it.unitPrice || 0, total: it.total || 0, itemId: it.itemId,
        }));
        setWo((prev: any) => ({ ...prev, services: svcs, spareparts: sps, mekanik: d.mekanik?.name || prev.mekanik, mekanikId: d.mekanikId || prev.mekanikId, planStartDate: d.startDate || prev.planStartDate, planEndDate: d.targetDate || prev.planEndDate }));
      }
      setEditMode(false);
    } catch (e: any) {
      alert("Gagal menyimpan: " + e.message);
    } finally {
      setEditSaving(false);
    }
  };

  const handleSaveWOFields = async () => {
    try {
      await fetch(`/api/work-orders/${wo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mekanikId: editFields.mekanikId || undefined,
          startDate: editFields.startDate || undefined,
          targetDate: editFields.targetDate || undefined,
        }),
      });
      setShowEditModal(false);
      const r = await fetch(`/api/work-orders/${wo.id}`);
      const j = await r.json();
      if (j.data) {
        setWo((prev: any) => ({ ...prev, mekanik: j.data.mekanik?.name || prev.mekanik, mekanikId: j.data.mekanikId, planStartDate: j.data.startDate || prev.planStartDate, planEndDate: j.data.targetDate || prev.planEndDate }));
      }
    } catch {
      alert("Gagal menyimpan");
    }
  };

  const handleCreateInvoice = async () => {
    if (!wo?.id) return;
    setCreatingInvoice(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ woId: wo.id }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Gagal membuat invoice");
        setCreatingInvoice(false);
        return;
      }
      // Refresh WO data to show new invoice
      const refreshRes = await fetch(`/api/work-orders/${wo.id}`);
      const refreshJson = await refreshRes.json();
      if (refreshJson.data) {
        const d = refreshJson.data;
        const invoices = (d.invoices || []).map((inv: any) => ({
          docNo: inv.invNo || inv.id,
          invoiceDate: inv.date || inv.invoiceDate || "-",
          dueDate: inv.dueDate || "-",
          status: inv.status || "UNPAID",
          total: inv.total || 0,
          paidAmount: inv.paidAmount || inv.amountPaid || 0,
        }));
        setWo((prev: any) => ({ ...prev, invoices }));
      }
      setActiveTab("docRef");
      alert("Invoice berhasil dibuat: " + (json.data?.invNo || ""));
    } catch {
      alert("Gagal membuat invoice");
    } finally {
      setCreatingInvoice(false);
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
              const isActive = wo.status !== "CANCELLED" && i <= currentStepIdx;
              // Allow clicking next step, or WAITING FOR QC when status is REVISED
              const canClick = wo.status !== "CANCELLED" && !isActive && (
                i === currentStepIdx + 1 || 
                (wo.status === "REVISED" && step === "WAITING FOR QC")
              );
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

            {wo.status === "CANCELLED" && (
              <span style={{ ...S.badge, background: statusColor("CANCELLED"), color: "#fff", border: `1px solid ${statusColor("CANCELLED")}` }}>CANCELLED</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <div style={{ position: "relative" }}>
            <button style={S.actionBtn} onClick={() => setShowPrintDropdown(!showPrintDropdown)}><Printer size={14} /> Print <ChevronDown size={12} /></button>
            {showPrintDropdown && (
              <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 4, background: "#fff", border: "1px solid #ecebea", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 50, minWidth: 180 }}>
                <button onClick={() => { setShowPrintDropdown(false); setShowPrintPreview(true); }} style={{ display: "block", width: "100%", padding: "10px 16px", fontSize: 13, textAlign: "left", border: "none", background: "transparent", cursor: "pointer", borderBottom: "1px solid #f5f5f5" }} onMouseEnter={(e) => e.currentTarget.style.background = "#f5f5f5"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>Normal</button>
                <button onClick={() => { setShowPrintDropdown(false); router.push(`/work-orders/print/receipt/${woNo}`); }} style={{ display: "block", width: "100%", padding: "10px 16px", fontSize: 13, textAlign: "left", border: "none", background: "transparent", cursor: "pointer", borderBottom: "1px solid #f5f5f5" }} onMouseEnter={(e) => e.currentTarget.style.background = "#f5f5f5"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>Receipt</button>
                <button onClick={() => { setShowPrintDropdown(false); router.push(`/work-orders/print/delivery-note/${woNo}`); }} style={{ display: "block", width: "100%", padding: "10px 16px", fontSize: 13, textAlign: "left", border: "none", background: "transparent", cursor: "pointer" }} onMouseEnter={(e) => e.currentTarget.style.background = "#f5f5f5"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>Delivery Note</button>
              </div>
            )}
          </div>
          {/* Start button - only show when status is WAITING/DRAFT and not cancelled */}
          {wo.status !== "CANCELLED" && (wo.status === "WAITING" || wo.status === "DRAFT" || wo.status === "CREATED") && !showStartActions && (
            <button style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }} onClick={() => {
              const hasSpareparts = (wo.spareparts || []).length > 0;
              const hasStockOrders = (wo.stockOrders || []).length > 0;
              const allStockOrdersReceived = hasStockOrders && wo.stockOrders.every((so: any) => so.status?.toUpperCase() === "RECEIVED");
              // Check stock orders status before starting
              if (hasSpareparts && !allStockOrdersReceived) {
                setShowStartBlockModal(true);
                return;
              }
              handleStatusUpdate("IN PROGRESS"); setShowStartActions(true);
            }}><Play size={14} /> Start</button>
          )}

          {wo.status !== "CANCELLED" && showStartActions && (
            <>
              <span style={{ ...S.actionBtn, background: "#f59e0b", color: "#fff", border: "1px solid #f59e0b", cursor: "default" }}>Pending</span>
              <button style={{ ...S.actionBtn, background: "#ea001e", color: "#fff", border: "1px solid #ea001e" }} onClick={() => { setShowStartActions(false); handleStatusUpdate("WAITING"); }}>Cancel</button>
            </>
          )}
          {wo.status !== "CANCELLED" && wo.status !== "COMPLETED" && (
            <button style={{ ...S.actionBtn, background: "#f59e0b", color: "#fff", border: "1px solid #f59e0b" }} onClick={() => { setEditFields({ mekanikId: wo.mekanikId || "", startDate: toDateInput(wo.planStartDate), targetDate: toDateInput(wo.planEndDate) }); setShowEditModal(true); }}><Edit size={14} /> Edit</button>
          )}
          {wo.status !== "CANCELLED" && wo.status !== "COMPLETED" && (
            <button style={{ ...S.actionBtn, background: "#ea001e", color: "#fff", border: "1px solid #ea001e" }} onClick={() => setShowCancelModal(true)}><Trash2 size={14} /> Cancel</button>
          )}
          {wo.status === "COMPLETED" && (
            <>
              <button style={{ ...S.actionBtn, background: wo.invoices?.length > 0 ? "#6b7280" : "#2e844a", color: "#fff", border: `1px solid ${wo.invoices?.length > 0 ? "#6b7280" : "#2e844a"}`, cursor: wo.invoices?.length > 0 ? "pointer" : "default" }} onClick={wo.invoices?.length > 0 ? () => router.push(`/finance/invoices/detail/service/${wo.invoices[0]?.docNo}`) : handleCreateInvoice} disabled={creatingInvoice}><FileText size={14} /> {creatingInvoice ? "Creating..." : wo.invoices?.length > 0 ? "Show Invoice" : "Create Invoice"}</button>
              <button style={{ ...S.actionBtn, background: "#f59e0b", color: "#fff", border: "1px solid #f59e0b" }} onClick={() => setShowReviseModal(true)}><Edit size={14} /> Revise</button>
            </>
          )}
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
            {wo.status !== "CANCELLED" && (wo.status === "DRAFT" || wo.status === "WAITING") && !wo.stockOrders?.length && <button onClick={() => router.push(`/stock-workflow/stock-orders/new?woId=${wo.id}`)} style={{ padding: "3px 10px", fontSize: 11, fontWeight: 600, color: "#fff", background: "#0176d3", border: "none", borderRadius: 4, cursor: "pointer" }}>Create Stock Orders</button>}
            {wo.status === "REVISED" && <button onClick={() => router.push(`/stock-workflow/stock-orders/new?woId=${wo.id}`)} style={{ padding: "3px 10px", fontSize: 11, fontWeight: 600, color: "#fff", background: "#0176d3", border: "none", borderRadius: 4, cursor: "pointer" }}>Create Stock Orders</button>}
            {(wo.status === "WAITING FOR QC" || wo.status === "QC" || wo.status === "REVISED") && <StatusBtn label="Completed" color="#2e844a" onClick={() => handleStatusUpdate("COMPLETED")} />}
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
              <F2 label="Plan Start" value={fmtDate(wo.planStartDate)} />
              <F2 label="Plan End" value={fmtDate(wo.planEndDate)} />
              <F2 label="Actual Start" value={fmtDate(wo.actualStartDate)} />
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
              {!editMode && wo.status !== "CANCELLED" && wo.status !== "COMPLETED" && (
                <button onClick={() => setEditMode(true)} style={{ ...S.actionBtn, background: "#f59e0b", color: "#fff", border: "1px solid #f59e0b" }}><Edit size={13} /> Edit Items</button>
              )}
              {editMode && (
                <>
                  <button onClick={() => { setEditMode(false); setEditServices(wo.services || []); setEditSpareparts(wo.spareparts || []); }} style={S.actionBtn}>Batal</button>
                  <button onClick={handleSaveWOEdits} disabled={editSaving} style={{ ...S.actionBtn, background: "#2e844a", color: "#fff", border: "1px solid #2e844a" }}><Save size={13} /> {editSaving ? "Menyimpan..." : "Simpan"}</button>
                </>
              )}
            </div>
          </div>

          {svcLineTab === "services" && (
            <div>
              <WOServiceTable services={editMode ? editServices : wo.services} editMode={editMode} onUpdate={updateEditService} onRemove={removeEditService} totalCost={editMode ? editServices.reduce((s: number, x: any) => s + (x.total || 0), 0) : totalServiceCost} allMekanik={allMekanik} woStatus={wo.status} serviceProgress={serviceProgress} onStartService={(idx) => setServiceProgress(prev => ({ ...prev, [idx]: "in_progress" }))} onCompleteService={(idx) => setServiceProgress(prev => ({ ...prev, [idx]: "completed" }))} />
            </div>
          )}

          {svcLineTab === "spareparts" && (
            <div>
              <WOSparepartTable spareparts={editMode ? editSpareparts : wo.spareparts} editMode={editMode} onUpdate={updateEditSparepart} onRemove={removeEditSparepart} totalCost={editMode ? editSpareparts.reduce((s: number, x: any) => s + (x.total || 0), 0) : totalSparepartCost} />
            </div>
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
                        onClick={() => router.push(`/finance/invoices/detail/service/${sri.docNo}`)}
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
          {(wo.stockOrders || []).length > 0 ? (
            <div style={{ ...S.tableWrap, marginBottom: 12 }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>Order No</th>
                    <th style={S.th}>Date</th>
                    <th style={S.th}>Warehouse</th>
                    <th style={{ ...S.th, textAlign: "right" }}>Items</th>
                    <th style={S.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(wo.stockOrders || []).map((so: any, i: number) => (
                    <tr key={so.id || i}>
                      <td style={{ ...S.td, color: "#0176d3", fontWeight: 500, cursor: "pointer" }}
                        onClick={() => router.push(`/stock-workflow/stock-orders/detail/${so.orderNo}`)}>{so.orderNo}</td>
                      <td style={S.td}>{so.date ? new Date(so.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</td>
                      <td style={S.td}>{so.warehouse || "-"}</td>
                      <td style={{ ...S.td, textAlign: "right" }}>{so.items?.length || so._count?.items || 0}</td>
                      <td style={S.td}>
                        <span style={{
                          display: "inline-block", padding: "2px 8px", borderRadius: 9999,
                          fontSize: 10, fontWeight: 600, color: "#fff",
                          background: so.status === "CONFIRMED" || so.status === "Confirmed" ? "#0176d3" :
                            so.status === "RECEIVED" || so.status === "Received" ? "#2e844a" :
                            so.status === "CANCELLED" || so.status === "Cancelled" ? "#ea001e" : "#6b7280",
                        }}>{so.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>Belum ada stock orders.</p></div>
          )}
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
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Masukkan deskripsi foto..."
                  value={photoDesc}
                  onChange={(e) => setPhotoDesc(e.target.value)}
                  className="flex-1 h-9 px-3 border border-[#d8d8d8] rounded-lg text-sm outline-none focus:border-[#0176d3]"
                />
                <label className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-[#0176d3] rounded-lg cursor-pointer hover:bg-[#0165b3] transition-colors whitespace-nowrap">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setSelectedFile(file);
                    setPreviewUrl(URL.createObjectURL(file));
                  }} />
                  Pilih Foto
                </label>
              </div>

              {/* Preview */}
              {previewUrl && selectedFile && (
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: 12, background: "#f9f9f9", borderRadius: 8, border: "1px solid #ecebea" }}>
                  <img src={previewUrl} alt="Preview" style={{ width: 160, height: 120, objectFit: "cover", borderRadius: 6, border: "1px solid #d8d8d8" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: "#444746", marginBottom: 4 }}>{selectedFile.name}</div>
                    <div style={{ fontSize: 11, color: "#8e8f8e" }}>{(selectedFile.size / 1024).toFixed(0)} KB</div>
                    <div style={{ fontSize: 13, color: "#001526", marginTop: 8 }}>{photoDesc || "Foto"}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button
                        disabled={uploading}
                        onClick={async () => {
                          setUploading(true);
                          const formData = new FormData();
                          formData.append("file", selectedFile);
                          formData.append("description", photoDesc || "Foto");
                          try {
                            const res = await fetch(`/api/upload?woId=${wo.id}`, { method: "POST", body: formData });
                            if (res.ok) {
                              const data = await res.json();
                              setPhotoList(prev => [...prev, { url: data.data.url, description: photoDesc || "Foto", uploadedBy: data.data.uploadedBy, uploadedAt: data.data.uploadedAt }]);
                              setSelectedFile(null);
                              setPreviewUrl(null);
                              setPhotoDesc("");
                            } else {
                              alert("Gagal upload foto");
                            }
                          } catch {
                            alert("Gagal upload foto");
                          }
                          setUploading(false);
                        }}
                        style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "1px solid #0176d3", fontSize: 12 }}
                      >
                        {uploading ? "Uploading..." : "Simpan Foto"}
                      </button>
                      <button onClick={() => { setSelectedFile(null); setPreviewUrl(null); }} style={{ ...S.actionBtn, fontSize: 12 }}>Batal</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Photo List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {photoList.length === 0 ? (
              <div style={{ ...S.card, textAlign: "center", color: "#8e8f8e", fontSize: 13 }}>Belum ada foto</div>
            ) : photoList.map((p, i) => (
              <div key={i} style={{ ...S.card, display: "flex", gap: 16, alignItems: "center" }}>
                <img src={p.url} alt={p.description} onClick={() => setLightboxPhoto(p.url)} style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 4, border: "1px solid #d8d8d8", cursor: "pointer" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: "#001526" }}>{p.description}</div>
                  <div style={{ fontSize: 11, color: "#8e8f8e" }}>oleh {p.uploadedBy} • {new Date(p.uploadedAt).toLocaleDateString("id-ID")}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Lightbox */}
          {lightboxPhoto && (
            <div onClick={() => setLightboxPhoto(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, cursor: "pointer" }}>
              <button onClick={() => setLightboxPhoto(null)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "#fff", fontSize: 24, cursor: "pointer", padding: 8 }}>✕</button>
              <img src={lightboxPhoto} alt="Preview" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain", borderRadius: 8, cursor: "default" }} />
            </div>
          )}
        </div>
      )}

      {/* Edit Fields Modal */}
      {showEditModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, maxWidth: 440, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.16)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#001526", marginBottom: 16 }}>Edit Work Order</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase", marginBottom: 4 }}>Mekanik</label>
              <select value={editFields.mekanikId} onChange={e => setEditFields(prev => ({ ...prev, mekanikId: e.target.value }))} style={{ width: "100%", padding: "6px 10px", fontSize: 13, border: "1px solid #d8d8d8", borderRadius: 6, outline: "none" }}>
                <option value="">-- Pilih Mekanik --</option>
                {allMekanik.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase", marginBottom: 4 }}>Tanggal Mulai</label>
              <input type="date" value={editFields.startDate} onChange={e => setEditFields(prev => ({ ...prev, startDate: e.target.value }))} style={{ width: "100%", padding: "6px 10px", fontSize: 13, border: "1px solid #d8d8d8", borderRadius: 6, outline: "none" }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase", marginBottom: 4 }}>Tanggal Target</label>
              <input type="date" value={editFields.targetDate} onChange={e => setEditFields(prev => ({ ...prev, targetDate: e.target.value }))} style={{ width: "100%", padding: "6px 10px", fontSize: 13, border: "1px solid #d8d8d8", borderRadius: 6, outline: "none" }} />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowEditModal(false)} style={S.actionBtn}>Batal</button>
              <button onClick={handleSaveWOFields} style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Start Block Modal - Stock Orders not received */}
      {showStartBlockModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, maxWidth: 440, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.16)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 20 }}>⚠️</span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#001526" }}>Belum Bisa Start</h3>
            </div>
            <p style={{ fontSize: 14, color: "#444746", marginBottom: 8 }}>Work Order belum bisa di-Start karena:</p>
            <ul style={{ fontSize: 13, color: "#444746", marginBottom: 20, paddingLeft: 20 }}>
              <li>Stock orders masih dalam status <strong>Draft</strong></li>
              <li>Silakan proses stock orders sampai status <strong>Received</strong> terlebih dahulu</li>
            </ul>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowStartBlockModal(false)} style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}>Mengerti</button>
            </div>
          </div>
        </div>
      )}

      {/* Completed Block Modal - Stock Orders not received when REVISED */}
      {showCompletedBlockModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, maxWidth: 440, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.16)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 20 }}>⚠️</span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#001526" }}>Belum Bisa Completed</h3>
            </div>
            <p style={{ fontSize: 14, color: "#444746", marginBottom: 20, whiteSpace: "pre-line" }}>{completedBlockMsg}</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowCompletedBlockModal(false)} style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}>Mengerti</button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, maxWidth: 440, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.16)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Trash2 size={20} style={{ color: "#ea001e" }} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#001526" }}>Cancel Work Order</h3>
            </div>
            <p style={{ fontSize: 14, color: "#444746", marginBottom: 20 }}>
              Apakah kamu yakin ingin membatalkan Work Order <strong>{wo.documentNumber}</strong>? Status akan berubah menjadi <strong>Cancelled</strong> dan tidak bisa diubah lagi.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowCancelModal(false)} style={{ ...S.actionBtn, border: "1px solid #dddbda" }}>Batal</button>
              <button onClick={async () => { await handleStatusUpdate("CANCELLED"); setShowCancelModal(false); }} style={{ ...S.actionBtn, background: "#ea001e", color: "#fff", border: "1px solid #ea001e" }}>Ya, Cancel WO</button>
            </div>
          </div>
        </div>
      )}

      {/* Revise Confirmation Modal */}
      {showReviseModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, maxWidth: 440, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.16)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Edit size={20} style={{ color: "#f59e0b" }} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#001526" }}>Revise Work Order</h3>
            </div>
            <p style={{ fontSize: 14, color: "#444746", marginBottom: 20 }}>
              Work Order <strong>{wo.documentNumber}</strong> akan di-revise. Status akan berubah menjadi <strong>Revised</strong>. Kamu bisa menambahkan service atau sparepart baru dari halaman Service Orders.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowReviseModal(false)} style={{ ...S.actionBtn, border: "1px solid #dddbda" }}>Batal</button>
              <button onClick={async () => { await handleStatusUpdate("REVISED"); setShowReviseModal(false); }} style={{ ...S.actionBtn, background: "#f59e0b", color: "#fff", border: "1px solid #f59e0b" }}>Ya, Revise WO</button>
            </div>
          </div>
        </div>
      )}

      {/* Print Preview Modal */}
      {showPrintPreview && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => setShowPrintPreview(false)} />
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
                  <F label="PLAN START" value={fmtDate(wo.planStartDate)} />
                  <F label="PLAN END" value={fmtDate(wo.planEndDate)} />
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
              <button onClick={() => setShowPrintPreview(false)} style={{ padding: "8px 24px", fontSize: 13, fontWeight: 600, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" }}>Tutup</button>
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

/* ─── Editable WO Services Table ─── */
function WOServiceTable({ services, editMode, onUpdate, onRemove, totalCost, allMekanik, woStatus, serviceProgress, onStartService, onCompleteService }: {
  services: any[]; editMode: boolean; totalCost: number;
  onUpdate: (idx: number, field: string, value: any) => void;
  onRemove: (idx: number) => void;
  allMekanik: any[];
  woStatus?: string;
  serviceProgress?: Record<number, string>;
  onStartService?: (idx: number) => void;
  onCompleteService?: (idx: number) => void;
}) {
  const showProgressCols = woStatus === "IN PROGRESS" && !editMode;
  const colCount = showProgressCols ? 10 : 9;
  return (
    <div className="overflow-x-auto rounded-lg border border-[#ecebea] bg-white">
      <table style={S.table}>
        <thead>
          <tr>
            <th style={{ ...S.th, width: 36 }}>No.</th>
            <th style={S.th}>Item</th>
            <th className="hidden sm:table-cell" style={S.th}>Description</th>
            <th style={{ ...S.th, textAlign: "right" }}>Qty</th>
            <th className="hidden md:table-cell" style={S.th}>Assigned To</th>
            <th className="hidden lg:table-cell" style={S.th}>Spareparts</th>
            <th className="hidden md:table-cell" style={S.th}>Est. Time</th>
            {showProgressCols ? (
              <>
                <th className="hidden sm:table-cell" style={S.th}>Progress</th>
                <th className="hidden sm:table-cell" style={S.th}>Complete</th>
              </>
            ) : (
              <th className="hidden sm:table-cell" style={S.th}>Status</th>
            )}
            <th style={{ ...S.th, textAlign: "right" }}>Total</th>
            {editMode && <th style={{ ...S.th, width: 40 }}></th>}
          </tr>
        </thead>
        <tbody>
          {services.length === 0 && (
            <tr><td colSpan={colCount} style={{ ...S.td, textAlign: "center", color: "#8e8f8e", padding: 24 }}>Belum ada service</td></tr>
          )}
          {services.map((svc: any, i: number) => (
            <tr key={i} style={S.tr}>
              <td style={S.td}>{i + 1}</td>
              <td style={{ ...S.td, color: "#0176d3", fontWeight: 500 }}>{svc.item}</td>
              <td className="hidden sm:table-cell" style={S.td}>{svc.description}</td>
              <td style={{ ...S.td, textAlign: "right" }}>
                {editMode ? (
                  <FormattedNumberInput value={svc.quantity} onChange={val => onUpdate(i, "quantity", Math.max(1, val) || 1)}
                                      style={{ width: 80, padding: "3px 6px", fontSize: 12, border: "1px solid #d8d8d8", borderRadius: 4, textAlign: "right" }} />
                ) : svc.quantity}
              </td>
              <td className="hidden md:table-cell" style={S.td}>
                {editMode ? (
                  <select value={svc.assignedTo && svc.assignedTo !== "-" ? svc.assignedTo : ""} onChange={e => onUpdate(i, "assignedTo", e.target.value)}
                    style={{ width: "100%", padding: "3px 6px", fontSize: 12, border: "1px solid #d8d8d8", borderRadius: 4, background: "#fff" }}>
                    <option value="">-- Pilih --</option>
                    {allMekanik.map((m: any) => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                ) : svc.assignedTo}
              </td>
              <td className="hidden lg:table-cell" style={{ ...S.td, fontSize: 11 }}>
                {svc.linkedSpareparts?.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {svc.linkedSpareparts.map((sp: any, j: number) => (
                      <span key={j} style={{ color: "#444746" }}>{sp.name} <span style={{ color: "#8e8f8e" }}>x{sp.qty}</span></span>
                    ))}
                  </div>
                ) : <span style={{ color: "#8e8f8e" }}>-</span>}
              </td>
              <td className="hidden md:table-cell" style={S.td}>
                {editMode ? (
                  <input type="date" value={svc.estimatedTime && svc.estimatedTime !== "-" ? svc.estimatedTime : ""} onChange={e => onUpdate(i, "estimatedTime", e.target.value)}
                    style={{ width: 130, padding: "3px 6px", fontSize: 12, border: "1px solid #d8d8d8", borderRadius: 4 }} />
                ) : svc.estimatedTime}
              </td>
              {showProgressCols ? (
                <>
                  <td className="hidden sm:table-cell" style={S.td}>
                    {serviceProgress?.[i] === "in_progress" || serviceProgress?.[i] === "completed" ? (
                      <span style={{ ...S.pill, background: "#0176d3" }}>In Progress</span>
                    ) : (
                      <button onClick={() => onStartService?.(i)} style={{ padding: "3px 10px", fontSize: 10, fontWeight: 600, color: "#fff", background: "#0176d3", border: "none", borderRadius: 4, cursor: "pointer" }}>Start</button>
                    )}
                  </td>
                  <td className="hidden sm:table-cell" style={S.td}>
                    {serviceProgress?.[i] === "completed" ? (
                      <span style={{ ...S.pill, background: "#2e844a" }}>Completed</span>
                    ) : serviceProgress?.[i] === "in_progress" ? (
                      <button onClick={() => onCompleteService?.(i)} style={{ padding: "3px 10px", fontSize: 10, fontWeight: 600, color: "#fff", background: "#2e844a", border: "none", borderRadius: 4, cursor: "pointer" }}>Complete</button>
                    ) : (
                      <span style={{ ...S.pill, background: "#d8d8d8", color: "#8e8f8e" }}>-</span>
                    )}
                  </td>
                </>
              ) : (
                <td className="hidden sm:table-cell" style={S.td}>
                  <span style={{ ...S.pill, background: svc.status === "Completed" ? "#2e844a" : svc.status === "In Progress" ? "#0176d3" : "#fe9339" }}>{svc.status}</span>
                </td>
              )}
              <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmt(svc.total)}</td>
              {editMode && (
                <td style={S.td}>
                  <button onClick={() => onRemove(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ea001e", padding: 2 }}><Trash2 size={14} /></button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ background: "#f3f3f3", fontWeight: 600 }}>
            <td colSpan={showProgressCols ? 8 : 7} style={S.td}></td>
            <td style={{ ...S.td, textAlign: "right", fontWeight: 700 }}>{fmt(totalCost)}</td>
            {editMode && <td style={S.td}></td>}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/* ─── Editable WO Sparepart Table ─── */
function WOSparepartTable({ spareparts, editMode, onUpdate, onRemove, totalCost }: {
  spareparts: any[]; editMode: boolean; totalCost: number;
  onUpdate: (idx: number, field: string, value: any) => void;
  onRemove: (idx: number) => void;
}) {
  if (!editMode && spareparts.length === 0) {
    return <div style={{ marginTop: 16, ...S.card }}><p style={{ color: "#444746", fontSize: 14 }}>Belum ada sparepart yang digunakan.</p></div>;
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-[#ecebea] bg-white" style={{ marginTop: editMode ? 0 : 16 }}>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={{ ...S.th, width: 36 }}>No.</th>
            <th style={S.th}>Code</th>
            <th style={S.th}>Name</th>
            <th style={{ ...S.th, textAlign: "right" }}>Qty</th>
            <th className="hidden sm:table-cell" style={{ ...S.th, textAlign: "right" }}>Price</th>
            <th style={{ ...S.th, textAlign: "right" }}>Total</th>
            {editMode && <th style={{ ...S.th, width: 40 }}></th>}
          </tr>
        </thead>
        <tbody>
          {spareparts.length === 0 && editMode && (
            <tr><td colSpan={7} style={{ ...S.td, textAlign: "center", color: "#8e8f8e", padding: 24 }}>Belum ada sparepart</td></tr>
          )}
          {spareparts.map((sp: any, i: number) => (
            <tr key={i} style={S.tr}>
              <td style={S.td}>{i + 1}</td>
              <td style={{ ...S.td, color: "#0176d3", fontWeight: 500 }}>{sp.code}</td>
              <td style={S.td}>{sp.name}</td>
              <td style={{ ...S.td, textAlign: "right" }}>
                {editMode ? (
                  <FormattedNumberInput value={sp.qty} onChange={val => onUpdate(i, "qty", Math.max(1, val) || 1)}
                    style={{ width: 80, padding: "3px 6px", fontSize: 12, border: "1px solid #d8d8d8", borderRadius: 4, textAlign: "right" }} />
                ) : sp.qty}
              </td>
              <td className="hidden sm:table-cell" style={{ ...S.td, textAlign: "right" }}>
                {editMode ? (
                  <FormattedNumberInput value={sp.price} onChange={val => onUpdate(i, "price", val)}
                    style={{ width: 100, padding: "3px 6px", fontSize: 12, border: "1px solid #d8d8d8", borderRadius: 4, textAlign: "right" }} />
                ) : fmt(sp.price)}
              </td>
              <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmt(sp.total)}</td>
              {editMode && (
                <td style={S.td}>
                  <button onClick={() => onRemove(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ea001e", padding: 2 }}><Trash2 size={14} /></button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
        {(spareparts.length > 0 || editMode) && (
          <tfoot>
            <tr style={{ background: "#f3f3f3", fontWeight: 600 }}>
              <td colSpan={editMode ? 5 : 5} style={S.td}></td>
              <td style={{ ...S.td, textAlign: "right", fontWeight: 700 }}>{fmt(totalCost)}</td>
              {editMode && <td style={S.td}></td>}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
