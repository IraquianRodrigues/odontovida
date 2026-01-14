import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'recepcionista' | 'dentista' | 'medico';
  created_at: string;
  updated_at: string;
}

export class UserProfileService {
  // Get current user's profile
  static async getCurrentUserProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: "Not authenticated" };

      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return { success: true, data: data as UserProfile };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get all user profiles (admin only)
  static async getAllProfiles() {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { success: true, data: data as UserProfile[] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Update user role (admin only)
  static async updateUserRole(userId: string, role: UserProfile['role']) {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .update({ role })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: data as UserProfile };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
