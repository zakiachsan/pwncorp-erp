"use client";

import { Bell, Search, ChevronDown, Menu, LogOut, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const userName = (session?.user?.name as string) || "User";
  const userEmail = (session?.user?.email as string) || "";
  const userRole = ((session?.user as any)?.role as string) || "";
  const initials = userName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    signOut({ callbackUrl: "/" });
  };

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

        {/* User dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-slds-md hover:bg-[--color-background] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[--color-brand] flex items-center justify-center text-white text-xs font-bold">
              {initials || "U"}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-semibold text-[--color-text-primary] leading-tight">{userName}</div>
              <div className="text-[11px] text-[--color-text-secondary] leading-tight">{userRole || "User"}</div>
            </div>
            <ChevronDown size={14} className={`text-[--color-text-secondary] transition-transform ${menuOpen ? "rotate-180" : ""}`} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white border border-[--color-border-light] rounded-lg shadow-lg overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-[--color-border-light] bg-[--color-background]">
                <div className="text-sm font-semibold text-[--color-text-primary] truncate">{userName}</div>
                <div className="text-xs text-[--color-text-secondary] truncate">{userEmail}</div>
                {userRole && <div className="text-[11px] text-[--color-brand] font-medium mt-0.5">{userRole}</div>}
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[--color-text-primary] hover:bg-[--color-background] transition-colors"
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
