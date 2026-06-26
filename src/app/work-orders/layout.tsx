import AppShell from "@/components/layout/AppShell";

export default function WorkordersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
