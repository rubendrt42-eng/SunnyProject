import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { addDays, format, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { TIMEZONE } from "@/lib/constants";

export function formatDate(iso: string | Date): string {
  return formatInTimeZone(iso, TIMEZONE, "d 'de' MMMM, yyyy", { locale: es });
}

export function formatDateShort(iso: string | Date): string {
  return formatInTimeZone(iso, TIMEZONE, "d MMM yyyy", { locale: es });
}

export function formatTime(iso: string | Date): string {
  return formatInTimeZone(iso, TIMEZONE, "h:mm a", { locale: es });
}

export function formatDateTime(iso: string | Date): string {
  return formatInTimeZone(iso, TIMEZONE, "EEEE d 'de' MMMM, h:mm a", { locale: es });
}

export function formatWeekday(iso: string | Date): string {
  return formatInTimeZone(iso, TIMEZONE, "EEEE", { locale: es });
}

/**
 * Monday 00:00 America/Monterrey of the week containing `date`, as a plain
 * yyyy-MM-dd string (matches the `week_start` column). `toZonedTime` shifts
 * the instant so its LOCAL getters read as America/Monterrey wall-clock
 * time — date-fns functions on the result (startOfWeek, format) must then
 * use that same local-getter convention, NOT formatInTimeZone again
 * (which would re-apply the zone offset a second time).
 */
export function weekStartKey(date: Date = new Date()): string {
  const zoned = toZonedTime(date, TIMEZONE);
  const monday = startOfWeek(zoned, { weekStartsOn: 1 });
  return format(monday, "yyyy-MM-dd");
}

/** The following Monday, for "tu próximo pase estará disponible el lunes {fecha}" messaging. */
export function nextMondayLabel(date: Date = new Date()): string {
  const zoned = toZonedTime(date, TIMEZONE);
  const thisMonday = startOfWeek(zoned, { weekStartsOn: 1 });
  const nextMonday = addDays(thisMonday, 7);
  return format(nextMonday, "d 'de' MMMM", { locale: es });
}

export function hoursUntil(iso: string | Date): number {
  const target = new Date(iso).getTime();
  const now = Date.now();
  return (target - now) / (1000 * 60 * 60);
}

export function isPast(iso: string | Date): boolean {
  return new Date(iso).getTime() <= Date.now();
}
