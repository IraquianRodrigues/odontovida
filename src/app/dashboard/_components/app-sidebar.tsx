"use client";

import { Calendar, Users, UserCog, Briefcase, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

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
    href: "/dashboard/profissionais",
    label: "Profissionais",
    icon: UserCog,
  },
  {
    href: "/dashboard/servicos",
    label: "Serviços",
    icon: Briefcase,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl transition-all duration-200 group relative",
                  isCollapsed ? "px-3 py-3 justify-center" : "px-4 py-3",
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={cn(
                  "h-5 w-5 transition-all flex-shrink-0",
                  isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                )} />
                {!isCollapsed && (
                  <span className={cn(
                    "font-medium text-sm transition-colors",
                    isActive ? "text-white" : ""
                  )}>
                    {item.label}
                  </span>
                )}
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-popover text-popover-foreground text-sm rounded-lg shadow-lg border border-border opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle Button - Floating on the right edge */}
        <button
          onClick={toggleCollapsed}
          className="absolute -right-3 top-20 z-50 h-6 w-6 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-110 border-2 border-background"
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
