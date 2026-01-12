"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/use-user-role";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAdmin?: boolean;
}

export function ProtectedRoute({ children, requiresAdmin = false }: ProtectedRouteProps) {
  const router = useRouter();
  const { hasFinancialAccess, isLoading } = useUserRole();

  useEffect(() => {
    // Só redireciona se não estiver carregando e não tiver acesso
    if (!isLoading && requiresAdmin && !hasFinancialAccess) {
      router.replace("/dashboard");
    }
  }, [requiresAdmin, hasFinancialAccess, isLoading, router]);

  // Mostra loading enquanto verifica permissões
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Se requer admin e não tem acesso, não renderiza nada (vai redirecionar)
  if (requiresAdmin && !hasFinancialAccess) {
    return null;
  }

  return <>{children}</>;
}
