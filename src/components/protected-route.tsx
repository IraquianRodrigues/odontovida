"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/use-user-role";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAdmin?: boolean;
}

export function ProtectedRoute({ children, requiresAdmin = false }: ProtectedRouteProps) {
  const router = useRouter();
  const { hasFinancialAccess, isLoading } = useUserRole();
  const [hasCheckedAccess, setHasCheckedAccess] = useState(false);

  useEffect(() => {
    // Só verifica acesso uma vez quando terminar de carregar
    if (!isLoading && !hasCheckedAccess) {
      setHasCheckedAccess(true);
      
      // Redireciona apenas se requer admin e não tem acesso
      if (requiresAdmin && !hasFinancialAccess) {
        router.replace("/dashboard");
      }
    }
  }, [requiresAdmin, hasFinancialAccess, isLoading, router, hasCheckedAccess]);

  // Mostra loading enquanto verifica permissões
  if (isLoading || !hasCheckedAccess) {
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
