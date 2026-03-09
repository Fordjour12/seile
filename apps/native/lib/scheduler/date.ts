const LONG_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

const DAY_LABEL_FORMATTER = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
});

const DATE_LABEL_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const AGENDA_LABEL_FORMATTER = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

export const SCHEDULER_TIMELINE_HOURS = Array.from({ length: 24 }, (_, index) => index);

export function toDateKey(input: Date): string {
  const year = input.getFullYear();
  const month = String(input.getMonth() + 1).padStart(2, "0");
  const day = String(input.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function shiftDateKey(dateKey: string, amount: number): string {
  const next = parseDateKey(dateKey);
  next.setDate(next.getDate() + amount);
  return toDateKey(next);
}

export function shiftMonth(dateKey: string, amount: number): string {
  const next = parseDateKey(dateKey);
  next.setDate(1);
  next.setMonth(next.getMonth() + amount);
  return toDateKey(next);
}

export function compareDateKeys(left: string, right: string): number {
  return left.localeCompare(right);
}

export function isSameDateKey(left: string, right: string): boolean {
  return left === right;
}

export function formatCurrentDate(date: Date = new Date()): string {
  return LONG_DATE_FORMATTER.format(date);
}

export function formatMonthLabel(dateKey: string): string {
  return MONTH_LABEL_FORMATTER.format(parseDateKey(dateKey));
}

export function formatCalendarDay(dateKey: string): string {
  return String(parseDateKey(dateKey).getDate());
}

export function formatShortWeekday(dateKey: string): string {
  return DAY_LABEL_FORMATTER.format(parseDateKey(dateKey));
}

export function formatShortDate(dateKey: string): string {
  return DATE_LABEL_FORMATTER.format(parseDateKey(dateKey));
}

export function formatAgendaLabel(dateKey: string, todayDate: string): string {
  if (dateKey === todayDate) {
    return "Today";
  }

  return AGENDA_LABEL_FORMATTER.format(parseDateKey(dateKey));
}

export function getMonthGrid(dateKey: string): Array<{ dateKey: string; inMonth: boolean }> {
  const anchor = parseDateKey(dateKey);
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1, 12, 0, 0, 0);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const next = new Date(start);
    next.setDate(start.getDate() + index);
    return {
      dateKey: toDateKey(next),
      inMonth: next.getMonth() === anchor.getMonth(),
    };
  });
}

export function getWeekDateKeys(dateKey: string): string[] {
  const current = parseDateKey(dateKey);
  const start = new Date(current);
  start.setDate(current.getDate() - current.getDay());

  return Array.from({ length: 7 }, (_, index) => {
    const next = new Date(start);
    next.setDate(start.getDate() + index);
    return toDateKey(next);
  });
}

export function buildLocalDueDateTime(dateKey: string, time?: string | null): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!time) {
    return new Date(year, month - 1, day, 9, 0, 0, 0);
  }

  const [hours, minutes] = time.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

export function formatTimeLabel(time?: string | null): string | null {
  if (!time) {
    return null;
  }

  const [hours, minutes] = time.split(":").map(Number);
  const value = new Date(2000, 0, 1, hours, minutes, 0, 0);
  return value.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function getHourLabel(hour: number): string {
  const value = new Date(2000, 0, 1, hour, 0, 0, 0);
  return value.toLocaleTimeString("en-US", {
    hour: "numeric",
  }).toLowerCase();
}

export function getDateRange(startDateKey: string, days: number): string[] {
  return Array.from({ length: days }, (_, index) => shiftDateKey(startDateKey, index));
}
