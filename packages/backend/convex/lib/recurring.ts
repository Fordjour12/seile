export type ScheduleType = "daily" | "weekly" | "monthly" | "yearly";

export type ScheduleConfig = {
  scheduleType: ScheduleType;
  interval: number;
  dayOfMonth?: number;
  dayOfWeek?: number;
  startAt: number;
  endAt?: number;
};

export function computeNextRun(config: ScheduleConfig, afterMs: number): number | null {
  if (config.endAt && afterMs >= config.endAt) {
    return null;
  }

  const after = Math.max(afterMs, config.startAt - 1);
  const next = new Date(after);

  switch (config.scheduleType) {
    case "daily": {
      next.setUTCDate(next.getUTCDate() + Math.max(config.interval, 1));
      next.setUTCHours(0, 0, 0, 0);
      break;
    }
    case "weekly": {
      const targetDow = config.dayOfWeek ?? new Date(config.startAt).getUTCDay();
      next.setUTCHours(0, 0, 0, 0);
      next.setUTCDate(next.getUTCDate() + Math.max(config.interval, 1) * 7);
      const currentDow = next.getUTCDay();
      const diff = (targetDow - currentDow + 7) % 7;
      next.setUTCDate(next.getUTCDate() + diff);
      break;
    }
    case "monthly": {
      const dom = Math.min(Math.max(config.dayOfMonth ?? 1, 1), 28);
      next.setUTCMonth(next.getUTCMonth() + Math.max(config.interval, 1));
      const targetMonth = next.getUTCMonth();
      next.setUTCDate(dom);
      if (next.getUTCMonth() !== targetMonth) {
        next.setUTCDate(0);
      }
      next.setUTCHours(0, 0, 0, 0);
      break;
    }
    case "yearly": {
      next.setUTCFullYear(next.getUTCFullYear() + Math.max(config.interval, 1));
      next.setUTCHours(0, 0, 0, 0);
      if (next.getUTCMonth() === 1 && next.getUTCDate() > 28) {
        next.setUTCDate(28);
      }
      break;
    }
  }

  if (config.endAt && next.getTime() >= config.endAt) {
    return null;
  }

  return next.getTime();
}

function isoWeekKey(ms: number): string {
  const d = new Date(ms);
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function buildWindowKey(scheduleType: ScheduleType, runAt: number): string {
  const d = new Date(runAt);
  switch (scheduleType) {
    case "daily":
      return d.toISOString().slice(0, 10);
    case "weekly":
      return isoWeekKey(runAt);
    case "monthly":
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    case "yearly":
      return `${d.getUTCFullYear()}`;
  }
}

export function buildIdempotencyKey(recurringId: string, scheduleType: ScheduleType, runAt: number): string {
  return `rec_${recurringId}_${buildWindowKey(scheduleType, runAt)}`;
}

export function isDue(nextRunAt: number, nowMs: number): boolean {
  return nextRunAt <= nowMs;
}
