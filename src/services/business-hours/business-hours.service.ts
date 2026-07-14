import { createClient } from "@/lib/supabase/client";
import type { BusinessBlockedSlotRow, BusinessBreakRow, BusinessHolidayRow, BusinessHoursRow } from "@/types/database.types";

const getSupabase = () => createClient();
const DEFAULT_PROFESSIONAL_CODE = 1;

type RuleRow = { id: string; created_at: string; updated_at: string; professional_code: number; weekday: number; open_time: string; close_time: string; reserved_manual_time: string | null; active: boolean };
type BlockRow = { id: string; created_at: string; date: string | null; blocked_date: string | null; start_time: string | null; end_time: string | null; reason: string | null; type: string; active: boolean };

const toHours = (row: RuleRow): BusinessHoursRow => ({ id: row.id, day_of_week: row.weekday, is_open: row.active, open_time: row.open_time, close_time: row.close_time, created_at: row.created_at, updated_at: row.updated_at, professional_code: row.professional_code });
const blockDate = (row: BlockRow) => row.blocked_date || row.date || "";

export async function getBusinessHours(): Promise<BusinessHoursRow[]> {
  const { data, error } = await getSupabase().from("availability_rules").select("*").eq("professional_code", DEFAULT_PROFESSIONAL_CODE).order("weekday");
  if (error) throw error;
  return ((data || []) as RuleRow[]).map(toHours);
}

export async function updateBusinessHours(dayOfWeek: number, hours: { is_open: boolean; open_time: string; close_time: string }): Promise<BusinessHoursRow> {
  const supabase = getSupabase();
  const { data: existing, error: findError } = await supabase.from("availability_rules").select("id").eq("professional_code", DEFAULT_PROFESSIONAL_CODE).eq("weekday", dayOfWeek).maybeSingle();
  if (findError) throw findError;
  const payload = { professional_code: DEFAULT_PROFESSIONAL_CODE, weekday: dayOfWeek, active: hours.is_open, open_time: hours.open_time, close_time: hours.close_time };
  const query = existing ? supabase.from("availability_rules").update(payload).eq("id", existing.id) : supabase.from("availability_rules").insert(payload);
  const { data, error } = await query.select().single();
  if (error) throw error;
  return toHours(data as RuleRow);
}

// O esquema real não possui intervalos recorrentes. A hora manual reservada da
// regra é usada na disponibilidade, mas não é exposta como um intervalo editável.
export async function getBreaks(): Promise<BusinessBreakRow[]> { return []; }
export async function createBreak(_data: { day_of_week: number; break_start: string; break_end: string; description?: string | null }): Promise<BusinessBreakRow> { throw new Error("Intervalos recorrentes não existem no esquema deste projeto"); }
export async function updateBreak(_id: string | number, _data: Partial<{ break_start: string; break_end: string; description: string | null; is_active: boolean }>): Promise<BusinessBreakRow> { throw new Error("Intervalos recorrentes não existem no esquema deste projeto"); }
export async function deleteBreak(_id: string | number): Promise<void> { throw new Error("Intervalos recorrentes não existem no esquema deste projeto"); }

export async function getHolidays(): Promise<BusinessHolidayRow[]> {
  const { data, error } = await getSupabase().from("blocked_dates").select("*").eq("active", true).is("start_time", null).order("date");
  if (error) throw error;
  return ((data || []) as BlockRow[]).map((row) => ({ id: row.id, date: blockDate(row), name: row.reason || "Data bloqueada", is_recurring: false, created_at: row.created_at }));
}

export async function createHoliday(data: { date: string; name: string; is_recurring?: boolean }): Promise<BusinessHolidayRow> {
  const { data: created, error } = await getSupabase().from("blocked_dates").insert({ date: data.date, reason: data.name, type: "holiday", active: true }).select().single();
  if (error) throw error;
  const row = created as BlockRow;
  return { id: row.id, date: blockDate(row), name: row.reason || data.name, is_recurring: false, created_at: row.created_at };
}
export async function deleteHoliday(id: string | number): Promise<void> { const { error } = await getSupabase().from("blocked_dates").delete().eq("id", id); if (error) throw error; }

export async function getBlockedSlots(): Promise<BusinessBlockedSlotRow[]> {
  const { data, error } = await getSupabase().from("blocked_dates").select("*").eq("active", true).not("start_time", "is", null).order("date");
  if (error) throw error;
  return ((data || []) as BlockRow[]).map((row) => ({ id: row.id, start_time: `${blockDate(row)}T${row.start_time}`, end_time: `${blockDate(row)}T${row.end_time}`, reason: row.reason, created_at: row.created_at }));
}

export async function createBlockedSlot(data: { start_time: string; end_time: string; reason?: string | null }): Promise<BusinessBlockedSlotRow> {
  const start = new Date(data.start_time); const end = new Date(data.end_time);
  const date = start.toISOString().slice(0, 10); const startTime = start.toTimeString().slice(0, 8); const endTime = end.toTimeString().slice(0, 8);
  const { data: created, error } = await getSupabase().from("blocked_dates").insert({ date, start_time: startTime, end_time: endTime, reason: data.reason ?? null, type: "manual", active: true }).select().single();
  if (error) throw error;
  const row = created as BlockRow;
  return { id: row.id, start_time: `${blockDate(row)}T${row.start_time}`, end_time: `${blockDate(row)}T${row.end_time}`, reason: row.reason, created_at: row.created_at };
}
export async function deleteBlockedSlot(id: string | number): Promise<void> { const { error } = await getSupabase().from("blocked_dates").delete().eq("id", id); if (error) throw error; }

export async function isTimeSlotAvailable(dateTime: Date, professionalCode?: number): Promise<{ available: boolean; reason?: string }> {
  const date = dateTime.toISOString().slice(0, 10); const time = dateTime.toTimeString().slice(0, 8);
  const codeToCheck = professionalCode || DEFAULT_PROFESSIONAL_CODE;
  const { data: rule } = await getSupabase().from("availability_rules").select("*").eq("professional_code", codeToCheck).eq("weekday", dateTime.getDay()).eq("active", true).maybeSingle();
  if (!rule || time < rule.open_time || time >= rule.close_time) return { available: false, reason: "Fora do horário de atendimento" };

  // Check global blocks (no professional_code) + professional-specific blocks
  const { data: blocks } = await getSupabase().from("blocked_dates").select("*").eq("active", true).or(`professional_code.is.null,professional_code.eq.${codeToCheck}`).or(`date.eq.${date},blocked_date.eq.${date},and(date.lte.${date},end_date.gte.${date})`);
  const blocked = ((blocks || []) as BlockRow[]).some((row) => {
    // Multi-day range block (has end_date)
    const endDate = (row as any).end_date;
    if (endDate && row.date) {
      return date >= row.date && date <= endDate;
    }
    // Single-day block with time range
    if (row.start_time) {
      return time >= row.start_time && time < (row.end_time || row.start_time);
    }
    // Full-day block
    return true;
  });
  return blocked ? { available: false, reason: "Data ou horário bloqueado" } : { available: true };
}

export async function getAvailableSlots(date: Date, durationMinutes = 30): Promise<{ start: string; end: string }[]> {
  const dateString = date.toISOString().slice(0, 10);
  const { data, error } = await getSupabase().rpc("get_available_slots", { p_date: dateString, p_professional_code: DEFAULT_PROFESSIONAL_CODE });
  if (error) throw error;
  return ((data || []) as { slot_start: string; slot_end: string }[]).map((slot) => ({ start: slot.slot_start.slice(11, 16), end: slot.slot_end.slice(11, 16) })).filter((slot) => {
    const [sh, sm] = slot.start.split(":").map(Number); const [eh, em] = slot.end.split(":").map(Number);
    return (eh * 60 + em) - (sh * 60 + sm) >= durationMinutes;
  });
}
