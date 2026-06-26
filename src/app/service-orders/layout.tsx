import AppShell from "@/components/layout/AppShell";

export default function ServiceordersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
