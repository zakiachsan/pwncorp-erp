"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DatabaseIcon } from "lucide-react";

interface Count {
  label: string;
  count: number;
  href: string;
}

export default function MasterDataPage() {
  const router = useRouter();
  const [counts, setCounts] = useState<Count[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/customers?limit=1").then(r => r.json()),
      fetch("/api/vehicles?limit=1").then(r => r.json()),
      fetch("/api/suppliers?limit=1").then(r => r.json()),
      fetch("/api/services?limit=1").then(r => r.json()),
      fetch("/api/spareparts?limit=1").then(r => r.json()),
      fetch("/api/users?limit=1").then(r => r.json()),
    ]).then(([cust, veh, supp, svc, sp, usr]) => {
      setCounts([
        { label: "Customers", count: cust.pagination?.total ?? 0, href: "/master-data/customers" },
        { label: "Vehicles", count: veh.pagination?.total ?? 0, href: "/master-data/vehicles" },
        { label: "Suppliers", count: supp.pagination?.total ?? 0, href: "/master-data/suppliers" },
        { label: "Services", count: svc.pagination?.total ?? 0, href: "/master-data/services" },
        { label: "Spareparts", count: sp.pagination?.total ?? 0, href: "/master-data/sparepart" },
        { label: "Users", count: usr.pagination?.total ?? 0, href: "/master-data/users" },
      ]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <DatabaseIconComp className="w-6 h-6 text-[--color-brand-secondary]" />
          Master Data
        </div>
      </div>

      {loading && <div className="p-8 text-center text-[--color-text-secondary]">Loading...</div>}

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
          {counts.map((c) => (
            <div
              key={c.label}
              className="card-slds cursor-pointer hover:shadow-md transition-shadow"
              style={{ padding: 20 }}
              onClick={() => router.push(c.href)}
            >
              <div style={{ fontSize: 13, color: "#444746", marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#0176d3" }}>{c.count}</div>
              <div style={{ fontSize: 11, color: "#8e8f8e", marginTop: 4 }}>Total records</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DatabaseIconComp({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
    </svg>
  );
}
