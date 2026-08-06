"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ARAgingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/finance/reports/aging-ar");
  }, [router]);

  return <div className="p-8 text-center">Loading...</div>;
}
