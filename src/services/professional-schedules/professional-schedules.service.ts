import { createClient } from "@/lib/supabase/client";
import type { ProfessionalScheduleRow, ProfessionalBlockedDateRow } from "@/types/database.types";

const mapRule = (row: any): ProfessionalScheduleRow => ({ id: row.id, professional_id: row.professional_code, professional_code: row.professional_code, day_of_week: row.weekday, is_available: row.active, is_open: row.active, start_time: row.open_time, end_time: row.close_time, open_time: row.open_time, close_time: row.close_time, created_at: row.created_at, updated_at: row.updated_at });

export async function getProfessionalSchedule(professionalId: number): Promise<ProfessionalScheduleRow[]> {
  const { data, error } = await createClient().from("availability_rules").select("*").eq("professional_code", professionalId).order("weekday");
  if (error) throw error;
  return (data || []).map(mapRule);
}
export async function updateProfessionalSchedule(professionalId: number, dayOfWeek: number, schedule: { is_available: boolean; start_time: string; end_time: string }): Promise<ProfessionalScheduleRow> {
  const supabase = createClient();
  const { data: existing, error: findError } = await supabase.from("availability_rules").select("id").eq("professional_code", professionalId).eq("weekday", dayOfWeek).maybeSingle();
  if (findError) throw findError;
  const payload = { professional_code: professionalId, weekday: dayOfWeek, active: schedule.is_available, open_time: schedule.start_time, close_time: schedule.end_time };
  const query = existing ? supabase.from("availability_rules").update(payload).eq("id", existing.id) : supabase.from("availability_rules").insert(payload);
  const { data, error } = await query.select().single();
  if (error) throw error;
  return mapRule(data);
}

export async function getAllProfessionalSchedules(): Promise<(ProfessionalScheduleRow & { professional?: { id: number; name: string } })[]> {
  const [rulesResult, professionalsResult] = await Promise.all([
    createClient().from("availability_rules").select("*").eq("active", true).order("professional_code").order("weekday"),
    createClient().from("professionals").select("professional_code,nome"),
  ]);
  if (rulesResult.error) throw rulesResult.error;
  if (professionalsResult.error) throw professionalsResult.error;
  const names = new Map((professionalsResult.data || []).map((p: any) => [p.professional_code, p.nome]));
  return (rulesResult.data || []).map((row: any) => ({ ...mapRule(row), professional: { id: row.professional_code, name: names.get(row.professional_code) || "Profissional" } }));
}

// ============================================
// BLOCKED DATES PER PROFESSIONAL
// ============================================

const mapBlockedDate = (row: any): ProfessionalBlockedDateRow => ({
  id: row.id,
  professional_code: row.professional_code,
  date: row.blocked_date || row.date || "",
  end_date: row.end_date || null,
  reason: row.reason,
  type: row.type,
  active: row.active,
  created_at: row.created_at,
});

export async function getProfessionalBlockedDates(
  professionalCode: number
): Promise<ProfessionalBlockedDateRow[]> {
  const { data, error } = await createClient()
    .from("blocked_dates")
    .select("*")
    .eq("professional_code", professionalCode)
    .eq("active", true)
    .order("date", { ascending: true });
  if (error) throw error;
  return (data || []).map(mapBlockedDate);
}

export async function createProfessionalBlockedDate(
  professionalCode: number,
  blockData: { date: string; end_date?: string | null; reason?: string | null }
): Promise<ProfessionalBlockedDateRow> {
  const { data, error } = await createClient()
    .from("blocked_dates")
    .insert({
      professional_code: professionalCode,
      date: blockData.date,
      end_date: blockData.end_date || null,
      reason: blockData.reason || null,
      type: "professional_block",
      active: true,
    })
    .select()
    .single();
  if (error) throw error;
  return mapBlockedDate(data);
}

export async function deleteProfessionalBlockedDate(
  id: string
): Promise<void> {
  const { error } = await createClient()
    .from("blocked_dates")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
