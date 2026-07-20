"use client";

import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const PRESETS = [
  { key: "today", label: "Hari Ini", get: () => { const d = new Date(); return [d, d] as [Date, Date]; } },
  { key: "yesterday", label: "Kemarin", get: () => { const d = new Date(); d.setDate(d.getDate() - 1); return [d, d] as [Date, Date]; } },
  { key: "7d", label: "7 Hari Terakhir", get: () => { const to = new Date(); const from = new Date(); from.setDate(from.getDate() - 6); return [from, to] as [Date, Date]; } },
  { key: "30d", label: "30 Hari Terakhir", get: () => { const to = new Date(); const from = new Date(); from.setDate(from.getDate() - 29); return [from, to] as [Date, Date]; } },
  { key: "thisMonth", label: "Bulan Ini", get: () => { const now = new Date(); return [new Date(now.getFullYear(), now.getMonth(), 1), new Date(now.getFullYear(), now.getMonth() + 1, 0)] as [Date, Date]; } },
  { key: "lastMonth", label: "Bulan Lalu", get: () => { const now = new Date(); return [new Date(now.getFullYear(), now.getMonth() - 1, 1), new Date(now.getFullYear(), now.getMonth(), 0)] as [Date, Date]; } },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
const MONTHS_LONG = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const fmtDate = (d: Date) => {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${d.getFullYear()}`;
};

const isSameDay = (a: Date | null, b: Date | null) => a && b && a.toDateString() === b.toDateString();

interface DateRangePickerProps {
  from: Date;
  to: Date;
  onChange: (from: Date, to: Date) => void;
  onApply?: () => void;
  label?: string;
}

export default function DateRangePicker({ from, to, onChange, onApply, label }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>("thisMonth");
  const [viewMonth, setViewMonth] = useState(() => from.getMonth());
  const [viewYear, setViewYear] = useState(() => from.getFullYear());
  const [pendingFrom, setPendingFrom] = useState<Date>(from);
  const [pendingTo, setPendingTo] = useState<Date>(to);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [selectStart, setSelectStart] = useState<Date | null>(null);

  const inRange = (d: Date) => {
    if (!selectStart && !pendingFrom) return false;
    const start = selectStart || pendingFrom;
    const end = hoverDate && selectStart ? (hoverDate > selectStart ? hoverDate : selectStart) : (pendingTo || start);
    const check = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    return check >= s && check <= e;
  };

  const applyPreset = (key: string) => {
    const preset = PRESETS.find(p => p.key === key);
    if (!preset) return;
    const [f, t] = preset.get();
    setPendingFrom(f); setPendingTo(t);
    setSelectStart(null); setActivePreset(key);
    setViewMonth(f.getMonth()); setViewYear(f.getFullYear());
  };

  const handleApply = () => {
    onChange(pendingFrom, pendingTo);
    onApply?.();
    setOpen(false);
  };

  const handleCancel = () => {
    setPendingFrom(from); setPendingTo(to);
    setSelectStart(null); setHoverDate(null); setOpen(false);
  };

  const renderMonth = (monthOffset: number) => {
    const m = viewMonth + monthOffset;
    const month = ((m % 12) + 12) % 12;
    const year = viewYear + Math.floor(m / 12);
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = firstDay.getDay();
    const days: (number | null)[] = [];
    for (let i = 0; i < startDow; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(d);
    while (days.length % 7 !== 0) days.push(null);

    return (
      <div key={monthOffset} style={{ flex: 1, minWidth: 240 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0, textAlign: "center" }}>
          {DAYS.map(dd => <div key={dd} style={{ fontSize: 10, fontWeight: 600, color: "#8e8f8e", padding: "4px 0" }}>{dd}</div>)}
          {days.map((d, i) => {
            if (d === null) return <div key={i} />;
            const date = new Date(year, month, d);
            const isSel = isSameDay(date, pendingFrom) || isSameDay(date, pendingTo);
            const isInRange = inRange(date);
            const isToday = isSameDay(date, new Date());
            return (
              <div key={i}
                onClick={() => {
                  if (!selectStart || (selectStart && date < selectStart)) {
                    setSelectStart(date); setPendingFrom(date); setPendingTo(date); setActivePreset(null);
                  } else {
                    setPendingFrom(selectStart); setPendingTo(date); setSelectStart(null); setHoverDate(null); setActivePreset(null);
                  }
                }}
                onMouseEnter={() => { if (selectStart) setHoverDate(date); }}
                style={{
                  padding: "6px 0", fontSize: 13, cursor: "pointer", borderRadius: 6,
                  fontWeight: isSel ? 700 : 400,
                  color: isSel ? "#fff" : (isToday ? "#0176d3" : "#001526"),
                  background: isSel ? "#0176d3" : (isInRange ? "#e3f0ff" : "transparent"),
                  border: isToday && !isSel && !isInRange ? "1px solid #0176d3" : "1px solid transparent",
                }}
              >{d}</div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", fontSize: 13,
          border: "1px solid #d8d8d8", borderRadius: 6, background: "#fff", cursor: "pointer",
          color: "#0176d3", fontWeight: 500,
        }}
      >
        <Calendar size={14} />
        {(() => {
          const preset = PRESETS.find(p => p.key === activePreset);
          const isThisMonth = from.getMonth() === new Date().getMonth() && from.getFullYear() === new Date().getFullYear();
          if (activePreset && preset) return preset.label;
          if (activePreset === "kustom") return `${fmtDate(from)} - ${fmtDate(to)}`;
          if (isThisMonth) return `Bulan Ini`;
          return `${MONTHS_LONG[from.getMonth()]} ${from.getFullYear()}`;
        })()}
        {label && <span style={{ color: "#8e8f8e", fontWeight: 400, marginLeft: 4 }}>{label}</span>}
      </button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 48 }} onClick={handleCancel} />
          <div style={{
            position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 49,
            background: "#fff", borderRadius: 10, boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
            border: "1px solid #ecebea", display: "flex", overflow: "hidden",
          }}>
            <div style={{ borderRight: "1px solid #ecebea", padding: "8px 0", minWidth: 150 }}>
              {PRESETS.map(p => (
                <div key={p.key} onClick={() => applyPreset(p.key)}
                  style={{
                    padding: "8px 14px", fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
                    color: activePreset === p.key ? "#fff" : "#444746",
                    background: activePreset === p.key ? "#0176d3" : "transparent",
                    fontWeight: activePreset === p.key ? 600 : 400,
                  }}
                >{p.label}</div>
              ))}
              <div onClick={() => setActivePreset("kustom")}
                style={{
                  padding: "8px 14px", fontSize: 13, cursor: "pointer",
                  color: activePreset === "kustom" ? "#fff" : "#444746",
                  background: activePreset === "kustom" ? "#0176d3" : "transparent",
                  fontWeight: activePreset === "kustom" ? 600 : 400,
                }}
              >Kustom</div>
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <button onClick={() => { const nm = viewMonth - 1; setViewMonth(((nm % 12) + 12) % 12); if (nm < 0) setViewYear(y => y - 1); }}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                  <ChevronLeft size={16} color="#8e8f8e" />
                </button>
                <div style={{ flex: 1, textAlign: "center", fontWeight: 600, fontSize: 13, color: "#001526" }}>
                  {MONTHS[((viewMonth % 12) + 12) % 12]} {viewYear}
                </div>
                <span style={{ color: "#ecebea", margin: "0 4px" }}>|</span>
                <div style={{ flex: 1, textAlign: "center", fontWeight: 600, fontSize: 13, color: "#001526" }}>
                  {MONTHS[((viewMonth + 1) % 12 + 12) % 12]} {viewYear + Math.floor((viewMonth + 1) / 12)}
                </div>
                <button onClick={() => { const nm = viewMonth + 1; setViewMonth(((nm % 12) + 12) % 12); if (nm > 11) setViewYear(y => y + 1); }}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                  <ChevronRight size={16} color="#8e8f8e" />
                </button>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                {renderMonth(0)}
                {renderMonth(1)}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, paddingTop: 10, borderTop: "1px solid #ecebea" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#001526" }}>{fmtDate(pendingFrom)} - {fmtDate(pendingTo)}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={handleCancel} style={{ padding: "6px 16px", fontSize: 12, fontWeight: 500, border: "1px solid #d8d8d8", borderRadius: 6, background: "#fff", color: "#444746", cursor: "pointer" }}>Batal</button>
                  <button onClick={handleApply} style={{ padding: "6px 16px", fontSize: 12, fontWeight: 600, border: "none", borderRadius: 6, background: "#0176d3", color: "#fff", cursor: "pointer" }}>Terapkan</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
