export type ZoomLevel = "compact" | "standard" | "comfortable";

export type EntryType =
  | "Leihvertrag"
  | "Felderprobung"
  | "Umbau"
  | "Prüfstand"
  | "Reparatur"
  | "Event"
  | "Test";

export type EntryStatus = "planned" | "draft" | "confirmed" | "unscheduled";

export interface Tractor {
  id: string;
  name: string;
}

export interface PlannerEntry {
  id: string;
  tractorId: string;
  type: EntryType;
  title: string;
  description: string;
  owner: string;
  startDate: string | null;
  endDate: string | null;
  status: EntryStatus;
}

export interface PlannerFilters {
  type: string;
  owner: string;
  status: string;
  tractorId: string;
}

export interface SelectionRange {
  rowStart: number;
  rowEnd: number;
  dayStart: number;
  dayEnd: number;
}
