"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Save, ChevronDown, Plus, Search, Trash2, Loader2, X } from "lucide-react";

// ─── Types ───
interface Customer { id: string; name: string; phone?: string; type?: string }
interface Vehicle { id: string; plateNo: string; brand: string; model?: string; year?: number; customer: { id: string; name: string } }
interface Service { id: string; sku: string; name: string; standardPrice?: number; price?: number }
interface Sparepart { id: string; sku: string; name: string; stockQty: number; sellPrice: number }
interface User { id: string; name: string; role?: { name: string } }

// ─── Vehicle type → brand → model mapping ───
const vehicleBrands: Record<string, string[]> = {
  CAR: ["TOYOTA", "HONDA", "MITSUBISHI", "SUZUKI", "DAIHATSU", "ISUZU", "NISSAN", "MAZDA", "HYUNDAI", "KIA", "BMW", "MERCEDES BENZ", "WULING", "CHERY", "MG"],
  MOTORCYCLE: ["HONDA", "YAMAHA", "SUZUKI", "KAWASAKI", "VESPA", "TVS", "ROYAL ENFIELD"],
  TRUCK: ["ISUZU", "MITSUBISHI", "HINO", "TOYOTA", "UD TRUCKS", "SCANIA", "MERCEDES BENZ"],
};

const brandModels: Record<string, string[]> = {
  TOYOTA: ["AVANZA", "KIJANG INNOVA", "FORTUNER", "RUSH", "YARIS", "VIOS", "CAMRY", "COROLLA", "HILUX", "AGYA", "CALYA", "ALPHARD", "VELLFIRE", "LAND CRUISER", "RAIZE", "VELOZ", "SUPRA", "86", "DYNA", "HIACE"],
  HONDA: ["CIVIC", "ACCORD", "CR-V", "HR-V", "BR-V", "JAZZ", "BRIO", "MOBILIO", "CITY", "WR-V", "ODYSSEY", "FREED", "CIVIC TYPE R", "BEAT", "VARIO", "SCOOPY", "PCX", "CBR", "SUPRA X", "REVO", "CRF", "CB"],
  MITSUBISHI: ["PAJERO", "XPANDER", "L300", "TRITON", "OUTLANDER", "MIRAGE", "PAJERO SPORT", "ECLIPSE CROSS", "DELICA", "COLT", "FUSO", "COLT DIESEL", "CANTER", "FIGHTER"],
  SUZUKI: ["ERTIGA", "CARRY", "APV", "IGNIS", "SX4", "BALENO", "JIMNY", "XL7", "SWIFT", "VITARA", "GRAND VITARA", "KARIMUN", "SATRIA", "GSX", "NEX", "ADDRESS", "BURGMAN"],
  DAIHATSU: ["XENIA", "TERIOS", "SIGRA", "AYLA", "GRAN MAX", "LUXIO", "SIRION", "ROCKY", "TAFT", "COPEN", "HIJET"],
  ISUZU: ["ELF", "D-MAX", "MU-X", "GIGA", "TRAGA", "PANTHER", "F SERIES"],
  NISSAN: ["X-TRAIL", "LIVINA", "MARCH", "SERENA", "TERRA", "NAVARA", "JUKE", "KICKS", "GT-R"],
  MAZDA: ["CX-5", "CX-3", "CX-9", "MAZDA 2", "MAZDA 3", "MAZDA 6", "MX-5", "BT-50"],
  HYUNDAI: ["CRETA", "SANTA FE", "PALISADE", "STARGAZER", "IONIQ", "TUCSON", "KONA"],
  KIA: ["SELTOS", "SONET", "SPORTAGE", "CARNIVAL", "SORENTO", "RIO", "PICANTO"],
  BMW: ["3 SERIES", "5 SERIES", "7 SERIES", "X1", "X3", "X5", "X7", "M3", "M4", "M5"],
  "MERCEDES BENZ": ["A-CLASS", "C-CLASS", "E-CLASS", "S-CLASS", "GLA", "GLC", "GLE", "GLS", "CLA"],
  WULING: ["CONFERO", "CORTEZ", "ALMAZ", "AIR EV", "FORMO"],
  CHERY: ["TIGGO", "OMODA", "EQ1"],
  MG: ["ZS", "HS", "5", "4", "CYBERSTER"],
  YAMAHA: ["NMAX", "AEROX", "XMAX", "R15", "R25", "MT-15", "MT-25", "WR 155", "FAZZIO", "MIO", "GEAR", "JUPITER", "VEGA", "LEXI", "FREEGO"],
  KAWASAKI: ["NINJA", "Z900", "VERSYS", "KLX", "D-TRACKER", "W175", "ELIMINATOR", "VULCAN"],
  VESPA: ["PRIMAVERA", "SPRINT", "GTS", "LX", "946"],
  TVS: ["APACHE", "DAZZ", "NEO", "ROCKZ", "SPORT"],
  "ROYAL ENFIELD": ["CLASSIC 350", "METEOR 350", "HUNTER 350", "HIMALAYAN", "INTERCEPTOR 650", "CONTINENTAL GT 650"],
  HINO: ["DUTRO", "RANGER", "500 SERIES", "700 SERIES", "PROFIA"],
  "UD TRUCKS": ["QUESTER", "CRONER", "KUZER"],
  SCANIA: ["P SERIES", "G SERIES", "R SERIES", "S SERIES"],
};

// ─── Initial empty form ───
const emptyForm = {
  store: "",
  customer: "",
  customerId: "",
  vehicleId: "",
  registrationNo: "",
  planServiceDate: "",
  planServiceTime: "",
  serviceAdvisor: "",
  salesperson: "",
  bookingSource: "",
  referenceNumber: "",
  vehicleType: "",
  vehicleMake: "",
  vehicleModel: "",
  odometer: "",
  year: "",
  color: "",
  complaint: "",
};

export default function NewServiceOrderPage() {
  const router = useRouter();
  const [form, setForm] = useState({ ...emptyForm });
  const [regSearch, setRegSearch] = useState("");
  const [regOpen, setRegOpen] = useState(false);
  const regRef = useRef<HTMLDivElement>(null);
  const regInputRef = useRef<HTMLInputElement>(null);

  // ─── API Data ───
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [spareparts, setSpareparts] = useState<Sparepart[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Line Items ───
  const [serviceItems, setServiceItems] = useState<{ serviceId: string; qty: number; unitPrice: number }[]>([]);
  const [sparepartItems, setSparepartItems] = useState<{ sparepartId: string; qty: number; unitPrice: number }[]>([]);

  // ─── Fetch all data on mount ───
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [custRes, vehRes, svcRes, spRes, usrRes] = await Promise.all([
          fetch("/api/customers?limit=100"),
          fetch("/api/vehicles?limit=100"),
          fetch("/api/services?limit=100"),
          fetch("/api/spareparts?limit=100"),
          fetch("/api/users?limit=100"),
        ]);
        const [custData, vehData, svcData, spData, usrData] = await Promise.all([
          custRes.json(),
          vehRes.json(),
          svcRes.json(),
          spRes.json(),
          usrRes.json(),
        ]);
        setCustomers(custData.data || []);
        setVehicles(vehData.data || []);
        setServices(svcData.data || []);
        setSpareparts(spData.data || []);
        setUsers(usrData.data || []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Gagal memuat data dari server");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Close registration dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (regRef.current && !regRef.current.contains(e.target as Node)) {
        setRegOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const filteredVehicles = vehicles.filter((v) =>
    v.plateNo.toLowerCase().includes(regSearch.toLowerCase())
  );

  const handleSelectReg = (vehicle: Vehicle) => {
    setForm((prev) => ({
      ...prev,
      registrationNo: vehicle.plateNo,
      customerId: vehicle.customer.id,
      vehicleId: vehicle.id,
      customer: vehicle.customer.name,
      vehicleType: "",
      vehicleMake: vehicle.brand || "",
      vehicleModel: vehicle.model || "",
      year: vehicle.year ? String(vehicle.year) : "",
      color: "",
      odometer: "",
    }));
    setRegOpen(false);
    setRegSearch("");
  };

  const handleSave = async () => {
    if (!form.customerId || !form.vehicleId) {
      setError("Pilih customer dan kendaraan terlebih dahulu");
      return;
    }

    // Validate plan service time not in the past
    if (form.planServiceDate && form.planServiceTime) {
      const now = new Date();
      const planDate = form.planServiceDate; // YYYY-MM-DD
      const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
      if (planDate === todayStr) {
        const currentTime = now.toTimeString().slice(0, 5); // HH:MM
        if (form.planServiceTime < currentTime) {
          setError(`Waktu service tidak boleh mundur. Saat ini jam ${currentTime}, tidak bisa pilih jam ${form.planServiceTime}`);
          return;
        }
      }
    }

    try {
      setSaving(true);
      setError(null);

      const body = {
        customerId: form.customerId,
        vehicleId: form.vehicleId,
        complaint: form.complaint || null,
        salesperson: form.salesperson || null,
        bookingSource: form.bookingSource || null,
        referenceNumber: form.referenceNumber || null,
        planServiceTime: form.planServiceTime || null,
        odometer: form.odometer || null,
        color: form.color || null,
        spareparts: sparepartItems.filter((sp) => sp.sparepartId),
        services: serviceItems.filter((sv) => sv.serviceId),
      };

      const res = await fetch("/api/service-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menyimpan service order");
      }

      router.push("/service-orders");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menyimpan");
    } finally {
      setSaving(false);
    }
  };

  // ─── Service items helpers ───
  const addServiceItem = () => {
    setServiceItems([...serviceItems, { serviceId: "", qty: 1, unitPrice: 0 }]);
  };
  const updateServiceItem = (idx: number, field: string, value: any) => {
    setServiceItems((prev) => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      if (field === "serviceId") {
        const svc = services.find((s) => s.id === value);
        if (svc) updated.unitPrice = svc.standardPrice || svc.price || 0;
      }
      return updated;
    }));
  };
  const removeServiceItem = (idx: number) => {
    setServiceItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // ─── Sparepart items helpers ───
  const addSparepartItem = () => {
    setSparepartItems([...sparepartItems, { sparepartId: "", qty: 1, unitPrice: 0 }]);
  };
  const updateSparepartItem = (idx: number, field: string, value: any) => {
    setSparepartItems((prev) => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      if (field === "sparepartId") {
        const sp = spareparts.find((s) => s.id === value);
        if (sp) updated.unitPrice = sp.sellPrice || 0;
      }
      return updated;
    }));
  };
  const removeSparepartItem = (idx: number) => {
    setSparepartItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // ─── Inline new vehicle form ───
  const [showNewVehicle, setShowNewVehicle] = useState(false);
  const [newVeh, setNewVeh] = useState({ plateNo: "", type: "", brand: "", model: "", year: "" });
  const [newVehSaving, setNewVehSaving] = useState(false);

  const newVehBrands = newVeh.type ? vehicleBrands[newVeh.type] || [] : [];
  const newVehModels = newVeh.brand ? brandModels[newVeh.brand] || [] : [];

  const handleCreateVehicle = async () => {
    if (!newVeh.plateNo || !newVeh.brand || !form.customerId) return;
    setNewVehSaving(true);
    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: form.customerId,
          plateNo: newVeh.plateNo,
          brand: newVeh.brand,
          model: newVeh.model || undefined,
          year: newVeh.year ? parseInt(newVeh.year) : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal");
      const v = json.data;
      // Add to local list and select
      setVehicles((prev) => [...prev, { ...v, customer: { id: form.customerId, name: form.customer } }]);
      setForm((prev) => ({
        ...prev,
        vehicleId: v.id,
        registrationNo: v.plateNo,
        vehicleMake: v.brand || "",
        vehicleModel: v.model || "",
        year: v.year ? String(v.year) : "",
        vehicleType: newVeh.type,
      }));
      setShowNewVehicle(false);
      setRegOpen(false);
      setNewVeh({ plateNo: "", type: "", brand: "", model: "", year: "" });
    } catch (e: any) {
      setError(e.message || "Gagal membuat kendaraan");
    } finally {
      setNewVehSaving(false);
    }
  };

  // ─── Derived values ───
  const customerOptions = customers.map((c) => ({ value: c.id, label: c.name }));
  const saOptions = users.map((u) => ({ value: u.name, label: u.name }));
  const selectedVehicle = vehicles.find((v) => v.id === form.vehicleId);

  const serviceTotal = serviceItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const sparepartTotal = sparepartItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const grandTotal = serviceTotal + sparepartTotal;

  // When customer changes from the CUSTOMER dropdown (not from vehicle selection),
  // clear the vehicle selection if it doesn't belong to the new customer
  const handleCustomerChange = useCallback((customerId: string) => {
    const cust = customers.find((c) => c.id === customerId);
    setForm((prev) => ({
      ...prev,
      customerId,
      customer: cust?.name || "",
      // Clear vehicle if it doesn't belong to this customer
      vehicleId: selectedVehicle && selectedVehicle.customer.id !== customerId ? "" : prev.vehicleId,
      registrationNo: selectedVehicle && selectedVehicle.customer.id !== customerId ? "" : prev.registrationNo,
      vehicleMake: selectedVehicle && selectedVehicle.customer.id !== customerId ? "" : prev.vehicleMake,
      vehicleModel: selectedVehicle && selectedVehicle.customer.id !== customerId ? "" : prev.vehicleModel,
      year: selectedVehicle && selectedVehicle.customer.id !== customerId ? "" : prev.year,
    }));
  }, [customers, selectedVehicle]);

  if (loading) {
    return (
      <div style={{ padding: "0 24px 24px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
        <div style={{ textAlign: "center" }}>
          <Loader2 size={32} style={{ color: "#0176d3", animation: "spin 1s linear infinite" }} />
          <div style={{ marginTop: 12, fontSize: 14, color: "#444746" }}>Memuat data...</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 24px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={() => router.push("/service-orders")} style={S.backBtn}>
          <ArrowLeft size={16} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>New Service Order</h1>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{ padding: "10px 14px", marginBottom: 16, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#b91c1c", fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Workflow Bar */}
      <div style={S.workflowBar}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#444746" }}>Workflow</span>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ ...S.badge, ...S.badgeActive }}>DRAFT</span>
            <span style={{ ...S.badge, ...S.badgeInactive }}>APPROVED</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleSave} disabled={saving} style={{ ...S.actionBtn, background: saving ? "#a0c4e8" : "#0176d3", color: "#fff", border: "1px solid #0176d3", cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={14} />}
            {saving ? "Menyimpan..." : "Save as Draft"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={S.tabBar}>
        <button style={{ ...S.tab, color: "#fff", background: "#0176d3", fontWeight: 600 }}>Details</button>
      </div>

      {/* Form */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        {/* Left Column */}
        <div>
          <FCreatable label="STORE" value={form.store} onChange={(v) => update("store", v)} placeholder="Pilih store" presets={["Wijaya Motor - One Stop Service", "Wijaya Motor - Branch A", "Wijaya Motor - Branch B"]} />
          <FCreatable
            label="CUSTOMER"
            value={form.customer}
            onChange={(name) => {
              const cust = customers.find((c) => c.name === name);
              if (cust) {
                handleCustomerChange(cust.id);
              } else {
                update("customer", name);
              }
            }}
            placeholder="Pilih / ketik customer"
            presets={customerOptions.map((c) => c.label)}
          />

          {/* Registration No Search */}
          <div style={{ marginBottom: 14 }} ref={regRef}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 4 }}>REGISTRATION NO</div>
            <div style={{ position: "relative" }}>
              <div
                onClick={() => { setRegOpen(true); setTimeout(() => regInputRef.current?.focus(), 50); }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 12px", fontSize: 13, color: form.registrationNo ? "#001526" : "#8e8f8e",
                  border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer",
                  background: "#fff",
                }}
              >
                <span>{form.registrationNo || "Cari nomor polisi..."}</span>
                <Search size={14} style={{ color: "#8e8f8e", flexShrink: 0 }} />
              </div>

              {regOpen && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4,
                  background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.12)", zIndex: 50, maxHeight: 300, overflow: "auto",
                }}>
                  <div style={{ padding: "6px 10px", borderBottom: "1px solid #ecebea" }}>
                    <input
                      ref={regInputRef}
                      type="text"
                      placeholder="Ketik nomor polisi..."
                      value={regSearch}
                      onChange={(e) => setRegSearch(e.target.value)}
                      style={{
                        width: "100%", padding: "6px 8px", fontSize: 13, color: "#001526",
                        border: "1px solid #d8d8d8", borderRadius: 4, outline: "none",
                      }}
                    />
                  </div>

                  {/* Add new vehicle option — top */}
                  <div
                    onClick={() => { if (!form.customerId) { setError("Pilih customer terlebih dahulu sebelum menambah kendaraan"); return; } setRegOpen(false); setShowNewVehicle(true); }}
                    style={{
                      padding: "8px 12px", fontSize: 13, cursor: "pointer",
                      color: "#0176d3", fontWeight: 600, borderBottom: "1px solid #ecebea",
                      display: "flex", alignItems: "center", gap: 6,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f7ff")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <Plus size={14} /> Tambah Kendaraan Baru
                  </div>

                  {filteredVehicles.length > 0 ? filteredVehicles.map((v) => {
                    return (
                      <div
                        key={v.id}
                        onClick={() => handleSelectReg(v)}
                        style={{
                          padding: "10px 12px", fontSize: 13, cursor: "pointer",
                          borderBottom: "1px solid #f0f0f0",
                          color: v.plateNo === form.registrationNo ? "#0176d3" : "#001526",
                          background: v.plateNo === form.registrationNo ? "#eef4ff" : "transparent",
                        }}
                        onMouseEnter={(e) => { if (v.plateNo !== form.registrationNo) e.currentTarget.style.background = "#f5f5f5"; }}
                        onMouseLeave={(e) => { if (v.plateNo !== form.registrationNo) e.currentTarget.style.background = "transparent"; }}
                      >
                        <div style={{ fontWeight: 600 }}>{v.plateNo}</div>
                        <div style={{ fontSize: 11, color: "#444746", marginTop: 2 }}>
                          {v.customer.name} — {v.brand} {v.model || ""} {v.year ? `(${v.year})` : ""}
                        </div>
                      </div>
                    );
                  }) : (
                    <div style={{ padding: "16px", fontSize: 13, color: "#8e8f8e", textAlign: "center" }}>
                      Kendaraan tidak ditemukan
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Inline New Vehicle Form */}
          {showNewVehicle && (
            <div style={{ marginBottom: 14, background: "#f0f7ff", border: "1px solid #0176d3", borderRadius: 8, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#0176d3" }}>Kendaraan Baru — {form.customer || "Customer"}</span>
                <button onClick={() => setShowNewVehicle(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#747678", padding: 2 }}><X size={16} /></button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <input
                  type="text" placeholder="Plat Nomor *" value={newVeh.plateNo}
                  onChange={(e) => setNewVeh((p) => ({ ...p, plateNo: e.target.value }))}
                  style={{ padding: "6px 8px", fontSize: 13, border: "1px solid #d8d8d8", borderRadius: 4, outline: "none" }}
                />
                <select value={newVeh.type} onChange={(e) => setNewVeh((p) => ({ ...p, type: e.target.value, brand: "", model: "" }))}
                  style={{ padding: "6px 8px", fontSize: 13, border: "1px solid #d8d8d8", borderRadius: 4, outline: "none", background: "#fff" }}>
                  <option value="">Tipe Kendaraan *</option>
                  {Object.keys(vehicleBrands).map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={newVeh.brand} onChange={(e) => setNewVeh((p) => ({ ...p, brand: e.target.value, model: "" }))}
                  disabled={newVehBrands.length === 0}
                  style={{ padding: "6px 8px", fontSize: 13, border: "1px solid #d8d8d8", borderRadius: 4, outline: "none", background: newVehBrands.length === 0 ? "#f5f5f5" : "#fff", color: newVehBrands.length === 0 ? "#8e8f8e" : "#001526" }}>
                  <option value="">{newVehBrands.length === 0 ? "Pilih tipe dulu..." : "Merk *"}</option>
                  {newVehBrands.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                <select value={newVeh.model} onChange={(e) => setNewVeh((p) => ({ ...p, model: e.target.value }))}
                  disabled={newVehModels.length === 0}
                  style={{ padding: "6px 8px", fontSize: 13, border: "1px solid #d8d8d8", borderRadius: 4, outline: "none", background: newVehModels.length === 0 ? "#f5f5f5" : "#fff", color: newVehModels.length === 0 ? "#8e8f8e" : "#001526" }}>
                  <option value="">{newVehModels.length === 0 ? "Pilih merk dulu..." : "Model"}</option>
                  {newVehModels.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={newVeh.year} onChange={(e) => setNewVeh((p) => ({ ...p, year: e.target.value }))}
                  style={{ padding: "6px 8px", fontSize: 13, border: "1px solid #d8d8d8", borderRadius: 4, outline: "none", background: "#fff", gridColumn: "span 2" }}>
                  <option value="">Tahun</option>
                  {Array.from({ length: new Date().getFullYear() - 1989 }, (_, i) => new Date().getFullYear() - i).map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <button
                onClick={handleCreateVehicle}
                disabled={newVehSaving || !newVeh.plateNo || !newVeh.brand}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 14px",
                  fontSize: 12, fontWeight: 600, color: "#fff", borderRadius: 6, cursor: "pointer",
                  background: newVehSaving || !newVeh.plateNo || !newVeh.brand ? "#a0c4e8" : "#0176d3",
                  border: "1px solid #0176d3",
                }}
              >
                {newVehSaving ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Plus size={13} />}
                {newVehSaving ? "Menyimpan..." : "Simpan Kendaraan"}
              </button>
            </div>
          )}

          <FInput label="PLAN SERVICE DATE" type="date" value={form.planServiceDate} onChange={(v) => update("planServiceDate", v)} placeholder="Pilih tanggal" />
          <FInput label="PLAN SERVICE TIME" type="time" value={form.planServiceTime} onChange={(v) => update("planServiceTime", v)} placeholder="Pilih waktu" />
          <FCreatable label="SERVICE ADVISOR" value={form.serviceAdvisor} onChange={(v) => update("serviceAdvisor", v)} placeholder="Pilih SA" presets={saOptions.map((u) => u.label)} />
          <FCreatable label="SALESPERSON" value={form.salesperson} onChange={(v) => update("salesperson", v)} placeholder="Pilih / ketik nama" presets={["-", "Andi", "Budi", "Citra"]} />
          <FCreatable label="BOOKING SOURCE" value={form.bookingSource} onChange={(v) => update("bookingSource", v)} placeholder="Pilih / ketik sumber" presets={["WhatsApp", "Telepon", "Walk-in", "Website", "Instagram"]} />
          <FInput label="REFERENCE NUMBER" value={form.referenceNumber} onChange={(v) => update("referenceNumber", v)} placeholder="-" />
        </div>
        {/* Right Column */}
        <div style={{ borderLeft: "1px solid #ecebea", paddingLeft: 32 }}>
          <FSelect label="VEHICLE TYPE" value={form.vehicleType} onChange={(v) => { update("vehicleType", v); update("vehicleMake", ""); update("vehicleModel", ""); }} options={["CAR", "MOTORCYCLE", "TRUCK"]} />
          <FCreatable label="VEHICLE MAKE" value={form.vehicleMake} onChange={(v) => { update("vehicleMake", v); update("vehicleModel", ""); }} placeholder={form.vehicleType ? "Pilih / ketik merk" : "Pilih vehicle type dulu"} presets={vehicleBrands[form.vehicleType] || []} />
          <FCreatable label="VEHICLE MODEL" value={form.vehicleModel} onChange={(v) => update("vehicleModel", v)} placeholder={form.vehicleMake ? "Pilih / ketik model" : "Pilih merk dulu"} presets={brandModels[form.vehicleMake] || []} />
          <FInput label="ODOMETER" value={form.odometer} onChange={(v) => update("odometer", v)} placeholder="Contoh: 45.230" />
          <FCreatable label="YEAR" value={form.year} onChange={(v) => update("year", v)} placeholder="Pilih / ketik tahun" presets={["2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015"]} />
          <FCreatable label="COLOR" value={form.color} onChange={(v) => update("color", v)} placeholder="Pilih / ketik warna" presets={["HITAM", "PUTIH", "SILVER", "ABU-ABU", "MERAH", "BIRU", "HIJAU", "KUNING", "ORANYE", "COKLAT", "EMAS"]} />
        </div>
      </div>

      {/* Complaint Section */}
      <div style={{ marginTop: 24, borderTop: "1px solid #ecebea", paddingTop: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 4 }}>COMPLAINT / KELUHAN</div>
        <textarea
          value={form.complaint}
          onChange={(e) => update("complaint", e.target.value)}
          placeholder="Deskripsikan keluhan customer..."
          rows={3}
          style={{
            width: "100%", padding: "8px 12px", fontSize: 13, color: "#001526",
            border: "1px solid #d8d8d8", borderRadius: 6, outline: "none", resize: "vertical",
          }}
        />
      </div>

      {/* Inspection List Section */}
      <div style={{ marginTop: 24, borderTop: "1px solid #ecebea", paddingTop: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#001526" }}>Inspection List</div>
          <button style={{ ...S.actionBtn, fontSize: 12, color: "#0176d3" }}>
            <Plus size={14} /> Tambah
          </button>
        </div>
        <div style={{ border: "1px solid #d8d8d8", borderRadius: 6, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 1fr 80px", gap: 0, padding: "8px 12px", background: "#f9f9f9", fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>
            <span>No</span>
            <span>Description</span>
            <span>Feedback</span>
            <span style={{ textAlign: "center" }}>Inspected</span>
          </div>
          <div style={{ padding: "24px 12px", textAlign: "center", color: "#8e8f8e", fontSize: 13 }}>
            Belum ada inspection item
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div style={{ marginTop: 24, borderTop: "1px solid #ecebea", paddingTop: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#001526" }}>Jasa / Services</div>
          <button onClick={addServiceItem} style={{ ...S.actionBtn, fontSize: 12, color: "#0176d3" }}>
            <Plus size={14} /> Tambah Jasa
          </button>
        </div>
        {serviceItems.length > 0 && (
          <div style={{ border: "1px solid #d8d8d8", borderRadius: 6, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 120px 120px 40px", gap: 0, padding: "8px 12px", background: "#f9f9f9", fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>
              <span>Service</span>
              <span style={{ textAlign: "center" }}>Qty</span>
              <span style={{ textAlign: "right" }}>Harga Satuan</span>
              <span style={{ textAlign: "right" }}>Total</span>
              <span></span>
            </div>
            {serviceItems.map((item, idx) => (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 80px 120px 120px 40px", gap: 0, padding: "8px 12px", borderTop: "1px solid #ecebea", alignItems: "center" }}>
                <SearchableItemSelect
                  items={services.map((s) => ({ id: s.id, label: `${s.name} (${s.sku})` }))}
                  value={item.serviceId}
                  onChange={(id) => updateServiceItem(idx, "serviceId", id)}
                  placeholder="Cari jasa..."
                />
                <input
                  type="number"
                  min={1}
                  value={item.qty}
                  onChange={(e) => updateServiceItem(idx, "qty", parseInt(e.target.value) || 1)}
                  style={{ padding: "6px 8px", fontSize: 13, border: "1px solid #d8d8d8", borderRadius: 4, outline: "none", textAlign: "center" }}
                />
                <input
                  type="number"
                  min={0}
                  value={item.unitPrice}
                  onChange={(e) => updateServiceItem(idx, "unitPrice", parseFloat(e.target.value) || 0)}
                  style={{ padding: "6px 8px", fontSize: 13, border: "1px solid #d8d8d8", borderRadius: 4, outline: "none", textAlign: "right" }}
                />
                <div style={{ textAlign: "right", fontSize: 13, fontWeight: 600 }}>
                  {(item.qty * item.unitPrice).toLocaleString("id-ID")}
                </div>
                <button onClick={() => removeServiceItem(idx)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Trash2 size={14} style={{ color: "#dc2626" }} />
                </button>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 12px", borderTop: "1px solid #ecebea", background: "#f9f9f9" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#444746", marginRight: 16 }}>Subtotal Jasa:</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#001526", minWidth: 100, textAlign: "right" }}>
                Rp {serviceTotal.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        )}
        {serviceItems.length === 0 && (
          <div style={{ padding: "24px", textAlign: "center", color: "#8e8f8e", fontSize: 13, background: "#fafafa", borderRadius: 6, border: "1px dashed #d8d8d8" }}>
            Belum ada jasa ditambahkan. Klik "Tambah Jasa" untuk menambahkan.
          </div>
        )}
      </div>

      {/* Spareparts Section */}
      <div style={{ marginTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#001526" }}>Suku Cadang / Spareparts</div>
          <button onClick={addSparepartItem} style={{ ...S.actionBtn, fontSize: 12, color: "#0176d3" }}>
            <Plus size={14} /> Tambah Suku Cadang
          </button>
        </div>
        {sparepartItems.length > 0 && (
          <div style={{ border: "1px solid #d8d8d8", borderRadius: 6, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 120px 120px 40px", gap: 0, padding: "8px 12px", background: "#f9f9f9", fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>
              <span>Suku Cadang</span>
              <span style={{ textAlign: "center" }}>Qty</span>
              <span style={{ textAlign: "right" }}>Harga Satuan</span>
              <span style={{ textAlign: "right" }}>Total</span>
              <span></span>
            </div>
            {sparepartItems.map((item, idx) => (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 80px 120px 120px 40px", gap: 0, padding: "8px 12px", borderTop: "1px solid #ecebea", alignItems: "center" }}>
                <SearchableItemSelect
                  items={spareparts.map((sp) => ({ id: sp.id, label: `${sp.name} (${sp.sku}) - Stok: ${sp.stockQty}` }))}
                  value={item.sparepartId}
                  onChange={(id) => updateSparepartItem(idx, "sparepartId", id)}
                  placeholder="Cari suku cadang..."
                />
                <input
                  type="number"
                  min={1}
                  value={item.qty}
                  onChange={(e) => updateSparepartItem(idx, "qty", parseInt(e.target.value) || 1)}
                  style={{ padding: "6px 8px", fontSize: 13, border: "1px solid #d8d8d8", borderRadius: 4, outline: "none", textAlign: "center" }}
                />
                <input
                  type="number"
                  min={0}
                  value={item.unitPrice}
                  onChange={(e) => updateSparepartItem(idx, "unitPrice", parseFloat(e.target.value) || 0)}
                  style={{ padding: "6px 8px", fontSize: 13, border: "1px solid #d8d8d8", borderRadius: 4, outline: "none", textAlign: "right" }}
                />
                <div style={{ textAlign: "right", fontSize: 13, fontWeight: 600 }}>
                  {(item.qty * item.unitPrice).toLocaleString("id-ID")}
                </div>
                <button onClick={() => removeSparepartItem(idx)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Trash2 size={14} style={{ color: "#dc2626" }} />
                </button>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 12px", borderTop: "1px solid #ecebea", background: "#f9f9f9" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#444746", marginRight: 16 }}>Subtotal Suku Cadang:</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#001526", minWidth: 100, textAlign: "right" }}>
                Rp {sparepartTotal.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        )}
        {sparepartItems.length === 0 && (
          <div style={{ padding: "24px", textAlign: "center", color: "#8e8f8e", fontSize: 13, background: "#fafafa", borderRadius: 6, border: "1px dashed #d8d8d8" }}>
            Belum ada suku cadang ditambahkan. Klik "Tambah Suku Cadang" untuk menambahkan.
          </div>
        )}
      </div>

      {/* Grand Total */}
      {(serviceItems.length > 0 || sparepartItems.length > 0) && (
        <div style={{ marginTop: 20, padding: "14px 16px", background: "#f0f7ff", border: "1px solid #b6d4fe", borderRadius: 8, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#444746" }}>Grand Total:</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#0176d3" }}>
            Rp {grandTotal.toLocaleString("id-ID")}
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Creatable Dropdown ─── */
function FCreatable({ label, placeholder, presets, value, onChange }: { label: string; placeholder: string; presets: string[]; value: string; onChange: (v: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState(presets);
  const [filter, setFilter] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newValue, setNewValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync presets when they change (e.g. from API)
  useEffect(() => {
    setOptions(presets);
  }, [presets]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setFilter("");
        setIsAdding(false);
        setNewValue("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isAdding) setTimeout(() => addInputRef.current?.focus(), 50);
  }, [isAdding]);

  const filtered = options.filter((o) => o.toLowerCase().includes(filter.toLowerCase()));

  const handleSelect = (opt: string) => {
    onChange(opt);
    setIsOpen(false);
    setFilter("");
    setIsAdding(false);
    setNewValue("");
  };

  const handleSaveNew = () => {
    if (newValue.trim()) {
      const val = newValue.trim().toUpperCase();
      setOptions([...options, val]);
      onChange(val);
      setIsOpen(false);
      setIsAdding(false);
      setNewValue("");
      setFilter("");
    }
  };

  return (
    <div style={{ marginBottom: 14 }} ref={dropdownRef}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 4 }}>{label}</div>
      <div style={{ position: "relative" }}>
        <div
          onClick={() => { setIsOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "8px 12px", fontSize: 13, color: value ? "#001526" : "#8e8f8e",
            border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer",
            background: "#fff", transition: "border-color 150ms",
          }}
        >
          <span>{value || placeholder}</span>
          <ChevronDown size={14} style={{ color: "#8e8f8e", flexShrink: 0 }} />
        </div>

        {isOpen && (
          <div style={{
            position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4,
            background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6,
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)", zIndex: 50, maxHeight: 240, overflow: "auto",
          }}>
            {/* Add New Button */}
            {!isAdding && (
              <div
                onClick={() => setIsAdding(true)}
                style={{
                  padding: "8px 12px", fontSize: 13, cursor: "pointer",
                  color: "#0176d3", borderBottom: "1px solid #ecebea",
                  display: "flex", alignItems: "center", gap: 6, fontWeight: 600,
                  background: "#f9f9f9",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#eef4ff"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#f9f9f9"}
              >
                <Plus size={14} /> Tambah Baru
              </div>
            )}

            {/* Inline Add Form */}
            {isAdding && (
              <div style={{ padding: "10px 12px", borderBottom: "1px solid #ecebea", background: "#f9f9f9" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 6 }}>
                  Tambah {label}
                </div>
                <input
                  ref={addInputRef}
                  type="text"
                  placeholder={`Ketik nama ${label.toLowerCase()}...`}
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveNew(); if (e.key === "Escape") { setIsAdding(false); setNewValue(""); } }}
                  style={{
                    width: "100%", padding: "6px 10px", fontSize: 13, color: "#001526",
                    border: "1px solid #d8d8d8", borderRadius: 4, outline: "none", marginBottom: 8,
                  }}
                />
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={handleSaveNew}
                    disabled={!newValue.trim()}
                    style={{
                      padding: "5px 14px", fontSize: 12, fontWeight: 600, color: "#fff",
                      background: newValue.trim() ? "#0176d8" : "#d8d8d8",
                      border: "none", borderRadius: 4, cursor: newValue.trim() ? "pointer" : "not-allowed",
                    }}
                  >Simpan</button>
                  <button
                    onClick={() => { setIsAdding(false); setNewValue(""); }}
                    style={{
                      padding: "5px 14px", fontSize: 12, fontWeight: 500, color: "#444746",
                      background: "#fff", border: "1px solid #d8d8d8", borderRadius: 4, cursor: "pointer",
                    }}
                  >Batal</button>
                </div>
              </div>
            )}

            {/* Search */}
            {!isAdding && (
              <div style={{ padding: "6px 10px", borderBottom: "1px solid #ecebea" }}>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Cari..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  style={{
                    width: "100%", padding: "6px 8px", fontSize: 13, color: "#001526",
                    border: "1px solid #d8d8d8", borderRadius: 4, outline: "none",
                  }}
                />
              </div>
            )}

            {/* Options */}
            {!isAdding && filtered.map((opt) => (
              <div
                key={opt}
                onClick={() => handleSelect(opt)}
                style={{
                  padding: "8px 12px", fontSize: 13, cursor: "pointer",
                  color: opt === value ? "#0176d3" : "#001526",
                  background: opt === value ? "#eef4ff" : "transparent",
                  fontWeight: opt === value ? 600 : 400,
                }}
                onMouseEnter={(e) => { if (opt !== value) e.currentTarget.style.background = "#f5f5f5"; }}
                onMouseLeave={(e) => { if (opt !== value) e.currentTarget.style.background = "transparent"; }}
              >
                {opt}
              </div>
            ))}

            {!isAdding && filtered.length === 0 && (
              <div style={{ padding: "12px", fontSize: 13, color: "#8e8f8e", textAlign: "center" }}>
                Tidak ada data ditemukan
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Input ─── */
function FInput({ label, placeholder, type = "text", value, onChange }: { label: string; placeholder: string; type?: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 4 }}>{label}</div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", padding: "8px 12px", fontSize: 13, color: "#001526",
          border: "1px solid #d8d8d8", borderRadius: 6, outline: "none",
        }}
      />
    </div>
  );
}

/* ─── Select ─── */
function FSelect({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 4 }}>{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", padding: "8px 12px", fontSize: 13, color: "#001526",
          border: "1px solid #d8d8d8", borderRadius: 6, outline: "none", background: "#fff",
        }}
      >
        <option value="">Pilih {label.toLowerCase()}</option>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

/* ─── Searchable Item Select (for service/sparepart rows) ─── */
function SearchableItemSelect({ items, value, onChange, placeholder }: {
  items: { id: string; label: string }[]; value: string; onChange: (id: string) => void; placeholder: string;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const selected = items.find((i) => i.id === value);
  const filtered = items.filter((i) => !search || i.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        placeholder={placeholder}
        value={open ? search : (selected?.label || "")}
        onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
        onFocus={() => { setSearch(""); setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        style={{ width: "100%", padding: "6px 8px", fontSize: 13, border: "1px solid #d8d8d8", borderRadius: 4, outline: "none", background: "#fff", boxSizing: "border-box" }}
      />
      {open && filtered.length > 0 && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, maxHeight: 200, overflowY: "auto", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          {filtered.map((i) => (
            <div
              key={i.id}
              onMouseDown={() => { onChange(i.id); setSearch(""); setOpen(false); }}
              style={{ padding: "6px 10px", fontSize: 12, cursor: "pointer", background: value === i.id ? "#f0f7ff" : "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f7ff")}
              onMouseLeave={(e) => (e.currentTarget.style.background = value === i.id ? "#f0f7ff" : "transparent")}
            >{i.label}</div>
          ))}
        </div>
      )}
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
  workflowBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "8px 14px", background: "#f9f9f9", border: "1px solid #ecebea",
    borderRadius: 8, marginBottom: 16,
  },
  badge: {
    display: "inline-flex", alignItems: "center", padding: "3px 10px",
    borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.03em" as const,
  },
  badgeActive: { background: "#032d47", color: "#fff", border: "1px solid #032d47" },
  badgeInactive: { background: "transparent", color: "#8e8f8e", border: "1px solid #d8d8d8" },
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
};
