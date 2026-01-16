"use client";

import { Calendar, Users, UserCog, Briefcase, DollarSign, FileText, ChevronLeft, ChevronRight, Menu, X, Activity } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/use-user-role";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: Calendar,
  },
  {
    href: "/dashboard/clientes",
    label: "Clientes",
    icon: Users,
  },
  {
    href: "/dashboard/prontuarios",
    label: "Prontuários",
    icon: FileText,
    requiresProfessional: true, // Apenas médicos/dentistas
  },
  {
    href: "/dashboard/odontograma",
    label: "Odontograma",
    icon: Activity,
    requiresDentist: true, // Apenas dentistas
  },
  {
    href: "/dashboard/profissionais",
    label: "Profissionais",
    icon: UserCog,
  },
  {
    href: "/dashboard/servicos",
    label: "Serviços",
    icon: Briefcase,
  },
  {
    href: "/dashboard/financeiro",
    label: "Financeiro",
    icon: DollarSign,
    requiresAdmin: true, // Apenas admin pode ver
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { hasFinancialAccess, hasMedicalRecordsAccess, hasOdontogramAccess } = useUserRole();

  // Filtrar itens de navegação baseado em permissões
  const filteredNavItems = navItems.filter(item => {
    if (item.requiresAdmin) {
      return hasFinancialAccess;
    }
    if (item.requiresProfessional) {
      return hasMedicalRecordsAccess; // Includes professionals and admin
    }
    if (item.requiresDentist) {
      return hasOdontogramAccess; // Includes dentists and admin
    }
    return true;
  });

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  // Update body class when collapsed state changes
  useEffect(() => {
    if (isCollapsed) {
      document.body.classList.add("sidebar-collapsed");
    } else {
      document.body.classList.remove("sidebar-collapsed");
    }
  }, [isCollapsed]);

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", String(newState));
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-background/80 backdrop-blur-sm border border-border shadow-lg"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-background border-r border-border transition-all duration-300 ease-in-out flex flex-col",
          "shadow-lg",
          // Desktop
          "hidden md:flex",
          isCollapsed ? "w-16" : "w-60",
          // Mobile
          "md:translate-x-0",
          isMobileOpen ? "flex translate-x-0 w-60" : "-translate-x-full"
        )}
      >
        {/* Logo Section */}
        <div className={cn(
          "h-16 flex items-center border-b border-border px-4 transition-all duration-300",
          isCollapsed ? "justify-center px-2" : "justify-start"
        )}>
          {isCollapsed ? (
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-2.5 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Calendar className="h-5 w-5 text-white" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-2.5 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-foreground leading-tight">
                  {process.env.NEXT_PUBLIC_CLINIC_NAME || "Clínica"}
                </h1>
                <p className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">
                  CRM
                </p>
              </div>
            </div>
          )}
        </div>


        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    isCollapsed && "md:justify-center md:px-2"
                  )}
                >
                  <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-white")} />
                  <span
                    className={cn(
                      "truncate transition-all duration-200",
                      isCollapsed ? "md:hidden" : "block"
                    )}
                  >
                    {item.label}
                  </span>

                  {/* Tooltip para quando está colapsado - apenas desktop */}
                  {isCollapsed && (
                    <div className="hidden md:block absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}

                  {isActive && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 opacity-10 animate-pulse" />
                  )}
                </Link>
              );
            })}
        </nav>


        {/* Collapse Toggle Button - Floating on the right edge - Desktop Only */}
        <button
          onClick={toggleCollapsed}
          className="hidden md:flex absolute -right-3 top-20 z-50 h-6 w-6 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 items-center justify-center hover:scale-110 border-2 border-background"
          title={isCollapsed ? "Expandir sidebar" : "Minimizar sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </aside>
    </>
  );
}
