"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const noArray = params.no as string[];
  const invoiceNo = Array.isArray(noArray) ? noArray.join("/") : (noArray || "");

  useEffect(() => {
    if (!invoiceNo) { router.replace("/finance/invoices"); return; }

    // Service Invoice → redirect to new page
    if (invoiceNo.startsWith("service/")) {
      const rest = invoiceNo.replace("service/", "");
      router.replace(`/finance/invoices/service/${rest}`);
      return;
    }

    // Purchase Invoice
    if (invoiceNo.startsWith("SPI/") || invoiceNo.startsWith("PI/") || invoiceNo.startsWith("purchase/")) {
      const rest = invoiceNo.replace("purchase/", "");
      router.replace(`/finance/invoices/purchase/${rest}`);
      return;
    }

    // Invoice Receivable
    if (invoiceNo.startsWith("IR/") || invoiceNo.startsWith("receivable/")) {
      const rest = invoiceNo.replace("receivable/", "");
      router.replace(`/finance/invoices/receivables/${rest}`);
      return;
    }

    // Default: redirect to service invoices list
    router.replace("/finance/invoices/service");
  }, [invoiceNo, router]);

  return <div style={{ padding: 32, textAlign: "center", color: "#444746" }}>Redirecting...</div>;
}
