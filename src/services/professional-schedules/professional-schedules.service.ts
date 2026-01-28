import { createClient } from "@/lib/supabase/client";
import type { ProfessionalScheduleRow } from "@/types/database.types";

const supabase = createClient();

// ============================================
// PROFESSIONAL SCHEDULES
// ============================================

export async function getProfessionalSchedule(
  professionalId: number
): Promise<ProfessionalScheduleRow[]> {
  const { data, error } = await supabase
    .from("professional_schedules")
    .select("*")
    .eq("professional_id", professionalId)
    .order("day_of_week", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function updateProfessionalSchedule(
  professionalId: number,
  dayOfWeek: number,
  schedule: {
    is_available: boolean;
    start_time: string;
    end_time: string;
  }
): Promise<ProfessionalScheduleRow> {
  const { data, error } = await supabase
    .from("professional_schedules")
    .upsert(
      {
        professional_id: professionalId,
        day_of_week: dayOfWeek,
        ...schedule,
      },
      {
        onConflict: "professional_id,day_of_week",
      }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAllProfessionalSchedules(): Promise<
  (ProfessionalScheduleRow & { professional?: { id: number; name: string } })[]
> {
  const { data, error } = await supabase
    .from("professional_schedules")
    .select(
      `
      *,
      professional:professionals(id, name)
    `
    )
    .eq("is_available", true)
    .order("professional_id", { ascending: true })
    .order("day_of_week", { ascending: true });

  if (error) throw error;
  return data || [];
}
