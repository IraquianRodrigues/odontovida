import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const professionalCode = Number((await params).id);
    if (!Number.isInteger(professionalCode)) return NextResponse.json({ error: "Invalid professional code" }, { status: 400 });
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data, error } = await supabase.from("availability_rules").select("*").eq("professional_code", professionalCode).order("weekday");
    if (error) throw error;
    return NextResponse.json((data || []).map((item) => ({ id: item.id, professional_id: item.professional_code, day_of_week: item.weekday, is_available: item.active, start_time: item.open_time, end_time: item.close_time })));
  } catch (error) {
    console.error("Error fetching professional schedule:", error);
    return NextResponse.json({ error: "Failed to fetch professional schedule" }, { status: 500 });
  }
}
