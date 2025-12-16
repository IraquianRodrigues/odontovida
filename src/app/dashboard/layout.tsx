import { AppHeader } from "./_components/app-header";
import { DashboardNav } from "./_components/dashboard-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppHeader />
      <DashboardNav />
      {children}
    </>
  );
}
