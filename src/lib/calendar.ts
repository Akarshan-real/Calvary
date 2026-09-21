export interface CalendarEventData {
  title: string;
  description: string;
  location?: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM:SS or HH:MM
  durationMinutes?: number;
}

/**
 * Format a Date object to iCal/Google string: YYYYMMDDTHHMMSSZ (in UTC)
 */
function formatUtcIso(date: Date): string {
  return date.toISOString().replace(/-|:|\.\d+/g, "");
}

/**
 * Parse local date and time strings into a UTC Date object.
 */
function parseLocalDateTime(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const timeClean = timeStr.trim();
  const [hours, minutes] = timeClean.split(":").map(Number);
  return new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0, 0);
}

/**
 * Generates a direct Google Calendar web event URL
 */
export function generateGoogleCalendarUrl(event: CalendarEventData): string {
  const start = parseLocalDateTime(event.startDate, event.startTime);
  const duration = event.durationMinutes || 90;
  const end = new Date(start.getTime() + duration * 60 * 1000);

  const startUtc = formatUtcIso(start);
  const endUtc = formatUtcIso(end);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${startUtc}/${endUtc}`,
    details: event.description,
    location: event.location || "Calvary Fine Dining, Indiranagar, Bengaluru",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates and triggers download of an .ics iCalendar file for Apple Calendar, Outlook, etc.
 */
export function downloadIcsFile(event: CalendarEventData, filename?: string): void {
  const start = parseLocalDateTime(event.startDate, event.startTime);
  const duration = event.durationMinutes || 90;
  const end = new Date(start.getTime() + duration * 60 * 1000);

  const startUtc = formatUtcIso(start);
  const endUtc = formatUtcIso(end);
  const nowUtc = formatUtcIso(new Date());

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Calvary Restaurant//Fine Dining Reservation//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:calvary-${Date.now()}@calvarydining.com`,
    `DTSTAMP:${nowUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${event.title.replace(/\n/g, "\\n")}`,
    `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`,
    `LOCATION:${(event.location || "Calvary Fine Dining, Indiranagar, Bengaluru").replace(/\n/g, "\\n")}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename || `calvary-booking-${event.startDate}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}