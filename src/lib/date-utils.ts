export const CLINIC_TIMEZONE =
  process.env.NEXT_PUBLIC_CLINIC_TIMEZONE || "America/Sao_Paulo";

export function formatDateBR(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR", {
    timeZone: CLINIC_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatTimeBR(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("pt-BR", {
    timeZone: CLINIC_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTimeBR(date: Date | string): string {
  return `${formatDateBR(date)} ${formatTimeBR(date)}`;
}

export function formatDateLongBR(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR", {
    timeZone: CLINIC_TIMEZONE,
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatDateFullBR(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR", {
    timeZone: CLINIC_TIMEZONE,
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === "string" ? new Date(date1) : date1;
  const d2 = typeof date2 === "string" ? new Date(date2) : date2;

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Verifica se uma data é anterior à data atual (comparando apenas dia/mês/ano no timezone da clínica)
 * @param date - A data a ser verificada
 * @returns true se a data for anterior à data atual
 */
export function isPastDate(date: Date | string): boolean {
  const targetDate = typeof date === "string" ? new Date(date) : date;
  const now = new Date();

  const targetDateStr = targetDate.toLocaleDateString("pt-BR", {
    timeZone: CLINIC_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const nowDateStr = now.toLocaleDateString("pt-BR", {
    timeZone: CLINIC_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Converte para formato comparável (YYYY-MM-DD)
  const [targetDay, targetMonth, targetYear] = targetDateStr.split("/");
  const [nowDay, nowMonth, nowYear] = nowDateStr.split("/");

  const targetComparable = `${targetYear}-${targetMonth}-${targetDay}`;
  const nowComparable = `${nowYear}-${nowMonth}-${nowDay}`;

  return targetComparable < nowComparable;
}
