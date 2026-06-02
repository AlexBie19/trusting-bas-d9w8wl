import { PlannerFilters, PlannerEntry, Tractor } from "../types";

interface FilterBarProps {
  filters: PlannerFilters;
  entries: PlannerEntry[];
  tractors: Tractor[];
  onChange: (next: PlannerFilters) => void;
  onReset: () => void;
}

const statuses = ["planned", "draft", "confirmed", "unscheduled"] as const;

export const FilterBar = ({ filters, entries, tractors, onChange, onReset }: FilterBarProps) => {
  const types = Array.from(new Set(entries.map((entry) => entry.type)));
  const owners = Array.from(new Set(entries.map((entry) => entry.owner)));

  return (
    <div className="filter-bar">
      <select value={filters.type} onChange={(event) => onChange({ ...filters, type: event.target.value })}>
        <option value="">Alle Typen</option>
        {types.map((type) => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>

      <select value={filters.owner} onChange={(event) => onChange({ ...filters, owner: event.target.value })}>
        <option value="">Alle Personen</option>
        {owners.map((owner) => (
          <option key={owner} value={owner}>{owner}</option>
        ))}
      </select>

      <select value={filters.status} onChange={(event) => onChange({ ...filters, status: event.target.value })}>
        <option value="">Alle Status</option>
        {statuses.map((status) => (
          <option key={status} value={status}>{status}</option>
        ))}
      </select>

      <select value={filters.tractorId} onChange={(event) => onChange({ ...filters, tractorId: event.target.value })}>
        <option value="">Alle Schlepper</option>
        {tractors.map((tractor) => (
          <option key={tractor.id} value={tractor.id}>{tractor.name}</option>
        ))}
      </select>

      <button type="button" onClick={onReset}>Reset</button>
    </div>
  );
};
