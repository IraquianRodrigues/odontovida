import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const [rules, blocked, professionals] = await Promise.all([
      supabase.from("availability_rules").select("*").order("professional_code").order("weekday"),
      supabase.from("blocked_dates").select("*").eq("active", true).order("date"),
      supabase.from("professionals").select("professional_code,nome"),
    ]);
    if (rules.error) throw rules.error;
    if (blocked.error) throw blocked.error;
    if (professionals.error) throw professionals.error;
    const names = new Map((professionals.data || []).map((item) => [item.professional_code, item.nome]));
    const schedules = (rules.data || []).map((item) => ({
      id: item.id,
      professional_id: item.professional_code,
      professional: { id: item.professional_code, name: names.get(item.professional_code) || "Profissional" },
      day_of_week: item.weekday,
      is_available: item.active,
      start_time: item.open_time,
      end_time: item.close_time,
      reserved_manual_time: item.reserved_manual_time,
    }));
    const holidays = (blocked.data || []).filter((item) => !item.start_time);
    const blockedSlots = (blocked.data || []).filter((item) => item.start_time);
    return NextResponse.json({ businessHours: schedules.filter((item) => item.professional_id === 1), breaks: [], holidays, blockedSlots, professionalSchedules: schedules });
  } catch (error) {
    console.error("Error fetching business hours:", error);
    return NextResponse.json({ error: "Failed to fetch business hours" }, { status: 500 });
  }
}
