"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function APAgingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/finance/reports/aging-ap");
  }, [router]);

  return <div className="p-8 text-center">Loading...</div>;
}
