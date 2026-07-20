"use client";

import { Bell, Search, ChevronDown, Menu } from "lucide-react";
import { useState } from "react";

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const [search, setSearch] = useState("");

  return (
    <header className="h-14 flex items-center px-4 lg:px-6 bg-white border-b border-[--color-border-light] flex-shrink-0 gap-4 z-20">
      {/* Mobile Hamburger */}
      <button
        className="lg:hidden p-1.5 -ml-1 text-[--color-text-secondary] hover:text-[--color-text-primary] transition-colors"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-md hidden sm:block">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--color-text-placeholder]" />
        <input
          type="text"
          placeholder="Cari sesuatu..."
          className="w-full h-9 pl-9 pr-4 border border-[--color-border] rounded-full bg-[--color-background] text-sm font-sans text-[--color-text-primary] outline-none transition-colors focus:border-[--color-brand] focus:shadow-[0_0_0_2px_rgba(1,118,211,0.2)]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Notification */}
        <button className="relative p-1.5 text-[--color-text-secondary] hover:text-[--color-text-primary] transition-colors">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[--color-error] rounded-full border-2 border-white" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-slds-md hover:bg-[--color-background] transition-colors">
          <div className="w-8 h-8 rounded-full bg-[--color-brand] flex items-center justify-center text-white text-xs font-bold">
            AD
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold text-[--color-text-primary]">Admin</div>
            <div className="text-[11px] text-[--color-text-secondary]">Administrator</div>
          </div>
          <ChevronDown size={14} className="text-[--color-text-secondary]" />
        </div>
      </div>
    </header>
  );
}
