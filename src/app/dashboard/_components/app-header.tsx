
"use client";

import { LogOut, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AuthClientService } from "@/services/auth/client.service";
import { toast } from "sonner";
import { useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { NotificationBell } from "@/components/notification-bell";

export function AppHeader() {
  const router = useRouter();
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
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border shadow-sm transition-colors duration-300">
      <div className="h-16 px-4 pl-16 md:pl-6 flex items-center justify-between">
        {/* Page Title - will be dynamic based on route */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">
              {clinicName}
            </h2>
          </div>
        </div>

        {/* User/Action Section */}
        <div className="flex gap-2 items-center">
          <NotificationBell />
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
