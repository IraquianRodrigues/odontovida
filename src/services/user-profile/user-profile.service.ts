import { createClient } from "@/lib/supabase/client";
export interface UserProfile { id: string; email: string; full_name: string | null; role: "admin" | "recepcionista" | "dentista" | "medico"; created_at: string; updated_at: string }
const fromUser = (user: any): UserProfile => ({ id: user.id, email: user.email || "", full_name: user.user_metadata?.full_name || user.user_metadata?.name || null, role: user.user_metadata?.role || "recepcionista", created_at: user.created_at, updated_at: user.updated_at || user.created_at });
export class UserProfileService {
  static async getCurrentUserProfile() { const { data: { user }, error } = await createClient().auth.getUser(); if (error || !user) return { success: false as const, error: error?.message || "Not authenticated" }; return { success: true as const, data: fromUser(user) }; }
  static async getAllProfiles() { const current = await this.getCurrentUserProfile(); return current.success ? { success: true as const, data: [current.data] } : current; }
  static async updateUserRole(_userId: string, _role: UserProfile["role"]) { return { success: false as const, error: "Perfis de usuário não existem no esquema conectado" }; }
}
