import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export type UserRole = "admin" | "recepcionista" | "dentista";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

/**
 * Obtém o usuário autenticado atual (Server Component/Action)
 * @returns User object ou null se não autenticado
 */
export async function getServerUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error("Error getting server user:", error);
    return null;
  }
}

/**
 * Obtém o perfil completo do usuário autenticado (Server Component/Action)
 * @returns UserProfile ou null se não autenticado
 */
export async function getServerUserProfile(): Promise<UserProfile | null> {
  try {
    const user = await getServerUser();
    if (!user) return null;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    return data as UserProfile;
  } catch (error) {
    console.error("Error getting server user profile:", error);
    return null;
  }
}

/**
 * Verifica se há um usuário autenticado, lança erro se não houver
 * @throws Error se não autenticado
 * @returns User object
 */
export async function requireAuth(): Promise<User> {
  const user = await getServerUser();
  if (!user) {
    throw new Error("Unauthorized: Authentication required");
  }
  return user;
}

/**
 * Verifica se o usuário tem uma role específica
 * @param requiredRole - Role necessária
 * @throws Error se não autenticado ou sem permissão
 * @returns UserProfile
 */
export async function requireRole(
  requiredRole: UserRole | UserRole[]
): Promise<UserProfile> {
  const profile = await getServerUserProfile();

  if (!profile) {
    throw new Error("Unauthorized: Authentication required");
  }

  const allowedRoles = Array.isArray(requiredRole)
    ? requiredRole
    : [requiredRole];

  if (!allowedRoles.includes(profile.role)) {
    throw new Error(
      `Forbidden: Required role(s): ${allowedRoles.join(", ")}, current role: ${profile.role}`
    );
  }

  return profile;
}

/**
 * Verifica se o usuário é admin
 * @returns true se admin, false caso contrário
 */
export async function isAdmin(): Promise<boolean> {
  const profile = await getServerUserProfile();
  return profile?.role === "admin";
}

/**
 * Verifica se o usuário tem acesso financeiro (apenas admins)
 * @returns true se tem acesso, false caso contrário
 */
export async function hasFinancialAccess(): Promise<boolean> {
  return await isAdmin();
}

/**
 * Verifica se o usuário pode gerenciar outros usuários (apenas admins)
 * @returns true se pode gerenciar, false caso contrário
 */
export async function canManageUsers(): Promise<boolean> {
  return await isAdmin();
}
