import AppShell from "@/components/layout/AppShell";

export default function MasterdataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
