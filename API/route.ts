import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots, getBusinessHours } from "@/services/business-hours";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get("date");
    const durationParam = searchParams.get("duration");

    if (!dateParam) {
      return NextResponse.json(
        { error: "Data é obrigatória. Use o parâmetro ?date=YYYY-MM-DD" },
        { status: 400 }
      );
    }

    const date = new Date(dateParam + "T00:00:00");
    const duration = durationParam ? parseInt(durationParam) : 30;

    // Buscar horários de funcionamento do dia
    const dayOfWeek = date.getDay();
    const businessHours = await getBusinessHours();
    const dayHours = businessHours.find((h) => h.day_of_week === dayOfWeek);

    if (!dayHours || !dayHours.is_open) {
      return NextResponse.json({
        date: dateParam,
        is_open: false,
        available_slots: [],
        message: "Estabelecimento fechado neste dia",
      });
    }

    // Buscar slots disponíveis
    const slots = await getAvailableSlots(date, duration);

    return NextResponse.json({
      date: dateParam,
      is_open: true,
      business_hours: {
        open: dayHours.open_time,
        close: dayHours.close_time,
      },
      available_slots: slots,
      duration_minutes: duration,
    });
  } catch (error) {
    console.error("Erro ao buscar horários disponíveis:", error);
    return NextResponse.json(
      { error: "Erro ao buscar horários disponíveis" },
      { status: 500 }
    );
  }
}
