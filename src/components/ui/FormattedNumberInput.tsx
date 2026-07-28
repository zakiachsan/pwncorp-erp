"use client";

import { useState, useEffect, useRef } from "react";

interface FormattedNumberInputProps {
  value: number;
  onChange: (value: number) => void;
  decimals?: number;
  min?: number;
  max?: number;
  name?: string;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  disabled?: boolean;
}

export default function FormattedNumberInput({
  value,
  onChange,
  decimals = 0,
  min,
  max,
  name,
  className,
  style,
  placeholder,
  disabled,
}: FormattedNumberInputProps) {
  const [focused, setFocused] = useState(false);
  const [raw, setRaw] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync raw from value when not focused
  useEffect(() => {
    if (!focused) {
      setRaw(decimals > 0 ? value.toFixed(decimals) : String(value ?? 0));
    }
  }, [value, focused, decimals]);

  const formatted = decimals > 0
    ? (value ?? 0).toLocaleString("id-ID", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : (value ?? 0).toLocaleString("id-ID");

  const handleFocus = () => {
    setFocused(true);
    setRaw(decimals > 0 ? (value ?? 0).toFixed(decimals) : String(value ?? 0));
    // Select all on focus
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const handleBlur = () => {
    setFocused(false);
    let parsed = parseFloat(raw.replace(/[^\d.-]/g, ""));
    if (isNaN(parsed)) parsed = 0;
    if (min !== undefined && parsed < min) parsed = min;
    if (max !== undefined && parsed > max) parsed = max;
    if (decimals === 0) parsed = Math.round(parsed);
    onChange(parsed);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRaw(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="decimal"
      name={name}
      className={className}
      style={style}
      value={focused ? raw : formatted}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}
