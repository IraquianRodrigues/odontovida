

"use client";

import { LogOut, Calendar, Users, UserCog, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { AuthClientService } from "@/services/auth/client.service";
import { toast } from "sonner";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";

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

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const clinicName = process.env.NEXT_PUBLIC_CLINIC_NAME || "Clínica Médica";

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const result = await AuthClientService.logout();

      if (result.success) {
        toast.success("Logout realizado com sucesso!");
        router.push("/");
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao realizar logout");
      }
    } catch (error) {
      toast.error("Erro inesperado ao realizar logout");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-sm transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Logo Section */}
        <Link href="/dashboard" className="flex items-center gap-3 w-48 group">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-2.5 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-all group-hover:scale-105">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-foreground leading-tight transition-colors">
              {clinicName}
            </h1>
            <p className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase transition-colors">
              Agendamentos
            </p>
          </div>
        </Link>

        {/* Navigation Section */}
        <nav className="hidden md:flex items-center gap-2 bg-muted/50 p-1.5 rounded-2xl border border-border transition-colors">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group",
                  isActive
                    ? "bg-background text-primary shadow-sm shadow-black/5 dark:shadow-black/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User/Action Section */}
        <div className="w-48 flex justify-end gap-2 items-center">
          <ModeToggle />
          <Button
            size="sm"
            onClick={handleLogout}
            variant="ghost"
            className="gap-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300"
            disabled={isLoggingOut}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline font-medium">
              {isLoggingOut ? "Saindo..." : "Sair"}
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
