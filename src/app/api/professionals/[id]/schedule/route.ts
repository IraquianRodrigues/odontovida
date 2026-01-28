import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const professionalId = parseInt(id);

    if (isNaN(professionalId)) {
      return NextResponse.json(
        { error: "Invalid professional ID" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("professional_schedules")
      .select("*")
      .eq("professional_id", professionalId)
      .order("day_of_week", { ascending: true });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error fetching professional schedule:", error);
    return NextResponse.json(
      { error: "Failed to fetch professional schedule" },
      { status: 500 }
    );
  }
}
