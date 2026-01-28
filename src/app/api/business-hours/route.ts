import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get business hours
    const { data: businessHours, error: hoursError } = await supabase
      .from("business_hours")
      .select("*")
      .order("day_of_week", { ascending: true });

    if (hoursError) throw hoursError;

    // Get breaks
    const { data: breaks, error: breaksError } = await supabase
      .from("business_breaks")
      .select("*")
      .eq("is_active", true)
      .order("day_of_week", { ascending: true });

    if (breaksError) throw breaksError;

    // Get holidays
    const { data: holidays, error: holidaysError } = await supabase
      .from("business_holidays")
      .select("*")
      .order("date", { ascending: true });

    if (holidaysError) throw holidaysError;

    // Get blocked slots
    const { data: blockedSlots, error: blockedError } = await supabase
      .from("business_blocked_slots")
      .select("*")
      .order("start_time", { ascending: true });

    if (blockedError) throw blockedError;

    // Get professional schedules
    const { data: professionalSchedules, error: schedulesError } = await supabase
      .from("professional_schedules")
      .select(`
        *,
        professional:professionals(id, name, specialty)
      `)
      .eq("is_available", true)
      .order("professional_id", { ascending: true })
      .order("day_of_week", { ascending: true });

    if (schedulesError) throw schedulesError;

    // Format response for AI/N8N
    const response = {
      businessHours: businessHours || [],
      breaks: breaks || [],
      holidays: holidays || [],
      blockedSlots: blockedSlots || [],
      professionalSchedules: professionalSchedules || [],
      summary: generateSummary(businessHours, holidays, professionalSchedules),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching business hours:", error);
    return NextResponse.json(
      { error: "Failed to fetch business hours" },
      { status: 500 }
    );
  }
}

function generateSummary(
  businessHours: any[] | null,
  holidays: any[] | null,
  professionalSchedules: any[] | null
): string {
  if (!businessHours || businessHours.length === 0) {
    return "Horários de funcionamento não configurados.";
  }

  const days = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];

  let summary = "Horários de funcionamento:\n\n";

  businessHours.forEach((hour) => {
    const dayName = days[hour.day_of_week];
    if (hour.is_open) {
      summary += `${dayName}: ${hour.open_time} às ${hour.close_time}\n`;
    } else {
      summary += `${dayName}: Fechado\n`;
    }
  });

  if (holidays && holidays.length > 0) {
    summary += "\nFeriados cadastrados:\n";
    holidays.forEach((holiday) => {
      const date = new Date(holiday.date + "T00:00:00");
      const formattedDate = date.toLocaleDateString("pt-BR");
      summary += `- ${formattedDate}: ${holiday.name}${holiday.is_recurring ? " (recorrente)" : ""}\n`;
    });
  }

  if (professionalSchedules && professionalSchedules.length > 0) {
    summary += "\nAgendas dos profissionais:\n\n";
    
    // Group by professional
    const byProfessional = professionalSchedules.reduce((acc: any, schedule: any) => {
      const profId = schedule.professional_id;
      if (!acc[profId]) {
        acc[profId] = {
          name: schedule.professional?.name || "Profissional",
          schedules: [],
        };
      }
      acc[profId].schedules.push(schedule);
      return acc;
    }, {});

    Object.values(byProfessional).forEach((prof: any) => {
      summary += `${prof.name}:\n`;
      prof.schedules.forEach((schedule: any) => {
        const dayName = days[schedule.day_of_week];
        summary += `  ${dayName}: ${schedule.start_time} às ${schedule.end_time}\n`;
      });
      summary += "\n";
    });
  }

  return summary;
}
