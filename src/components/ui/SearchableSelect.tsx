"use client";

import { useState, useRef, useEffect } from "react";

type Option = { value: string; label: string; sublabel?: string };

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function SearchableSelect({ options, value, onChange, placeholder = "Ketik untuk mencari...", disabled = false }: SearchableSelectProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);
  const displayValue = selected ? selected.label : "";

  const filtered = options.filter((o) => {
    const q = query.toLowerCase();
    return o.label.toLowerCase().includes(q) || (o.sublabel && o.sublabel.toLowerCase().includes(q));
  });

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const select = (val: string) => {
    onChange(val);
    setQuery("");
    setOpen(false);
    setHighlightIdx(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) { if (e.key === "ArrowDown" || e.key === "Enter") { setOpen(true); e.preventDefault(); } return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlightIdx((p) => Math.min(p + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlightIdx((p) => Math.max(p - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (highlightIdx >= 0 && filtered[highlightIdx]) select(filtered[highlightIdx].value); }
    else if (e.key === "Escape") { setOpen(false); setHighlightIdx(-1); }
  };

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <input
        ref={inputRef}
        type="text"
        className="form-input"
        style={{ width: "100%", paddingRight: 28 }}
        placeholder={selected ? displayValue : placeholder}
        value={query || (open ? "" : displayValue)}
        disabled={disabled}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setHighlightIdx(-1); }}
        onFocus={() => { setOpen(true); setQuery(""); setHighlightIdx(-1); }}
        onKeyDown={handleKeyDown}
      />
      {/* Clear button */}
      {value && !disabled && (
        <span
          onClick={() => { onChange(""); setQuery(""); inputRef.current?.focus(); }}
          style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#999", fontSize: 14, lineHeight: 1 }}
        >×</span>
      )}
      {/* Dropdown */}
      {open && filtered.length > 0 && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100, background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, maxHeight: 200, overflow: "auto", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginTop: 2 }}>
          {filtered.map((o, idx) => (
            <div
              key={o.value}
              onClick={() => select(o.value)}
              onMouseEnter={() => setHighlightIdx(idx)}
              style={{ padding: "6px 10px", cursor: "pointer", fontSize: 13, background: idx === highlightIdx ? "#f0f7ff" : "#fff", borderBottom: idx < filtered.length - 1 ? "1px solid #f0f0f0" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <span style={{ fontWeight: value === o.value ? 600 : 400, color: value === o.value ? "#0176d3" : "#001526" }}>{o.label}</span>
              {o.sublabel && <span style={{ fontSize: 11, color: "#888" }}>{o.sublabel}</span>}
            </div>
          ))}
        </div>
      )}
      {open && query && filtered.length === 0 && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100, background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, padding: "10px 12px", fontSize: 13, color: "#999", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginTop: 2 }}>
          Tidak ditemukan
        </div>
      )}
    </div>
  );
}
