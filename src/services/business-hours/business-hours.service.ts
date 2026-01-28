import { createClient } from "@/lib/supabase/client";
import type {
  BusinessHoursRow,
  BusinessBreakRow,
  BusinessHolidayRow,
  BusinessBlockedSlotRow,
} from "@/types/database.types";

const supabase = createClient();

// ============================================
// BUSINESS HOURS (Horários de Funcionamento)
// ============================================

export async function getBusinessHours(): Promise<BusinessHoursRow[]> {
  const { data, error } = await supabase
    .from("business_hours")
    .select("*")
    .order("day_of_week", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function updateBusinessHours(
  dayOfWeek: number,
  hours: {
    is_open: boolean;
    open_time: string;
    close_time: string;
  }
): Promise<BusinessHoursRow> {
  const { data, error } = await supabase
    .from("business_hours")
    .upsert(
      {
        day_of_week: dayOfWeek,
        ...hours,
      },
      {
        onConflict: "day_of_week",
      }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// BUSINESS BREAKS (Intervalos)
// ============================================

export async function getBreaks(): Promise<BusinessBreakRow[]> {
  const { data, error } = await supabase
    .from("business_breaks")
    .select("*")
    .eq("is_active", true)
    .order("day_of_week", { ascending: true })
    .order("break_start", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createBreak(breakData: {
  day_of_week: number;
  break_start: string;
  break_end: string;
  description?: string;
}): Promise<BusinessBreakRow> {
  const { data, error } = await supabase
    .from("business_breaks")
    .insert({
      ...breakData,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBreak(
  id: number,
  breakData: {
    day_of_week?: number;
    break_start?: string;
    break_end?: string;
    description?: string;
    is_active?: boolean;
  }
): Promise<BusinessBreakRow> {
  const { data, error } = await supabase
    .from("business_breaks")
    .update(breakData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBreak(id: number): Promise<void> {
  const { error } = await supabase
    .from("business_breaks")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw error;
}

// ============================================
// BUSINESS HOLIDAYS (Feriados)
// ============================================

export async function getHolidays(): Promise<BusinessHolidayRow[]> {
  const { data, error } = await supabase
    .from("business_holidays")
    .select("*")
    .order("date", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createHoliday(holidayData: {
  date: string;
  name: string;
  is_recurring?: boolean;
}): Promise<BusinessHolidayRow> {
  const { data, error } = await supabase
    .from("business_holidays")
    .insert({
      ...holidayData,
      is_recurring: holidayData.is_recurring || false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteHoliday(id: number): Promise<void> {
  const { error } = await supabase
    .from("business_holidays")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// ============================================
// BUSINESS BLOCKED SLOTS (Bloqueios)
// ============================================

export async function getBlockedSlots(): Promise<BusinessBlockedSlotRow[]> {
  const { data, error } = await supabase
    .from("business_blocked_slots")
    .select("*")
    .order("start_time", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createBlockedSlot(slotData: {
  start_time: string;
  end_time: string;
  reason?: string;
}): Promise<BusinessBlockedSlotRow> {
  const { data, error } = await supabase
    .from("business_blocked_slots")
    .insert(slotData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBlockedSlot(id: number): Promise<void> {
  const { error } = await supabase
    .from("business_blocked_slots")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// ============================================
// VALIDATION HELPERS
// ============================================

export async function isTimeSlotAvailable(
  dateTime: Date
): Promise<{
  available: boolean;
  reason?: string;
}> {
  const dayOfWeek = dateTime.getDay();
  const timeString = dateTime.toTimeString().slice(0, 5); // HH:MM
  const dateString = dateTime.toISOString().split("T")[0]; // YYYY-MM-DD

  // 1. Verificar se o estabelecimento está aberto neste dia
  const { data: businessHours } = await supabase
    .from("business_hours")
    .select("*")
    .eq("day_of_week", dayOfWeek)
    .single();

  if (!businessHours || !businessHours.is_open) {
    return {
      available: false,
      reason: "Estabelecimento fechado neste dia",
    };
  }

  if (
    timeString < businessHours.open_time ||
    timeString >= businessHours.close_time
  ) {
    return {
      available: false,
      reason: `Fora do horário de funcionamento (${businessHours.open_time} - ${businessHours.close_time})`,
    };
  }

  // 2. Verificar se está em um intervalo
  const { data: breaks } = await supabase
    .from("business_breaks")
    .select("*")
    .eq("day_of_week", dayOfWeek)
    .eq("is_active", true);

  if (breaks) {
    for (const breakPeriod of breaks) {
      if (
        timeString >= breakPeriod.break_start &&
        timeString < breakPeriod.break_end
      ) {
        return {
          available: false,
          reason: `Horário de intervalo (${breakPeriod.description || "Pausa"})`,
        };
      }
    }
  }

  // 3. Verificar se é feriado
  const { data: holidays } = await supabase
    .from("business_holidays")
    .select("*")
    .eq("date", dateString);

  if (holidays && holidays.length > 0) {
    return {
      available: false,
      reason: `Feriado: ${holidays[0].name}`,
    };
  }

  // 4. Verificar se está em um slot bloqueado
  const isoDateTime = dateTime.toISOString();
  const { data: blockedSlots } = await supabase
    .from("business_blocked_slots")
    .select("*")
    .lte("start_time", isoDateTime)
    .gte("end_time", isoDateTime);

  if (blockedSlots && blockedSlots.length > 0) {
    return {
      available: false,
      reason: `Horário bloqueado: ${blockedSlots[0].reason || "Indisponível"}`,
    };
  }

  return { available: true };
}

// ============================================
// AVAILABLE SLOTS GENERATOR
// ============================================

export async function getAvailableSlots(
  date: Date,
  durationMinutes: number = 30
): Promise<{ start: string; end: string }[]> {
  const dayOfWeek = date.getDay();
  const dateString = date.toISOString().split("T")[0];

  // Buscar horário de funcionamento
  const { data: businessHours } = await supabase
    .from("business_hours")
    .select("*")
    .eq("day_of_week", dayOfWeek)
    .single();

  if (!businessHours || !businessHours.is_open) {
    return [];
  }

  // Buscar intervalos
  const { data: breaks } = await supabase
    .from("business_breaks")
    .select("*")
    .eq("day_of_week", dayOfWeek)
    .eq("is_active", true);

  // Verificar se é feriado
  const { data: holidays } = await supabase
    .from("business_holidays")
    .select("*")
    .eq("date", dateString);

  if (holidays && holidays.length > 0) {
    return [];
  }

  // Gerar slots disponíveis
  const slots: { start: string; end: string }[] = [];
  const [openHour, openMinute] = businessHours.open_time.split(":").map(Number);
  const [closeHour, closeMinute] = businessHours.close_time
    .split(":")
    .map(Number);

  let currentTime = new Date(date);
  currentTime.setHours(openHour, openMinute, 0, 0);

  const closeTime = new Date(date);
  closeTime.setHours(closeHour, closeMinute, 0, 0);

  while (currentTime < closeTime) {
    const slotEnd = new Date(currentTime.getTime() + durationMinutes * 60000);

    if (slotEnd > closeTime) break;

    const timeString = currentTime.toTimeString().slice(0, 5);

    // Verificar se está em intervalo
    let inBreak = false;
    if (breaks) {
      for (const breakPeriod of breaks) {
        if (
          timeString >= breakPeriod.break_start &&
          timeString < breakPeriod.break_end
        ) {
          inBreak = true;
          break;
        }
      }
    }

    if (!inBreak) {
      slots.push({
        start: timeString,
        end: slotEnd.toTimeString().slice(0, 5),
      });
    }

    currentTime = slotEnd;
  }

  return slots;
}
