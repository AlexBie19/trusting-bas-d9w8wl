import { addDays, eachDayOfInterval, format, isWithinInterval, startOfDay, startOfWeek, subWeeks } from "date-fns";

export const DAY_KEY_FORMAT = "yyyy-MM-dd";

export const toDayKey = (date: Date): string => format(startOfDay(date), DAY_KEY_FORMAT);

export const fromDayKey = (dayKey: string): Date => startOfDay(new Date(`${dayKey}T00:00:00`));

export const getVisibleRange = (baseDate = new Date()) => {
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 });
  const start = subWeeks(weekStart, 1);
  const end = addDays(start, 34);
  return { start, end };
};

export const getVisibleDays = (baseDate = new Date()): Date[] => {
  const { start, end } = getVisibleRange(baseDate);
  return eachDayOfInterval({ start, end });
};

export const inRange = (dayKey: string, start: Date, end: Date): boolean => {
  const date = fromDayKey(dayKey);
  return isWithinInterval(date, { start, end });
};
