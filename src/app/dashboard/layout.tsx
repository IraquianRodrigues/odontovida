import { AppHeader } from "./_components/app-header";
import { AppSidebar } from "./_components/app-sidebar";
import { RealtimeProvider } from "@/providers/realtime-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RealtimeProvider>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <AppSidebar />

          {/* Main Content Area - margin will be adjusted by CSS based on sidebar state */}
          <div className="ml-0 flex flex-1 flex-col overflow-hidden transition-all duration-300 md:ml-60 [.sidebar-collapsed_&]:md:ml-16">
            <AppHeader />
            <main className="flex-1 overflow-y-auto bg-background">
              {children}
            </main>
          </div>
        </div>
    </RealtimeProvider>
  );
}
