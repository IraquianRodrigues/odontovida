"use client";

import { Calendar, Users, UserCog, Briefcase, DollarSign, FileText, ChevronLeft, ChevronRight, Menu, X, Activity, CalendarDays, LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/use-user-role";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: Calendar,
  },
  {
    href: "/dashboard/agenda",
    label: "Agenda",
    icon: CalendarDays,
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
    requiresProfessional: true,
  },
  {
    href: "/dashboard/odontograma",
    label: "Odontograma",
    icon: Activity,
    requiresDentist: true,
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
    requiresAdmin: true,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { hasFinancialAccess, hasMedicalRecordsAccess, hasOdontogramAccess, profile, role } = useUserRole();
  const supabase = createClient();

  // Filtrar itens de navegação baseado em permissões
  const filteredNavItems = navItems.filter(item => {
    if (item.requiresAdmin) {
      return hasFinancialAccess;
    }
    if (item.requiresProfessional) {
      return hasMedicalRecordsAccess;
    }
    if (item.requiresDentist) {
      return hasOdontogramAccess;
    }
    return true;
  });

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    setMounted(true);
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

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // Get role display name
  const getRoleDisplay = (userRole: string) => {
    const roleMap: Record<string, string> = {
      admin: "Administrador",
      dentista: "Dentista",
      medico: "Médico",
      recepcionista: "Recepcionista",
    };
    return roleMap[userRole] || userRole;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-background/95 backdrop-blur-md border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out flex flex-col",
          // Glassmorphism effect
          "bg-background/95 backdrop-blur-xl border-r border-border/50",
          "shadow-2xl shadow-black/5",
          // Desktop
          "hidden md:flex",
          isCollapsed ? "w-16" : "w-64",
          // Mobile
          "md:translate-x-0",
          isMobileOpen ? "flex translate-x-0 w-64" : "-translate-x-full"
        )}
      >
        {/* Logo Section */}
        <div className={cn(
          "h-16 flex items-center border-b border-border/50 px-4 transition-all duration-300 bg-gradient-to-r from-background/50 to-background/30",
          isCollapsed ? "justify-center px-2" : "justify-start"
        )}>
          {isCollapsed ? (
            <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-xl p-2.5 flex items-center justify-center shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105">
              <Calendar className="h-5 w-5 text-white" />
            </div>
          ) : (
            <div className="flex items-center gap-3 group">
              <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-xl p-2.5 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-105">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent leading-tight">
                  {process.env.NEXT_PUBLIC_CLINIC_NAME || "Clínica"}
                </h1>
                <p className="text-[10px] text-muted-foreground font-semibold tracking-wider uppercase">
                  CRM Inteligente
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-1.5">
          {mounted && filteredNavItems.map((item, index) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={() => setIsMobileOpen(false)}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300",
                  "animate-in fade-in slide-in-from-left-2",
                  isActive
                    ? "bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/40 scale-[1.02]"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:scale-[1.01]",
                  isCollapsed && "md:justify-center md:px-2"
                )}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg shadow-white/50" />
                )}

                <Icon 
                  className={cn(
                    "h-5 w-5 flex-shrink-0 transition-all duration-300",
                    isActive ? "text-white scale-110" : "group-hover:scale-110"
                  )} 
                />
                <span
                  className={cn(
                    "truncate transition-all duration-300 font-medium",
                    isCollapsed ? "md:hidden" : "block"
                  )}
                >
                  {item.label}
                </span>

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="hidden md:block absolute left-full ml-3 px-3 py-2 bg-popover/95 backdrop-blur-sm text-popover-foreground text-xs font-medium rounded-lg shadow-xl border border-border/50 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}

                {/* Ripple effect on active */}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-white/10 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className={cn(
          "border-t border-border/50 p-3 bg-gradient-to-r from-background/50 to-background/30 backdrop-blur-sm",
          "transition-all duration-300"
        )}>
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
                  {profile?.full_name?.[0]?.toUpperCase() || <User className="h-5 w-5" />}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background shadow-sm" />
              </div>
              <button
                onClick={handleLogout}
                className="w-full p-2 rounded-lg hover:bg-accent/50 transition-all duration-200 group hover:scale-105"
                title="Sair"
              >
                <LogOut className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent/30 transition-all duration-200 cursor-pointer group">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-105">
                    {profile?.full_name?.[0]?.toUpperCase() || <User className="h-5 w-5" />}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background shadow-sm animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {profile?.full_name || "Usuário"}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    {getRoleDisplay(role)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 group hover:scale-[1.02]"
              >
                <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Sair</span>
              </button>
            </div>
          )}
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={toggleCollapsed}
          className="hidden md:flex absolute -right-3 top-20 z-50 h-7 w-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 items-center justify-center hover:scale-110 border-2 border-background/50 backdrop-blur-sm"
          title={isCollapsed ? "Expandir sidebar" : "Minimizar sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </aside>
    </>
  );
}
