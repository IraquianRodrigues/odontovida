"use client";

import { useQuery } from "@tanstack/react-query";
import { UserProfileService } from "@/services/user-profile.service";
import { createClient } from "@/lib/supabase/client";

export type UserRole = 'admin' | 'recepcionista' | 'dentista' | 'medico';

export function useUserRole() {
  const supabase = createClient();

  // Get current session
  const { data: sessionData } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  // Get user profile with role
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile', sessionData?.user?.id],
    queryFn: async () => {
      const result = await UserProfileService.getCurrentUserProfile();
      if (!result.success) return null;
      return result.data;
    },
    enabled: !!sessionData?.user?.id,
  });

  const role: UserRole = profile?.role || 'recepcionista';
  
  // Permissões baseadas no role
  const isProfessional = role === 'dentista' || role === 'medico';
  const hasFinancialAccess = role === 'admin';
  const hasMedicalRecordsAccess = isProfessional || role === 'admin';
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
    canManageUsers,
    canManageProfessionals,
    canManageServices,
    profile,
    isLoading,
  };
}
