import AppShell from "@/components/layout/AppShell";

export default function ServicePackagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
