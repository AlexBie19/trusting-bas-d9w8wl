import { addDays, differenceInCalendarDays } from "date-fns";
import { PlannerEntry, PlannerFilters } from "../types";
import { fromDayKey, getVisibleRange, toDayKey } from "./dates";

const typeRank: Record<string, number> = {
  Leihvertrag: 0,
  Felderprobung: 1,
  Umbau: 2,
  Reparatur: 2,
  Prüfstand: 2,
  Event: 2,
  Test: 2
};

const statusRank: Record<string, number> = {
  confirmed: 0,
  planned: 1,
  draft: 2,
  unscheduled: 3
};

export const sortEntries = (entries: PlannerEntry[]) => {
  return [...entries].sort((a, b) => {
    // First sort by tractorId to keep the same tractor's tasks together
    const tractorDiff = a.tractorId.localeCompare(b.tractorId);
    if (tractorDiff !== 0) return tractorDiff;

    const groupDiff = (typeRank[a.type] ?? 99) - (typeRank[b.type] ?? 99);
    if (groupDiff !== 0) return groupDiff;

    const aStart = a.startDate ?? "9999-12-31";
    const bStart = b.startDate ?? "9999-12-31";
    if (aStart !== bStart) return aStart.localeCompare(bStart);

    const statusDiff = (statusRank[a.status] ?? 99) - (statusRank[b.status] ?? 99);
    if (statusDiff !== 0) return statusDiff;

    return a.title.localeCompare(b.title);
  });
};

export const filterEntries = (
  entries: PlannerEntry[],
  filters: PlannerFilters,
  showHistory: boolean,
  visibleStart: Date,
  visibleEnd: Date,
  referenceDate = new Date()
) => {
  const { start: todayWindowStart } = getVisibleRange(referenceDate);
  const searchQuery = filters.search.trim().toLowerCase();

  return entries.filter((entry) => {
    if (!showHistory && entry.startDate && fromDayKey(entry.startDate) < todayWindowStart) {
      return false;
    }

    if (filters.type && entry.type !== filters.type) return false;
    if (filters.owner && entry.owner !== filters.owner) return false;
    if (filters.status && entry.status !== filters.status) return false;
    if (filters.tractorId && entry.tractorId !== filters.tractorId) return false;

    if (searchQuery) {
      const haystack = [
        entry.type,
        entry.title,
        entry.description,
        entry.owner,
        entry.status,
        entry.tractorId,
        entry.startDate ?? "",
        entry.endDate ?? ""
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(searchQuery)) return false;
    }

    if (showHistory && entry.startDate && entry.endDate) {
      const start = fromDayKey(entry.startDate);
      const end = fromDayKey(entry.endDate);
      if (end < visibleStart || start > visibleEnd) {
        return false;
      }
    }

    return true;
  });
};

export const getDurationDays = (entry: PlannerEntry): number => {
  if (!entry.startDate || !entry.endDate) return 0;
  return Math.max(0, differenceInCalendarDays(fromDayKey(entry.endDate), fromDayKey(entry.startDate)));
};

export const moveEntryByDays = (entry: PlannerEntry, dayDelta: number): PlannerEntry => {
  if (!entry.startDate || !entry.endDate) {
    return entry;
  }

  const newStart = addDays(fromDayKey(entry.startDate), dayDelta);
  const newEnd = addDays(fromDayKey(entry.endDate), dayDelta);

  return {
    ...entry,
    startDate: toDayKey(newStart),
    endDate: toDayKey(newEnd),
    status: entry.status === "unscheduled" ? "planned" : entry.status
  };
};

export const moveEntryToStartDate = (entry: PlannerEntry, newStartDay: string): PlannerEntry => {
  if (!entry.startDate || !entry.endDate) {
    return { ...entry, startDate: newStartDay, endDate: newStartDay, status: "planned" };
  }

  const duration = getDurationDays(entry);
  const start = fromDayKey(newStartDay);
  const end = addDays(start, duration);

  return {
    ...entry,
    startDate: toDayKey(start),
    endDate: toDayKey(end),
    status: entry.status === "unscheduled" ? "planned" : entry.status
  };
};

export const moveMultipleEntriesToStartDate = (
  allEntries: PlannerEntry[],
  entryIds: string[],
  newStartDay: string
): PlannerEntry[] => {
  return allEntries.map((entry) => {
    if (!entryIds.includes(entry.id)) return entry;
    return moveEntryToStartDate(entry, newStartDay);
  });
};

export const moveMultipleEntriesToUnscheduled = (
  allEntries: PlannerEntry[],
  entryIds: string[]
): PlannerEntry[] => {
  return allEntries.map((entry) => {
    if (!entryIds.includes(entry.id)) return entry;
    return {
      ...entry,
      startDate: null,
      endDate: null,
      status: "unscheduled"
    };
  });
};
