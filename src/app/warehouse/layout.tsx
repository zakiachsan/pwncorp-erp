import AppShell from "@/components/layout/AppShell";

export default function WarehouseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
