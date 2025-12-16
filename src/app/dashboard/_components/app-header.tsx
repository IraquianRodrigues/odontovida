"use client";

import { LogOut, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AuthClientService } from "@/services/auth/client.service";
import { toast } from "sonner";
import { useState } from "react";
import Link from "next/link";

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
    <header className="border-b  bg-linear-to-b gradient-to-r from-zinc-900 to-black">
      <div className="container mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="bg-white rounded-lg p-2.5 flex items-center justify-center hover:-rotate-6 duration-300">
            <Calendar className="h-6 w-6 text-black" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg sm:text-xl font-bold text-white">
              {clinicName}
            </h1>
            <p className="text-xs sm:text-sm text-gray-100">
              Sistema de Agendamentos
            </p>
          </div>
        </Link>
        <Button
          size="sm"
          onClick={handleLogout}
          className="gap-2 shrink-0 cursor-pointer bg-transparent hover:bg-white duration-300 group"
          disabled={isLoggingOut}
        >
          <LogOut className="h-4 w-4 text-white group-hover:text-black duration-300" />
          <span className="hidden sm:inline text-white group-hover:text-black duration-300">
            {isLoggingOut ? "Saindo..." : "Sair"}
          </span>
        </Button>
      </div>
    </header>
  );
}
