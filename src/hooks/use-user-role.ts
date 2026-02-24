"use client";

import { useQuery } from "@tanstack/react-query";
import { UserProfileService } from "@/services/user-profile";
import { createClient } from "@/lib/supabase/client";

export type UserRole = 'admin' | 'recepcionista' | 'dentista' | 'medico';

export function useUserRole() {
  const supabase = createClient();

  // Get current user (validated server-side)
  const { data: userData } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Get user profile with role
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile', userData?.id],
    queryFn: async () => {
      const result = await UserProfileService.getCurrentUserProfile();
      if (!result.success) return null;
      return result.data;
    },
    enabled: !!userData?.id,
  });

  const role: UserRole = profile?.role || 'recepcionista';
  
  // Permissões baseadas no role
  const isProfessional = role === 'dentista' || role === 'medico';
  const hasFinancialAccess = role === 'admin'; // Admin tem acesso financeiro
  const hasMedicalRecordsAccess = isProfessional || role === 'admin'; // Admin tem acesso total
  const hasOdontogramAccess = role === 'dentista' || role === 'admin'; // Admin tem acesso total
  const canManageUsers = role === 'admin';
  const canManageProfessionals = role === 'admin';
  const canManageServices = role === 'admin';
  
  return {
    role,
    isAdmin: role === 'admin',
    isReceptionist: role === 'recepcionista',
    isDentist: role === 'dentista',
    isMedico: role === 'medico',
    isProfessional,
    hasFinancialAccess,
    hasMedicalRecordsAccess,
    hasOdontogramAccess,
    canManageUsers,
    canManageProfessionals,
    canManageServices,
    profile,
    isLoading,
  };
}
